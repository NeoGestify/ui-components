import { useEffect, useState, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { currentTopLayer } from './topLayer';

/**
 * Saca su contenido del árbol del DOM y lo cuelga de `<body>` — o, si hay un
 * modal abierto, de dentro de ese modal.
 *
 * Necesario para todo lo que flota: un `overflow: hidden` en cualquier ancestro
 * recortaría el menú, y un `transform` crearía un contexto de apilamiento del
 * que no se puede salir con `z-index`.
 *
 * Lo del modal no es un capricho. Un `<dialog>` abierto con `showModal()` vive
 * en la *top layer*, por encima de todo el documento y al margen de cualquier
 * `z-index`. Colgando de `<body>`, un `Combobox` abierto dentro de un `Drawer`
 * se pintaba DETRÁS del cajón: la lista existía, respondía al teclado y no se
 * veía. Portalizando dentro del diálogo, la capa comparte su sitio en la top
 * layer y vuelve a verse.
 *
 * No pinta nada en el primer render a propósito: en SSR no hay `document`, y
 * renderizar el portal directamente daría un desajuste de hidratación.
 */
export const Portal: FC<{ children: ReactNode; container?: Element | null }> = ({
  children,
  container,
}) => {
  const [host, setHost] = useState<Element | null>(null);

  useEffect(() => {
    if (container !== undefined) { setHost(container); return; }
    if (typeof document === 'undefined') return;
    setHost(currentTopLayer() ?? document.body);
  }, [container]);

  if (!host) return null;
  return createPortal(children, host);
};
