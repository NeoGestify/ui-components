# Changelog

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
