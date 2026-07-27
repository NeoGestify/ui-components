import { Button } from './Button';
import { CloseIcon } from '../icons/icons';
import { bg, border, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import React, { useEffect, useId, useState, useRef, forwardRef, useImperativeHandle } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalVariant = 'default' | 'danger' | 'success' | 'warning';

interface ModalProps extends AnimatableProps {
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
    default: `${bg.surfaceBand} border-b ${border.subtle}`,
    danger:  'bg-[color-mix(in_oklab,var(--nui-danger,oklch(57.7%_.245_27.325))_8%,white)] dark:bg-[color-mix(in_oklab,var(--nui-danger-dark,oklch(63.7%_.237_25.331))_25%,transparent)] border-b border-[color-mix(in_oklab,var(--nui-danger,oklch(57.7%_.245_27.325))_25%,transparent)]',
    success: 'bg-[color-mix(in_oklab,var(--nui-success,oklch(62.7%_.194_149.214))_8%,white)] dark:bg-[color-mix(in_oklab,var(--nui-success-dark,oklch(72.3%_.219_149.579))_25%,transparent)] border-b border-[color-mix(in_oklab,var(--nui-success,oklch(62.7%_.194_149.214))_25%,transparent)]',
    warning: 'bg-[color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_8%,white)] dark:bg-[color-mix(in_oklab,var(--nui-warning-dark,oklch(79.5%_.184_86.047))_25%,transparent)] border-b border-[color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_25%,transparent)]',
};

const VARIANT_TITLE: Record<ModalVariant, string> = {
    default: text.base,
    danger:  text.danger,
    success: text.success,
    warning: text.warning,
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
    animate,
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
            style={{ zIndex: zIndex - 10, ...motionStyle(animate) }}
            className={`fixed inset-0 w-full h-full flex items-center justify-center p-4 ${motion.fade} bg-[color-mix(in_oklab,var(--nui-scrim,oklch(21%_.034_264.665))_60%,transparent)] backdrop-blur-sm ${show ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleBackdropClick}
        >
            <article
                ref={panelRef}
                tabIndex={-1}
                className={`relative focus:outline-none ${bg.surface} border ${border.subtle} rounded-lg shadow-2xl w-full ${widthCls} max-h-[90vh] flex flex-col overflow-hidden
                    ${motion.enter} ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
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
                            className={`${text.faint} hover:text-[var(--nui-text-muted,oklch(37.3%_.034_259.733))] dark:hover:text-[var(--nui-text-muted-dark,oklch(87.2%_.01_258.338))]`}
                        >
                            <CloseIcon className="w-5 h-5" />
                        </Button>
                    )}
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
                {footer && (
                    <footer className={`shrink-0 ${bg.surfaceBand} border-t ${border.subtle} px-6 py-4 flex justify-end gap-3`}>
                        {footer}
                    </footer>
                )}
            </article>
        </dialog>
    );
});

Modal.displayName = 'Modal';
