import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { CSSProperties } from 'react';
import type {
  VenueMapEditorProps,
  VenueMap,
  Floor,
  MapElement,
  WallNode,
  Wall,
  ToolMode,
  FloorArea,
  AreaShape,
} from './types';
import { Toolbar } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { FloorTabs } from './components/FloorTabs';
import { useHistory } from './hooks/useHistory';
import { useSelection } from './hooks/useSelection';
import { genId } from './utils/idGen';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pointInPolygon(px: number, py: number, pts: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Returns the nearest point on the polygon perimeter to (px, py). */
function clampPointToPolygon(px: number, py: number, pts: [number, number][]): { x: number; y: number } {
  let bestDist = Infinity, bx = pts[0][0], by = pts[0][1];
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[j], [bex, bey] = pts[i];
    const dx = bex - ax, dy = bey - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
    const nx = ax + t * dx, ny = ay + t * dy;
    const dist = (px - nx) ** 2 + (py - ny) ** 2;
    if (dist < bestDist) { bestDist = dist; bx = nx; by = ny; }
  }
  return { x: bx, y: by };
}

function clampToFloor(
  x: number, y: number,
  w: number, h: number,
  area: FloorArea,
): { x: number; y: number } {
  if (area.shape === 'rect') {
    const ax = area.x ?? 0;
    const ay = area.y ?? 0;
    const aw = area.width ?? 0;
    const ah = area.height ?? 0;
    return {
      x: aw >= w ? Math.max(ax, Math.min(ax + aw - w, x)) : ax + (aw - w) / 2,
      y: ah >= h ? Math.max(ay, Math.min(ay + ah - h, y)) : ay + (ah - h) / 2,
    };
  }
  if (area.shape === 'polygon') {
    const pts = area.points ?? [];
    if (pts.length < 3) return { x, y };
    // Clamp the element center to inside (or onto the boundary of) the polygon.
    const cx = x + w / 2, cy = y + h / 2;
    if (pointInPolygon(cx, cy, pts)) return { x, y };
    const clamped = clampPointToPolygon(cx, cy, pts);
    return { x: clamped.x - w / 2, y: clamped.y - h / 2 };
  }
  return { x, y };
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

function rectToPolygon(area: FloorArea): FloorArea {
  const ax = area.x ?? 0;
  const ay = area.y ?? 0;
  const aw = area.width ?? 400;
  const ah = area.height ?? 300;
  return {
    shape: 'polygon',
    points: [
      [ax, ay],
      [ax + aw, ay],
      [ax + aw, ay + ah],
      [ax, ay + ah],
    ],
  };
}

function polygonToRect(area: FloorArea): FloorArea {
  const pts = area.points ?? [];
  if (pts.length === 0) return { shape: 'rect', x: 60, y: 60, width: 400, height: 300 };
  const xs = pts.map(p => p[0]);
  const ys = pts.map(p => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return {
    shape: 'rect',
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
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
  elementStatus,
  onElementClick,
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
  const importInputRef = useRef<HTMLInputElement>(null);

  const elementTypeDefs = useRef(new Map(domainConfig.elementTypes.map(t => [t.id, t])));
  useEffect(() => {
    elementTypeDefs.current = new Map(domainConfig.elementTypes.map(t => [t.id, t]));
  }, [domainConfig]);

  const prevInitial = useRef(initialMap);
  useEffect(() => {
    if (initialMap && initialMap !== prevInitial.current) {
      prevInitial.current = initialMap;
      push(initialMap);
      setActiveFloorId(initialMap.floors[0]?.id ?? '');
    }
  }, [initialMap, push]);

  useEffect(() => {
    onChange?.(map);
  }, [map, onChange]);

  const activeFloor = map.floors.find(f => f.id === activeFloorId) ?? map.floors[0];

  const replaceFloor = useCallback(
    (floor: Floor) => replace(updateFloor(map, floor)),
    [map, replace],
  );

  const pushFloor = useCallback(
    (floor: Floor) => push(updateFloor(map, floor)),
    [map, push],
  );

  // ── Area resize (handle drag) ────────────────────────────────────────────
  const handleAreaResize = useCallback(
    (updatedFloor: Floor) => replaceFloor(updatedFloor),
    [replaceFloor],
  );

  // ── Area resize commit (push to history) ─────────────────────────────────
  const handleAreaResizeCommit = useCallback(
    (updatedFloor: Floor) => pushFloor(updatedFloor),
    [pushFloor],
  );

  // ── Area move (body drag) ────────────────────────────────────────────────
  const handleAreaMove = useCallback(
    (dx: number, dy: number) => {
      if (!activeFloor) return;
      const area = activeFloor.area;
      const newArea: FloorArea = area.shape === 'polygon'
        ? { ...area, points: (area.points ?? []).map(([x, y]) => [x + dx, y + dy] as [number, number]) }
        : { ...area, x: (area.x ?? 0) + dx, y: (area.y ?? 0) + dy };
      replaceFloor({
        ...activeFloor,
        area: newArea,
        wallNodes: activeFloor.wallNodes.map(n => ({ ...n, x: n.x + dx, y: n.y + dy })),
        elements: activeFloor.elements.map(el => ({ ...el, x: el.x + dx, y: el.y + dy })),
      });
    },
    [activeFloor, replaceFloor],
  );

  // ── Area shape toggle ────────────────────────────────────────────────────
  const handleToggleAreaShape = useCallback(() => {
    if (!activeFloor) return;
    const { area } = activeFloor;
    const newArea: FloorArea = area.shape === 'polygon'
      ? polygonToRect(area)
      : rectToPolygon(area);
    pushFloor({ ...activeFloor, area: newArea });
  }, [activeFloor, pushFloor]);

  // ── Floor operations ─────────────────────────────────────────────────────

  const handleAddFloor = useCallback(() => {
    const maxOrder = map.floors.reduce((m, f) => Math.max(m, f.order), -1);
    const newFloor: Floor = {
      id: genId(),
      name: `Planta ${map.floors.length + 1}`,
      order: maxOrder + 1,
      area: { shape: 'rect', x: 60, y: 60, width: 600, height: 400 },
      wallNodes: [],
      walls: [],
      elements: [],
    };
    const newMap: VenueMap = { ...map, floors: [...map.floors, newFloor] };
    push(newMap);
    setActiveFloorId(newFloor.id);
  }, [map, push]);

  const handleRenameFloor = useCallback(
    (id: string, name: string) => {
      const floor = map.floors.find(f => f.id === id);
      if (!floor) return;
      push(updateFloor(map, { ...floor, name }));
    },
    [map, push],
  );

  const handleDeleteFloor = useCallback(
    (id: string) => {
      if (map.floors.length <= 1) return;
      const remaining = map.floors.filter(f => f.id !== id);
      const newMap: VenueMap = { ...map, floors: remaining };
      push(newMap);
      if (activeFloorId === id) {
        setActiveFloorId(remaining[0]?.id ?? '');
      }
    },
    [map, push, activeFloorId],
  );

  const handleReorderFloor = useCallback(
    (id: string, direction: 'left' | 'right') => {
      const sorted = map.floors.slice().sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(f => f.id === id);
      if (idx < 0) return;
      const swapIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return;
      const a = sorted[idx];
      const b = sorted[swapIdx];
      const updatedFloors = map.floors.map(f => {
        if (f.id === a.id) return { ...f, order: b.order };
        if (f.id === b.id) return { ...f, order: a.order };
        return f;
      });
      push({ ...map, floors: updatedFloors });
    },
    [map, push],
  );

  // ── Export / Import ──────────────────────────────────────────────────────

  const handleExportMap = useCallback(() => {
    const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${map.name || 'mapa'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [map]);

  const handleImportMap = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.target?.result as string) as VenueMap;
          push(parsed);
          setActiveFloorId(parsed.floors[0]?.id ?? '');
        } catch {
          // ignore parse errors
        }
      };
      reader.readAsText(file);
    },
    [push],
  );

  // ── Wall operations ──────────────────────────────────────────────────────

  const DEFAULT_WALL_THICKNESS = 8;

  const handleAddWall = useCallback(
    (x1: number, y1: number, x2: number, y2: number,
     snapStartId: string | null, snapEndId: string | null) => {
      if (!activeFloor) return;
      const nodes: WallNode[] = [...activeFloor.wallNodes];

      let nodeAId: string;
      if (snapStartId) {
        nodeAId = snapStartId;
      } else {
        const n: WallNode = { id: genId(), x: x1, y: y1 };
        nodes.push(n);
        nodeAId = n.id;
      }

      let nodeBId: string;
      if (snapEndId) {
        nodeBId = snapEndId;
      } else {
        const n: WallNode = { id: genId(), x: x2, y: y2 };
        nodes.push(n);
        nodeBId = n.id;
      }

      const newWall: Wall = {
        id: genId(),
        nodeAId,
        nodeBId,
        thickness: DEFAULT_WALL_THICKNESS,
        material: 'concrete',
      };

      pushFloor({ ...activeFloor, wallNodes: nodes, walls: [...activeFloor.walls, newWall] });
    },
    [activeFloor, pushFloor, DEFAULT_WALL_THICKNESS],
  );

  const handleDeleteWall = useCallback(
    (wallId: string) => {
      if (!activeFloor) return;
      const remainingWalls = activeFloor.walls.filter(w => w.id !== wallId);
      const usedNodeIds = new Set(remainingWalls.flatMap(w => [w.nodeAId, w.nodeBId]));
      const remainingNodes = activeFloor.wallNodes.filter(n => usedNodeIds.has(n.id));
      pushFloor({ ...activeFloor, walls: remainingWalls, wallNodes: remainingNodes });
    },
    [activeFloor, pushFloor],
  );

  // ── Element operations ───────────────────────────────────────────────────

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

  const handlePlaceElement = useCallback(
    (canvasX: number, canvasY: number) => {
      if (!activeFloor || !activePlaceTypeId) return;
      const typeDef = elementTypeDefs.current.get(activePlaceTypeId);
      if (!typeDef) return;

      const { area } = activeFloor;
      if (area.shape === 'rect') {
        const ax = area.x ?? 0, ay = area.y ?? 0;
        const aw = area.width ?? 0, ah = area.height ?? 0;
        if (canvasX < ax || canvasX > ax + aw || canvasY < ay || canvasY > ay + ah) return;
      } else if (area.shape === 'polygon') {
        const pts = area.points ?? [];
        if (pts.length >= 3 && !pointInPolygon(canvasX, canvasY, pts)) return;
      }

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

  // ── Status map ───────────────────────────────────────────────────────────
  const statusMap = useMemo(() => {
    const m = new Map<string, string>();
    (elementStatus ?? []).forEach(s => {
      if (s.status === 'occupied') m.set(s.elementId, '#fca5a5');
      else if (s.status === 'reserved') m.set(s.elementId, '#fde68a');
      else if (s.status === 'disabled') m.set(s.elementId, '#d1d5db');
    });
    return m;
  }, [elementStatus]);

  // ── Selected elements ────────────────────────────────────────────────────
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
        case 'w': case 'W': setTool('WALL'); break;
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

  const activeAreaShape: AreaShape | undefined = activeFloor?.area.shape;

  return (
    <div style={containerStyle}>
      {/* Hidden file input for import */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleImportMap(f);
          e.target.value = '';
        }}
      />

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
          areaShape={activeAreaShape}
          onToggleAreaShape={handleToggleAreaShape}
          onExportMap={handleExportMap}
          onImportMap={() => importInputRef.current?.click()}
        />
      )}

      {/* Floor tabs */}
      <FloorTabs
        floors={map.floors}
        activeFloorId={activeFloorId}
        readOnly={effectiveReadOnly}
        onSelect={setActiveFloorId}
        onAdd={handleAddFloor}
        onRename={handleRenameFloor}
        onDelete={handleDeleteFloor}
        onReorder={handleReorderFloor}
      />

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
              statusMap={statusMap}
              onAreaResize={handleAreaResize}
              onAreaMove={handleAreaMove}
              onAreaResizeCommit={handleAreaResizeCommit}
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
              onAddWall={handleAddWall}
              onDeleteWall={handleDeleteWall}
              onViewerElementClick={onElementClick ? (id) => {
                const el = activeFloor.elements.find(e => e.id === id);
                if (el) onElementClick(el);
              } : undefined}
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
