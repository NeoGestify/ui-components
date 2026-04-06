import { useRef, useEffect, useState, useCallback } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { Floor, WallNode, ElementTypeDef, ToolMode } from '../types';
import type { PanZoomState } from '../hooks/usePanZoom';
import { usePanZoom } from '../hooks/usePanZoom';
import { findNearestNode, snapPoint } from '../utils/snapUtils';
import { wallSegmentPath } from '../utils/wallGeometry';
import { GridOverlay } from './GridOverlay';
import { Artboard } from './Artboard';
import { WallLayer } from './WallLayer';
import { ElementNode } from './ElementNode';

// ─── Constants ────────────────────────────────────────────────────────────────

const SNAP_PX           = 10;   // screen pixels for wall-node snap
const DEFAULT_THICKNESS = 8;    // canvas units

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
  statusMap?: Map<string, string>;
  onAreaResize: (floor: Floor) => void;
  onAreaMove: (dx: number, dy: number) => void;
  onAreaResizeCommit?: (floor: Floor) => void;
  onSelectElement: (id: string, multi: boolean) => void;
  onSelectSet: (ids: string[]) => void;
  onClearSelection: () => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onMoveCommit: (id: string, x: number, y: number) => void;
  onResizeElement: (id: string, x: number, y: number, w: number, h: number) => void;
  onResizeCommit: (id: string, x: number, y: number, w: number, h: number) => void;
  onRotateElement: (id: string, rotation: number) => void;
  onRotateCommit: (id: string, rotation: number) => void;
  onDeleteElement: (id: string) => void;
  onPlaceElement: (canvasX: number, canvasY: number) => void;
  onAddWall?: (x1: number, y1: number, x2: number, y2: number,
               snapStartId: string | null, snapEndId: string | null) => void;
  onDeleteWall?: (wallId: string) => void;
  onViewerElementClick?: (id: string) => void;
  onZoomChange?: (zoom: number) => void;
  onRegisterZoomBy?: (fn: (factor: number) => void) => void;
  onRegisterResetView?: (fn: () => void) => void;
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
  statusMap,
  onAreaResize,
  onAreaMove,
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
}: EditorCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    state: panZoom, isPanning,
    handleWheel, handleMouseDown: handlePanMouseDown,
    handleMouseMove: handlePanMouseMove,
    handleMouseUp: handlePanMouseUp,
    handleMouseLeave,
    zoomBy, resetView,
  } = usePanZoom(1, tool === 'PAN');

  const panZoomRef = useRef<PanZoomState>(panZoom);
  panZoomRef.current = panZoom;

  // ── Lasso state ─────────────────────────────────────────────────────────────
  const [lasso, setLasso] = useState<LassoRect | null>(null);
  const lassoStart = useRef<{ cx: number; cy: number } | null>(null);

  // ── Wall draw state ──────────────────────────────────────────────────────────
  const [wallDraw, setWallDraw] = useState<WallDraw | null>(null);

  // Cancel wall draw when switching away from WALL tool
  useEffect(() => {
    if (tool !== 'WALL') setWallDraw(null);
  }, [tool]);

  // ── Expose callbacks ────────────────────────────────────────────────────────
  useEffect(() => {
    onRegisterZoomBy?.(zoomBy);
    onRegisterResetView?.(resetView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { onZoomChange?.(panZoom.zoom); }, [panZoom.zoom, onZoomChange]);

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

  // ── SVG mouse events ─────────────────────────────────────────────────────────
  const handleSvgMouseDown = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    if (e.button === 1 || (e.button === 0 && tool === 'PAN')) {
      handlePanMouseDown(e);
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
        let ex: number, ey: number;
        if (snapNode) {
          ex = snapNode.x; ey = snapNode.y;
        } else {
          const { area } = floor;
          if (area.shape === 'rect') {
            const ax = area.x ?? 0, ay = area.y ?? 0;
            const aw = area.width ?? 0, ah = area.height ?? 0;
            ex = Math.max(ax, Math.min(ax + aw, cx));
            ey = Math.max(ay, Math.min(ay + ah, cy));
          } else {
            ex = cx; ey = cy;
          }
        }

        // Ignore zero-length walls
        const dist = Math.hypot(ex - wallDraw.startX, ey - wallDraw.startY);
        if (dist > 2) {
          onAddWall?.(
            wallDraw.startX, wallDraw.startY,
            ex, ey,
            wallDraw.snapStartNode?.id ?? null,
            snapNode?.id ?? null,
          );
        }

        // Chain: start next wall from end point
        setWallDraw({
          startX: ex, startY: ey,
          snapStartNode: snapNode,
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
      lassoStart.current = { cx, cy };
      setLasso({ x: cx, y: cy, w: 0, h: 0 });
    }
  }, [handlePanMouseDown, tool, toCanvas, gridSize, snapEnabled,
      wallDraw, findSnapNode, onAddWall, onPlaceElement]);

  const handleSvgMouseMove = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    handlePanMouseMove(e);

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
  }, [handlePanMouseMove, tool, toCanvas, gridSize, snapEnabled, wallDraw, findSnapNode]);

  const handleSvgMouseUp = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    handlePanMouseUp(e);

    if (lassoStart.current && lasso) {
      if (lasso.w > 4 / panZoom.zoom || lasso.h > 4 / panZoom.zoom) {
        const ids = floor.elements
          .filter(el => rectsIntersect(lasso, { x: el.x, y: el.y, w: el.width, h: el.height }))
          .map(el => el.id);
        if (ids.length > 0) onSelectSet(ids);
        else if (!e.ctrlKey && !e.metaKey) onClearSelection();
      } else {
        if (!e.ctrlKey && !e.metaKey) onClearSelection();
      }
      lassoStart.current = null;
      setLasso(null);
    }
  }, [handlePanMouseUp, lasso, panZoom.zoom, floor.elements, onSelectSet, onClearSelection]);

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
      style={{ cursor, display: 'block' }}
      onWheel={handleWheel}
      onMouseDown={handleSvgMouseDown}
      onMouseMove={handleSvgMouseMove}
      onMouseUp={handleSvgMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    >
      <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
        {/* Canvas background */}
        <rect x={-50000} y={-50000} width={100000} height={100000} fill="#f1f5f9" />

        {/* Grid */}
        {showGrid && <GridOverlay gridSize={gridSize} />}

        {/* Artboard */}
        <Artboard
          area={floor.area}
          onResize={area => onAreaResize({ ...floor, area })}
          onMove={onAreaMove}
          onResizeCommit={area => onAreaResizeCommit?.({ ...floor, area })}
          svgRef={svgRef}
          panZoomRef={panZoomRef}
          zoom={zoom}
          readOnly={readOnly || tool !== 'SELECT'}
        />

        {/* Walls */}
        <WallLayer
          nodes={floor.wallNodes}
          walls={floor.walls}
          zoom={zoom}
          tool={tool}
          onDeleteWall={onDeleteWall}
        />

        {/* Elements */}
        {floor.elements.map(el => {
          const typeDef = elementTypeDefs.get(el.type);
          if (!typeDef) return null;
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
              statusFill={statusMap?.get(el.id)}
              onSelect={multi => onSelectElement(el.id, multi)}
              onMove={(x, y) => onMoveElement(el.id, x, y)}
              onMoveCommit={(x, y) => onMoveCommit(el.id, x, y)}
              onResize={(x, y, w, h) => onResizeElement(el.id, x, y, w, h)}
              onResizeCommit={(x, y, w, h) => onResizeCommit(el.id, x, y, w, h)}
              onRotate={r => onRotateElement(el.id, r)}
              onRotateCommit={r => onRotateCommit(el.id, r)}
              onDelete={() => onDeleteElement(el.id)}
              onViewerClick={onViewerElementClick ? () => onViewerElementClick(el.id) : undefined}
            />
          );
        })}

        {/* Lasso rectangle */}
        {lasso && lasso.w > 0 && lasso.h > 0 && (
          <rect
            x={lasso.x} y={lasso.y} width={lasso.w} height={lasso.h}
            fill="rgba(59,130,246,0.06)"
            stroke="#3b82f6"
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
                fill="#94a3b8"
                fillOpacity={0.45}
                stroke="#3b82f6"
                strokeWidth={1 / zoom}
                strokeDasharray={`${5 / zoom},${3 / zoom}`}
                style={{ pointerEvents: 'none' }}
              />
            )}
            {/* Start node anchor */}
            <circle
              cx={wallDraw.startX} cy={wallDraw.startY}
              r={5 / zoom}
              fill="#3b82f6" stroke="white" strokeWidth={1.5 / zoom}
              style={{ pointerEvents: 'none' }}
            />
            {/* Snap ring around the nearest end node */}
            {wallDraw.snapEndNode && (
              <circle
                cx={wallDraw.snapEndNode.x} cy={wallDraw.snapEndNode.y}
                r={9 / zoom}
                fill="none" stroke="#3b82f6" strokeWidth={2 / zoom}
                style={{ pointerEvents: 'none' }}
              />
            )}
          </>
        )}
      </g>
    </svg>
  );
}
