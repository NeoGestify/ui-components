import type { MapElement, ElementTypeDef } from '../types';

/**
 * Valor efectivo de `clickable` para un elemento: primero el del propio
 * elemento, luego el por defecto de su tipo y, si ninguno está definido,
 * `false`.
 */
export function isClickable(
  element: Pick<MapElement, 'clickable'>,
  typeDef?: Pick<ElementTypeDef, 'clickable'>,
): boolean {
  return element.clickable ?? typeDef?.clickable ?? false;
}
