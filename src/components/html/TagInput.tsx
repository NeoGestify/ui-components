import {
  forwardRef, useCallback, useRef, useState,
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { border, focusRingOf, placeholder, text } from '../../theme/tokens';
import { bg } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useMergedRefs } from '../../internal/mergeRefs';
import { useControllableState } from '../../internal/useControllableState';
import { useMessage } from '../../context/config/NuiConfigProvider';
import { Badge } from './Badge';
import { Field, describedBy, useFieldIds } from './Field';

type TagInputSize = 'sm' | 'md' | 'lg';

const SIZE_PAD: Record<TagInputSize, string> = {
  sm: 'px-1.5 py-1 gap-1',
  md: 'px-2 py-1.5 gap-1.5',
  lg: 'px-2.5 py-2 gap-2',
};

const SIZE_TEXT: Record<TagInputSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const BADGE_SIZE: Record<TagInputSize, 'sm' | 'md' | 'lg'> = {
  sm: 'sm', md: 'sm', lg: 'md',
};

export interface TagInputProps extends AnimatableProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  label?: ReactNode;
  error?: string;
  helperText?: string;
  placeholder?: string;
  /** Teclas que cierran una etiqueta. Por defecto Intro y coma. */
  delimiters?: string[];
  /** Número máximo de etiquetas. Al llegar, el campo se bloquea. */
  max?: number;
  /** Permite repetidas. Por defecto no. */
  allowDuplicates?: boolean;
  /**
   * Normaliza cada etiqueta antes de guardarla. Devolver `null` la descarta,
   * que es la forma de validar sin pintar un error por cada intento.
   */
  transform?: (raw: string) => string | null;
  size?: TagInputSize;
  disabled?: boolean;
  required?: boolean;
  /** `name` para enviarlo en un `<form>`; un campo oculto por etiqueta. */
  name?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

/** Separa lo pegado por saltos de línea, tabuladores, comas y puntos y coma. */
function trocear(raw: string): string[] {
  return raw.split(/[\n\r\t,;]+/).map(s => s.trim()).filter(Boolean);
}

/**
 * Campo de etiquetas: se escribe, se pulsa Intro y queda una ficha.
 *
 * Frente a un `Combobox` múltiple, aquí los valores **no salen de una lista**:
 * los inventa quien escribe. Es lo que se quiere para etiquetas libres, correos
 * de invitación o palabras clave.
 *
 * Retroceso sobre el campo vacío borra la última ficha, y pegar una columna de
 * una hoja de cálculo crea una etiqueta por línea.
 *
 * ```tsx
 * <TagInput label="Etiquetas" value={tags} onChange={setTags} max={10} />
 * ```
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(({
  value,
  defaultValue,
  onChange,
  label,
  error,
  helperText,
  placeholder: placeholderText,
  delimiters = ['Enter', ','],
  max,
  allowDuplicates = false,
  transform,
  size = 'md',
  disabled = false,
  required = false,
  name,
  id,
  className = '',
  animate,
  'aria-label': ariaLabel,
}, ref) => {
  const ids = useFieldIds(id, 'taginput');
  const quitarLabel = useMessage('remove');

  const [tags, setTags] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange,
  });

  const [borrador, setBorrador] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setInput = useMergedRefs<HTMLInputElement>(ref, inputRef);

  const lleno = max !== undefined && tags.length >= max;

  const agregar = useCallback((crudas: string[]) => {
    setTags(prev => {
      const salida = [...prev];
      for (const cruda of crudas) {
        if (max !== undefined && salida.length >= max) break;
        const limpia = transform ? transform(cruda.trim()) : cruda.trim();
        if (!limpia) continue;
        if (!allowDuplicates && salida.includes(limpia)) continue;
        salida.push(limpia);
      }
      return salida;
    });
    setBorrador('');
  }, [setTags, transform, allowDuplicates, max]);

  const quitar = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, [setTags]);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (delimiters.includes(e.key)) {
      e.preventDefault();
      if (borrador.trim()) agregar([borrador]);
      return;
    }
    // Retroceso con el campo vacío borra la última: el gesto que todo el mundo
    // prueba antes de buscar la X.
    if (e.key === 'Backspace' && borrador === '' && tags.length > 0) {
      e.preventDefault();
      quitar(tags[tags.length - 1]);
    }
  }, [delimiters, borrador, agregar, tags, quitar]);

  const onPaste = useCallback((e: ReactClipboardEvent<HTMLInputElement>) => {
    const pegado = e.clipboardData.getData('text');
    const trozos = trocear(pegado);
    // Una sola palabra se deja escribir tal cual; el corte solo tiene sentido
    // cuando de verdad vienen varias.
    if (trozos.length <= 1) return;
    e.preventDefault();
    agregar(trozos);
  }, [agregar]);

  return (
    <Field
      label={label}
      htmlFor={ids.id}
      error={error}
      errorId={ids.errorId}
      helperText={helperText}
      helperId={ids.helperId}
      required={required}
      className={className}
      style={motionStyle(animate)}
    >
      {/* Pulsar en cualquier hueco lleva el foco al campo, como en un <input>
          de verdad: el envoltorio se comporta como si fuera el control.
          No lleva `role` ni `tabIndex` a propósito — no es un control, es la
          caja que lo rodea; quien va con teclado llega al campo tabulando y
          esto solo existe para el ratón. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        onMouseDown={e => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
        className={cn(
          'flex w-full flex-wrap items-center rounded-md border',
          SIZE_PAD[size], bg.surface, border.base, motion.colors,
          'focus-within:ring-2 focus-within:ring-[color:var(--nui-ring,oklch(58.5%_.233_277.117))] dark:focus-within:ring-[color:var(--nui-ring-dark,oklch(67.3%_.182_276.935))]',
          'focus-within:border-[color:var(--nui-ring,oklch(58.5%_.233_277.117))] dark:focus-within:border-[color:var(--nui-ring-dark,oklch(67.3%_.182_276.935))]',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text',
          error ? `${border.dangerSubtle} ${focusRingOf.danger}` : '',
        )}
      >
        {tags.map(tag => (
          <Badge
            key={tag}
            variant="accent"
            size={BADGE_SIZE[size]}
            onRemove={disabled ? undefined : () => quitar(tag)}
            removeLabel={`${quitarLabel} ${tag}`}
          >
            {tag}
          </Badge>
        ))}

        <input
          ref={setInput}
          id={ids.id}
          type="text"
          autoComplete="off"
          value={borrador}
          disabled={disabled || lleno}
          required={required && tags.length === 0}
          placeholder={tags.length === 0 || !lleno ? placeholderText : undefined}
          aria-label={label === undefined ? ariaLabel : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, error, helperText)}
          onChange={e => setBorrador(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          // Salir del campo con algo a medio escribir lo da por bueno; si no,
          // se pierde sin avisar y parece que el componente lo ha comido.
          onBlur={() => borrador.trim() && agregar([borrador])}
          className={cn(
            'min-w-[6rem] flex-1 bg-transparent px-1 py-0.5 outline-none',
            SIZE_TEXT[size], placeholder, text.base,
            'disabled:cursor-not-allowed',
          )}
        />
      </div>

      {name && tags.map(t => <input key={t} type="hidden" name={name} value={t} />)}
    </Field>
  );
});

TagInput.displayName = 'TagInput';
