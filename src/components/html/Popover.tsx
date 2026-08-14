import {
  cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState,
  type FC, type ReactElement, type ReactNode, type Ref,
} from 'react';
import { bg, border, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { Portal } from '../../internal/Portal';
import { useAnchoredPosition } from '../../internal/useAnchoredPosition';
import { useControllableState } from '../../internal/useControllableState';
import { useDismiss } from '../../internal/useDismiss';
import { useMergedRefs } from '../../internal/mergeRefs';
import type { Placement, Side } from '../../internal/position';

export interface PopoverProps extends AnimatableProps {
  /** Elemento que lo abre. Debe aceptar `ref` y props del DOM. */
  trigger: ReactElement;
  children: ReactNode;
  /** Lado preferido. Si no cabe, se voltea. */
  placement?: Placement;
  /** Abierto (controlado). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Separación con el disparador, en píxeles. */
  gap?: number;
  /** Cierra al pulsar fuera. Por defecto `true`. */
  closeOnOutside?: boolean;
  /** Cierra con Escape. Por defecto `true`. */
  closeOnEsc?: boolean;
  /** Clases del panel. */
  className?: string;
  /** Sin el relleno ni el fondo por defecto, para pintarlo entero tú. */
  unstyled?: boolean;
}

const OFFSET: Record<Side, string> = {
  top: 'translateY(4px)',
  bottom: 'translateY(-4px)',
  left: 'translateX(4px)',
  right: 'translateX(-4px)',
};

/**
 * Capa flotante anclada a un disparador, con volteo, clic fuera y Escape.
 *
 * Es la base de `Dropdown` y de cualquier panel que tenga que salirse de su
 * contenedor. A diferencia de `Tooltip`, se abre al pulsar y **admite el foco
 * dentro**: puede llevar campos, botones o una lista.
 *
 * ```tsx
 * <Popover trigger={<Button>Filtros</Button>} placement="bottom-start">
 *   <Form>…</Form>
 * </Popover>
 * ```
 */
export const Popover: FC<PopoverProps> = ({
  trigger,
  children,
  placement = 'bottom',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  gap = 8,
  closeOnOutside = true,
  closeOnEsc = true,
  animate,
  className = '',
  unstyled = false,
}) => {
  const autoId = useId();
  const panelId = `popover-${autoId}`;
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [visible, setVisible] = useState(false);

  const anchorRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  // En estado además de en la ref: el portal no monta hasta el render siguiente
  // y el colocador necesita enterarse de cuándo aparece el nodo.
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);

  const setPanel = useMergedRefs<HTMLDivElement>(panelRef, setPanelEl);
  // Se une con la que ya traiga el disparador, para no robársela al consumidor.
  const triggerRef = (trigger as unknown as { ref?: Ref<HTMLElement> }).ref;
  const setAnchor = useMergedRefs<HTMLElement>(anchorRef, triggerRef);

  const pos = useAnchoredPosition(open, anchorRef, panelEl, { placement, gap });

  const close = useCallback(() => setOpen(false), [setOpen]);
  useDismiss(open, [anchorRef, panelRef], close, {
    outside: closeOnOutside,
    escape: closeOnEsc,
  });

  useEffect(() => {
    if (!open || !pos) { setVisible(false); return; }
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open, pos]);

  // Al cerrar se devuelve el foco al disparador. El navegador solo hace esto
  // solo con `<dialog>`; aquí hay que pedirlo, o el foco se queda en el `<body>`
  // y el siguiente tabulador empieza desde el principio de la página.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) anchorRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  if (!isValidElement(trigger)) return null;

  const triggerProps = trigger.props as Record<string, unknown>;
  const triggerNode = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    ref: setAnchor,
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': open ? panelId : undefined,
    onClick: (e: MouseEvent) => {
      setOpen(prev => !prev);
      (triggerProps.onClick as ((e: MouseEvent) => void) | undefined)?.(e);
    },
  } as Record<string, unknown>);

  return (
    <>
      {triggerNode}
      {open && (
        <Portal>
          <div
            ref={setPanel}
            id={panelId}
            role="dialog"
            style={{
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              transform: visible || !pos ? undefined : OFFSET[pos.side],
              ...motionStyle(animate),
            }}
            className={cn(
              'fixed z-[60] rounded-lg shadow-xl',
              !unstyled && ['border p-4', bg.surface, border.subtle, text.base],
              motion.enterFast,
              visible ? 'opacity-100' : 'opacity-0',
              className,
            )}
          >
            {children}
          </div>
        </Portal>
      )}
    </>
  );
};
