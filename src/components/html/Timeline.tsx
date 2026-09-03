import { type FC, type ReactNode } from 'react';
import { bg, border, text } from '../../theme/tokens';
import { motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';

type TimelineVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const PUNTO: Record<TimelineVariant, string> = {
  neutral: `${bg.surfaceMuted} ${border.base}`,
  accent:  `${bg.accent} border-transparent`,
  success: `${bg.success} border-transparent`,
  warning: `${bg.warning} border-transparent`,
  danger:  `${bg.danger} border-transparent`,
  info:    `${bg.info} border-transparent`,
};

export interface TimelineItem {
  /** Identificador estable. Sin él se usa el índice. */
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Fecha, hora, autor… Va alineado con el título. */
  meta?: ReactNode;
  /** Sustituye al punto de color. */
  icon?: ReactNode;
  variant?: TimelineVariant;
}

export interface TimelineProps extends AnimatableProps {
  items: TimelineItem[];
  /** Compacta el espaciado, para historiales largos. */
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
}

/**
 * Historial de sucesos en orden.
 *
 * Es un `<ol>`: el orden es el contenido, no la decoración. La línea vertical y
 * los puntos van marcados como decorativos para que un lector de pantalla lea
 * la lista y no la geometría.
 *
 * ```tsx
 * <Timeline items={[
 *   { title: 'Pedido creado', meta: '10:04', variant: 'accent' },
 *   { title: 'Pago confirmado', meta: '10:06', variant: 'success' },
 * ]} />
 * ```
 */
export const Timeline: FC<TimelineProps> = ({
  items,
  size = 'md',
  animate,
  className = '',
  'aria-label': ariaLabel,
}) => (
  <ol
    aria-label={ariaLabel}
    style={motionStyle(animate)}
    className={cn('relative', className)}
  >
    {items.map((item, i) => {
      const ultimo = i === items.length - 1;
      return (
        <li key={item.id ?? i} className="relative flex gap-3">
          {/* Columna del punto y la línea. La línea se corta en el último
              suceso; si no, queda un rabo colgando bajo el texto. */}
          <div className="relative flex flex-col items-center" aria-hidden="true">
            <span
              className={cn(
                'z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                item.icon ? 'h-7 w-7' : '',
                PUNTO[item.variant ?? 'neutral'],
                item.icon ? `${bg.surface} ${text.subtle}` : '',
              )}
            >
              {item.icon}
            </span>
            {!ultimo && (
              <span className={cn('w-px flex-1', bg.surfaceMuted, 'border-l', border.subtle)} />
            )}
          </div>

          <div className={cn('min-w-0 flex-1', ultimo ? 'pb-0' : size === 'sm' ? 'pb-4' : 'pb-6')}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm', text.base)}>
                {item.title}
              </p>
              {item.meta !== undefined && (
                <span className={cn('shrink-0 text-xs tabular-nums', text.faint)}>{item.meta}</span>
              )}
            </div>
            {item.description !== undefined && (
              <div className={cn('mt-0.5', size === 'sm' ? 'text-xs' : 'text-sm', text.subtle)}>
                {item.description}
              </div>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);
