import type { CSSProperties } from 'react';

/**
 * Animaciones de la librería.
 *
 * Todo lo que se mueve lee tres variables CSS, así que se configuran igual que
 * los colores: declarándolas, sin tocar `tailwind.config` ni importar nada.
 *
 * | Variable              | Por defecto | Qué controla                          |
 * | --------------------- | ----------- | ------------------------------------- |
 * | `--nui-duration`      | `200ms`     | Transiciones normales                 |
 * | `--nui-duration-fast` | `120ms`     | Gestos cortos (tooltip, menú)         |
 * | `--nui-blur`          | `8px`       | Desenfoque del velo de modales/cajones |
 *
 * Tres formas de tocarlas, de más amplia a más concreta:
 *
 * - **En tu CSS**: `:root { --nui-duration: 320ms; --nui-blur: 0px }`
 * - **Desde JavaScript**: `applyMotion({ duration: 320, blur: 0 })`, o
 *   `<ThemeProvider motion={{ duration: 320, blur: 0 }}>`
 * - **En un componente**: la prop `animate`, que escribe las mismas variables
 *   en línea. Como son variables CSS, cascadean: ponerlas en un contenedor
 *   afecta también a lo que haya dentro.
 *
 * ```tsx
 * <Modal animate={false} />    // instantáneo
 * <Modal animate={400} />      // 400 ms solo para este
 * <Drawer blur={false} />      // sin desenfoque de fondo
 * <Drawer blur={20} />         // más desenfoque
 * ```
 *
 * Poner la duración a `0ms` no desactiva la transición, la hace instantánea:
 * el estado final es idéntico, así que nada depende de que la animación corra.
 *
 * Aparte de esto, todas las clases llevan `motion-reduce:transition-none`, que
 * respeta `prefers-reduced-motion` del sistema sin que nadie configure nada.
 */

/** Duración por defecto de las transiciones. */
export const NUI_DURATION = '200ms';
/** Duración de los gestos cortos (aparecer un tooltip, un menú). */
export const NUI_DURATION_FAST = '120ms';
/** Desenfoque por defecto del velo de modales y cajones. */
export const NUI_BLUR = '8px';

/** Nombres de las variables CSS que gobiernan el movimiento. */
export const MOTION_VARS = {
  duration: '--nui-duration',
  durationFast: '--nui-duration-fast',
  blur: '--nui-blur',
} as const;

/** Un número se interpreta como píxeles o milisegundos; una cadena, tal cual. */
function conUnidad(valor: number | string, unidad: 'ms' | 'px'): string {
  return typeof valor === 'number' ? `${valor}${unidad}` : valor;
}

/** Ajustes de movimiento. Cualquiera puede omitirse. */
export interface MotionOptions {
  /** Duración de las transiciones normales. Número = milisegundos. */
  duration?: number | string;
  /** Duración de los gestos cortos. Número = milisegundos. */
  durationFast?: number | string;
  /**
   * Desenfoque del velo. Número = píxeles, `false` = sin desenfoque.
   *
   * Se pone a `0px` y no a `none` a propósito: `none` no es interpolable y el
   * velo dejaría de poder animarse en vez de animarse hacia nada.
   */
  blur?: number | string | false;
}

/** Convierte unos ajustes en pares `[variable, valor]`. */
export function motionToVars(options: MotionOptions): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  if (options.duration !== undefined) out.push([MOTION_VARS.duration, conUnidad(options.duration, 'ms')]);
  if (options.durationFast !== undefined) out.push([MOTION_VARS.durationFast, conUnidad(options.durationFast, 'ms')]);
  if (options.blur !== undefined) {
    out.push([MOTION_VARS.blur, options.blur === false ? '0px' : conUnidad(options.blur, 'px')]);
  }
  return out;
}


/**
 * Fragmentos de clase por tipo de transición. Se escriben literales para que
 * Tailwind los encuentre al escanear el código fuente.
 */
export const motion = {
  /**
   * Opacidad y transformación a la vez: aparecer, escalar, deslizar.
   *
   * La lista incluye `translate`, `scale` y `rotate` aparte de `transform`
   * porque Tailwind 4 dejó de meterlo todo en `transform`: `scale-95` escribe
   * la propiedad `scale` y `translate-x-full` la propiedad `translate`. Con
   * `transition-[opacity,transform]` a secas, el `Modal` se desvanecía pero su
   * escala saltaba de golpe — la transición no cubría la propiedad que de
   * verdad estaba cambiando.
   */
  enter: 'transition-[opacity,transform,translate,scale,rotate] duration-[var(--nui-duration,200ms)] ease-out motion-reduce:transition-none',
  /** Igual pero rápido, para elementos pequeños. */
  enterFast: 'transition-[opacity,transform,translate,scale,rotate] duration-[var(--nui-duration-fast,120ms)] ease-out motion-reduce:transition-none',
  /**
   * Velos de modales y cajones: opacidad **y** desenfoque.
   *
   * El desenfoque hay que animarlo aparte porque Chrome aplica
   * `backdrop-filter` a plena potencia aunque el elemento esté a `opacity: 0`
   * — el filtro se resuelve sobre el fondo antes de componer la opacidad. Con
   * solo `transition-opacity`, el fondo aparecía desenfocado de golpe en el
   * primer frame mientras el tinte entraba fundiéndose.
   *
   * Se interpola de `blur(0px)` a `blur(8px)`, no desde `none`: `none` no es un
   * valor interpolable y la transición no arrancaría.
   */
  scrim: 'transition-[opacity,backdrop-filter] duration-[var(--nui-duration,200ms)] ease-out motion-reduce:transition-none',
  /** Solo opacidad. */
  fade: 'transition-opacity duration-[var(--nui-duration,200ms)] ease-out motion-reduce:transition-none',
  /** Solo transformación: deslizar el pulgar de un switch, subir una tarjeta. */
  transform: 'transition-transform duration-[var(--nui-duration,200ms)] ease-out motion-reduce:transition-none',
  /** Despliegue en alto (acordeones) mediante `grid-template-rows`. */
  collapse: 'transition-[grid-template-rows] duration-[var(--nui-duration,200ms)] ease-out motion-reduce:transition-none',
  /** Barras de progreso y indicadores que se desplazan. */
  size: 'transition-[width,left,transform] duration-[var(--nui-duration,200ms)] ease-out motion-reduce:transition-none',
  /** Cambios de color: no es transformación de espacio, pero comparte el mando. */
  colors: 'transition-colors duration-[var(--nui-duration-fast,120ms)] motion-reduce:transition-none',
  /**
   * Controles que al pasar por encima cambian color, sombra y escala a la vez
   * (los botones). Va en un solo fragmento porque dos clases `transition-*`
   * compiten por la misma propiedad CSS y solo se aplicaría una.
   */
  control: 'transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--nui-duration,200ms)] ease-out motion-reduce:transition-none',
} as const;

/** Variables que dejan las animaciones en instantáneas. */
export const NO_MOTION_STYLE = {
  '--nui-duration': '0ms',
  '--nui-duration-fast': '0ms',
} as CSSProperties;

/**
 * Valor de la prop `animate`.
 *
 * - `false` — instantáneo.
 * - un número — milisegundos solo para ese componente.
 * - un objeto — control fino (`{ duration, durationFast, blur }`).
 * - `true` o nada — lo que diga la configuración global.
 */
export type AnimateProp = boolean | number | MotionOptions;

/**
 * Estilo en línea para la prop `animate` de un componente.
 *
 * Devuelve `undefined` cuando no hay nada que forzar, para no crear objetos
 * nuevos en cada render.
 *
 * ```tsx
 * <div style={motionStyle(animate)} />
 * ```
 */
export function motionStyle(animate?: AnimateProp): CSSProperties | undefined {
  if (animate === undefined || animate === true) return undefined;
  if (animate === false) return NO_MOTION_STYLE;

  const options: MotionOptions = typeof animate === 'number'
    // Un número suelto ajusta las dos duraciones, manteniendo entre ellas la
    // misma proporción que traen por defecto (120/200): si no, un valor alto
    // dejaría los tooltips tan lentos como un modal.
    ? { duration: animate, durationFast: Math.round(animate * 0.6) }
    : animate;

  const vars = motionToVars(options);
  if (!vars.length) return undefined;
  return Object.fromEntries(vars) as CSSProperties;
}

/** Une `motionStyle` con el `style` que llegue por props. */
export function withMotionStyle(animate: AnimateProp | undefined, style?: CSSProperties): CSSProperties | undefined {
  const propio = motionStyle(animate);
  if (!propio) return style;
  return style ? { ...style, ...propio } : propio;
}

/**
 * Configura el movimiento en toda la página. Devuelve una función que deshace
 * el cambio.
 *
 * ```ts
 * const deshacer = applyMotion(false);                    // todo instantáneo
 * const deshacer = applyMotion({ duration: 320 });        // más pausado
 * const deshacer = applyMotion({ blur: false });          // sin desenfoque
 * ```
 */
export function applyMotion(
  config: boolean | MotionOptions,
  target?: HTMLElement,
): () => void {
  const el = target ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) return () => {};

  const vars: Array<[string, string]> = config === false
    ? [[MOTION_VARS.duration, '0ms'], [MOTION_VARS.durationFast, '0ms']]
    : config === true
      ? []
      : motionToVars(config);

  // Con `applyMotion(true)` no se escribe nada: se limpia lo que hubiera, que
  // es lo que significa «vuelve a la configuración por defecto».
  const aTocar = config === true ? Object.values(MOTION_VARS) : vars.map(([n]) => n);
  const previo = aTocar.map(name => [name, el.style.getPropertyValue(name)] as const);

  if (config === true) {
    for (const name of aTocar) el.style.removeProperty(name);
  } else {
    for (const [name, value] of vars) el.style.setProperty(name, value);
  }

  return () => {
    for (const [name, old] of previo) {
      if (old) el.style.setProperty(name, old);
      else el.style.removeProperty(name);
    }
  };
}

/**
 * CSS equivalente, para inyectarlo desde el servidor y evitar el primer salto.
 *
 * ```tsx
 * <style dangerouslySetInnerHTML={{ __html: motionToCss({ duration: 320 }) }} />
 * ```
 */
export function motionToCss(config: boolean | MotionOptions, selector = ':root'): string {
  if (config === true) return '';
  const vars = config === false
    ? [[MOTION_VARS.duration, '0ms'], [MOTION_VARS.durationFast, '0ms']] as Array<[string, string]>
    : motionToVars(config);
  if (!vars.length) return '';
  return `${selector}{${vars.map(([n, v]) => `${n}:${v}`).join(';')}}`;
}

/** Lee una variable de movimiento del documento, con su valor de reserva. */
function leerVar(nombre: string, reserva: number, escala: 'ms' | 'px'): number {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return reserva;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  if (!raw) return reserva;
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return reserva;
  // `0.3s` son 300 ms; `300ms` son 300. Los píxeles no llevan esta conversión.
  return escala === 'ms' && raw.endsWith('s') && !raw.endsWith('ms') ? n * 1000 : n;
}

/** Duración efectiva en milisegundos, por si necesitas sincronizar algo en JS. */
export function motionDuration(fast = false): number {
  return leerVar(
    fast ? MOTION_VARS.durationFast : MOTION_VARS.duration,
    fast ? 120 : 200,
    'ms',
  );
}

/**
 * Estilo en línea para la prop `blur` de un componente con velo.
 *
 * ```tsx
 * <div style={{ ...motionStyle(animate), ...blurStyle(blur) }} />
 * ```
 */
export function blurStyle(blur?: number | string | false): CSSProperties | undefined {
  if (blur === undefined) return undefined;
  return { [MOTION_VARS.blur]: blur === false ? '0px' : conUnidad(blur, 'px') } as CSSProperties;
}

/** Desenfoque efectivo del velo, en píxeles. */
export function motionBlur(): number {
  return leerVar(MOTION_VARS.blur, 8, 'px');
}

/** Prop común a todos los componentes que animan. */
export interface AnimatableProps {
  /**
   * Ajusta el movimiento solo de este componente.
   *
   * - `false` — instantáneo.
   * - un número — milisegundos (`animate={400}`).
   * - un objeto — `{ duration, durationFast, blur }`.
   * - sin poner nada — sigue la configuración global.
   *
   * Escribe variables CSS en línea, así que cascadea: puesto en un contenedor
   * afecta también a los componentes de dentro.
   */
  animate?: AnimateProp;
}
