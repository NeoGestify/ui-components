import {
  forwardRef, useMemo,
  type CSSProperties, type ReactNode,
} from 'react';
import { text } from '../../theme/tokens';
import { motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { toOptions, type OptionsInput } from '../../internal/options';
import { Field, describedBy, useFieldIds } from './Field';

type SliderSize = 'sm' | 'md' | 'lg';

const TRACK_H: Record<SliderSize, string> = {
  sm: '[&::-webkit-slider-runnable-track]:h-1 [&::-moz-range-track]:h-1',
  md: '[&::-webkit-slider-runnable-track]:h-2 [&::-moz-range-track]:h-2',
  lg: '[&::-webkit-slider-runnable-track]:h-3 [&::-moz-range-track]:h-3',
};

const THUMB: Record<SliderSize, string> = {
  sm: '[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:-mt-[0.3125rem] [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5',
  md: '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:-mt-1 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4',
  lg: '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:-mt-1 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5',
};

const ACCENT = 'var(--nui-accent,oklch(51.1% .262 276.966))';
const ACCENT_DARK = 'var(--nui-accent-dark,oklch(58.5% .233 277.117))';
const TRACK = 'var(--nui-border,oklch(87.2% .01 258.338))';

export interface SliderProps extends AnimatableProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /**
   * Se dispara al **soltar**, no en cada píxel. Es el que se quiere para
   * guardar o pedir al servidor: `onChange` llega decenas de veces por gesto.
   */
  onChangeEnd?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: ReactNode;
  error?: string;
  helperText?: string;
  /** Escribe el valor a la derecha de la etiqueta. */
  showValue?: boolean;
  /** Cómo se escribe: unidades, moneda, porcentaje… */
  formatValue?: (value: number) => ReactNode;
  /** Marcas bajo la barra. Solo los valores, o valor y etiqueta. */
  marks?: OptionsInput<number>;
  size?: SliderSize;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

/**
 * Control deslizante.
 *
 * Por dentro es un `<input type="range">` de verdad, no una barra dibujada a
 * mano: eso da gratis el arrastre con el ratón, el gesto táctil, las flechas,
 * RePág y AvPág, Inicio y Fin, y el rol `slider` con su valor anunciado. Lo
 * único propio es la pintura, hecha con los pseudoelementos del control.
 *
 * ```tsx
 * <Slider label="Aforo" min={0} max={500} step={10} showValue value={n} onChange={setN} />
 * ```
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(({
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  min = 0,
  max = 100,
  step = 1,
  label,
  error,
  helperText,
  showValue = false,
  formatValue,
  marks,
  size = 'md',
  disabled = false,
  required = false,
  name,
  id,
  className = '',
  animate,
  'aria-label': ariaLabel,
}, ref) => {
  const ids = useFieldIds(id, 'slider');

  // Sin `value` el control va sin controlar y el valor pintado sale del DOM;
  // el relleno de la barra necesita saberlo igualmente, así que se calcula del
  // valor actual o, en su defecto, del inicial.
  const actual = value ?? defaultValue ?? min;
  const porcentaje = max === min ? 0 : ((actual - min) / (max - min)) * 100;

  const marcas = useMemo(() => (marks ? toOptions<number>(marks) : []), [marks]);

  const relleno: CSSProperties = {
    // Dos paradas en el mismo punto: el degradado se ve como un corte limpio.
    '--nui-slider-fill': `linear-gradient(to right, ${ACCENT} 0%, ${ACCENT} ${porcentaje}%, ${TRACK} ${porcentaje}%, ${TRACK} 100%)`,
    '--nui-slider-fill-dark': `linear-gradient(to right, ${ACCENT_DARK} 0%, ${ACCENT_DARK} ${porcentaje}%, ${TRACK} ${porcentaje}%, ${TRACK} 100%)`,
  } as CSSProperties;

  const valorEscrito = formatValue ? formatValue(actual) : actual;

  return (
    <Field
      label={label}
      htmlFor={ids.id}
      error={error}
      errorId={ids.errorId}
      helperText={helperText}
      helperId={ids.helperId}
      required={required}
      className={className}
      style={motionStyle(animate)}
      labelAside={showValue
        ? <span className={cn('shrink-0 text-sm font-medium tabular-nums', text.base)}>{valorEscrito}</span>
        : undefined}
    >
      <input
        ref={ref}
        id={ids.id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        name={name}
        aria-label={label === undefined ? ariaLabel : undefined}
        aria-describedby={describedBy(ids, error, helperText)}
        aria-invalid={error ? true : undefined}
        onChange={e => onChange?.(Number(e.target.value))}
        // `change` en un range solo llega al soltar en algunos navegadores y en
        // cada paso en otros. `pointerup` y `keyup` son fiables en todos.
        onPointerUp={e => onChangeEnd?.(Number((e.target as HTMLInputElement).value))}
        onKeyUp={e => onChangeEnd?.(Number((e.target as HTMLInputElement).value))}
        style={relleno}
        className={cn(
          'w-full cursor-pointer appearance-none bg-transparent py-2',
          'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          TRACK_H[size], THUMB[size],
          // Pista
          '[&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[image:var(--nui-slider-fill)]',
          'dark:[&::-webkit-slider-runnable-track]:bg-[image:var(--nui-slider-fill-dark)]',
          '[&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[image:var(--nui-slider-fill)]',
          'dark:[&::-moz-range-track]:bg-[image:var(--nui-slider-fill-dark)]',
          // Pulgar
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:shadow-sm',
          '[&::-webkit-slider-thumb]:border-[color:var(--nui-accent,oklch(51.1%_.262_276.966))] dark:[&::-webkit-slider-thumb]:border-[color:var(--nui-accent-dark,oklch(58.5%_.233_277.117))]',
          '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:shadow-sm',
          '[&::-moz-range-thumb]:border-[color:var(--nui-accent,oklch(51.1%_.262_276.966))] dark:[&::-moz-range-thumb]:border-[color:var(--nui-accent-dark,oklch(58.5%_.233_277.117))]',
          // El aro de foco va en el pulgar, que es lo que se está moviendo.
          'focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-[color:var(--nui-ring,oklch(58.5%_.233_277.117))]',
          'focus-visible:[&::-moz-range-thumb]:ring-2 focus-visible:[&::-moz-range-thumb]:ring-[color:var(--nui-ring,oklch(58.5%_.233_277.117))]',
        )}
      />

      {marcas.length > 0 && (
        <div className="relative h-5 select-none" aria-hidden="true">
          {marcas.map(m => {
            const p = max === min ? 0 : ((m.value - min) / (max - min)) * 100;
            return (
              <span
                key={m.value}
                // `translate-x-[-50%]` centra la marca en su punto; sin esto,
                // la del extremo derecho se sale de la caja.
                className={cn('absolute top-0 -translate-x-1/2 whitespace-nowrap text-xs tabular-nums', text.faint)}
                style={{ left: `${p}%` }}
              >
                {m.label}
              </span>
            );
          })}
        </div>
      )}
    </Field>
  );
});

Slider.displayName = 'Slider';
