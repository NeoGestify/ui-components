import { useCallback, useId, type FC, type ReactNode } from 'react';
import { bg, border, focusVisibleRing, ringOffset, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { useControllableState } from '../../internal/useControllableState';
import { cn } from '../../internal/cn';

type SwitchSize = 'sm' | 'md' | 'lg';

const TRACK: Record<SwitchSize, string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
  lg: 'h-7 w-[3.25rem]',
};

const THUMB: Record<SwitchSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4.5 w-4.5',
  lg: 'h-5 w-5',
};

/** Recorrido del pulgar: ancho de la pista menos el pulgar y los dos márgenes. */
const TRANSLATE: Record<SwitchSize, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
  lg: 'translate-x-6',
};

export interface SwitchProps extends AnimatableProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  /** Texto de apoyo bajo la etiqueta. */
  description?: ReactNode;
  /** Coloca la etiqueta a la izquierda del interruptor. */
  labelPosition?: 'left' | 'right';
  size?: SwitchSize;
  disabled?: boolean;
  required?: boolean;
  /** `name` de un input oculto, para enviarlo en un `<form>`. */
  name?: string;
  /** Valor enviado cuando está activado. Por defecto `'on'`. */
  value?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

/**
 * Interruptor de encendido/apagado. A diferencia de una casilla, el cambio se
 * aplica al momento y no espera a que se envíe un formulario.
 *
 * ```tsx
 * <Switch label="Notificaciones" checked={on} onChange={setOn} />
 * ```
 */
export const Switch: FC<SwitchProps> = ({
  checked,
  defaultChecked = false,
  onChange,
  label,
  description,
  labelPosition = 'right',
  size = 'md',
  disabled = false,
  required = false,
  name,
  value = 'on',
  animate,
  className = '',
  id,
  'aria-label': ariaLabel,
}) => {
  const autoId = useId();
  const switchId = id || `switch-${autoId}`;
  const descId = `${switchId}-desc`;
  const [isOn, setIsOn] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange,
  });

  const toggle = useCallback(() => {
    if (disabled) return;
    setIsOn(prev => !prev);
  }, [disabled, setIsOn]);

  const control = (
    <button
      type="button"
      role="switch"
      id={switchId}
      aria-checked={isOn}
      aria-label={label === undefined ? ariaLabel : undefined}
      aria-describedby={description !== undefined ? descId : undefined}
      aria-required={required || undefined}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 touch-manipulation',
        motion.colors,
        'disabled:cursor-not-allowed disabled:opacity-50',
        TRACK[size],
        isOn ? bg.accent : `${bg.surfaceMuted} border ${border.base}`,
        focusVisibleRing, ringOffset,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0',
          motion.transform,
          THUMB[size],
          isOn ? TRANSLATE[size] : 'translate-x-0',
        )}
      />
    </button>
  );

  const texts = (label !== undefined || description !== undefined) && (
    <span className="min-w-0">
      {label !== undefined && (
        <label htmlFor={switchId} className={`block text-sm font-medium ${text.muted} cursor-pointer`}>
          {label}
          {required && <span className={`ml-1 ${text.danger}`} aria-hidden="true">*</span>}
        </label>
      )}
      {description !== undefined && (
        <span id={descId} className={`block text-sm ${text.subtle}`}>{description}</span>
      )}
    </span>
  );

  return (
    <div
      style={motionStyle(animate)}
      className={cn('flex items-start gap-3', labelPosition === 'left' ? 'flex-row-reverse justify-end' : '', className)}
    >
      {control}
      {texts}
      {name && <input type="hidden" name={name} value={isOn ? value : ''} />}
    </div>
  );
};
