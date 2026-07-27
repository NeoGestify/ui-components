import { AnimateSpin } from '../icons/icons';
import { type ButtonHTMLAttributes, type FC, type ReactNode } from 'react';
import {
  bg, bgHover, bgHoverOf, border, borderSoft, focusRing, focusRingOf, ringOffset, text, textHover,
} from '../../theme/tokens';

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
  primary:   `border ${borderSoft.accent} font-medium ${text.onAccent} ${bg.accent} ${bgHover.accent} ${focusRing} ${ringOffset}`,
  secondary: `font-medium ${text.subtle} ${textHover.base} ${bgHover.surface} border ${border.base} shadow-sm hover:shadow-md ${focusRing} ${ringOffset}`,
  icon:      `${text.subtle} ${textHover.base} ${bgHover.surface} ${focusRing} ${ringOffset}`,
  danger:    `border ${borderSoft.danger} font-medium ${text.onAccent} ${bg.danger} ${bgHover.danger} ${focusRingOf.danger} ${ringOffset}`,
  success:   `border ${borderSoft.success} font-medium ${text.onAccent} ${bg.success} ${bgHoverOf.success} ${focusRingOf.success} ${ringOffset}`,
  outline:   `border ${border.base} font-medium ${text.muted} bg-transparent ${bgHover.surface} ${focusRing} ${ringOffset}`,
  nav:       `w-full px-4 py-2 text-sm font-medium motion-safe:hover:scale-105 ${text.muted} ${textHover.base} hover:shadow-lg ${focusRing} ${ringOffset}`,
  custom:    '',
  link:      `text-sm ${text.accent} ${textHover.accent} ${focusRing} ${ringOffset} rounded-lg px-2`,
  warning:   `border ${borderSoft.warning} font-medium ${text.onAccent} ${bg.warning} ${bgHoverOf.warning} ${focusRingOf.warning} ${ringOffset}`,
  toggle:    `font-medium border-2 ${focusRing} ${ringOffset}`,
  ghost:     `font-medium ${text.accent} bg-transparent border ${border.accentSubtle} ${bgHover.accentSoft} ${focusRing} ${ringOffset}`,
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
      ? `${bg.accent} ${bgHover.accent} ${text.onAccent} shadow-lg scale-105`
      : bgHover.surface;
  }
  if (variant === 'toggle') {
    stateCls = isActive
      ? `${bg.accent} ${text.onAccent} ${borderSoft.accent} ${bgHover.accent}`
      : `${bg.surfaceMuted} ${text.muted} ${border.base} ${bgHover.surface}`;
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
