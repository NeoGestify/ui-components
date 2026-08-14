import { useContext, useMemo, type FC, type ReactNode } from 'react';
import {
  DEFAULT_MESSAGES, NuiConfigContext,
  type NuiConfig, type NuiMessages,
} from './config.types';

export interface NuiConfigProviderProps {
  children: ReactNode;
  /**
   * Textos de la librería. Se mezclan con los que ya hay, así que se puede
   * cambiar solo lo que interese.
   *
   * ```tsx
   * <NuiConfigProvider messages={{ loading: 'Loading…', close: 'Close' }}>
   * ```
   */
  messages?: Partial<NuiMessages>;
}

/**
 * Configuración común de la librería. Ahora mismo, los textos.
 *
 * Es opcional: sin él todo sigue funcionando con los textos por defecto, que
 * son los mismos que estaban escritos a mano en cada componente.
 */
export const NuiConfigProvider: FC<NuiConfigProviderProps> = ({ children, messages }) => {
  // Se anida sobre el proveedor de arriba en vez de sustituirlo, para que un
  // proveedor interno pueda cambiar un solo texto en una parte de la página.
  const parent = useContext(NuiConfigContext);

  const value = useMemo<NuiConfig>(() => ({
    messages: { ...(parent?.messages ?? DEFAULT_MESSAGES), ...messages },
  }), [parent, messages]);

  return (
    <NuiConfigContext.Provider value={value}>
      {children}
    </NuiConfigContext.Provider>
  );
};

/** Configuración activa. Devuelve los valores por defecto si no hay proveedor. */
export function useNuiConfig(): NuiConfig {
  return useContext(NuiConfigContext) ?? { messages: DEFAULT_MESSAGES };
}

/**
 * Atajo para el caso de siempre dentro de un componente:
 *
 * ```ts
 * const close = useMessage('close');           // del proveedor o por defecto
 * const label = useMessage('close', propLabel); // la prop gana si viene
 * ```
 */
export function useMessage(key: keyof NuiMessages, override?: string): string {
  const { messages } = useNuiConfig();
  return override ?? messages[key];
}
