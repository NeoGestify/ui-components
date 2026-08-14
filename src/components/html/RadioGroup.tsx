import {
  useCallback, useId, useRef,
  type FC, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import { bg, border, focusVisibleRing, ringOffset, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';

export interface RadioOption {
  value: string;
  label: ReactNode;
  /** Texto de apoyo bajo la etiqueta. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends AnimatableProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Etiqueta del grupo. Sin ella hace falta `aria-label`. */
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  /** `name` para enviarlo en un `<form>`. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  /** Cada opción dentro de una tarjeta pulsable, no solo un círculo. */
  variant?: 'plain' | 'card';
  className?: string;
  id?: string;
  'aria-label'?: string;
}

/**
 * Grupo de opciones excluyentes.
 *
 * Un `Input type="radio"` suelto no forma un grupo: no comparte etiqueta, no
 * expone `role="radiogroup"` y el tabulador para en **cada** círculo. Aquí el
 * grupo es una sola parada de tabulación y dentro se mueve con las flechas,
 * que es como se comporta un grupo de radios nativo.
 *
 * ```tsx
 * <RadioGroup
 *   label="Método de envío"
 *   options={[
 *     { value: 'std', label: 'Estándar', description: '3-5 días' },
 *     { value: 'exp', label: 'Exprés', description: '24 h' },
 *   ]}
 *   value={envio}
 *   onChange={setEnvio}
 * />
 * ```
 */
export const RadioGroup: FC<RadioGroupProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  label,
  description,
  error,
  name,
  required = false,
  disabled = false,
  orientation = 'vertical',
  variant = 'plain',
  animate,
  className = '',
  id,
  'aria-label': ariaLabel,
}) => {
  const autoId = useId();
  const baseId = id || `radiogroup-${autoId}`;
  const errorId = `${baseId}-error`;
  const descId = `${baseId}-desc`;
  const labelId = `${baseId}-label`;

  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange,
  });

  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    const teclas = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];
    if (!teclas.includes(e.key)) return;
    e.preventDefault();

    const radios = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)') ?? [],
    );
    if (!radios.length) return;

    const actual = radios.findIndex(r => r === document.activeElement);
    const adelante = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    const siguiente = radios[(actual + (adelante ? 1 : -1) + radios.length) % radios.length];

    siguiente?.focus();
    // En un grupo de radios, mover el foco **selecciona**. Es lo que hace el
    // nativo y lo que espera un lector de pantalla.
    setSelected(siguiente.dataset.value!);
  }, [setSelected]);

  const describedBy = error ? errorId : description ? descId : undefined;

  return (
    <div className={cn('space-y-2', className)} style={motionStyle(animate)}>
      {label && (
        <p id={labelId} className={cn('text-sm font-medium', text.muted)}>
          {label}
          {required && <span className={cn('ml-1', text.danger)} aria-hidden="true">*</span>}
        </p>
      )}
      {description && !error && (
        <p id={descId} className={cn('text-sm', text.subtle)}>{description}</p>
      )}

      <div
        ref={listRef}
        role="radiogroup"
        // El foco vive en las opciones, no aquí, pero un `role`
        // interactivo tiene que ser enfocable: `-1` lo hace alcanzable
        // por código sin añadir una parada de tabulación.
        tabIndex={-1}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        onKeyDown={onKeyDown}
        className={cn(
          'flex gap-2',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        )}
      >
        {options.map(option => {
          const activo = option.value === selected;
          const apagado = disabled || option.disabled;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              data-value={option.value}
              aria-checked={activo}
              disabled={apagado}
              // Solo el seleccionado entra en el orden de tabulación; si no hay
              // ninguno, el primero, para que el grupo sea alcanzable.
              tabIndex={activo || (!selected && option === options[0]) ? 0 : -1}
              onClick={() => setSelected(option.value)}
              className={cn(
                'flex items-start gap-2.5 text-left',
                motion.colors, focusVisibleRing, ringOffset,
                'disabled:opacity-50 disabled:pointer-events-none touch-manipulation',
                variant === 'card'
                  ? cn(
                      'rounded-lg border p-3',
                      activo ? `${border.accent} ${bg.accentSoft}` : `${border.subtle} ${bg.surface}`,
                    )
                  : 'rounded-md',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                  motion.colors,
                  activo ? `${border.accent} ${bg.accent}` : `${border.base} ${bg.surface}`,
                )}
              >
                {activo && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="min-w-0">
                <span className={cn('block text-sm font-medium', text.base)}>{option.label}</span>
                {option.description !== undefined && (
                  <span className={cn('block text-sm', text.subtle)}>{option.description}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p id={errorId} className={cn('text-sm', text.danger)} role="alert">{error}</p>}

      {/* Para que el grupo viaje en un envío de formulario normal. */}
      {name && <input type="hidden" name={name} value={selected} />}
    </div>
  );
};
