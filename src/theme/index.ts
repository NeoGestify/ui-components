// Se expone porque el consumidor la necesita para lo mismo que la usa la
// librería: envolver un componente y que sus clases ganen de verdad.
// Vive en `theme` y no en `html` para que siga siendo utilizable en servidor.
export { cn, type ClassValue } from '../internal/cn';
export {
  NUI_DEFAULTS,
  bg, bgHover, bgHoverOf, text, textHover, border, borderHover, borderSoft, divide, placeholder, focusBorder,
  ringOffset, focusRingOf,
  focusRing, focusVisibleRing, ringAccent, t,
  type NuiToken,
} from './tokens';
export {
  activeScheme,
  applyNuiColors,
  cssVarName,
  defaultColor,
  nuiColorsToCss,
  resolveColor,
  toCssVars,
  type NuiColors,
  type NuiColorScheme,
} from './colors';
export {
  NUI_DURATION,
  NUI_DURATION_FAST,
  applyMotion,
  motion,
  motionDuration,
  motionStyle,
  motionToCss,
  withMotionStyle,
  NO_MOTION_STYLE,
  type AnimatableProps,
} from './motion';
