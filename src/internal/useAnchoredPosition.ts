import { useCallback, useLayoutEffect, useEffect, useState, type RefObject } from 'react';
import { computePosition, type PositionOptions, type PositionResult } from './position';

/** `useLayoutEffect` avisa en SSR; en el servidor no hay nada que medir. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Mantiene un elemento flotante pegado a su anclaje, ya volteado y desplazado
 * para que quepa en pantalla.
 *
 * `floatingEl` es el **elemento**, no una ref, y eso es a propósito. El panel
 * vive dentro de un `<Portal>`, que no pinta nada hasta su propio efecto: en el
 * render en que se abre, una ref todavía valdría `null`. Con una ref el efecto
 * se ejecutaba una vez, no encontraba nodo que medir y no volvía a ejecutarse
 * nunca — el panel se quedaba fuera de la pantalla, en `-9999`. Guardar el nodo
 * en estado da un render cuando por fin existe, y ese render sí lo mide.
 *
 * ```tsx
 * const [panel, setPanel] = useState<HTMLDivElement | null>(null);
 * const pos = useAnchoredPosition(open, anchorRef, panel, { placement: 'bottom' });
 * <div ref={setPanel} style={{ top: pos?.top, left: pos?.left }} />
 * ```
 *
 * Se mide **después** de pintar porque hace falta el tamaño real del flotante
 * para saber si cabe: calcularlo antes obligaría a adivinarlo.
 */
export function useAnchoredPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  floatingEl: HTMLElement | null,
  options: PositionOptions = {},
): PositionResult | null {
  const [pos, setPos] = useState<PositionResult | null>(null);

  const { placement, gap, padding, flip, shift } = options;

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || !floatingEl) return;

    const a = anchor.getBoundingClientRect();
    const f = floatingEl.getBoundingClientRect();

    setPos(computePosition(
      { top: a.top, left: a.left, width: a.width, height: a.height },
      { width: f.width, height: f.height },
      { placement, gap, padding, flip, shift },
    ));
  }, [anchorRef, floatingEl, placement, gap, padding, flip, shift]);

  useIsomorphicLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    update();
  }, [open, update]);

  useEffect(() => {
    if (!open || !floatingEl) return;

    // `true` en la captura: hay que enterarse del scroll de CUALQUIER contenedor
    // con desbordamiento, no solo del de la ventana. Sin eso, un menú dentro de
    // un panel desplazable se queda flotando donde estaba.
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    // El contenido de un flotante puede cambiar de tamaño estando abierto (una
    // lista que se filtra al escribir), y entonces hay que recolocarlo.
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(floatingEl);
      if (anchorRef.current) ro.observe(anchorRef.current);
    }

    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, [open, update, anchorRef, floatingEl]);

  return pos;
}
