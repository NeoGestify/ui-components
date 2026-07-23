import { useRef, useEffect, useState, useCallback, useMemo, useId } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react';
import type { Floor, WallNode, ElementTypeDef, ToolMode } from '../types';
import type { PanZoomState, Bounds } from '../hooks/usePanZoom';
import type { VenuePalette } from '../theme';
import { usePanZoom } from '../hooks/usePanZoom';
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
}: EditorCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // `useId` genera un prefijo único por instancia: sin él, dos editores en la
  // misma página comparten los ids de <pattern>/<filter> y el segundo pisa al
  // primero (rejilla y sombras del tema equivocado).
  const rawId = useId();
  const domUid = useMemo(() => `vme${rawId.replace(/[^a-zA-Z0-9]/g, '')}`, [rawId]);

  const {
    state: panZoom, isPanning,
    handleWheel, handlePointerDown: handlePanPointerDown,
    handlePointerMove: handlePanPointerMove,
    handlePointerUp: handlePanPointerUp,
    zoomBy, fitTo, resetView,
  } = usePanZoom(1, tool === 'PAN');

  const panZoomRef = useRef<PanZoomState>(panZoom);
  panZoomRef.current = panZoom;

  // ── Lasso state ─────────────────────────────────────────────────────────────
  const [lasso, setLasso] = useState<LassoRect | null>(null);
  const lassoStart = useRef<{ cx: number; cy: number; additive: boolean } | null>(null);

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

  const fitView = useCallback(() => {
    const { w, h } = viewportSize();
    if (w === 0 || h === 0) { resetView(); return; }
    fitTo(floorBounds(floorRef.current), w, h);
  }, [fitTo, resetView, viewportSize]);

  // ── Expose callbacks ────────────────────────────────────────────────────────
  useEffect(() => {
    onRegisterZoomBy?.(zoomAtCenter);
    onRegisterResetView?.(fitView);
    onRegisterFitView?.(fitView);
  }, [onRegisterZoomBy, onRegisterResetView, onRegisterFitView, zoomAtCenter, fitView]);

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
    if (e.button === 1 || (e.button === 0 && tool === 'PAN')) {
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
      wallDraw, floor, findSnapNode, clampToArea, onAddWall, onPlaceElement]);

  const handleSvgPointerMove = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
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
  }, [handlePanPointerMove, tool, toCanvas, gridSize, snapEnabled, wallDraw, findSnapNode]);

  const handleSvgPointerUp = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
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
  }, [handlePanPointerUp, lasso, floor.elements, onSelectSet, onClearSelection, onSelectWall]);

  const handleSvgPointerCancel = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    handlePanPointerUp(e);
    lassoStart.current = null;
    setLasso(null);
  }, [handlePanPointerUp]);

  const handleContextMenu = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    // Right-click cancels in-progress wall drawing
    if (tool === 'WALL') setWallDraw(null);
  }, [tool]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const cursor = isPanning ? 'grabbing'
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
    <svg
      ref={svgRef}
      className="w-full h-full select-none outline-none"
      // `touchAction: none` es imprescindible para que el navegador no se
      // quede con los gestos táctiles (scroll/pinch) antes que el editor.
      style={{ cursor, display: 'block', touchAction: 'none' }}
      onWheel={handleWheel}
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
  );
}
