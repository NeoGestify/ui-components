import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext, type Theme } from './theme.types';

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
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  enableSystem = true,
  storageKey = 'theme',
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

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
