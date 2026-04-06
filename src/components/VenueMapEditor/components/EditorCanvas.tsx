import { useRef, useEffect } from 'react';
import type { Floor, ToolMode } from '../types';
import type { PanZoomState } from '../hooks/usePanZoom';
import { usePanZoom } from '../hooks/usePanZoom';
import { GridOverlay } from './GridOverlay';
import { Artboard } from './Artboard';

interface EditorCanvasProps {
  floor: Floor;
  tool: ToolMode;
  gridSize: number;
  showGrid: boolean;
  readOnly: boolean;
  onAreaResize: (floor: Floor) => void;
  /** Called whenever the zoom level changes (for the toolbar label). */
  onZoomChange?: (zoom: number) => void;
  /** Parent registers a "zoom by factor" imperative callback. */
  onRegisterZoomBy?: (fn: (factor: number) => void) => void;
  /** Parent registers a "reset view" imperative callback. */
  onRegisterResetView?: (fn: () => void) => void;
}

/**
 * Infinite SVG canvas with:
 *  - Middle-click drag → pan
 *  - Scroll wheel      → zoom (centred on cursor)
 *  - Grid overlay (optional)
 *  - Artboard with resize handles
 */
export function EditorCanvas({
  floor,
  tool,
  gridSize,
  showGrid,
  readOnly,
  onAreaResize,
  onZoomChange,
  onRegisterZoomBy,
  onRegisterResetView,
}: EditorCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    state: panZoom,
    isPanning,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    zoomBy,
    resetView,
  } = usePanZoom(1);

  // Always-fresh ref so drag handlers never see stale pan/zoom values.
  const panZoomRef = useRef<PanZoomState>(panZoom);
  panZoomRef.current = panZoom;

  // ── Expose imperative callbacks to parent (once on mount) ──────────────────
  useEffect(() => {
    onRegisterZoomBy?.(zoomBy);
    onRegisterResetView?.(resetView);
    // Intentionally only on mount — zoomBy/resetView are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Propagate zoom to parent (for toolbar label) ────────────────────────────
  useEffect(() => {
    onZoomChange?.(panZoom.zoom);
  }, [panZoom.zoom, onZoomChange]);

  // ── Prevent browser native scroll/zoom on the SVG element ──────────────────
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const prevent = (e: WheelEvent) => e.preventDefault();
    el.addEventListener('wheel', prevent, { passive: false });
    return () => el.removeEventListener('wheel', prevent);
  }, []);

  const cursor = isPanning ? 'grabbing' : tool === 'PAN' ? 'grab' : 'default';
  const { panX, panY, zoom } = panZoom;

  return (
    <svg
      ref={svgRef}
      className="w-full h-full select-none outline-none"
      style={{ cursor, display: 'block' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={e => e.preventDefault()}
    >
      <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
        {/* Canvas background */}
        <rect
          x={-50000}
          y={-50000}
          width={100000}
          height={100000}
          fill="#f1f5f9"
        />

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
      </g>
    </svg>
  );
}
