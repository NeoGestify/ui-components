import { useId, type InputHTMLAttributes, type FC, type ReactNode } from 'react';
import { CloseIcon } from '../icons/icons';
import {
  bg, border, focusBorder, focusRing, focusRingOf, placeholder, text,
} from '../../theme/tokens';

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

/** Reutilizado por el botón de limpiar. */
const textHoverMuted =
  'hover:text-[var(--nui-text-muted,oklch(37.3%_.034_259.733))] dark:hover:text-[var(--nui-text-muted-dark,oklch(87.2%_.01_258.338))]';

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

const VARIANT_CLASSES: Record<InputVariant, string> = {
  default: `border ${border.base} ${bg.surface}`,
  outline: `border-2 ${border.accent} bg-transparent`,
  filled:  `border ${border.base} ${bg.surfaceMuted}`,
  minimal: `border-0 border-b ${border.base} bg-transparent rounded-none focus:ring-0`,
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
  const autoId = useId();
  const inputId = id || `input-${autoId}`;

  const errorCls = error
    ? `${border.dangerSubtle} ${focusRingOf.danger} ${focusBorder.danger}`
    : '';

  const showClear = clearable && !props.disabled && props.value !== undefined && props.value !== '';
  const hasRightSlot = (icon && iconSide === 'right') || showClear;

  // `color-scheme` alinea los widgets nativos (calendario de date/datetime,
  // flechas de number, autocompletado) con el tema activo.
  const baseCls = `appearance-none relative block w-full [color-scheme:light] dark:[color-scheme:dark] ${placeholder} ${text.base} rounded-md ${focusRing} ${focusBorder.accent} focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`;

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
    `h-4 w-4 ${type === 'radio' ? 'rounded-full' : 'rounded'} border ${border.base} ${bg.surface} [color-scheme:light] dark:[color-scheme:dark]`,
    'accent-[var(--nui-accent,oklch(51.1%_.262_276.966))] dark:accent-[var(--nui-accent-dark,oklch(58.5%_.233_277.117))]',
    `${text.accent} ${focusRing}`,
    'focus:ring-offset-2 focus:ring-offset-[var(--nui-surface,#fff)] dark:focus:ring-offset-[var(--nui-surface-sunken-dark,oklch(21%_.034_264.665))]',
    'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer',
    error ? `${border.dangerSubtle} ${focusRingOf.danger}` : '',
  ].filter(Boolean).join(' ');

  // ── File input ────────────────────────────────────────────────────────────
  const fileCls = [
    `block w-full ${text.subtle} ${bg.surface} border rounded-md`,
    `${focusRing} ${focusBorder.accent}`,
    'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200',
    'file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium',
    'file:bg-[var(--nui-accent-soft,oklch(96.2%_.018_272.314))] dark:file:bg-[var(--nui-accent-soft-dark,oklch(58.5%_.233_277.117_/_.15))]',
    'file:text-[var(--nui-accent-text,oklch(51.1%_.262_276.966))] dark:file:text-[var(--nui-accent-text-dark,oklch(67.3%_.182_276.935))]',
    'file:transition-colors file:duration-200 file:cursor-pointer',
    SIZE_CLASSES[size],
    error ? `${border.dangerSubtle} ${focusRingOf.danger}` : border.base,
    className,
  ].filter(Boolean).join(' ');

  const hasHidden = Boolean(className && /\bhidden\b/.test(className));
  const wrapperCls = `space-y-1 w-full${hasHidden ? ' hidden' : ''}`;

  const labelNode = label && (
    typeof label === 'string' ? (
      <label htmlFor={inputId} className={`block text-sm font-medium ${text.muted}`}>
        {label}
        {props.required && <span className={`ml-1 ${text.danger}`} aria-hidden="true">*</span>}
      </label>
    ) : label
  );

  const errorNode = error && (
    <p className={`text-sm ${text.danger}`} role="alert">{error}</p>
  );

  const helperNode = helperText && !error && (
    <p className={`text-sm ${text.subtle}`}>{helperText}</p>
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

  const prefixBorderCls = error ? border.dangerSubtle : border.base;

  return (
    <div className={wrapperCls}>
      {labelNode}
      <div className="flex">
        {prefix && (
          <span className={`inline-flex shrink-0 items-center px-3 border border-r-0 ${prefixBorderCls} ${bg.surfaceMuted} ${text.subtle} rounded-l-md text-sm`}>
            {prefix}
          </span>
        )}
        <div className="relative flex-1">
          {icon && iconSide === 'left' && (
            <div className={`pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 ${text.faint}`}>
              {icon}
            </div>
          )}
          <input id={inputId} className={inputCls} type={type} {...props} />
          {icon && iconSide === 'right' && !showClear && (
            <div className={`pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-3 ${text.faint}`}>
              {icon}
            </div>
          )}
          {showClear && (
            <button
              type="button"
              onClick={onClear}
              tabIndex={-1}
              aria-label="Limpiar"
              className={`absolute inset-y-0 right-0 z-10 flex items-center pr-3 ${text.faint} ${textHoverMuted}`}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {suffix && (
          <span className={`inline-flex shrink-0 items-center px-3 border border-l-0 ${prefixBorderCls} ${bg.surfaceMuted} ${text.subtle} rounded-r-md text-sm`}>
            {suffix}
          </span>
        )}
      </div>
      {errorNode}
      {helperNode}
    </div>
  );
};
