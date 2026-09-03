/**
 * Las piezas sobre las que está construida la librería.
 *
 * Hasta ahora vivían en `internal/` y no salían de ahí, así que quien montaba
 * un componente propio sobre esta librería —un selector de color, un panel
 * anclado, un diálogo a medida— tenía que reescribir el estado controlado, el
 * cierre al pulsar fuera o el bloqueo del desplazamiento. Y reescribirlos peor,
 * porque cada uno de estos guarda la solución a un fallo concreto que ya se
 * pagó una vez.
 *
 * Son estables y están documentados, pero son de bajo nivel: si lo que
 * necesitas ya existe como componente, usa el componente.
 */

export { Portal } from '../internal/Portal';
export { useControllableState } from '../internal/useControllableState';
export { useDismiss } from '../internal/useDismiss';
export { useScrollLock, lockScroll } from '../internal/useScrollLock';
export { useAnchoredPosition } from '../internal/useAnchoredPosition';
export {
  computePosition,
  type Placement, type Side, type Align,
  // `Rect` a secas ya existe en el editor de mapas y son cosas distintas: allí
  // es un elemento del plano, aquí la caja de un anclaje en pantalla.
  type Rect as AnchorRect,
  type PositionOptions, type PositionResult,
} from '../internal/position';
export { mergeRefs, useMergedRefs } from '../internal/mergeRefs';
export { inertOutside } from '../internal/inertOutside';
export { pushTopLayer, currentTopLayer } from '../internal/topLayer';
export { NUI_LAYERS } from '../internal/layers';
export {
  toOptions, optionText,
  type NuiOption, type NuiOptionValue, type OptionsInput,
} from '../internal/options';
