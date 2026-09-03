import {
  forwardRef, useCallback, useEffect, useRef, useState,
  type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import { AddIcon, MinusIcon } from '../icons/icons';
import {
  bg, border, focusBorder, focusRingOf, placeholder, text,
} from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useMergedRefs } from '../../internal/mergeRefs';
import { useControllableState } from '../../internal/useControllableState';
import { useMessage } from '../../context/config/NuiConfigProvider';
import { Field, describedBy, useFieldIds } from './Field';

type NumberInputSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<NumberInputSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

const SIZE_BTN: Record<NumberInputSize, string> = {
  sm: 'w-7 text-xs',
  md: 'w-8 text-sm',
  lg: 'w-10 text-base',
};

const SIZE_ICON: Record<NumberInputSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

/** Decimales que implica un paso: `0.25` → 2, `1` → 0. */
export function decimalsOf(step: number): number {
  if (!Number.isFinite(step)) return 0;
  const s = String(step);
  if (s.includes('e-')) return Number(s.split('e-')[1]);
  return s.includes('.') ? s.split('.')[1].length : 0;
}

/**
 * Convierte lo escrito en número, o `null` si no lo es.
 *
 * Acepta la coma como separador decimal: en un teclado español es la tecla que
 * cae debajo del dedo, y `Number(',5')` es `NaN`. También acepta los espacios
 * de miles que dejan al pegar desde una hoja de cálculo.
 */
export function parseNumber(raw: string): number | null {
  const limpio = raw.trim().replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  if (limpio === '' || limpio === '-' || limpio === '.' || limpio === '-.') return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

/** Ajusta a los límites y a la rejilla del paso, sin arrastrar error binario. */
export function clampToStep(
  n: number,
  { min, max, step, base }: { min?: number; max?: number; step: number; base: number },
): number {
  const decimales = decimalsOf(step);
  const pasos = Math.round((n - base) / step);
  let v = Number((base + pasos * step).toFixed(decimales));
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return Number(v.toFixed(decimales));
}

export interface NumberInputProps extends AnimatableProps {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Salto de las flechas y de los botones. Por defecto `1`. */
  step?: number;
  /** Salto de RePág y AvPág. Por defecto, diez veces `step`. */
  largeStep?: number;
  label?: ReactNode;
  error?: string;
  helperText?: string;
  placeholder?: string;
  /** Contenido pegado al borde izquierdo: una moneda, una unidad. */
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: NumberInputSize;
  /** Oculta los botones de más y menos. */
  controls?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  /** Cómo se escribe el número al salir del campo. */
  format?: (value: number) => string;
  'aria-label'?: string;
}

/**
 * Campo numérico.
 *
 * No es un `<input type="number">`: ese arrastra dos problemas que en un
 * formulario de gestión se notan enseguida. La rueda del ratón cambia el valor
 * al pasar por encima —se corrigen cantidades sin querer con solo desplazar la
 * página— y acepta `e`, `+` y `-` en cualquier posición, así que `1e5` es
 * «válido» hasta que alguien lo lee. Aquí el campo es de texto y el número lo
 * valida el componente, con el rol `spinbutton` que es el que anuncia a un
 * lector de pantalla el valor, el mínimo y el máximo.
 *
 * ```tsx
 * <NumberInput label="Cantidad" min={1} max={99} value={n} onChange={setN} />
 * <NumberInput label="Precio" step={0.01} prefix="€" value={p} onChange={setP} />
 * ```
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(({
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  step = 1,
  largeStep,
  label,
  error,
  helperText,
  placeholder: placeholderText,
  prefix,
  suffix,
  size = 'md',
  controls = true,
  disabled = false,
  readOnly = false,
  required = false,
  name,
  id,
  className = '',
  format,
  animate,
  'aria-label': ariaLabel,
}, ref) => {
  const ids = useFieldIds(id, 'number');
  const masLabel = useMessage('increment');
  const menosLabel = useMessage('decrement');

  const [num, setNum] = useControllableState<number | null>({
    value,
    defaultValue,
    onChange,
  });

  const escribir = useCallback(
    (n: number | null) => (n === null ? '' : (format ? format(n) : String(n))),
    [format],
  );

  // Lo que se ve mientras se escribe es texto, no el número: si se recalculara
  // desde `num` en cada tecla, un «-» o un «1,» a medias desaparecerían de
  // golpe y no habría manera de teclear un negativo ni un decimal.
  const [texto, setTexto] = useState(() => escribir(num));
  const editando = useRef(false);

  useEffect(() => {
    if (!editando.current) setTexto(escribir(num));
  }, [num, escribir]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const setInput = useMergedRefs<HTMLInputElement>(ref, inputRef);

  const base = min ?? 0;
  const salto = largeStep ?? step * 10;

  const mover = useCallback((delta: number) => {
    if (disabled || readOnly) return;
    // Sin valor, el primer paso aterriza en el mínimo si lo hay; subir desde
    // «vacío» a `0 + step` sorprende cuando el mínimo es 1.
    const desde = num ?? min ?? 0;
    const siguiente = clampToStep(desde + delta, { min, max, step, base });
    setNum(siguiente);
    setTexto(escribir(siguiente));
    editando.current = false;
  }, [disabled, readOnly, num, min, max, step, base, setNum, escribir]);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    const mapa: Record<string, number> = {
      ArrowUp: step, ArrowDown: -step,
      PageUp: salto, PageDown: -salto,
    };
    if (e.key in mapa) {
      e.preventDefault();
      mover(mapa[e.key]);
      return;
    }
    if (e.key === 'Home' && min !== undefined) { e.preventDefault(); setNum(min); setTexto(escribir(min)); }
    if (e.key === 'End' && max !== undefined) { e.preventDefault(); setNum(max); setTexto(escribir(max)); }
  }, [step, salto, mover, min, max, setNum, escribir]);

  const onInput = useCallback((raw: string) => {
    editando.current = true;
    setTexto(raw);
    const n = parseNumber(raw);
    // Mientras se escribe NO se ajusta a los límites: teclear «5» camino de
    // «50» con un mínimo de 10 no debe convertirse en 10 bajo los dedos.
    setNum(n);
  }, [setNum]);

  const onBlur = useCallback(() => {
    editando.current = false;
    const n = parseNumber(texto);
    if (n === null) { setNum(null); setTexto(''); return; }
    const ajustado = clampToStep(n, { min, max, step, base });
    setNum(ajustado);
    setTexto(escribir(ajustado));
  }, [texto, min, max, step, base, setNum, escribir]);

  const enElBorde = (delta: number) =>
    disabled || readOnly ||
    (delta > 0 && max !== undefined && num !== null && num >= max) ||
    (delta < 0 && min !== undefined && num !== null && num <= min);

  const errorCls = error ? `${border.dangerSubtle} ${focusRingOf.danger} ${focusBorder.danger}` : '';

  const boton = (delta: number, etiqueta: string, icono: ReactNode) => (
    <button
      type="button"
      // El propio campo ya sube y baja con las flechas, así que los botones
      // serían una parada de tabulación repetida para quien va con teclado.
      tabIndex={-1}
      aria-label={etiqueta}
      disabled={enElBorde(delta)}
      onClick={() => mover(delta)}
      className={cn(
        'flex shrink-0 items-center justify-center self-stretch',
        SIZE_BTN[size], motion.colors, text.subtle,
        'hover:bg-[var(--nui-surface-hover,oklch(96.7%_.003_264.542))] dark:hover:bg-[var(--nui-surface-hover-dark,oklch(37.3%_.034_259.733))]',
        'disabled:pointer-events-none disabled:opacity-40 cursor-pointer touch-manipulation',
      )}
    >
      {icono}
    </button>
  );

  const adorno = (nodo: ReactNode, lado: 'l' | 'r') => (
    <span className={cn(
      'inline-flex shrink-0 items-center px-3 text-sm',
      bg.surfaceMuted, text.subtle,
      lado === 'l' ? 'border-r' : 'border-l',
      error ? border.dangerSubtle : border.base,
    )}>
      {nodo}
    </span>
  );

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
    >
      <div
        className={cn(
          'flex w-full items-stretch overflow-hidden rounded-md border',
          bg.surface, border.base, motion.colors,
          // El anillo de foco va en el envoltorio, no en el campo: dentro hay
          // botones y adornos, y el foco tiene que rodear el control entero.
          'focus-within:ring-2 focus-within:ring-[color:var(--nui-ring,oklch(58.5%_.233_277.117))] dark:focus-within:ring-[color:var(--nui-ring-dark,oklch(67.3%_.182_276.935))]',
          'focus-within:border-[color:var(--nui-ring,oklch(58.5%_.233_277.117))] dark:focus-within:border-[color:var(--nui-ring-dark,oklch(67.3%_.182_276.935))]',
          disabled ? 'cursor-not-allowed opacity-50' : '',
          errorCls,
        )}
      >
        {prefix !== undefined && adorno(prefix, 'l')}
        {controls && boton(-step, menosLabel, <MinusIcon className={SIZE_ICON[size]} />)}

        <input
          ref={setInput}
          id={ids.id}
          type="text"
          // El teclado de un móvil tiene que abrirse con los números delante.
          inputMode={decimalsOf(step) > 0 ? 'decimal' : 'numeric'}
          role="spinbutton"
          aria-valuenow={num ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={num === null ? undefined : escribir(num)}
          aria-label={label === undefined ? ariaLabel : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, error, helperText)}
          autoComplete="off"
          value={texto}
          placeholder={placeholderText}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onChange={e => onInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className={cn(
            'w-full min-w-0 flex-1 bg-transparent tabular-nums outline-none',
            SIZE_CLASSES[size], placeholder, text.base,
            controls ? 'text-center' : '',
            'disabled:cursor-not-allowed',
          )}
        />

        {controls && boton(step, masLabel, <AddIcon className={SIZE_ICON[size]} />)}
        {suffix !== undefined && adorno(suffix, 'r')}
      </div>

      {name && <input type="hidden" name={name} value={num ?? ''} />}
    </Field>
  );
});

NumberInput.displayName = 'NumberInput';
