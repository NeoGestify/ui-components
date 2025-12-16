import { type TextareaHTMLAttributes, type FC, type ReactNode } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string | ReactNode;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outline' | 'filled' | 'minimal';
  size?: 'small' | 'medium' | 'large';
}

export const TextArea: FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'medium',
  className = '',
  id,
  ...props
}) => {
  const textAreaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  const variantClasses = {
    default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
    outline: 'border-2 border-indigo-300 dark:border-indigo-600 bg-transparent',
    filled: 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700',
    minimal: 'border-0 bg-transparent focus:ring-0 focus:border-0'
  };

  const baseClasses = 'appearance-none relative block w-full placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 resize-vertical';

  const errorClasses = error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500' : '';

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${errorClasses} ${className}`;

  return (
    <div className="space-y-1 w-full">
      {label && typeof label === 'string' ? (
        <label
          htmlFor={textAreaId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      ) : (
        label
      )}
      <textarea
        id={textAreaId}
        className={classes}
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