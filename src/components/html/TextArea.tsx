import {
  forwardRef, useEffect, useId, useRef,
  type FormEvent, type ReactNode, type TextareaHTMLAttributes,
} from 'react';
import { bg, border, focusBorder, focusRing, focusRingOf, placeholder, text } from '../../theme/tokens';
import { motion } from '../../theme/motion';
import { mergeRefs } from '../../internal/mergeRefs';

type TextAreaVariant = 'default' | 'outline' | 'filled' | 'minimal';
type TextAreaSize = 'small' | 'medium' | 'large';
type ResizeOption = 'vertical' | 'horizontal' | 'both' | 'none';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string | ReactNode;
  error?: string;
  helperText?: string;
  variant?: TextAreaVariant;
  size?: TextAreaSize;
  autoResize?: boolean;
  showCount?: boolean;
  resize?: ResizeOption;
}

const SIZE_CLASSES: Record<TextAreaSize, string> = {
  small:  'px-2 py-1 text-xs',
  medium: 'px-3 py-2 text-sm',
  large:  'px-4 py-3 text-base',
};

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
  size = 'medium',
  autoResize = false,
  showCount = false,
  resize = 'vertical',
  className = '',
  id,
  onInput: propsOnInput,
  ...props
}, ref) => {
  const autoId = useId();
  const textAreaId = id || `textarea-${autoId}`;
  const errorId = `${textAreaId}-error`;
  const helperId = `${textAreaId}-helper`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const classes = [baseCls, SIZE_CLASSES[size], VARIANT_CLASSES[variant], errorCls, resizeCls, className]
    .filter(Boolean).join(' ');

  const maxLength = typeof props.maxLength === 'number' ? props.maxLength : undefined;
  const currentLength =
    typeof props.value === 'string' ? props.value.length :
    typeof props.value === 'number' ? String(props.value).length : 0;

  const overLimit = maxLength !== undefined && currentLength > maxLength;

  return (
    <div className="space-y-1 w-full">
      {(label || showCount) && (
        <div className="flex items-baseline gap-2">
          <div className="flex-1">
            {label && (
              typeof label === 'string' ? (
                <label htmlFor={textAreaId} className={`block text-sm font-medium ${text.muted}`}>
                  {label}
                  {props.required && <span className={`ml-1 ${text.danger}`} aria-hidden="true">*</span>}
                </label>
              ) : label
            )}
          </div>
          {showCount && (
            <span className={`text-xs shrink-0 tabular-nums ${overLimit ? text.danger : text.faint}`}>
              {maxLength ? `${currentLength} / ${maxLength}` : currentLength}
            </span>
          )}
        </div>
      )}
      <textarea
        ref={mergeRefs(ref, textareaRef)}
        id={textAreaId}
        className={classes}
        onInput={handleInput}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className={`text-sm ${text.danger}`} role="alert">{error}</p>
      )}
      {helperText && !error && (
        <p id={helperId} className={`text-sm ${text.subtle}`}>{helperText}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';
