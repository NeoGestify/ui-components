import { type CSSProperties, type FC, type HTMLAttributes } from 'react';
import { bg } from '../../theme/tokens';

type SkeletonVariant = 'text' | 'circle' | 'rect' | 'rounded';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  /** Número de líneas en `variant="text"`. La última sale más corta. */
  lines?: number;
  /** Desactiva el pulso (además, se respeta `prefers-reduced-motion`). */
  animated?: boolean;
}

const SHAPE: Record<SkeletonVariant, string> = {
  text: 'rounded',
  circle: 'rounded-full',
  rect: 'rounded-none',
  rounded: 'rounded-lg',
};

const size = (v?: number | string) => (typeof v === 'number' ? `${v}px` : v);

/**
 * Marcador de posición mientras carga el contenido real.
 *
 * ```tsx
 * <Skeleton variant="circle" width={40} height={40} />
 * <Skeleton variant="text" lines={3} />
 * ```
 *
 * Se marca `aria-hidden`: el estado de carga hay que anunciarlo en el
 * contenedor con `aria-busy`, no repetirlo en cada bloque gris.
 */
export const Skeleton: FC<SkeletonProps> = ({
  variant = 'text', width, height, lines = 1, animated = true,
  className = '', style, ...props
}) => {
  const base = [
    bg.surfaceMuted,
    SHAPE[variant],
    animated ? 'motion-safe:animate-pulse' : '',
  ].filter(Boolean).join(' ');

  const dims: CSSProperties = {
    width: size(width),
    height: size(height) ?? (variant === 'text' ? undefined : size(width)),
    ...style,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true" {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${base} h-3.5`}
            style={{ width: i === lines - 1 ? '65%' : (size(width) ?? '100%') }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${base} ${variant === 'text' ? 'h-3.5' : ''} ${className}`}
      style={dims}
      aria-hidden="true"
      {...props}
    />
  );
};

export interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  lines?: number;
}

/** Atajo para varios renglones de texto. */
export const SkeletonText: FC<SkeletonTextProps> = ({ lines = 3, ...props }) => (
  <Skeleton variant="text" lines={lines} {...props} />
);
