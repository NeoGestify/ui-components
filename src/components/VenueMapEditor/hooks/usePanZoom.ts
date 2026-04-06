import { useState, useCallback, useRef } from 'react';
import type { WheelEvent as ReactWheelEvent, MouseEvent as ReactMouseEvent } from 'react';

export interface PanZoomState {
  panX: number;
  panY: number;
  zoom: number;
}

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;
const ZOOM_FACTOR = 1.1;

export function usePanZoom(initialZoom = 1, leftClickPan = false) {
  const [state, setState] = useState<PanZoomState>({
    panX: 80,
    panY: 80,
    zoom: initialZoom,
  });

  /** Track whether a middle-click pan is in progress (ref = no re-render). */
  const isPanningRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // ── Wheel zoom ──────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: ReactWheelEvent<SVGSVGElement>) => {
    // NOTE: e.preventDefault() is intentionally NOT called here.
    // React registers synthetic wheel events as passive, so calling preventDefault
    // would throw a warning and be ignored. The non-passive native listener added
    // in EditorCanvas handles scroll prevention instead.
    const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

    // Read all event values NOW — before setState — because e.currentTarget
    // is nulled out by React after the event handler returns (event pooling).
    const svgEl = e.currentTarget as SVGSVGElement;
    const rect = svgEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setState(prev => {
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev.zoom * factor));
      // Keep the canvas point under the cursor fixed.
      const canvasX = (mouseX - prev.panX) / prev.zoom;
      const canvasY = (mouseY - prev.panY) / prev.zoom;
      return {
        panX: mouseX - canvasX * newZoom,
        panY: mouseY - canvasY * newZoom,
        zoom: newZoom,
      };
    });
  }, []);

  // ── Pan (middle-click, or left-click when leftClickPan=true) ────────────────
  const handleMouseDown = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    const valid = leftClickPan ? (e.button === 0 || e.button === 1) : e.button === 1;
    if (!valid) return;
    e.preventDefault();
    isPanningRef.current = true;
    setIsPanning(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [leftClickPan]);

  const handleMouseMove = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setState(prev => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
  }, []);

  const stopPan = useCallback((_e: ReactMouseEvent<SVGSVGElement>) => {
    if (!isPanningRef.current) return;
    isPanningRef.current = false;
    setIsPanning(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
    }
  }, []);

  // ── Programmatic zoom ───────────────────────────────────────────────────────
  const zoomBy = useCallback((factor: number, cx?: number, cy?: number) => {
    setState(prev => {
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev.zoom * factor));
      if (cx !== undefined && cy !== undefined) {
        const canvasX = (cx - prev.panX) / prev.zoom;
        const canvasY = (cy - prev.panY) / prev.zoom;
        return { panX: cx - canvasX * newZoom, panY: cy - canvasY * newZoom, zoom: newZoom };
      }
      return { ...prev, zoom: newZoom };
    });
  }, []);

  const resetView = useCallback(() => {
    setState({ panX: 80, panY: 80, zoom: 1 });
  }, []);

  return {
    state,
    setState,
    isPanning,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: stopPan,
    handleMouseLeave,
    zoomBy,
    resetView,
  };
}
