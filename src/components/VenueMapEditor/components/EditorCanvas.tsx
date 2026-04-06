import { useRef, useEffect, useState, useCallback } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { Floor, ElementTypeDef, ToolMode } from '../types';
import type { PanZoomState } from '../hooks/usePanZoom';
import { usePanZoom } from '../hooks/usePanZoom';
import { GridOverlay } from './GridOverlay';
import { Artboard } from './Artboard';
import { ElementNode } from './ElementNode';

// ─── Lasso rect ───────────────────────────────────────────────────────────────

interface LassoRect { x: number; y: number; w: number; h: number }

function rectsIntersect(a: LassoRect, b: LassoRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
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
  onAreaResize: (floor: Floor) => void;
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
  onAreaResize,
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

  // ── SVG background mouse events ─────────────────────────────────────────────
  const handleSvgMouseDown = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    // Middle-click always pans; left-click pans when PAN tool active
    if (e.button === 1 || (e.button === 0 && tool === 'PAN')) {
      handlePanMouseDown(e);
      return;
    }
    if (e.button !== 0) return;

    const { x: cx, y: cy } = toCanvas(e.clientX, e.clientY);

    if (tool === 'PLACE') {
      onPlaceElement(cx, cy);
      return;
    }

    if (tool === 'SELECT') {
      // Start lasso on background click
      lassoStart.current = { cx, cy };
      setLasso({ x: cx, y: cy, w: 0, h: 0 });
    }
  }, [handlePanMouseDown, tool, toCanvas, onPlaceElement]);

  const handleSvgMouseMove = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    handlePanMouseMove(e);

    if (tool === 'SELECT' && lassoStart.current) {
      const { x: cx, y: cy } = toCanvas(e.clientX, e.clientY);
      const lx = Math.min(cx, lassoStart.current.cx);
      const ly = Math.min(cy, lassoStart.current.cy);
      const lw = Math.abs(cx - lassoStart.current.cx);
      const lh = Math.abs(cy - lassoStart.current.cy);
      setLasso({ x: lx, y: ly, w: lw, h: lh });
    }
  }, [handlePanMouseMove, tool, toCanvas]);

  const handleSvgMouseUp = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    handlePanMouseUp(e);

    if (lassoStart.current && lasso) {
      if (lasso.w > 4 / panZoom.zoom || lasso.h > 4 / panZoom.zoom) {
        // Select elements inside lasso
        const ids = floor.elements
          .filter(el => rectsIntersect(lasso, { x: el.x, y: el.y, w: el.width, h: el.height }))
          .map(el => el.id);
        if (ids.length > 0) onSelectSet(ids);
        else if (!e.ctrlKey && !e.metaKey) onClearSelection();
      } else {
        // Small drag = click on background → clear selection
        if (!e.ctrlKey && !e.metaKey) onClearSelection();
      }
      lassoStart.current = null;
      setLasso(null);
    }
  }, [handlePanMouseUp, lasso, panZoom.zoom, floor.elements, onSelectSet, onClearSelection]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const cursor = isPanning ? 'grabbing'
    : tool === 'PAN'   ? 'grab'
    : tool === 'PLACE' ? 'crosshair'
    : tool === 'ERASE' ? 'crosshair'
    : 'default';

  const { panX, panY, zoom } = panZoom;

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
      onContextMenu={e => e.preventDefault()}
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
          svgRef={svgRef}
          panZoomRef={panZoomRef}
          zoom={zoom}
          readOnly={readOnly}
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
              onSelect={multi => onSelectElement(el.id, multi)}
              onMove={(x, y) => onMoveElement(el.id, x, y)}
              onMoveCommit={(x, y) => onMoveCommit(el.id, x, y)}
              onResize={(x, y, w, h) => onResizeElement(el.id, x, y, w, h)}
              onResizeCommit={(x, y, w, h) => onResizeCommit(el.id, x, y, w, h)}
              onRotate={r => onRotateElement(el.id, r)}
              onRotateCommit={r => onRotateCommit(el.id, r)}
              onDelete={() => onDeleteElement(el.id)}
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
      </g>
    </svg>
  );
}
