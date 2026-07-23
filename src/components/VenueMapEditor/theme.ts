import { useState, useEffect } from 'react';
import type { WallMaterial } from './types';

export type VenueTheme = 'light' | 'dark';
export type VenueThemeSetting = VenueTheme | 'auto';

/**
 * Paleta del lienzo. Los colores del SVG no pueden expresarse con clases
 * `dark:` de Tailwind (van en atributos `fill`/`stroke`), así que se resuelven
 * aquí a partir del tema activo.
 */
export interface VenuePalette {
  /** Fondo infinito fuera del área de la planta. */
  canvasBg: string;
  gridMinor: string;
  gridMajor: string;
  /** Relleno del área de la planta (artboard). */
  artboardFill: string;
  artboardStroke: string;
  artboardShadowOpacity: number;
  wallFill: string;
  wallStroke: string;
  /** Relleno/trazo por material de pared. */
  wallMaterials: Record<WallMaterial, { fill: string; stroke: string; opacity?: number }>;
  /** Color de acento: selección, handles, nodos, lazo. */
  accent: string;
  /** Relleno de los handles (contrasta con `accent`). */
  handleFill: string;
  /** Texto de las etiquetas cuando el tipo no define color propio. */
  label: string;
  /** Trazo del preview de pared en construcción. */
  previewFill: string;
}

const LIGHT: VenuePalette = {
  canvasBg: '#f1f5f9',
  gridMinor: '#e2e8f0',
  gridMajor: '#cbd5e1',
  artboardFill: '#fafaf9',
  artboardStroke: '#94a3b8',
  artboardShadowOpacity: 0.12,
  wallFill: '#475569',
  wallStroke: '#1e293b',
  wallMaterials: {
    concrete: { fill: '#475569', stroke: '#1e293b' },
    brick:    { fill: '#b45309', stroke: '#7c2d12' },
    glass:    { fill: '#7dd3fc', stroke: '#0284c7', opacity: 0.55 },
    drywall:  { fill: '#cbd5e1', stroke: '#64748b' },
    wood:     { fill: '#a16207', stroke: '#713f12' },
  },
  accent: '#3b82f6',
  handleFill: '#ffffff',
  label: '#1e293b',
  previewFill: '#94a3b8',
};

const DARK: VenuePalette = {
  canvasBg: '#0b1220',
  gridMinor: '#1e293b',
  gridMajor: '#334155',
  artboardFill: '#18202f',
  artboardStroke: '#64748b',
  artboardShadowOpacity: 0.5,
  wallFill: '#94a3b8',
  wallStroke: '#cbd5e1',
  wallMaterials: {
    concrete: { fill: '#94a3b8', stroke: '#cbd5e1' },
    brick:    { fill: '#c2703a', stroke: '#f0b189' },
    glass:    { fill: '#38bdf8', stroke: '#7dd3fc', opacity: 0.5 },
    drywall:  { fill: '#64748b', stroke: '#94a3b8' },
    wood:     { fill: '#b07d33', stroke: '#e0bd7c' },
  },
  accent: '#60a5fa',
  handleFill: '#0f172a',
  label: '#e2e8f0',
  previewFill: '#64748b',
};

export const VENUE_PALETTES: Record<VenueTheme, VenuePalette> = {
  light: LIGHT,
  dark: DARK,
};

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/** Lee el tema activo del `<html>`: clase `.dark`, `data-theme` o `color-scheme`. */
function detectTheme(): VenueTheme {
  if (!isBrowser) return 'light';
  const root = document.documentElement;
  if (root.classList.contains('dark')) return 'dark';
  if (root.dataset.theme === 'dark') return 'dark';
  if (root.classList.contains('light') || root.dataset.theme === 'light') return 'light';
  const scheme = getComputedStyle(root).colorScheme;
  if (scheme.includes('dark') && !scheme.includes('light')) return 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resuelve el tema del editor.
 *
 * - `'light'` / `'dark'`: forzado por el consumidor.
 * - `'auto'` (por defecto): sigue al `<html>` (clase `.dark`, `data-theme` o
 *   `prefers-color-scheme`) y reacciona a los cambios en vivo.
 *
 * Devuelve `'light'` en el primer render para que SSR e hidratación coincidan.
 */
export function useVenueTheme(setting: VenueThemeSetting = 'auto'): VenueTheme {
  const [detected, setDetected] = useState<VenueTheme>('light');

  useEffect(() => {
    if (setting !== 'auto' || !isBrowser) return;

    const sync = () => setDetected(detectTheme());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });

    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener('change', sync);

    return () => {
      observer.disconnect();
      mq?.removeEventListener('change', sync);
    };
  }, [setting]);

  return setting === 'auto' ? detected : setting;
}
