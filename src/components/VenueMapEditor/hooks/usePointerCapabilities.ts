import { useState, useEffect } from 'react';

const isBrowser = typeof window !== 'undefined';

/**
 * Detecta si el dispositivo apunta con un puntero **grueso** (dedo) en lugar de
 * uno fino (ratón o lápiz).
 *
 * Se usa para agrandar las zonas de agarre: un handle de 14 px es cómodo con el
 * ratón pero prácticamente imposible de acertar con el dedo, donde la
 * recomendación de accesibilidad son ~44 px.
 *
 * Devuelve `false` en el primer render (y en SSR) para que servidor y cliente
 * coincidan; se corrige en el primer efecto.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    if (!isBrowser || !window.matchMedia) return;
    // `any-pointer` en vez de `pointer`: un portátil con pantalla táctil tiene
    // ratón como puntero primario pero también se usa con el dedo.
    const mq = window.matchMedia('(any-pointer: coarse)');
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return coarse;
}
