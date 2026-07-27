import { NUI_DEFAULTS, type NuiToken } from './tokens';

/** Colores de un tema. Cualquier valor CSS válido: hex, `rgb()`, `oklch()`… */
export type NuiColorScheme = Partial<Record<NuiToken, string>>;

/** Colores de la librería para el tema claro y el oscuro. */
export interface NuiColors {
  light?: NuiColorScheme;
  dark?: NuiColorScheme;
}

/** Nombre de la variable CSS de un token. */
export function cssVarName(token: NuiToken, scheme: 'light' | 'dark'): string {
  return scheme === 'dark' ? `--nui-${token}-dark` : `--nui-${token}`;
}

/**
 * Convierte unos colores en pares `[variable, valor]`.
 * Los tokens desconocidos se ignoran en silencio.
 */
export function toCssVars(colors: NuiColors): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const scheme of ['light', 'dark'] as const) {
    const set = colors[scheme];
    if (!set) continue;
    for (const [token, value] of Object.entries(set)) {
      if (!value || !(token in NUI_DEFAULTS)) continue;
      out.push([cssVarName(token as NuiToken, scheme), value]);
    }
  }
  return out;
}

/**
 * Escribe los colores en un elemento (por defecto `<html>`) y devuelve una
 * función que deshace el cambio.
 */
export function applyNuiColors(colors: NuiColors, target?: HTMLElement): () => void {
  const el = target ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) return () => {};
  const vars = toCssVars(colors);
  const previous = vars.map(([name]) => [name, el.style.getPropertyValue(name)] as const);
  for (const [name, value] of vars) el.style.setProperty(name, value);
  return () => {
    for (const [name, old] of previous) {
      if (old) el.style.setProperty(name, old);
      else el.style.removeProperty(name);
    }
  };
}

/**
 * Genera el CSS equivalente, para inyectarlo en un `<style>` del servidor y
 * evitar el parpadeo de color antes de que hidrate React.
 *
 * ```tsx
 * <style dangerouslySetInnerHTML={{ __html: nuiColorsToCss({ light: { accent: '#059669' } }) }} />
 * ```
 */
export function nuiColorsToCss(colors: NuiColors, selector = ':root'): string {
  const vars = toCssVars(colors);
  if (!vars.length) return '';
  return `${selector}{${vars.map(([n, v]) => `${n}:${v}`).join(';')}}`;
}

/** Tema activo según el documento: clase `.dark`, `data-theme` o localStorage. */
export function activeScheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  const root = document.documentElement;
  if (root.classList.contains('dark') || root.dataset.theme === 'dark') return 'dark';
  if (root.classList.contains('light') || root.dataset.theme === 'light') return 'light';
  try {
    if (localStorage.getItem('theme') === 'dark') return 'dark';
  } catch {
    // localStorage bloqueado
  }
  return 'light';
}

/**
 * Color efectivo de un token: lo que haya definido el consumidor en la variable
 * CSS o, si no hay nada, el valor por defecto.
 *
 * Necesario para lo que no se puede pintar con clases —SVG, canvas o
 * bibliotecas de terceros como SweetAlert2.
 */
export function resolveColor(token: NuiToken, scheme: 'light' | 'dark' = activeScheme()): string {
  if (typeof document !== 'undefined' && typeof getComputedStyle === 'function') {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVarName(token, scheme))
      .trim();
    if (v) return v;
  }
  return defaultColor(token, scheme);
}

/** Valor por defecto de un token, por si necesitas partir de él. */
export function defaultColor(token: NuiToken, scheme: 'light' | 'dark'): string {
  return NUI_DEFAULTS[token][scheme === 'dark' ? 1 : 0].replace(/_/g, ' ');
}
