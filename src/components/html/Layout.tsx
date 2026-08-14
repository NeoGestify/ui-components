import type { FC, HTMLAttributes, ReactNode } from 'react';
import { bg, border, text } from '../../theme/tokens';
import { cn } from '../../internal/cn';

// ─── Divider ────────────────────────────────────────────────────────────────

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Texto centrado sobre la línea («o», «Más opciones»…). */
  label?: ReactNode;
  /** Alineación de la etiqueta. */
  labelPosition?: 'start' | 'center' | 'end';
}

/**
 * Separador con etiqueta opcional.
 *
 * Sin etiqueta es un `<hr>` semántico. Con ella pasa a ser un `role="separator"`
 * con texto, que es lo que quiere un «────  o  ────» entre dos bloques.
 */
export const Divider: FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  labelPosition = 'center',
  className = '',
  ...props
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px self-stretch', bg.surfaceMuted, className)}
        {...props}
      />
    );
  }

  if (label === undefined) {
    return <hr className={cn('border-t', border.subtle, className)} {...props} />;
  }

  const linea = <span className={cn('h-px flex-1 border-t', border.subtle)} aria-hidden="true" />;

  return (
    <div
      role="separator"
      className={cn('flex items-center gap-3', className)}
      {...props}
    >
      {labelPosition !== 'start' && linea}
      <span className={cn('shrink-0 text-xs font-medium uppercase tracking-wide', text.faint)}>
        {label}
      </span>
      {labelPosition !== 'end' && linea}
    </div>
  );
};

// ─── EmptyState ─────────────────────────────────────────────────────────────

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Icono o ilustración. Se pinta atenuado. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Botones de salida: crear el primer registro, limpiar el filtro… */
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const EMPTY_PAD: Record<NonNullable<EmptyStateProps['size']>, string> = {
  sm: 'py-6 gap-2',
  md: 'py-12 gap-3',
  lg: 'py-20 gap-4',
};

/**
 * Hueco con explicación y salida.
 *
 * Una lista vacía sin esto es indistinguible de una que no ha cargado. Y sin
 * `action` es un callejón sin salida: casi siempre hay algo que el usuario
 * puede hacer — crear el primer registro, quitar un filtro.
 *
 * ```tsx
 * <EmptyState
 *   icon={<BoxIcon className="h-10 w-10" />}
 *   title="Aún no hay pedidos"
 *   description="Cuando entre el primero, aparecerá aquí."
 *   action={<Button>Crear pedido</Button>}
 * />
 * ```
 */
export const EmptyState: FC<EmptyStateProps> = ({
  icon, title, description, action, size = 'md', className = '', ...props
}) => (
  <div
    className={cn('flex flex-col items-center justify-center px-6 text-center', EMPTY_PAD[size], className)}
    {...props}
  >
    {icon && <div className={cn('shrink-0', text.faint)} aria-hidden="true">{icon}</div>}
    <p className={cn('font-semibold', text.base, size === 'sm' ? 'text-sm' : 'text-base')}>{title}</p>
    {description !== undefined && (
      <p className={cn('max-w-sm text-sm', text.subtle)}>{description}</p>
    )}
    {action && <div className="mt-1">{action}</div>}
  </div>
);

// ─── Stat ───────────────────────────────────────────────────────────────────

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** Contexto bajo el valor: «vs. mes anterior». */
  hint?: ReactNode;
  icon?: ReactNode;
  /** Variación respecto al periodo anterior. El signo decide el color. */
  delta?: number;
  /** Cuando bajar es bueno (costes, tiempos de respuesta). */
  invertDelta?: boolean;
  /** Cifra con el mismo ancho por dígito, para que no baile al actualizarse. */
  tabular?: boolean;
}

/**
 * Cifra destacada de un panel.
 *
 * `delta` se colorea por su signo, pero con `invertDelta` para las métricas
 * donde bajar es lo bueno: un −12 % en costes es verde, no rojo.
 */
export const Stat: FC<StatProps> = ({
  label, value, hint, icon, delta, invertDelta = false, tabular = true,
  className = '', ...props
}) => {
  const bueno = delta === undefined ? null : invertDelta ? delta < 0 : delta > 0;
  const neutro = delta === 0;

  return (
    <div
      className={cn('flex items-start gap-3 rounded-xl border p-4', bg.surface, border.subtle, className)}
      {...props}
    >
      {icon && (
        <span className={cn('shrink-0 rounded-lg p-2', bg.accentSoft, text.accent)} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm', text.subtle)}>{label}</p>
        <p className={cn('mt-0.5 text-2xl font-semibold', text.base, tabular && 'tabular-nums')}>
          {value}
        </p>
        {(hint !== undefined || delta !== undefined) && (
          <p className={cn('mt-0.5 flex items-center gap-1.5 text-xs', text.subtle)}>
            {delta !== undefined && (
              <span
                className={cn(
                  'font-medium tabular-nums',
                  neutro ? text.subtle : bueno ? text.success : text.danger,
                )}
              >
                {delta > 0 ? '+' : ''}{delta}%
              </span>
            )}
            {hint}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Kbd ────────────────────────────────────────────────────────────────────

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

/**
 * Tecla o combinación.
 *
 * ```tsx
 * <Kbd>⌘</Kbd> <Kbd>K</Kbd>
 * ```
 */
export const Kbd: FC<KbdProps> = ({ children, className = '', ...props }) => (
  <kbd
    className={cn(
      'inline-flex min-w-[1.5rem] items-center justify-center rounded border px-1.5 py-0.5',
      'font-sans text-xs font-medium shadow-sm',
      bg.surfaceMuted, border.base, text.muted,
      className,
    )}
    {...props}
  >
    {children}
  </kbd>
);
