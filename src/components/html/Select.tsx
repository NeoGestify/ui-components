import { type SelectHTMLAttributes, type FC, type ReactNode } from 'react';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
  selected?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: Option[];
  placeholder?: string;
  variant?: 'default' | 'small';
  error?: boolean;
  helperText?: string;
  label?: string | ReactNode;
}

export const Select: FC<SelectProps> = ({
  options,
  placeholder,
  variant = 'default',
  error = false,
  helperText,
  label,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  const getVariantClasses = () => {
    const baseClasses = 'w-full bg-white dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-white [&>option]:py-2 [&>option:checked]:bg-indigo-50 [&>option:checked]:dark:bg-indigo-900/50 [&>option:disabled]:opacity-50 [&>option:disabled]:cursor-not-allowed';

    if (variant === 'small') {
      return `${baseClasses} px-2.5 py-1.5 text-sm border-gray-300 dark:border-gray-600`;
    }

    return `${baseClasses} px-3 py-2 border-gray-300 dark:border-gray-600 ${error ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : ''}`;
  };

  const combinedClassName = `${getVariantClasses()} ${className}`.trim();

  return (
    <div className="space-y-1 w-full">
      {label && typeof label === 'string' ? (
        <label htmlFor={selectId} className="block text-xs font-normal text-gray-700 dark:text-gray-300">
          {label}
        </label>
      ) : (
        label
      )}
      <select id={selectId} className={combinedClassName} {...props}>
        {placeholder && placeholder.trim() && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            selected={option.selected}
          >
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};