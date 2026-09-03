import { type FC, type ReactNode } from 'react';
import { CheckIcon } from '../icons/icons';
import { bg, border, focusVisibleRing, ringOffset, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';

export interface StepItem {
  /** Identificador estable. Sin él se usa el índice. */
  id?: string;
  label: ReactNode;
  description?: ReactNode;
  /** Sustituye al número del círculo. */
  icon?: ReactNode;
  optional?: boolean;
}

type StepperSize = 'sm' | 'md';
type StepState = 'done' | 'current' | 'todo' | 'error';

const CIRCLE_SIZE: Record<StepperSize, string> = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
};

const LABEL_SIZE: Record<StepperSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
};

export interface StepperProps extends AnimatableProps {
  steps: StepItem[];
  /** Paso actual, empezando en 0. Igual a `steps.length` significa terminado. */
  current: number;
  /** Sin esto los pasos no se pueden pulsar. */
  onStepClick?: (index: number) => void;
  /** Índices marcados como fallidos. */
  errorSteps?: number[];
  orientation?: 'horizontal' | 'vertical';
  size?: StepperSize;
  /**
   * Qué pasos se pueden pulsar. `completed` (por defecto) deja volver atrás
   * pero no saltar hacia adelante, que es lo que evita dar por buenos pasos
   * que aún no se han rellenado.
   */
  clickable?: 'completed' | 'all';
  className?: string;
  'aria-label'?: string;
}

/**
 * Progreso por pasos.
 *
 * Es una lista ordenada de verdad (`<ol>`), no una fila de círculos: un lector
 * de pantalla anuncia «3 de 5» sin que haya que escribirlo, y el paso actual
 * lleva `aria-current="step"`.
 *
 * ```tsx
 * <Stepper current={paso} steps={[{ label: 'Datos' }, { label: 'Pago' }, { label: 'Listo' }]} />
 * ```
 */
export const Stepper: FC<StepperProps> = ({
  steps,
  current,
  onStepClick,
  errorSteps,
  orientation = 'horizontal',
  size = 'md',
  clickable = 'completed',
  animate,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const vertical = orientation === 'vertical';
  const fallidos = new Set(errorSteps ?? []);

  const estadoDe = (i: number): StepState => {
    if (fallidos.has(i)) return 'error';
    if (i < current) return 'done';
    if (i === current) return 'current';
    return 'todo';
  };

  const CIRCULO: Record<StepState, string> = {
    done:    `${bg.accent} ${text.onAccent} border-transparent`,
    current: `${bg.surface} ${text.accent} ${border.accent}`,
    todo:    `${bg.surfaceMuted} ${text.subtle} ${border.base}`,
    error:   `${bg.danger} ${text.onAccent} border-transparent`,
  };

  const ETIQUETA: Record<StepState, string> = {
    done:    text.muted,
    current: `${text.base} font-semibold`,
    todo:    text.faint,
    error:   text.danger,
  };

  return (
    <ol
      aria-label={ariaLabel}
      style={motionStyle(animate)}
      className={cn(vertical ? 'flex flex-col' : 'flex items-start', className)}
    >
      {steps.map((step, i) => {
        const estado = estadoDe(i);
        const pulsable = Boolean(onStepClick) && (clickable === 'all' || i <= current);
        const ultimo = i === steps.length - 1;

        const contenido = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full border-2 font-semibold',
                CIRCLE_SIZE[size], motion.colors, CIRCULO[estado],
              )}
            >
              {step.icon ?? (estado === 'done' ? <CheckIcon className="h-4 w-4" /> : i + 1)}
            </span>
            <span className={cn('min-w-0', vertical ? 'pb-6' : '')}>
              <span className={cn('block', LABEL_SIZE[size], ETIQUETA[estado])}>
                {step.label}
                {step.optional && (
                  <span className={cn('ml-1 font-normal', text.faint)}>(opcional)</span>
                )}
              </span>
              {step.description !== undefined && (
                <span className={cn('block text-xs', text.subtle)}>{step.description}</span>
              )}
            </span>
          </>
        );

        return (
          <li
            key={step.id ?? i}
            aria-current={estado === 'current' ? 'step' : undefined}
            className={cn(
              'relative',
              vertical ? 'flex flex-col' : 'flex-1 last:flex-none',
            )}
          >
            {/* La línea de unión va detrás del círculo y se corta en el último
                paso; dibujarla como borde del <li> dejaría un rabo suelto. */}
            {!ultimo && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute', motion.colors,
                  estado === 'done' ? bg.accent : `${bg.surfaceMuted} border ${border.subtle}`,
                  vertical
                    ? cn('left-0 top-0 w-0.5 -translate-x-1/2', size === 'sm' ? 'ml-3 mt-7' : 'ml-4 mt-9', 'h-[calc(100%-1.75rem)]')
                    : cn('top-0 h-0.5 left-0 right-0', size === 'sm' ? 'mt-3 ml-8 mr-2' : 'mt-4 ml-10 mr-2'),
                )}
              />
            )}

            {pulsable ? (
              <button
                type="button"
                onClick={() => onStepClick?.(i)}
                className={cn(
                  'relative flex gap-3 rounded-md text-left',
                  vertical ? 'items-start' : 'flex-col items-start pr-4',
                  focusVisibleRing, ringOffset, 'cursor-pointer touch-manipulation',
                )}
              >
                {contenido}
              </button>
            ) : (
              <span className={cn('relative flex gap-3', vertical ? 'items-start' : 'flex-col items-start pr-4')}>
                {contenido}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
};
