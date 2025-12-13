import { type InputHTMLAttributes, type FC, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | ReactNode;
  error?: string;
  helperText?: string;
}

export const Input: FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  type,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  const baseClasses = 'appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';

  const errorClasses = error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500' : 'border-gray-300 dark:border-gray-600';

  const classes = `${baseClasses} ${errorClasses} ${className}`;

  if (type === 'checkbox') {
    return (
      <div className="space-y-1 w-full">
        <div className="flex items-center space-x-2">
          <input
            id={inputId}
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            {...props}
          />
          {label && typeof label === 'string' ? (
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {label}
            </label>
          ) : (
            label
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1 w-full">
      {label && typeof label === 'string' ? (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      ) : (
        label
      )}
      <input
        id={inputId}
        className={classes}
        type={type}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};