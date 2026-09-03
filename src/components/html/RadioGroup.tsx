import {
  useCallback, useMemo, useRef,
  type FC, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import { motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';
import { toOptions, type NuiOption, type OptionsInput } from '../../internal/options';
import { Radio, type RadioSize } from './Radio';
import { Field, describedBy, useFieldIds } from './Field';

/** @see NuiOption — es el mismo tipo que usan el resto de selectores. */
export type RadioOption = NuiOption;

export interface RadioGroupProps extends AnimatableProps {
  /** Opciones completas o solo sus valores. */
  options: OptionsInput;
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
  size?: RadioSize;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

/**
 * Grupo de opciones excluyentes.
 *
 * Un `Radio` suelto no forma un grupo: no comparte etiqueta, no expone
 * `role="radiogroup"` y el tabulador para en **cada** círculo. Aquí el grupo es
 * una sola parada de tabulación y dentro se mueve con las flechas, que es como
 * se comporta un grupo de radios nativo.
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
  size = 'md',
  animate,
  className = '',
  id,
  'aria-label': ariaLabel,
}) => {
  const ids = useFieldIds(id, 'radiogroup');
  const opciones = useMemo(() => toOptions(options), [options]);

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
        role="radiogroup"
        // El foco vive en las opciones, no aquí, pero un `role` interactivo
        // tiene que ser enfocable: `-1` lo hace alcanzable por código sin
        // añadir una parada de tabulación.
        tabIndex={-1}
        aria-labelledby={label ? ids.labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={describedBy(ids, error, description)}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        onKeyDown={onKeyDown}
        className={cn(
          'flex gap-2',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        )}
      >
        {opciones.map((option, i) => {
          const activo = option.value === selected;
          return (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
              size={size}
              variant={variant}
              checked={activo}
              disabled={disabled || option.disabled}
              onChange={setSelected}
              // Solo el seleccionado entra en el orden de tabulación; si no hay
              // ninguno, el primero, para que el grupo sea alcanzable.
              tabIndex={activo || (!selected && i === 0) ? 0 : -1}
            />
          );
        })}
      </div>

      {/* Para que el grupo viaje en un envío de formulario normal. */}
      {name && <input type="hidden" name={name} value={selected} />}
    </Field>
  );
};
