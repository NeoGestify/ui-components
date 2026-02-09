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
    const baseClasses = 'appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';

    if (variant === 'small') {
      return `${baseClasses.replace('px-3 py-2', 'px-2.5 py-1.5 text-sm')} border-gray-300 dark:border-gray-600`;
    }

    return `${baseClasses} border-gray-300 dark:border-gray-600 ${error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500' : ''}`;
  };

  const getOptionClasses = (option: Option) => {
    return `bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  };

  const combinedClassName = `${getVariantClasses()} ${className}`.trim();

  return (
    <div className="space-y-1 w-full">
      {label && typeof label === 'string' ? (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      ) : (
        label
      )}
      <select id={selectId} className={combinedClassName} {...props}>
        {placeholder && placeholder.trim() && (
          <option value="" disabled className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-2">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            selected={option.selected}
            className={getOptionClasses(option)}
          >
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p className={`text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};