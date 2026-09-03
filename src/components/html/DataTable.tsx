import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { SearchIcon } from '../icons/icons';
import { text } from '../../theme/tokens';
import { motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';
import { useMessage } from '../../context/config/NuiConfigProvider';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { Pagination } from './Pagination';
import { Table, type ColumnDef, type SortState } from './Table';

export interface DataColumn<T> {
  /** Clave única de la columna. Es también la que viaja en `SortState`. */
  key: string;
  header: ReactNode;
  /** De dónde sale el valor. Sin esto se lee `row[key]`. */
  accessor?: (row: T) => unknown;
  /** Cómo se pinta. Sin esto se escribe el valor tal cual. */
  cell?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  /** Comparador propio, cuando el de serie no entiende el dato. */
  sortFn?: (a: T, b: T) => number;
  /** Excluye la columna de la búsqueda. Por defecto entra. */
  searchable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  minWidth?: string | number;
  sticky?: boolean;
  className?: string;
}

export interface DataTableProps<T> extends AnimatableProps {
  data: T[];
  columns: DataColumn<T>[];
  /**
   * Identidad estable de cada fila.
   *
   * No es opcional a propósito. Con la posición como identidad, ordenar o
   * cambiar de página reutiliza el `<tr>` de la fila N para otro registro: lo
   * pintado se corrige, pero el estado que viva dentro de una celda —un campo a
   * medio escribir, un menú abierto, el foco— se queda en la fila equivocada. Y
   * la selección deja de significar nada en cuanto se reordena.
   */
  getRowId: (row: T, index: number) => string;

  // ── Ordenación ────────────────────────────────────────────────────────────
  defaultSort?: SortState | null;
  sortState?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;

  // ── Búsqueda ──────────────────────────────────────────────────────────────
  /** Añade la caja de búsqueda sobre la tabla. */
  searchable?: boolean;
  searchPlaceholder?: string;
  query?: string;
  onQueryChange?: (query: string) => void;

  // ── Paginación ────────────────────────────────────────────────────────────
  /** Filas por página. `0` las muestra todas. */
  pageSize?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  /** Total de filas cuando manda el servidor (`manual`). */
  totalRows?: number;

  // ── Selección ─────────────────────────────────────────────────────────────
  selectable?: boolean;
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[], rows: T[]) => void;

  /**
   * El servidor ya ha filtrado, ordenado y paginado: `data` se pinta tal cual y
   * los controles solo avisan. Sin esto todo se hace en memoria, que es lo
   * razonable hasta unos cuantos miles de filas.
   */
  manual?: boolean;

  onRowClick?: (row: T, index: number) => void;
  /** Contenido a la derecha de la búsqueda: filtros, botón de exportar… */
  toolbar?: ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
  loadingRows?: number;

  // ── Se pasan tal cual a `Table` ───────────────────────────────────────────
  variant?: 'default' | 'striped' | 'bordered' | 'minimal' | 'ghost' | 'card' | 'accent' | 'dark' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  stickyHeader?: boolean;
  maxHeight?: string | number;
  rounded?: boolean;
  shadow?: boolean;
  hoverable?: boolean;
  caption?: ReactNode;
  getRowStyle?: (row: T, index: number) => CSSProperties;
  trClassName?: string | ((row: T, index: number) => string);
  className?: string;
  tableClassName?: string;
}

/** Lo que sabe leer de una fila una columna, con o sin `accessor`. */
function valorDe<T>(row: T, col: DataColumn<T>): unknown {
  if (col.accessor) return col.accessor(row);
  return (row as Record<string, unknown>)[col.key];
}

/**
 * Comparación por defecto.
 *
 * Números y fechas por su valor; texto con `localeCompare` y `numeric`, que es
 * lo que ordena «Artículo 2» antes que «Artículo 10» en vez de al revés. Los
 * vacíos van siempre al final, suba o baje el orden: una celda sin dato no es
 * «lo más pequeño», es que no hay dato.
 */
export function compareValues(a: unknown, b: unknown): number {
  const vacioA = a === null || a === undefined || a === '';
  const vacioB = b === null || b === undefined || b === '';
  if (vacioA && vacioB) return 0;
  if (vacioA) return 1;
  if (vacioB) return -1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();

  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** Texto plano de una celda, para buscar dentro de ella. */
function textoDe(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/**
 * Tabla con datos.
 *
 * `Table` pinta lo que se le da: recibe `ReactNode[][]` y no sabe qué hay
 * dentro, así que no puede ordenar, ni filtrar, ni saber qué fila está
 * seleccionada. `DataTable` sí trabaja sobre los registros —`data` más
 * `columns` con su `accessor`— y de ahí salen gratis la ordenación, la
 * búsqueda, la paginación y la selección. El dibujo sigue siendo el de `Table`.
 *
 * Con `manual` se apaga todo el trabajo en memoria y los controles pasan a ser
 * meros avisos, para cuando ordena y pagina el servidor.
 *
 * ```tsx
 * <DataTable
 *   data={usuarios}
 *   getRowId={u => u.id}
 *   searchable
 *   pageSize={20}
 *   selectable
 *   columns={[
 *     { key: 'nombre', header: 'Nombre', sortable: true },
 *     { key: 'alta', header: 'Alta', sortable: true, accessor: u => u.alta,
 *       cell: u => u.alta.toLocaleDateString() },
 *   ]}
 * />
 * ```
 */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  defaultSort = null,
  sortState,
  onSortChange,
  searchable = false,
  searchPlaceholder,
  query,
  onQueryChange,
  pageSize = 0,
  page,
  onPageChange,
  totalRows,
  selectable = false,
  selected,
  defaultSelected,
  onSelectedChange,
  manual = false,
  onRowClick,
  toolbar,
  emptyState,
  loading = false,
  loadingRows = 4,
  variant,
  size = 'md',
  stickyHeader,
  maxHeight,
  rounded,
  shadow,
  hoverable,
  caption,
  getRowStyle,
  trClassName,
  className = '',
  tableClassName,
  animate,
}: DataTableProps<T>) {
  const buscarLabel = useMessage('search');
  const sinDatos = useMessage('empty');
  const sinResultados = useMessage('noResults');

  const [orden, setOrden] = useControllableState<SortState | null>({
    value: sortState,
    defaultValue: defaultSort,
    onChange: onSortChange,
  });

  const [busquedaInterna, setBusquedaInterna] = useState('');
  const busqueda = query ?? busquedaInterna;

  const [pagina, setPagina] = useControllableState<number>({
    value: page,
    defaultValue: 1,
    onChange: onPageChange,
  });

  const [marcadas, setMarcadas] = useControllableState<string[]>({
    value: selected,
    defaultValue: defaultSelected ?? [],
    onChange: ids => onSelectedChange?.(ids, data.filter((r, i) => ids.includes(getRowId(r, i)))),
  });

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const filtradas = useMemo(() => {
    if (manual || !busqueda.trim()) return data;
    const q = busqueda.trim().toLowerCase();
    const buscables = columns.filter(c => c.searchable !== false);
    return data.filter(row =>
      buscables.some(c => textoDe(valorDe(row, c)).toLowerCase().includes(q)),
    );
  }, [manual, data, busqueda, columns]);

  // ── Ordenación ────────────────────────────────────────────────────────────
  const ordenadas = useMemo(() => {
    if (manual || !orden) return filtradas;
    const col = columns.find(c => c.key === orden.key);
    if (!col) return filtradas;
    const signo = orden.direction === 'asc' ? 1 : -1;
    // Copia antes de ordenar: `sort` muta, y `data` es del consumidor.
    return [...filtradas].sort((a, b) =>
      signo * (col.sortFn ? col.sortFn(a, b) : compareValues(valorDe(a, col), valorDe(b, col))),
    );
  }, [manual, filtradas, orden, columns]);

  // ── Paginación ────────────────────────────────────────────────────────────
  const total = manual ? (totalRows ?? data.length) : ordenadas.length;
  const paginas = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  // Filtrar puede dejar la página actual fuera de rango; se muestra la última
  // que existe en vez de una tabla vacía sin explicación.
  const paginaSegura = Math.min(Math.max(1, pagina), paginas);

  const visibles = useMemo(() => {
    if (manual || pageSize <= 0) return ordenadas;
    const desde = (paginaSegura - 1) * pageSize;
    return ordenadas.slice(desde, desde + pageSize);
  }, [manual, ordenadas, pageSize, paginaSegura]);

  // ── Selección ─────────────────────────────────────────────────────────────
  const idsVisibles = useMemo(
    () => visibles.map((row, i) => getRowId(row, i)),
    [visibles, getRowId],
  );
  const marcadasVisibles = idsVisibles.filter(id => marcadas.includes(id)).length;
  const todas = idsVisibles.length > 0 && marcadasVisibles === idsVisibles.length;
  const aMedias = marcadasVisibles > 0 && !todas;

  const alternarTodas = useCallback(() => {
    setMarcadas(prev => {
      const completas = idsVisibles.every(id => prev.includes(id));
      // Solo se tocan las de la página visible: quien haya marcado filas en
      // otra página no espera perderlas por pulsar aquí.
      const fuera = prev.filter(id => !idsVisibles.includes(id));
      return completas ? fuera : [...fuera, ...idsVisibles];
    });
  }, [idsVisibles, setMarcadas]);

  const alternarFila = useCallback((id: string) => {
    setMarcadas(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, [setMarcadas]);

  // ── Ordenación por cabecera ───────────────────────────────────────────────
  const alOrdenar = useCallback((key: string) => {
    setOrden(prev => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      // Tercer clic quita el orden y devuelve la lista a como llegó. Sin este
      // paso no hay forma de volver al orden original salvo recargar.
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  }, [setOrden]);

  // ── Traducción a lo que entiende `Table` ──────────────────────────────────
  const columnasTabla: ColumnDef[] = useMemo(() => {
    const base: ColumnDef[] = columns.map(c => ({
      header: c.header,
      key: c.key,
      sortable: c.sortable,
      align: c.align,
      width: c.width,
      minWidth: c.minWidth,
      sticky: c.sticky,
      className: c.className,
    }));

    if (!selectable) return base;
    return [
      {
        header: (
          <Checkbox
            size="sm"
            checked={todas}
            indeterminate={aMedias}
            onChange={alternarTodas}
            aria-label={todas ? 'Desmarcar todo' : 'Marcar todo'}
          />
        ),
        width: '1%',
        className: 'w-px',
      },
      ...base,
    ];
  }, [columns, selectable, todas, aMedias, alternarTodas]);

  const filas: ReactNode[][] = useMemo(
    () => visibles.map((row, i) => {
      const celdas = columns.map(c => (c.cell ? c.cell(row, i) : (textoDe(valorDe(row, c)) as ReactNode)));
      if (!selectable) return celdas;
      const id = getRowId(row, i);
      return [
        <Checkbox
          key={`sel-${id}`}
          size="sm"
          checked={marcadas.includes(id)}
          onChange={() => alternarFila(id)}
          aria-label={`Seleccionar fila ${i + 1}`}
        />,
        ...celdas,
      ];
    }),
    [visibles, columns, selectable, getRowId, marcadas, alternarFila],
  );

  const vacio = busqueda.trim() ? sinResultados : sinDatos;

  return (
    <div className={cn('flex flex-col gap-3', className)} style={motionStyle(animate)}>
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-end gap-3">
          {searchable && (
            <div className="min-w-[12rem] max-w-xs flex-1">
              <Input
                type="search"
                size={size === 'lg' ? 'md' : 'sm'}
                icon={<SearchIcon className="h-4 w-4" />}
                clearable
                placeholder={searchPlaceholder ?? `${buscarLabel}…`}
                aria-label={searchPlaceholder ?? buscarLabel}
                value={busqueda}
                onChange={e => {
                  const v = e.target.value;
                  if (query === undefined) setBusquedaInterna(v);
                  onQueryChange?.(v);
                  // Buscar tras haber pasado de página deja la vista vacía si
                  // los resultados no llegan a esa página.
                  setPagina(1);
                }}
              />
            </div>
          )}
          {toolbar && <div className="flex flex-1 items-center justify-end gap-2">{toolbar}</div>}
        </div>
      )}

      <Table
        columns={columnasTabla}
        rows={filas}
        getRowKey={i => getRowId(visibles[i], i)}
        sortState={orden}
        onSort={alOrdenar}
        onRowClick={onRowClick ? i => onRowClick(visibles[i], i) : undefined}
        emptyState={emptyState ?? vacio}
        loading={loading}
        loadingRows={loadingRows}
        variant={variant}
        size={size}
        stickyHeader={stickyHeader}
        maxHeight={maxHeight}
        rounded={rounded}
        shadow={shadow}
        hoverable={hoverable}
        caption={caption}
        tableClassName={tableClassName}
        getRowStyle={getRowStyle ? i => getRowStyle(visibles[i], i) : undefined}
        trClassName={typeof trClassName === 'function' ? i => trClassName(visibles[i], i) : trClassName}
      />

      {(pageSize > 0 && paginas > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={cn('text-xs tabular-nums', text.subtle)}>
            {selectable && marcadas.length > 0
              ? `${marcadas.length} de ${total} seleccionadas`
              : `${total} ${total === 1 ? 'fila' : 'filas'}`}
          </p>
          <Pagination
            page={paginaSegura}
            totalPages={paginas}
            onChange={setPagina}
            size={size === 'lg' ? 'md' : 'sm'}
          />
        </div>
      )}
    </div>
  );
}
