import { useCallback, useMemo, type FC, type ReactNode } from 'react';
import { motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';
import { toOptions, type NuiOption, type OptionsInput } from '../../internal/options';
import { Checkbox, type CheckboxSize } from './Checkbox';
import { Field, describedBy, useFieldIds } from './Field';

/** @see NuiOption — es el mismo tipo que usan el resto de selectores. */
export type CheckboxOption = NuiOption;

export interface CheckboxGroupProps extends AnimatableProps {
  /** Opciones completas o solo sus valores. */
  options: OptionsInput;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  /** `name` para enviarlo en un `<form>`; se emite un campo por valor marcado. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  variant?: 'plain' | 'card';
  size?: CheckboxSize;
  /** Casilla que marca y desmarca todas, con estado intermedio. */
  selectAllLabel?: ReactNode;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

/**
 * Grupo de casillas con etiqueta, error y estado compartidos.
 *
 * Lo que no da una `Checkbox` suelta: `role="group"`, una etiqueta para todo el
 * conjunto, un mensaje de error asociado a él y —cuando hace falta— una casilla
 * de «todas» con su estado intermedio de verdad.
 *
 * ```tsx
 * <CheckboxGroup
 *   label="Permisos"
 *   selectAllLabel="Seleccionar todo"
 *   options={permisos}
 *   value={activos}
 *   onChange={setActivos}
 * />
 * ```
 */
export const CheckboxGroup: FC<CheckboxGroupProps> = ({
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
  selectAllLabel,
  animate,
  className = '',
  id,
  'aria-label': ariaLabel,
}) => {
  const ids = useFieldIds(id, 'checkboxgroup');
  const opciones = useMemo(() => toOptions(options), [options]);

  const [selected, setSelected] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange,
  });

  const alternar = useCallback((v: string) => {
    setSelected(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]));
  }, [setSelected]);

  const seleccionables = useMemo(
    () => (disabled ? [] : opciones.filter(o => !o.disabled)),
    [opciones, disabled],
  );
  const marcadas = seleccionables.filter(o => selected.includes(o.value)).length;
  const todas = seleccionables.length > 0 && marcadas === seleccionables.length;
  // Ni todas ni ninguna: la casilla de cabecera no es «no» sino «a medias», y
  // eso es un tercer estado, no un booleano.
  const aMedias = marcadas > 0 && !todas;

  const alternarTodas = useCallback(() => {
    setSelected(prev => {
      const disponibles = seleccionables.map(o => o.value);
      const completas = disponibles.every(v => prev.includes(v));
      // Se conservan los valores deshabilitados que ya estuvieran marcados: no
      // son del usuario, así que no le corresponde quitarlos aquí.
      const fijos = prev.filter(v => !disponibles.includes(v));
      return completas ? fijos : [...fijos, ...disponibles];
    });
  }, [seleccionables, setSelected]);

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
      {selectAllLabel !== undefined && (
        <Checkbox
          label={selectAllLabel}
          size={size}
          variant={variant}
          checked={todas}
          indeterminate={aMedias}
          disabled={disabled || seleccionables.length === 0}
          onChange={alternarTodas}
        />
      )}

      <div
        role="group"
        aria-labelledby={label ? ids.labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={describedBy(ids, error, description)}
        className={cn('flex gap-2', orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap')}
      >
        {opciones.map(option => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            size={size}
            variant={variant}
            checked={selected.includes(option.value)}
            disabled={disabled || option.disabled}
            onChange={() => alternar(option.value)}
            className={orientation === 'horizontal' ? 'w-auto' : undefined}
          />
        ))}
      </div>

      {name && selected.map(v => <input key={v} type="hidden" name={name} value={v} />)}
    </Field>
  );
};
