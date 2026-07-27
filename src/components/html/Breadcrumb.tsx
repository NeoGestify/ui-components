import { Fragment, type FC, type HTMLAttributes, type ReactNode } from 'react';
import { SlashIcon } from '../icons/icons';
import { focusVisibleRing, text, textHover } from '../../theme/tokens';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: BreadcrumbItem[];
  /** Separador propio. Por defecto una barra inclinada. */
  separator?: ReactNode;
  /**
   * A partir de cuántos elementos se colapsa el centro en «…».
   * `0` lo desactiva. Por defecto 4, que es lo que cabe cómodo en móvil.
   */
  maxItems?: number;
  'aria-label'?: string;
}

/**
 * Ruta de navegación. El último elemento es la página actual: se marca con
 * `aria-current` y no es un enlace.
 *
 * ```tsx
 * <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Pedido 42' }]} />
 * ```
 */
export const Breadcrumb: FC<BreadcrumbProps> = ({
  items, separator, maxItems = 4, className = '', 'aria-label': ariaLabel = 'Ruta', ...props
}) => {
  // Se colapsa el centro, no los extremos: el origen y el destino son lo que
  // orienta al usuario.
  const collapsed = maxItems > 0 && items.length > maxItems;
  const shown: Array<BreadcrumbItem | 'ellipsis'> = collapsed
    ? [items[0], 'ellipsis', ...items.slice(items.length - (maxItems - 2))]
    : items;

  const sep = separator ?? <SlashIcon className="h-4 w-4 shrink-0" />;

  return (
    <nav aria-label={ariaLabel} className={className} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {shown.map((item, i) => {
          const isLast = i === shown.length - 1;
          return (
            <Fragment key={i}>
              <li className="inline-flex items-center gap-1.5 min-w-0">
                {item === 'ellipsis' ? (
                  <span className={text.faint} aria-hidden="true">…</span>
                ) : isLast ? (
                  <span aria-current="page" className={`inline-flex items-center gap-1.5 truncate font-medium ${text.base}`}>
                    {item.icon}
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    className={`inline-flex items-center gap-1.5 truncate rounded ${text.subtle} ${textHover.muted} ${focusVisibleRing}`}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={`inline-flex items-center gap-1.5 truncate rounded ${text.subtle} ${textHover.muted} ${focusVisibleRing}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )}
              </li>
              {!isLast && <li aria-hidden="true" className={text.faint}>{sep}</li>}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
