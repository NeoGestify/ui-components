import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { ChevronDownIcon } from '../icons/icons';
// `placeholder` se renombra: el componente ya tiene una prop con ese nombre.
import { bg, border, focusBorder, focusRing, focusRingOf, placeholder as placeholderCls, text } from '../../theme/tokens';
import { motion } from '../../theme/motion';
import { cn } from '../../internal/cn';
import type { NuiOption } from '../../internal/options';
import { Field, describedBy, useFieldIds } from './Field';

type SelectVariant = 'default' | 'outline' | 'filled' | 'minimal' | 'custom' | 'small';
type SelectSize = 'sm' | 'md' | 'lg';

/**
 * @see NuiOption — es el mismo tipo que usan el resto de selectores, con dos
 * diferencias que impone el `<select>` nativo: la etiqueta va dentro de una
 * `<option>`, que solo pinta texto, y el valor admite números porque el
 * atributo `value` los convierte a cadena por su cuenta.
 */
export type SelectOption =
  Omit<NuiOption<string | number>, 'label'>
  & {
    label: string;
    /** Marca la opción elegida al montar cuando no hay `value` ni `defaultValue`. */
    selected?: boolean;
  };

/** @deprecated Usa `SelectOption`. Se mantiene por compatibilidad. */
export type Option = SelectOption;

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  placeholder?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  error?: string | boolean;
  helperText?: string;
  label?: string | ReactNode;
  icon?: ReactNode;
}

const SIZE_CLASSES: Record<SelectSize, string> = {
  sm: 'py-1.5 text-xs',
  md: 'py-2 text-sm',
  lg: 'py-2.5 text-base',
};

const VARIANT_CLASSES: Record<Exclude<SelectVariant, 'small'>, string> = {
  default: `border ${border.base} ${bg.surface}`,
  outline: `border-2 ${border.accent} bg-transparent`,
  filled:  `border ${border.base} ${bg.surfaceMuted}`,
  minimal: `border-0 border-b ${border.base} bg-transparent rounded-none focus:ring-0`,
  custom:  '',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  placeholder,
  variant = 'default',
  size = 'md',
  error = false,
  helperText,
  label,
  icon,
  className = '',
  id,
  ...props
}, ref) => {
  const ids = useFieldIds(id, 'select');
  const selectId = ids.id;

  // backward compat: variant='small' → size='sm'
  const effectiveSize: SelectSize = variant === 'small' ? 'sm' : size;
  const effectiveVariant: Exclude<SelectVariant, 'small'> = variant === 'small' ? 'default' : variant;

  const hasError = Boolean(error);
  const errorMsg = typeof error === 'string' ? error : '';

  // Compute defaultValue from options[].selected when no controlled value provided
  const isControlled = props.value !== undefined;
  const computedDefaultValue =
    !isControlled && props.defaultValue === undefined
      ? options.find((o) => o.selected)?.value?.toString() ?? (placeholder ? '' : undefined)
      : undefined;

  // `color-scheme` es lo que hace que el desplegable NATIVO (la lista que abre
  // el sistema operativo) se pinte en oscuro. Sin esto, las clases `dark:` del
  // <select> cambian la caja pero la lista sigue clara — o peor, en Chrome
  // Windows/Linux queda texto blanco sobre fondo blanco.
  const baseCls =
    'appearance-none relative block w-full pl-3 pr-9 [color-scheme:light] dark:[color-scheme:dark] ' +
    `${placeholderCls} ${text.base} rounded-md ` +
    `${focusRing} ${focusBorder.accent} focus:z-10 ` +
    `disabled:opacity-50 disabled:cursor-not-allowed ${motion.colors}`;

  const errorCls = hasError
    ? `${border.dangerSubtle} ${focusRingOf.danger} ${focusBorder.danger}`
    : '';

  const selectCls = cn(
    baseCls,
    SIZE_CLASSES[effectiveSize],
    VARIANT_CLASSES[effectiveVariant],
    errorCls,
    icon ? 'pl-9' : '',
    className,
  );

  return (
    <Field
      label={label}
      htmlFor={selectId}
      error={errorMsg || undefined}
      errorId={ids.errorId}
      helperText={helperText}
      helperId={ids.helperId}
      required={props.required}
    >
      <div className="relative">
        {icon && (
          <div className={`pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 ${text.faint}`}>
            {icon}
          </div>
        )}
        <select
          ref={ref}
          id={selectId}
          className={selectCls}
          defaultValue={computedDefaultValue}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy(ids, errorMsg, helperText)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {/* Sin clases de color en las <option>: el navegador las hereda de
              `color-scheme`. Forzarlas rompe el contraste en Windows/Linux. */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 ${text.faint}`}>
          <ChevronDownIcon className="w-4 h-4" />
        </div>
      </div>
    </Field>
  );
});

Select.displayName = 'Select';
