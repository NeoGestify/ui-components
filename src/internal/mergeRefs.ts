import type { MutableRefObject, Ref } from 'react';

/**
 * Une varias `ref` en una sola función.
 *
 * Hace falta cuando un componente reenvía la `ref` al consumidor pero además
 * necesita el nodo para su propia lógica (enfocarlo, medirlo, vaciarlo). Sin
 * esto hay que elegir: o la usa el consumidor o la usa el componente.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>): (node: T | null) => void {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else (ref as MutableRefObject<T | null>).current = node;
    }
  };
}
