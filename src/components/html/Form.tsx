import { type FormHTMLAttributes, type FC, type FormEvent, type ReactNode } from 'react';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
    children: ReactNode;
    onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
    variant?: 'default' | 'modal' | 'card' | 'inline' | 'compact';
}

export const Form: FC<FormProps> = ({ onSubmit, children, variant = 'default', className = '', ...props }) => {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'modal':
                return 'flex-1 px-6 py-4 overflow-y-auto';
            case 'card':
                return 'p-6 space-y-6';
            case 'inline':
                return 'flex flex-wrap gap-4 items-end';
            case 'compact':
                return 'space-y-3';
            case 'default':
            default:
                return 'space-y-4';
        }
    };

    const combinedClassName = `${getVariantClasses()} ${className}`.trim();

    return (
        <form onSubmit={handleSubmit} className={combinedClassName} {...props}>
            {children}
        </form>
    );
};