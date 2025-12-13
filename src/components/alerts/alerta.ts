import Swal from "sweetalert2";

interface AlertaOptions {
    title: string;
    text: string;
    icon: 'success' | 'error' | 'warning' | 'info' | 'question';
    confirmButtonText?: string;
    showCancelButton?: boolean;
    cancelButtonText?: string;
    showDenyButton?: boolean;
    denyButtonText?: string;
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
    const theme = localStorage.getItem('theme');

    const isDark = theme === 'dark';

    const result = await Swal.fire({
        title: options.title,
        text: options.text,
        icon: options.icon,
        confirmButtonText: options.confirmButtonText || 'Aceptar',
        showCancelButton: options.showCancelButton || false,
        cancelButtonText: options.cancelButtonText || 'Cancelar',
        showDenyButton: options.showDenyButton || false,
        denyButtonText: options.denyButtonText || 'No',
        background: isDark ? '#1f2937' : '#f9fafb',
        color: isDark ? '#f9fafb' : '#1f2937',
        customClass: {
            popup: isDark ? 'swal-dark-popup' : 'swal-light-popup',
            title: isDark ? 'swal-dark-title' : 'swal-light-title',
            confirmButton: isDark ? 'swal-dark-confirm' : 'swal-light-confirm',
            cancelButton: isDark ? 'swal-dark-cancel' : 'swal-light-cancel',
            denyButton: isDark ? 'swal-dark-deny' : 'swal-light-deny'
        },
        toast: options.toast || false,
        timer: options.timer,
        position: options.position || 'center',
        showConfirmButton: !options.toast && !options.timer,
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

export const AlertaAdvertencia = (title: string, text: string, onConfirm?: () => void, onCancel?: () => void, options?: { allowOutsideClick?: boolean; allowEscapeKey?: boolean }) =>
    Alerta({ title, text, icon: 'warning', confirmButtonText: 'Sí, continuar', cancelButtonText: 'Cancelar', showCancelButton: true, onConfirm, onCancel, ...options });

export const AlertaConfirmacion = (title: string, text: string, onConfirm?: () => void, onCancel?: () => void, options?: { allowOutsideClick?: boolean; allowEscapeKey?: boolean }) =>
    Alerta({ title, text, icon: 'question', confirmButtonText: 'Sí', cancelButtonText: 'No', showCancelButton: true, onConfirm, onCancel, ...options });

export const AlertaToast = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info', timer: number = 3000, position: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end') =>
    Alerta({ title, text, icon, toast: true, timer, position });