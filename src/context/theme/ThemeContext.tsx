import { useEffect, useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext, type Theme } from './theme.types';
import { applyNuiColors, type NuiColors } from '../../theme/colors';
import { applyMotion, type MotionOptions } from '../../theme/motion';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

function readStoredTheme(storageKey: string): Theme | null {
  if (!isBrowser) return null;
  try {
    const saved = localStorage.getItem(storageKey);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    // localStorage bloqueado (modo privado / cookies deshabilitadas)
    return null;
  }
}

function systemTheme(): Theme {
  if (!isBrowser || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Tema usado en el primer render (y en SSR). Por defecto `'light'`. */
  defaultTheme?: Theme;
  /**
   * Cuando no hay tema guardado, usa la preferencia del sistema
   * (`prefers-color-scheme`) en vez de `defaultTheme`. Por defecto `true`.
   */
  enableSystem?: boolean;
  /** Clave de localStorage. Por defecto `'theme'`. */
  storageKey?: string;
  /**
   * Colores de la librería para cada tema. Escribe las variables `--nui-*` en
   * `<html>`; lo que no se indique conserva el color por defecto.
   *
   * ```tsx
   * <ThemeProvider colors={{ light: { accent: '#059669' }, dark: { accent: '#34d399' } }}>
   * ```
   *
   * Alternativa sin JavaScript: declarar las mismas variables en tu CSS.
   */
  colors?: NuiColors;
  /**
   * Anima los cambios de tamaño y posición de la librería (acordeones,
   * modales, hojas, tooltips…). `false` los deja instantáneos.
   *
   * Independiente de `prefers-reduced-motion`, que ya se respeta siempre.
   * Cada componente puede saltárselo con su prop `animate`.
   */
  animations?: boolean;
  /**
   * Ajustes finos del movimiento, para toda la aplicación.
   *
   * ```tsx
   * <ThemeProvider motion={{ duration: 320, blur: 12 }}>
   * <ThemeProvider motion={{ blur: false }}>   // sin desenfoque de fondo
   * ```
   *
   * Se aplica **después** de `animations`, así que
   * `animations={false} motion={{ blur: 0 }}` deja todo instantáneo y sin
   * desenfoque, y no se pisan entre sí.
   */
  motion?: MotionOptions;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  enableSystem = true,
  storageKey = 'theme',
  colors,
  animations = true,
  motion,
}: ThemeProviderProps) {
  // No se lee localStorage durante el render inicial: en SSR no existe y
  // provocaría un mismatch de hidratación. Se sincroniza en el primer efecto.
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // ── Sincronización inicial (cliente) ───────────────────────────────────────
  useEffect(() => {
    const stored = readStoredTheme(storageKey);
    if (stored) setThemeState(stored);
    else if (enableSystem) setThemeState(systemTheme());
    // Solo al montar: a partir de aquí manda la elección del usuario, así que
    // `storageKey`/`enableSystem` no deben re-disparar la sincronización.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Aplicar al DOM ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isBrowser) return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    // Clave para que los controles nativos (select, scrollbars, date pickers)
    // se pinten con la paleta correcta del sistema operativo.
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // sin persistencia disponible: el tema sigue funcionando en memoria
    }
  }, [theme, storageKey]);

  // ── Colores personalizados ─────────────────────────────────────────────────
  // Se serializa el objeto para no reaplicar en cada render cuando el
  // consumidor pasa un literal nuevo con el mismo contenido.
  const colorsKey = colors ? JSON.stringify(colors) : '';
  useEffect(() => {
    if (!isBrowser || !colorsKey) return;
    return applyNuiColors(JSON.parse(colorsKey) as NuiColors);
  }, [colorsKey]);

  // ── Animaciones ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isBrowser || animations) return;
    return applyMotion(false);
  }, [animations]);

  // Se serializa igual que los colores, para no reaplicar en cada render
  // cuando el consumidor pasa un literal nuevo con el mismo contenido.
  const motionKey = motion ? JSON.stringify(motion) : '';
  useEffect(() => {
    if (!isBrowser || !motionKey) return;
    return applyMotion(JSON.parse(motionKey) as MotionOptions);
  }, [motionKey]);

  // ── Sincronización entre pestañas ──────────────────────────────────────────
  useEffect(() => {
    if (!isBrowser) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      if (e.newValue === 'light' || e.newValue === 'dark') setThemeState(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  // Sin memoizar, el objeto era nuevo en cada render y volvía a renderizar a
  // todos los consumidores de `useTheme` aunque el tema no hubiera cambiado.
  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
