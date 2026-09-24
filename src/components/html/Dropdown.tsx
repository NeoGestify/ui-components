import {
  cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState,
  type FC, type KeyboardEvent as ReactKeyboardEvent, type ReactElement, type ReactNode, type Ref,
} from 'react';
import { bg, bgHover, border, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { Portal } from '../../internal/Portal';
import { useAnchoredPosition } from '../../internal/useAnchoredPosition';
import { useControllableState } from '../../internal/useControllableState';
import { useDismiss } from '../../internal/useDismiss';
import { useMergedRefs } from '../../internal/mergeRefs';
import type { Placement, Side } from '../../internal/position';

export interface DropdownItem {
  /** Identificador estable, el que llega a `onSelect`. */
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Atajo de teclado a mostrar a la derecha. Es decorativo: no lo registra. */
  shortcut?: ReactNode;
  disabled?: boolean;
  /** Lo pinta en rojo. Para «Eliminar» y compañía. */
  danger?: boolean;
  /** Separador por encima de este elemento. */
  separatorBefore?: boolean;
  onSelect?: () => void;
}

export interface DropdownProps extends AnimatableProps {
  /** Elemento que abre el menú. Debe aceptar `ref` y props del DOM. */
  trigger: ReactElement;
  items: DropdownItem[];
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Se llama con el `id` del elegido, además de su propio `onSelect`. */
  onSelect?: (id: string) => void;
  gap?: number;
  /** Ancho mínimo del panel. Por defecto, el del disparador. */
  minWidth?: number | 'trigger';
  className?: string;
  'aria-label'?: string;
}

const OFFSET: Record<Side, string> = {
  top: 'translateY(4px)',
  bottom: 'translateY(-4px)',
  left: 'translateX(4px)',
  right: 'translateX(-4px)',
};

/**
 * Menú de acciones anclado a un botón.
 *
 * Teclado completo, que es la mitad del trabajo de un menú: flechas para
 * moverse, Inicio y Fin, Escape para cerrar, Tab para cerrar y seguir, y
 * escritura rápida — teclear «el» salta a «Eliminar».
 *
 * ```tsx
 * <Dropdown
 *   trigger={<Button variant="icon"><MoreIcon /></Button>}
 *   items={[
 *     { id: 'edit', label: 'Editar', icon: <EditIcon /> },
 *     { id: 'del', label: 'Eliminar', danger: true, separatorBefore: true },
 *   ]}
 *   onSelect={id => …}
 * />
 * ```
 *
 * El foco **no** viaja por los elementos con Tab: en un menú solo hay una
 * parada de tabulación y dentro se navega con flechas. Es lo que espera un
 * lector de pantalla al encontrarse un `role="menu"`.
 */
export const Dropdown: FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  gap = 4,
  minWidth = 'trigger',
  animate,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const autoId = useId();
  const menuId = `menu-${autoId}`;
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [visible, setVisible] = useState(false);
  /** Elemento resaltado, por índice dentro de `enabled`. */
  const [active, setActive] = useState(0);

  const anchorRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  // El panel vive en un portal, que no pinta hasta su propio efecto. Guardarlo
  // en estado (y no solo en una ref) es lo que da un render cuando por fin
  // existe, que es el unico momento en que se le puede dar el foco.
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  /** Letras tecleadas seguidas, para la búsqueda rápida. */
  const typed = useRef({ text: '', at: 0 });

  const setPanel = useMergedRefs<HTMLDivElement>(panelRef, setPanelEl);
  // Se une con la que ya traiga el disparador, para no robársela al consumidor.
  const triggerRef = (trigger as unknown as { ref?: Ref<HTMLElement> }).ref;
  const setAnchor = useMergedRefs<HTMLElement>(anchorRef, triggerRef);

  const pos = useAnchoredPosition(open, anchorRef, panelEl, { placement, gap });

  const enabled = items.filter(i => !i.disabled);

  const close = useCallback(() => setOpen(false), [setOpen]);
  useDismiss(open, [anchorRef, panelRef], close);

  useEffect(() => {
    if (!open || !pos) { setVisible(false); return; }
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open, pos]);

  // Al abrir, el foco entra en el primer elemento. Depende de `panelEl` y no de
  // un `requestAnimationFrame`: antes se enfocaba «al frame siguiente» y ese
  // frame llegaba a veces ANTES de que el portal montara los elementos, asi que
  // el foco se quedaba en el boton y el teclado no hacia nada.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current && panelEl) {
      setActive(0);
      itemRefs.current[0]?.focus();
      wasOpen.current = true;
    }
    if (!open && wasOpen.current) {
      anchorRef.current?.focus();
      itemRefs.current = [];
      wasOpen.current = false;
    }
  }, [open, panelEl]);

  useEffect(() => {
    if (open && wasOpen.current) itemRefs.current[active]?.focus();
  }, [active, open]);

  const choose = useCallback((item: DropdownItem) => {
    item.onSelect?.();
    onSelect?.(item.id);
    setOpen(false);
  }, [onSelect, setOpen]);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    const last = enabled.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive(i => (i >= last ? 0 : i + 1));
        return;
      case 'ArrowUp':
        e.preventDefault();
        setActive(i => (i <= 0 ? last : i - 1));
        return;
      case 'Home':
        e.preventDefault();
        setActive(0);
        return;
      case 'End':
        e.preventDefault();
        setActive(last);
        return;
      case 'Tab':
        // Tab cierra en lugar de moverse dentro: el menú es una sola parada.
        close();
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (enabled[active]) choose(enabled[active]);
        return;
    }

    // ── Búsqueda por escritura ────────────────────────────────────────────
    // Solo caracteres imprimibles sueltos; con modificadores son atajos.
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;

    const now = Date.now();
    // Un segundo de pausa empieza una búsqueda nueva, como en un <select>.
    typed.current.text = now - typed.current.at > 1000 ? e.key : typed.current.text + e.key;
    typed.current.at = now;

    const needle = typed.current.text.toLowerCase();
    const found = enabled.findIndex(item =>
      typeof item.label === 'string' && item.label.toLowerCase().startsWith(needle),
    );
    if (found >= 0) setActive(found);
  }, [enabled, active, choose, close]);

  if (!isValidElement(trigger)) return null;

  const triggerProps = trigger.props as Record<string, unknown>;
  const triggerNode = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    ref: setAnchor,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: (e: MouseEvent) => {
      setOpen(prev => !prev);
      (triggerProps.onClick as ((e: MouseEvent) => void) | undefined)?.(e);
    },
    onKeyDown: (e: ReactKeyboardEvent) => {
      // Abrir con flecha abajo es el gesto esperado y evita tener que pulsar
      // Intro y luego bajar.
      if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        setOpen(true);
      }
      (triggerProps.onKeyDown as ((e: ReactKeyboardEvent) => void) | undefined)?.(e);
    },
  } as Record<string, unknown>);

  const width = minWidth === 'trigger'
    ? anchorRef.current?.offsetWidth
    : minWidth;

  // El índice dentro de `enabled` no coincide con el de `items` cuando hay
  // deshabilitados, así que se lleva un contador aparte al pintar.
  let enabledIndex = -1;

  return (
    <>
      {triggerNode}
      {open && (
        <Portal>
          <div
            ref={setPanel}
            id={menuId}
            role="menu"
            // El foco vive en los elementos, no aquí, pero un `role` interactivo
            // tiene que ser enfocable: `-1` lo hace alcanzable por código sin
            // añadir una parada de tabulación.
            tabIndex={-1}
            aria-label={ariaLabel}
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            style={{
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              minWidth: width,
              transform: visible || !pos ? undefined : OFFSET[pos.side],
              ...motionStyle(animate),
            }}
            className={cn(
              'fixed z-[60] overflow-hidden rounded-lg border py-1 shadow-xl',
              bg.surface, border.subtle,
              motion.enterFast,
              visible ? 'opacity-100' : 'opacity-0',
              className,
            )}
          >
            {items.map(item => {
              if (!item.disabled) enabledIndex++;
              const index = enabledIndex;
              return (
                <div key={item.id}>
                  {item.separatorBefore && (
                    <div className={cn('my-1 border-t', border.subtle)} aria-hidden="true" />
                  )}
                  <button
                    ref={el => {
                      if (!item.disabled) itemRefs.current[index] = el;
                    }}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    tabIndex={-1}
                    onClick={() => choose(item)}
                    onPointerEnter={() => { if (!item.disabled) setActive(index); }}
                    className={cn(
                      'cursor-pointer', 'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm',
                      motion.colors,
                      'disabled:opacity-40 disabled:pointer-events-none focus:outline-none',
                      item.danger ? text.danger : text.muted,
                      bgHover.surface,
                      // El resaltado va por estado propio y no por `:focus`,
                      // para que el ratón y el teclado lo pinten igual.
                      !item.disabled && index === active && bg.surfaceHover,
                    )}
                  >
                    {item.icon && <span className="shrink-0" aria-hidden="true">{item.icon}</span>}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.shortcut !== undefined && (
                      <span className={cn('shrink-0 text-xs tabular-nums', text.faint)}>
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </Portal>
      )}
    </>
  );
};
