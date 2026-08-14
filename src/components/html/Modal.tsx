import { Button } from './Button';
import { CloseIcon } from '../icons/icons';
import { bg, border, text } from '../../theme/tokens';
import { motion, motionDuration, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import React, { useEffect, useId, useState, useRef, forwardRef, useImperativeHandle } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalVariant = 'default' | 'danger' | 'success' | 'warning';

export interface ModalProps extends AnimatableProps {
    onClose: () => void;
    /** Clases extra para el panel. Ganan sobre las de la librería (ver `cn`). */
    className?: string;
    title: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /** @deprecated Use size instead */
    maxWidth?: string;
    size?: ModalSize;
    showCloseButton?: boolean;
    /**
     * @deprecated Sin efecto desde 3.0.4. El diálogo se abre con `showModal()`,
     * que lo coloca en la *top layer* del navegador: siempre queda por encima de
     * todo, al margen de cualquier `z-index`. Se acepta por compatibilidad.
     */
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
    closeOnBackdrop = false,
    closeOnEsc = false,
    variant = 'default',
    animate,
    className = '',
}, ref) => {
    const [show, setShow] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const titleId = `modal-title-${useId()}`;

    // `onClose` se avisa cuando termina la animación de salida, no a los 300 ms
    // fijos de antes: aquella cifra no coincidía con `--nui-duration` y, con
    // `animate={false}`, hacía esperar a un cierre que ya era instantáneo.
    const handleClose = () => {
        setShow(false);
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
            dialogRef.current?.close?.();
            onClose();
        }, animate === false ? 0 : motionDuration());
    };

    // Se mantiene en una ref porque los listeners nativos se registran una sola
    // vez y capturarían el `handleClose` del primer render.
    const handleCloseRef = useRef(handleClose);
    handleCloseRef.current = handleClose;

    // Abrir con `showModal()` y no con el atributo `open` es la diferencia entre
    // un diálogo modal y uno que no lo es. El navegador se encarga entonces de
    // la *top layer*, del velo `::backdrop`, de atrapar el foco, de devolverlo
    // al cerrar y de marcar el resto de la página como `inert` — que es lo que
    // de verdad faltaba: la trampa de foco manual solo capturaba el tabulador,
    // así que un lector de pantalla seguía paseándose por el fondo.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        // El guardia de `open` no es cosmético: `showModal()` lanza
        // `InvalidStateError` sobre un diálogo ya abierto, y en `StrictMode` el
        // efecto se ejecuta dos veces. Sin él, la excepción cortaba el efecto
        // antes del `setShow(true)` y el panel se quedaba invisible.
        if (typeof dialog.showModal === 'function') {
            if (!dialog.open) dialog.showModal();
        } else {
            dialog.setAttribute('open', ''); // navegador sin <dialog> modal
        }
        setShow(true);
        return () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
    }, []);

    // El navegador no bloquea el desplazamiento de la página de detrás.
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, []);

    // El Escape nativo cierra de golpe y sin animación, así que siempre se
    // intercepta: si `closeOnEsc` está activo lo reconducimos por `handleClose`,
    // y si no, se queda en nada.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const onCancel = (e: Event) => {
            e.preventDefault();
            if (closeOnEsc) handleCloseRef.current();
        };
        dialog.addEventListener('cancel', onCancel);
        return () => dialog.removeEventListener('cancel', onCancel);
    }, [closeOnEsc]);

    useImperativeHandle(ref, () => ({ handleClose }));

    const widthCls = size ? SIZE_CLASS[size] : (maxWidth ?? 'max-w-2xl');

    // Con `showModal()` el `<dialog>` ocupa toda la ventana, así que un clic
    // fuera del panel aterriza en el propio diálogo.
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdrop && e.target === e.currentTarget) handleClose();
    };

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            style={motionStyle(animate)}
            className={cn(
                'fixed inset-0 m-0 max-w-none max-h-none w-full h-full border-none p-4 flex items-center justify-center',
                motion.fade,
                'bg-[color-mix(in_oklab,var(--nui-scrim,oklch(21%_.034_264.665))_60%,transparent)] backdrop-blur-sm backdrop:bg-transparent',
                show ? 'opacity-100' : 'opacity-0',
            )}
            onClick={handleBackdropClick}
        >
            <article
                className={cn(
                    'relative border rounded-lg shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden',
                    bg.surface, border.subtle, widthCls, motion.enter,
                    show ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
                    className,
                )}
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
