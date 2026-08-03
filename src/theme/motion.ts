import type { CSSProperties } from 'react';

/**
 * Animaciones de la librería.
 *
 * Todo lo que se mueve lee su duración de `--nui-duration`, así que el
 * interruptor es una sola variable CSS:
 *
 * - **Global**: `applyMotion(false)`, `<ThemeProvider animations={false}>` o
 *   `:root { --nui-duration: 0ms }` en tu CSS.
 * - **Puntual**: la prop `animate={false}` de cada componente, que escribe la
 *   misma variable en línea. Como es una variable CSS, cascadea: ponerla en un
 *   contenedor apaga también lo que haya dentro.
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


/**
 * Fragmentos de clase por tipo de transición. Se escriben literales para que
 * Tailwind los encuentre al escanear el código fuente.
 */
export const motion = {
  /** Opacidad y transformación a la vez: aparecer, escalar, deslizar. */
  enter: 'transition-[opacity,transform] duration-[var(--nui-duration,200ms)] ease-out motion-reduce:transition-none',
  /** Igual pero rápido, para elementos pequeños. */
  enterFast: 'transition-[opacity,transform] duration-[var(--nui-duration-fast,120ms)] ease-out motion-reduce:transition-none',
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
 * Estilo en línea para la prop `animate` de un componente.
 * Devuelve `undefined` cuando no hay nada que forzar, para no crear objetos
 * nuevos en cada render.
 *
 * ```tsx
 * <div style={motionStyle(animate)} />
 * ```
 */
export function motionStyle(animate?: boolean): CSSProperties | undefined {
  return animate === false ? NO_MOTION_STYLE : undefined;
}

/** Une `motionStyle` con el `style` que llegue por props. */
export function withMotionStyle(animate: boolean | undefined, style?: CSSProperties): CSSProperties | undefined {
  const off = motionStyle(animate);
  if (!off) return style;
  return style ? { ...style, ...off } : off;
}

/**
 * Enciende o apaga las animaciones de toda la página. Devuelve una función que
 * deshace el cambio.
 *
 * ```ts
 * const undo = applyMotion(false);
 * ```
 */
export function applyMotion(enabled: boolean, target?: HTMLElement): () => void {
  const el = target ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) return () => {};
  const previous = (['--nui-duration', '--nui-duration-fast'] as const)
    .map(name => [name, el.style.getPropertyValue(name)] as const);

  if (enabled) {
    el.style.removeProperty('--nui-duration');
    el.style.removeProperty('--nui-duration-fast');
  } else {
    el.style.setProperty('--nui-duration', '0ms');
    el.style.setProperty('--nui-duration-fast', '0ms');
  }

  return () => {
    for (const [name, old] of previous) {
      if (old) el.style.setProperty(name, old);
      else el.style.removeProperty(name);
    }
  };
}

/** CSS equivalente, para inyectarlo desde el servidor y evitar el primer salto. */
export function motionToCss(enabled: boolean, selector = ':root'): string {
  return enabled ? '' : `${selector}{--nui-duration:0ms;--nui-duration-fast:0ms}`;
}

/** Duración efectiva en milisegundos, por si necesitas sincronizar algo en JS. */
export function motionDuration(fast = false): number {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') {
    return fast ? 120 : 200;
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(fast ? '--nui-duration-fast' : '--nui-duration')
    .trim();
  if (!raw) return fast ? 120 : 200;
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return fast ? 120 : 200;
  return raw.endsWith('s') && !raw.endsWith('ms') ? n * 1000 : n;
}

/** Prop común a todos los componentes que animan. */
export interface AnimatableProps {
  /**
   * Anima los cambios de tamaño y posición. `false` los hace instantáneos.
   * Por defecto sigue la configuración global.
   */
  animate?: boolean;
}
