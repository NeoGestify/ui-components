import { useRef, useEffect, useState, useCallback, useMemo, useId } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react';
import type { Floor, WallNode, ElementTypeDef, ToolMode } from '../types';
import type { PanZoomState, Bounds } from '../hooks/usePanZoom';
import type { VenuePalette } from '../theme';
import { usePanZoom } from '../hooks/usePanZoom';
import { useCoarsePointer } from '../hooks/usePointerCapabilities';
import { findNearestNode, snapPoint } from '../utils/snapUtils';
import { wallSegmentPath } from '../utils/wallGeometry';
import { elementFootprint } from '../utils/collision';
import { GridOverlay } from './GridOverlay';
import { Artboard } from './Artboard';
import { WallLayer } from './WallLayer';
import { ElementNode } from './ElementNode';

// ─── Constants ────────────────────────────────────────────────────────────────

const SNAP_PX           = 10;   // screen pixels for wall-node snap
const DEFAULT_THICKNESS = 8;    // canvas units
const PLANE             = 50000;

// ─── Floor bounds ─────────────────────────────────────────────────────────────

function insideFloor(x: number, y: number, floor: Floor): boolean {
  const { area } = floor;
  if (area.shape === 'rect') {
    const ax = area.x ?? 0, ay = area.y ?? 0, aw = area.width ?? 0, ah = area.height ?? 0;
    return x >= ax && x <= ax + aw && y >= ay && y <= ay + ah;
  }
  if (area.shape === 'polygon') {
    const pts = area.points ?? [];
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  return true;
}

/** Caja englobante del área de la planta, para encuadrar la vista. */
function floorBounds(floor: Floor): Bounds {
  const { area } = floor;
  if (area.shape === 'polygon') {
    const pts = area.points ?? [];
    if (pts.length === 0) return { x: 0, y: 0, width: 400, height: 300 };
    const xs = pts.map(p => p[0]);
    const ys = pts.map(p => p[1]);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
  }
  return {
    x: area.x ?? 0,
    y: area.y ?? 0,
    width: area.width ?? 400,
    height: area.height ?? 300,
  };
}

// ─── Lasso ────────────────────────────────────────────────────────────────────

interface LassoRect { x: number; y: number; w: number; h: number }

function rectsIntersect(a: LassoRect, b: LassoRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ─── Wall-draw state ──────────────────────────────────────────────────────────

interface WallDraw {
  /** Fixed start point (snapped or free). */
  startX: number;
  startY: number;
  /** Non-null when startX/Y snapped to an existing node. */
  snapStartNode: WallNode | null;
  /** Current cursor position in canvas coords. */
  previewX: number;
  previewY: number;
  /** Non-null when cursor is snapping to an existing end node. */
  snapEndNode: WallNode | null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorCanvasProps {
  floor: Floor;
  tool: ToolMode;
  gridSize: number;
  showGrid: boolean;
  readOnly: boolean;
  snapEnabled: boolean;
  elementTypeDefs: Map<string, ElementTypeDef>;
  selectedIds: ReadonlySet<string>;
  palette: VenuePalette;
  statusMap?: Map<string, { fill?: string; tooltip?: string }>;
  selectedWallId?: string | null;
  onSelectWall?: (id: string | null) => void;
  onAreaResize: (floor: Floor) => void;
  onAreaMove: (dx: number, dy: number) => void;
  onAreaMoveCommit?: () => void;
  onAreaResizeCommit?: (floor: Floor) => void;
  onSelectElement: (id: string, multi: boolean) => void;
  onSelectSet: (ids: string[], additive: boolean) => void;
  onClearSelection: () => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onMoveCommit: (id: string, x: number, y: number) => void;
  onResizeElement: (id: string, x: number, y: number, w: number, h: number) => void;
  onResizeCommit: (id: string, x: number, y: number, w: number, h: number) => void;
  onRotateElement: (id: string, rotation: number) => void;
  onRotateCommit: (id: string, rotation: number) => void;
  onDeleteElement: (id: string) => void;
  onPlaceElement: (canvasX: number, canvasY: number) => void;
  /** Devuelve el id del nodo final, para poder encadenar la siguiente pared. */
  onAddWall?: (x1: number, y1: number, x2: number, y2: number,
               snapStartId: string | null, snapEndId: string | null) => string | undefined;
  onDeleteWall?: (wallId: string) => void;
  onViewerElementClick?: (id: string) => void;
  onZoomChange?: (zoom: number) => void;
  onRegisterZoomBy?: (fn: (factor: number) => void) => void;
  onRegisterResetView?: (fn: () => void) => void;
  onRegisterFitView?: (fn: () => void) => void;
  /**
   * Cambia cuando cambia la disposición del editor (tamaño del contenedor,
   * modo compacto, panel abierto). Dispara el re-encuadre automático.
   */
  layoutSignal?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorCanvas({
  floor,
  tool,
  gridSize,
  showGrid,
  readOnly,
  snapEnabled,
  elementTypeDefs,
  selectedIds,
  palette,
  statusMap,
  selectedWallId,
  onSelectWall,
  onAreaResize,
  onAreaMove,
  onAreaMoveCommit,
  onAreaResizeCommit,
  onSelectElement,
  onSelectSet,
  onClearSelection,
  onMoveElement,
  onMoveCommit,
  onResizeElement,
  onResizeCommit,
  onRotateElement,
  onRotateCommit,
  onDeleteElement,
  onPlaceElement,
  onAddWall,
  onDeleteWall,
  onViewerElementClick,
  onZoomChange,
  onRegisterZoomBy,
  onRegisterResetView,
  onRegisterFitView,
  layoutSignal,
}: EditorCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // `useId` genera un prefijo único por instancia: sin él, dos editores en la
  // misma página comparten los ids de <pattern>/<filter> y el segundo pisa al
  // primero (rejilla y sombras del tema equivocado).
  const rawId = useId();
  const domUid = useMemo(() => `vme${rawId.replace(/[^a-zA-Z0-9]/g, '')}`, [rawId]);

  // Con el dedo las zonas de agarre deben ser mucho mayores que con el ratón.
  const coarse = useCoarsePointer();

  const {
    state: panZoom, isPanning,
    handleWheel, handlePointerDown: handlePanPointerDown,
    handlePointerMove: handlePanPointerMove,
    handlePointerUp: handlePanPointerUp,
    zoomBy, gesture, fitTo, resetView,
  } = usePanZoom(1, tool === 'PAN');

  const panZoomRef = useRef<PanZoomState>(panZoom);
  panZoomRef.current = panZoom;

  // ── Lasso state ─────────────────────────────────────────────────────────────
  const [lasso, setLasso] = useState<LassoRect | null>(null);
  const lassoStart = useRef<{ cx: number; cy: number; additive: boolean } | null>(null);

  // ── Gesto de dos dedos (pinch-zoom + pan) ───────────────────────────────────
  // Sin esto no hay forma de hacer zoom en una pantalla táctil: la rueda del
  // ratón no existe y los botones de la barra son el único recurso.
  const touchPoints = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; midX: number; midY: number } | null>(null);
  const [isPinching, setIsPinching] = useState(false);

  /** Distancia y punto medio entre los dos primeros dedos activos. */
  const readPinch = useCallback(() => {
    const pts = [...touchPoints.current.values()];
    if (pts.length < 2) return null;
    const [a, b] = pts;
    const rect = svgRef.current?.getBoundingClientRect();
    return {
      dist: Math.hypot(b.x - a.x, b.y - a.y),
      midX: (a.x + b.x) / 2 - (rect?.left ?? 0),
      midY: (a.y + b.y) / 2 - (rect?.top ?? 0),
    };
  }, []);

  /** Al entrar en gesto se abortan lazo y trazado de pared en curso. */
  const beginPinch = useCallback(() => {
    const p = readPinch();
    if (!p) return;
    userAdjustedView.current = true;
    pinchRef.current = p;
    setIsPinching(true);
    lassoStart.current = null;
    setLasso(null);
    setWallDraw(null);
  }, [readPinch]);

  const endPinch = useCallback(() => {
    pinchRef.current = null;
    setIsPinching(false);
  }, []);

  // ── Wall draw state ──────────────────────────────────────────────────────────
  const [wallDraw, setWallDraw] = useState<WallDraw | null>(null);

  // Cancel wall draw when switching away from WALL tool
  useEffect(() => {
    if (tool !== 'WALL') setWallDraw(null);
  }, [tool]);

  // Escape cancela el trazado de pared en curso
  useEffect(() => {
    if (!wallDraw) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setWallDraw(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [wallDraw]);

  // ── Viewport helpers ────────────────────────────────────────────────────────
  const viewportSize = useCallback(() => {
    const rect = svgRef.current?.getBoundingClientRect();
    return { w: rect?.width ?? 0, h: rect?.height ?? 0 };
  }, []);

  /** Zoom centrado en el viewport (no en el origen del lienzo). */
  const zoomAtCenter = useCallback((factor: number) => {
    const { w, h } = viewportSize();
    zoomBy(factor, w / 2, h / 2);
  }, [zoomBy, viewportSize]);

  const floorRef = useRef(floor);
  floorRef.current = floor;

  // ¿El usuario ya movió la vista a mano? Mientras no lo haga, el encuadre se
  // mantiene automático al cambiar de tamaño el contenedor.
  const userAdjustedView = useRef(false);

  /** Tamaño del viewport con el que se hizo el último encuadre automático. */
  const lastFitSize = useRef({ w: 0, h: 0 });

  const fitView = useCallback(() => {
    const { w, h } = viewportSize();
    if (w === 0 || h === 0) { resetView(); return; }
    fitTo(floorBounds(floorRef.current), w, h);
    lastFitSize.current = { w, h };
    userAdjustedView.current = false;
  }, [fitTo, resetView, viewportSize]);

  /** Marca la vista como ajustada manualmente (pan, zoom o gesto del usuario). */
  const markUserAdjusted = useCallback(() => { userAdjustedView.current = true; }, []);

  const zoomAtCenterManual = useCallback((factor: number) => {
    markUserAdjusted();
    zoomAtCenter(factor);
  }, [markUserAdjusted, zoomAtCenter]);

  const handleWheelTracked = useCallback((e: Parameters<typeof handleWheel>[0]) => {
    markUserAdjusted();
    handleWheel(e);
  }, [markUserAdjusted, handleWheel]);

  // Re-encuadra cuando cambia la disposición (girar el dispositivo, abrir el
  // panel, pasar a compacto). Sin esto el mapa quedaba fuera de pantalla tras
  // un cambio de tamaño, porque el encuadre solo ocurría al montar.
  //
  // La señal la manda el padre, que ya mide su contenedor, en lugar de observar
  // aquí el tamaño del `<svg>`: así se capta también el caso en que el lienzo
  // cambia de ancho sin que lo haga el editor (al abrirse el panel lateral).
  //
  // Se respeta el encuadre manual: si el usuario ya movió la vista, no se toca.
  useEffect(() => {
    if (userAdjustedView.current) return;
    const { w, h } = viewportSize();
    if (w === 0 || h === 0) return;
    const { w: lw, h: lh } = lastFitSize.current;
    if (Math.abs(lw - w) < 1 && Math.abs(lh - h) < 1) return;
    fitView();
  }, [layoutSignal, fitView, viewportSize]);

  // ── Expose callbacks ────────────────────────────────────────────────────────
  useEffect(() => {
    onRegisterZoomBy?.(zoomAtCenterManual);
    onRegisterResetView?.(fitView);
    onRegisterFitView?.(fitView);
  }, [onRegisterZoomBy, onRegisterResetView, onRegisterFitView, zoomAtCenterManual, fitView]);

  useEffect(() => { onZoomChange?.(panZoom.zoom); }, [panZoom.zoom, onZoomChange]);

  // Encuadre inicial: la planta puede estar en cualquier coordenada, así que
  // un pan fijo de 80,80 dejaba mapas importados fuera de la pantalla.
  const didFit = useRef(false);
  useEffect(() => {
    if (didFit.current) return;
    didFit.current = true;
    // Tras el primer layout, cuando el SVG ya tiene tamaño.
    const raf = requestAnimationFrame(fitView);
    return () => cancelAnimationFrame(raf);
  }, [fitView]);

  // ── Prevent passive wheel ───────────────────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const prevent = (e: WheelEvent) => e.preventDefault();
    el.addEventListener('wheel', prevent, { passive: false });
    return () => el.removeEventListener('wheel', prevent);
  }, []);

  // ── Coordinate helper ───────────────────────────────────────────────────────
  const toCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const { panX, panY, zoom } = panZoomRef.current;
    return { x: (clientX - rect.left - panX) / zoom, y: (clientY - rect.top - panY) / zoom };
  }, []);

  // ── Wall snap helper ─────────────────────────────────────────────────────────
  const findSnapNode = useCallback((
    cx: number, cy: number,
    excludeId?: string | null,
  ): WallNode | null => {
    const threshold = SNAP_PX / panZoomRef.current.zoom;
    const candidates = excludeId
      ? floor.wallNodes.filter(n => n.id !== excludeId)
      : floor.wallNodes;
    return findNearestNode(cx, cy, candidates, threshold) as WallNode | null;
  }, [floor.wallNodes]);

  /** Recorta un punto libre al interior del área de la planta. */
  const clampToArea = useCallback((cx: number, cy: number): { x: number; y: number } => {
    const { area } = floor;
    if (area.shape === 'rect') {
      const ax = area.x ?? 0, ay = area.y ?? 0;
      const aw = area.width ?? 0, ah = area.height ?? 0;
      return {
        x: Math.max(ax, Math.min(ax + aw, cx)),
        y: Math.max(ay, Math.min(ay + ah, cy)),
      };
    }
    if (area.shape === 'polygon') {
      const pts = area.points ?? [];
      if (pts.length < 3 || insideFloor(cx, cy, floor)) return { x: cx, y: cy };
      let bestDist = Infinity, bx = cx, by = cy;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [ax2, ay2] = pts[j], [bx2, by2] = pts[i];
        const dx = bx2 - ax2, dy = by2 - ay2;
        const len2 = dx * dx + dy * dy;
        const t = len2 > 0 ? Math.max(0, Math.min(1, ((cx - ax2) * dx + (cy - ay2) * dy) / len2)) : 0;
        const nx = ax2 + t * dx, ny = ay2 + t * dy;
        const dist = (cx - nx) ** 2 + (cy - ny) ** 2;
        if (dist < bestDist) { bestDist = dist; bx = nx; by = ny; }
      }
      return { x: bx, y: by };
    }
    return { x: cx, y: cy };
  }, [floor]);

  // ── SVG pointer events ───────────────────────────────────────────────────────
  const handleSvgPointerDown = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') {
      touchPoints.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      // Segundo dedo: pasa a gesto de dos dedos y descarta la acción en curso.
      if (touchPoints.current.size === 2) {
        beginPinch();
        return;
      }
      if (touchPoints.current.size > 2) return;
    }

    if (e.button === 1 || (e.button === 0 && tool === 'PAN')) {
      markUserAdjusted();
      handlePanPointerDown(e);
      return;
    }
    if (e.button !== 0) return;

    const raw = toCanvas(e.clientX, e.clientY);
    const { x: cx, y: cy } = snapPoint(raw.x, raw.y, gridSize, snapEnabled);

    // ── WALL mode ──
    if (tool === 'WALL') {
      if (!wallDraw) {
        // First click: reject if outside floor
        if (!insideFloor(cx, cy, floor)) return;
        const snapNode = findSnapNode(cx, cy, null);
        const sx = snapNode ? snapNode.x : cx;
        const sy = snapNode ? snapNode.y : cy;
        setWallDraw({
          startX: sx, startY: sy,
          snapStartNode: snapNode,
          previewX: cx, previewY: cy,
          snapEndNode: null,
        });
      } else {
        // Second click: complete the wall
        // Snapped node is always a valid existing point; free point is clamped to floor
        const snapNode = findSnapNode(cx, cy, wallDraw.snapStartNode?.id ?? null);
        const end = snapNode
          ? { x: snapNode.x, y: snapNode.y }
          : clampToArea(cx, cy);

        // Ignore zero-length walls
        const dist = Math.hypot(end.x - wallDraw.startX, end.y - wallDraw.startY);
        let createdEndId: string | undefined;
        if (dist > 2) {
          createdEndId = onAddWall?.(
            wallDraw.startX, wallDraw.startY,
            end.x, end.y,
            wallDraw.snapStartNode?.id ?? null,
            snapNode?.id ?? null,
          );
        }

        // Encadena la siguiente pared desde el nodo REAL recién creado. Antes
        // se perdía el id cuando el extremo era un punto libre, y la pared
        // siguiente generaba un nodo duplicado en la misma posición (sin
        // mitre en la unión y sin limpieza al borrar).
        const chainNodeId = snapNode?.id ?? createdEndId ?? null;
        setWallDraw({
          startX: end.x, startY: end.y,
          snapStartNode: chainNodeId ? { id: chainNodeId, x: end.x, y: end.y } : null,
          previewX: cx, previewY: cy,
          snapEndNode: null,
        });
      }
      return;
    }

    if (tool === 'PLACE') {
      onPlaceElement(cx, cy);
      return;
    }

    if (tool === 'SELECT') {
      const additive = e.ctrlKey || e.metaKey || e.shiftKey;
      lassoStart.current = { cx, cy, additive };
      setLasso({ x: cx, y: cy, w: 0, h: 0 });
    }
  }, [handlePanPointerDown, tool, toCanvas, gridSize, snapEnabled,
      wallDraw, floor, findSnapNode, clampToArea, onAddWall, onPlaceElement, beginPinch]);

  const handleSvgPointerMove = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch' && touchPoints.current.has(e.pointerId)) {
      touchPoints.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Gesto de dos dedos: escala por la variación de distancia y desplaza por
    // la del punto medio, todo en una sola actualización de estado.
    if (pinchRef.current) {
      const p = readPinch();
      if (!p) return;
      const prev = pinchRef.current;
      const scale = prev.dist > 0 ? p.dist / prev.dist : 1;
      gesture(scale, p.midX, p.midY, p.midX - prev.midX, p.midY - prev.midY);
      pinchRef.current = p;
      return;
    }

    handlePanPointerMove(e);

    const raw = toCanvas(e.clientX, e.clientY);
    const { x: cx, y: cy } = snapPoint(raw.x, raw.y, gridSize, snapEnabled);

    if (tool === 'WALL' && wallDraw) {
      const snapNode = findSnapNode(cx, cy, wallDraw.snapStartNode?.id ?? null);
      setWallDraw(prev => prev
        ? { ...prev, previewX: cx, previewY: cy, snapEndNode: snapNode }
        : null,
      );
      return;
    }

    if (tool === 'SELECT' && lassoStart.current) {
      const lx = Math.min(cx, lassoStart.current.cx);
      const ly = Math.min(cy, lassoStart.current.cy);
      setLasso({ x: lx, y: ly, w: Math.abs(cx - lassoStart.current.cx), h: Math.abs(cy - lassoStart.current.cy) });
    }
  }, [handlePanPointerMove, tool, toCanvas, gridSize, snapEnabled, wallDraw, findSnapNode,
      readPinch, gesture]);

  const handleSvgPointerUp = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') touchPoints.current.delete(e.pointerId);
    // Al levantar un dedo el gesto termina; el que queda NO reanuda el lazo,
    // o al soltar un pinch se seleccionaría sin querer.
    if (pinchRef.current) {
      endPinch();
      handlePanPointerUp(e);
      return;
    }

    handlePanPointerUp(e);

    const start = lassoStart.current;
    if (start && lasso) {
      const minSize = 4 / panZoomRef.current.zoom;
      if (lasso.w > minSize || lasso.h > minSize) {
        const ids = floor.elements
          .filter(el => {
            // Se usa la huella real (con rotación) del elemento, no su caja sin
            // girar, para que el lazo atrape también los elementos rotados.
            const f = elementFootprint(el);
            return rectsIntersect(lasso, { x: f.x, y: f.y, w: f.width, h: f.height });
          })
          .map(el => el.id);
        if (ids.length > 0) onSelectSet(ids, start.additive);
        else if (!start.additive) onClearSelection();
      } else if (!start.additive) {
        // Clic en vacío: deselecciona (elementos y pared).
        onClearSelection();
        onSelectWall?.(null);
      }
      lassoStart.current = null;
      setLasso(null);
    }
  }, [handlePanPointerUp, lasso, floor.elements, onSelectSet, onClearSelection, onSelectWall, endPinch]);

  const handleSvgPointerCancel = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') touchPoints.current.delete(e.pointerId);
    if (pinchRef.current) endPinch();
    handlePanPointerUp(e);
    lassoStart.current = null;
    setLasso(null);
  }, [handlePanPointerUp, endPinch]);

  const handleContextMenu = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    // Right-click cancels in-progress wall drawing
    if (tool === 'WALL') setWallDraw(null);
  }, [tool]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const cursor = isPanning || isPinching ? 'grabbing'
    : tool === 'PAN'    ? 'grab'
    : tool === 'WALL'   ? 'crosshair'
    : tool === 'PLACE'  ? 'crosshair'
    : tool === 'ERASE'  ? 'crosshair'
    : 'default';

  const { panX, panY, zoom } = panZoom;

  // Preview wall path (while drawing)
  const previewPath = wallDraw && (() => {
    const ex = wallDraw.snapEndNode?.x ?? wallDraw.previewX;
    const ey = wallDraw.snapEndNode?.y ?? wallDraw.previewY;
    const dist = Math.hypot(ex - wallDraw.startX, ey - wallDraw.startY);
    return dist > 2
      ? wallSegmentPath(wallDraw.startX, wallDraw.startY, ex, ey, DEFAULT_THICKNESS, null, null)
      : null;
  })();

  return (
    <>
    <svg
      ref={svgRef}
      className="w-full h-full select-none outline-none"
      // `touchAction: none` es imprescindible para que el navegador no se
      // quede con los gestos táctiles (scroll/pinch) antes que el editor.
      style={{ cursor, display: 'block', touchAction: 'none' }}
      onWheel={handleWheelTracked}
      onPointerDown={handleSvgPointerDown}
      onPointerMove={handleSvgPointerMove}
      onPointerUp={handleSvgPointerUp}
      onPointerCancel={handleSvgPointerCancel}
      onContextMenu={handleContextMenu}
    >
      <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
        {/* Canvas background */}
        <rect
          x={-PLANE} y={-PLANE} width={PLANE * 2} height={PLANE * 2}
          fill={palette.canvasBg}
          style={{ pointerEvents: 'none' }}
        />

        {/* Grid */}
        {showGrid && (
          <GridOverlay gridSize={gridSize} zoom={zoom} palette={palette} uid={domUid} />
        )}

        {/* Artboard */}
        <Artboard
          area={floor.area}
          onResize={area => onAreaResize({ ...floor, area })}
          onMove={onAreaMove}
          onMoveCommit={onAreaMoveCommit}
          onResizeCommit={area => onAreaResizeCommit?.({ ...floor, area })}
          svgRef={svgRef}
          panZoomRef={panZoomRef}
          zoom={zoom}
          palette={palette}
          uid={domUid}
          coarse={coarse}
          readOnly={readOnly || tool !== 'SELECT'}
        />

        {/* Walls */}
        <WallLayer
          nodes={floor.wallNodes}
          walls={floor.walls}
          zoom={zoom}
          tool={tool}
          palette={palette}
          selectedWallId={selectedWallId}
          onSelectWall={readOnly ? undefined : onSelectWall}
          onDeleteWall={onDeleteWall}
        />

        {/* Elements */}
        {floor.elements.map(el => {
          const typeDef = elementTypeDefs.get(el.type);
          if (!typeDef) return null;
          const status = statusMap?.get(el.id);
          return (
            <ElementNode
              key={el.id}
              element={el}
              typeDef={typeDef}
              isSelected={selectedIds.has(el.id)}
              tool={tool}
              zoom={zoom}
              svgRef={svgRef}
              panZoomRef={panZoomRef}
              snapEnabled={snapEnabled}
              gridSize={gridSize}
              palette={palette}
              coarse={coarse}
              statusFill={status?.fill}
              statusTooltip={status?.tooltip}
              onSelect={onSelectElement}
              onMove={onMoveElement}
              onMoveCommit={onMoveCommit}
              onResize={onResizeElement}
              onResizeCommit={onResizeCommit}
              onRotate={onRotateElement}
              onRotateCommit={onRotateCommit}
              onDelete={onDeleteElement}
              onViewerClick={onViewerElementClick}
            />
          );
        })}

        {/* Lasso rectangle */}
        {lasso && lasso.w > 0 && lasso.h > 0 && (
          <rect
            x={lasso.x} y={lasso.y} width={lasso.w} height={lasso.h}
            fill={palette.accent}
            fillOpacity={0.08}
            stroke={palette.accent}
            strokeWidth={1 / zoom}
            strokeDasharray={`${4 / zoom},${2 / zoom}`}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* ── Wall draw preview ── */}
        {wallDraw && (
          <>
            {/* Preview wall body */}
            {previewPath && (
              <path
                d={previewPath}
                fill={palette.previewFill}
                fillOpacity={0.45}
                stroke={palette.accent}
                strokeWidth={1 / zoom}
                strokeDasharray={`${5 / zoom},${3 / zoom}`}
                style={{ pointerEvents: 'none' }}
              />
            )}
            {/* Start node anchor */}
            <circle
              cx={wallDraw.startX} cy={wallDraw.startY}
              r={5 / zoom}
              fill={palette.accent} stroke={palette.handleFill} strokeWidth={1.5 / zoom}
              style={{ pointerEvents: 'none' }}
            />
            {/* Snap ring around the nearest end node */}
            {wallDraw.snapEndNode && (
              <circle
                cx={wallDraw.snapEndNode.x} cy={wallDraw.snapEndNode.y}
                r={9 / zoom}
                fill="none" stroke={palette.accent} strokeWidth={2 / zoom}
                style={{ pointerEvents: 'none' }}
              />
            )}
          </>
        )}
      </g>
    </svg>

    {/* En táctil no hay clic derecho ni tecla Escape, así que el trazado de
        pared quedaría atrapado sin forma de cancelarlo. */}
    {wallDraw && coarse && (
      <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
        <div className="flex items-center gap-3 rounded-full bg-slate-900/90 dark:bg-slate-100/90 px-4 py-2 text-xs text-white dark:text-slate-900 shadow-lg pointer-events-auto">
          <span>Toca para fijar el siguiente punto</span>
          <button
            type="button"
            onClick={() => setWallDraw(null)}
            className="rounded-full bg-white/20 dark:bg-slate-900/20 px-3 py-1 font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    )}
    </>
  );
}
