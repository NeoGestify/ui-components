import { type ReactNode, type CSSProperties } from 'react';
import { SortAscIcon, SortDescIcon, SortBothIcon } from '../icons/icons';

type TableVariant =
    | 'default'
    | 'striped'
    | 'bordered'
    | 'minimal'
    | 'ghost'
    | 'card'
    | 'accent'
    | 'dark'
    | 'custom';

type TableSize = 'sm' | 'md' | 'lg';

interface SortState {
    key: string;
    direction: 'asc' | 'desc';
}

interface ColumnDef {
    /** Contenido del encabezado */
    header: ReactNode;
    /** Clase CSS adicional para toda la columna (th + td) */
    className?: string;
    /** Alinear el contenido de esta columna */
    align?: 'left' | 'center' | 'right';
    /** Ancho fijo (px, %, rem…) */
    width?: string | number;
    /** Ancho mínimo */
    minWidth?: string | number;
    /** Fija esta columna a la izquierda durante scroll horizontal */
    sticky?: boolean;
    /** Estilos inline exclusivos para <th> */
    thStyle?: CSSProperties;
    /** Estilos inline exclusivos para <td> */
    tdStyle?: CSSProperties;
    /** Muestra indicador de ordenación. Requiere `key` */
    sortable?: boolean;
    /** Clave usada en sortState y onSort */
    key?: string;
}

interface TableProps {
    /**
     * Definición de columnas. Acepta strings simples o ColumnDef para
     * configuración avanzada (ancho, sticky, sort, etc.).
     */
    columns: (ColumnDef | ReactNode)[];

    /** Filas del cuerpo. Cada fila es un arreglo de celdas. */
    rows: ReactNode[][];

    /** Estilo visual. Default: 'default' */
    variant?: TableVariant;

    /** Tamaño de padding. Default: 'md' */
    size?: TableSize;

    /** Clase CSS adicional para el wrapper <div> */
    className?: string;

    /** Clase CSS adicional para el <table> */
    tableClassName?: string;

    /** Clase CSS adicional para cada <th> */
    thClassName?: string;

    /** Clase CSS adicional para cada <td> */
    tdClassName?: string;

    /** Clase CSS adicional por fila del body */
    trClassName?: string | ((rowIndex: number) => string);

    /** Nodo a mostrar cuando rows está vacío */
    emptyState?: ReactNode;

    /** Callback al hacer click en una fila */
    onRowClick?: (rowIndex: number) => void;

    /** Oculta el thead */
    hideHeader?: boolean;

    /** Estilos inline para el <table> */
    style?: CSSProperties;

    /** Fija el thead al hacer scroll vertical */
    stickyHeader?: boolean;

    /** Caption accesible de la tabla */
    caption?: ReactNode;

    /** Filas del <tfoot> */
    footerRows?: ReactNode[][];

    /** Muestra esqueleto animado en lugar de rows */
    loading?: boolean;

    /** Número de filas esqueleto cuando loading=true. Default: 4 */
    loadingRows?: number;

    /** Estilo inline por fila del body */
    getRowStyle?: (rowIndex: number) => CSSProperties;

    /** Agrega rounded-lg al wrapper */
    rounded?: boolean;

    /** Agrega sombra al wrapper */
    shadow?: boolean;

    /** Desactiva el efecto hover en filas. Default: true */
    hoverable?: boolean;

    /** Estado actual de ordenación */
    sortState?: SortState | null;

    /** Callback al hacer click en un th sortable */
    onSort?: (key: string) => void;
}

// ─── Lookup tables ────────────────────────────────────────────────────────────

const ALIGN_CLASS: Record<string, string> = {
    left:   'text-left',
    center: 'text-center',
    right:  'text-right',
};

const SIZE_TH: Record<TableSize, string> = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-3 py-2.5 text-xs',
    lg: 'px-4 py-3.5 text-sm',
};

const SIZE_TD: Record<TableSize, string> = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3.5 text-sm',
};

const VARIANT_TABLE: Record<TableVariant, string> = {
    default:  'w-full min-w-full table-auto',
    striped:  'w-full min-w-full table-auto',
    bordered: 'w-full min-w-full table-auto border border-gray-300 dark:border-gray-600',
    minimal:  'w-full min-w-full table-auto',
    ghost:    'w-full min-w-full table-auto',
    card:     'w-full min-w-full table-auto',
    accent:   'w-full min-w-full table-auto',
    dark:     'w-full min-w-full table-auto',
    custom:   'w-full min-w-full table-auto',
};

const VARIANT_THEAD: Record<TableVariant, string> = {
    default:  'bg-gray-100 dark:bg-gray-700',
    striped:  'bg-gray-100 dark:bg-gray-700',
    bordered: 'bg-gray-100 dark:bg-gray-700',
    minimal:  '',
    ghost:    '',
    card:     'bg-gray-50 dark:bg-gray-800/80',
    accent:   'bg-blue-600 dark:bg-blue-700',
    dark:     'bg-gray-800 dark:bg-gray-900',
    custom:   '',
};

const VARIANT_TH: Record<TableVariant, string> = {
    default:  'font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300',
    striped:  'font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300',
    bordered: 'font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
    minimal:  'font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700',
    ghost:    'font-semibold text-gray-600 dark:text-gray-400 border-b-2 border-gray-300 dark:border-gray-600',
    card:     'font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700',
    accent:   'font-semibold uppercase tracking-wider text-white',
    dark:     'font-semibold uppercase tracking-wider text-gray-100',
    custom:   '',
};

// Base row bg per variant (overridden by stripe for 'striped')
const VARIANT_TR_BASE: Record<TableVariant, string> = {
    default:  'bg-white dark:bg-gray-800',
    striped:  '',
    bordered: 'bg-white dark:bg-gray-800',
    minimal:  '',
    ghost:    '',
    card:     'bg-white dark:bg-gray-900',
    accent:   'bg-white dark:bg-gray-800',
    dark:     'bg-white dark:bg-gray-800',
    custom:   '',
};

const VARIANT_TR_HOVER: Record<TableVariant, string> = {
    default:  'hover:bg-gray-50 dark:hover:bg-gray-700/60',
    striped:  'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    bordered: 'hover:bg-gray-50 dark:hover:bg-gray-700/60',
    minimal:  'hover:bg-gray-50 dark:hover:bg-gray-800/60',
    ghost:    'hover:bg-gray-50/70 dark:hover:bg-white/5',
    card:     'hover:bg-gray-50 dark:hover:bg-gray-800/50',
    accent:   'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    dark:     'hover:bg-gray-50 dark:hover:bg-gray-700/60',
    custom:   '',
};

const VARIANT_TR_STRIPE: Record<TableVariant, (i: number) => string> = {
    default:  () => '',
    striped:  (i) => i % 2 === 0
        ? 'bg-white dark:bg-gray-800'
        : 'bg-gray-50 dark:bg-gray-700/40',
    bordered: () => '',
    minimal:  () => '',
    ghost:    () => '',
    card:     () => '',
    accent:   () => '',
    dark:     () => '',
    custom:   () => '',
};

const VARIANT_TD: Record<TableVariant, string> = {
    default:  'text-gray-700 dark:text-gray-300',
    striped:  'text-gray-700 dark:text-gray-300',
    bordered: 'text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
    minimal:  'text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800',
    ghost:    'text-gray-700 dark:text-gray-300',
    card:     'text-gray-700 dark:text-gray-300',
    accent:   'text-gray-700 dark:text-gray-300',
    dark:     'text-gray-700 dark:text-gray-300',
    custom:   '',
};

const VARIANT_TBODY_DIVIDER: Record<TableVariant, string> = {
    default:  'divide-y divide-gray-200 dark:divide-gray-700',
    striped:  '',
    bordered: '',
    minimal:  '',
    ghost:    'divide-y divide-gray-200 dark:divide-gray-700',
    card:     'divide-y divide-gray-100 dark:divide-gray-800',
    accent:   'divide-y divide-gray-200 dark:divide-gray-700',
    dark:     'divide-y divide-gray-200 dark:divide-gray-700',
    custom:   '',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction?: 'asc' | 'desc' | null }) {
    if (direction === 'asc') return <SortAscIcon className="inline-block ml-1 w-3 h-3 shrink-0" />;
    if (direction === 'desc') return <SortDescIcon className="inline-block ml-1 w-3 h-3 shrink-0" />;
    return <SortBothIcon className="inline-block ml-1 w-3 h-3 shrink-0 opacity-40" />;
}

function SkeletonRow({ colCount, size }: { colCount: number; size: TableSize }) {
    return (
        <tr>
            {Array.from({ length: colCount }).map((_, i) => (
                <td key={i} className={SIZE_TD[size]}>
                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </td>
            ))}
        </tr>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isColumnDef(col: ColumnDef | ReactNode): col is ColumnDef {
    return typeof col === 'object' && col !== null && 'header' in (col as object);
}

function resolveColumn(col: ColumnDef | ReactNode): ColumnDef {
    if (isColumnDef(col)) return col;
    return { header: col };
}

function colSizeStyle(col: ColumnDef): CSSProperties {
    const s: CSSProperties = {};
    if (col.width !== undefined) s.width = col.width;
    if (col.minWidth !== undefined) s.minWidth = col.minWidth;
    return s;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Table({
    columns,
    rows,
    variant = 'default',
    size = 'md',
    className = '',
    tableClassName = '',
    thClassName = '',
    tdClassName = '',
    trClassName,
    emptyState,
    onRowClick,
    hideHeader = false,
    style,
    stickyHeader = false,
    caption,
    footerRows,
    loading = false,
    loadingRows = 4,
    getRowStyle,
    rounded = false,
    shadow = false,
    hoverable = true,
    sortState,
    onSort,
}: TableProps) {
    const cols = columns.map(resolveColumn);

    const resolvedTrClass = (i: number): string => {
        const stripeCls = VARIANT_TR_STRIPE[variant](i);
        const baseCls = stripeCls || VARIANT_TR_BASE[variant];
        const hoverCls = hoverable ? `${VARIANT_TR_HOVER[variant]} transition-colors` : '';
        const clickCls = onRowClick ? 'cursor-pointer' : '';
        const customCls = typeof trClassName === 'function' ? trClassName(i) : (trClassName ?? '');
        return [baseCls, hoverCls, clickCls, customCls].filter(Boolean).join(' ');
    };

    const wrapperCls = [
        'overflow-x-auto w-full',
        rounded ? 'rounded-lg overflow-hidden' : '',
        shadow ? 'shadow-md' : '',
        className,
    ].filter(Boolean).join(' ');

    const theadCls = [
        VARIANT_THEAD[variant],
        stickyHeader ? 'sticky top-0 z-20' : '',
    ].filter(Boolean).join(' ');

    const stickyColCls = 'sticky left-0 z-10 bg-inherit';

    return (
        <div className={wrapperCls}>
            <table
                className={`${VARIANT_TABLE[variant]} ${tableClassName}`.trim()}
                style={style}
            >
                {caption && (
                    <caption className="mb-2 text-left text-sm text-gray-500 dark:text-gray-400">
                        {caption}
                    </caption>
                )}

                {!hideHeader && (
                    <thead className={theadCls}>
                        <tr>
                            {cols.map((col, i) => {
                                const isSortable = col.sortable && col.key;
                                const activeSort = sortState?.key === col.key ? sortState!.direction : null;
                                return (
                                    <th
                                        key={i}
                                        scope="col"
                                        className={[
                                            SIZE_TH[size],
                                            VARIANT_TH[variant],
                                            ALIGN_CLASS[col.align ?? 'left'],
                                            col.className ?? '',
                                            thClassName,
                                            col.sticky ? stickyColCls : '',
                                            isSortable ? 'cursor-pointer select-none' : '',
                                        ].filter(Boolean).join(' ')}
                                        style={{ ...colSizeStyle(col), ...(col.thStyle ?? {}) }}
                                        onClick={isSortable ? () => onSort?.(col.key!) : undefined}
                                    >
                                        {col.header}
                                        {isSortable && <SortIcon direction={activeSort} />}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                )}

                <tbody className={VARIANT_TBODY_DIVIDER[variant]}>
                    {loading ? (
                        Array.from({ length: loadingRows }).map((_, i) => (
                            <SkeletonRow key={i} colCount={cols.length} size={size} />
                        ))
                    ) : rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={cols.length}
                                className={`${SIZE_TD[size]} py-8 text-center text-gray-400 dark:text-gray-500`}
                            >
                                {emptyState ?? 'Sin datos'}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={resolvedTrClass(rowIndex)}
                                style={getRowStyle?.(rowIndex)}
                                onClick={onRowClick ? () => onRowClick(rowIndex) : undefined}
                            >
                                {row.map((cell, cellIndex) => {
                                    const col = cols[cellIndex];
                                    return (
                                        <td
                                            key={cellIndex}
                                            className={[
                                                SIZE_TD[size],
                                                VARIANT_TD[variant],
                                                ALIGN_CLASS[col?.align ?? 'left'],
                                                col?.className ?? '',
                                                tdClassName,
                                                col?.sticky ? stickyColCls : '',
                                            ].filter(Boolean).join(' ')}
                                            style={{
                                                ...(col ? colSizeStyle(col) : {}),
                                                ...(col?.tdStyle ?? {}),
                                            }}
                                        >
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>

                {footerRows && footerRows.length > 0 && (
                    <tfoot className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                        {footerRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => {
                                    const col = cols[cellIndex];
                                    return (
                                        <td
                                            key={cellIndex}
                                            className={[
                                                SIZE_TD[size],
                                                'font-medium text-gray-700 dark:text-gray-300',
                                                ALIGN_CLASS[col?.align ?? 'left'],
                                                col?.className ?? '',
                                                tdClassName,
                                            ].filter(Boolean).join(' ')}
                                            style={col?.tdStyle}
                                        >
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tfoot>
                )}
            </table>
        </div>
    );
}
