import { type ReactNode } from 'react';

interface TableProps {
    headers: ReactNode[];
    rows: ReactNode[][];
    variant?: 'default' | 'custom';
    className?: string;
    thClassName?: string;
    tdClassName?: string;
}

export function Table({
    headers,
    rows,
    variant = 'default',
    className = '',
    thClassName = '',
    tdClassName = ''
}: TableProps) {
    const baseTableClass = variant === 'default'
        ? 'w-full table-auto border-collapse border border-gray-300 dark:border-gray-600 min-w-full'
        : '';

    const baseThClass = variant === 'default'
        ? 'border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white'
        : '';

    const baseTdClass = variant === 'default'
        ? 'border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white'
        : '';

    const tableClass = `${baseTableClass} ${className}`.trim();
    const thClass = `${baseThClass} ${thClassName}`.trim();
    const tdClass = `${baseTdClass} ${tdClassName}`.trim();

    return (
        <div className="overflow-x-auto w-full">
            <table className={tableClass}>
                <thead>
                    <tr className={variant === 'default' ? 'bg-gray-100 dark:bg-gray-700' : ''}>
                        {headers.map((header, index) => (
                            <th key={index} className={thClass}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={variant === 'default' ? 'hover:bg-gray-50 dark:hover:bg-gray-600' : ''}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className={tdClass}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}