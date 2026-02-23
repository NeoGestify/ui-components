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

  // ── Default text input ────────────────────────────────────────────────────
  const baseClasses = 'appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';
  const errorClasses = error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500' : 'border-gray-300 dark:border-gray-600';
  const classes = `${baseClasses} ${errorClasses} ${className}`;

  // ── Checkbox ──────────────────────────────────────────────────────────────
  const checkboxBaseClasses = 'h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer';
  const checkboxErrorClasses = error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400' : '';
  const checkboxClasses = `${checkboxBaseClasses} ${checkboxErrorClasses}`.trim();

  // ── File input ────────────────────────────────────────────────────────────
  const fileBaseClasses = 'block w-full sm:text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800/50 file:transition-colors file:duration-200 file:cursor-pointer';
  const fileErrorClasses = error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400' : 'border-gray-300 dark:border-gray-600';
  const fileClasses = `${fileBaseClasses} ${fileErrorClasses} ${className}`.trim();

  const hasHidden = Boolean(className && /\bhidden\b/.test(className));
  const wrapperBase = 'space-y-1 w-full';
  const wrapperClasses = hasHidden ? `${wrapperBase} hidden` : wrapperBase;

  if (type === 'checkbox') {
    return (
      <div className={wrapperClasses}>
        <div className="flex items-center space-x-2">
          <input
            id={inputId}
            type="checkbox"
            className={checkboxClasses}
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

  if (type === 'file') {
    return (
      <div className={wrapperClasses}>
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
          type="file"
          className={fileClasses}
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
  }

  return (
    <div className={wrapperClasses}>
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