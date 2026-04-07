import { useRef, useCallback } from 'react';
import type { MouseEvent as ReactMouseEvent, RefObject } from 'react';
import type { PanZoomState } from './usePanZoom';

/** A ref whose current value is always a live PanZoomState (never null). */
type PanZoomRef = { current: PanZoomState };

export interface DragCallbacks {
  onDragStart?: (canvasX: number, canvasY: number) => void;
  onDragMove: (dx: number, dy: number, canvasX: number, canvasY: number) => void;
  onDragEnd?: (canvasX: number, canvasY: number) => void;
}

/**
 * Generic SVG drag hook.
 *
 * Converts raw clientX/Y into canvas coordinates using the current pan/zoom,
 * then fires `onDragMove` with the delta since the last frame.
 *
 * Uses window-level listeners so that the drag continues even when the cursor
 * leaves the SVG element.
 */
export function useDrag(
  svgRef: RefObject<SVGSVGElement | null>,
  panZoomRef: PanZoomRef,
  callbacks: DragCallbacks,
) {
  // Keep callbacks in a ref so window listeners always call the latest version.
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  const lastCanvas = useRef({ x: 0, y: 0 });

  /** Convert a screen position (clientX, clientY) to canvas coordinates. */
  const toCanvas = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const rect = svgRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
      const { panX, panY, zoom } = panZoomRef.current;
      return {
        x: (clientX - rect.left - panX) / zoom,
        y: (clientY - rect.top - panY) / zoom,
      };
    },
    [svgRef, panZoomRef],
  );

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      const canvas = toCanvas(e.clientX, e.clientY);
      lastCanvas.current = canvas;
      cbRef.current.onDragStart?.(canvas.x, canvas.y);

      const onMove = (ev: MouseEvent) => {
        const c = toCanvas(ev.clientX, ev.clientY);
        const dx = c.x - lastCanvas.current.x;
        const dy = c.y - lastCanvas.current.y;
        lastCanvas.current = c;
        cbRef.current.onDragMove(dx, dy, c.x, c.y);
      };

      const onUp = (ev: MouseEvent) => {
        const c = toCanvas(ev.clientX, ev.clientY);
        cbRef.current.onDragEnd?.(c.x, c.y);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [toCanvas],
  );

  return { handleMouseDown };
}
