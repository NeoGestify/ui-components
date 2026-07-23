import { useState, useEffect, useLayoutEffect } from 'react';
import type { RefObject } from 'react';

/** Ancho (px) por debajo del cual el editor usa su disposición compacta. */
export const COMPACT_WIDTH = 640;
/** Ancho por debajo del cual además se recortan los adornos de la barra. */
export const TIGHT_WIDTH = 420;
/** Alto por debajo del cual el panel inferior debe encogerse. */
export const SHORT_HEIGHT = 420;

export interface ContainerSize {
  width: number;
  height: number;
  /** Disposición compacta: el panel de propiedades pasa a ser una hoja inferior. */
  compact: boolean;
  /** Muy estrecho: se ocultan etiquetas y separadores no imprescindibles. */
  tight: boolean;
  /** Poca altura disponible. */
  short: boolean;
}

const isBrowser = typeof window !== 'undefined';

// La medición debe ocurrir ANTES del pintado: con `useEffect` (posterior) se
// vería un parpadeo del layout ancho antes de colapsar al compacto en móvil.
// `useLayoutEffect` no existe en SSR, de ahí la variante isomórfica.
const useIsoLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

/**
 * Mide el **contenedor del propio editor**, no el viewport.
 *
 * Es deliberado: como componente embebible, el editor puede vivir en una barra
 * lateral de 300 px dentro de una pantalla de 1920 px. Las variantes `sm:`/`md:`
 * de Tailwind miran el viewport y en ese caso aplicarían la disposición de
 * escritorio a un hueco diminuto. Con `ResizeObserver` la disposición responde
 * al espacio realmente disponible.
 *
 * Devuelve `0` en el primer render (y en SSR); se corrige tras el primer layout.
 */
export function useContainerSize(ref: RefObject<HTMLElement | null>): ContainerSize {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useIsoLayoutEffect(() => {
    const node = ref.current;
    if (!node || !isBrowser) return;

    const read = () => {
      const rect = node.getBoundingClientRect();
      setSize(prev =>
        // Se evita re-renderizar por diferencias sub-pixel del layout.
        Math.abs(prev.width - rect.width) < 1 && Math.abs(prev.height - rect.height) < 1
          ? prev
          : { width: rect.width, height: rect.height },
      );
    };

    read();

    if (typeof ResizeObserver === 'undefined') {
      // Navegador sin ResizeObserver: al menos se reacciona al giro/resize.
      window.addEventListener('resize', read);
      return () => window.removeEventListener('resize', read);
    }

    const ro = new ResizeObserver(read);
    ro.observe(node);
    return () => ro.disconnect();
  }, [ref]);

  return {
    width: size.width,
    height: size.height,
    // Antes de la primera medición (width 0) se asume la disposición ancha, que
    // es la que ya existía: así nada "salta" en el caso habitual de escritorio.
    compact: size.width > 0 && size.width < COMPACT_WIDTH,
    tight: size.width > 0 && size.width < TIGHT_WIDTH,
    short: size.height > 0 && size.height < SHORT_HEIGHT,
  };
}
