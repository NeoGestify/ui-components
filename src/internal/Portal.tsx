import { useEffect, useState, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Saca su contenido del árbol del DOM y lo cuelga de `<body>`.
 *
 * Necesario para todo lo que flota: un `overflow: hidden` en cualquier ancestro
 * recortaría el menú, y un `transform` crearía un contexto de apilamiento del
 * que no se puede salir con `z-index`.
 *
 * No pinta nada en el primer render a propósito: en SSR no hay `document`, y
 * renderizar el portal directamente daría un desajuste de hidratación.
 */
export const Portal: FC<{ children: ReactNode; container?: Element | null }> = ({
  children,
  container,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(children, container ?? document.body);
};
