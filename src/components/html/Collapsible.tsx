import { useEffect, useId, useRef, type FC, type ReactNode } from 'react';
import { ChevronDownIcon } from '../icons/icons';
import { bg, bgHover, border, focusVisibleRing, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';

export interface CollapsibleRegionProps {
  id: string;
  /** `id` de la cabecera que lo describe. */
  labelledBy?: string;
  open: boolean;
  /** `region` etiqueta la zona para un lector de pantalla; `group` no. */
  role?: 'region' | 'group';
  className?: string;
  children: ReactNode;
}

/**
 * La parte que se pliega, sin cabecera.
 *
 * Dos cosas que parecen detalles y no lo son:
 *
 * - El despliegue va con `grid-template-rows: 0fr → 1fr`. Es la única forma de
 *   animar hasta la altura **real** del contenido sin medirla en JavaScript ni
 *   inventarse un `max-height` que se queda corto o deja un salto al final.
 * - El contenido no se desmonta al cerrar, para conservar su estado y poder
 *   animarlo; entonces hay que sacarlo del alcance del teclado y de los
 *   lectores de pantalla, que es justo lo que hace `inert`. React 18 no tiene
 *   forma declarativa de ponerlo, de ahí el efecto.
 *
 * Se exporta para montar plegables que no encajan en `Collapsible`: la fila de
 * detalle de una tabla, un panel lateral, el cuerpo de una tarjeta.
 */
export const CollapsibleRegion: FC<CollapsibleRegionProps> = ({
  id, labelledBy, open, role = 'region', className = '', children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.toggleAttribute('inert', !open);
  }, [open]);

  return (
    <div className={cn('grid', motion.collapse, open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
      <div className="overflow-hidden">
        <div
          ref={ref}
          id={id}
          role={role}
          aria-labelledby={labelledBy}
          className={className}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export interface CollapsibleProps extends AnimatableProps {
  /** Cabecera pulsable. */
  title: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Icono a la izquierda del título. */
  icon?: ReactNode;
  /** Texto pequeño a la derecha del título: contador, estado… */
  meta?: ReactNode;
  disabled?: boolean;
  /** `bordered` lo mete en una tarjeta; `plain` solo pliega. */
  variant?: 'plain' | 'bordered';
  /** Oculta la flecha, para cabeceras que ya indican el estado por su cuenta. */
  hideChevron?: boolean;
  className?: string;
  /** Clases del contenido desplegado. */
  contentClassName?: string;
  id?: string;
}

/**
 * Una sección que se pliega. El `Accordion` de uno solo, sin la lista.
 *
 * ```tsx
 * <Collapsible title="Opciones avanzadas">
 *   <TextArea label="Notas" />
 * </Collapsible>
 * ```
 */
export const Collapsible: FC<CollapsibleProps> = ({
  title,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  icon,
  meta,
  disabled = false,
  variant = 'plain',
  hideChevron = false,
  animate,
  className = '',
  contentClassName = '',
  id,
}) => {
  const autoId = useId();
  const baseId = id || `collapsible-${autoId}`;
  const panelId = `${baseId}-panel`;
  const headerId = `${baseId}-header`;

  const [abierto, setAbierto] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <div
      style={motionStyle(animate)}
      className={cn(
        variant === 'bordered' ? `rounded-xl border ${border.subtle} ${bg.surface} overflow-hidden` : '',
        className,
      )}
    >
      <button
        type="button"
        id={headerId}
        disabled={disabled}
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto(prev => !prev)}
        className={cn(
          'flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium',
          motion.colors, text.base, bgHover.surface, focusVisibleRing,
          'disabled:pointer-events-none disabled:opacity-50 touch-manipulation cursor-pointer',
        )}
      >
        {icon && <span className={cn('shrink-0', text.subtle)} aria-hidden="true">{icon}</span>}
        <span className="min-w-0 flex-1">{title}</span>
        {meta !== undefined && (
          <span className={cn('max-w-[40%] shrink-0 truncate text-xs font-normal', text.subtle)}>{meta}</span>
        )}
        {!hideChevron && (
          <span className={text.subtle} aria-hidden="true">
            <ChevronDownIcon className={cn('h-4 w-4 shrink-0', motion.transform, abierto ? 'rotate-180' : '')} />
          </span>
        )}
      </button>

      <CollapsibleRegion
        id={panelId}
        labelledBy={headerId}
        open={abierto}
        className={cn('px-4 pb-4 pt-0 text-sm', text.muted, contentClassName)}
      >
        {children}
      </CollapsibleRegion>
    </div>
  );
};
