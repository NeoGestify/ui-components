import { useRef, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import type { PanZoomState } from './usePanZoom';

/** A ref whose current value is always a live PanZoomState (never null). */
type PanZoomRef = { current: PanZoomState };

export interface DragCallbacks {
  onDragStart?: (canvasX: number, canvasY: number) => void;
  onDragMove: (dx: number, dy: number, canvasX: number, canvasY: number) => void;
  /** `moved` es `false` cuando el gesto fue un clic sin desplazamiento real. */
  onDragEnd?: (canvasX: number, canvasY: number, moved: boolean) => void;
}

/** Umbral (px de pantalla) a partir del cual un gesto cuenta como arrastre. */
const DRAG_THRESHOLD_PX = 3;

/**
 * Hook de arrastre para el lienzo SVG.
 *
 * Convierte clientX/Y en coordenadas de lienzo aplicando el pan/zoom actual y
 * emite `onDragMove` con el delta desde el último frame.
 *
 * Usa Pointer Events con captura, de modo que el gesto sigue vivo aunque el
 * cursor salga del SVG o de la ventana — y funciona igual con ratón, dedo y
 * lápiz. Los movimientos se agrupan por frame con `requestAnimationFrame`
 * para no re-renderizar más veces de las que pinta el navegador.
 */
export function useDrag(
  svgRef: RefObject<SVGSVGElement | null>,
  panZoomRef: PanZoomRef,
  callbacks: DragCallbacks,
) {
  // Keep callbacks in a ref so listeners always call the latest version.
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  const lastCanvas = useRef({ x: 0, y: 0 });
  const startClient = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

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

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent) => {
      // Solo botón principal / toque / lápiz. El botón central se reserva al pan.
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      const pointerId = e.pointerId;
      const canvas = toCanvas(e.clientX, e.clientY);
      lastCanvas.current = canvas;
      startClient.current = { x: e.clientX, y: e.clientY };
      movedRef.current = false;
      cbRef.current.onDragStart?.(canvas.x, canvas.y);

      const flush = () => {
        rafRef.current = null;
        const p = pendingRef.current;
        if (!p) return;
        pendingRef.current = null;
        const c = toCanvas(p.x, p.y);
        const dx = c.x - lastCanvas.current.x;
        const dy = c.y - lastCanvas.current.y;
        lastCanvas.current = c;
        cbRef.current.onDragMove(dx, dy, c.x, c.y);
      };

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        if (!movedRef.current) {
          const dist = Math.hypot(
            ev.clientX - startClient.current.x,
            ev.clientY - startClient.current.y,
          );
          if (dist < DRAG_THRESHOLD_PX) return;
          movedRef.current = true;
        }
        pendingRef.current = { x: ev.clientX, y: ev.clientY };
        if (rafRef.current === null) rafRef.current = requestAnimationFrame(flush);
      };

      const cleanup = () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        pendingRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      function onUp(ev: PointerEvent) {
        if (ev.pointerId !== pointerId) return;
        // Aplica el último movimiento pendiente antes de cerrar el gesto.
        if (pendingRef.current) flush();
        cleanup();
        const c = toCanvas(ev.clientX, ev.clientY);
        cbRef.current.onDragEnd?.(c.x, c.y, movedRef.current);
      }

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [toCanvas],
  );

  return { handlePointerDown };
}
