import { type ReactNode, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { bg, bgHover, border, divide, focusVisibleOutline, focusVisibleRing, text } from '../../theme/tokens';
import { motion } from '../../theme/motion';
import { SortAscIcon, SortDescIcon, SortBothIcon } from '../icons/icons';
import { cn } from '../../internal/cn';

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

export interface SortState {
    key: string;
    direction: 'asc' | 'desc';
}

export interface ColumnDef {
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

export interface TableProps {
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

    /**
     * Fija el thead al hacer scroll vertical.
     *
     * Necesita que la tabla tenga **altura máxima**: el envoltorio es un
     * contenedor de scroll (lo hace `overflow-x-auto`, que arrastra el eje Y
     * con él), así que sin altura nunca hay scroll vertical del que pegarse y
     * la cabecera se queda quieta. Con `maxHeight` se resuelve solo.
     */
    stickyHeader?: boolean;

    /**
     * Altura máxima del envoltorio; a partir de ahí la tabla se desplaza.
     * Acepta cualquier medida CSS (`'24rem'`, `400`, `'60vh'`).
     */
    maxHeight?: string | number;

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

    /**
     * Identidad estable de cada fila, para la `key` de React.
     *
     * Sin esto la `key` es el índice, y el índice **no identifica una fila**:
     * al ordenar, filtrar o borrar, React reutiliza el `<tr>` de la posición N
     * para un registro distinto. Lo visible se corrige al repintar, pero el
     * estado que viva dentro de una celda (un input a medio escribir, un menú
     * abierto, el foco) se queda en la fila equivocada.
     *
     * ```tsx
     * <Table rows={filas} getRowKey={i => usuarios[i].id} />
     * ```
     */
    getRowKey?: (rowIndex: number) => string | number;
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
    bordered: `w-full min-w-full table-auto border ${border.base}`,
    minimal:  'w-full min-w-full table-auto',
    ghost:    'w-full min-w-full table-auto',
    card:     'w-full min-w-full table-auto',
    accent:   'w-full min-w-full table-auto',
    dark:     'w-full min-w-full table-auto',
    custom:   'w-full min-w-full table-auto',
};

const VARIANT_THEAD: Record<TableVariant, string> = {
    default:  bg.surfaceMuted,
    striped:  bg.surfaceMuted,
    bordered: bg.surfaceMuted,
    minimal:  '',
    ghost:    '',
    card:     bg.surfaceMuted,
    accent:   bg.accent,
    dark:     bg.inverted,
    custom:   '',
};

const VARIANT_TH: Record<TableVariant, string> = {
    default:  `font-semibold uppercase tracking-wider ${text.muted}`,
    striped:  `font-semibold uppercase tracking-wider ${text.muted}`,
    bordered: `font-semibold uppercase tracking-wider ${text.muted} border ${border.base}`,
    minimal:  `font-semibold ${text.subtle} border-b ${border.subtle}`,
    ghost:    `font-semibold ${text.subtle} border-b-2 ${border.base}`,
    card:     `font-semibold ${text.muted} border-b ${border.subtle}`,
    accent:   `font-semibold uppercase tracking-wider ${text.onAccent}`,
    dark:     `font-semibold uppercase tracking-wider ${text.onInverted}`,
    custom:   '',
};

// Base row bg per variant (overridden by stripe for 'striped')
const VARIANT_TR_BASE: Record<TableVariant, string> = {
    default:  bg.surface,
    striped:  '',
    bordered: bg.surface,
    minimal:  '',
    ghost:    '',
    card:     bg.surface,
    accent:   bg.surface,
    dark:     bg.surface,
    custom:   '',
};

const VARIANT_TR_HOVER: Record<TableVariant, string> = {
    default:  bgHover.surface,
    striped:  bgHover.accentSoft,
    bordered: bgHover.surface,
    minimal:  bgHover.surface,
    ghost:    bgHover.surface,
    card:     bgHover.surface,
    accent:   bgHover.accentSoft,
    dark:     bgHover.surface,
    custom:   '',
};

const VARIANT_TR_STRIPE: Record<TableVariant, (i: number) => string> = {
    default:  () => '',
    striped:  (i) => i % 2 === 0 ? bg.surface : bg.surfaceMuted,
    bordered: () => '',
    minimal:  () => '',
    ghost:    () => '',
    card:     () => '',
    accent:   () => '',
    dark:     () => '',
    custom:   () => '',
};

const VARIANT_TD: Record<TableVariant, string> = {
    default:  text.muted,
    striped:  text.muted,
    bordered: `${text.muted} border ${border.subtle}`,
    minimal:  `${text.muted} border-b ${border.subtle}`,
    ghost:    text.muted,
    card:     text.muted,
    accent:   text.muted,
    dark:     text.muted,
    custom:   '',
};

const VARIANT_TBODY_DIVIDER: Record<TableVariant, string> = {
    default:  `divide-y ${divide.base}`,
    striped:  '',
    bordered: '',
    minimal:  '',
    ghost:    `divide-y ${divide.base}`,
    card:     `divide-y ${divide.base}`,
    accent:   `divide-y ${divide.base}`,
    dark:     `divide-y ${divide.base}`,
    custom:   '',
};

/** `aria-sort` no acepta `'asc'`/`'desc'`: los nombres son otros. */
const SORT_ARIA: Record<'asc' | 'desc' | 'none', 'ascending' | 'descending' | 'none'> = {
    asc:  'ascending',
    desc: 'descending',
    none: 'none',
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
                    <div className={`h-4 rounded ${bg.skeleton} motion-safe:animate-pulse`} />
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
    maxHeight,
    caption,
    footerRows,
    loading = false,
    loadingRows = 4,
    getRowKey,
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
        const hoverCls = hoverable ? `${VARIANT_TR_HOVER[variant]} ${motion.colors}` : '';
        const clickCls = onRowClick ? `cursor-pointer ${focusVisibleOutline}` : '';
        const customCls = typeof trClassName === 'function' ? trClassName(i) : (trClassName ?? '');
        return cn(baseCls, hoverCls, clickCls, customCls);
    };

    // `rounded-lg` a secas, SIN `overflow-hidden`. Los dos van al mismo grupo
    // de `twMerge` que `overflow-x-auto`, así que ponerlos juntos borraba el
    // scroll horizontal y una tabla ancha se quedaba recortada sin manera de
    // desplazarla. No hace falta: un contenedor con `overflow` distinto de
    // `visible` ya recorta por las esquinas redondeadas.
    // Intro y Espacio son las dos teclas que activan cualquier control; Espacio
    // además desplaza la página, así que hay que cortarlo.
    const onRowKeyDown = (rowIndex: number) => (e: ReactKeyboardEvent<HTMLTableRowElement>) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onRowClick?.(rowIndex);
    };

    // `relative` para que el scroll contenga también lo posicionado en
    // absoluto. Sin él, un `sr-only` en una cabecera —el «Acciones» de la
    // columna de botones— toma como referencia el primer ancestro posicionado
    // de la página, se escapa de este contenedor y de cualquier `overflow` que
    // haya por encima, y le pone a la página entera un scroll horizontal.
    const wrapperCls = cn(
        'relative overflow-x-auto w-full',
        rounded ? 'rounded-lg' : '',
        shadow ? 'shadow-md' : '',
        className,
    );

    const wrapperStyle: CSSProperties | undefined =
        maxHeight === undefined ? undefined : { maxHeight };

    const theadCls = cn(
        VARIANT_THEAD[variant],
        stickyHeader ? 'sticky top-0 z-20' : '',
    );

    const stickyColCls = 'sticky left-0 z-10 bg-inherit';

    return (
        <div className={wrapperCls} style={wrapperStyle}>
            <table
                className={cn(VARIANT_TABLE[variant], tableClassName)}
                style={style}
                aria-busy={loading || undefined}
            >
                {caption && (
                    <caption className={`mb-2 text-left text-sm ${text.subtle}`}>
                        {caption}
                    </caption>
                )}

                {!hideHeader && (
                    <thead className={theadCls}>
                        <tr>
                            {cols.map((col, i) => {
                                const isSortable = Boolean(col.sortable && col.key);
                                const activeSort = (sortState && col.key && sortState.key === col.key) ? sortState.direction : null;
                                return (
                                    <th
                                        key={i}
                                        scope="col"
                                        // Lo que anuncia un lector de pantalla al entrar en la
                                        // columna: por cuál está ordenada la tabla y en qué
                                        // sentido. Sin esto, el icono de la flecha no existe
                                        // para quien no la ve.
                                        aria-sort={isSortable ? SORT_ARIA[activeSort ?? 'none'] : undefined}
                                        className={cn(
                                            SIZE_TH[size],
                                            VARIANT_TH[variant],
                                            ALIGN_CLASS[col.align ?? 'left'],
                                            col.className ?? '',
                                            thClassName,
                                            col.sticky ? stickyColCls : '',
                                        )}
                                        style={{ ...colSizeStyle(col), ...(col.thStyle ?? {}) }}
                                    >
                                        {isSortable ? (
                                            // Un `<th>` con `onClick` no se puede pulsar con el
                                            // teclado: no recibe foco ni responde a Intro. El
                                            // botón interior sí, y de paso hereda el tamaño de
                                            // la celda con el margen negativo.
                                            <button
                                                type="button"
                                                onClick={() => onSort?.(col.key!)}
                                                className={cn(
                                                    'inline-flex max-w-full items-center gap-1 rounded -mx-1 px-1 py-0.5',
                                                    'cursor-pointer select-none text-inherit',
                                                    // La hoja del navegador pone `text-transform: none` a
                                                    // TODO `<button>`, y ninguna variante de Tailwind la
                                                    // hereda de vuelta. Sin esto, la única cabecera con
                                                    // botón se queda sin las mayúsculas de las demás.
                                                    '[text-transform:inherit]',
                                                    focusVisibleRing,
                                                )}
                                            >
                                                <span className="truncate">{col.header}</span>
                                                <SortIcon direction={activeSort} />
                                            </button>
                                        ) : col.header}
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
                                className={`${SIZE_TD[size]} py-8 text-center ${text.faint}`}
                            >
                                {emptyState ?? 'Sin datos'}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, rowIndex) => (
                            <tr
                                key={getRowKey?.(rowIndex) ?? rowIndex}
                                className={resolvedTrClass(rowIndex)}
                                style={getRowStyle?.(rowIndex)}
                                onClick={onRowClick ? () => onRowClick(rowIndex) : undefined}
                                // Una fila pulsable tiene que serlo también con el teclado.
                                // `<tr>` no es un elemento interactivo, así que hay que darle
                                // el foco y las teclas a mano; el `role="button"` es lo que
                                // hace que un lector de pantalla la anuncie como pulsable
                                // sin dejar de ser una fila de la tabla para la navegación.
                                tabIndex={onRowClick ? 0 : undefined}
                                role={onRowClick ? 'button' : undefined}
                                onKeyDown={onRowClick ? onRowKeyDown(rowIndex) : undefined}
                            >
                                {row.map((cell, cellIndex) => {
                                    const col = cols[cellIndex];
                                    return (
                                        <td
                                            key={cellIndex}
                                            className={cn(
                                                SIZE_TD[size],
                                                VARIANT_TD[variant],
                                                ALIGN_CLASS[col?.align ?? 'left'],
                                                col?.className ?? '',
                                                tdClassName,
                                                col?.sticky ? stickyColCls : '',
                                            )}
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
                    <tfoot className={`border-t ${border.subtle} ${bg.surfaceMuted}`}>
                        {footerRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => {
                                    const col = cols[cellIndex];
                                    return (
                                        <td
                                            key={cellIndex}
                                            className={cn(
                                                SIZE_TD[size],
                                                `font-medium ${text.muted}`,
                                                ALIGN_CLASS[col?.align ?? 'left'],
                                                col?.className ?? '',
                                                tdClassName,
                                            )}
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
