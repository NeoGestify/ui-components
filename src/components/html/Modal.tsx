import { Button } from './Button';
import { CloseIcon } from '../icons/icons';
import { bg, border, text } from '../../theme/tokens';
import { blurStyle, motion, motionDuration, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { inertOutside } from '../../internal/inertOutside';
import { Portal } from '../../internal/Portal';
import { NUI_LAYERS } from '../../internal/layers';
import { pushTopLayer } from '../../internal/topLayer';
import { useMergedRefs } from '../../internal/mergeRefs';
import { useScrollLock } from '../../internal/useScrollLock';
import { useMessage } from '../../context/config/NuiConfigProvider';
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
     * `z-index` del diálogo.
     *
     * Para que signifique algo, el modal tiene que salirse de la *top layer*
     * del navegador — ahí un `z-index` es literalmente inerte, porque esa capa
     * va por encima de todo el documento pase lo que pase. Así que pasar
     * `zIndex` implica `topLayer={false}`, que es el comportamiento que tenía
     * el componente antes de la 3.0.4.
     *
     * Con `topLayer={false}` y sin dar valor, se apila en `NUI_LAYERS.modal`
     * (50) — por debajo de los menús y los avisos de la propia librería, que es
     * donde le toca a un diálogo.
     *
     * ```tsx
     * <Modal zIndex={40} … />   // y tu cosa a z-50 queda por encima
     * ```
     *
     * Ojo: casi nunca hace falta. Las capas flotantes de la propia librería
     * (`Dropdown`, `Combobox`, `Popover`, `Tooltip`, `Toast`) ya se pintan
     * dentro del modal, y otro `Modal` o `Drawer` abierto después también se
     * apila encima. `zIndex` es para meter por encima algo tuyo.
     */
    zIndex?: number;
    /**
     * Abre el diálogo en la *top layer* del navegador. Por defecto sí, salvo
     * que pases `zIndex`.
     *
     * Fuera de la top layer el diálogo se convierte en un elemento normal del
     * documento: obedece al `z-index`, pero el navegador deja de atrapar el
     * foco y de marcar el resto de la página como inerte. La librería lo
     * suple marcando `inert` a mano, así que la modalidad se conserva.
     */
    topLayer?: boolean;
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
    variant?: ModalVariant;
    /**
     * Desenfoque del fondo, en píxeles. `false` lo quita.
     * Por defecto, el valor global (`--nui-blur`, 8 px).
     */
    blur?: number | false;
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
    danger:  'bg-[color-mix(in_oklab,var(--nui-danger,oklch(57.7%_.245_27.325))_8%,white)] dark:bg-[color-mix(in_oklab,var(--nui-danger-dark,oklch(63.7%_.237_25.331))_25%,transparent)] border-b border-[color:color-mix(in_oklab,var(--nui-danger,oklch(57.7%_.245_27.325))_25%,transparent)]',
    success: 'bg-[color-mix(in_oklab,var(--nui-success,oklch(62.7%_.194_149.214))_8%,white)] dark:bg-[color-mix(in_oklab,var(--nui-success-dark,oklch(72.3%_.219_149.579))_25%,transparent)] border-b border-[color:color-mix(in_oklab,var(--nui-success,oklch(62.7%_.194_149.214))_25%,transparent)]',
    warning: 'bg-[color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_8%,white)] dark:bg-[color-mix(in_oklab,var(--nui-warning-dark,oklch(79.5%_.184_86.047))_25%,transparent)] border-b border-[color:color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_25%,transparent)]',
};

const VARIANT_TITLE: Record<ModalVariant, string> = {
    default: text.base,
    danger:  text.danger,
    success: text.success,
    warning: text.warning,
};

/** `<body>` cuando lo hay. En SSR el portal no pinta nada. */
const bodyOrNull = () => (typeof document === 'undefined' ? null : document.body);

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
    blur,
    zIndex,
    topLayer = zIndex === undefined,
    className = '',
}, ref) => {
    const closeLabel = useMessage('close');
    const [show, setShow] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // El nodo también en estado: con `topLayer={false}` el diálogo vive en un
    // portal, que no monta hasta su propio efecto. Atado solo a la ref, el
    // efecto de apertura corría con `dialogRef.current` todavía en `null` y el
    // diálogo no llegaba a abrirse nunca.
    const [dialogEl, setDialogEl] = useState<HTMLDialogElement | null>(null);
    const setDialog = useMergedRefs<HTMLDialogElement>(dialogRef, setDialogEl);
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
        const dialog = dialogEl;
        if (!dialog) return;
        // El guardia de `open` no es cosmético: `showModal()` lanza
        // `InvalidStateError` sobre un diálogo ya abierto, y en `StrictMode` el
        // efecto se ejecuta dos veces. Sin él, la excepción cortaba el efecto
        // antes del `setShow(true)` y el panel se quedaba invisible.
        // Fuera de la top layer se abre con el atributo `open`: es un diálogo
        // normal del documento, obedece al `z-index` y hay que suplir a mano la
        // inercia del resto de la página, que el navegador ya no aplica.
        let quitarInert: (() => void) | undefined;
        if (topLayer && typeof dialog.showModal === 'function') {
            if (!dialog.open) dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
            if (!topLayer) quitarInert = inertOutside(dialog);
        }
        // Se apunta en la pila de la top layer para que las capas flotantes
        // (Dropdown, Combobox, Tooltip, Toast) sepan dentro de qué portalizarse.
        // Sin esto acaban en <body>, por debajo de este diálogo, e invisibles.
        // Solo se apunta si de verdad está en la top layer: si no, las capas
        // flotantes deben seguir colgando de <body>, donde el `z-index` manda.
        const bajaTopLayer = topLayer ? pushTopLayer(dialog) : () => {};

        // El reflujo forzado hace que el navegador CALCULE el estilo de partida
        // ahora que el diálogo ya está visible. Sin él, el estado inicial
        // (`opacity-0 scale-95`) y el final se resolvían en el mismo cálculo y
        // no había nada entre lo que interpolar: el modal aparecía de golpe.
        void dialog.offsetHeight;
        setShow(true);
        return () => {
          bajaTopLayer();
          quitarInert?.();
          if (closeTimer.current) clearTimeout(closeTimer.current);
        };
    // `topLayer` no va en las dependencias: el modo de apertura se decide una
    // sola vez, al montar. Cambiarlo en caliente exigiría cerrar y reabrir el
    // diálogo, que no es algo que este componente soporte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dialogEl]);

    // El navegador no bloquea el desplazamiento de la página de detrás. Va por
    // `useScrollLock`, con contador: la versión anterior guardaba el `overflow`
    // previo en una variable local, así que con dos modales encimados el
    // segundo leía `'hidden'` como valor «anterior» y al cerrarse lo restauraba
    // — dejando la página bloqueada con todo cerrado.
    useScrollLock();

    // El Escape nativo cierra de golpe y sin animación, así que siempre se
    // intercepta: si `closeOnEsc` está activo lo reconducimos por `handleClose`,
    // y si no, se queda en nada.
    useEffect(() => {
        const dialog = dialogEl;
        if (!dialog) return;
        const onCancel = (e: Event) => {
            e.preventDefault();
            if (closeOnEsc) handleCloseRef.current();
        };
        dialog.addEventListener('cancel', onCancel);
        return () => dialog.removeEventListener('cancel', onCancel);
    }, [closeOnEsc, dialogEl]);

    useImperativeHandle(ref, () => ({ handleClose }));

    const widthCls = size ? SIZE_CLASS[size] : (maxWidth ?? 'max-w-2xl');

    // Con `showModal()` el `<dialog>` ocupa toda la ventana, así que un clic
    // fuera del panel aterriza en el propio diálogo.
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdrop && e.target === e.currentTarget) handleClose();
    };

    const dialogo = (
        // El equivalente por teclado del clic en el velo no es un listener aquí:
        // es el Escape, que ya se atiende por el evento nativo `cancel`, y
        // además siempre hay un botón de cerrar enfocable.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <dialog
            ref={setDialog}
            aria-labelledby={titleId}
            style={{ ...motionStyle(animate), ...blurStyle(blur), zIndex: topLayer ? undefined : (zIndex ?? NUI_LAYERS.modal) }}
            className={cn(
                'fixed inset-0 m-0 max-w-none max-h-none w-full h-full border-none p-4 flex items-center justify-center',
                motion.scrim,
                'bg-[color-mix(in_oklab,var(--nui-scrim,oklch(21%_.034_264.665))_60%,transparent)] backdrop:bg-transparent',
                show ? 'opacity-100 backdrop-blur-[var(--nui-blur,8px)]' : 'opacity-0 backdrop-blur-[0px]',
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
                            aria-label={closeLabel}
                            title={closeLabel}
                            className={`${text.faint} hover:text-[color:var(--nui-text-muted,oklch(37.3%_.034_259.733))] dark:hover:text-[color:var(--nui-text-muted-dark,oklch(87.2%_.01_258.338))]`}
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

    // Fuera de la top layer el diálogo tiene que colgar de <body>: `inertOutside`
    // marca a sus hermanos, y si estuviera enterrado en el árbol de la
    // aplicación su propio contenedor lo contendría y no se podría marcar nada.
    // Con `showModal()` da igual dónde esté, así que se deja en su sitio.
    return topLayer ? dialogo : <Portal container={bodyOrNull()}>{dialogo}</Portal>;
});

Modal.displayName = 'Modal';
