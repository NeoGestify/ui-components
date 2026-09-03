import type { ReactNode } from 'react';

/**
 * Tipo de opción común a todos los selectores de la librería.
 *
 * Antes cada componente declaraba el suyo —`SelectOption`, `ComboboxOption`,
 * `RadioOption`, `CheckboxOption`, `SegmentedOption`— casi idénticos pero
 * **incompatibles en TypeScript**: quien tuviera un arreglo preparado para un
 * `RadioGroup` no podía pasárselo a un `SegmentedControl` sin mapearlo. Ahora
 * todos son alias de este, así que se intercambian sin tocar nada.
 *
 * Los campos de más (`description`, `icon`, `group`) los usa el componente que
 * sepa qué hacer con ellos y el resto los ignora; sobra información, nunca
 * falta.
 */
export interface NuiOption<V extends NuiOptionValue = string> {
  value: V;
  label: ReactNode;
  /** Texto de apoyo bajo la etiqueta. */
  description?: ReactNode;
  disabled?: boolean;
  /** Icono a la izquierda de la etiqueta. */
  icon?: ReactNode;
  /** Agrupa opciones bajo una cabecera. */
  group?: string;
}

/** Lo que el DOM sabe guardar en un `value`. */
export type NuiOptionValue = string | number;

/**
 * Lo que acepta un componente de opciones: la lista completa o solo los
 * valores, cuando la etiqueta es el propio valor.
 *
 * ```tsx
 * <RadioGroup options={['S', 'M', 'L']} />
 * ```
 */
export type OptionsInput<V extends NuiOptionValue = string> = readonly (V | NuiOption<V>)[];

function esOpcion<V extends NuiOptionValue>(o: V | NuiOption<V>): o is NuiOption<V> {
  return typeof o === 'object' && o !== null && 'value' in o;
}

/**
 * Normaliza la entrada a opciones completas.
 *
 * `NoInfer` en el parámetro es lo que permite mezclar las dos formas en el
 * mismo arreglo. Sin él, TypeScript deduce `V` del primer objeto literal que
 * encuentra —`{ value: 'b' }` deduce `V = 'b'`— y entonces rechaza el `'a'`
 * suelto de al lado. Con esto, `V` se queda en `string` salvo que se indique.
 */
export function toOptions<V extends NuiOptionValue = string>(input: OptionsInput<NoInfer<V>>): NuiOption<V>[] {
  return input.map(o => (esOpcion(o) ? o : { value: o, label: String(o) }));
}

/**
 * Texto plano de una opción, para buscar y para el `title` del navegador.
 * Devuelve `''` cuando la etiqueta es JSX, que no se puede leer sin renderizar.
 */
export function optionText(o: NuiOption<NuiOptionValue>): string {
  if (typeof o.label === 'string' || typeof o.label === 'number') return String(o.label);
  return String(o.value);
}
