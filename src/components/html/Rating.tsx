import {
  useCallback, useState,
  type FC, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import { StarFilledIcon, StarIcon } from '../icons/icons';
import { focusVisibleRing, ringOffset, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';
import { Field, describedBy, useFieldIds } from './Field';

type RatingSize = 'sm' | 'md' | 'lg';

const SIZE: Record<RatingSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

export interface RatingProps extends AnimatableProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Número de símbolos. Por defecto 5. */
  max?: number;
  label?: ReactNode;
  error?: string;
  helperText?: string;
  /** Solo lectura: se pinta pero no se puede cambiar. */
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  size?: RatingSize;
  /** Permite volver a cero pulsando la misma puntuación. Por defecto `true`. */
  clearable?: boolean;
  /** Símbolo propio. Recibe si esa posición está llena. */
  icon?: (filled: boolean) => ReactNode;
  /** Texto accesible de cada posición. Por defecto «N de M». */
  getLabel?: (value: number, max: number) => string;
  /** Escribe la puntuación al lado de los símbolos. */
  showValue?: boolean;
  name?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

/**
 * Puntuación con estrellas.
 *
 * Es un grupo de opciones excluyentes, no un adorno: se recorre con las
 * flechas, cada estrella dice «3 de 5» y el conjunto entero es **una sola**
 * parada de tabulación. En modo `readOnly` deja de ser un control y pasa a ser
 * un texto con imagen, que es lo correcto para una media ya publicada.
 *
 * ```tsx
 * <Rating label="Valoración" value={n} onChange={setN} />
 * <Rating value={4} readOnly showValue />
 * ```
 */
export const Rating: FC<RatingProps> = ({
  value,
  defaultValue = 0,
  onChange,
  max = 5,
  label,
  error,
  helperText,
  readOnly = false,
  disabled = false,
  required = false,
  size = 'md',
  clearable = true,
  icon,
  getLabel,
  showValue = false,
  name,
  id,
  className = '',
  animate,
  'aria-label': ariaLabel,
}) => {
  const ids = useFieldIds(id, 'rating');
  const [puntos, setPuntos] = useControllableState<number>({
    value,
    defaultValue,
    onChange,
  });

  // Lo que se ve al pasar por encima no es el valor: si se guardara en el
  // estado real, mover el ratón por la lista dispararía `onChange` en cada
  // estrella y el consumidor guardaría cuatro puntuaciones por gesto.
  const [previo, setPrevio] = useState<number | null>(null);
  const pintado = previo ?? puntos;

  const bloqueado = readOnly || disabled;

  const etiquetaDe = useCallback(
    (n: number) => (getLabel ? getLabel(n, max) : `${n} de ${max}`),
    [getLabel, max],
  );

  const elegir = useCallback((n: number) => {
    if (bloqueado) return;
    setPuntos(n === puntos && clearable ? 0 : n);
  }, [bloqueado, puntos, clearable, setPuntos]);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (bloqueado) return;
    const paso =
      e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1
          : 0;
    if (paso !== 0) {
      e.preventDefault();
      setPuntos(Math.min(max, Math.max(0, puntos + paso)));
      return;
    }
    if (e.key === 'Home') { e.preventDefault(); setPuntos(clearable ? 0 : 1); }
    if (e.key === 'End') { e.preventDefault(); setPuntos(max); }
  }, [bloqueado, puntos, max, clearable, setPuntos]);

  const simbolo = (lleno: boolean) => icon
    ? icon(lleno)
    : lleno
      ? <StarFilledIcon className={cn(SIZE[size], 'text-[color:var(--nui-warning,oklch(68.1%_.162_75.834))] dark:text-[color:var(--nui-warning-dark,oklch(79.5%_.184_86.047))]')} />
      : <StarIcon className={cn(SIZE[size], text.faint)} />;

  const estrellas = Array.from({ length: max }, (_, i) => i + 1);

  const cuerpo = bloqueado ? (
    // Sin interacción esto ya no es un control, es una imagen con su texto.
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={etiquetaDe(puntos)}>
      {estrellas.map(n => (
        <span key={n} aria-hidden="true" className="inline-flex">{simbolo(n <= pintado)}</span>
      ))}
    </span>
  ) : (
    <div
      role="radiogroup"
      // El foco vive en las estrellas; `-1` hace el grupo alcanzable por
      // código sin añadir una parada de tabulación de más.
      tabIndex={-1}
      aria-label={label ? undefined : ariaLabel}
      aria-labelledby={label ? ids.labelId : undefined}
      aria-describedby={describedBy(ids, error, helperText)}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      onKeyDown={onKeyDown}
      onMouseLeave={() => setPrevio(null)}
      className="inline-flex items-center gap-0.5"
    >
      {estrellas.map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === puntos}
          aria-label={etiquetaDe(n)}
          disabled={disabled}
          // Una sola parada de tabulación para todo el grupo: dentro se mueve
          // con las flechas, como en un grupo de radios nativo.
          tabIndex={n === puntos || (puntos === 0 && n === 1) ? 0 : -1}
          onClick={() => elegir(n)}
          onMouseEnter={() => setPrevio(n)}
          onFocus={() => setPrevio(n)}
          onBlur={() => setPrevio(null)}
          className={cn(
            'inline-flex cursor-pointer touch-manipulation rounded',
            motion.transform, 'hover:scale-110',
            focusVisibleRing, ringOffset,
          )}
        >
          {simbolo(n <= pintado)}
        </button>
      ))}
    </div>
  );

  return (
    <Field
      label={label}
      labelId={ids.labelId}
      error={error}
      errorId={ids.errorId}
      helperText={helperText}
      helperId={ids.helperId}
      required={required}
      className={className}
      style={motionStyle(animate)}
    >
      <div className="flex items-center gap-2">
        {cuerpo}
        {showValue && (
          <span className={cn('text-sm tabular-nums', text.subtle)}>{puntos} / {max}</span>
        )}
      </div>
      {name && <input type="hidden" name={name} value={puntos} />}
    </Field>
  );
};
