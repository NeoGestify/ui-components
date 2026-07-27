import { Button } from './Button';
import { CloseIcon } from '../icons/icons';
import React, { useEffect, useId, useState, useRef, forwardRef, useImperativeHandle } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalVariant = 'default' | 'danger' | 'success' | 'warning';

interface ModalProps {
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /** @deprecated Use size instead */
    maxWidth?: string;
    size?: ModalSize;
    showCloseButton?: boolean;
    zIndex?: number;
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
    variant?: ModalVariant;
}

export interface ModalRef {
    handleClose: () => void;
}

const SIZE_CLASS: Record<ModalSize, string> = {
    sm:   'max-w-sm',
    md:   'max-w-md',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    full: 'max-w-[95vw] w-[95vw]',
};

const VARIANT_HEADER: Record<ModalVariant, string> = {
    default: 'bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
    danger:  'bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800',
    success: 'bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800',
};

const VARIANT_TITLE: Record<ModalVariant, string> = {
    default: 'text-gray-900 dark:text-white',
    danger:  'text-red-700 dark:text-red-300',
    success: 'text-green-700 dark:text-green-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
};

export const Modal = forwardRef<ModalRef, ModalProps>(({
    onClose,
    title,
    children,
    footer,
    maxWidth,
    size,
    showCloseButton = true,
    zIndex = 50,
    closeOnBackdrop = false,
    closeOnEsc = false,
    variant = 'default',
}, ref) => {
    const [show, setShow] = useState(false);
    const handleCloseRef = useRef<() => void>(() => {});
    const panelRef = useRef<HTMLElement>(null);
    const titleId = `modal-title-${useId()}`;

    const handleClose = () => {
        setShow(false);
        setTimeout(() => onClose(), 300);
    };

    handleCloseRef.current = handleClose;

    useEffect(() => { setShow(true); }, []);

    // El foco se lleva al panel y se mantiene dentro mientras el modal está
    // abierto; al cerrarlo vuelve a donde estaba. Sin esto, tabular saca al
    // usuario de teclado al contenido de detrás, que sigue siendo alcanzable.
    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const panel = panelRef.current;
        const focusables = () => Array.from(
            panel?.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ) ?? [],
        ).filter(el => el.offsetParent !== null);

        (focusables()[0] ?? panel)?.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const items = focusables();
            if (!items.length) { e.preventDefault(); return; }
            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;
            if (e.shiftKey && (active === first || !panel?.contains(active))) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            previouslyFocused?.focus?.();
        };
    }, []);

    useEffect(() => {
        if (!closeOnEsc) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleCloseRef.current();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [closeOnEsc]);

    useImperativeHandle(ref, () => ({ handleClose }));

    const widthCls = size ? SIZE_CLASS[size] : (maxWidth ?? 'max-w-2xl');

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdrop && e.target === e.currentTarget) handleClose();
    };

    return (
        <dialog
            open={show}
            aria-modal="true"
            aria-labelledby={titleId}
            className={`fixed inset-0 w-full h-full flex items-center justify-center p-4 transition-opacity duration-300 motion-reduce:transition-none bg-gray-900/60 backdrop-blur-sm ${show ? 'opacity-100' : 'opacity-0'}`}
            style={{ zIndex: zIndex - 10 }}
            onClick={handleBackdropClick}
        >
            <article
                ref={panelRef}
                tabIndex={-1}
                className={`relative focus:outline-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl w-full ${widthCls} max-h-[90vh] flex flex-col overflow-hidden`}
                style={{ zIndex }}
            >
                <header className={`shrink-0 px-6 py-4 flex items-center justify-between ${VARIANT_HEADER[variant]}`}>
                    <h2 id={titleId} className={`text-2xl font-bold ${VARIANT_TITLE[variant]}`}>{title}</h2>
                    {showCloseButton && (
                        <Button
                            variant="icon"
                            onClick={handleClose}
                            aria-label="Cerrar"
                            title="Cerrar"
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </Button>
                    )}
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
                {footer && (
                    <footer className="shrink-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
                        {footer}
                    </footer>
                )}
            </article>
        </dialog>
    );
});

Modal.displayName = 'Modal';
