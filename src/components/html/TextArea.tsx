import {
  forwardRef, useEffect, useRef,
  type FormEvent, type ReactNode, type TextareaHTMLAttributes,
} from 'react';
import { bg, border, focusBorder, focusRing, focusRingOf, placeholder, text } from '../../theme/tokens';
import { motion } from '../../theme/motion';
import { useMergedRefs } from '../../internal/mergeRefs';
import { cn } from '../../internal/cn';
import { Field, describedBy, useFieldIds } from './Field';

type TextAreaVariant = 'default' | 'outline' | 'filled' | 'minimal';
/**
 * `sm | md | lg`, como el resto de la librería.
 *
 * Los nombres largos son los que tenía este componente antes y siguen
 * funcionando: cambiarlos de golpe habría roto todos los formularios que ya
 * los usan. Son equivalentes, no otro tamaño.
 */
type TextAreaSize = 'sm' | 'md' | 'lg';
type TextAreaSizeAntiguo = 'small' | 'medium' | 'large';
type ResizeOption = 'vertical' | 'horizontal' | 'both' | 'none';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string | ReactNode;
  error?: string;
  helperText?: string;
  variant?: TextAreaVariant;
  size?: TextAreaSize | TextAreaSizeAntiguo;
  autoResize?: boolean;
  showCount?: boolean;
  resize?: ResizeOption;
}

const SIZE_CLASSES: Record<TextAreaSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

const EQUIVALENCIAS: Record<TextAreaSizeAntiguo, TextAreaSize> = {
  small: 'sm', medium: 'md', large: 'lg',
};

/** `medium` y `md` son el mismo tamaño: esto traduce el nombre viejo al nuevo. */
export const normalizarTamano = (size: TextAreaSize | TextAreaSizeAntiguo): TextAreaSize =>
  size in EQUIVALENCIAS ? EQUIVALENCIAS[size as TextAreaSizeAntiguo] : size as TextAreaSize;

const VARIANT_CLASSES: Record<TextAreaVariant, string> = {
  default: `border ${border.base} ${bg.surface}`,
  outline: `border-2 ${border.accent} bg-transparent`,
  filled:  `border ${border.base} ${bg.surfaceMuted}`,
  minimal: `border-0 border-b ${border.base} bg-transparent rounded-none focus:ring-0`,
};

const RESIZE_CLASSES: Record<ResizeOption, string> = {
  vertical:   'resize-y',
  horizontal: 'resize-x',
  both:       'resize',
  none:       'resize-none',
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  autoResize = false,
  showCount = false,
  resize = 'vertical',
  className = '',
  id,
  onInput: propsOnInput,
  ...props
}, ref) => {
  const ids = useFieldIds(id, 'textarea');
  const textAreaId = ids.id;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const setTextArea = useMergedRefs<HTMLTextAreaElement>(ref, textareaRef);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (autoResize) adjustHeight();
  }, [autoResize, props.value]);

  const handleInput = (e: FormEvent<HTMLTextAreaElement>) => {
    if (autoResize) adjustHeight();
    propsOnInput?.(e);
  };

  const baseCls = `appearance-none relative block w-full ${placeholder} ${text.base} rounded-md border ${focusRing} ${focusBorder.accent} focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed ${motion.colors}`;
  const errorCls = error ? `${border.dangerSubtle} ${focusRingOf.danger} ${focusBorder.danger}` : '';
  const resizeCls = autoResize ? 'resize-none overflow-hidden' : RESIZE_CLASSES[resize];

  const classes = cn(baseCls, SIZE_CLASSES[normalizarTamano(size)], VARIANT_CLASSES[variant], errorCls, resizeCls, className);

  const maxLength = typeof props.maxLength === 'number' ? props.maxLength : undefined;
  const currentLength =
    typeof props.value === 'string' ? props.value.length :
    typeof props.value === 'number' ? String(props.value).length : 0;

  const overLimit = maxLength !== undefined && currentLength > maxLength;

  return (
    <Field
      label={label}
      htmlFor={textAreaId}
      error={error}
      errorId={ids.errorId}
      helperText={helperText}
      helperId={ids.helperId}
      required={props.required}
      // El contador va arriba a la derecha, en la línea de la etiqueta: abajo
      // se lo comería el mensaje de error justo cuando más falta hace verlo.
      labelAside={showCount
        ? (
          <span className={`text-xs shrink-0 tabular-nums ${overLimit ? text.danger : text.faint}`}>
            {maxLength ? `${currentLength} / ${maxLength}` : currentLength}
          </span>
        )
        : undefined}
    >
      <textarea
        ref={setTextArea}
        id={textAreaId}
        className={classes}
        onInput={handleInput}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, error, helperText)}
        {...props}
      />
    </Field>
  );
});

TextArea.displayName = 'TextArea';
