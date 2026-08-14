import { type FC, type FunctionComponent, type HTMLAttributes, type ReactNode } from 'react';
import { CheckCircleIcon, CloseIcon, ErrorIcon, InfoIcon, WarningIcon } from '../icons/icons';
import { border, focusVisibleRing, text } from '../../theme/tokens';
import { cn } from '../../internal/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

/** Fondo y borde teñidos con el color semántico, sin tapar el texto. */
const TINT: Record<AlertVariant, string> = {
  info: 'bg-[color-mix(in_oklab,var(--nui-info,oklch(54.6%_.245_262.881))_8%,white)] dark:bg-[color-mix(in_oklab,var(--nui-info-dark,oklch(62.3%_.214_259.815))_14%,transparent)] border-[color:color-mix(in_oklab,var(--nui-info,oklch(54.6%_.245_262.881))_30%,transparent)]',
  success: 'bg-[color-mix(in_oklab,var(--nui-success,oklch(62.7%_.194_149.214))_8%,white)] dark:bg-[color-mix(in_oklab,var(--nui-success-dark,oklch(72.3%_.219_149.579))_14%,transparent)] border-[color:color-mix(in_oklab,var(--nui-success,oklch(62.7%_.194_149.214))_30%,transparent)]',
  warning: 'bg-[color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_10%,white)] dark:bg-[color-mix(in_oklab,var(--nui-warning-dark,oklch(79.5%_.184_86.047))_14%,transparent)] border-[color:color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_30%,transparent)]',
  danger: 'bg-[color-mix(in_oklab,var(--nui-danger,oklch(57.7%_.245_27.325))_8%,white)] dark:bg-[color-mix(in_oklab,var(--nui-danger-dark,oklch(63.7%_.237_25.331))_14%,transparent)] border-[color:color-mix(in_oklab,var(--nui-danger,oklch(57.7%_.245_27.325))_30%,transparent)]',
  neutral: `bg-[var(--nui-surface-muted,oklch(98.5%_.002_247.839))] dark:bg-[var(--nui-surface-muted-dark,oklch(37.3%_.034_259.733))] ${border.subtle}`,
};

const ICON_COLOR: Record<AlertVariant, string> = {
  info: text.info, success: text.success, warning: text.warning,
  danger: text.danger, neutral: text.subtle,
};

/** Icono por variante, tomado de la colección compartida. */
const ICON: Record<AlertVariant, FunctionComponent<{ className?: string }>> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: ErrorIcon,
  neutral: InfoIcon,
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: ReactNode;
  /** Icono propio. `false` lo quita. */
  icon?: ReactNode | false;
  /** Botón de cerrar. */
  onClose?: () => void;
  closeLabel?: string;
  /** Botones o enlaces bajo el mensaje. */
  actions?: ReactNode;
}

/**
 * Aviso en línea, dentro del flujo de la página.
 *
 * Distinto de las alertas `Alerta*`, que son diálogos de SweetAlert2 que
 * interrumpen al usuario. Este se queda en su sitio.
 *
 * ```tsx
 * <Alert variant="warning" title="Cuota casi llena">
 *   Has usado el 92 % del espacio.
 * </Alert>
 * ```
 */
const VariantIcon = ({ variant }: { variant: AlertVariant }) => {
  const Icon = ICON[variant];
  return <Icon className="h-5 w-5" />;
};

export const Alert: FC<AlertProps> = ({
  variant = 'info', title, icon, onClose, closeLabel = 'Cerrar', actions,
  className = '', children, ...props
}) => (
  <div
    // `alert` interrumpe al lector de pantalla; para lo informativo basta con
    // anunciarlo cuando termine lo que esté leyendo.
    role={variant === 'danger' ? 'alert' : 'status'}
    className={cn('flex gap-3 rounded-lg border p-4 text-sm', TINT[variant], className)}
    {...props}
  >
    {icon !== false && (
      <span className={`shrink-0 ${ICON_COLOR[variant]}`} aria-hidden="true">
        {icon ?? <VariantIcon variant={variant} />}
      </span>
    )}

    <div className="min-w-0 flex-1">
      {title !== undefined && (
        <p className={`font-semibold ${text.base}`}>{title}</p>
      )}
      {children !== undefined && (
        <div className={`${title !== undefined ? 'mt-1' : ''} ${text.muted}`}>{children}</div>
      )}
      {actions !== undefined && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </div>

    {onClose && (
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className={`-mr-1 -mt-1 h-6 w-6 shrink-0 rounded-md ${text.faint} hover:opacity-70 ${focusVisibleRing}`}
      >
        <CloseIcon className="mx-auto h-4 w-4" />
      </button>
    )}
  </div>
);
