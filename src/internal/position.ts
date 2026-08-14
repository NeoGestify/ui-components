/**
 * Colocación de elementos flotantes (tooltips, menús, popovers, listas de
 * autocompletado) con **volteo y desplazamiento**.
 *
 * Lo que había antes en `Tooltip` calculaba la posición y ya: un tooltip
 * `placement="top"` en la primera fila de la página se salía por arriba, y uno
 * ancho cerca del borde derecho se cortaba. Aquí se mira si cabe y, si no:
 *
 * 1. **Voltea** (`flip`) al lado contrario, si allí hay sitio.
 * 2. **Desplaza** (`shift`) a lo largo del eje transversal para meterlo en
 *    pantalla sin despegarlo del elemento al que apunta.
 *
 * Todo en coordenadas de ventana, para usarse con `position: fixed` dentro de un
 * portal — así ningún `overflow: hidden` de un contenedor lo recorta.
 */

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';
export type Placement = Side | `${Side}-${Exclude<Align, 'center'>}`;

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PositionOptions {
  /** Lado preferido. Si no cabe, se voltea. */
  placement?: Placement;
  /** Separación entre el elemento y su anclaje, en píxeles. */
  gap?: number;
  /** Margen mínimo con el borde de la ventana. */
  padding?: number;
  /** Desactiva el volteo cuando el lado importa más que la visibilidad. */
  flip?: boolean;
  /** Desactiva el desplazamiento transversal. */
  shift?: boolean;
}

export interface PositionResult {
  top: number;
  left: number;
  /** Lado en el que ha acabado, que puede no ser el pedido si hubo volteo. */
  side: Side;
  align: Align;
}

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function parse(placement: Placement): { side: Side; align: Align } {
  const [side, align] = placement.split('-') as [Side, Align | undefined];
  return { side, align: align ?? 'center' };
}

/** Coordenada en el eje principal (el que separa del anclaje). */
function mainAxis(side: Side, anchor: Rect, w: number, h: number, gap: number): number {
  switch (side) {
    case 'top':    return anchor.top - h - gap;
    case 'bottom': return anchor.top + anchor.height + gap;
    case 'left':   return anchor.left - w - gap;
    case 'right':  return anchor.left + anchor.width + gap;
  }
}

/** Coordenada en el eje transversal (el que alinea con el anclaje). */
function crossAxis(side: Side, align: Align, anchor: Rect, w: number, h: number): number {
  const vertical = side === 'top' || side === 'bottom';
  const start = vertical ? anchor.left : anchor.top;
  const size = vertical ? anchor.width : anchor.height;
  const own = vertical ? w : h;

  if (align === 'start') return start;
  if (align === 'end') return start + size - own;
  return start + (size - own) / 2;
}

export function computePosition(
  anchor: Rect,
  floating: { width: number; height: number },
  options: PositionOptions = {},
): PositionResult {
  const {
    placement = 'top',
    gap = 8,
    padding = 8,
    flip = true,
    shift = true,
  } = options;

  const { width: w, height: h } = floating;
  const viewW = typeof window === 'undefined' ? 0 : window.innerWidth;
  const viewH = typeof window === 'undefined' ? 0 : window.innerHeight;

  const { align } = parse(placement);
  let { side } = parse(placement);

  // ── Volteo ────────────────────────────────────────────────────────────────
  if (flip) {
    const fits = (s: Side) => {
      const v = mainAxis(s, anchor, w, h, gap);
      return s === 'top' || s === 'bottom'
        ? v >= padding && v + h <= viewH - padding
        : v >= padding && v + w <= viewW - padding;
    };
    // Solo se voltea si el lado contrario está mejor: si no cabe en ninguno,
    // más vale quedarse donde el consumidor pidió y dejar que `shift` apañe.
    if (!fits(side) && fits(OPPOSITE[side])) side = OPPOSITE[side];
  }

  let main = mainAxis(side, anchor, w, h, gap);
  let cross = crossAxis(side, align, anchor, w, h);

  // ── Desplazamiento transversal ────────────────────────────────────────────
  if (shift) {
    const vertical = side === 'top' || side === 'bottom';
    const limit = vertical ? viewW : viewH;
    const own = vertical ? w : h;
    const max = limit - own - padding;
    // `Math.max(padding, …)` va después del `Math.min` a propósito: si el
    // elemento es más ancho que la ventana, `max` queda por debajo de `padding`
    // y sin este orden acabaría pegado al borde derecho en vez de al izquierdo.
    cross = Math.max(padding, Math.min(cross, max));
  }

  // El eje principal también se acota, por si no cabía en ninguno de los dos
  // lados y el volteo se quedó donde estaba.
  const vertical = side === 'top' || side === 'bottom';
  const mainLimit = vertical ? viewH : viewW;
  const mainOwn = vertical ? h : w;
  main = Math.max(padding, Math.min(main, mainLimit - mainOwn - padding));

  return vertical
    ? { top: main, left: cross, side, align }
    : { top: cross, left: main, side, align };
}
