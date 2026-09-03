import {
  useCallback, useEffect, useMemo, useRef, useState,
  type FC, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import { SearchIcon } from '../icons/icons';
import { bg, border, text } from '../../theme/tokens';
import { motion } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useMessage } from '../../context/config/NuiConfigProvider';
import { Kbd } from './Layout';
import { Modal } from './Modal';
import { ScrollArea } from './ScrollArea';

export interface CommandItem {
  id: string;
  /** Texto visible y, salvo que haya `keywords`, lo único por lo que se busca. */
  label: string;
  description?: ReactNode;
  icon?: ReactNode;
  /** Cabecera bajo la que se agrupa. */
  group?: string;
  /** Atajo que se dibuja a la derecha: `['⌘', 'K']`. */
  shortcut?: string[];
  /** Sinónimos por los que también se encuentra: «facturar» → «cobro». */
  keywords?: string[];
  disabled?: boolean;
  onSelect?: () => void;
}

/** Sin acentos y en minúsculas: «Envío» se encuentra escribiendo «envio». */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/** Coincidencia por partes: «cr cl» encuentra «Crear cliente». */
export function matchesQuery(item: CommandItem, query: string): boolean {
  const q = normalize(query).trim();
  if (!q) return true;
  const heno = normalize([item.label, ...(item.keywords ?? [])].join(' '));
  return q.split(/\s+/).every(parte => heno.includes(parte));
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  /** Se llama además del `onSelect` del propio elemento. */
  onSelect?: (item: CommandItem) => void;
  placeholder?: string;
  /** Búsqueda propia; por defecto, por etiqueta y `keywords` sin acentos. */
  filter?: (item: CommandItem, query: string) => boolean;
  /** Para buscar en el servidor: el texto lo lleva el consumidor. */
  query?: string;
  onQueryChange?: (query: string) => void;
  emptyState?: ReactNode;
  /** Pie fijo, para las pistas de teclado. */
  footer?: ReactNode;
  /** Alto máximo de la lista. */
  maxHeight?: string | number;
  className?: string;
  'aria-label'?: string;
}

/**
 * Buscador de acciones, el de ⌘K.
 *
 * Se monta sobre `Modal`, así que hereda el velo, el bloqueo del
 * desplazamiento, el foco atrapado y la *top layer*. Lo propio es el patrón de
 * `combobox`: el foco **no se mueve** de la caja de texto, y lo que baja y sube
 * con las flechas es `aria-activedescendant`. Es lo que permite seguir
 * escribiendo mientras se recorre la lista.
 *
 * El atajo que la abre lo pone la aplicación; el componente no escucha el
 * teclado global para no pisar los atajos de nadie.
 *
 * ```tsx
 * <CommandPalette open={abierto} onClose={cerrar} items={acciones} />
 * ```
 */
export const CommandPalette: FC<CommandPaletteProps> = ({
  open,
  onClose,
  items,
  onSelect,
  placeholder,
  filter = matchesQuery,
  query,
  onQueryChange,
  emptyState,
  footer,
  maxHeight = '22rem',
  className = '',
  'aria-label': ariaLabel,
}) => {
  const buscarLabel = useMessage('search');
  const sinResultados = useMessage('noResults');

  const controlado = query !== undefined;
  const [texto, setTexto] = useState('');
  const busqueda = controlado ? query : texto;

  const [activo, setActivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const baseId = 'nui-cmdk';

  const visibles = useMemo(
    () => items.filter(i => filter(i, busqueda)),
    [items, filter, busqueda],
  );

  // Agrupadas conservando el orden en que aparecen los grupos en `items`: el
  // orden lo decide quien pasa los datos, no el alfabeto.
  const grupos = useMemo(() => {
    const mapa = new Map<string, CommandItem[]>();
    for (const item of visibles) {
      const g = item.group ?? '';
      if (!mapa.has(g)) mapa.set(g, []);
      mapa.get(g)!.push(item);
    }
    return [...mapa.entries()];
  }, [visibles]);

  const elegibles = useMemo(() => visibles.filter(i => !i.disabled), [visibles]);

  // Al filtrar, lo resaltado vuelve arriba: dejarlo donde estaba señalaría un
  // elemento que ya no tiene nada que ver con lo que se acaba de escribir.
  useEffect(() => { setActivo(0); }, [busqueda]);

  useEffect(() => {
    if (!open) return;
    setActivo(0);
    if (!controlado) setTexto('');
    // El diálogo se abre en el efecto de `Modal`; el foco tiene que ir después.
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open, controlado]);

  const escribir = useCallback((v: string) => {
    if (!controlado) setTexto(v);
    onQueryChange?.(v);
  }, [controlado, onQueryChange]);

  const ejecutar = useCallback((item: CommandItem) => {
    if (item.disabled) return;
    item.onSelect?.();
    onSelect?.(item);
    onClose();
  }, [onSelect, onClose]);

  const mover = useCallback((paso: number) => {
    if (!elegibles.length) return;
    setActivo(prev => (prev + paso + elegibles.length) % elegibles.length);
  }, [elegibles.length]);

  // El elemento resaltado se trae a la vista: con las flechas se sale de la
  // ventana enseguida y sin esto se navega a ciegas.
  useEffect(() => {
    const id = elegibles[activo]?.id;
    if (!id) return;
    listaRef.current
      ?.querySelector(`[data-cmd-id="${CSS.escape(id)}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activo, elegibles]);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); mover(1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); mover(-1); return; }
    if (e.key === 'Home') { e.preventDefault(); setActivo(0); return; }
    if (e.key === 'End') { e.preventDefault(); setActivo(Math.max(0, elegibles.length - 1)); return; }
    if (e.key === 'Enter') {
      const item = elegibles[activo];
      if (item) { e.preventDefault(); ejecutar(item); }
    }
  }, [mover, elegibles, activo, ejecutar]);

  if (!open) return null;

  const idActivo = elegibles[activo] ? `${baseId}-${elegibles[activo].id}` : undefined;

  const cabecera = (
    <div className={cn('flex shrink-0 items-center gap-3 border-b px-4', border.subtle)}>
      <SearchIcon className={cn('h-5 w-5 shrink-0', text.faint)} />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls={`${baseId}-list`}
        aria-activedescendant={idActivo}
        aria-autocomplete="list"
        aria-label={ariaLabel ?? buscarLabel}
        autoComplete="off"
        spellCheck={false}
        value={busqueda}
        placeholder={placeholder ?? `${buscarLabel}…`}
        onChange={e => escribir(e.target.value)}
        onKeyDown={onKeyDown}
        className={cn('w-full bg-transparent py-4 text-base outline-none', text.base,
          'placeholder-[var(--nui-text-faint,oklch(70.7%_.022_261.325))] dark:placeholder-[var(--nui-text-faint-dark,oklch(55.1%_.027_264.364))]')}
      />
    </div>
  );

  return (
    <Modal
      onClose={onClose}
      header={cabecera}
      align="top"
      size="lg"
      closeOnBackdrop
      closeOnEsc
      bodyClassName="p-0"
      aria-label={ariaLabel ?? buscarLabel}
      className={className}
      footer={footer}
    >
      <ScrollArea ref={listaRef} maxHeight={maxHeight} className="py-2">
        {visibles.length === 0 ? (
          <p className={cn('px-4 py-8 text-center text-sm', text.subtle)}>
            {emptyState ?? sinResultados}
          </p>
        ) : (
          <div id={`${baseId}-list`} role="listbox" aria-label={ariaLabel ?? buscarLabel}>
            {grupos.map(([grupo, items]) => (
              <div key={grupo || '_'} role="group" aria-label={grupo || undefined}>
                {grupo && (
                  <p className={cn('px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide', text.faint)}>
                    {grupo}
                  </p>
                )}
                {items.map(item => {
                  const resaltado = elegibles[activo]?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      id={`${baseId}-${item.id}`}
                      data-cmd-id={item.id}
                      role="option"
                      aria-selected={resaltado}
                      aria-disabled={item.disabled || undefined}
                      // `pointerdown` con `preventDefault` y no `click`: así el
                      // foco no se va del campo de texto, que es donde vive todo
                      // el teclado de este patrón. Estas filas no son parada de
                      // tabulación a propósito — Intro sobre el campo hace
                      // exactamente lo mismo que pulsarlas.
                      onPointerDown={e => { e.preventDefault(); ejecutar(item); }}
                      onPointerEnter={() => {
                        const i = elegibles.findIndex(x => x.id === item.id);
                        if (i >= 0) setActivo(i);
                      }}
                      className={cn(
                        'mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2', motion.colors,
                        item.disabled ? 'cursor-not-allowed opacity-50' : '',
                        resaltado && !item.disabled ? bg.accentSoft : '',
                      )}
                    >
                      {item.icon && (
                        <span className={cn('shrink-0', resaltado ? text.accent : text.subtle)} aria-hidden="true">
                          {item.icon}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className={cn('block truncate text-sm font-medium', text.base)}>{item.label}</span>
                        {item.description !== undefined && (
                          <span className={cn('block truncate text-xs', text.subtle)}>{item.description}</span>
                        )}
                      </span>
                      {item.shortcut && (
                        <span className="flex shrink-0 gap-1" aria-hidden="true">
                          {item.shortcut.map(k => <Kbd key={k}>{k}</Kbd>)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Modal>
  );
};
