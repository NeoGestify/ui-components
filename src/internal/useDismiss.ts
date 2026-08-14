import { useEffect, useRef, type RefObject } from 'react';

/**
 * Cierra una capa flotante al pulsar fuera o al pulsar Escape.
 *
 * Escucha `pointerdown` y no `click` por dos motivos que se notan al usarlo:
 * el cierre ocurre al empezar el gesto (se siente inmediato), y no se dispara
 * cuando alguien empieza a arrastrar dentro del panel y suelta fuera.
 */
export function useDismiss(
  open: boolean,
  refs: Array<RefObject<HTMLElement | null>>,
  onDismiss: () => void,
  options: { escape?: boolean; outside?: boolean } = {},
): void {
  const { escape = true, outside = true } = options;

  // `refs` y `onDismiss` llegan casi siempre como literales nuevos en cada
  // render. Si fueran dependencias del efecto, este se desmontaría y volvería a
  // montarse constantemente — y con `pointerdown` en captura eso significa
  // perder el evento justo entre medias. Se leen de una ref.
  const refsRef = useRef(refs);
  refsRef.current = refs;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!outside) return;
      const target = e.target as Node | null;
      if (!target) return;
      // `contains` sobre cada zona viva: el anclaje cuenta como «dentro» para
      // que pulsar el disparador no cierre y vuelva a abrir en el mismo gesto.
      for (const ref of refsRef.current) {
        if (ref.current?.contains(target)) return;
      }
      onDismissRef.current();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!escape || e.key !== 'Escape') return;
      // Se detiene la propagación para que un menú dentro de un modal se lleve
      // el Escape sin cerrar además el modal que lo contiene.
      e.stopPropagation();
      onDismissRef.current();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, escape, outside]);
}
