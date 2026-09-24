import {
  useCallback, useId, useRef,
  type FC, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import { ChevronDownIcon } from '../icons/icons';
import { bg, bgHover, border, focusVisibleRing, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { useControllableState } from '../../internal/useControllableState';
import { cn } from '../../internal/cn';
import { CollapsibleRegion } from './Collapsible';

export interface AccordionItem {
  /**
   * Identificador estable.
   *
   * Si falta se usa el índice, y el índice **no identifica un panel**: en cuanto
   * la lista se reordena o se filtra, el que estaba abierto pasa a ser otro.
   * Dalo siempre que `items` no sea una constante.
   */
  id?: string;
  title: ReactNode;
  content: ReactNode;
  /** Texto pequeño a la derecha del título (contador, estado…). */
  meta?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

type AccordionVariant = 'separated' | 'bordered' | 'plain';

export interface AccordionProps extends AnimatableProps {
  items: AccordionItem[];
  /**
   * `single` (por defecto) cierra el resto al abrir uno; `multiple` deja abrir
   * varios a la vez.
   */
  type?: 'single' | 'multiple';
  /** Paneles abiertos (controlado). */
  value?: string[];
  /** Paneles abiertos al montar. */
  defaultValue?: string[];
  onValueChange?: (open: string[]) => void;
  /** En modo `single`, permite cerrar el que está abierto. Por defecto `true`. */
  collapsible?: boolean;
  variant?: AccordionVariant;
  className?: string;
  id?: string;
}

/**
 * Lista de paneles plegables, accesible con teclado (flechas, Inicio y Fin).
 *
 * ```tsx
 * <Accordion items={[{ title: 'Envíos', content: <p>…</p> }]} />
 * <Accordion type="multiple" defaultValue={['faq-0']} items={preguntas} />
 * ```
 */
export const Accordion: FC<AccordionProps> = ({
  items,
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  variant = 'separated',
  animate,
  className = '',
  id,
}) => {
  const autoId = useId();
  const baseId = id || `accordion-${autoId}`;
  const [open, setOpen] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const listRef = useRef<HTMLDivElement>(null);

  const keyOf = useCallback((item: AccordionItem, i: number) => item.id ?? `${baseId}-${i}`, [baseId]);

  const toggle = useCallback((key: string) => {
    const isOpen = open.includes(key);
    let next: string[];
    if (type === 'multiple') {
      next = isOpen ? open.filter(k => k !== key) : [...open, key];
    } else {
      next = isOpen ? (collapsible ? [] : open) : [key];
    }
    setOpen(next);
  }, [open, type, collapsible, setOpen]);

  /** Patrón de acordeón: las flechas mueven el foco entre cabeceras. */
  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const triggers = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[data-accordion-trigger]:not(:disabled)') ?? [],
    );
    const i = triggers.indexOf(e.currentTarget);
    if (i < 0) return;
    e.preventDefault();
    const target =
      e.key === 'Home' ? triggers[0]
        : e.key === 'End' ? triggers[triggers.length - 1]
          : triggers[(i + (e.key === 'ArrowDown' ? 1 : -1) + triggers.length) % triggers.length];
    target?.focus();
  }, []);

  const wrapper = variant === 'separated'
    ? 'flex flex-col gap-2'
    : variant === 'bordered'
      ? `rounded-xl border ${border.subtle} divide-y divide-[color:var(--nui-border-subtle,oklch(92.8%_.006_264.531))] dark:divide-[color:var(--nui-border-subtle-dark,oklch(37.3%_.034_259.733))] overflow-hidden`
      : `divide-y divide-[color:var(--nui-border-subtle,oklch(92.8%_.006_264.531))] dark:divide-[color:var(--nui-border-subtle-dark,oklch(37.3%_.034_259.733))]`;

  const itemCls = variant === 'separated'
    ? `rounded-xl border ${border.subtle} ${bg.surface} overflow-hidden`
    : '';

  return (
    <div ref={listRef} style={motionStyle(animate)} className={cn(wrapper, className)}>
      {items.map((item, i) => {
        const key = keyOf(item, i);
        const isOpen = open.includes(key);
        const panelId = `${key}-panel`;
        const headerId = `${key}-header`;

        return (
          <div key={key} className={itemCls}>
            <h3>
              <button
                type="button"
                id={headerId}
                data-accordion-trigger
                disabled={item.disabled}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(key)}
                onKeyDown={onKeyDown}
                className={cn(
                  'cursor-pointer', 'flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium',
                  motion.colors,
                  text.base, bgHover.surface, focusVisibleRing,
                  'disabled:opacity-50 disabled:pointer-events-none touch-manipulation',
                )}
              >
                {item.icon && <span className={`shrink-0 ${text.subtle}`} aria-hidden="true">{item.icon}</span>}
                <span className="min-w-0 flex-1">{item.title}</span>
                {item.meta !== undefined && (
                  <span className={`shrink-0 text-xs font-normal ${text.subtle} max-w-[40%] truncate`}>{item.meta}</span>
                )}
                <span className={text.subtle} aria-hidden="true">
                  <ChevronDownIcon
                    className={`h-4 w-4 shrink-0 ${motion.transform} ${isOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>
            </h3>
            {/* El plegado, la animación y el `inert` viven en `Collapsible`;
                aquí solo se decide qué panel está abierto. */}
            <CollapsibleRegion
              id={panelId}
              labelledBy={headerId}
              open={isOpen}
              className={`px-4 pb-4 pt-0 text-sm ${text.muted}`}
            >
              {item.content}
            </CollapsibleRegion>
          </div>
        );
      })}
    </div>
  );
};
