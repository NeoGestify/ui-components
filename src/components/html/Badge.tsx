import { type FC, type HTMLAttributes, type ReactNode } from 'react';
import { CloseIcon } from '../icons/icons';
import { bg, border, focusVisibleRing, text } from '../../theme/tokens';
import { cn } from '../../internal/cn';

type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'solid';
type BadgeSize = 'sm' | 'md' | 'lg';

const SIZE: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[0.6875rem] gap-1',
  md: 'px-2 py-0.5 text-xs gap-1',
  lg: 'px-2.5 py-1 text-sm gap-1.5',
};

/** Fondo tenue + texto del mismo tono: legible sin gritar. */
const soft = (token: string, fallbackLight: string, fallbackDark: string) =>
  `bg-[color-mix(in_oklab,var(--nui-${token},${fallbackLight})_12%,white)] ` +
  `dark:bg-[color-mix(in_oklab,var(--nui-${token}-dark,${fallbackDark})_22%,transparent)]`;

const VARIANT: Record<BadgeVariant, string> = {
  neutral: `${bg.surfaceMuted} ${text.muted}`,
  accent:  `${bg.accentSoft} ${text.accent}`,
  success: `${soft('success', 'oklch(62.7%_.194_149.214)', 'oklch(72.3%_.219_149.579)')} ${text.success}`,
  warning: `${soft('warning', 'oklch(68.1%_.162_75.834)', 'oklch(79.5%_.184_86.047)')} ${text.warning}`,
  danger:  `${soft('danger', 'oklch(57.7%_.245_27.325)', 'oklch(63.7%_.237_25.331)')} ${text.danger}`,
  info:    `${soft('info', 'oklch(54.6%_.245_262.881)', 'oklch(62.3%_.214_259.815)')} ${text.info}`,
  outline: `bg-transparent border ${border.base} ${text.muted}`,
  solid:   `${bg.accent} ${text.onAccent}`,
};

const DOT: Record<BadgeVariant, string> = {
  neutral: 'bg-[var(--nui-text-faint,oklch(70.7%_.022_261.325))]',
  accent:  bg.accent,
  success: bg.success,
  warning: bg.warning,
  danger:  bg.danger,
  info:    bg.info,
  outline: 'bg-[var(--nui-text-faint,oklch(70.7%_.022_261.325))]',
  solid:   'bg-[var(--nui-accent-fg,#fff)]',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Punto de color a la izquierda: estados de un vistazo. */
  dot?: boolean;
  /** Forma de píldora en vez de esquinas suaves. */
  pill?: boolean;
  icon?: ReactNode;
  /** Muestra una «×» para quitarlo. Convierte la etiqueta en interactiva. */
  onRemove?: () => void;
  /** Texto del botón de quitar, para lectores de pantalla. */
  removeLabel?: string;
}

/**
 * Etiqueta corta para estados, categorías y contadores.
 *
 * ```tsx
 * <Badge variant="success" dot>Activo</Badge>
 * <Badge variant="accent" onRemove={() => quitar(tag)}>{tag}</Badge>
 * ```
 */
export const Badge: FC<BadgeProps> = ({
  variant = 'neutral', size = 'md', dot = false, pill = false, icon,
  onRemove, removeLabel = 'Quitar', className = '', children, ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center font-medium whitespace-nowrap align-middle',
      pill ? 'rounded-full' : 'rounded-md',
      SIZE[size], VARIANT[variant], className,
    )}
    {...props}
  >
    {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[variant]}`} aria-hidden="true" />}
    {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
    {children}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel}${typeof children === 'string' ? `: ${children}` : ''}`}
        className={`-mr-0.5 ml-0.5 shrink-0 rounded-full opacity-60 hover:opacity-100 ${focusVisibleRing}`}
      >
        <CloseIcon className="h-3 w-3" />
      </button>
    )}
  </span>
);
