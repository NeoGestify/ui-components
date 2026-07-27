/**
 * Tokens de color de la librería.
 *
 * Cada token es un fragmento de clases de Tailwind que lee una variable CSS y
 * **cae en el color actual de la librería** si nadie la define:
 *
 * ```
 * bg-[var(--nui-surface,#fff)] dark:bg-[var(--nui-surface-dark,oklch(27.8% .033 256.848))]
 * ```
 *
 * Consecuencias:
 *
 * - Quien no configure nada ve exactamente los mismos colores de siempre.
 * - Para retematizar basta con declarar las variables; no hay que importar
 *   ningún CSS de la librería ni tocar `tailwind.config`.
 * - Funciona igual en Tailwind 3.2+ y 4.x, porque solo usa valores arbitrarios.
 *
 * ```css
 * :root {
 *   --nui-accent:      #059669;
 *   --nui-accent-dark: #34d399;
 * }
 * ```
 *
 * Los valores por defecto son los de la paleta de Tailwind v4 (OKLCH), copiados
 * literalmente para que la migración no cambie ni un píxel. En las clases van
 * con `_` en lugar de espacios: es como Tailwind escribe los espacios dentro de
 * un valor arbitrario.
 */

// ─── Valores por defecto ────────────────────────────────────────────────────

/** Paleta de reserva, en el orden [claro, oscuro]. */
export const NUI_DEFAULTS = {
  // Superficies
  'surface':        ['#fff',                          'oklch(27.8% .033 256.848)'], // white / gray-800
  'surface-muted':  ['oklch(98.5% .002 247.839)',     'oklch(37.3% .034 259.733)'], // gray-50 / gray-700
  'surface-hover':  ['oklch(96.7% .003 264.542)',     'oklch(37.3% .034 259.733)'], // gray-100 / gray-700
  'surface-sunken': ['oklch(96.7% .003 264.542)',     'oklch(21% .034 264.665)'],   // gray-100 / gray-900
  // Bandas de cabecera y pie DENTRO de un panel. En claro se separan
  // aclarándose y en oscuro oscureciéndose: una banda más clara que su panel
  // parece elevada, y una cabecera no está elevada, está hundida.
  'surface-band':   ['oklch(98.5% .002 247.839)',     'oklch(21% .034 264.665)'],   // gray-50 / gray-900
  // Bordes
  'border':         ['oklch(87.2% .01 258.338)',      'oklch(44.6% .03 256.802)'],  // gray-300 / gray-600
  'border-subtle':  ['oklch(92.8% .006 264.531)',     'oklch(37.3% .034 259.733)'], // gray-200 / gray-700
  // Texto
  'text':           ['oklch(21% .034 264.665)',       '#fff'],                      // gray-900 / white
  'text-muted':     ['oklch(37.3% .034 259.733)',     'oklch(87.2% .01 258.338)'],  // gray-700 / gray-300
  'text-subtle':    ['oklch(55.1% .027 264.364)',     'oklch(70.7% .022 261.325)'], // gray-500 / gray-400
  'text-faint':     ['oklch(70.7% .022 261.325)',     'oklch(55.1% .027 264.364)'], // gray-400 / gray-500
  // Acento
  'accent':         ['oklch(51.1% .262 276.966)',     'oklch(58.5% .233 277.117)'], // indigo-600 / indigo-500
  'accent-hover':   ['oklch(45.7% .24 277.023)',      'oklch(51.1% .262 276.966)'], // indigo-700 / indigo-600
  'accent-fg':      ['#fff',                          '#fff'],                      // texto sobre el acento
  'accent-text':    ['oklch(51.1% .262 276.966)',     'oklch(67.3% .182 276.935)'], // indigo-600 / indigo-400
  'accent-soft':    ['oklch(96.2% .018 272.314)',     'oklch(58.5% .233 277.117_/_.15)'], // indigo-50 / indigo-500 15 %
  'ring':           ['oklch(58.5% .233 277.117)',     'oklch(67.3% .182 276.935)'], // indigo-500 / indigo-400
  'ring-offset':    ['oklch(98.5% .002 247.839)',     'oklch(21% .034 264.665)'],   // gray-50 / gray-900
  'accent-subtle':  ['oklch(93% .034 272.788)',       'oklch(39.8% .195 277.366)'], // indigo-100 / indigo-800
  'danger-subtle':  ['oklch(80.8% .114 19.571)',      'oklch(57.7% .245 27.325)'],  // red-300 / red-600
  // Semánticos
  'danger':         ['oklch(57.7% .245 27.325)',      'oklch(63.7% .237 25.331)'],  // red-600 / red-500
  'danger-hover':   ['oklch(50.5% .213 27.518)',      'oklch(57.7% .245 27.325)'],  // red-700 / red-600
  'danger-text':    ['oklch(57.7% .245 27.325)',      'oklch(70.4% .191 22.216)'],  // red-600 / red-400
  'success':        ['oklch(62.7% .194 149.214)',     'oklch(72.3% .219 149.579)'], // green-600 / green-500
  'success-text':   ['oklch(52.7% .154 150.069)',     'oklch(87.1% .15 154.449)'],  // green-700 / green-300
  'warning':        ['oklch(68.1% .162 75.834)',      'oklch(79.5% .184 86.047)'],  // yellow-600 / yellow-500
  'warning-text':   ['oklch(55.4% .135 66.442)',      'oklch(90.5% .182 98.111)'],  // yellow-700 / yellow-300
  'info':           ['oklch(54.6% .245 262.881)',     'oklch(62.3% .214 259.815)'], // blue-600 / blue-500
  'info-text':      ['oklch(48.8% .243 264.376)',     'oklch(70.7% .165 254.624)'], // blue-700 / blue-400
  // Velo de los overlays (se usa con transparencia)
  'scrim':          ['oklch(21% .034 264.665)',       'oklch(21% .034 264.665)'],   // gray-900
  // Cabecera invertida (variante `dark` de la tabla)
  'surface-inverted':    ['oklch(27.8% .033 256.848)', 'oklch(21% .034 264.665)'],   // gray-800 / gray-900
  'text-on-inverted':    ['oklch(96.7% .003 264.542)', 'oklch(96.7% .003 264.542)'], // gray-100
} as const;

export type NuiToken = keyof typeof NUI_DEFAULTS;

// ─── Fragmentos de clase ────────────────────────────────────────────────────
//
// Se escriben literales (y no generados con plantillas) porque Tailwind escanea
// el CÓDIGO FUENTE buscando cadenas: una clase construida en tiempo de
// ejecución nunca llegaría al CSS.

/** Fondos. */
export const bg = {
  surface:       'bg-[var(--nui-surface,#fff)] dark:bg-[var(--nui-surface-dark,oklch(27.8%_.033_256.848))]',
  surfaceMuted:  'bg-[var(--nui-surface-muted,oklch(98.5%_.002_247.839))] dark:bg-[var(--nui-surface-muted-dark,oklch(37.3%_.034_259.733))]',
  surfaceSunken: 'bg-[var(--nui-surface-sunken,oklch(96.7%_.003_264.542))] dark:bg-[var(--nui-surface-sunken-dark,oklch(21%_.034_264.665))]',
  surfaceBand:   'bg-[var(--nui-surface-band,oklch(98.5%_.002_247.839))] dark:bg-[var(--nui-surface-band-dark,oklch(21%_.034_264.665))]',
  accent:        'bg-[var(--nui-accent,oklch(51.1%_.262_276.966))] dark:bg-[var(--nui-accent-dark,oklch(58.5%_.233_277.117))]',
  accentSoft:    'bg-[var(--nui-accent-soft,oklch(96.2%_.018_272.314))] dark:bg-[var(--nui-accent-soft-dark,oklch(58.5%_.233_277.117_/_.15))]',
  danger:        'bg-[var(--nui-danger,oklch(57.7%_.245_27.325))] dark:bg-[var(--nui-danger-dark,oklch(63.7%_.237_25.331))]',
  success:       'bg-[var(--nui-success,oklch(62.7%_.194_149.214))] dark:bg-[var(--nui-success-dark,oklch(72.3%_.219_149.579))]',
  warning:       'bg-[var(--nui-warning,oklch(68.1%_.162_75.834))] dark:bg-[var(--nui-warning-dark,oklch(79.5%_.184_86.047))]',
  info:          'bg-[var(--nui-info,oklch(54.6%_.245_262.881))] dark:bg-[var(--nui-info-dark,oklch(62.3%_.214_259.815))]',
  inverted:      'bg-[var(--nui-surface-inverted,oklch(27.8%_.033_256.848))] dark:bg-[var(--nui-surface-inverted-dark,oklch(21%_.034_264.665))]',
} as const;

/** Fondos en `hover:`. */
export const bgHover = {
  surface:     'hover:bg-[var(--nui-surface-hover,oklch(96.7%_.003_264.542))] dark:hover:bg-[var(--nui-surface-hover-dark,oklch(37.3%_.034_259.733))]',
  accent:      'hover:bg-[var(--nui-accent-hover,oklch(45.7%_.24_277.023))] dark:hover:bg-[var(--nui-accent-hover-dark,oklch(51.1%_.262_276.966))]',
  accentSoft:  'hover:bg-[var(--nui-accent-soft,oklch(96.2%_.018_272.314))] dark:hover:bg-[var(--nui-accent-soft-dark,oklch(58.5%_.233_277.117_/_.15))]',
  danger:      'hover:bg-[var(--nui-danger-hover,oklch(50.5%_.213_27.518))] dark:hover:bg-[var(--nui-danger-hover-dark,oklch(57.7%_.245_27.325))]',
} as const;

/** Colores de texto. */
export const text = {
  base:      'text-[var(--nui-text,oklch(21%_.034_264.665))] dark:text-[var(--nui-text-dark,#fff)]',
  muted:     'text-[var(--nui-text-muted,oklch(37.3%_.034_259.733))] dark:text-[var(--nui-text-muted-dark,oklch(87.2%_.01_258.338))]',
  subtle:    'text-[var(--nui-text-subtle,oklch(55.1%_.027_264.364))] dark:text-[var(--nui-text-subtle-dark,oklch(70.7%_.022_261.325))]',
  faint:     'text-[var(--nui-text-faint,oklch(70.7%_.022_261.325))] dark:text-[var(--nui-text-faint-dark,oklch(55.1%_.027_264.364))]',
  accent:    'text-[var(--nui-accent-text,oklch(51.1%_.262_276.966))] dark:text-[var(--nui-accent-text-dark,oklch(67.3%_.182_276.935))]',
  onAccent:  'text-[var(--nui-accent-fg,#fff)] dark:text-[var(--nui-accent-fg-dark,#fff)]',
  danger:    'text-[var(--nui-danger-text,oklch(57.7%_.245_27.325))] dark:text-[var(--nui-danger-text-dark,oklch(70.4%_.191_22.216))]',
  success:   'text-[var(--nui-success-text,oklch(52.7%_.154_150.069))] dark:text-[var(--nui-success-text-dark,oklch(87.1%_.15_154.449))]',
  warning:   'text-[var(--nui-warning-text,oklch(55.4%_.135_66.442))] dark:text-[var(--nui-warning-text-dark,oklch(90.5%_.182_98.111))]',
  info:      'text-[var(--nui-info-text,oklch(48.8%_.243_264.376))] dark:text-[var(--nui-info-text-dark,oklch(70.7%_.165_254.624))]',
  onInverted:'text-[var(--nui-text-on-inverted,oklch(96.7%_.003_264.542))] dark:text-[var(--nui-text-on-inverted-dark,oklch(96.7%_.003_264.542))]',
} as const;

/** Colores de texto en `hover:`. */
export const textHover = {
  base:   'hover:text-[var(--nui-text,oklch(21%_.034_264.665))] dark:hover:text-[var(--nui-text-dark,#fff)]',
  muted:  'hover:text-[var(--nui-text-muted,oklch(37.3%_.034_259.733))] dark:hover:text-[var(--nui-text-muted-dark,oklch(87.2%_.01_258.338))]',
  accent: 'hover:text-[var(--nui-accent-hover,oklch(45.7%_.24_277.023))] dark:hover:text-[var(--nui-accent-text-dark,oklch(67.3%_.182_276.935))]',
  danger: 'hover:text-[var(--nui-danger-hover,oklch(50.5%_.213_27.518))] dark:hover:text-[var(--nui-danger-text-dark,oklch(70.4%_.191_22.216))]',
} as const;

/** Bordes. */
export const border = {
  base:   'border-[var(--nui-border,oklch(87.2%_.01_258.338))] dark:border-[var(--nui-border-dark,oklch(44.6%_.03_256.802))]',
  subtle: 'border-[var(--nui-border-subtle,oklch(92.8%_.006_264.531))] dark:border-[var(--nui-border-subtle-dark,oklch(37.3%_.034_259.733))]',
  accent: 'border-[var(--nui-accent,oklch(51.1%_.262_276.966))] dark:border-[var(--nui-accent-dark,oklch(58.5%_.233_277.117))]',
  danger: 'border-[var(--nui-danger,oklch(57.7%_.245_27.325))] dark:border-[var(--nui-danger-dark,oklch(63.7%_.237_25.331))]',
  accentSubtle: 'border-[var(--nui-accent-subtle,oklch(93%_.034_272.788))] dark:border-[var(--nui-accent-subtle-dark,oklch(39.8%_.195_277.366))]',
  dangerSubtle: 'border-[var(--nui-danger-subtle,oklch(80.8%_.114_19.571))] dark:border-[var(--nui-danger-subtle-dark,oklch(57.7%_.245_27.325))]',
} as const;

/** Color del texto de sugerencia de los campos. */
export const placeholder =
  'placeholder-[var(--nui-text-subtle,oklch(55.1%_.027_264.364))] dark:placeholder-[var(--nui-text-subtle-dark,oklch(70.7%_.022_261.325))]';

/** Borde al enfocar. */
export const focusBorder = {
  accent: 'focus:border-[var(--nui-ring,oklch(58.5%_.233_277.117))]',
  danger: 'focus:border-[var(--nui-danger,oklch(57.7%_.245_27.325))]',
} as const;

/**
 * Bordes teñidos con el propio color de fondo (20 % sobre transparente). Es lo
 * que hace que un botón sólido tenga un borde apenas más oscuro que su relleno.
 */
export const borderSoft = {
  accent:  'border-[color-mix(in_oklab,var(--nui-accent,oklch(51.1%_.262_276.966))_20%,transparent)] dark:border-[color-mix(in_oklab,var(--nui-accent-dark,oklch(58.5%_.233_277.117))_20%,transparent)]',
  danger:  'border-[color-mix(in_oklab,var(--nui-danger,oklch(57.7%_.245_27.325))_20%,transparent)] dark:border-[color-mix(in_oklab,var(--nui-danger-dark,oklch(63.7%_.237_25.331))_20%,transparent)]',
  success: 'border-[color-mix(in_oklab,var(--nui-success,oklch(62.7%_.194_149.214))_20%,transparent)] dark:border-[color-mix(in_oklab,var(--nui-success-dark,oklch(72.3%_.219_149.579))_20%,transparent)]',
  warning: 'border-[color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_20%,transparent)] dark:border-[color-mix(in_oklab,var(--nui-warning-dark,oklch(79.5%_.184_86.047))_20%,transparent)]',
} as const;

/** Bordes en `hover:`. */
export const borderHover = {
  base:   'hover:border-[var(--nui-border,oklch(87.2%_.01_258.338))] dark:hover:border-[var(--nui-border-dark,oklch(44.6%_.03_256.802))]',
  accent: 'hover:border-[var(--nui-accent,oklch(51.1%_.262_276.966))] dark:hover:border-[var(--nui-accent-dark,oklch(58.5%_.233_277.117))]',
} as const;

/** Líneas divisorias de listas y tablas. */
export const divide = {
  base:   'divide-[var(--nui-border-subtle,oklch(92.8%_.006_264.531))] dark:divide-[var(--nui-border-subtle-dark,oklch(37.3%_.034_259.733))]',
} as const;

/** Color de la separación entre el control y su anillo de foco. */
export const ringOffset =
  'focus:ring-offset-2 focus:ring-offset-[var(--nui-ring-offset,oklch(98.5%_.002_247.839))] ' +
  'dark:focus:ring-offset-[var(--nui-ring-offset-dark,oklch(21%_.034_264.665))]';

/** Anillo de foco completo, listo para pegar en cualquier control. */
export const focusRing =
  'focus:outline-none focus:ring-2 focus:ring-[var(--nui-ring,oklch(58.5%_.233_277.117))] ' +
  'dark:focus:ring-[var(--nui-ring-dark,oklch(67.3%_.182_276.935))]';

/** Anillo de foco teñido con el color de cada variante. */
export const focusRingOf = {
  danger:  'focus:outline-none focus:ring-2 focus:ring-[var(--nui-danger,oklch(57.7%_.245_27.325))] dark:focus:ring-[var(--nui-danger-dark,oklch(63.7%_.237_25.331))]',
  success: 'focus:outline-none focus:ring-2 focus:ring-[var(--nui-success,oklch(62.7%_.194_149.214))] dark:focus:ring-[var(--nui-success-dark,oklch(72.3%_.219_149.579))]',
  warning: 'focus:outline-none focus:ring-2 focus:ring-[var(--nui-warning,oklch(68.1%_.162_75.834))] dark:focus:ring-[var(--nui-warning-dark,oklch(79.5%_.184_86.047))]',
} as const;

/** Fondos sólidos en `hover:` para las variantes semánticas. */
export const bgHoverOf = {
  success: 'hover:bg-[color-mix(in_oklab,var(--nui-success,oklch(62.7%_.194_149.214))_85%,black)] dark:hover:bg-[var(--nui-success,oklch(62.7%_.194_149.214))]',
  warning: 'hover:bg-[color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_85%,black)] dark:hover:bg-[var(--nui-warning,oklch(68.1%_.162_75.834))]',
} as const;

/** Igual que `focusRing` pero solo con teclado. */
export const focusVisibleRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nui-ring,oklch(58.5%_.233_277.117))] ' +
  'dark:focus-visible:ring-[var(--nui-ring-dark,oklch(67.3%_.182_276.935))]';

/** Anillo del acento en `focus:ring-*` sin el resto del bloque. */
export const ringAccent =
  'ring-[var(--nui-ring,oklch(58.5%_.233_277.117))] dark:ring-[var(--nui-ring-dark,oklch(67.3%_.182_276.935))]';

/** Todo junto, por comodidad al importar. */
export const t = { bg, bgHover, bgHoverOf, text, textHover, border, borderHover, borderSoft, divide, placeholder, focusBorder, ringOffset, focusRing, focusRingOf, focusVisibleRing, ringAccent } as const;
