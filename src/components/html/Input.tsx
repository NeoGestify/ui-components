import {
  forwardRef, useCallback, useRef, useState,
  type ChangeEvent, type InputHTMLAttributes, type ReactNode,
} from 'react';
import { useMergedRefs } from '../../internal/mergeRefs';
import { CloseIcon } from '../icons/icons';
import {
  bg, border, focusBorder, focusRing, focusRingOf, placeholder, text, textHover,
} from '../../theme/tokens';
import { motion } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { Field, describedBy as describedByOf, useFieldIds } from './Field';
import { useMessage } from '../../context/config/NuiConfigProvider';

type InputVariant = 'default' | 'outline' | 'filled' | 'minimal';
type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string | ReactNode;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconSide?: 'left' | 'right';
  variant?: InputVariant;
  size?: InputSize;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /**
   * Muestra una X para vaciar el campo. Funciona igual controlado que sin
   * controlar; en el segundo caso el componente vigila el valor del DOM.
   */
  clearable?: boolean;
  /** Texto accesible del botón de limpiar. Por defecto, el del `NuiConfigProvider`. */
  clearLabel?: string;
  onClear?: () => void;
}

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

export const Input = forwardRef<HTMLInputElement, InputProps>(({
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
  clearLabel,
  onClear,
  className = '',
  id,
  type,
  value,
  defaultValue,
  onChange,
  required,
  disabled,
  ...props
}, ref) => {
  const clearText = useMessage('clear', clearLabel);
  const ids = useFieldIds(id, 'input');
  const inputId = ids.id;

  // El campo puede venir controlado o no. Para lo controlado manda `value`; para
  // lo demás se recuerda si hay contenido, que es lo único que necesita la X.
  const isControlled = value !== undefined;
  const [hasText, setHasText] = useState(() => String(defaultValue ?? '') !== '');
  const filled = isControlled ? String(value) !== '' : hasText;

  const innerRef = useRef<HTMLInputElement | null>(null);
  const setInput = useMergedRefs<HTMLInputElement>(ref, innerRef);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setHasText(e.target.value !== '');
    onChange?.(e);
  }, [isControlled, onChange]);

  // Sin control nadie está pintando el valor, así que hay que vaciar el nodo a
  // mano. Se hace por el `setter` nativo y disparando un `input` real en vez de
  // asignar `el.value`: React guarda el último valor que vio y, si se lo cambias
  // por detrás, considera que no ha habido cambio y no llama a `onChange`.
  const handleClear = useCallback(() => {
    const el = innerRef.current;
    if (!isControlled && el) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter ? setter.call(el, '') : (el.value = '');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      setHasText(false);
    }
    onClear?.();
    el?.focus();
  }, [isControlled, onClear]);

  const errorCls = error
    ? `${border.dangerSubtle} ${focusRingOf.danger} ${focusBorder.danger}`
    : '';

  const showClear = clearable && !disabled && filled;
  const hasRightSlot = (icon && iconSide === 'right') || showClear;

  // `aria-describedby` es lo que ata el mensaje al campo: sin él, el lector de
  // pantalla anuncia el error suelto y el usuario nunca sabe de cuál es.
  const describedBy = describedByOf(ids, error, helperText);
  const commonAria = {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    required,
    disabled,
  };

  // `color-scheme` alinea los widgets nativos (calendario de date/datetime,
  // flechas de number, autocompletado) con el tema activo.
  const baseCls = `appearance-none relative block w-full [color-scheme:light] dark:[color-scheme:dark] ${placeholder} ${text.base} rounded-md ${focusRing} ${focusBorder.accent} focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed ${motion.colors}`;

  const inputCls = cn(
    baseCls,
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    errorCls,
    icon && iconSide === 'left' ? 'pl-9' : '',
    hasRightSlot ? 'pr-9' : '',
    prefix ? 'rounded-l-none' : '',
    suffix ? 'rounded-r-none' : '',
    className,
  );

  // ── Checkbox / Radio ──────────────────────────────────────────────────────
  const toggleCls = cn(
    `h-4 w-4 ${type === 'radio' ? 'rounded-full' : 'rounded'} border ${border.base} ${bg.surface} [color-scheme:light] dark:[color-scheme:dark]`,
    'accent-[var(--nui-accent,oklch(51.1%_.262_276.966))] dark:accent-[var(--nui-accent-dark,oklch(58.5%_.233_277.117))]',
    `${text.accent} ${focusRing}`,
    'focus:ring-offset-2 focus:ring-offset-[color:var(--nui-surface,#fff)] dark:focus:ring-offset-[color:var(--nui-surface-sunken-dark,oklch(21%_.034_264.665))]',
    `disabled:opacity-50 disabled:cursor-not-allowed ${motion.colors} cursor-pointer`,
    error ? `${border.dangerSubtle} ${focusRingOf.danger}` : '',
  );

  // ── File input ────────────────────────────────────────────────────────────
  const fileCls = cn(
    `block w-full ${text.subtle} ${bg.surface} border rounded-md`,
    `${focusRing} ${focusBorder.accent}`,
    `disabled:opacity-50 disabled:cursor-not-allowed ${motion.colors}`,
    'file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium',
    'file:bg-[var(--nui-accent-soft,oklch(96.2%_.018_272.314))] dark:file:bg-[var(--nui-accent-soft-dark,oklch(58.5%_.233_277.117_/_.15))]',
    'file:text-[color:var(--nui-accent-text,oklch(51.1%_.262_276.966))] dark:file:text-[color:var(--nui-accent-text-dark,oklch(67.3%_.182_276.935))]',
    'file:transition-colors file:duration-[var(--nui-duration-fast,120ms)] motion-reduce:file:transition-none file:cursor-pointer',
    SIZE_CLASSES[size],
    error ? `${border.dangerSubtle} ${focusRingOf.danger}` : border.base,
    className,
  );

  // `hidden` puesto por el consumidor va sobre el campo, pero quien tiene que
  // desaparecer es la fila entera con su etiqueta y su mensaje.
  const hasHidden = Boolean(className && /\bhidden\b/.test(className));

  /** Etiqueta, error y ayuda: los mismos de todos los campos de la librería. */
  const campo = (children: ReactNode, conEtiqueta = true) => (
    <Field
      label={conEtiqueta ? label : undefined}
      htmlFor={inputId}
      error={error}
      errorId={ids.errorId}
      helperText={helperText}
      helperId={ids.helperId}
      required={required}
      className={hasHidden ? 'hidden' : ''}
    >
      {children}
    </Field>
  );

  if (type === 'checkbox' || type === 'radio') {
    // Aquí la etiqueta va AL LADO de la casilla, no encima, así que no la pone
    // `Field`: solo se le deja el error y el texto de ayuda.
    return campo(
      <div className="flex items-center space-x-2">
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={toggleCls}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          {...commonAria}
          {...props}
        />
        {label && (
          typeof label === 'string' ? (
            <label htmlFor={inputId} className={`block text-sm font-medium ${text.muted}`}>
              {label}
              {required && <span className={`ml-1 ${text.danger}`} aria-hidden="true">*</span>}
            </label>
          ) : label
        )}
      </div>,
      false,
    );
  }

  if (type === 'file') {
    return campo(
      <input
        ref={ref}
        id={inputId}
        type="file"
        className={fileCls}
        onChange={onChange}
        {...commonAria}
        {...props}
      />,
    );
  }

  const prefixBorderCls = error ? border.dangerSubtle : border.base;

  return campo(
    <>
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
          <input
            ref={setInput}
            id={inputId}
            className={inputCls}
            type={type}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            {...commonAria}
            {...props}
          />
          {icon && iconSide === 'right' && !showClear && (
            <div className={`pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-3 ${text.faint}`}>
              {icon}
            </div>
          )}
          {showClear && (
            <button
              type="button"
              onClick={handleClear}
              tabIndex={-1}
              aria-label={clearText}
              className={`absolute inset-y-0 right-0 z-10 flex items-center pr-3 ${text.faint} ${textHover.muted}`}
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
    </>,
  );
});

Input.displayName = 'Input';
