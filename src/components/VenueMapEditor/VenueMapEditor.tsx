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
import type { ElementTypeDef } from './types';
import { useLibraryStorage } from './hooks/useLibraryStorage';
import { useVenueTheme, VENUE_PALETTES } from './theme';
import { Toolbar } from './components/Toolbar';
import type { PaletteGroup } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { FloorTabs } from './components/FloorTabs';
import { useHistory } from './hooks/useHistory';
import { useSelection } from './hooks/useSelection';
import { genId } from './utils/idGen';
import { containToFloor, pointInPolygon } from './utils/collision';

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

const DEFAULT_LIBRARY_KEY = 'venueMapEditor:libraries';

/**
 * Deep-merges `incoming` into `existing`:
 * - New groups are added as-is.
 * - Existing groups get their `objects` extended with only the elements
 *   whose `id` is not already present (existing elements are never overwritten).
 */
function mergeLibraries(existing: ElementLibrary, incoming: ElementLibrary): ElementLibrary {
  const result: ElementLibrary = { ...existing };
  for (const [groupId, incomingGroup] of Object.entries(incoming)) {
    if (result[groupId]) {
      const existingIds = new Set(result[groupId].objects.map(o => o.id));
      const newObjects = incomingGroup.objects.filter(o => !existingIds.has(o.id));
      result[groupId] = {
        ...result[groupId],
        objects: [...result[groupId].objects, ...newObjects],
      };
    } else {
      result[groupId] = incomingGroup;
    }
  }
  return result;
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

const DEFAULT_WALL_THICKNESS = 8;
/** Distancia (unidades de lienzo) por debajo de la cual dos nodos son el mismo. */
const NODE_MERGE_DIST = 0.5;

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
  theme: themeSetting = 'auto',
  className,
  containment = 'full',
}: VenueMapEditorProps) {
  const theme = useVenueTheme(themeSetting);
  const palette = VENUE_PALETTES[theme];
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

  const { map, canUndo, canRedo, push, replace, commit, undo: undoHistory, redo: redoHistory } = useHistory(
    initialMapRef.current,
  );
  const { selectedIds, select, selectSet, clear: clearSelection } = useSelection();

  // Deshacer/rehacer invalidan cualquier base de arrastre pendiente.
  const liveBaseRef = useRef<VenueMap | null>(null);
  const undo = useCallback(() => { liveBaseRef.current = null; undoHistory(); }, [undoHistory]);
  const redo = useCallback(() => { liveBaseRef.current = null; redoHistory(); }, [redoHistory]);

  const [activeFloorId, setActiveFloorId] = useState<string>(
    () => initialMapRef.current.floors[0]?.id ?? '',
  );
  const [tool, setTool] = useState<ToolMode>('SELECT');
  const [showGrid, setShowGrid] = useState(showGridProp);
  const [zoom, setZoom] = useState(1);
  const [activePlaceTypeId, setActivePlaceTypeId] = useState<string | null>(null);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const zoomByRef = useRef<(factor: number) => void>(() => undefined);
  const resetViewRef = useRef<() => void>(() => undefined);
  // Registradores estables: si fuesen funciones en línea, el efecto de registro
  // del lienzo se re-ejecutaría en cada render.
  const registerZoomBy = useCallback((fn: (factor: number) => void) => { zoomByRef.current = fn; }, []);
  const registerResetView = useCallback((fn: () => void) => { resetViewRef.current = fn; }, []);
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
  //    Antes era un ref actualizado en un efecto: el lienzo se renderizaba con
  //    el mapa de tipos anterior cuando cambiaba `domainConfigs` sin que
  //    cambiase el mapa. Como valor derivado, siempre va sincronizado.
  const elementTypeDefs = useMemo(() => {
    const m = new Map<string, ElementTypeDef>();
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

  // `onChange` se guarda en un ref: si el consumidor pasa una función en línea
  // (`onChange={m => setMap(m)}`), su identidad cambia en cada render y el
  // efecto se dispararía en bucle infinito al re-renderizar el padre.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    lastEmittedMap.current = map;
    onChangeRef.current?.(map);
  }, [map]);

  useEffect(() => {
    if (!initialMap) return;
    if (initialMap === prevInitial.current) return;  // same reference, nothing to do
    prevInitial.current = initialMap;
    if (initialMap === lastEmittedMap.current) return; // echo of our own onChange, skip
    push(initialMap);
    setActiveFloorId(initialMap.floors[0]?.id ?? '');
  }, [initialMap, push]);

  const activeFloor = map.floors.find(f => f.id === activeFloorId) ?? map.floors[0];

  // Al cambiar de planta, la selección anterior apunta a elementos que ya no
  // están en pantalla: se descarta.
  useEffect(() => {
    clearSelection();
    setSelectedWallId(null);
  }, [activeFloorId, clearSelection]);

  // ── Edición en vivo (arrastres) ──────────────────────────────────────────
  // `replaceLive` guarda una única vez el mapa previo al gesto; `commitLive`
  // lo apila como punto de deshacer. Sin esta base, deshacer tras arrastrar
  // devolvía al último frame del arrastre en lugar de a la posición original.
  const replaceLive = useCallback(
    (next: VenueMap) => {
      if (!liveBaseRef.current) liveBaseRef.current = map;
      replace(next);
    },
    [map, replace],
  );

  const commitLive = useCallback(
    (next: VenueMap) => {
      const before = liveBaseRef.current ?? map;
      liveBaseRef.current = null;
      commit(before, next);
    },
    [map, commit],
  );

  const replaceFloor = useCallback(
    (floor: Floor) => replaceLive(updateFloor(map, floor)),
    [map, replaceLive],
  );

  /** Confirma un gesto en vivo sobre una planta. */
  const commitFloor = useCallback(
    (floor: Floor) => commitLive(updateFloor(map, floor)),
    [map, commitLive],
  );

  /** Cambio atómico (no proviene de un arrastre). */
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
    (updatedFloor: Floor) => commitFloor(updatedFloor),
    [commitFloor],
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

  // ── Area move commit ─────────────────────────────────────────────────────
  // El arrastre de la planta usa `replace` (sin historial) para no generar una
  // entrada por frame; al soltar se confirma el estado final con `push`, que
  // antes no ocurría: mover una planta no se podía deshacer.
  const handleAreaMoveCommit = useCallback(() => {
    commitLive(map);
  }, [map, commitLive]);

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
          // 1. Persist to localStorage — new groups added, existing groups get
          //    only the new element IDs appended (no overwrites).
          const mergedPersisted = mergeLibraries(persistedLibs, parsed);
          setPersistedLibs(mergedPersisted);
          // 2. Same deep-merge into map.libraries for portability.
          const mergedMap = mergeLibraries(map.libraries ?? {}, parsed);
          push({ ...map, libraries: mergedMap });
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


  const handleAddWall = useCallback(
    (x1: number, y1: number, x2: number, y2: number,
     snapStartId: string | null, snapEndId: string | null): string | undefined => {
      if (!activeFloor) return undefined;
      const nodes: WallNode[] = [...activeFloor.wallNodes];

      /**
       * Reutiliza un nodo existente en la misma posición (o crea uno nuevo).
       * Sin esto, encadenar paredes o volver sobre un punto ya usado generaba
       * nodos duplicados: las uniones no se ingletaban y al borrar una pared
       * quedaban nodos huérfanos.
       */
      const nodeAt = (x: number, y: number, snapId: string | null): string => {
        if (snapId) return snapId;
        const existing = nodes.find(n => Math.hypot(n.x - x, n.y - y) < NODE_MERGE_DIST);
        if (existing) return existing.id;
        const n: WallNode = { id: genId(), x, y };
        nodes.push(n);
        return n.id;
      };

      const nodeAId = nodeAt(x1, y1, snapStartId);
      const nodeBId = nodeAt(x2, y2, snapEndId);

      // Una pared que empieza y acaba en el mismo nodo no tiene geometría.
      if (nodeAId === nodeBId) return nodeBId;

      // Evita duplicar una pared ya existente entre los mismos dos nodos.
      const alreadyExists = activeFloor.walls.some(w =>
        (w.nodeAId === nodeAId && w.nodeBId === nodeBId) ||
        (w.nodeAId === nodeBId && w.nodeBId === nodeAId),
      );
      if (alreadyExists) return nodeBId;

      const newWall: Wall = {
        id: genId(),
        nodeAId,
        nodeBId,
        thickness: DEFAULT_WALL_THICKNESS,
        material: 'concrete',
      };

      pushFloor({ ...activeFloor, wallNodes: nodes, walls: [...activeFloor.walls, newWall] });
      return nodeBId;
    },
    [activeFloor, pushFloor],
  );

  const handleDeleteWall = useCallback(
    (wallId: string) => {
      if (!activeFloor) return;
      setSelectedWallId(prev => (prev === wallId ? null : prev));
      const remainingWalls = activeFloor.walls.filter(w => w.id !== wallId);
      const usedNodeIds = new Set(remainingWalls.flatMap(w => [w.nodeAId, w.nodeBId]));
      const remainingNodes = activeFloor.wallNodes.filter(n => usedNodeIds.has(n.id));
      pushFloor({ ...activeFloor, walls: remainingWalls, wallNodes: remainingNodes });
    },
    [activeFloor, pushFloor],
  );

  const handleChangeWall = useCallback(
    (wallId: string, patch: Partial<Pick<Wall, 'thickness' | 'material'>>) => {
      if (!activeFloor) return;
      pushFloor({
        ...activeFloor,
        walls: activeFloor.walls.map(w => (w.id === wallId ? { ...w, ...patch } : w)),
      });
    },
    [activeFloor, pushFloor],
  );

  // ── Element operations ───────────────────────────────────────────────────

  const handleMoveElement = useCallback(
    (id: string, x: number, y: number) => {
      if (!activeFloor) return;
      const el = activeFloor.elements.find(e => e.id === id);
      if (!el) return;
      const { x: cx, y: cy } = containToFloor(x, y, el.width, el.height, el.rotation, activeFloor.area, containment);
      replaceFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(e => e.id === id ? { ...e, x: cx, y: cy } : e),
      });
    },
    [activeFloor, replaceFloor, containment],
  );

  const handleMoveCommit = useCallback(
    (id: string, x: number, y: number) => {
      if (!activeFloor) return;
      const el = activeFloor.elements.find(e => e.id === id);
      if (!el) return;
      const { x: cx, y: cy } = containToFloor(x, y, el.width, el.height, el.rotation, activeFloor.area, containment);
      commitFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(e => e.id === id ? { ...e, x: cx, y: cy } : e),
      });
    },
    [activeFloor, commitFloor, containment],
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
      commitFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(el =>
          el.id === id ? { ...el, x, y, width: w, height: h } : el,
        ),
      });
    },
    [activeFloor, commitFloor],
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
      commitFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(el => {
          if (el.id !== id) return el;
          // Al girar, las esquinas pueden salir del suelo: se recontiene con el
          // nuevo ángulo.
          const { x, y } = containToFloor(el.x, el.y, el.width, el.height, rotation, activeFloor.area, containment);
          return { ...el, x, y, rotation };
        }),
      });
    },
    [activeFloor, commitFloor, containment],
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
        .map(el => {
          // La copia se desplaza 20 px, pero recortada al área: si no, duplicar
          // un elemento pegado al borde lo dejaba fuera de la planta.
          const { x, y } = containToFloor(el.x + 20, el.y + 20, el.width, el.height, el.rotation, activeFloor.area, containment);
          return { ...el, id: genId(), x, y };
        });
      const newFloor = { ...activeFloor, elements: [...activeFloor.elements, ...copies] };
      pushFloor(newFloor);
      selectSet(copies.map(c => c.id));
    },
    [activeFloor, pushFloor, selectSet, containment],
  );

  const handlePlaceElement = useCallback(
    (canvasX: number, canvasY: number) => {
      if (!activeFloor || !activePlaceTypeId) return;
      const typeDef = elementTypeDefs.get(activePlaceTypeId);
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

      const { x, y } = containToFloor(
        canvasX - typeDef.defaultWidth / 2,
        canvasY - typeDef.defaultHeight / 2,
        typeDef.defaultWidth,
        typeDef.defaultHeight,
        0,
        area,
        containment,
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
    [activeFloor, activePlaceTypeId, elementTypeDefs, pushFloor, select, containment],
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
      // Los valores tecleados en el panel también se contienen al suelo.
      const { x: cx, y: cy } = containToFloor(x, y, w, h, r, activeFloor.area, containment);
      pushFloor({
        ...activeFloor,
        elements: activeFloor.elements.map(el =>
          el.id === id ? { ...el, x: cx, y: cy, width: w, height: h, rotation: r } : el,
        ),
      });
    },
    [activeFloor, pushFloor, containment],
  );

  // ── Viewer element click (type-specific handler → generic fallback) ─────
  const handleSelectWall = useCallback((id: string | null) => {
    setSelectedWallId(id);
    if (id) clearSelection();
  }, [clearSelection]);

  const handleSelectElement = useCallback((id: string, multi: boolean) => {
    setSelectedWallId(null);
    select(id, multi);
  }, [select]);

  const handleSelectSet = useCallback((ids: string[], additive: boolean) => {
    setSelectedWallId(null);
    selectSet(ids, additive);
  }, [selectSet]);

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
    const fills: Record<string, string | undefined> = theme === 'dark'
      ? { occupied: '#b91c1c', reserved: '#a16207', disabled: '#475569' }
      : { occupied: '#fca5a5', reserved: '#fde68a', disabled: '#d1d5db' };
    const m = new Map<string, { fill?: string; tooltip?: string }>();
    (elementStatus ?? []).forEach(st => {
      m.set(st.elementId, { fill: fills[st.status], tooltip: st.tooltip });
    });
    return m;
  }, [elementStatus, theme]);

  // ── Selected elements ────────────────────────────────────────────────────
  const selectedElements = activeFloor
    ? activeFloor.elements.filter(el => selectedIds.has(el.id))
    : [];

  // ── Fixed / read-only derived state ─────────────────────────────────────
  const effectiveReadOnly = readOnly || fixed;
  const effectiveTool: ToolMode = fixed ? 'PAN' : tool;

  // ── Nudge con flechas ────────────────────────────────────────────────────
  const nudgeSelection = useCallback((dx: number, dy: number) => {
    if (!activeFloor || selectedIds.size === 0) return;
    pushFloor({
      ...activeFloor,
      elements: activeFloor.elements.map(el => {
        if (!selectedIds.has(el.id)) return el;
        const { x, y } = containToFloor(el.x + dx, el.y + dy, el.width, el.height, el.rotation, activeFloor.area, containment);
        return { ...el, x, y };
      }),
    });
  }, [activeFloor, selectedIds, pushFloor, containment]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  // Los atajos se escuchan en el contenedor, no en `window`: antes cualquier
  // editor montado en la página capturaba V/H/W/P/E, Supr y Ctrl+Z aunque el
  // foco estuviese en otro sitio (por ejemplo en un formulario al lado).
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Nunca interceptar mientras se escribe.
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return;
      }

      const ctrl = e.ctrlKey || e.metaKey;

      // En modo lectura/visor solo se permite navegar la vista.
      if (effectiveReadOnly) {
        if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomByRef.current(1.2); }
        else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomByRef.current(1 / 1.2); }
        else if (e.key === '0' && ctrl) { e.preventDefault(); resetViewRef.current(); }
        return;
      }

      if (ctrl && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if (ctrl && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return; }
      if (ctrl && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (selectedIds.size > 0) handleDuplicateElements([...selectedIds]);
        return;
      }
      if (ctrl && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (activeFloor) handleSelectSet(activeFloor.elements.map(el => el.id), false);
        return;
      }
      if (ctrl && e.key === '0') { e.preventDefault(); resetViewRef.current(); return; }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedIds.size > 0) handleDeleteElements([...selectedIds]);
        else if (selectedWallId) handleDeleteWall(selectedWallId);
        return;
      }

      // Flechas: desplazan la selección (Mayús = paso grande).
      if (e.key.startsWith('Arrow') && selectedIds.size > 0) {
        e.preventDefault();
        const step = e.shiftKey ? gridSize : 1;
        if (e.key === 'ArrowUp')    nudgeSelection(0, -step);
        if (e.key === 'ArrowDown')  nudgeSelection(0,  step);
        if (e.key === 'ArrowLeft')  nudgeSelection(-step, 0);
        if (e.key === 'ArrowRight') nudgeSelection( step, 0);
        return;
      }

      switch (e.key) {
        case 'v': case 'V': setTool('SELECT'); break;
        case 'h': case 'H': setTool('PAN'); break;
        case 'w': case 'W': setTool('WALL'); break;
        case 'p': case 'P': setTool('PLACE'); break;
        case 'e': case 'E': setTool('ERASE'); break;
        case 'Escape': setTool('SELECT'); clearSelection(); setSelectedWallId(null); break;
        case '+': case '=': zoomByRef.current(1.2); break;
        case '-': case '_': zoomByRef.current(1 / 1.2); break;
      }
    };

    node.addEventListener('keydown', onKey);
    return () => node.removeEventListener('keydown', onKey);
  }, [undo, redo, selectedIds, selectedWallId, activeFloor, gridSize, effectiveReadOnly,
      handleDuplicateElements, handleDeleteElements, handleDeleteWall, handleSelectSet,
      nudgeSelection, clearSelection]);

  // ── Container style ──────────────────────────────────────────────────────
  // El borde y el fondo se resuelven desde la paleta en vez de estar fijados a
  // colores claros: el editor completo (no solo el lienzo) sigue al tema.
  const containerStyle: CSSProperties = {
    width,
    height,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    borderRadius: '0.5rem',
    background: theme === 'dark' ? '#0f172a' : '#fff',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    colorScheme: theme,
    outline: 'none',
    fontFamily: 'system-ui, sans-serif',
  };

  const activeAreaShape: AreaShape | undefined = activeFloor?.area.shape;
  const selectedWall = activeFloor?.walls.find(w => w.id === selectedWallId) ?? null;

  return (
    <div
      ref={containerRef}
      // La clase `dark` se aplica al propio contenedor para que las variantes
      // `dark:` de Tailwind también funcionen cuando el tema se fuerza por
      // prop y el `<html>` de la página está en claro.
      className={[theme === 'dark' ? 'dark' : '', className ?? ''].filter(Boolean).join(' ')}
      style={containerStyle}
      // `tabIndex` permite que el contenedor reciba el foco y con él los
      // atajos de teclado, sin robárselos al resto de la página.
      tabIndex={-1}
      role="application"
      aria-label="Editor de mapa"
      // En fase de captura: los arrastres del lienzo llaman a
      // `preventDefault()`, que anula el enfoque automático del navegador y
      // dejaría los atajos de teclado sin escuchar a nadie.
      onPointerDownCapture={() => containerRef.current?.focus({ preventScroll: true })}
    >
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
              elementTypeDefs={elementTypeDefs}
              selectedIds={selectedIds}
              palette={palette}
              statusMap={statusMap}
              selectedWallId={selectedWallId}
              onSelectWall={handleSelectWall}
              onAreaResize={handleAreaResize}
              onAreaMove={handleAreaMove}
              onAreaMoveCommit={handleAreaMoveCommit}
              onAreaResizeCommit={handleAreaResizeCommit}
              onSelectElement={handleSelectElement}
              onSelectSet={handleSelectSet}
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
              onRegisterZoomBy={registerZoomBy}
              onRegisterResetView={registerResetView}
            />
          )}
        </div>

        {/* Properties panel */}
        {!effectiveReadOnly && (selectedElements.length > 0 || selectedWall) && (
          <PropertiesPanel
            elements={selectedElements}
            typeDefs={elementTypeDefs}
            wall={selectedWall}
            onChangeWall={handleChangeWall}
            onDeleteWall={handleDeleteWall}
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
