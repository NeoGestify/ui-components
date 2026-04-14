import { type ReactNode, type CSSProperties } from 'react';

type TableVariant = 'default' | 'striped' | 'bordered' | 'minimal' | 'custom';
type TableSize = 'sm' | 'md' | 'lg';

interface ColumnDef {
    /** Contenido del encabezado */
    header: ReactNode;
    /** Clase CSS adicional para toda la columna (th + td) */
    className?: string;
    /** Alinear el contenido de esta columna */
    align?: 'left' | 'center' | 'right';
}

interface TableProps {
    /**
     * Definición de columnas con encabezado y opciones por columna.
     * Si pasas strings simples, los usa como encabezados sin configuración extra.
     */
    columns: (ColumnDef | ReactNode)[];

    /** Filas de la tabla. Cada fila es un arreglo de celdas. */
    rows: ReactNode[][];

    /** Estilo visual de la tabla. Default: 'default' */
    variant?: TableVariant;

    /** Tamaño de padding de celdas. Default: 'md' */
    size?: TableSize;

    /** Clase CSS adicional para el wrapper `<div>` externo */
    className?: string;

    /** Clase CSS adicional para el `<table>` */
    tableClassName?: string;

    /** Clase CSS adicional para cada `<th>` */
    thClassName?: string;

    /** Clase CSS adicional para cada `<td>` */
    tdClassName?: string;

    /** Clase CSS adicional para cada `<tr>` del body */
    trClassName?: string | ((rowIndex: number) => string);

    /** Texto o nodo a mostrar cuando `rows` está vacío */
    emptyState?: ReactNode;

    /** Callback al hacer click en una fila */
    onRowClick?: (rowIndex: number) => void;

    /** Si true, no muestra thead */
    hideHeader?: boolean;

    /** Estilos inline para el `<table>` */
    style?: CSSProperties;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isColumnDef(col: ColumnDef | ReactNode): col is ColumnDef {
    return typeof col === 'object' && col !== null && 'header' in (col as object);
}

function resolveColumn(col: ColumnDef | ReactNode): ColumnDef {
    if (isColumnDef(col)) return col;
    return { header: col };
}

const ALIGN_CLASS: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
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
    custom:   'w-full min-w-full table-auto',
};

const VARIANT_THEAD: Record<TableVariant, string> = {
    default:  'bg-gray-100 dark:bg-gray-700',
    striped:  'bg-gray-100 dark:bg-gray-700',
    bordered: 'bg-gray-100 dark:bg-gray-700',
    minimal:  '',
    custom:   '',
};

const VARIANT_TH: Record<TableVariant, string> = {
    default:  'font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300',
    striped:  'font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300',
    bordered: 'font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
    minimal:  'font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700',
    custom:   '',
};

const VARIANT_TR: Record<TableVariant, (i: number) => string> = {
    default:  () => 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors',
    striped:  (i) => `${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/40'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`,
    bordered: () => 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors',
    minimal:  () => 'hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors',
    custom:   () => '',
};

const VARIANT_TD: Record<TableVariant, string> = {
    default:  'text-gray-700 dark:text-gray-300',
    striped:  'text-gray-700 dark:text-gray-300',
    bordered: 'text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
    minimal:  'text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800',
    custom:   '',
};

const VARIANT_TBODY_DIVIDER: Record<TableVariant, string> = {
    default:  'divide-y divide-gray-200 dark:divide-gray-700',
    striped:  '',
    bordered: '',
    minimal:  '',
    custom:   '',
};

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
}: TableProps) {
    const cols = columns.map(resolveColumn);

    const resolvedTrClass = (i: number): string => {
        const variantCls = VARIANT_TR[variant](i);
        const clickCls = onRowClick ? 'cursor-pointer' : '';
        const customCls = typeof trClassName === 'function' ? trClassName(i) : (trClassName ?? '');
        return `${variantCls} ${clickCls} ${customCls}`.trim();
    };

    return (
        <div className={`overflow-x-auto w-full ${className}`.trim()}>
            <table
                className={`${VARIANT_TABLE[variant]} ${tableClassName}`.trim()}
                style={style}
            >
                {!hideHeader && (
                    <thead className={VARIANT_THEAD[variant]}>
                        <tr>
                            {cols.map((col, i) => (
                                <th
                                    key={i}
                                    className={[
                                        SIZE_TH[size],
                                        VARIANT_TH[variant],
                                        ALIGN_CLASS[col.align ?? 'left'],
                                        col.className ?? '',
                                        thClassName,
                                    ].filter(Boolean).join(' ')}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody className={VARIANT_TBODY_DIVIDER[variant]}>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={cols.length}
                                className={`${SIZE_TD[size]} text-center text-gray-400 dark:text-gray-500 py-8`}
                            >
                                {emptyState ?? 'Sin datos'}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={resolvedTrClass(rowIndex)}
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
                                            ].filter(Boolean).join(' ')}
                                        >
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}