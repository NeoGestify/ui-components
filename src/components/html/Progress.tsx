import { type CSSProperties, type FC, type HTMLAttributes, type ReactNode } from 'react';
import { bg, text } from '../../theme/tokens';
import { motion, withMotionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';

type ProgressVariant = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'over';
type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE: Record<ProgressSize, string> = {
  xs: 'h-1', sm: 'h-1.5', md: 'h-2.5', lg: 'h-4',
};

const FILL: Record<ProgressVariant, string> = {
  accent: bg.accent, success: bg.success, warning: bg.warning,
  danger: bg.danger, info: bg.info, over: bg.over,
};

/**
 * La raya de una marca.
 *
 * Tiene que verse sobre el relleno Y sobre la pista vacía, que son dos colores
 * distintos: 2 px de tinta con un halo de 2 px del color de la superficie. Sin
 * el halo la raya se pierde contra el relleno, que en la mayoría de variantes
 * es igual de oscuro que el texto.
 */
const MARK_LINE =
  'pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 ' +
  'bg-[color:var(--nui-text,oklch(21%_.034_264.665))] dark:bg-[color:var(--nui-text-dark,#fff)] ' +
  'outline-2 outline-[color:var(--nui-surface,#fff)] dark:outline-[color:var(--nui-surface-dark,oklch(27.8%_.033_256.848))]';

/** Una referencia fija sobre la barra: un mínimo, un objetivo, el máximo. */
export interface ProgressMark {
  /** En las mismas unidades que `value`. Fuera de `[0, max]` no se dibuja:
   *  una marca más allá del tope significa que quien llama debe subir `max`. */
  value: number;
  /** Debajo de la marca. Sin ella, la marca es solo la raya. */
  label?: ReactNode;
  /** Lo que lee el lector de pantalla cuando la marca no lleva etiqueta. */
  description?: string;
  /**
   * Con qué color llega el relleno a esta marca. Tiñe el tramo que TERMINA aquí
   * y que empieza en la marca anterior, o en 0 si es la primera.
   *
   * - **Un color**: el color al que llega el tramo. Si la marca anterior dejó
   *   un color, el tramo va del de ella a este, y la transición sale sola: una
   *   escala se escribe con un color por banderín. Si no hay marca anterior, o
   *   la anterior no pedía color, el tramo se pinta entero de este.
   * - **`[desde, hasta]`**: el tramo arranca en `desde` pase lo que pase. Es la
   *   forma de cortar con el color anterior, o de pintar un tramo de un color
   *   plano poniendo el mismo dos veces.
   * - **Sin `fill`**: el tramo se queda con el color de la variante.
   *
   * Es color CSS en crudo, así que también vale un token:
   * `fill: 'var(--nui-warning, oklch(68.1% .162 75.834))'`.
   *
   * Del último banderín al tope no hay tramo: ahí manda siempre la variante.
   */
  fill?: string | [from: string, to: string];
}

/** Una marca con su sitio ya calculado sobre la pista. */
export interface PlacedMark {
  mark: ProgressMark;
  /** Posición sobre la pista, de 0 a 100. */
  pct: number;
}

/**
 * Marcas que se pueden dibujar, ya pasadas a porcentaje.
 *
 * Descarta las que caen fuera de `[0, max]`. Recortarlas al borde sería peor
 * que no dibujarlas: una marca del máximo de inventario pegada al 100 % diría
 * que el tope es ella, justo cuando el stock ya lo ha pasado. Subir `max` es de
 * quien llama.
 *
 * `max <= 0` no define ninguna escala, así que no hay dónde poner nada. El
 * componente nunca llega aquí con ese valor —normaliza antes, igual que para el
 * relleno—; es defensa para quien use la función por su cuenta.
 */
export function visibleMarks(marks: ProgressMark[] | undefined, max: number): PlacedMark[] {
  if (!marks || !(max > 0)) return [];
  return marks
    .filter((m) => Number.isFinite(m.value) && m.value >= 0 && m.value <= max)
    .map((m) => ({ mark: m, pct: (m.value / max) * 100 }));
}

/** Un porcentaje para CSS sin los decimales de una división: 33.333 %, no 33.33333333333333 %. */
const asPercent = (pct: number) => `${+pct.toFixed(3)}%`;

/** El color con el que se queda una marca, o nada si no pide ninguno. */
function endColorOf(fill: ProgressMark['fill']): string | undefined {
  if (fill === undefined) return undefined;
  return typeof fill === 'string' ? fill : fill[1];
}

/**
 * Los colores del tramo que termina en `fill`, viniendo de `previous`.
 *
 * Un solo color dice de qué color se queda LA MARCA, no de qué color es todo el
 * tramo: si la anterior dejó un color, el tramo va de ese a este. Así una
 * escala se escribe con un color por banderín y las transiciones salen solas.
 *
 * Sin marca anterior —o con una que no pedía color— no hay de dónde venir, y el
 * tramo se pinta entero del color pedido. Venir de `transparent` desteñiría el
 * color de la variante, que es justo lo que un tramo sin `fill` quiere dejar
 * quieto.
 */
function segmentColors(fill: ProgressMark['fill'], previous: string | undefined): [string, string] {
  if (fill === undefined) return ['transparent', 'transparent'];
  if (typeof fill !== 'string') return fill;
  return [previous ?? fill, fill];
}

/**
 * Degradado de los tramos, en la escala de la pista (0 a 100).
 *
 * Un tramo sin `fill` sale `transparent` y no se queda en blanco: el color de
 * la variante va debajo, como `background-color`, y se ve por el hueco. Es lo
 * que permite pintar solo un tramo y dejar los demás como estaban.
 *
 * El corte es duro solo si se pide: un `[desde, hasta]` fija su propio arranque
 * y corta con el tramo anterior en la marca que los separa. Un color a solas se
 * engancha al color de la marca anterior, así que no hay corte que ver.
 *
 * `undefined` si ningún tramo pide color: entonces el relleno es el de siempre
 * y no hay por qué darle un fondo que calcular.
 */
export function segmentGradient(placed: PlacedMark[]): string | undefined {
  if (!placed.some((m) => m.mark.fill !== undefined)) return undefined;

  const stops: string[] = [];
  const addStop = (color: string, at: number) => {
    const stop = `${color} ${asPercent(at)}`;
    // Un arranque que repite el cierre del tramo anterior no pinta nada: el
    // degradado ya venía de ese color y en ese sitio. Lo que sí queda es el
    // corte de verdad, el del par, porque ahí los dos colores no coinciden.
    if (stops[stops.length - 1] !== stop) stops.push(stop);
  };

  let from = 0;
  /** El color con el que se quedó la marca anterior; de ahí arranca la siguiente. */
  let previous: string | undefined;
  for (const { mark, pct } of [...placed].sort((a, b) => a.pct - b.pct)) {
    const [start, end] = segmentColors(mark.fill, previous);
    addStop(start, from);
    addStop(end, pct);
    from = pct;
    previous = endColorOf(mark.fill);
  }
  // Del último banderín al tope no hay tramo: ahí manda la variante.
  addStop('transparent', from);
  addStop('transparent', 100);

  return `linear-gradient(to right, ${stops.join(', ')})`;
}

/**
 * Estilos del relleno: el ancho y, si algún tramo tiene color, el degradado.
 *
 * El detalle que hay que acertar es la escala. Los cortes se calculan sobre la
 * PISTA, pero el fondo lo pinta el relleno, que solo mide `pct`: dibujado sin
 * más, un corte del 50 % caería a la mitad del relleno y se movería con él.
 * Estirar el fondo hasta el ancho de la pista (`100 / pct`) deja cada tramo
 * clavado en su sitio mientras el valor crece.
 */
export function fillStyle(placed: PlacedMark[], pct: number): CSSProperties {
  const width = asPercent(pct);
  const gradient = segmentGradient(placed);
  if (gradient === undefined || pct <= 0) return { width };
  return {
    width,
    backgroundImage: gradient,
    backgroundSize: `${asPercent((100 / pct) * 100)} 100%`,
    backgroundRepeat: 'no-repeat',
  };
}

/**
 * Dónde va la etiqueta de una marca que cae en `pct`.
 *
 * Centrada bajo su raya con `translateX(-50%)`, salvo en los extremos: en el
 * 2 % la mitad izquierda del texto se saldría del componente, así que ahí la
 * etiqueta se ancla al borde y renuncia a estar centrada.
 */
export function markLabelPosition(pct: number): CSSProperties {
  if (pct < 6) return { left: 0 };
  if (pct > 94) return { right: 0 };
  return { left: asPercent(pct), transform: 'translateX(-50%)' };
}

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
  /**
   * Referencias fijas sobre la barra, en las unidades de `value`. La barra deja
   * de ser «cuánto llevo» y pasa a ser una escala: el mínimo de stock dentro,
   * el máximo como tope. Las etiquetas reservan una línea debajo.
   *
   * Cada marca puede además decir con `fill` con qué color llega el relleno
   * hasta ella, y los tramos se encadenan de una a la siguiente: la barra puede
   * cambiar de color al cruzar el mínimo sin que quien llama tenga que cambiar
   * de `variant`. En `indeterminate` no se pintan: ahí no hay escala que
   * repartir.
   */
  marks?: ProgressMark[];
}

/**
 * Barra de progreso.
 *
 * ```tsx
 * <Progress value={72} label="Subiendo" showValue />
 * <Progress indeterminate label="Procesando…" />
 * ```
 *
 * Como escala, con el tope calculado por quien llama: mientras el stock quepa,
 * el tope es el máximo y su marca cae en el 100 %; cuando lo pasa, el tope es
 * el propio stock y el máximo se convierte en una marca interior.
 *
 * ```tsx
 * <Progress
 *   value={stock}
 *   max={Math.max(maximo, stock)}
 *   variant={stock > maximo ? 'over' : 'accent'}
 *   marks={[
 *     { value: minimo, label: `Mín. ${minimo}` },
 *     { value: maximo, label: `Máx. ${maximo}` },
 *   ]}
 * />
 * ```
 *
 * Y tiñendo los tramos: rojo hasta el mínimo y de ahí un degradado hasta el
 * verde del máximo, con un color por banderín. Del máximo al tope no hay
 * banderín que mande, así que ese trozo se queda con el color de la variante.
 *
 * ```tsx
 * marks={[
 *   { value: 20, label: 'Mín.', fill: 'var(--nui-danger)' },
 *   { value: 80, label: 'Máx.', fill: 'var(--nui-success)' },
 * ]}
 * ```
 */
export const Progress: FC<ProgressProps> = ({
  value = 0, max = 100, variant = 'accent', size = 'md',
  label, showValue = false, indeterminate = false, valueText, marks,
  animate, className = '', style, ...props
}) => {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(safeMax, Math.max(0, value));
  const pct = Math.round((clamped / safeMax) * 100);

  const placed = visibleMarks(marks, safeMax);
  // `description` solo habla cuando no hay etiqueta visible: con las dos, el
  // lector de pantalla leería la misma marca dos veces.
  const labelled = placed.filter((m) => m.mark.label !== undefined);
  const described = placed.filter((m) => m.mark.label === undefined && m.mark.description);

  const track = (
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
          style={fillStyle(placed, pct)}
        />
      )}
    </div>
  );

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

      {placed.length === 0 ? track : (
        // La pista lleva `overflow-hidden`, así que una raya metida DENTRO se
        // recorta: a la mitad justo en el 100 % —donde cae el máximo mientras
        // no se supere— y del todo en los extremos redondeados. Las marcas van
        // hermanas de la pista, dentro de este envoltorio, que no recorta.
        <div className="relative">
          {track}
          {placed.map(({ mark, pct: at }, i) => (
            <span
              key={`${mark.value}-${i}`}
              aria-hidden="true"
              className={MARK_LINE}
              style={{ left: asPercent(at) }}
            />
          ))}
        </div>
      )}

      {(labelled.length > 0 || described.length > 0) && (
        // Las rayas son `aria-hidden`: quien habla es esta fila. Solo reserva
        // alto si hay algo visible que enseñar.
        <div className={cn('relative text-xs', text.subtle, labelled.length > 0 && 'mt-1 h-4')}>
          {labelled.map(({ mark, pct: at }, i) => (
            <span
              key={`${mark.value}-${i}`}
              className="absolute whitespace-nowrap tabular-nums"
              style={markLabelPosition(at)}
            >
              {mark.label}
            </span>
          ))}
          {described.map(({ mark }, i) => (
            <span key={`d-${mark.value}-${i}`} className="sr-only">{mark.description}</span>
          ))}
        </div>
      )}

      {indeterminate && (
        <style>{'@keyframes nuiProgressSlide{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}'}</style>
      )}
    </div>
  );
};
