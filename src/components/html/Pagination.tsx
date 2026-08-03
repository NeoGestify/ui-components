import { useMemo, type FC, type HTMLAttributes } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/icons';
import { bg, bgHover, border, focusVisibleRing, text } from '../../theme/tokens';
import { motion } from '../../theme/motion';

/**
 * Páginas visibles alrededor de la actual, con «…» donde se recorta.
 * Devuelve números de página y huecos (`null`).
 */
export function pageRange(page: number, total: number, siblings = 1, boundaries = 1): Array<number | null> {
  const totalNumbers = siblings * 2 + boundaries * 2 + 3;
  if (total <= totalNumbers) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(page - siblings, boundaries + 2);
  const right = Math.min(page + siblings, total - boundaries - 1);

  const out: Array<number | null> = [];
  for (let i = 1; i <= boundaries; i++) out.push(i);
  if (left > boundaries + 1) out.push(null);
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - boundaries) out.push(null);
  for (let i = total - boundaries + 1; i <= total; i++) out.push(i);
  return out;
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Página actual, empezando en 1. */
  page: number;
  /** Número total de páginas. Si es 0 o 1 no se pinta nada. */
  totalPages: number;
  onChange: (page: number) => void;
  /** Páginas a cada lado de la actual. */
  siblings?: number;
  /** Páginas fijas en cada extremo. */
  boundaries?: number;
  /**
   * Solo «Anterior / Siguiente» con «Página X de Y» en medio. Ocupa poco:
   * es lo razonable en móvil.
   */
  compact?: boolean;
  size?: 'sm' | 'md';
  labels?: { previous?: string; next?: string; page?: string; of?: string };
  'aria-label'?: string;
}

/**
 * Paginación numérica accesible.
 *
 * ```tsx
 * <Pagination page={p} totalPages={12} onChange={setP} />
 * ```
 */
export const Pagination: FC<PaginationProps> = ({
  page, totalPages, onChange, siblings = 1, boundaries = 1,
  compact = false, size = 'md', labels, className = '',
  'aria-label': ariaLabel = 'Paginación', ...props
}) => {
  const l = {
    previous: 'Anterior', next: 'Siguiente', page: 'Página', of: 'de', ...labels,
  };
  const pages = useMemo(
    () => (compact ? [] : pageRange(page, totalPages, siblings, boundaries)),
    [compact, page, totalPages, siblings, boundaries],
  );

  if (totalPages <= 1) return null;

  const btn = size === 'sm' ? 'h-8 min-w-8 px-2 text-xs' : 'h-9 min-w-9 px-3 text-sm';
  const baseBtn = [
    `inline-flex items-center justify-center gap-1 rounded-md font-medium ${motion.colors}`,
    'disabled:opacity-40 disabled:pointer-events-none touch-manipulation',
    btn, focusVisibleRing,
  ].join(' ');

  const go = (p: number) => () => onChange(Math.min(totalPages, Math.max(1, p)));

  return (
    <nav
      aria-label={ariaLabel}
      // Envuelve en vez de desbordar: con muchas páginas no cabe de una línea
      // en un móvil. `compact` sigue siendo la opción recomendada ahí.
      className={`flex flex-wrap items-center gap-1 ${className}`}
      {...props}
    >
      <button
        type="button"
        onClick={go(page - 1)}
        disabled={page <= 1}
        aria-label={l.previous}
        className={`${baseBtn} border ${border.base} ${text.muted} ${bgHover.surface}`}
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span className={compact ? '' : 'sr-only sm:not-sr-only'}>{l.previous}</span>
      </button>

      {compact ? (
        <span className={`px-3 text-sm tabular-nums ${text.subtle}`} aria-live="polite">
          {l.page} {page} {l.of} {totalPages}
        </span>
      ) : (
        <ol className="flex flex-wrap items-center gap-1">
          {pages.map((p, i) => (
            <li key={p === null ? `gap-${i}` : p}>
              {p === null ? (
                <span className={`px-1 ${text.faint}`} aria-hidden="true">…</span>
              ) : (
                <button
                  type="button"
                  onClick={go(p)}
                  aria-current={p === page ? 'page' : undefined}
                  aria-label={`${l.page} ${p}`}
                  className={[
                    baseBtn, 'tabular-nums',
                    p === page
                      ? `${bg.accent} ${text.onAccent}`
                      : `border ${border.base} ${text.muted} ${bgHover.surface}`,
                  ].join(' ')}
                >
                  {p}
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={go(page + 1)}
        disabled={page >= totalPages}
        aria-label={l.next}
        className={`${baseBtn} border ${border.base} ${text.muted} ${bgHover.surface}`}
      >
        <span className={compact ? '' : 'sr-only sm:not-sr-only'}>{l.next}</span>
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
};
