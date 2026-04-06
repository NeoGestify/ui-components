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

export function usePanZoom(initialZoom = 1) {
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
    e.preventDefault();
    const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

    setState(prev => {
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev.zoom * factor));
      const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
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

  // ── Middle-click pan ────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    if (e.button !== 1) return;
    e.preventDefault();
    isPanningRef.current = true;
    setIsPanning(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setState(prev => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
  }, []);

  const stopPan = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    if (e.button !== 1 && !isPanningRef.current) return;
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
