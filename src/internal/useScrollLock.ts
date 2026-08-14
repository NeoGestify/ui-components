import { useEffect } from 'react';

/**
 * Bloquea el desplazamiento de la página mientras haya algo abierto encima.
 *
 * Lleva **contador** a propósito. La versión anterior vivía dentro de `Modal` y
 * guardaba el `overflow` anterior en una variable local:
 *
 * ```ts
 * const previous = document.body.style.overflow;   // 'hidden' si ya había otro
 * document.body.style.overflow = 'hidden';
 * return () => { document.body.style.overflow = previous; };
 * ```
 *
 * Con dos capas encimadas —un modal que abre un diálogo de confirmación— la
 * segunda leía `'hidden'` como valor «anterior» y, al cerrarse, lo restauraba.
 * Resultado: se cerraba todo y la página se quedaba sin poder desplazarse.
 *
 * Con un contador de módulo, el valor original solo se guarda cuando se pasa de
 * cero a uno, y solo se restaura cuando se vuelve a cero.
 */

let locks = 0;
let previousOverflow = '';
let previousPaddingRight = '';

/** Ancho de la barra de desplazamiento, para compensar el salto al ocultarla. */
function scrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {};

  if (locks === 0) {
    const { body } = document;
    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;

    // Al ocultar la barra, el contenido se ensancha de golpe y la página «da un
    // salto» lateral. Se compensa con el hueco que dejaba la barra.
    const gap = scrollbarWidth();
    if (gap > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + gap}px`;
    }
    body.style.overflow = 'hidden';
  }

  locks++;

  let released = false;
  return () => {
    // Los efectos de React pueden limpiarse dos veces en StrictMode; sin esta
    // guarda el contador bajaría de más y desbloquearía con un modal abierto.
    if (released) return;
    released = true;
    locks--;
    if (locks === 0) {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    }
  };
}

/** Versión en hook: bloquea mientras `enabled` sea cierto. */
export function useScrollLock(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    return lockScroll();
  }, [enabled]);
}
