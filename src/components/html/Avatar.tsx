import { useMemo, useState, type FC, type HTMLAttributes, type ReactNode } from 'react';
import { UserIcon } from '../icons/icons';
import { bg, border, text } from '../../theme/tokens';
import { cn } from '../../internal/cn';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarShape = 'circle' | 'square';
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

const SIZE: Record<AvatarSize, string> = {
  xs:   'w-6 h-6 text-[0.625rem]',
  sm:   'w-8 h-8 text-xs',
  md:   'w-10 h-10 text-sm',
  lg:   'w-12 h-12 text-base',
  xl:   'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl',
};

const STATUS_SIZE: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3', xl: 'w-3.5 h-3.5', '2xl': 'w-5 h-5',
};

const STATUS_COLOR: Record<AvatarStatus, string> = {
  online:  bg.success,
  offline: 'bg-[var(--nui-text-faint,oklch(70.7%_.022_261.325))]',
  busy:    bg.danger,
  away:    bg.warning,
};

const STATUS_LABEL: Record<AvatarStatus, string> = {
  online: 'En línea', offline: 'Desconectado', busy: 'Ocupado', away: 'Ausente',
};

/**
 * Colores estables derivados del nombre: la misma persona siempre sale del
 * mismo color, sin guardar nada.
 */
const TINTS = [
  'bg-[color-mix(in_oklab,var(--nui-accent,oklch(51.1%_.262_276.966))_18%,white)] dark:bg-[color-mix(in_oklab,var(--nui-accent-dark,oklch(58.5%_.233_277.117))_30%,black)]',
  'bg-[color-mix(in_oklab,var(--nui-success,oklch(62.7%_.194_149.214))_18%,white)] dark:bg-[color-mix(in_oklab,var(--nui-success-dark,oklch(72.3%_.219_149.579))_30%,black)]',
  'bg-[color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_18%,white)] dark:bg-[color-mix(in_oklab,var(--nui-warning-dark,oklch(79.5%_.184_86.047))_30%,black)]',
  'bg-[color-mix(in_oklab,var(--nui-danger,oklch(57.7%_.245_27.325))_18%,white)] dark:bg-[color-mix(in_oklab,var(--nui-danger-dark,oklch(63.7%_.237_25.331))_30%,black)]',
  'bg-[color-mix(in_oklab,var(--nui-info,oklch(54.6%_.245_262.881))_18%,white)] dark:bg-[color-mix(in_oklab,var(--nui-info-dark,oklch(62.3%_.214_259.815))_30%,black)]',
];

/** Iniciales de un nombre: «Ada Lovelace» → «AL», «Ada» → «AD». */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** URL de la imagen. Si falla al cargar, cae en las iniciales. */
  src?: string;
  /** Nombre de la persona: da el texto alternativo, las iniciales y el color. */
  name?: string;
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Punto de estado en la esquina. */
  status?: AvatarStatus;
  /** Contenido propio (un icono, por ejemplo) en lugar de imagen o iniciales. */
  icon?: ReactNode;
  /** Anillo alrededor, para destacarlo sobre fondos con ruido. */
  ring?: boolean;
}

/**
 * Foto de perfil con degradación en cascada: imagen → iniciales → icono.
 *
 * ```tsx
 * <Avatar name="Ada Lovelace" src="/ada.jpg" status="online" />
 * ```
 */
export const Avatar: FC<AvatarProps> = ({
  src, name, alt, size = 'md', shape = 'circle', status, icon, ring = false,
  className = '', ...props
}) => {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => (name ? initialsOf(name) : ''), [name]);
  const tint = useMemo(() => TINTS[name ? hashOf(name) % TINTS.length : 0], [name]);

  const shapeCls = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  const showImage = src && !failed;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-visible select-none',
        SIZE[size], className,
      )}
      {...props}
    >
      <div className={cn(
        'flex h-full w-full items-center justify-center overflow-hidden font-semibold',
        shapeCls,
        showImage ? '' : (name ? tint : bg.surfaceMuted),
        showImage ? '' : text.muted,
        ring ? `ring-2 ring-offset-2 ring-[color:var(--nui-border,oklch(87.2%_.01_258.338))] dark:ring-[color:var(--nui-border-dark,oklch(44.6%_.03_256.802))] ring-offset-[color:var(--nui-surface,#fff)] dark:ring-offset-[color:var(--nui-surface-dark,oklch(27.8%_.033_256.848))]` : '',
      )}>
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name ?? ''}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : icon ? icon
          : initials ? <span aria-hidden="true">{initials}</span>
            : <UserIcon className={`h-1/2 w-1/2 ${text.faint}`} />}
      </div>

      {/* Nombre accesible cuando solo se ven iniciales o un icono. */}
      {!showImage && name && <span className="sr-only">{name}</span>}

      {status && (
        <span
          title={STATUS_LABEL[status]}
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2',
            'ring-[color:var(--nui-surface,#fff)] dark:ring-[color:var(--nui-surface-dark,oklch(27.8%_.033_256.848))]',
            STATUS_SIZE[size], STATUS_COLOR[status],
          )}
        >
          <span className="sr-only">{STATUS_LABEL[status]}</span>
        </span>
      )}
    </div>
  );
};

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Avatares a mostrar. Se recorta a `max` y el resto se resume en «+N». */
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
}

/**
 * Pila de avatares solapados con contador de excedente.
 *
 * ```tsx
 * <AvatarGroup max={3} avatars={[{ name: 'Ada' }, { name: 'Alan' }, …]} />
 * ```
 */
export const AvatarGroup: FC<AvatarGroupProps> = ({
  avatars, max = 4, size = 'md', shape = 'circle', className = '', ...props
}) => {
  const shown = avatars.slice(0, max);
  const rest = avatars.length - shown.length;
  const shapeCls = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div className={cn('flex items-center', className)} {...props}>
      {shown.map((a, i) => (
        <div key={i} className={i > 0 ? '-ml-2' : ''}>
          <Avatar
            {...a}
            size={size}
            shape={shape}
            className={`ring-2 ring-[color:var(--nui-surface,#fff)] dark:ring-[color:var(--nui-surface-dark,oklch(27.8%_.033_256.848))] ${shapeCls}`}
          />
        </div>
      ))}
      {rest > 0 && (
        <div className={cn(
          '-ml-2 flex items-center justify-center font-semibold',
          SIZE[size], shapeCls, bg.surfaceMuted, text.subtle,
          `border ${border.subtle}`,
          'ring-2 ring-[color:var(--nui-surface,#fff)] dark:ring-[color:var(--nui-surface-dark,oklch(27.8%_.033_256.848))]',
        )}>
          +{rest}
        </div>
      )}
    </div>
  );
};
