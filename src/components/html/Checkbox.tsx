import { type FC, type ReactNode } from 'react';
import { CheckIcon, MinusIcon } from '../icons/icons';
import { bg, border, focusVisibleRing, ringOffset, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';
import { useFieldIds } from './Field';

export type CheckboxSize = 'sm' | 'md' | 'lg';

/** Caja, marca y texto crecen a la vez; si no, la marca baila dentro del cuadro. */
const BOX: Record<CheckboxSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const MARK: Record<CheckboxSize, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
};

const LABEL: Record<CheckboxSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export interface CheckboxBoxProps {
  checked: boolean;
  /** Tercer estado: ni marcada ni sin marcar. */
  indeterminate?: boolean;
  size?: CheckboxSize;
  invalid?: boolean;
}

/**
 * Solo el cuadro. Se exporta para pintarlo dentro de otro control —una celda de
 * tabla, una fila de lista— sin arrastrar la etiqueta ni el estado.
 */
export const CheckboxBox: FC<CheckboxBoxProps> = ({ checked, indeterminate = false, size = 'md', invalid = false }) => (
  <span
    aria-hidden="true"
    className={cn(
      'flex shrink-0 items-center justify-center rounded border',
      BOX[size],
      motion.colors,
      checked || indeterminate
        ? `${border.accent} ${bg.accent}`
        : `${invalid ? border.dangerSubtle : border.base} ${bg.surface}`,
    )}
  >
    {indeterminate
      ? <MinusIcon className={cn(MARK[size], 'text-white')} />
      : checked && <CheckIcon className={cn(MARK[size], 'text-white')} />}
  </span>
);

export interface CheckboxProps extends AnimatableProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Tercer estado. Manda sobre `checked` en lo que se pinta y se anuncia. */
  indeterminate?: boolean;
  label?: ReactNode;
  /** Texto de apoyo bajo la etiqueta. */
  description?: ReactNode;
  error?: string;
  size?: CheckboxSize;
  /** `card` envuelve la opción en un recuadro pulsable entero. */
  variant?: 'plain' | 'card';
  disabled?: boolean;
  required?: boolean;
  /** `name` de un input oculto, para enviarla en un `<form>`. */
  name?: string;
  /** Valor enviado cuando está marcada. Por defecto `'on'`. */
  value?: string;
  className?: string;
  id?: string;
  /** Lo fija el grupo que la contiene; suelta no hace falta tocarlo. */
  tabIndex?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * Una casilla suelta.
 *
 * Hasta ahora solo existía `CheckboxGroup`, así que un «acepto los términos»
 * obligaba a declarar un grupo de una sola opción, con su `role="group"` y su
 * etiqueta de conjunto de más.
 *
 * ```tsx
 * <Checkbox label="Acepto los términos" checked={ok} onChange={setOk} required />
 * ```
 */
export const Checkbox: FC<CheckboxProps> = ({
  checked,
  defaultChecked = false,
  onChange,
  indeterminate = false,
  label,
  description,
  error,
  size = 'md',
  variant = 'plain',
  disabled = false,
  required = false,
  name,
  value = 'on',
  animate,
  className = '',
  id,
  tabIndex,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const ids = useFieldIds(id, 'checkbox');

  const [marcada, setMarcada] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange,
  });

  const describedBy = [
    ariaDescribedBy,
    error ? ids.errorId : description !== undefined ? ids.helperId : undefined,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('min-w-0', className)} style={motionStyle(animate)}>
      <button
        type="button"
        role="checkbox"
        id={ids.id}
        // `mixed` no es un booleano y no se puede fingir con `false`: un lector
        // de pantalla tiene que decir «parcialmente marcada», no «sin marcar».
        aria-checked={indeterminate ? 'mixed' : marcada}
        aria-label={label === undefined ? ariaLabel : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        disabled={disabled}
        tabIndex={tabIndex}
        onClick={() => setMarcada(prev => !prev)}
        className={cn(
          'flex w-full items-start gap-2.5 text-left',
          motion.colors, focusVisibleRing, ringOffset,
          'disabled:pointer-events-none disabled:opacity-50 touch-manipulation cursor-pointer',
          variant === 'card'
            ? cn('rounded-lg border p-3', marcada || indeterminate ? `${border.accent} ${bg.accentSoft}` : `${border.subtle} ${bg.surface}`)
            : 'rounded-md',
        )}
      >
        <span className={size === 'lg' ? 'mt-0.5' : 'mt-px'}>
          <CheckboxBox checked={marcada} indeterminate={indeterminate} size={size} invalid={Boolean(error)} />
        </span>
        {(label !== undefined || description !== undefined) && (
          <span className="min-w-0">
            {label !== undefined && (
              <span className={cn('block font-medium', LABEL[size], text.base)}>
                {label}
                {required && <span className={cn('ml-1', text.danger)} aria-hidden="true">*</span>}
              </span>
            )}
            {description !== undefined && (
              <span id={ids.helperId} className={cn('block', LABEL[size], text.subtle)}>{description}</span>
            )}
          </span>
        )}
      </button>

      {error && <p id={ids.errorId} className={cn('mt-1 text-sm', text.danger)} role="alert">{error}</p>}

      {/* Para que viaje en un envío de formulario normal. */}
      {name && <input type="hidden" name={name} value={marcada ? value : ''} />}
    </div>
  );
};
