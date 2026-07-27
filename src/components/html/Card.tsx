import { type FC, type HTMLAttributes, type ReactNode } from 'react';
import { bg, bgHover, border, focusVisibleRing, text } from '../../theme/tokens';
import { motion, withMotionStyle, type AnimatableProps } from '../../theme/motion';

type CardVariant = 'default' | 'outlined' | 'elevated' | 'ghost' | 'custom';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const VARIANT: Record<CardVariant, string> = {
  default:  `${bg.surface} border ${border.subtle} shadow-sm`,
  outlined: `${bg.surface} border ${border.base}`,
  elevated: `${bg.surface} border ${border.subtle} shadow-lg`,
  ghost:    'bg-transparent',
  custom:   '',
};

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, AnimatableProps {
  variant?: CardVariant;
  padding?: CardPadding;
  /** Cabecera. Si es texto se envuelve en un `<h3>`. */
  title?: ReactNode;
  /** Texto secundario bajo el título. */
  description?: ReactNode;
  /** Contenido alineado a la derecha de la cabecera (menús, badges…). */
  action?: ReactNode;
  footer?: ReactNode;
  /** Imagen de cabecera, a sangre. */
  media?: ReactNode;
  /**
   * Marca la tarjeta como pulsable: cursor, resalte al pasar por encima y
   * foco de teclado. Si además pasas `href` se renderiza como enlace.
   */
  interactive?: boolean;
  href?: string;
  /** Ocupa toda la altura disponible. Útil dentro de una rejilla. */
  fullHeight?: boolean;
}

/**
 * Contenedor de contenido con cabecera, cuerpo y pie opcionales.
 *
 * ```tsx
 * <Card title="Ventas" description="Últimos 30 días" action={<Badge>+12 %</Badge>}>
 *   <p>Contenido</p>
 * </Card>
 * ```
 *
 * Para casos con más estructura están `CardHeader`, `CardBody` y `CardFooter`.
 */
export const Card: FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  title,
  description,
  action,
  footer,
  media,
  interactive = false,
  href,
  fullHeight = false,
  animate,
  className = '',
  children,
  style,
  ...props
}) => {
  const clickable = interactive || !!href;

  const classes = [
    'rounded-xl overflow-hidden',
    // Las tarjetas pulsables se levantan un poco: da la pista de que responden
    // sin mover el resto de la rejilla.
    clickable ? `${motion.enter} hover:-translate-y-0.5 hover:shadow-md` : motion.colors,
    VARIANT[variant],
    fullHeight ? 'flex flex-col h-full' : '',
    clickable ? `cursor-pointer ${bgHover.surface} ${focusVisibleRing}` : '',
    className,
  ].filter(Boolean).join(' ');

  const rootStyle = withMotionStyle(animate, style);

  const hasHeader = title !== undefined || description !== undefined || action !== undefined;

  const content = (
    <>
      {media}
      {hasHeader && (
        <CardHeader padding={padding} title={title} description={description} action={action} />
      )}
      {children !== undefined && (
        <div className={[
          PADDING[padding],
          hasHeader ? 'pt-0' : '',
          fullHeight ? 'flex-1' : '',
        ].filter(Boolean).join(' ')}>
          {children}
        </div>
      )}
      {footer !== undefined && <CardFooter padding={padding}>{footer}</CardFooter>}
    </>
  );

  if (href) {
    // Los manejadores tipados para <div> no encajan en <a>; el reparto de props
    // se hace por conversión explícita, no por inferencia.
    const anchorProps = props as unknown as HTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={`block ${classes}`} style={rootStyle} {...anchorProps}>
        {content}
      </a>
    );
  }

  return (
    <div className={classes} style={rootStyle} tabIndex={clickable ? 0 : undefined} {...props}>
      {content}
    </div>
  );
};

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

export interface CardHeaderProps extends Omit<CardSectionProps, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

/** Cabecera de una tarjeta: título, descripción y acción a la derecha. */
export const CardHeader: FC<CardHeaderProps> = ({
  padding = 'md', title, description, action, className = '', children, ...props
}) => (
  <div className={`flex items-start justify-between gap-3 ${PADDING[padding]} ${className}`} {...props}>
    <div className="min-w-0 flex-1">
      {typeof title === 'string' || typeof title === 'number'
        ? <h3 className={`truncate text-base font-semibold ${text.base}`}>{title}</h3>
        : title}
      {description !== undefined && (
        typeof description === 'string' || typeof description === 'number'
          ? <p className={`mt-0.5 text-sm ${text.subtle}`}>{description}</p>
          : description
      )}
      {children}
    </div>
    {action !== undefined && <div className="shrink-0">{action}</div>}
  </div>
);

/** Cuerpo de la tarjeta cuando necesitas controlarlo tú. */
export const CardBody: FC<CardSectionProps> = ({ padding = 'md', className = '', children, ...props }) => (
  <div className={`${PADDING[padding]} ${className}`} {...props}>{children}</div>
);

/** Pie de la tarjeta, con separador y fondo tenue. */
export const CardFooter: FC<CardSectionProps> = ({ padding = 'md', className = '', children, ...props }) => (
  <div
    className={`border-t ${border.subtle} ${bg.surfaceBand} ${PADDING[padding]} ${className}`}
    {...props}
  >
    {children}
  </div>
);
