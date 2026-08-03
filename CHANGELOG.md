# Changelog

## 3.0.3

Deuda técnica: animaciones que no seguían al sistema, un temporizador suelto y
dependencias que sobraban.

### `sweetalert2` pasa a ser opcional

- **`sweetalert2-react-content` sale de las peer dependencies.** No lo importaba
  ni una línea de la librería; se estaba obligando a instalarlo a todo el mundo.
- `sweetalert2` queda como peer **opcional**: solo hace falta si usas las
  funciones `Alerta*` o `InfoAlert`. Quien solo quiera un `<Button>` ya no tiene
  que instalarlo.

Si tu gestor de paquetes es estricto con el lockfile, quizá tengas que
reinstalar. No hay cambios en el código de las alertas.

### El interruptor de animaciones ya funciona en toda la librería

`applyMotion(false)`, `<ThemeProvider animations={false}>` y `--nui-duration`
solo llegaban a una parte de los componentes. **24 transiciones estaban escritas
a mano**, con la duración fija y sin `motion-reduce`, así que ignoraban tanto el
interruptor como `prefers-reduced-motion` del sistema.

Ahora todas pasan por `motion.ts`. Afecta a `Button`, `Input`, `TextArea`,
`Select`, `Table`, `Pagination`, `Calendar`, `DatePicker`, `InfoAlert`,
`ThemeToggle`, y a `Toolbar`, `FloorTabs` y `PropertiesPanel` del editor de
mapas.

- **Nuevo fragmento `motion.control`** para los controles que animan color,
  sombra y escala a la vez — los botones. Hacía falta uno solo porque dos clases
  `transition-*` compiten por la misma propiedad CSS y solo se aplicaría una.
- `Button` acepta la prop `animate`, como el resto de componentes que animan.
- Las duraciones por defecto no cambian donde eran 200 ms; los controles de
  formulario y las filas de tabla pasan a 120 ms, la duración corta de la
  librería. `transition-all` desaparece: ya no se animan cambios de layout.

### `Modal`

- El cierre esperaba **300 ms fijos**, que no coincidían con los 200 ms de
  `--nui-duration` y se esperaban igual con `animate={false}`. Ahora lee la
  duración real y con `animate={false}` cierra al instante.
- Ese temporizador no se cancelaba al desmontar: cerrar y desmontar a la vez
  dejaba un `onClose` en vuelo sobre un componente que ya no existía.
- Acepta `className` para el panel. Era el único componente de `html/` que no la
  tenía.

### Otros

- `Alerta` acepta `showConfirmButton`. Antes se calculaba a partir de `toast` y
  `timer` y **anulaba en silencio** lo que pidiera el llamante. El valor por
  defecto es el de siempre.
- Se exportan los tipos `ButtonProps`, `ModalProps` y `AlertaOptions`, que no
  estaban disponibles para tipar wrappers.
- `genId()` ya no revienta donde no existe `crypto.randomUUID()` — HTTP que no
  sea localhost, Safari anterior a 15.4. Se llevaba por delante el
  `VenueMapEditor` entero.
- `ThemeProvider` memoiza el valor del contexto: dejaba de renderizar a todos
  los consumidores de `useTheme` en cada render.
- Eliminadas las clases `swal-*` de las alertas, que apuntaban a un CSS que esta
  librería nunca ha enviado, y las constantes `DURATION_VAR` /
  `DURATION_FAST_VAR`, que no se usaban ni se exportaban.

## 3.0.2

Arreglo de colores en modo oscuro. Con la paleta por defecto casi no se nota;
si has retematizado la librería, sí.

### Hover que no seguía al tema oscuro

Tres grupos de tokens usaban en `dark:` la variable del tema **claro**. Quien
declarara solo las variables `-dark` veía el color saltar al del tema claro al
pasar el ratón por encima:

- `bgHoverOf.success` / `.warning` — los botones `variant="success"` y
  `variant="warning"`. Además, en claro el color se mezclaba con negro por
  `color-mix`, lo que ignoraba por completo tu color.
- `textHover.accent` / `.danger` — apuntaban en oscuro al **mismo** token que en
  reposo, así que el hover sencillamente no se veía.
- `focusBorder.accent` / `.danger` — no tenían variante `dark:` en absoluto: el
  borde al enfocar usaba el color claro sobre fondo oscuro.

### Cuatro tokens nuevos

La causa de fondo era que faltaban pares de hover, que `danger` sí tenía:

| Token | Claro / Oscuro |
|---|---|
| `success-hover` | green-700 / green-600 |
| `warning-hover` | yellow-700 / yellow-600 |
| `accent-text-hover` | indigo-700 / indigo-300 |
| `danger-text-hover` | red-700 / red-300 |

Son aditivos: si no declaras nada, los colores por defecto no cambian.

### `Skeleton` con más contraste en claro

Los marcadores de carga usaban `surface-muted`, que en claro es gray-50: a 1,5
puntos de luminosidad del blanco del panel, prácticamente invisibles. En oscuro
sí funcionaban (gray-700 sobre gray-800 son 9,5 puntos).

Ahora tienen token propio, `skeleton` (gray-200 / gray-700), que iguala el
contraste en los dos temas y además permite ajustarlo. El modo oscuro no cambia.

Afecta a `Skeleton`, a `SkeletonText` y a las filas de carga de `Table`, que
tenían su propia copia del mismo bloque gris.

**Convención nueva, documentada en el README:** en claro un `*-hover` oscurece el
color de reposo, y en oscuro lo **aclara** — oscurecer sobre fondo oscuro se lee
como «desactivado», no como «encima». Si sobrescribes una variable `*-hover`,
sobrescribe también su `-dark`.

## 3.0.1

Release de empaquetado: no cambia ni una línea de los componentes, pero el
paquete pesa una cuarta parte.

### Empaquetado

- **El paquete pasa de 1,6 MB a 384 kB** (7,1 MB → 1,6 MB desempaquetado).
- Las 9 entradas ahora comparten código en vez de duplicarlo. Antes, mezclar
  `import { Button } from 'neogestify-ui-components'` con
  `import { SaveIcon } from 'neogestify-ui-components/icons'` se llevaba dos
  copias completas de los iconos y del sistema de temas; ahora hay una sola.
- Se dejan de publicar los sourcemaps, que eran la mayor parte del peso.
- `sideEffects: false`, para que los bundlers puedan descartar lo que no uses.
- `prepublishOnly` reconstruye `dist` antes de publicar. Como `dist` está en
  `.gitignore`, hasta ahora un build obsoleto podía salir a npm sin aviso.

### Nueva subruta

- `neogestify-ui-components/element-library-builder`. Ya se compilaba y se
  publicaba, pero no estaba declarada en `exports`, así que solo era alcanzable
  desde la raíz.
- El README documenta ahora **todas** las subrutas disponibles, que hasta ahora
  no aparecían en ningún sitio.

### Interno

- Eliminado `.npmignore`, que contradecía al campo `files` (excluía `src/`, que
  es justo lo que Tailwind necesita escanear).
- Eliminado el campo `exports-tailwind`, que no era estándar y no hacía nada.

## 3.0.0

Four things landed in this release: a calendar, a colour system, a batch of new
components, and animations with an off switch. Plus an accessibility pass over
what already existed.

### Configurable colours

Every colour in the library is now a CSS variable with the previous colour as
its fallback, so **an existing project needs no changes** and a new one can
retint everything by declaring a handful of variables.

```css
:root {
  --nui-accent: #059669;       /* light */
  --nui-accent-dark: #10b981;  /* dark  */
}
```

- 30 semantic tokens: surfaces, borders, text, accent, semantic colours, scrim.
  Full table in the README.
- JavaScript API: `<ThemeProvider colors={{ light, dark }}>`, plus
  `applyNuiColors()`, `nuiColorsToCss()` (for SSR) and `resolveColor()`.
- `VenueMapEditor` gained a `palette` prop for the SVG canvas, which can't use
  Tailwind classes. It merges with the active theme's palette.
- The SweetAlert2 alerts read the variables at call time — background, text and
  button colours all follow.
- New subpath: `neogestify-ui-components/tokens`.
- Fallback values are the exact OKLCH values from Tailwind v4, so nothing
  drifts.

**Shade normalisation.** Around 78 elements in light mode and 69 in dark shifted
by one step. The old code painted the same semantic role with different greys
depending on the file — row hover was `gray-50` in a table, `gray-100` in a
button and `slate-100` in the map editor. They are now one colour. The visible
cases: the secondary button's text (`gray-600` → `gray-500`), the `ThemeToggle`
background (`gray-200` → `gray-50`), table headers (`gray-100` → `gray-50`), the
map editor accent (blue → the library accent) and the focus ring on
`danger`/`success`/`warning` buttons, which now matches the button's own colour.
Any of these can be pinned back with a variable.

### Calendar and DatePicker

A dependency-free calendar built for touch.

- Three modes: single date, multiple dates, and ranges.
- 40 px cells (48 with `size="lg"`), swipe to change month, quick month/year
  grids.
- Measures **its own container**: under 640 px it always renders one month,
  whatever `numberOfMonths` says.
- `DatePicker` opens as a floating panel on desktop and a full-width bottom
  sheet under 640 px of viewport.
- Ranges: continuous pill-shaped band, hover preview, `minRangeDays` /
  `maxRangeDays`, and `rangePresets()` shortcuts.
- Full keyboard support: arrows, Home/End, PageUp/Down, Shift+PageUp for years.
- Date helpers exported (`startOfDay`, `addMonths`, `diffDays`, `toISODate`…),
  all local-time.
- New subpath: `neogestify-ui-components/calendar`.

### New components

| Component | Notes |
|-----------|-------|
| `Card` + `CardHeader` / `CardBody` / `CardFooter` | Header, footer, media, interactive and link modes |
| `Avatar` / `AvatarGroup` | Image → initials → icon fallback; stable tint per name; status dot |
| `Badge` | 8 variants, dot, pill, removable |
| `Alert` | Inline notice, 5 variants, dismissible, actions |
| `Skeleton` / `SkeletonText` | Text, circle, rect; multi-line |
| `Progress` | Determinate and indeterminate |
| `Tabs` | Full `tablist` pattern; line, pill and enclosed variants |
| `Accordion` | Single and multiple; arrow-key navigation; panels stay mounted so they can animate |
| `Breadcrumb` | Collapses the middle, not the ends |
| `Pagination` | Numeric and compact; `pageRange()` exported |
| `Switch` | `role="switch"`; hidden input for forms |
| `Tooltip` | Portal + fixed positioning; press-and-hold on touch |

### Animations

Everything with a spatial transformation now animates, and it can be switched
off globally or per component.

- One CSS variable drives it: `--nui-duration` (200 ms) and
  `--nui-duration-fast` (120 ms).
- Global: `<ThemeProvider animations={false}>`, `applyMotion(false)`, or the
  variables in your own CSS. `motionToCss()` for SSR.
- Per component: the `animate` prop. It writes the same variable inline, so it
  cascades to everything inside.
- `prefers-reduced-motion` is respected regardless, via
  `motion-reduce:transition-none` on every transition.
- `Accordion` animates to its real height with `grid-template-rows: 0fr → 1fr`,
  and gets `inert` while collapsed so the hidden panel stays out of the tab
  order.
- `Tabs` grew a sliding underline that resizes between tabs.
- `Modal`, `DatePicker` (panel and sheet) and `Tooltip` moved from keyframes to
  transitions, which removed the injected `<style>` tags.

### Icons

Nine new: `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronUpIcon`, `UserIcon`,
`WarningIcon`, `ErrorIcon`, `SlashIcon`, `RingSpinnerIcon`,
`QuarterSpinnerIcon`.

**Every inline SVG now lives in `icons.tsx`.** Components import from the shared
collection instead of defining their own, so swapping an icon changes it
everywhere. The only SVGs left outside are the map editor's canvas and the
dynamic shape previews, which render user-supplied markup.

### Accessibility

Found and fixed during a review pass over the existing code:

- **Invisible keyboard focus.** The map editor drew no focus indicator at all,
  and the floor-rename input had `outline-none` with no replacement. Added a
  shared `focus-visible` ring across `Toolbar`, `PropertiesPanel`, `FloorTabs`
  and `ElementLibraryBuilder`.
- **Floor tabs were unreachable by keyboard** — plain `<div onClick>` with no
  `tabIndex`. They are now a proper `tablist` with `aria-selected`, roving
  tabindex, arrow/Home/End navigation and F2 to rename.
- **Modal had no focus trap.** `<dialog open>` is not modal: the background was
  still tabbable. Added `aria-modal`, `aria-labelledby`, initial focus, Tab
  containment and focus restore on close. The close button had no `aria-label`.
- **Contrast below AA.** Calendar outside-month days were `gray-400` on white
  (2.8:1) → `gray-500` (4.8:1); same for weekday headers and several editor
  greys.
- **Dark-mode gaps** in `ElementLibraryBuilder`: four spots stayed light grey on
  a dark background.
- **Missing `type="button"`** on 8 buttons that would have submitted a
  surrounding form.
- **Nested interactive element**: the `DatePicker` clear control was a
  `<span role="button">` inside the trigger button — invalid HTML that screen
  readers ignore. It is now a sibling.
- **Reduced motion**: `hover:scale-105` and the table skeleton's pulse are now
  `motion-safe:`. Loading spinners stay animated on purpose — a frozen spinner
  communicates nothing.

### Fixes

- **Modal header and footer were lighter than the panel in dark mode.** A
  regression from the token migration: they used to be `dark:bg-gray-800`
  (matching the panel) and got mapped to `surface-muted`, whose dark value is
  gray-700. A band lighter than its panel reads as raised, and a header is
  recessed, not raised. New `surface-band` token — gray-50 in light (the
  original value, so nothing changes there) and gray-900 in dark. Applied to the
  modal's header and footer and to the card footer, which had the same problem.

### Responsive fixes

- **`Tabs` could break the page layout.** Its bar doesn't wrap, so its intrinsic
  minimum width is that of every tab together. As a grid or flex item that
  forced the whole track wider than the viewport instead of letting the bar
  scroll — measured at 403 px inside a 371 px column. Fixed with `min-w-0` on
  the root: in a 300 px grid it now stays at 300 px and scrolls.
- **`Pagination` overflowed on narrow screens** with many pages. It wraps now.
  `compact` is still the better choice on mobile.
- **`Accordion`** long `meta` text is capped at 40 % and truncates instead of
  squeezing the title.
- **Showcase**: page padding, section padding and headings now scale with the
  breakpoint instead of using desktop values everywhere; the icon grid goes
  3 → 4 → 6 columns; the header wraps; and grid columns carry `min-w-0` so
  non-wrapping content can't inflate a track.

### Documentation

- **Framework guides**: Vite, Next.js (App Router and Pages Router), Astro,
  Remix/React Router, plus a table for CRA, Gatsby, pnpm monorepos, Tailwind 3.x
  and CDN. Two recurring gotchas are spelled out: the `@source` path is relative
  to the CSS file, and the package carries no `"use client"` banner, so the App
  Router needs a client component.
- New README sections for theming, animations, the calendar and all the new components.

### Notes

- No breaking API changes. The major bump reflects the shade normalisation and
  the new subpaths.
- The library still ships no CSS: components use Tailwind classes and your
  project compiles them.
