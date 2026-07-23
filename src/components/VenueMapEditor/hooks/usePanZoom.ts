import { useState, useCallback, useRef } from 'react';
import type { WheelEvent as ReactWheelEvent, PointerEvent as ReactPointerEvent } from 'react';

export interface PanZoomState {
  panX: number;
  panY: number;
  zoom: number;
}

/** Rectángulo en coordenadas de lienzo. */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;
const ZOOM_FACTOR = 1.1;

/** Sensibilidad de la rueda. deltaMode 0 = píxeles, 1 = líneas, 2 = páginas. */
const DELTA_SCALE = [1, 16, 400];

const clampZoom = (z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));

export function usePanZoom(initialZoom = 1, leftClickPan = false) {
  const [state, setState] = useState<PanZoomState>({
    panX: 80,
    panY: 80,
    zoom: initialZoom,
  });

  /** Track whether a pan is in progress (ref = no re-render). */
  const isPanningRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const activePointerRef = useRef<number | null>(null);

  // ── Wheel zoom / trackpad ──────────────────────────────────────────────────
  const handleWheel = useCallback((e: ReactWheelEvent<SVGSVGElement>) => {
    // NOTE: e.preventDefault() no se llama aquí — React registra los eventos
    // wheel sintéticos como pasivos. El listener nativo no-pasivo añadido en
    // EditorCanvas es el que evita el scroll de la página.

    // Read all event values NOW — before setState — because e.currentTarget
    // is nulled out by React after the event handler returns (event pooling).
    const svgEl = e.currentTarget as SVGSVGElement;
    const rect = svgEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Se respeta la magnitud del delta: un trackpad manda muchos eventos
    // pequeños y una rueda pocos grandes. Con un factor fijo el trackpad
    // resultaba inutilizable (saltos de 10 % por micro-gesto).
    const unit = DELTA_SCALE[e.deltaMode] ?? 1;
    const delta = e.deltaY * unit;
    // El gesto de pellizco del trackpad llega como wheel + ctrlKey.
    const intensity = e.ctrlKey ? 0.012 : 0.0035;
    const factor = Math.exp(-delta * intensity);

    setState(prev => {
      const newZoom = clampZoom(prev.zoom * factor);
      if (newZoom === prev.zoom) return prev;
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

  // ── Pan (botón central, o principal cuando leftClickPan=true) ──────────────
  const handlePointerDown = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    const valid = leftClickPan ? (e.button === 0 || e.button === 1) : e.button === 1;
    if (!valid) return;
    e.preventDefault();
    activePointerRef.current = e.pointerId;
    isPanningRef.current = true;
    setIsPanning(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // sin captura de puntero: el pan se cancela al salir del SVG
    }
  }, [leftClickPan]);

  const handlePointerMove = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    if (!isPanningRef.current) return;
    if (activePointerRef.current !== null && e.pointerId !== activePointerRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setState(prev => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
  }, []);

  const stopPan = useCallback((e?: ReactPointerEvent<SVGSVGElement>) => {
    if (!isPanningRef.current) return;
    if (e && activePointerRef.current !== null) {
      try {
        e.currentTarget.releasePointerCapture(activePointerRef.current);
      } catch {
        // el puntero ya se había liberado
      }
    }
    activePointerRef.current = null;
    isPanningRef.current = false;
    setIsPanning(false);
  }, []);

  // ── Zoom programático ──────────────────────────────────────────────────────
  /** `cx`/`cy` en píxeles relativos a la esquina del SVG. */
  const zoomBy = useCallback((factor: number, cx?: number, cy?: number) => {
    setState(prev => {
      const newZoom = clampZoom(prev.zoom * factor);
      if (newZoom === prev.zoom) return prev;
      if (cx !== undefined && cy !== undefined) {
        const canvasX = (cx - prev.panX) / prev.zoom;
        const canvasY = (cy - prev.panY) / prev.zoom;
        return { panX: cx - canvasX * newZoom, panY: cy - canvasY * newZoom, zoom: newZoom };
      }
      return { ...prev, zoom: newZoom };
    });
  }, []);

  /** Encuadra `bounds` dentro de un viewport de `vw × vh` píxeles. */
  const fitTo = useCallback((bounds: Bounds, vw: number, vh: number, padding = 48) => {
    if (bounds.width <= 0 || bounds.height <= 0 || vw <= 0 || vh <= 0) return;
    const zoom = clampZoom(Math.min(
      (vw - padding * 2) / bounds.width,
      (vh - padding * 2) / bounds.height,
    ));
    setState({
      zoom,
      panX: vw / 2 - (bounds.x + bounds.width / 2) * zoom,
      panY: vh / 2 - (bounds.y + bounds.height / 2) * zoom,
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
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: stopPan,
    handlePointerCancel: stopPan,
    zoomBy,
    fitTo,
    resetView,
    ZOOM_MIN,
    ZOOM_MAX,
    ZOOM_FACTOR,
  };
}
