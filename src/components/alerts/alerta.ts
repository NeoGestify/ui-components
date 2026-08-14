import Swal from "sweetalert2";
import { activeScheme, resolveColor } from "../../theme/colors";
import { DEFAULT_MESSAGES, type NuiMessages } from "../../context/config/config.types";

/**
 * Los alerts son funciones sueltas, no componentes, así que no pueden leer el
 * `NuiConfigProvider` por contexto. Sus textos se configuran una vez al arrancar
 * la aplicación:
 *
 * ```ts
 * configureAlertas({ confirm: 'OK', cancel: 'Cancel' });
 * ```
 */
let alertMessages: Pick<NuiMessages, 'confirm' | 'cancel' | 'deny'> = {
    confirm: DEFAULT_MESSAGES.confirm,
    cancel: DEFAULT_MESSAGES.cancel,
    deny: DEFAULT_MESSAGES.deny,
};

export function configureAlertas(messages: Partial<typeof alertMessages>): void {
    alertMessages = { ...alertMessages, ...messages };
}

export interface AlertaOptions {
    title: string;
    text: string;
    icon: 'success' | 'error' | 'warning' | 'info' | 'question';
    confirmButtonText?: string;
    showCancelButton?: boolean;
    cancelButtonText?: string;
    showDenyButton?: boolean;
    denyButtonText?: string;
    /**
     * Por defecto se oculta en los toasts y en los avisos con temporizador,
     * que se cierran solos. Ponlo explícitamente para forzar uno u otro.
     */
    showConfirmButton?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    onDeny?: () => void;
    toast?: boolean;
    timer?: number;
    position?: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end';
    allowOutsideClick?: boolean;
    allowEscapeKey?: boolean;
    input?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'range' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'url';
    inputLabel?: string;
    inputPlaceholder?: string;
    inputValue?: string;
    inputValidator?: (value: unknown) => string | null | Promise<string | null>;
    inputAttributes?: Record<string, string>;
}

export async function Alerta(options: AlertaOptions) {
    // SweetAlert2 pinta su propio DOM fuera de Tailwind, así que los colores del
    // tema se resuelven aquí a partir de las variables `--nui-*`.
    const scheme = activeScheme();
    const color = (token: Parameters<typeof resolveColor>[0]) => resolveColor(token, scheme);

    const result = await Swal.fire({
        title: options.title,
        text: options.text,
        icon: options.icon,
        confirmButtonText: options.confirmButtonText || alertMessages.confirm,
        showCancelButton: options.showCancelButton || false,
        cancelButtonText: options.cancelButtonText || alertMessages.cancel,
        showDenyButton: options.showDenyButton || false,
        denyButtonText: options.denyButtonText || alertMessages.deny,
        background: color('surface-muted'),
        color: color('text'),
        confirmButtonColor: color('accent'),
        cancelButtonColor: color('text-subtle'),
        denyButtonColor: color('danger'),
        toast: options.toast || false,
        timer: options.timer,
        position: options.position || 'center',
        showConfirmButton: options.showConfirmButton ?? (!options.toast && !options.timer),
        timerProgressBar: options.toast || !!options.timer,
        allowOutsideClick: options.allowOutsideClick !== false, // Por defecto true
        allowEscapeKey: options.allowEscapeKey !== false, // Por defecto true
        input: options.input,
        inputLabel: options.inputLabel,
        inputPlaceholder: options.inputPlaceholder,
        inputValue: options.inputValue,
        inputValidator: options.inputValidator,
        inputAttributes: options.inputAttributes
    });

    if (result.isConfirmed && options.onConfirm) {
        options.onConfirm();
    } else if (result.isDenied && options.onDeny) {
        options.onDeny();
    } else if (result.isDismissed && options.onCancel) {
        options.onCancel();
    }

    return result;
}

// Funciones de conveniencia para casos comunes
export const AlertaExito = (title: string, text: string, onConfirm?: () => void, options?: { allowOutsideClick?: boolean; allowEscapeKey?: boolean }) =>
    Alerta({ title, text, icon: 'success', confirmButtonText: 'Aceptar', onConfirm, ...options });

export const AlertaError = (title: string, text: string, onConfirm?: () => void, options?: { allowOutsideClick?: boolean; allowEscapeKey?: boolean }) =>
    Alerta({ title, text, icon: 'error', confirmButtonText: 'Aceptar', onConfirm, ...options });

export const AlertaInfo = (title: string, text: string, onConfirm?: () => void, options?: { allowOutsideClick?: boolean; allowEscapeKey?: boolean }) =>
    Alerta({ title, text, icon: 'info', confirmButtonText: 'Entendido', onConfirm, ...options });

export const AlertaAdvertencia = (title: string, text: string, onConfirm?: () => void, onCancel?: () => void, options?: { allowOutsideClick?: boolean; allowEscapeKey?: boolean }) =>
    Alerta({ title, text, icon: 'warning', confirmButtonText: 'Sí, continuar', cancelButtonText: 'Cancelar', showCancelButton: true, onConfirm, onCancel, ...options });

export const AlertaConfirmacion = (title: string, text: string, onConfirm?: () => void, onCancel?: () => void, options?: { allowOutsideClick?: boolean; allowEscapeKey?: boolean }) =>
    Alerta({ title, text, icon: 'question', confirmButtonText: 'Sí', cancelButtonText: 'No', showCancelButton: true, onConfirm, onCancel, ...options });

export const AlertaToast = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info', timer: number = 3000, position: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end') =>
    Alerta({ title, text, icon, toast: true, timer, position });