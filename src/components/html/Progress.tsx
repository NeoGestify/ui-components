import { type FC, type HTMLAttributes, type ReactNode } from 'react';
import { bg, text } from '../../theme/tokens';
import { motion, withMotionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';

type ProgressVariant = 'accent' | 'success' | 'warning' | 'danger' | 'info';
type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE: Record<ProgressSize, string> = {
  xs: 'h-1', sm: 'h-1.5', md: 'h-2.5', lg: 'h-4',
};

const FILL: Record<ProgressVariant, string> = {
  accent: bg.accent, success: bg.success, warning: bg.warning,
  danger: bg.danger, info: bg.info,
};

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>, AnimatableProps {
  /** Valor actual. Se recorta a `[0, max]`. Ignorado si `indeterminate`. */
  value?: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: ReactNode;
  /** Muestra el porcentaje a la derecha de la etiqueta. */
  showValue?: boolean;
  /** Barra en movimiento para procesos de duración desconocida. */
  indeterminate?: boolean;
  /** Texto que anuncia el lector de pantalla. Por defecto, el porcentaje. */
  valueText?: string;
}

/**
 * Barra de progreso.
 *
 * ```tsx
 * <Progress value={72} label="Subiendo" showValue />
 * <Progress indeterminate label="Procesando…" />
 * ```
 */
export const Progress: FC<ProgressProps> = ({
  value = 0, max = 100, variant = 'accent', size = 'md',
  label, showValue = false, indeterminate = false, valueText,
  animate, className = '', style, ...props
}) => {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(safeMax, Math.max(0, value));
  const pct = Math.round((clamped / safeMax) * 100);

  return (
    <div className={cn('w-full', className)} style={withMotionStyle(animate, style)} {...props}>
      {(label !== undefined || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label !== undefined && <span className={`text-sm font-medium ${text.muted}`}>{label}</span>}
          {showValue && !indeterminate && (
            <span className={`text-xs tabular-nums ${text.subtle}`}>{pct} %</span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={indeterminate ? undefined : safeMax}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={indeterminate ? undefined : (valueText ?? `${pct} %`)}
        aria-busy={indeterminate || undefined}
        className={`w-full overflow-hidden rounded-full ${bg.surfaceMuted} ${SIZE[size]}`}
      >
        {indeterminate ? (
          <div className={`h-full w-2/5 rounded-full ${FILL[variant]} motion-safe:animate-[nuiProgressSlide_1.2s_ease-in-out_infinite]`} />
        ) : (
          <div
            className={`h-full rounded-full ${motion.size} ${FILL[variant]}`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>

      {indeterminate && (
        <style>{'@keyframes nuiProgressSlide{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}'}</style>
      )}
    </div>
  );
};
