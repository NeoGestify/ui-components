import { useCallback, useId, type FC, type ReactNode } from 'react';
import { CheckIcon, MinusIcon } from '../icons/icons';
import { bg, border, focusVisibleRing, ringOffset, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';

export interface CheckboxOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface CheckboxGroupProps extends AnimatableProps {
  options: CheckboxOption[];
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
  /** Casilla que marca y desmarca todas, con estado intermedio. */
  selectAllLabel?: ReactNode;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

const Casilla: FC<{
  checked: boolean;
  indeterminate?: boolean;
}> = ({ checked, indeterminate }) => (
  <span
    aria-hidden="true"
    className={cn(
      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
      motion.colors,
      checked || indeterminate ? `${border.accent} ${bg.accent}` : `${border.base} ${bg.surface}`,
    )}
  >
    {indeterminate
      ? <MinusIcon className="h-3 w-3 text-white" />
      : checked && <CheckIcon className="h-3 w-3 text-white" />}
  </span>
);

/**
 * Grupo de casillas con etiqueta, error y estado compartidos.
 *
 * Lo que no da un `Input type="checkbox"` suelto: `role="group"`, una etiqueta
 * para todo el conjunto, un mensaje de error asociado a él y —cuando hace
 * falta— una casilla de «todas» con su estado intermedio de verdad.
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
  selectAllLabel,
  animate,
  className = '',
  id,
  'aria-label': ariaLabel,
}) => {
  const autoId = useId();
  const baseId = id || `checkboxgroup-${autoId}`;
  const errorId = `${baseId}-error`;
  const descId = `${baseId}-desc`;
  const labelId = `${baseId}-label`;

  const [selected, setSelected] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange,
  });

  const alternar = useCallback((v: string) => {
    setSelected(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]));
  }, [setSelected]);

  const seleccionables = options.filter(o => !o.disabled && !disabled);
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

  const describedBy = error ? errorId : description ? descId : undefined;

  const opcionCls = (activo: boolean) => cn(
    'flex items-start gap-2.5 text-left',
    motion.colors, focusVisibleRing, ringOffset,
    'disabled:opacity-50 disabled:pointer-events-none touch-manipulation',
    variant === 'card'
      ? cn('rounded-lg border p-3', activo ? `${border.accent} ${bg.accentSoft}` : `${border.subtle} ${bg.surface}`)
      : 'rounded-md',
  );

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

      {selectAllLabel !== undefined && (
        <button
          type="button"
          role="checkbox"
          aria-checked={aMedias ? 'mixed' : todas}
          disabled={disabled || seleccionables.length === 0}
          onClick={alternarTodas}
          className={cn(opcionCls(todas), 'w-full')}
        >
          <Casilla checked={todas} indeterminate={aMedias} />
          <span className={cn('text-sm font-medium', text.base)}>{selectAllLabel}</span>
        </button>
      )}

      <div
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={describedBy}
        className={cn('flex gap-2', orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap')}
      >
        {options.map(option => {
          const activo = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={activo}
              disabled={disabled || option.disabled}
              onClick={() => alternar(option.value)}
              className={opcionCls(activo)}
            >
              <Casilla checked={activo} />
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

      {name && selected.map(v => <input key={v} type="hidden" name={name} value={v} />)}
    </div>
  );
};
