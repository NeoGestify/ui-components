import {
  useCallback, useMemo, useRef,
  type FC, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import { bg, bgHover, border, focusVisibleRing, ringOffset, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';
import { toOptions, type NuiOption, type OptionsInput } from '../../internal/options';
import { Field, describedBy, useFieldIds } from './Field';

/** @see NuiOption — es el mismo tipo que usan el resto de selectores. */
export type ToggleOption = NuiOption;

type ToggleSize = 'sm' | 'md' | 'lg';

const SIZE: Record<ToggleSize, string> = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

const SIZE_ICON: Record<ToggleSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

interface ToggleGroupBase extends AnimatableProps {
  options: OptionsInput;
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  /** En `single`, permite dejar ninguna activa. Por defecto `true`. */
  deselectable?: boolean;
  /** Botones pegados formando una sola pieza, como una barra de herramientas. */
  attached?: boolean;
  /** Solo el icono, con la etiqueta como texto accesible y `title`. */
  iconOnly?: boolean;
  size?: ToggleSize;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

/** Una sola activa, como un grupo de opciones excluyentes. */
export interface ToggleGroupSingleProps extends ToggleGroupBase {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

/** Varias a la vez, cada una un interruptor. */
export interface ToggleGroupMultipleProps extends ToggleGroupBase {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

/**
 * El tipo del valor lo decide `type`, así que `onChange` recibe un `string` o
 * una lista según el modo y TypeScript lo sabe sin castings en el consumidor.
 */
export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

/**
 * Botones que se quedan pulsados.
 *
 * Se parece a `SegmentedControl`, y la diferencia importa al elegir: el
 * segmentado es **un campo** —una fila de opciones excluyentes con su indicador
 * deslizante, pensada para un formulario— y esto es **una barra de
 * herramientas**: admite varias activas a la vez, admite botones de solo icono
 * y se pega a otros controles. Negrita/cursiva/subrayado es esto; «mensual /
 * anual» es un segmentado.
 *
 * ```tsx
 * <ToggleGroup type="multiple" iconOnly attached options={formato} value={f} onChange={setF} />
 * ```
 */
export const ToggleGroup: FC<ToggleGroupProps> = (props) => {
  const {
    options,
    type = 'single',
    value,
    defaultValue,
    onChange,
    label,
    description,
    error,
    deselectable = true,
    attached = false,
    iconOnly = false,
    size = 'md',
    disabled = false,
    required = false,
    name,
    id,
    className = '',
    animate,
    'aria-label': ariaLabel,
  } = props as ToggleGroupBase & {
    type?: 'single' | 'multiple';
    value?: string | string[];
    defaultValue?: string | string[];
    onChange?: (value: string | string[]) => void;
  };
  const ids = useFieldIds(id, 'togglegroup');
  const opciones = useMemo(() => toOptions(options), [options]);
  const listRef = useRef<HTMLDivElement>(null);

  const multiple = type === 'multiple';

  // Por dentro siempre es una lista; hacia fuera se devuelve lo que pide el
  // modo. Trabajar con dos formas distintas dentro del componente era la vía
  // rápida a un `undefined` en cuanto alguien cambiara `type` en caliente.
  const [selected, setSelected] = useControllableState<string[]>({
    value: value === undefined ? undefined : Array.isArray(value) ? value : value === '' ? [] : [value],
    defaultValue: defaultValue === undefined ? [] : Array.isArray(defaultValue) ? defaultValue : [defaultValue],
    onChange: siguiente => {
      onChange?.(multiple ? siguiente : (siguiente[0] ?? ''));
    },
  });

  const alternar = useCallback((v: string) => {
    setSelected(prev => {
      if (multiple) return prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v];
      if (prev.includes(v)) return deselectable ? [] : prev;
      return [v];
    });
  }, [multiple, deselectable, setSelected]);

  /** Barra de herramientas: una parada de tabulación y flechas por dentro. */
  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    const teclas = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!teclas.includes(e.key)) return;
    e.preventDefault();

    const botones = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[data-toggle-item]:not(:disabled)') ?? [],
    );
    if (!botones.length) return;

    const i = botones.findIndex(b => b === document.activeElement);
    const destino =
      e.key === 'Home' ? botones[0]
        : e.key === 'End' ? botones[botones.length - 1]
          : botones[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + botones.length) % botones.length];
    destino?.focus();
  }, []);

  const primerActivable = opciones.findIndex(o => !o.disabled);

  return (
    <Field
      label={label}
      labelId={ids.labelId}
      description={description}
      descriptionId={ids.helperId}
      error={error}
      errorId={ids.errorId}
      required={required}
      className={cn('space-y-2', className)}
      style={motionStyle(animate)}
    >
      <div
        ref={listRef}
        role={multiple ? 'group' : 'radiogroup'}
        tabIndex={-1}
        aria-labelledby={label ? ids.labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={describedBy(ids, error, description)}
        onKeyDown={onKeyDown}
        className={cn(
          'inline-flex flex-wrap',
          attached
            ? `rounded-lg border ${border.base} overflow-hidden divide-x divide-[color:var(--nui-border,oklch(87.2%_.01_258.338))] dark:divide-[color:var(--nui-border-dark,oklch(44.6%_.03_256.802))]`
            : 'gap-1.5',
        )}
      >
        {opciones.map((option, i) => {
          const activo = selected.includes(option.value);
          const apagado = disabled || option.disabled;
          const etiqueta = typeof option.label === 'string' ? option.label : undefined;

          return (
            <button
              key={option.value}
              type="button"
              data-toggle-item
              // En `multiple` cada botón es un interruptor independiente y lo
              // que se anuncia es «pulsado»; en `single` forman un grupo de
              // opciones excluyentes y lo que se anuncia es «seleccionado».
              role={multiple ? undefined : 'radio'}
              aria-pressed={multiple ? activo : undefined}
              aria-checked={multiple ? undefined : activo}
              aria-label={iconOnly ? etiqueta : undefined}
              title={iconOnly ? etiqueta : undefined}
              disabled={apagado}
              tabIndex={activo || (selected.length === 0 && i === primerActivable) ? 0 : -1}
              onClick={() => alternar(option.value)}
              className={cn(
                'inline-flex items-center justify-center font-medium',
                iconOnly ? SIZE_ICON[size] : SIZE[size],
                motion.colors, focusVisibleRing,
                attached ? 'rounded-none' : `rounded-md border ${activo ? border.accent : border.base}`,
                attached ? '' : ringOffset,
                activo
                  ? `${bg.accent} ${text.onAccent}`
                  : `${bg.surface} ${text.muted} ${bgHover.surface}`,
                'disabled:pointer-events-none disabled:opacity-50 touch-manipulation cursor-pointer',
              )}
            >
              {option.icon && <span className="shrink-0" aria-hidden={iconOnly}>{option.icon}</span>}
              {!iconOnly && <span className="truncate">{option.label}</span>}
            </button>
          );
        })}
      </div>

      {name && selected.map(v => <input key={v} type="hidden" name={name} value={v} />)}
    </Field>
  );
};
