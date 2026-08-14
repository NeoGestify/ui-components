import { useCallback, useLayoutEffect, useEffect, useState, type RefObject } from 'react';
import { computePosition, type PositionOptions, type PositionResult } from './position';

/** `useLayoutEffect` avisa en SSR; en el servidor no hay nada que medir. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Mantiene un elemento flotante pegado a su anclaje, ya volteado y desplazado
 * para que quepa en pantalla.
 *
 * Se mide **después** de pintar (`useLayoutEffect`) porque hace falta el tamaño
 * real del flotante para saber si cabe: calcularlo antes obligaría a adivinarlo.
 * El primer frame se pinta con `null`, que el llamante usa para dejarlo oculto.
 */
export function useAnchoredPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  options: PositionOptions = {},
): PositionResult | null {
  const [pos, setPos] = useState<PositionResult | null>(null);

  const { placement, gap, padding, flip, shift } = options;

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!anchor || !floating) return;

    const a = anchor.getBoundingClientRect();
    const f = floating.getBoundingClientRect();

    setPos(computePosition(
      { top: a.top, left: a.left, width: a.width, height: a.height },
      { width: f.width, height: f.height },
      { placement, gap, padding, flip, shift },
    ));
  }, [anchorRef, floatingRef, placement, gap, padding, flip, shift]);

  useIsomorphicLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    update();
  }, [open, update]);

  useEffect(() => {
    if (!open) return;

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
      if (floatingRef.current) ro.observe(floatingRef.current);
      if (anchorRef.current) ro.observe(anchorRef.current);
    }

    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, [open, update, anchorRef, floatingRef]);

  return pos;
}
