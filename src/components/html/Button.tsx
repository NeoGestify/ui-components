import { AnimateSpin } from '../icons/icons';
import { type ButtonHTMLAttributes, type FC, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon' | 'danger' | 'success' | 'outline' | 'nav' | 'custom' | 'link' | 'warning' | 'toggle';
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  isActive?: boolean;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  children,
  isLoading = false,
  loadingText,
  isActive = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer';

  const variantClasses = {
    primary: 'py-2 px-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
    secondary: 'p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:ring-indigo-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
    icon: 'p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full focus:ring-indigo-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
    danger: 'py-2 px-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
    success: 'py-2 px-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
    outline: 'py-2 px-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-indigo-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
    nav: 'w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:scale-105 text-gray-700 dark:text-gray-300 dark:hover:text-white hover:shadow-lg',
    custom: "",
    link: 'text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200',
    warning: 'py-2 px-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
    toggle: 'px-2 py-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  };

  let classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (variant === 'nav' && isActive) {
    classes += ' bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white shadow-lg scale-105';
  }

  if (variant === 'nav' && !isActive) {
    classes += ' hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg';
  }

  if (variant === 'toggle') {
    if (isActive) {
      classes += ' bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700';
    } else {
      classes += ' bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500';
    }
  }

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <AnimateSpin className="h-5 w-5 mr-2 inline-block text-current" />
          {loadingText || 'Cargando...'}
        </>
      ) : (
        children
      )}
    </button>
  );
};