import {
  useCallback, useId, useLayoutEffect, useEffect, useMemo, useRef, useState,
  type FC, type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { bg, focusVisibleRing, text, textHover } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';
import { toOptions, type NuiOption, type OptionsInput } from '../../internal/options';

/** `useLayoutEffect` avisa en SSR; en el servidor no hay nada que medir. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** @see NuiOption — es el mismo tipo que usan el resto de selectores. */
export type SegmentedOption = NuiOption;

type SegmentedSize = 'sm' | 'md' | 'lg';

export interface SegmentedControlProps extends AnimatableProps {
  /** Opciones completas o solo sus valores. */
  options: OptionsInput;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: SegmentedSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const SIZE: Record<SegmentedSize, string> = {
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-3 py-1.5 text-sm gap-2',
  lg: 'px-4 py-2 text-base gap-2',
};

/**
 * Selector de pocas opciones excluyentes, todas visibles a la vez.
 *
 * Es un `radiogroup`, no unas pestañas: cambia un **valor**, no la vista. Si lo
 * que cambia es el contenido de la página, usa `Tabs`.
 *
 * ```tsx
 * <SegmentedControl
 *   options={[{ value: 'dia', label: 'Día' }, { value: 'mes', label: 'Mes' }]}
 *   value={rango}
 *   onChange={setRango}
 * />
 * ```
 */
export const SegmentedControl: FC<SegmentedControlProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  size = 'md',
  fullWidth = false,
  disabled = false,
  animate,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const autoId = useId();
  const baseId = `segmented-${autoId}`;
  const opciones = useMemo(() => toOptions(options), [options]);
  const primero = opciones.find(o => !o.disabled)?.value ?? opciones[0]?.value ?? '';

  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? primero,
    onChange,
  });

  const listRef = useRef<HTMLDivElement>(null);
  const [indicador, setIndicador] = useState<{ left: number; width: number } | null>(null);

  // La pastilla se mide del botón activo en vez de pintarse como fondo suyo:
  // así se desliza de una opción a otra en vez de saltar.
  useIsomorphicLayoutEffect(() => {
    const lista = listRef.current;
    if (!lista) return;
    const medir = () => {
      const el = lista.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
      if (!el) { setIndicador(null); return; }
      setIndicador({ left: el.offsetLeft, width: el.offsetWidth });
    };
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(medir);
    ro.observe(lista);
    return () => ro.disconnect();
  }, [selected, options]);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    const teclas = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!teclas.includes(e.key)) return;
    e.preventDefault();

    const botones = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)') ?? [],
    );
    if (!botones.length) return;

    const i = botones.findIndex(b => b === document.activeElement);
    const adelante = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const destino =
      e.key === 'Home' ? botones[0]
        : e.key === 'End' ? botones[botones.length - 1]
          : botones[(i + (adelante ? 1 : -1) + botones.length) % botones.length];

    destino?.focus();
    setSelected(destino.dataset.value!);
  }, [setSelected]);

  return (
    <div
      ref={listRef}
      id={baseId}
      role="radiogroup"
      // Igual que en `RadioGroup`: enfocable por código, no por tabulador.
      tabIndex={-1}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      style={motionStyle(animate)}
      className={cn(
        'relative inline-flex items-center gap-1 rounded-lg p-1',
        bg.surfaceMuted,
        fullWidth && 'flex w-full',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      {indicador && (
        <span
          aria-hidden="true"
          className={cn('absolute top-1 bottom-1 rounded-md shadow-sm', bg.surface, motion.size)}
          style={{ left: indicador.left, width: indicador.width }}
        />
      )}

      {opciones.map(option => {
        const activo = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            data-value={option.value}
            aria-checked={activo}
            disabled={disabled || option.disabled}
            tabIndex={activo ? 0 : -1}
            onClick={() => setSelected(option.value)}
            className={cn(
              // `relative` para quedar por encima de la pastilla, que va detrás.
              'relative inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium',
              motion.colors, focusVisibleRing,
              'disabled:opacity-40 disabled:pointer-events-none touch-manipulation cursor-pointer',
              SIZE[size],
              fullWidth && 'flex-1',
              activo ? text.base : cn(text.subtle, textHover.muted),
            )}
          >
            {option.icon && <span className="shrink-0" aria-hidden="true">{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
