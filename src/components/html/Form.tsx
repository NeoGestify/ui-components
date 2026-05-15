import { type FormHTMLAttributes, type FC, type FormEvent, type ReactNode, type CSSProperties } from 'react';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
    children: ReactNode;
    onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
    variant?: 'default' | 'modal' | 'card' | 'inline' | 'compact';
    /** Number of columns for a CSS grid layout. 1 = single column, >1 = multi-column grid. */
    columns?: number;
}

export const Form: FC<FormProps> = ({
    onSubmit,
    children,
    variant = 'default',
    columns,
    className = '',
    style,
    ...props
}) => {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit?.(e);
    };

    const hasGrid = columns !== undefined && columns > 1;

    const getVariantClasses = (): string => {
        switch (variant) {
            case 'modal':
                return 'flex-1 px-6 py-4 overflow-y-auto';
            case 'card':
                return `bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6${hasGrid ? '' : ' space-y-6'}`;
            case 'inline':
                return hasGrid ? '' : 'flex flex-wrap gap-4 items-end';
            case 'compact':
                return hasGrid ? '' : 'space-y-3';
            case 'default':
            default:
                return hasGrid ? '' : 'space-y-4';
        }
    };

    const gridStyle: CSSProperties = hasGrid
        ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: '1rem' }
        : {};

    const combinedClassName = [getVariantClasses(), className].filter(Boolean).join(' ');
    const combinedStyle: CSSProperties = { ...gridStyle, ...style };

    return (
        <form
            onSubmit={handleSubmit}
            className={combinedClassName}
            style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
            {...props}
        >
            {children}
        </form>
    );
};
