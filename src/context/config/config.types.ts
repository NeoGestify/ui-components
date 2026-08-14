import { createContext } from 'react';

/**
 * Textos que la librería escribe por su cuenta.
 *
 * Estaban quemados en español dentro de cada componente (`'Cargando...'` en
 * `Button`, `'Cerrar'` en `Modal`, `'Limpiar'` en `Input`, `'Aceptar'` y
 * `'Cancelar'` en los alerts). Una librería de componentes no debería traer
 * idioma: quien la usa decide en cuál habla su aplicación.
 *
 * Cada componente sigue aceptando su prop suelta (`loadingText`, `clearLabel`…),
 * que gana sobre esto. El diccionario es para no repetirla en cada uso.
 */
export interface NuiMessages {
  /** Texto del botón mientras `isLoading`. */
  loading: string;
  /** Etiqueta accesible del botón de cerrar. */
  close: string;
  /** Etiqueta accesible del botón de limpiar un campo. */
  clear: string;
  /** Confirmar en los alerts. */
  confirm: string;
  /** Cancelar en los alerts. */
  cancel: string;
  /** Negar, en los alerts de tres botones. */
  deny: string;
  /** Página anterior. */
  previous: string;
  /** Página siguiente. */
  next: string;
  /** Cuando una lista no tiene resultados. */
  empty: string;
  /** Cuando una búsqueda no encuentra nada. */
  noResults: string;
  /** Marcador de un selector sin elegir. */
  select: string;
  /** Campo obligatorio, para lectores de pantalla. */
  required: string;
}

export const DEFAULT_MESSAGES: NuiMessages = {
  loading: 'Cargando...',
  close: 'Cerrar',
  clear: 'Limpiar',
  confirm: 'Aceptar',
  cancel: 'Cancelar',
  deny: 'No',
  previous: 'Anterior',
  next: 'Siguiente',
  empty: 'Sin datos',
  noResults: 'Sin resultados',
  select: 'Selecciona…',
  required: 'obligatorio',
};

/** Diccionario en inglés, por comodidad. */
export const EN_MESSAGES: NuiMessages = {
  loading: 'Loading…',
  close: 'Close',
  clear: 'Clear',
  confirm: 'OK',
  cancel: 'Cancel',
  deny: 'No',
  previous: 'Previous',
  next: 'Next',
  empty: 'No data',
  noResults: 'No results',
  select: 'Select…',
  required: 'required',
};

export interface NuiConfig {
  messages: NuiMessages;
}

/**
 * `null` como valor por defecto y no `DEFAULT_MESSAGES`: así `useNuiConfig`
 * distingue «no hay proveedor» de «hay uno con los valores por defecto», y los
 * componentes pueden funcionar sin envolverlos en nada.
 */
export const NuiConfigContext = createContext<NuiConfig | null>(null);
