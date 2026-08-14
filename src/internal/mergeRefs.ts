import { useCallback } from 'react';
import type { MutableRefObject, Ref } from 'react';

function assign<T>(ref: Ref<T> | undefined | null, node: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') ref(node);
  else (ref as MutableRefObject<T | null>).current = node;
}

/**
 * Une varias `ref` en una sola función.
 *
 * Hace falta cuando un componente reenvía la `ref` al consumidor pero además
 * necesita el nodo para su propia lógica (enfocarlo, medirlo, vaciarlo). Sin
 * esto hay que elegir: o la usa el consumidor o la usa el componente.
 *
 * **Úsala solo fuera del render.** Dentro de un componente va `useMergedRefs`:
 * ver ahí por qué.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>): (node: T | null) => void {
  return (node: T | null) => {
    for (const ref of refs) assign(ref, node);
  };
}

/**
 * `mergeRefs` con identidad estable.
 *
 * React compara la función que le pasas en `ref` entre renders: si cambia, la
 * llama con `null` y luego con el nodo otra vez. Con `mergeRefs()` a secas —que
 * devuelve una función nueva cada vez— eso pasa en **cada render**, y si una de
 * las refs unidas es un `setState`, el ciclo se cierra sobre sí mismo:
 *
 * ```
 * render → ref nueva → React reconecta → setState(null) → setState(nodo)
 *        → render → …
 * ```
 *
 * Que es exactamente lo que dejaba a `Popover` y `Dropdown` renderizando sin
 * parar y con el panel congelado en `opacity-0`: la animación de entrada se
 * cancelaba en cada vuelta y nunca llegaba a revelarse.
 */
export function useMergedRefs<T>(...refs: Array<Ref<T> | undefined | null>): (node: T | null) => void {
  return useCallback(
    (node: T | null) => { for (const ref of refs) assign(ref, node); },
    // Las refs se comparan una a una: `refs` es un array nuevo en cada render,
    // pero su contenido (objetos ref y setters de estado) sí es estable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}
