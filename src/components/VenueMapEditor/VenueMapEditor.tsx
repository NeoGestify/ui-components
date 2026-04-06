import { useState, useCallback, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type {
  VenueMapEditorProps,
  VenueMap,
  Floor,
  MapElement,
  ToolMode,
} from './types';
import { Toolbar } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { useHistory } from './hooks/useHistory';
import { useSelection } from './hooks/useSelection';
import { genId } from './utils/idGen';
import type { FloorArea } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Clamp an element's top-left corner so it stays fully inside the floor area.
 * If the element is wider/taller than the floor, center it on that axis instead.
 */
function clampToFloor(
  x: number, y: number,
  w: number, h: number,
  area: FloorArea,
): { x: number; y: number } {
  if (area.shape !== 'rect') return { x, y };
  const ax = area.x ?? 0;
  const ay = area.y ?? 0;
  const aw = area.width ?? 0;
  const ah = area.height ?? 0;
  return {
    x: aw >= w ? Math.max(ax, Math.min(ax + aw - w, x)) : ax + (aw - w) / 2,
    y: ah >= h ? Math.max(ay, Math.min(ay + ah - h, y)) : ay + (ah - h) / 2,
  };
}

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

export function VenueMapEditor({
  domainConfig,
  initialMap,
  onChange,
  width = '100%',
  height = '600px',
  gridSize = 20,
  showGrid: showGridProp = true,
  snapToGrid: snapEnabled = false,
  readOnly = false,
  fixed = false,
}: VenueMapEditorProps) {
  const initialMapRef = useRef<VenueMap>(initialMap ?? createDefaultMap());

  const { map, canUndo, canRedo, push, replace, undo, redo } = useHistory(
    initialMapRef.current,
  );
  const { selectedIds, select, selectSet, clear: clearSelection } = useSelection();

  const [activeFloorId, setActiveFloorId] = useState<string>(
    () => initialMapRef.current.floors[0]?.id ?? '',
  );
  const [tool, setTool] = useState<ToolMode>('SELECT');
  const [showGrid, setShowGrid] = useState(showGridProp);
  const [zoom, setZoom] = useState(1);
  const [activePlaceTypeId, setActivePlaceTypeId] = useState<string | null>(
    () => domainConfig.elementTypes[0]?.id ?? null,
  );

  const zoomByRef = useRef<(factor: number) => void>(() => undefined);
  const resetViewRef = useRef<() => void>(() => undefined);

  // ── Build elementTypeDefs map ────────────────────────────────────────────
  const elementTypeDefs = useRef(new Map(domainConfig.elementTypes.map(t => [t.id, t])));
  useEffect(() => {
    elementTypeDefs.current = new Map(domainConfig.elementTypes.map(t => [t.id, t]));
  }, [domainConfig]);

  // ── Sync initialMap prop changes ─────────────────────────────────────────
  // (rare — only when parent completely replaces the map)
  const prevInitial = useRef(initialMap);
  useEffect(() => {
    if (initialMap && initialMap !== prevInitial.current) {
      prevInitial.current = initialMap;
      push(initialMap);
      setActiveFloorId(initialMap.floors[0]?.id ?? '');
    }
  }, [initialMap, push]);

  // ── Notify parent ────────────────────────────────────────────────────────
  useEffect(() => {
    onChange?.(map);
  }, [map, onChange]);

  // ── Active floor ─────────────────────────────────────────────────────────
  const activeFloor = map.floors.find(f => f.id === activeFloorId) ?? map.floors[0];

  // ── Floor updaters ───────────────────────────────────────────────────────
  const replaceFloor = useCallback(
    (floor: Floor) => replace(updateFloor(map, floor)),
    [map, replace],
  );

  const pushFloor = useCallback(
    (floor: Floor) => push(updateFloor(map, floor)),
    [map, push],
  );

  // ── Area resize (handle drag — only shape changes, elements stay put) ───
  const handleAreaResize = useCallback(
    (updatedFloor: Floor) => replaceFloor(updatedFloor),
    [replaceFloor],
  );

  // ── Area move (body drag — area + all elements shift by the same delta) ─
  const handleAreaMove = useCallback(
    (dx: number, dy: number) => {
      if (!activeFloor) return;
      replaceFloor({
        ...activeFloor,
        area: {
          ...activeFloor.area,
          x: (activeFloor.area.x ?? 0) + dx,
          y: (activeFloor.area.y ?? 0) + dy,
        },
        elements: activeFloor.elements.map(el => ({
          ...el,
          x: el.x + dx,
          y: el.y + dy,
        })),
      });
    },
    [activeFloor, replaceFloor],
  );

  // ── Element operations ───────────────────────────────────────────────────

  /** Live move (no history entry) — clamped to floor bounds. */
  const handleMoveElement = useCallback(
    (id: string, x: number, y: number) => {
      if (!activeFloor) return;
      const el = activeFloor.elements.find(e => e.id === id);
      if (!el) return;
      const { x: cx, y: cy } = clampToFloor(x, y, el.width, el.height, activeFloor.area);
      replaceFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(e => e.id === id ? { ...e, x: cx, y: cy } : e),
      });
    },
    [activeFloor, replaceFloor],
  );

  /** Commit move to history — clamped to floor bounds. */
  const handleMoveCommit = useCallback(
    (id: string, x: number, y: number) => {
      if (!activeFloor) return;
      const el = activeFloor.elements.find(e => e.id === id);
      if (!el) return;
      const { x: cx, y: cy } = clampToFloor(x, y, el.width, el.height, activeFloor.area);
      pushFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(e => e.id === id ? { ...e, x: cx, y: cy } : e),
      });
    },
    [activeFloor, pushFloor],
  );

  /** Live resize. */
  const handleResizeElement = useCallback(
    (id: string, x: number, y: number, w: number, h: number) => {
      if (!activeFloor) return;
      replaceFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(el =>
          el.id === id ? { ...el, x, y, width: w, height: h } : el,
        ),
      });
    },
    [activeFloor, replaceFloor],
  );

  /** Commit resize. */
  const handleResizeCommit = useCallback(
    (id: string, x: number, y: number, w: number, h: number) => {
      if (!activeFloor) return;
      pushFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(el =>
          el.id === id ? { ...el, x, y, width: w, height: h } : el,
        ),
      });
    },
    [activeFloor, pushFloor],
  );

  /** Live rotate. */
  const handleRotateElement = useCallback(
    (id: string, rotation: number) => {
      if (!activeFloor) return;
      replaceFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(el =>
          el.id === id ? { ...el, rotation } : el,
        ),
      });
    },
    [activeFloor, replaceFloor],
  );

  /** Commit rotate. */
  const handleRotateCommit = useCallback(
    (id: string, rotation: number) => {
      if (!activeFloor) return;
      pushFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(el =>
          el.id === id ? { ...el, rotation } : el,
        ),
      });
    },
    [activeFloor, pushFloor],
  );

  /** Delete one element (from ElementNode erase/delete). */
  const handleDeleteElement = useCallback(
    (id: string) => {
      if (!activeFloor) return;
      clearSelection();
      pushFloor({
        ...activeFloor,
        elements: activeFloor.elements.filter(el => el.id !== id),
      });
    },
    [activeFloor, pushFloor, clearSelection],
  );

  /** Delete multiple elements (from PropertiesPanel). */
  const handleDeleteElements = useCallback(
    (ids: string[]) => {
      if (!activeFloor) return;
      const idSet = new Set(ids);
      clearSelection();
      pushFloor({
        ...activeFloor,
        elements: activeFloor.elements.filter(el => !idSet.has(el.id)),
      });
    },
    [activeFloor, pushFloor, clearSelection],
  );

  /** Duplicate elements. */
  const handleDuplicateElements = useCallback(
    (ids: string[]) => {
      if (!activeFloor) return;
      const idSet = new Set(ids);
      const copies: MapElement[] = activeFloor.elements
        .filter(el => idSet.has(el.id))
        .map(el => ({ ...el, id: genId(), x: el.x + 20, y: el.y + 20 }));
      const newFloor = { ...activeFloor, elements: [...activeFloor.elements, ...copies] };
      pushFloor(newFloor);
      selectSet(copies.map(c => c.id));
    },
    [activeFloor, pushFloor, selectSet],
  );

  /** Place a new element at canvas coordinates. */
  const handlePlaceElement = useCallback(
    (canvasX: number, canvasY: number) => {
      if (!activeFloor || !activePlaceTypeId) return;
      const typeDef = elementTypeDefs.current.get(activePlaceTypeId);
      if (!typeDef) return;

      // Reject clicks that land outside the floor area entirely
      const { area } = activeFloor;
      if (area.shape === 'rect') {
        const ax = area.x ?? 0, ay = area.y ?? 0;
        const aw = area.width ?? 0, ah = area.height ?? 0;
        if (canvasX < ax || canvasX > ax + aw || canvasY < ay || canvasY > ay + ah) return;
      }

      // Center on click, then clamp so the element stays fully inside the floor
      const { x, y } = clampToFloor(
        canvasX - typeDef.defaultWidth / 2,
        canvasY - typeDef.defaultHeight / 2,
        typeDef.defaultWidth,
        typeDef.defaultHeight,
        area,
      );

      const newEl: MapElement = {
        id: genId(),
        type: activePlaceTypeId,
        x,
        y,
        width: typeDef.defaultWidth,
        height: typeDef.defaultHeight,
        rotation: 0,
      };
      pushFloor({ ...activeFloor, elements: [...activeFloor.elements, newEl] });
      select(newEl.id, false);
    },
    [activeFloor, activePlaceTypeId, pushFloor, select],
  );

  /** Update element label from PropertiesPanel. */
  const handleChangeLabel = useCallback(
    (id: string, label: string) => {
      if (!activeFloor) return;
      pushFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(el =>
          el.id === id ? { ...el, label } : el,
        ),
      });
    },
    [activeFloor, pushFloor],
  );

  /** Update element geometry from PropertiesPanel numeric fields. */
  const handleChangeGeometry = useCallback(
    (id: string, x: number, y: number, w: number, h: number, r: number) => {
      if (!activeFloor) return;
      pushFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(el =>
          el.id === id ? { ...el, x, y, width: w, height: h, rotation: r } : el,
        ),
      });
    },
    [activeFloor, pushFloor],
  );

  // ── Selected elements (for PropertiesPanel) ──────────────────────────────
  const selectedElements = activeFloor
    ? activeFloor.elements.filter(el => selectedIds.has(el.id))
    : [];

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z') { e.preventDefault(); undo(); return; }
      if (ctrl && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return; }
      if (ctrl && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (selectedIds.size > 0) handleDuplicateElements([...selectedIds]);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.size > 0) handleDeleteElements([...selectedIds]);
        return;
      }

      switch (e.key) {
        case 'v': case 'V': setTool('SELECT'); break;
        case 'h': case 'H': setTool('PAN'); break;
        case 'p': case 'P': setTool('PLACE'); break;
        case 'e': case 'E': setTool('ERASE'); break;
        case 'Escape': setTool('SELECT'); break;
        case '+': case '=': zoomByRef.current(1.2); break;
        case '-': case '_': zoomByRef.current(1 / 1.2); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, selectedIds, handleDuplicateElements, handleDeleteElements]);

  // ── Fixed / read-only derived state ─────────────────────────────────────
  // fixed=true: viewer-only — no editing, left-click drags the canvas
  const effectiveReadOnly = readOnly || fixed;
  const effectiveTool: ToolMode = fixed ? 'PAN' : tool;

  // ── Container style ──────────────────────────────────────────────────────
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

  return (
    <div style={containerStyle}>
      {/* Toolbar */}
      {!effectiveReadOnly && (
        <Toolbar
          tool={tool}
          onToolChange={t => { setTool(t); if (t !== 'PLACE') clearSelection(); }}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(g => !g)}
          zoom={zoom}
          onZoomIn={() => zoomByRef.current(1.2)}
          onZoomOut={() => zoomByRef.current(1 / 1.2)}
          onResetView={() => resetViewRef.current()}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          domainConfig={domainConfig}
          activePlaceTypeId={activePlaceTypeId}
          onActivePlaceTypeChange={setActivePlaceTypeId}
        />
      )}

      {/* Floor tabs */}
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

      {/* Canvas + Properties panel */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 relative">
          {activeFloor && (
            <EditorCanvas
              key={activeFloor.id}
              floor={activeFloor}
              tool={effectiveTool}
              gridSize={gridSize}
              showGrid={showGrid}
              readOnly={effectiveReadOnly}
              snapEnabled={snapEnabled}
              elementTypeDefs={elementTypeDefs.current}
              selectedIds={selectedIds}
              onAreaResize={handleAreaResize}
              onAreaMove={handleAreaMove}
              onSelectElement={select}
              onSelectSet={selectSet}
              onClearSelection={clearSelection}
              onMoveElement={handleMoveElement}
              onMoveCommit={handleMoveCommit}
              onResizeElement={handleResizeElement}
              onResizeCommit={handleResizeCommit}
              onRotateElement={handleRotateElement}
              onRotateCommit={handleRotateCommit}
              onDeleteElement={handleDeleteElement}
              onPlaceElement={handlePlaceElement}
              onZoomChange={setZoom}
              onRegisterZoomBy={fn => { zoomByRef.current = fn; }}
              onRegisterResetView={fn => { resetViewRef.current = fn; }}
            />
          )}
        </div>

        {/* Properties panel */}
        {!effectiveReadOnly && selectedElements.length > 0 && (
          <PropertiesPanel
            elements={selectedElements}
            typeDefs={elementTypeDefs.current}
            onChangeLabel={handleChangeLabel}
            onChangeGeometry={handleChangeGeometry}
            onDelete={handleDeleteElements}
            onDuplicate={handleDuplicateElements}
          />
        )}
      </div>
    </div>
  );
}
