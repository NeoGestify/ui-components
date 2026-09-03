import { type FC, type ReactNode } from 'react';
import { bg, border, focusVisibleRing, ringOffset, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useFieldIds } from './Field';
import type { CheckboxSize } from './Checkbox';

export type RadioSize = CheckboxSize;

const CIRCLE: Record<RadioSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const DOT: Record<RadioSize, string> = {
  sm: 'h-1 w-1',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
};

const LABEL: Record<RadioSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export interface RadioDotProps {
  checked: boolean;
  size?: RadioSize;
  invalid?: boolean;
}

/** Solo el círculo, para reutilizarlo dentro de otro control. */
export const RadioDot: FC<RadioDotProps> = ({ checked, size = 'md', invalid = false }) => (
  <span
    aria-hidden="true"
    className={cn(
      'flex shrink-0 items-center justify-center rounded-full border',
      CIRCLE[size],
      motion.colors,
      checked ? `${border.accent} ${bg.accent}` : `${invalid ? border.dangerSubtle : border.base} ${bg.surface}`,
    )}
  >
    {checked && <span className={cn('rounded-full bg-white', DOT[size])} />}
  </span>
);

export interface RadioProps extends AnimatableProps {
  /** Valor que representa. Viaja en `data-value` para la navegación del grupo. */
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  label?: ReactNode;
  description?: ReactNode;
  size?: RadioSize;
  variant?: 'plain' | 'card';
  disabled?: boolean;
  className?: string;
  id?: string;
  /**
   * En un grupo solo la opción activa entra en el orden de tabulación; el resto
   * se alcanza con las flechas. Lo fija `RadioGroup`.
   */
  tabIndex?: number;
  'aria-label'?: string;
}

/**
 * Una opción excluyente suelta.
 *
 * Casi siempre se quiere `RadioGroup`, que además da el `role="radiogroup"`, la
 * etiqueta común y el movimiento con flechas. Esta versión existe para montar
 * un grupo a mano cuando las opciones no caben en una lista: repartidas por una
 * tabla, dentro de tarjetas de precio, etc.
 */
export const Radio: FC<RadioProps> = ({
  value,
  checked = false,
  onChange,
  label,
  description,
  size = 'md',
  variant = 'plain',
  disabled = false,
  animate,
  className = '',
  id,
  tabIndex,
  'aria-label': ariaLabel,
}) => {
  const ids = useFieldIds(id, 'radio');

  return (
    <button
      type="button"
      role="radio"
      id={ids.id}
      data-value={value}
      aria-checked={checked}
      aria-label={label === undefined ? ariaLabel : undefined}
      aria-describedby={description !== undefined ? ids.helperId : undefined}
      disabled={disabled}
      tabIndex={tabIndex}
      onClick={() => onChange?.(value)}
      style={motionStyle(animate)}
      className={cn(
        'flex items-start gap-2.5 text-left',
        motion.colors, focusVisibleRing, ringOffset,
        'disabled:pointer-events-none disabled:opacity-50 touch-manipulation cursor-pointer',
        variant === 'card'
          ? cn('rounded-lg border p-3', checked ? `${border.accent} ${bg.accentSoft}` : `${border.subtle} ${bg.surface}`)
          : 'rounded-md',
        className,
      )}
    >
      <span className={size === 'lg' ? 'mt-0.5' : 'mt-px'}>
        <RadioDot checked={checked} size={size} />
      </span>
      {(label !== undefined || description !== undefined) && (
        <span className="min-w-0">
          {label !== undefined && (
            <span className={cn('block font-medium', LABEL[size], text.base)}>{label}</span>
          )}
          {description !== undefined && (
            <span id={ids.helperId} className={cn('block', LABEL[size], text.subtle)}>{description}</span>
          )}
        </span>
      )}
    </button>
  );
};
