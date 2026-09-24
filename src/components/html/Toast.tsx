import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type FC, type ReactNode,
} from 'react';
import { CheckCircleIcon, CloseIcon, ErrorIcon, InfoIcon, WarningIcon } from '../icons/icons';
import { bg, border, text } from '../../theme/tokens';
import { motion, motionDuration } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { Portal } from '../../internal/Portal';
import { useMessage } from '../../context/config/NuiConfigProvider';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export type ToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  /** Milisegundos en pantalla. `0` lo deja hasta que se cierre a mano. */
  duration?: number;
  /** Botón de acción a la derecha («Deshacer», «Ver»…). */
  action?: { label: ReactNode; onClick: () => void };
  /** Oculta la X. Úsalo solo si hay una acción que también cierra. */
  dismissible?: boolean;
  /** Se llama al desaparecer, sea por tiempo o a mano. */
  onDismiss?: () => void;
}

interface ToastRecord extends ToastOptions {
  id: string;
  /** Marcado para salir: sigue montado mientras dura la animación. */
  leaving?: boolean;
}

interface ToastApi {
  /** Muestra un aviso y devuelve su id. */
  toast: (options: ToastOptions) => string;
  /** Cierra uno por su id. */
  dismiss: (id: string) => void;
  /** Cierra todos. */
  dismissAll: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/**
 * Emite avisos desde cualquier punto del árbol.
 *
 * ```tsx
 * const { toast } = useToast();
 * toast({ title: 'Guardado', variant: 'success' });
 * toast({
 *   title: 'Registro eliminado',
 *   action: { label: 'Deshacer', onClick: restaurar },
 *   duration: 8000,
 * });
 * ```
 */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) {
    throw new Error('useToast() necesita un <ToastProvider> por encima.');
  }
  return api;
}

const VARIANT_ICON: Record<ToastVariant, FC<{ className?: string }>> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: ErrorIcon,
};

const VARIANT_ACCENT: Record<ToastVariant, string> = {
  info:    text.info,
  success: text.success,
  warning: text.warning,
  danger:  text.danger,
};

const POSITION_CLASS: Record<ToastPosition, string> = {
  'top-left':      'top-0 left-0 items-start',
  'top-center':    'top-0 left-1/2 -translate-x-1/2 items-center',
  'top-right':     'top-0 right-0 items-end',
  'bottom-left':   'bottom-0 left-0 items-start',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 items-center',
  'bottom-right':  'bottom-0 right-0 items-end',
};

/** Desde dónde entra, según el borde al que esté pegado. */
function enterOffset(position: ToastPosition): string {
  if (position.endsWith('left')) return 'translateX(-1rem)';
  if (position.endsWith('right')) return 'translateX(1rem)';
  return position.startsWith('top') ? 'translateY(-1rem)' : 'translateY(1rem)';
}

let contador = 0;
const nuevoId = () => `nui-toast-${++contador}`;

const Toast: FC<{
  record: ToastRecord;
  position: ToastPosition;
  onDismiss: (id: string) => void;
}> = ({ record, position, onDismiss }) => {
  const { id, title, description, variant = 'info', action, dismissible = true, leaving } = record;
  const closeLabel = useMessage('close');
  const [visible, setVisible] = useState(false);
  const Icon = VARIANT_ICON[variant];

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      // `alert` interrumpe al lector de pantalla; para lo demás basta con
      // anunciarlo cuando termine de leer lo que esté leyendo.
      role={variant === 'danger' ? 'alert' : 'status'}
      style={{ transform: visible && !leaving ? undefined : enterOffset(position) }}
      className={cn(
        'pointer-events-auto flex w-full max-w-sm gap-3 rounded-lg border p-3 shadow-lg',
        bg.surface, border.subtle,
        motion.enter,
        visible && !leaving ? 'opacity-100' : 'opacity-0',
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', VARIANT_ACCENT[variant])} />

      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', text.base)}>{title}</p>
        {description !== undefined && (
          <p className={cn('mt-0.5 text-sm', text.subtle)}>{description}</p>
        )}
        {action && (
          <button
            type="button"
            onClick={() => { action.onClick(); onDismiss(id); }}
            className={cn('cursor-pointer', 'mt-2 text-sm font-medium underline underline-offset-2', text.accent)}
          >
            {action.label}
          </button>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label={closeLabel}
          className={cn('cursor-pointer', '-m-1 shrink-0 self-start rounded p-1', text.faint, motion.colors)}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  /** Duración por defecto, en ms. `0` deja los avisos fijos. */
  duration?: number;
  /**
   * Máximo en pantalla a la vez. Al pasarse se retira el más antiguo: una pila
   * infinita de avisos tapa la aplicación entera.
   */
  limit?: number;
  /** Etiqueta accesible de la región que los contiene. */
  'aria-label'?: string;
}

/**
 * Avisos efímeros, sin depender de SweetAlert.
 *
 * ```tsx
 * <ToastProvider position="bottom-right">
 *   <App />
 * </ToastProvider>
 * ```
 *
 * El temporizador **se pausa** mientras el ratón está encima o algo dentro
 * tiene el foco: si no, un aviso con un botón de «Deshacer» desaparece justo
 * cuando vas a pulsarlo.
 */
export const ToastProvider: FC<ToastProviderProps> = ({
  children,
  position = 'bottom-right',
  duration = 5000,
  limit = 4,
  'aria-label': ariaLabel = 'Notificaciones',
}) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  /** Cuánto le queda a cada uno, para poder pausar y reanudar. */
  const restante = useRef(new Map<string, { queda: number; desde: number }>());
  /** Callbacks de cierre, aparte del estado, para no invocarlos dos veces. */
  const onDismissRef = useRef(new Map<string, () => void>());
  const [pausado, setPausado] = useState(false);

  /**
   * Los avisos NO se portalizan dentro del modal abierto, a diferencia del
   * resto de capas flotantes: tienen que sobrevivir a que ese modal se cierre.
   * Un «guardado con éxito» lanzado desde un formulario dentro de un modal se
   * iría con él justo al cerrarlo, que es cuando hay que leerlo.
   *
   * Así que se quedan colgando de <body> y se suben a la top layer con la API
   * de *popover*: es la forma de ponerse por encima de un `<dialog>` sin
   * meterse dentro de él. Donde no esté disponible se degrada al `z-index` de
   * siempre, que basta salvo que haya un modal abierto.
   */
  const subirATopLayer = useCallback((el: HTMLDivElement | null) => {
    if (!el || typeof el.showPopover !== 'function') return;
    try {
      // Por atributo y no por prop de JSX: `popover` todavía no está en los
      // tipos de React 18.
      el.setAttribute('popover', 'manual');
      if (!el.matches(':popover-open')) el.showPopover();
    } catch {
      // Un `popover` ya abierto o no soportado: se queda con su z-index.
    }
  }, []);

  const limpiarTimer = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
  }, []);

  const dismiss = useCallback((id: string) => {
    limpiarTimer(id);
    // Se marca la salida y se retira cuando acaba la animación; quitarlo de
    // golpe hace que desaparezca sin transición.
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      // El aviso a `onDismiss` va FUERA del actualizador de estado: React puede
      // ejecutar un actualizador dos veces (StrictMode lo hace a propósito) y
      // el consumidor vería su callback duplicado.
      onDismissRef.current.get(id)?.();
      onDismissRef.current.delete(id);
      setToasts(prev => prev.filter(t => t.id !== id));
      restante.current.delete(id);
    }, motionDuration());
  }, [limpiarTimer]);

  const programar = useCallback((id: string, ms: number) => {
    if (ms <= 0) return;
    restante.current.set(id, { queda: ms, desde: Date.now() });
    timers.current.set(id, setTimeout(() => dismiss(id), ms));
  }, [dismiss]);

  const toast = useCallback((options: ToastOptions) => {
    const id = nuevoId();
    if (options.onDismiss) onDismissRef.current.set(id, options.onDismiss);
    setToasts(prev => {
      const siguiente = [...prev, { ...options, id }];
      // El desbordamiento se recorta por el principio: lo más nuevo es lo que
      // interesa ver.
      return siguiente.length > limit ? siguiente.slice(siguiente.length - limit) : siguiente;
    });
    programar(id, options.duration ?? duration);
    return id;
  }, [duration, limit, programar]);

  const dismissAll = useCallback(() => {
    for (const id of timers.current.keys()) limpiarTimer(id);
    setToasts([]);
    restante.current.clear();
    onDismissRef.current.clear();
  }, [limpiarTimer]);

  // ── Pausa al pasar por encima o al enfocar ────────────────────────────────
  useEffect(() => {
    if (pausado) {
      for (const [id, timer] of timers.current) {
        clearTimeout(timer);
        const r = restante.current.get(id);
        if (r) r.queda = Math.max(0, r.queda - (Date.now() - r.desde));
      }
      timers.current.clear();
      return;
    }
    for (const [id, r] of restante.current) {
      if (timers.current.has(id) || r.queda <= 0) continue;
      r.desde = Date.now();
      timers.current.set(id, setTimeout(() => dismiss(id), r.queda));
    }
  }, [pausado, dismiss]);

  // Los temporizadores vivos se cancelan al desmontar el proveedor.
  useEffect(() => {
    const vivos = timers.current;
    return () => { vivos.forEach(clearTimeout); vivos.clear(); };
  }, []);

  const api = useMemo<ToastApi>(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll]);

  const abajo = position.startsWith('bottom');

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toasts.length > 0 && (
        <Portal container={typeof document === 'undefined' ? null : document.body}>
          <div
            ref={subirATopLayer}
            // `pointer-events-none` en el contenedor y `auto` en cada aviso: la
            // región ocupa una franja entera de la pantalla y sin esto bloquea
            // los clics de todo lo que tenga debajo.
            className={cn(
              'pointer-events-none fixed z-[80] flex max-h-screen w-full max-w-sm flex-col gap-2 overflow-hidden p-4',
              // El UA da a `[popover]` borde, relleno, fondo y `margin: auto`.
              'm-0 border-0 bg-transparent',
              POSITION_CLASS[position],
              // Lo más nuevo entra por el borde: arriba se apila hacia abajo y
              // abajo al revés, para que nunca empuje a lo que ya estabas
              // leyendo.
              abajo ? 'flex-col-reverse' : 'flex-col',
            )}
            role="region"
            aria-label={ariaLabel}
            onPointerEnter={() => setPausado(true)}
            onPointerLeave={() => setPausado(false)}
            onFocusCapture={() => setPausado(true)}
            onBlurCapture={() => setPausado(false)}
          >
            {toasts.map(t => (
              <Toast key={t.id} record={t} position={position} onDismiss={dismiss} />
            ))}
          </div>
        </Portal>
      )}
    </ToastContext.Provider>
  );
};
