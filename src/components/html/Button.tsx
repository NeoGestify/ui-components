import { AnimateSpin } from '../icons/icons';
import { type ButtonHTMLAttributes, type FC, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'icon' | 'danger' | 'success' | 'outline' | 'nav' | 'custom' | 'link' | 'warning' | 'toggle' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonShape = 'rounded' | 'pill' | 'square';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  isActive?: boolean;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  shape?: ButtonShape;
}

const BASE = 'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2';

const SIZE_PAD: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

const SIZE_ICON_PAD: Record<ButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

const SHAPE_CLASS: Record<ButtonShape, string> = {
  rounded: 'rounded-md',
  pill:    'rounded-full',
  square:  'rounded-none',
};

const VARIANT_STYLE: Record<ButtonVariant, string> = {
  primary:   'border border-indigo-600/20 dark:border-indigo-500/20 font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
  secondary: 'font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
  icon:      'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
  danger:    'border border-red-600/20 dark:border-red-500/20 font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
  success:   'border border-green-600/20 dark:border-green-500/20 font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
  outline:   'border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
  nav:       'w-full px-4 py-2 text-sm font-medium hover:scale-105 text-gray-700 dark:text-gray-300 dark:hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
  custom:    '',
  link:      'text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 rounded-lg px-2',
  warning:   'border border-yellow-600/20 dark:border-yellow-500/20 font-medium text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
  toggle:    'font-medium border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
  ghost:     'font-medium text-indigo-600 dark:text-indigo-400 bg-transparent border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900',
};

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  children,
  isLoading = false,
  loadingText,
  isActive = false,
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  shape,
  className = '',
  disabled,
  ...props
}) => {
  const sizeCls = variant === 'icon'
    ? SIZE_ICON_PAD[size]
    : variant === 'nav' || variant === 'link' || variant === 'custom'
      ? ''
      : SIZE_PAD[size];

  const defaultShape: ButtonShape = variant === 'icon' ? 'pill' : 'rounded';
  const shapeCls = variant === 'link' || variant === 'custom' ? '' : SHAPE_CLASS[shape ?? defaultShape];

  let stateCls = '';
  if (variant === 'nav') {
    stateCls = isActive
      ? 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white shadow-lg scale-105'
      : 'hover:bg-white dark:hover:bg-gray-700';
  }
  if (variant === 'toggle') {
    stateCls = isActive
      ? 'bg-indigo-600 text-white border-indigo-600/30 dark:border-indigo-500/30 hover:bg-indigo-700'
      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600';
  }

  const classes = [
    BASE,
    VARIANT_STYLE[variant],
    sizeCls,
    shapeCls,
    stateCls,
    fullWidth ? 'w-full justify-center' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <>
          <AnimateSpin className="h-4 w-4 shrink-0 text-current" />
          {loadingText ?? 'Cargando...'}
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
