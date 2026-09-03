import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../internal/cn';

/**
 * Barra fina y del color del tema, en los dos motores.
 *
 * `scrollbar-*` de Tailwind v4 cubre Firefox; los pseudoelementos, WebKit. Se
 * escriben los dos porque ninguno funciona en el otro.
 */
const BARRA_FINA = cn(
  '[scrollbar-width:thin]',
  '[scrollbar-color:var(--nui-border,oklch(87.2%_.01_258.338))_transparent]',
  'dark:[scrollbar-color:var(--nui-border-dark,oklch(44.6%_.03_256.802))_transparent]',
  '[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:bg-[var(--nui-border,oklch(87.2%_.01_258.338))]',
  'dark:[&::-webkit-scrollbar-thumb]:bg-[var(--nui-border-dark,oklch(44.6%_.03_256.802))]',
);

/** Se reserva el hueco de la barra para que el contenido no salte al aparecer. */
const BARRA_OCULTA = cn(
  '[scrollbar-width:none]',
  '[&::-webkit-scrollbar]:hidden',
);

export interface ScrollAreaProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  /** Altura máxima antes de desplazar. Acepta cualquier medida CSS. */
  maxHeight?: string | number;
  /** Anchura máxima, para el desplazamiento horizontal. */
  maxWidth?: string | number;
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Oculta la barra sin quitar el desplazamiento (rueda, gesto y teclado). */
  hideScrollbar?: boolean;
  /**
   * Reserva el hueco de la barra siempre. Evita el salto de dos píxeles al
   * pasar de «cabe» a «no cabe» mientras se filtra una lista.
   */
  stableGutter?: boolean;
}

/**
 * Zona desplazable con barra propia.
 *
 * No sustituye la barra por una dibujada en JavaScript: la nativa conserva la
 * rueda del ratón, el gesto táctil, el arrastre y —lo que casi siempre se
 * rompe al reimplementarla— el desplazamiento automático al llegar con el
 * tabulador a algo que está fuera de la vista. Aquí solo se le cambia el
 * aspecto.
 *
 * Ojo con el foco: un contenedor desplazable **sin** nada enfocable dentro no
 * se puede recorrer con el teclado. Si el contenido es solo texto, dale
 * `tabIndex={0}` y un `aria-label`.
 *
 * ```tsx
 * <ScrollArea maxHeight="16rem">{filas}</ScrollArea>
 * ```
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(({
  children,
  maxHeight,
  maxWidth,
  orientation = 'vertical',
  hideScrollbar = false,
  stableGutter = false,
  className = '',
  style,
  ...props
}, ref) => {
  const medidas: CSSProperties = {
    ...(maxHeight === undefined ? {} : { maxHeight }),
    ...(maxWidth === undefined ? {} : { maxWidth }),
    ...style,
  };

  return (
    <div
      ref={ref}
      className={cn(
        orientation === 'vertical' ? 'overflow-y-auto overflow-x-hidden'
          : orientation === 'horizontal' ? 'overflow-x-auto overflow-y-hidden'
            : 'overflow-auto',
        // `overscroll-contain` corta el «scroll chaining»: al llegar al final
        // de la lista, la rueda deja de arrastrar la página de detrás.
        'overscroll-contain',
        stableGutter ? '[scrollbar-gutter:stable]' : '',
        hideScrollbar ? BARRA_OCULTA : BARRA_FINA,
        className,
      )}
      style={Object.keys(medidas).length ? medidas : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

ScrollArea.displayName = 'ScrollArea';
