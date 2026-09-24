import {
  useCallback, useEffect, useMemo, useRef, useState,
  type FC, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import { CheckIcon, ChevronDownIcon, CloseIcon } from '../icons/icons';
import { bg, bgHover, border, focusBorder, focusRingOf, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import type { NuiOption } from '../../internal/options';
import { Field, useFieldIds } from './Field';
import { Portal } from '../../internal/Portal';
import { useAnchoredPosition } from '../../internal/useAnchoredPosition';
import { useControllableState } from '../../internal/useControllableState';
import { useDismiss } from '../../internal/useDismiss';
import { useMergedRefs } from '../../internal/mergeRefs';
import { useNuiConfig } from '../../context/config/NuiConfigProvider';

/**
 * @see NuiOption — es el mismo tipo que usan el resto de selectores.
 *
 * Con una diferencia: aquí la etiqueta y la descripción se escriben como
 * `string` y no como `ReactNode`. Son el texto sobre el que se busca —y la
 * etiqueta, además, lo que se copia al campo al elegir—, así que tienen que
 * poder leerse sin renderizarlas.
 */
export type ComboboxOption =
  Omit<NuiOption, 'label' | 'description'>
  & { label: string; description?: string };

interface ComboboxBase extends AnimatableProps {
  options: ComboboxOption[];
  label?: ReactNode;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  /** Permite vaciar la selección. */
  clearable?: boolean;
  /** Filtro propio. Por defecto busca sin distinguir mayúsculas ni acentos. */
  filter?: (option: ComboboxOption, query: string) => boolean;
  /** Nodo a mostrar cuando el filtro no encuentra nada. */
  emptyState?: ReactNode;
  /** Altura máxima de la lista, en píxeles. */
  maxListHeight?: number;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export interface ComboboxProps extends ComboboxBase {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface ComboboxMultipleProps extends ComboboxBase {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Máximo de fichas antes de resumir con «+N». */
  maxTags?: number;
}

/** Quita acentos y pasa a minúsculas: «Módulo» encuentra «modulo». */
function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const filtroPorDefecto = (option: ComboboxOption, query: string): boolean => {
  const q = normalizar(query);
  return normalizar(option.label).includes(q)
    || (option.description ? normalizar(option.description).includes(q) : false);
};

/**
 * Selector con búsqueda, en una o varias opciones.
 *
 * `Select` envuelve el `<select>` nativo, que no busca ni admite selección
 * múltiple usable. Este lo sustituye cuando la lista pasa de una docena de
 * elementos; para tres o cuatro sigue siendo mejor el nativo, que en móvil abre
 * la rueda del sistema.
 *
 * ```tsx
 * <Combobox label="País" options={paises} value={pais} onChange={setPais} />
 *
 * <Combobox
 *   multiple
 *   label="Etiquetas"
 *   options={etiquetas}
 *   value={activas}
 *   onChange={setActivas}
 * />
 * ```
 *
 * Sigue el patrón ARIA de `combobox`: el campo mantiene el foco todo el tiempo
 * y la opción resaltada se comunica con `aria-activedescendant`. Mover el foco
 * a la lista rompería la escritura, que es justo lo que se está haciendo.
 */
export const Combobox: FC<ComboboxProps | ComboboxMultipleProps> = (props) => {
  const {
    options, label, placeholder, helperText, error, disabled = false, required = false,
    clearable = true, filter = filtroPorDefecto, emptyState, maxListHeight = 280,
    animate, className = '', id, name, 'aria-label': ariaLabel,
  } = props;

  const multiple = props.multiple === true;
  const { messages } = useNuiConfig();

  const ids = useFieldIds(id, 'combobox');
  const baseId = ids.id;
  const listId = `${baseId}-list`;
  const errorId = ids.errorId;
  const helperId = ids.helperId;

  const [seleccion, setSeleccion] = useControllableState<string[]>({
    value: props.value === undefined
      ? undefined
      : multiple ? (props.value as string[]) : [props.value as string].filter(Boolean),
    defaultValue: props.defaultValue === undefined
      ? []
      : multiple ? (props.defaultValue as string[]) : [props.defaultValue as string].filter(Boolean),
    onChange: (next) => {
      if (multiple) (props.onChange as ((v: string[]) => void) | undefined)?.(next);
      else (props.onChange as ((v: string) => void) | undefined)?.(next[0] ?? '');
    },
  });

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activo, setActivo] = useState(0);

  const anchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [listaEl, setListaEl] = useState<HTMLDivElement | null>(null);
  const setLista = useMergedRefs<HTMLDivElement>(listRef, setListaEl);

  const pos = useAnchoredPosition(open, anchorRef, listaEl, { placement: 'bottom-start', gap: 4 });

  const cerrar = useCallback(() => { setOpen(false); setQuery(''); }, []);
  useDismiss(open, [anchorRef, listRef], cerrar);

  const filtradas = useMemo(
    () => (query ? options.filter(o => filter(o, query)) : options),
    [options, query, filter],
  );
  const seleccionables = useMemo(() => filtradas.filter(o => !o.disabled), [filtradas]);

  // Al cambiar el filtro, el índice anterior puede apuntar fuera de la lista.
  useEffect(() => { setActivo(0); }, [query]);

  // La opción resaltada tiene que verse aunque se navegue con el teclado.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>('[data-activo="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activo, open]);

  const etiquetaDe = useCallback(
    (v: string) => options.find(o => o.value === v)?.label ?? v,
    [options],
  );

  const alternar = useCallback((v: string) => {
    if (multiple) {
      setSeleccion(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]));
      // La lista sigue abierta: en selección múltiple lo normal es marcar
      // varias seguidas. Se limpia la búsqueda para no dejarla filtrada.
      setQuery('');
      inputRef.current?.focus();
    } else {
      setSeleccion([v]);
      cerrar();
      inputRef.current?.focus();
    }
  }, [multiple, setSeleccion, cerrar]);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    const ultimo = seleccionables.length - 1;

    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActivo(i => (i >= ultimo ? 0 : i + 1));
        return;
      case 'ArrowUp':
        e.preventDefault();
        setActivo(i => (i <= 0 ? ultimo : i - 1));
        return;
      case 'Home':
        e.preventDefault(); setActivo(0); return;
      case 'End':
        e.preventDefault(); setActivo(ultimo); return;
      case 'Enter':
        e.preventDefault();
        if (seleccionables[activo]) alternar(seleccionables[activo].value);
        return;
      case 'Escape':
        e.preventDefault(); cerrar(); return;
      case 'Tab':
        cerrar(); return;
      case 'Backspace':
        // Con el campo vacío, Backspace quita la última ficha: es lo que hace
        // cualquier campo de etiquetas y evita tener que apuntar con el ratón.
        if (multiple && !query && seleccion.length) {
          setSeleccion(prev => prev.slice(0, -1));
        }
        return;
    }
  }, [open, seleccionables, activo, alternar, cerrar, multiple, query, seleccion.length, setSeleccion]);

  const hayError = Boolean(error);
  const describedBy = hayError ? errorId : helperText ? helperId : undefined;
  const maxTags = (props as ComboboxMultipleProps).maxTags ?? 3;
  const visibles = multiple ? seleccion.slice(0, maxTags) : [];
  const ocultas = multiple ? seleccion.length - visibles.length : 0;

  // ── Agrupación ────────────────────────────────────────────────────────────
  // Se conserva el orden en que aparecen los grupos en `options`, no el
  // alfabético: el orden lo decide quien pasa los datos.
  const grupos = useMemo(() => {
    const mapa = new Map<string, ComboboxOption[]>();
    for (const o of filtradas) {
      const g = o.group ?? '';
      if (!mapa.has(g)) mapa.set(g, []);
      mapa.get(g)!.push(o);
    }
    return [...mapa.entries()];
  }, [filtradas]);

  let indice = -1;

  return (
    <Field
      label={label}
      htmlFor={baseId}
      error={error}
      errorId={errorId}
      helperText={helperText}
      helperId={helperId}
      required={required}
      className={className}
      style={motionStyle(animate)}
    >
      <div
        ref={anchorRef}
        className={cn(
          'flex w-full flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5',
          motion.colors,
          bg.surface,
          hayError ? `${border.dangerSubtle} ${focusRingOf.danger}` : border.base,
          disabled && 'opacity-50 cursor-not-allowed',
          open && !hayError && `${focusBorder.accent}`,
        )}
      >
        {visibles.map(v => (
          <span
            key={v}
            className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs', bg.accentSoft, text.accent)}
          >
            {etiquetaDe(v)}
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              aria-label={`${messages.clear}: ${etiquetaDe(v)}`}
              onClick={() => setSeleccion(prev => prev.filter(x => x !== v))}
              className="cursor-pointer shrink-0"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        {ocultas > 0 && (
          <span className={cn('text-xs', text.subtle)}>+{ocultas}</span>
        )}

        <input
          ref={inputRef}
          id={baseId}
          role="combobox"
          type="text"
          autoComplete="off"
          disabled={disabled}
          required={required}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={hayError || undefined}
          aria-describedby={describedBy}
          // El foco no se mueve a la lista: se dice cuál está resaltada. Si el
          // foco saltara, dejaría de poder escribirse, que es el punto entero.
          aria-activedescendant={open && seleccionables[activo] ? `${baseId}-op-${seleccionables[activo].value}` : undefined}
          value={open ? query : multiple ? '' : (seleccion[0] ? etiquetaDe(seleccion[0]) : '')}
          placeholder={
            multiple
              ? (seleccion.length ? '' : placeholder ?? messages.select)
              : (seleccion.length ? undefined : placeholder ?? messages.select)
          }
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            'min-w-[6rem] flex-1 bg-transparent text-sm outline-none',
            text.base,
            'disabled:cursor-not-allowed',
          )}
        />

        {clearable && seleccion.length > 0 && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={messages.clear}
            onClick={() => { setSeleccion([]); setQuery(''); inputRef.current?.focus(); }}
            className={cn('cursor-pointer', 'shrink-0', text.faint)}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
        <ChevronDownIcon
          aria-hidden="true"
          className={cn('h-4 w-4 shrink-0', text.faint, motion.transform, open && 'rotate-180')}
        />
      </div>

      {name && (multiple
        ? seleccion.map(v => <input key={v} type="hidden" name={name} value={v} />)
        : <input type="hidden" name={name} value={seleccion[0] ?? ''} />
      )}

      {open && (
        <Portal>
          <div
            ref={setLista}
            id={listId}
            role="listbox"
            aria-label={typeof label === 'string' ? label : ariaLabel}
            aria-multiselectable={multiple || undefined}
            style={{
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              width: anchorRef.current?.offsetWidth,
              maxHeight: maxListHeight,
              ...motionStyle(animate),
            }}
            className={cn(
              'fixed z-[60] overflow-y-auto rounded-lg border py-1 shadow-xl',
              bg.surface, border.subtle,
            )}
          >
            {filtradas.length === 0 && (
              <p className={cn('px-3 py-6 text-center text-sm', text.subtle)}>
                {emptyState ?? messages.noResults}
              </p>
            )}

            {grupos.map(([nombre, opciones]) => (
              <div key={nombre || '_'} role="group" aria-label={nombre || undefined}>
                {nombre && (
                  <p className={cn('px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide', text.faint)}>
                    {nombre}
                  </p>
                )}
                {opciones.map(option => {
                  if (!option.disabled) indice++;
                  const i = indice;
                  const marcada = seleccion.includes(option.value);
                  const resaltada = !option.disabled && i === activo;
                  return (
                    <div
                      key={option.value}
                      id={`${baseId}-op-${option.value}`}
                      role="option"
                      aria-selected={marcada}
                      aria-disabled={option.disabled || undefined}
                      data-activo={resaltada}
                      // El ratón resalta lo mismo que el teclado, para que no
                      // haya dos ideas distintas de «la opción actual».
                      onPointerEnter={() => { if (!option.disabled) setActivo(i); }}
                      // `pointerdown` y no `click`: el `click` llega después del
                      // `blur` del campo, que ya habría cerrado la lista.
                      onPointerDown={e => {
                        e.preventDefault();
                        if (!option.disabled) alternar(option.value);
                      }}
                      className={cn(
                        'flex cursor-pointer items-start gap-2 px-3 py-2 text-sm',
                        motion.colors,
                        option.disabled && 'opacity-40 cursor-not-allowed',
                        resaltada && bg.surfaceHover,
                        bgHover.surface,
                      )}
                    >
                      <span className="flex h-5 w-4 shrink-0 items-center justify-center">
                        {marcada && <CheckIcon className={cn('h-4 w-4', text.accent)} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block truncate', text.base)}>{option.label}</span>
                        {option.description && (
                          <span className={cn('block truncate text-xs', text.subtle)}>{option.description}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </Field>
  );
};
