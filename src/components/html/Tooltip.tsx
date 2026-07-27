import {
  cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState,
  type FC, type ReactElement, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/** Separación entre el disparador y el globo, en píxeles. */
const GAP = 8;

export interface TooltipProps extends AnimatableProps {
  /** Contenido del globo. Si está vacío, el tooltip no aparece. */
  content: ReactNode;
  /** Elemento que lo dispara. Debe aceptar `ref` y props del DOM. */
  children: ReactElement;
  placement?: TooltipPlacement;
  /** Retardo antes de mostrarlo, en ms. Evita globos al pasar de largo. */
  delay?: number;
  /** Lo desactiva sin tener que quitar el componente. */
  disabled?: boolean;
  /** Ancho máximo del globo. */
  maxWidth?: number;
  className?: string;
}

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
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  // Se coloca en coordenadas de ventana (`position: fixed`) y en un portal, para
  // que ningún `overflow: hidden` de un contenedor lo recorte.
  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const map: Record<TooltipPlacement, { top: number; left: number }> = {
      top:    { top: r.top - GAP,        left: r.left + r.width / 2 },
      bottom: { top: r.bottom + GAP,     left: r.left + r.width / 2 },
      left:   { top: r.top + r.height / 2, left: r.left - GAP },
      right:  { top: r.top + r.height / 2, left: r.right + GAP },
    };
    setPos(map[placement]);
  }, [placement]);

  const show = useCallback(() => {
    if (disabled || !content) return;
    clearTimer();
    timerRef.current = setTimeout(() => { place(); setOpen(true); }, delay);
  }, [disabled, content, delay, place]);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => clearTimer, []);

  // Al hacer scroll o redimensionar, el globo dejaría de apuntar al elemento.
  useEffect(() => {
    if (!open) return;
    const onScroll = () => place();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, place, hide]);

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
      place(); setOpen(true);
      (childProps.onFocus as ((e: FocusEvent) => void) | undefined)?.(e);
    },
    onBlur: (e: FocusEvent) => {
      hide();
      (childProps.onBlur as ((e: FocusEvent) => void) | undefined)?.(e);
    },
  } as Record<string, unknown>);

  // El globo entra desplazándose 4 px desde el lado al que apunta.
  const base = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0, -50%)',
  }[placement];
  const offset = {
    top: 'translateY(4px)', bottom: 'translateY(-4px)',
    left: 'translateX(4px)', right: 'translateX(-4px)',
  }[placement];
  const transform = visible ? base : `${base} ${offset}`;

  return (
    <>
      {trigger}
      {open && pos && typeof document !== 'undefined' && createPortal(
        <div
          id={tipId}
          role="tooltip"
          style={{ top: pos.top, left: pos.left, transform, maxWidth, ...motionStyle(animate) }}
          className={[
            'pointer-events-none fixed z-[70] rounded-md px-2 py-1 text-xs font-medium shadow-lg',
            'bg-[var(--nui-scrim,oklch(21%_.034_264.665))] text-white',
            motion.enterFast, visible ? 'opacity-100' : 'opacity-0',
            className,
          ].filter(Boolean).join(' ')}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  );
};
