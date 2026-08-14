import {
  forwardRef, useEffect, useId, useImperativeHandle, useRef, useState,
  type ReactNode,
} from 'react';
import { Button } from './Button';
import { CloseIcon } from '../icons/icons';
import { bg, border, text } from '../../theme/tokens';
import { blurStyle, motion, motionDuration, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useScrollLock } from '../../internal/useScrollLock';
import { useMessage } from '../../context/config/NuiConfigProvider';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps extends AnimatableProps {
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Borde por el que entra. Por defecto, la derecha. */
  side?: DrawerSide;
  size?: DrawerSize;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  /**
   * Desenfoque del fondo, en píxeles. `false` lo quita.
   * Por defecto, el valor global (`--nui-blur`, 8 px).
   */
  blur?: number | false;
  className?: string;
}

export interface DrawerRef {
  handleClose: () => void;
}

/**
 * Ancho para los laterales, alto para los de arriba y abajo.
 *
 * La escala vertical es más generosa que la horizontal a propósito: en un panel
 * lateral la cabecera y el pie se reparten el alto de la pantalla y no se notan,
 * pero en uno horizontal se comen un trozo fijo de unos 115 px del total. Con
 * `h-64` como talla media quedaban ~140 px útiles y cualquier formulario salía
 * ya con su propia barra de desplazamiento.
 */
const SIZE: Record<DrawerSide, Record<DrawerSize, string>> = {
  left:   { sm: 'w-72',  md: 'w-96',      lg: 'w-[32rem]',  xl: 'w-[44rem]',  full: 'w-screen' },
  right:  { sm: 'w-72',  md: 'w-96',      lg: 'w-[32rem]',  xl: 'w-[44rem]',  full: 'w-screen' },
  top:    { sm: 'h-56',  md: 'h-[22rem]', lg: 'h-[30rem]',  xl: 'h-[38rem]',  full: 'h-screen' },
  bottom: { sm: 'h-56',  md: 'h-[22rem]', lg: 'h-[30rem]',  xl: 'h-[38rem]',  full: 'h-screen' },
};

const ANCLA: Record<DrawerSide, string> = {
  left:   'left-0 top-0 h-full',
  right:  'right-0 top-0 h-full',
  top:    'top-0 left-0 w-full',
  bottom: 'bottom-0 left-0 w-full',
};

const FUERA: Record<DrawerSide, string> = {
  left:   '-translate-x-full',
  right:  'translate-x-full',
  top:    '-translate-y-full',
  bottom: 'translate-y-full',
};

/**
 * Panel que entra desde un borde de la pantalla.
 *
 * Es un `<dialog>` abierto con `showModal()`, igual que `Modal`, así que hereda
 * lo mismo del navegador: *top layer* por encima de cualquier `z-index`, foco
 * atrapado de verdad, resto de la página `inert` —también para lectores de
 * pantalla— y foco devuelto al cerrar.
 *
 * ```tsx
 * {abierto && (
 *   <Drawer title="Filtros" side="right" onClose={() => setAbierto(false)}>
 *     <Form>…</Form>
 *   </Drawer>
 * )}
 * ```
 *
 * Como `Modal`, se controla montándolo y desmontándolo; `onClose` se avisa
 * cuando termina la animación de salida.
 */
export const Drawer = forwardRef<DrawerRef, DrawerProps>(({
  onClose,
  title,
  children,
  footer,
  side = 'right',
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  animate,
  blur,
  className = '',
}, ref) => {
  const closeLabel = useMessage('close');
  const [show, setShow] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = `drawer-title-${useId()}`;

  const handleClose = () => {
    setShow(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      dialogRef.current?.close?.();
      onClose();
    }, animate === false ? 0 : motionDuration());
  };

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // `showModal()` lanza `InvalidStateError` sobre un diálogo ya abierto, y en
    // `StrictMode` el efecto se ejecuta dos veces.
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    // Este reflujo forzado NO es supersticioso. El diálogo acaba de pasar de
    // `display: none` a visible, y una transición solo arranca si el navegador
    // ha llegado a CALCULAR el estilo de partida. Sin esto, el estado inicial
    // (el panel desplazado fuera) y el final se resolvían en el mismo cálculo,
    // así que no había nada entre lo que interpolar: el panel aparecía ya
    // colocado y lo único que se veía era el fundido del diálogo — idéntico
    // para los cuatro lados, de ahí que parecieran todos la misma animación.
    //
    // Leer `offsetHeight` obliga a resolver el estilo aquí y ahora; el cambio
    // de clase que viene después ya es una transición de verdad.
    void dialog.offsetHeight;
    setShow(true);
  }, []);

  useScrollLock();

  // El Escape nativo cierra de golpe y sin animación, así que se intercepta.
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

  const horizontal = side === 'left' || side === 'right';

  return (
    // El equivalente por teclado del clic en el velo es el Escape, que ya se
    // atiende por el evento nativo `cancel`, y siempre hay un botón de cerrar.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      style={{ ...motionStyle(animate), ...blurStyle(blur) }}
      onClick={e => { if (closeOnBackdrop && e.target === e.currentTarget) handleClose(); }}
      className={cn(
        'fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-none bg-transparent p-0',
        // `overflow-clip`, y no `overflow-hidden`, a propósito. Los dos recortan,
        // pero `hidden` convierte al diálogo en CONTENEDOR DESPLAZABLE. El panel
        // arranca desplazado un 100 % fuera para poder entrar deslizándose, y
        // al abrir el navegador mueve el foco dentro y desplaza el contenedor
        // para hacerlo visible: un salto brusco justo antes de la animación.
        //
        // Solo pasaba en `right` y `bottom` —hacia el lado positivo hay
        // desbordamiento alcanzable— y no en `left` ni `top`, que el navegador
        // recorta sin más. Por eso el cajón de la izquierda se veía bien y los
        // otros dos «parpadeaban».
        //
        // `clip` no crea contenedor de desplazamiento, así que no hay nada que
        // el navegador pueda mover.
        'overflow-clip',
        'backdrop:bg-transparent',
        // El diálogo NO se atenúa. Antes llevaba su propio `opacity-0 → 100`
        // encima del velo, así que el panel también se desvanecía y el
        // desenfoque entraba de golpe con él. Ahora cada parte hace lo suyo: el
        // velo se funde y el panel se desliza.
      )}
    >
      {/* El velo va aparte del panel para que solo él se atenúe; si fuera el
          fondo del <dialog>, el panel heredaría su transparencia. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 bg-[color:color-mix(in_oklab,var(--nui-scrim,oklch(21%_.034_264.665))_55%,transparent)]',
          motion.scrim,
          show ? 'opacity-100 backdrop-blur-[var(--nui-blur,8px)]' : 'opacity-0 backdrop-blur-[0px]',
        )}
      />

      <section
        className={cn(
          'absolute flex flex-col shadow-2xl',
          bg.surface,
          ANCLA[side],
          SIZE[side][size],
          horizontal ? 'max-w-[95vw]' : 'max-h-[95vh]',
          // El borde va solo por el lado que da al interior de la página.
          side === 'right'  && `border-l ${border.subtle}`,
          side === 'left'   && `border-r ${border.subtle}`,
          side === 'top'    && `border-b ${border.subtle}`,
          side === 'bottom' && `border-t ${border.subtle}`,
          motion.transform,
          show ? 'translate-x-0 translate-y-0' : FUERA[side],
          className,
        )}
      >
        <header className={cn('flex shrink-0 items-center justify-between px-5 py-4 border-b', bg.surfaceBand, border.subtle)}>
          <h2 id={titleId} className={cn('text-lg font-semibold', text.base)}>{title}</h2>
          {showCloseButton && (
            <Button variant="icon" onClick={handleClose} aria-label={closeLabel} title={closeLabel}>
              <CloseIcon className="h-5 w-5" />
            </Button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <footer className={cn('flex shrink-0 justify-end gap-3 border-t px-5 py-4', bg.surfaceBand, border.subtle)}>
            {footer}
          </footer>
        )}
      </section>
    </dialog>
  );
});

Drawer.displayName = 'Drawer';
