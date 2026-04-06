import { useState, useCallback, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type {
  VenueMapEditorProps,
  VenueMap,
  Floor,
  ToolMode,
} from './types';
import { Toolbar } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { genId } from './utils/idGen';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createDefaultMap(): VenueMap {
  return {
    id: genId(),
    name: 'Nuevo mapa',
    floors: [
      {
        id: genId(),
        name: 'Planta 1',
        order: 0,
        area: { shape: 'rect', x: 60, y: 60, width: 600, height: 400 },
        wallNodes: [],
        walls: [],
        elements: [],
      },
    ],
  };
}

function updateFloor(map: VenueMap, updatedFloor: Floor): VenueMap {
  return {
    ...map,
    floors: map.floors.map(f => (f.id === updatedFloor.id ? updatedFloor : f)),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * VenueMapEditor — Phase 1
 *
 * Renders an infinite SVG canvas with:
 *  - Pan via middle-click drag
 *  - Zoom via scroll wheel
 *  - A resizable artboard (FloorArea)
 *  - Toggleable grid overlay
 *  - Toolbar with SELECT / PAN tools and zoom controls
 */
export function VenueMapEditor({
  initialMap,
  onChange,
  width = '100%',
  height = '600px',
  gridSize = 20,
  showGrid: showGridProp = true,
  readOnly = false,
}: VenueMapEditorProps) {
  const [map, setMap] = useState<VenueMap>(() => initialMap ?? createDefaultMap());
  const [activeFloorId, setActiveFloorId] = useState<string>(
    () => (initialMap ?? createDefaultMap()).floors[0]?.id ?? '',
  );
  const [tool, setTool] = useState<ToolMode>('SELECT');
  const [showGrid, setShowGrid] = useState(showGridProp);

  // Re-render trigger when zoom changes (for the toolbar % label).
  const [zoom, setZoom] = useState(1);

  // A stable ref to a "zoomBy" / "resetView" callback that EditorCanvas will set.
  const zoomByRef = useRef<(factor: number) => void>(() => undefined);
  const resetViewRef = useRef<() => void>(() => undefined);

  // ── Sync initialMap changes from outside ─────────────────────────────────
  useEffect(() => {
    if (initialMap) {
      setMap(initialMap);
      setActiveFloorId(initialMap.floors[0]?.id ?? '');
    }
  }, [initialMap]);

  // ── Notify parent on every map change ────────────────────────────────────
  const updateMap = useCallback(
    (next: VenueMap) => {
      setMap(next);
      onChange?.(next);
    },
    [onChange],
  );

  // ── Active floor ─────────────────────────────────────────────────────────
  const activeFloor =
    map.floors.find(f => f.id === activeFloorId) ?? map.floors[0];

  const handleAreaResize = useCallback(
    (updatedFloor: Floor) => {
      updateMap(updateFloor(map, updatedFloor));
    },
    [map, updateMap],
  );

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.key) {
        case 'v':
        case 'V':
          setTool('SELECT');
          break;
        case 'h':
        case 'H':
          setTool('PAN');
          break;
        case 'Escape':
          setTool('SELECT');
          break;
        case '+':
        case '=':
          zoomByRef.current(1.2);
          break;
        case '-':
        case '_':
          zoomByRef.current(1 / 1.2);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Container styles ─────────────────────────────────────────────────────
  const containerStyle: CSSProperties = {
    width,
    height,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    background: '#fff',
    fontFamily: 'system-ui, sans-serif',
  };

  // ── Pan/zoom bridge ──────────────────────────────────────────────────────
  // EditorCanvas owns the pan/zoom state internally. We give it callbacks so
  // the toolbar zoom buttons (and keyboard shortcuts) can trigger changes.
  // The ref approach avoids circular state — EditorCanvas keeps its own state
  // but tells us the current zoom for the toolbar label.
  const handleZoomChange = useCallback((z: number) => setZoom(z), []);

  return (
    <div style={containerStyle}>
      {/* Toolbar */}
      {!readOnly && (
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(g => !g)}
          zoom={zoom}
          onZoomIn={() => zoomByRef.current(1.2)}
          onZoomOut={() => zoomByRef.current(1 / 1.2)}
          onResetView={() => resetViewRef.current()}
        />
      )}

      {/* Floor tabs (Phase 4 — placeholder row for single floor) */}
      {map.floors.length > 1 && (
        <div className="flex gap-1 px-2 py-1 border-b border-slate-200 bg-slate-50 text-xs">
          {map.floors
            .slice()
            .sort((a, b) => a.order - b.order)
            .map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFloorId(f.id)}
                className={[
                  'px-3 py-1 rounded-t border transition-colors',
                  f.id === activeFloorId
                    ? 'bg-white border-slate-300 text-slate-800 font-medium'
                    : 'border-transparent text-slate-500 hover:text-slate-700',
                ].join(' ')}
              >
                {f.name}
              </button>
            ))}
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 min-h-0 relative">
        {activeFloor && (
          <EditorCanvas
            key={activeFloor.id}
            floor={activeFloor}
            tool={tool}
            gridSize={gridSize}
            showGrid={showGrid}
            readOnly={readOnly}
            onAreaResize={handleAreaResize}
            onZoomChange={handleZoomChange}
            onRegisterZoomBy={fn => { zoomByRef.current = fn; }}
            onRegisterResetView={fn => { resetViewRef.current = fn; }}
          />
        )}
      </div>
    </div>
  );
}
