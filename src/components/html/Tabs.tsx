import {
  useCallback, useEffect, useId, useLayoutEffect, useRef, useState,
  type FC, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import { bg, bgHover, border, focusVisibleRing, text, textHover } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { useControllableState } from '../../internal/useControllableState';
import { cn } from '../../internal/cn';

export interface TabItem {
  /** Identificador estable, el que viaja en `value`/`onChange`. */
  id: string;
  label: ReactNode;
  content?: ReactNode;
  icon?: ReactNode;
  /** Contador o etiqueta a la derecha del texto. */
  badge?: ReactNode;
  disabled?: boolean;
}

type TabsVariant = 'line' | 'pill' | 'enclosed';
type TabsSize = 'sm' | 'md' | 'lg';

/** `useLayoutEffect` avisa en SSR; en el servidor no hay nada que medir. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const SIZE: Record<TabsSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-3 py-2 text-sm gap-2',
  lg: 'px-4 py-2.5 text-base gap-2',
};

export interface TabsProps extends AnimatableProps {
  items: TabItem[];
  /** Pestaña activa (controlado). */
  value?: string;
  /** Pestaña activa inicial. Por defecto, la primera que no esté deshabilitada. */
  defaultValue?: string;
  onChange?: (id: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  /** Reparte las pestañas a lo ancho en partes iguales. */
  fullWidth?: boolean;
  /**
   * Con `automatic` (por defecto) las flechas cambian de pestaña; con `manual`
   * solo mueven el foco y hay que pulsar Intro o Espacio.
   */
  activation?: 'automatic' | 'manual';
  className?: string;
  /** Clases del contenedor del panel. */
  panelClassName?: string;
  id?: string;
  'aria-label'?: string;
}

/**
 * Pestañas accesibles con el patrón `tablist` completo: tabulador itinerante,
 * navegación con flechas, Inicio y Fin.
 *
 * ```tsx
 * <Tabs items={[{ id: 'datos', label: 'Datos', content: <Form/> }]} />
 * ```
 *
 * Si no pasas `content`, el componente solo pinta la barra: el panel lo
 * renderizas tú a partir de `onChange`.
 */
export const Tabs: FC<TabsProps> = ({
  items,
  value,
  defaultValue,
  onChange,
  variant = 'line',
  size = 'md',
  fullWidth = false,
  activation = 'automatic',
  animate,
  className = '',
  panelClassName = '',
  id,
  'aria-label': ariaLabel,
}) => {
  const autoId = useId();
  const baseId = id || `tabs-${autoId}`;
  const first = items.find(i => !i.disabled)?.id ?? items[0]?.id ?? '';
  const [active, setActive] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? first,
    onChange,
  });
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // El subrayado se mide del botón activo en vez de pintarse como borde suyo:
  // así puede deslizarse de una pestaña a otra en vez de saltar.
  useIsomorphicLayoutEffect(() => {
    if (variant !== 'line') return;
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const el = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!el) { setIndicator(null); return; }
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [variant, active, items]);

  const select = useCallback((tabId: string) => setActive(tabId), [setActive]);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const nav = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (e.key === 'Enter' || e.key === ' ') {
      // En modo manual el foco ya está donde toca; solo falta confirmar.
      if (activation === 'manual') {
        e.preventDefault();
        select(e.currentTarget.dataset.tabId!);
      }
      return;
    }
    if (!nav.includes(e.key)) return;
    e.preventDefault();
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [],
    );
    const i = buttons.indexOf(e.currentTarget);
    const next =
      e.key === 'Home' ? buttons[0]
        : e.key === 'End' ? buttons[buttons.length - 1]
          : buttons[(i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length];
    next?.focus();
    if (activation === 'automatic' && next) select(next.dataset.tabId!);
  }, [activation, select]);

  const listCls = {
    line: `flex items-end gap-1 border-b ${border.subtle} overflow-x-auto`,
    pill: `inline-flex items-center gap-1 rounded-lg p-1 ${bg.surfaceMuted} overflow-x-auto`,
    enclosed: `flex items-end gap-1 border-b ${border.subtle} overflow-x-auto`,
  }[variant];

  const tabCls = (isActive: boolean) => {
    const base = [
      'inline-flex items-center justify-center font-medium whitespace-nowrap',
      motion.colors,
      'disabled:opacity-40 disabled:pointer-events-none touch-manipulation',
      SIZE[size], focusVisibleRing,
      fullWidth ? 'flex-1' : '',
    ];
    if (variant === 'pill') {
      base.push('rounded-md', isActive
        ? `${bg.surface} ${text.base} shadow-sm`
        : `${text.subtle} ${textHover.muted}`);
    } else if (variant === 'enclosed') {
      base.push('rounded-t-lg -mb-px border', isActive
        ? `${bg.surface} ${border.subtle} border-b-transparent ${text.base}`
        : `border-transparent ${text.subtle} ${textHover.muted} ${bgHover.surface}`);
    } else {
      base.push('rounded-t-md', isActive ? text.accent : `${text.subtle} ${textHover.muted}`);
    }
    return base.filter(Boolean).join(' ');
  };

  const activeItem = items.find(i => i.id === active);

  return (
    // `min-w-0`: la barra de pestañas no envuelve, así que su ancho mínimo
    // intrínseco es el de todas las pestañas juntas. Sin esto, al colocar
    // `Tabs` dentro de una rejilla o un flex, la columna crece hasta ese ancho
    // y desborda la página en móvil en vez de dejar que la barra se desplace.
    <div className={cn('min-w-0', className)} style={motionStyle(animate)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        className={`relative ${listCls} ${fullWidth ? 'w-full' : ''}`}
      >
        {items.map(item => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              data-tab-id={item.id}
              aria-selected={isActive}
              // Solo se pinta el panel de la pestaña activa, así que apuntar
              // desde las demás dejaba dos `aria-controls` colgando de un `id`
              // que no existe en el documento.
              aria-controls={isActive && item.content !== undefined ? `${baseId}-panel-${item.id}` : undefined}
              // Solo la pestaña activa entra en el orden de tabulación.
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.id)}
              onKeyDown={onKeyDown}
              className={tabCls(isActive)}
            >
              {item.icon && <span className="shrink-0" aria-hidden="true">{item.icon}</span>}
              {item.label}
              {item.badge !== undefined && <span className="shrink-0">{item.badge}</span>}
            </button>
          );
        })}

        {variant === 'line' && indicator && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-0 h-0.5 rounded-full ${bg.accent} ${motion.size}`}
            style={{ left: indicator.left, width: indicator.width }}
          />
        )}
      </div>

      {activeItem?.content !== undefined && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.id}`}
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          tabIndex={0}
          className={`pt-4 focus:outline-none ${panelClassName}`}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
};
