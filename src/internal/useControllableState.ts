import { useCallback, useRef, useState } from 'react';

/**
 * Un estado que funciona igual esté controlado por el consumidor o no.
 *
 * El patrón estaba copiado a mano en `Tabs`, `Accordion` y `Switch`, siempre con
 * la misma forma (`const activo = value ?? interno`) y siempre con el mismo
 * despiste posible: olvidarse de NO tocar el estado interno cuando la prop
 * manda. Aquí se escribe una vez.
 *
 * ```ts
 * const [abierto, setAbierto] = useControllableState({
 *   value: props.open,            // si viene, manda el consumidor
 *   defaultValue: false,
 *   onChange: props.onOpenChange,
 * });
 * ```
 *
 * `setAbierto` acepta valor o función, como `useState`, y siempre avisa por
 * `onChange` — también cuando está controlado, que es justo cuando el consumidor
 * necesita enterarse para actualizar su prop.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T | (() => T);
  onChange?: (value: T) => void;
}): [T, (next: T | ((prev: T) => T)) => void] {
  const [inner, setInner] = useState<T>(defaultValue);

  // Que esté controlado se decide una vez, al montar. Si se mirara en cada
  // render, pasar de `undefined` a un valor (o al revés) cambiaría el modo a
  // mitad de vida y el estado interno quedaría desincronizado sin aviso.
  const controlled = useRef(value !== undefined).current;
  const current = controlled ? (value as T) : inner;

  // `onChange` se lee de una ref para que `set` no cambie de identidad en cada
  // render: es dependencia de casi todos los `useCallback` que lo rodean.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const currentRef = useRef(current);
  currentRef.current = current;

  const set = useCallback((next: T | ((prev: T) => T)) => {
    const resolved = typeof next === 'function'
      ? (next as (prev: T) => T)(currentRef.current)
      : next;

    if (Object.is(resolved, currentRef.current)) return;
    if (!controlled) setInner(resolved);
    onChangeRef.current?.(resolved);
  }, [controlled]);

  return [current, set];
}
