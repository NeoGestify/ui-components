import { useId, type SelectHTMLAttributes, type FC, type ReactNode } from 'react';
import { ChevronDownIcon } from '../icons/icons';

type SelectVariant = 'default' | 'outline' | 'filled' | 'minimal' | 'custom' | 'small';
type SelectSize = 'sm' | 'md' | 'lg';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
  selected?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: Option[];
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
  default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
  outline: 'border-2 border-indigo-300 dark:border-indigo-600 bg-transparent',
  filled:  'border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700',
  minimal: 'border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent rounded-none focus:ring-0',
  custom:  '',
};

export const Select: FC<SelectProps> = ({
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
}) => {
  const autoId = useId();
  const selectId = id || `select-${autoId}`;
  const describedById = `${selectId}-desc`;

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
    'placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 focus:z-10 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';

  const errorCls = hasError
    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500'
    : '';

  const selectCls = [
    baseCls,
    SIZE_CLASSES[effectiveSize],
    VARIANT_CLASSES[effectiveVariant],
    errorCls,
    icon ? 'pl-9' : '',
    className,
  ].filter(Boolean).join(' ');

  const helpNode = errorMsg
    ? <p id={describedById} className="text-sm text-red-600 dark:text-red-400" role="alert">{errorMsg}</p>
    : helperText
      ? <p id={describedById} className={`text-sm ${hasError ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{helperText}</p>
      : null;

  return (
    <div className="space-y-1 w-full">
      {label && (
        typeof label === 'string' ? (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
          </label>
        ) : label
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <select
          id={selectId}
          className={selectCls}
          defaultValue={computedDefaultValue}
          aria-invalid={hasError || undefined}
          aria-describedby={helpNode ? describedById : undefined}
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
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 dark:text-gray-500">
          <ChevronDownIcon className="w-4 h-4" />
        </div>
      </div>
      {helpNode}
    </div>
  );
};
