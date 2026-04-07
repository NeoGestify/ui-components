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
  ElementLibrary,
  DomainConfig,
} from './types';
import { useLibraryStorage } from './hooks/useLibraryStorage';
import { Toolbar } from './components/Toolbar';
import type { PaletteGroup } from './components/Toolbar';
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
  // Use a square hitbox of side = min(w, h) centered on the element.
  // Custom shapes (e.g. SVG paths) rarely fill their full bounding box,
  // so this avoids over-constraining them to the floor bounds.
  const s = Math.min(w, h);
  const hs = s / 2;
  const cx = x + w / 2;
  const cy = y + h / 2;

  if (area.shape === 'rect') {
    const ax = area.x ?? 0;
    const ay = area.y ?? 0;
    const aw = area.width ?? 0;
    const ah = area.height ?? 0;
    const ncx = aw >= s ? Math.max(ax + hs, Math.min(ax + aw - hs, cx)) : ax + aw / 2;
    const ncy = ah >= s ? Math.max(ay + hs, Math.min(ay + ah - hs, cy)) : ay + ah / 2;
    return { x: ncx - w / 2, y: ncy - h / 2 };
  }
  if (area.shape === 'polygon') {
    const pts = area.points ?? [];
    if (pts.length < 3) return { x, y };
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

const DEFAULT_LIBRARY_KEY = 'venueMapEditor:libraries';

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
  domainConfigs,
  domainConfig,
  libraryStorageKey = DEFAULT_LIBRARY_KEY,
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
  onElementTypeClick,
}: VenueMapEditorProps) {
  // Normalise: domainConfigs takes precedence; fall back to legacy domainConfig
  const effectiveConfigs = useMemo<DomainConfig[]>(() => {
    if (domainConfigs && domainConfigs.length > 0) return domainConfigs;
    if (domainConfig) return [domainConfig];
    return [];
  }, [domainConfigs, domainConfig]);
  const initialMapRef = useRef<VenueMap>(initialMap ?? createDefaultMap());

  // ── Persisted libraries — loaded synchronously from localStorage BEFORE the
  //    map renders so all element type definitions are available immediately.
  const [persistedLibs, setPersistedLibs] = useLibraryStorage(libraryStorageKey);

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
  const [activePlaceTypeId, setActivePlaceTypeId] = useState<string | null>(null);

  const zoomByRef = useRef<(factor: number) => void>(() => undefined);
  const resetViewRef = useRef<() => void>(() => undefined);
  const importInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  // ── Effective library: persistedLibs (localStorage) merged with map.libraries
  //    Persisted libs take priority so users can override map-embedded types.
  const effectiveLibs = useMemo<ElementLibrary>(() => ({
    ...(map.libraries ?? {}),
    ...persistedLibs,
  }), [map.libraries, persistedLibs]);

  // ── elementTypeDefs: all domain configs + all libraries ───────────────────
  //    Priority: domainConfigs first (base wins), then library types.
  const buildTypeDefs = useCallback(() => {
    const m = new Map<string, import('./types').ElementTypeDef>();
    for (const cfg of effectiveConfigs) {
      for (const t of cfg.elementTypes) {
        if (!m.has(t.id)) m.set(t.id, t);
      }
    }
    for (const group of Object.values(effectiveLibs)) {
      for (const t of group.objects) {
        if (!m.has(t.id)) m.set(t.id, t);
      }
    }
    return m;
  }, [effectiveConfigs, effectiveLibs]);

  const elementTypeDefs = useRef(buildTypeDefs());
  useEffect(() => {
    elementTypeDefs.current = buildTypeDefs();
  }, [buildTypeDefs]);

  // ── Palette groups: all domain configs + all library groups ───────────────
  const paletteGroups = useMemo<PaletteGroup[]>(() => {
    const groups: PaletteGroup[] = [];
    // One group per DomainConfig that has at least one type
    for (const cfg of effectiveConfigs) {
      if (cfg.elementTypes.length > 0) {
        groups.push({ id: cfg.id, name: cfg.name, types: cfg.elementTypes, isBase: true });
      }
    }
    // One group per library group (persistedLibs take precedence, already merged)
    for (const [gid, group] of Object.entries(effectiveLibs)) {
      groups.push({ id: gid, name: group.name, types: group.objects, isBase: false });
    }
    return groups;
  }, [effectiveConfigs, effectiveLibs]);

  // Auto-select first available element type when nothing is selected
  useEffect(() => {
    if (activePlaceTypeId) return;
    const firstType = paletteGroups[0]?.types[0];
    if (firstType) setActivePlaceTypeId(firstType.id);
  }, [paletteGroups, activePlaceTypeId]);

  // ── Controlled map sync (feedback-loop-safe) ─────────────────────────────
  // Track the last map we emitted so we can distinguish "external" prop changes
  // from echoes of our own onChange calls. Without this, storing onChange output
  // in parent state and passing it back as initialMap would cause an infinite loop.
  const lastEmittedMap = useRef<VenueMap | undefined>(undefined);
  const prevInitial = useRef(initialMap);

  useEffect(() => {
    lastEmittedMap.current = map;
    onChange?.(map);
  }, [map, onChange]);

  useEffect(() => {
    if (!initialMap) return;
    if (initialMap === prevInitial.current) return;  // same reference, nothing to do
    prevInitial.current = initialMap;
    if (initialMap === lastEmittedMap.current) return; // echo of our own onChange, skip
    push(initialMap);
    setActiveFloorId(initialMap.floors[0]?.id ?? '');
  }, [initialMap, push]);

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

  const handleLoadLibrary = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.target?.result as string) as ElementLibrary;
          // 1. Persist to localStorage (survives page reload)
          setPersistedLibs({ ...persistedLibs, ...parsed });
          // 2. Also embed in map.libraries for portability (exported map is self-contained)
          const merged: ElementLibrary = { ...(map.libraries ?? {}), ...parsed };
          push({ ...map, libraries: merged });
        } catch {
          // ignore parse errors
        }
      };
      reader.readAsText(file);
    },
    [map, push, persistedLibs, setPersistedLibs],
  );

  const handleRemoveLibraryGroup = useCallback(
    (groupId: string) => {
      // Remove from localStorage
      const newPersistedLibs = { ...persistedLibs };
      delete newPersistedLibs[groupId];
      setPersistedLibs(newPersistedLibs);
      // Remove from map.libraries too
      const libs = { ...(map.libraries ?? {}) };
      delete libs[groupId];
      push({ ...map, libraries: Object.keys(libs).length > 0 ? libs : undefined });
    },
    [map, push, persistedLibs, setPersistedLibs],
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

  // ── Viewer element click (type-specific handler → generic fallback) ─────
  const handleViewerElementClick = useCallback(
    (id: string) => {
      const el = activeFloor?.elements.find(e => e.id === id);
      if (!el) return;
      const typeHandler = onElementTypeClick?.[el.type];
      if (typeHandler) {
        typeHandler(el);
      } else {
        onElementClick?.(el);
      }
    },
    [activeFloor, onElementClick, onElementTypeClick],
  );

  const hasViewerHandlers = !!(onElementClick || onElementTypeClick);

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
      {/* Hidden file inputs */}
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
      <input
        ref={libraryInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleLoadLibrary(f);
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
          paletteGroups={paletteGroups}
          activePlaceTypeId={activePlaceTypeId}
          onActivePlaceTypeChange={setActivePlaceTypeId}
          areaShape={activeAreaShape}
          onToggleAreaShape={handleToggleAreaShape}
          onExportMap={handleExportMap}
          onImportMap={() => importInputRef.current?.click()}
          onLoadLibrary={() => libraryInputRef.current?.click()}
          onRemoveLibraryGroup={handleRemoveLibraryGroup}
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
              onViewerElementClick={hasViewerHandlers ? handleViewerElementClick : undefined}
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
