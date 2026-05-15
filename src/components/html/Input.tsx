import { type InputHTMLAttributes, type FC, type ReactNode } from 'react';
import { CloseIcon } from '../icons/icons';

type InputVariant = 'default' | 'outline' | 'filled' | 'minimal';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string | ReactNode;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconSide?: 'left' | 'right';
  variant?: InputVariant;
  size?: InputSize;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

const VARIANT_CLASSES: Record<InputVariant, string> = {
  default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
  outline: 'border-2 border-indigo-300 dark:border-indigo-600 bg-transparent',
  filled:  'border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700',
  minimal: 'border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent rounded-none focus:ring-0',
};

export const Input: FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  iconSide = 'left',
  variant = 'default',
  size = 'md',
  prefix,
  suffix,
  clearable = false,
  onClear,
  className = '',
  id,
  type,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  const errorCls = error
    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500'
    : '';

  const showClear = clearable && !props.disabled && props.value !== undefined && props.value !== '';
  const hasRightSlot = (icon && iconSide === 'right') || showClear;

  const baseCls = 'appearance-none relative block w-full placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';

  const inputCls = [
    baseCls,
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    errorCls,
    icon && iconSide === 'left' ? 'pl-9' : '',
    hasRightSlot ? 'pr-9' : '',
    prefix ? 'rounded-l-none' : '',
    suffix ? 'rounded-r-none' : '',
    className,
  ].filter(Boolean).join(' ');

  // ── Checkbox / Radio ──────────────────────────────────────────────────────
  const toggleCls = [
    `h-4 w-4 ${type === 'radio' ? 'rounded-full' : 'rounded'} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800`,
    'text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400',
    'focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
    'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer',
    error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400' : '',
  ].filter(Boolean).join(' ');

  // ── File input ────────────────────────────────────────────────────────────
  const fileCls = [
    'block w-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500',
    'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200',
    'file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium',
    'file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300',
    'hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800/50 file:transition-colors file:duration-200 file:cursor-pointer',
    SIZE_CLASSES[size],
    error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400' : 'border-gray-300 dark:border-gray-600',
    className,
  ].filter(Boolean).join(' ');

  const hasHidden = Boolean(className && /\bhidden\b/.test(className));
  const wrapperCls = `space-y-1 w-full${hasHidden ? ' hidden' : ''}`;

  const labelNode = label && (
    typeof label === 'string' ? (
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {props.required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
      </label>
    ) : label
  );

  const errorNode = error && (
    <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
  );

  const helperNode = helperText && !error && (
    <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
  );

  if (type === 'checkbox' || type === 'radio') {
    return (
      <div className={wrapperCls}>
        <div className="flex items-center space-x-2">
          <input id={inputId} type={type} className={toggleCls} {...props} />
          {labelNode}
        </div>
        {errorNode}
        {helperNode}
      </div>
    );
  }

  if (type === 'file') {
    return (
      <div className={wrapperCls}>
        {labelNode}
        <input id={inputId} type="file" className={fileCls} {...props} />
        {errorNode}
        {helperNode}
      </div>
    );
  }

  const prefixBorderCls = error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600';

  return (
    <div className={wrapperCls}>
      {labelNode}
      <div className="flex">
        {prefix && (
          <span className={`inline-flex shrink-0 items-center px-3 border border-r-0 ${prefixBorderCls} bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-l-md text-sm`}>
            {prefix}
          </span>
        )}
        <div className="relative flex-1">
          {icon && iconSide === 'left' && (
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <input id={inputId} className={inputCls} type={type} {...props} />
          {icon && iconSide === 'right' && !showClear && (
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          {showClear && (
            <button
              type="button"
              onClick={onClear}
              tabIndex={-1}
              aria-label="Limpiar"
              className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {suffix && (
          <span className={`inline-flex shrink-0 items-center px-3 border border-l-0 ${prefixBorderCls} bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-r-md text-sm`}>
            {suffix}
          </span>
        )}
      </div>
      {errorNode}
      {helperNode}
    </div>
  );
};
