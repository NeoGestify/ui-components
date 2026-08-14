import {
  cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState,
  type FC, type ReactElement, type ReactNode,
} from 'react';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { Portal } from '../../internal/Portal';
import { useAnchoredPosition } from '../../internal/useAnchoredPosition';
import type { Placement, Side } from '../../internal/position';

/** Separación entre el disparador y el globo, en píxeles. */
const GAP = 8;

export interface TooltipProps extends AnimatableProps {
  /** Contenido del globo. Si está vacío, el tooltip no aparece. */
  content: ReactNode;
  /** Elemento que lo dispara. Debe aceptar `ref` y props del DOM. */
  children: ReactElement;
  /**
   * Lado preferido. Si no cabe, se voltea al contrario y se desplaza para que
   * no se salga de la pantalla.
   */
  placement?: Placement;
  /** Retardo antes de mostrarlo, en ms. Evita globos al pasar de largo. */
  delay?: number;
  /** Lo desactiva sin tener que quitar el componente. */
  disabled?: boolean;
  /** Ancho máximo del globo. */
  maxWidth?: number;
  className?: string;
}

/** Dirección desde la que entra el globo, según dónde acabe colocado. */
const OFFSET: Record<Side, string> = {
  top: 'translateY(4px)',
  bottom: 'translateY(-4px)',
  left: 'translateX(4px)',
  right: 'translateX(-4px)',
};

/**
 * Globo de ayuda al pasar el ratón o al enfocar con el teclado.
 *
 * En pantallas táctiles no hay «pasar por encima», así que se muestra al
 * mantener pulsado y se oculta al soltar.
 *
 * ```tsx
 * <Tooltip content="Exportar a JSON">
 *   <Button variant="icon"><SaveIcon /></Button>
 * </Tooltip>
 * ```
 *
 * El contenido es texto de apoyo, no un sustituto de una etiqueta accesible:
 * un botón de solo icono necesita igualmente su `aria-label`.
 */
export const Tooltip: FC<TooltipProps> = ({
  content, children, placement = 'top', delay = 150,
  disabled = false, maxWidth = 240, animate, className = '',
}) => {
  const autoId = useId();
  const tipId = `tooltip-${autoId}`;
  const [open, setOpen] = useState(false);
  // `visible` va un frame por detrás de `open`: el globo se monta en su estado
  // inicial y la transición arranca en el frame siguiente.
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Se mide tras pintar, con el tamaño real del globo, y se voltea o desplaza
  // solo si hace falta. Antes se colocaba a ciegas y un tooltip `top` en la
  // primera fila de la página se salía por arriba.
  const pos = useAnchoredPosition(open, triggerRef, tipRef, { placement, gap: GAP });

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const show = useCallback(() => {
    if (disabled || !content) return;
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), delay);
  }, [disabled, content, delay]);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
    setOpen(false);
  }, []);

  // Se espera a tener posición para revelarlo: si no, el primer frame lo pinta
  // en la esquina superior izquierda y se ve saltar hasta su sitio.
  useEffect(() => {
    if (!open || !pos) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open, pos]);

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hide]);

  if (!isValidElement(children)) return children;

  const childProps = children.props as Record<string, unknown>;
  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      const r = (children as unknown as { ref?: unknown }).ref;
      if (typeof r === 'function') r(node);
      else if (r && typeof r === 'object') (r as { current: unknown }).current = node;
    },
    'aria-describedby': open ? tipId : undefined,
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType !== 'touch') show();
      (childProps.onPointerEnter as ((e: PointerEvent) => void) | undefined)?.(e);
    },
    onPointerLeave: (e: PointerEvent) => {
      hide();
      (childProps.onPointerLeave as ((e: PointerEvent) => void) | undefined)?.(e);
    },
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType === 'touch') show(); else hide();
      (childProps.onPointerDown as ((e: PointerEvent) => void) | undefined)?.(e);
    },
    onPointerUp: (e: PointerEvent) => {
      if (e.pointerType === 'touch') hide();
      (childProps.onPointerUp as ((e: PointerEvent) => void) | undefined)?.(e);
    },
    onFocus: (e: FocusEvent) => {
      setOpen(true);
      (childProps.onFocus as ((e: FocusEvent) => void) | undefined)?.(e);
    },
    onBlur: (e: FocusEvent) => {
      hide();
      (childProps.onBlur as ((e: FocusEvent) => void) | undefined)?.(e);
    },
  } as Record<string, unknown>);

  return (
    <>
      {trigger}
      {open && (
        <Portal>
          <div
            ref={tipRef}
            id={tipId}
            role="tooltip"
            style={{
              // Antes de la primera medida se deja fuera de la vista en vez de
              // no renderizarlo: hay que pintarlo para saber cuánto ocupa.
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              transform: visible || !pos ? undefined : OFFSET[pos.side],
              maxWidth,
              ...motionStyle(animate),
            }}
            className={cn(
              'pointer-events-none fixed z-[70] rounded-md px-2 py-1 text-xs font-medium shadow-lg',
              'bg-[var(--nui-scrim,oklch(21%_.034_264.665))] text-white',
              motion.enterFast,
              visible ? 'opacity-100' : 'opacity-0',
              className,
            )}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
};
