# UI Components

Reusable UI component library built with React, Tailwind CSS and SweetAlert2.

## Features

- Pre-styled HTML components (Button, Input, TextArea, Form, Select, Table, Modal, Loading)
- Presentation components (Card, Avatar, Badge, Alert, Skeleton, Progress)
- Navigation components (Tabs, Accordion, Breadcrumb, Pagination) with full keyboard support
- Controls (Switch, Tooltip)
- **Animations** on everything that moves, switchable globally and per component
- SVG icon collection (80+ icons)
- Preconfigured SweetAlert2 alerts + InfoAlert component
- Theme system (light/dark) with a Context Provider
- **Configurable colors**: every color is a CSS variable you can override — no CSS import, no config file
- Interactive venue map editor (VenueMapEditor/VenueMapViewer) with full touch support (pinch-zoom, two-finger pan)
- Element library builder (ElementLibraryBuilder)
- Mobile-friendly calendar and date picker (Calendar/DatePicker) with single, multiple and range selection
- Light/dark mode support
- TypeScript included
- Compatible with Tailwind CSS 4.x

## Installation

### NPM
```bash
npm i neogestify-ui-components
```

### BUN
```bash
bun add neogestify-ui-components
```

## Setup

### 1. Make sure Tailwind CSS is set up in your project

```bash
bun add -D tailwindcss
```

Your project must have Tailwind configured, since the components only use Tailwind classes (no compiled CSS is shipped).

### 2. Configure Tailwind to scan the library's source

**⚠️ IMPORTANT:** This library requires Tailwind to scan its source files.

In your main CSS file (e.g. `src/index.css`):

```css
@import "tailwindcss";

@source "../node_modules/neogestify-ui-components/src";

@theme {
    /* Tailwind v4 dark mode configuration */
}

@variant dark (&:where(.dark, .dark *)) {
    /* dark mode variant */
}
```

**Add this script to your index.html**
```html
<script>
      // Prevent flash of unstyled content (FOUC)
      const theme = localStorage.getItem('theme') || 'light';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
</script>
```

### 3. Install the peer dependencies

```bash
bun add react react-dom sweetalert2 sweetalert2-react-content
```

---
---

## Theming (custom colors)

Every color in the library is a CSS variable with the current color as its
fallback, so **an existing project keeps working with zero changes** and a new
one can retint the whole library by declaring a handful of variables.

### The quick version

```css
/* your stylesheet — nothing to import from the library */
:root {
  --nui-accent:            #059669;   /* light theme */
  --nui-accent-hover:      #047857;
  --nui-accent-text:       #059669;
  --nui-accent-soft:       #ecfdf5;

  --nui-accent-dark:       #10b981;   /* dark theme  */
  --nui-accent-hover-dark: #059669;
  --nui-accent-text-dark:  #34d399;
  --nui-accent-soft-dark:  rgb(16 185 129 / .18);
}
```

Buttons, inputs, calendar, tabs, focus rings and the map editor chrome all
follow. Anything you don't declare keeps its default.

The naming rule is always the same: `--nui-<token>` for the light theme,
`--nui-<token>-dark` for the dark one. Values can be any CSS color — hex,
`rgb()`, `oklch()`, `color-mix()`.

### From JavaScript

Useful when the colors come from an API or from user settings:

```tsx
import { ThemeProvider } from 'neogestify-ui-components';

<ThemeProvider colors={{
  light: { accent: '#059669', 'accent-hover': '#047857' },
  dark:  { accent: '#34d399' },
}}>
  <App />
</ThemeProvider>
```

Or imperatively, outside React:

```ts
import { applyNuiColors, nuiColorsToCss, resolveColor } from 'neogestify-ui-components';

const undo = applyNuiColors({ light: { accent: '#059669' } });  // returns an undo fn
nuiColorsToCss({ light: { accent: '#059669' } });               // ":root{--nui-accent:#059669}" — for SSR
resolveColor('accent');                                          // the color actually in effect right now
```

For SSR, put `nuiColorsToCss(...)` in a `<style>` in your `<head>` so the colors
are right on the first paint instead of after hydration.

### Tokens

| Token | Role | Default (light / dark) |
|-------|------|------------------------|
| `surface` | Cards, panels, inputs | white / gray-800 |
| `surface-muted` | Headers, footers, prefixes | gray-50 / gray-700 |
| `surface-hover` | Row and button hover | gray-100 / gray-700 |
| `surface-sunken` | Page background | gray-100 / gray-900 |
| `surface-band` | Header and footer bands **inside** a panel (modal, card) | gray-50 / gray-900 |
| `surface-inverted` | Inverted table header | gray-800 / gray-900 |
| `border` | Field borders | gray-300 / gray-600 |
| `border-subtle` | Separators, dividers | gray-200 / gray-700 |
| `text` | Main text | gray-900 / white |
| `text-muted` | Labels, cells | gray-700 / gray-300 |
| `text-subtle` | Helper text, placeholders | gray-500 / gray-400 |
| `text-faint` | Decorative icons | gray-400 / gray-500 |
| `accent` | Primary buttons, selection | indigo-600 / indigo-500 |
| `accent-hover` | Accent hover | indigo-700 / indigo-600 |
| `accent-fg` | Text on accent | white / white |
| `accent-text` | Accent-coloured text | indigo-600 / indigo-400 |
| `accent-soft` | Tints (range band, chips) | indigo-50 / indigo-500 15 % |
| `accent-subtle` | Accent borders | indigo-100 / indigo-800 |
| `ring` / `ring-offset` | Focus ring and its gap | indigo-500 / indigo-400 |
| `danger`, `danger-hover`, `danger-text`, `danger-subtle` | Errors, destructive actions | red |
| `success`, `success-text` | Confirmation | green |
| `warning`, `warning-text` | Warnings | yellow |
| `info`, `info-text` | Information | blue |
| `scrim` | Modal/overlay backdrop | gray-900 |

Import `NUI_DEFAULTS` if you need the exact default values.

### The map canvas

The editor's SVG can't use Tailwind classes in `fill`/`stroke`, so its colors
travel through a prop instead. It merges with the active theme's palette, so you
only pass what you want to change:

```tsx
<VenueMapEditor
  palette={{
    light: { accent: '#059669', gridMinor: '#e7f5ee' },
    dark:  { accent: '#34d399' },
  }}
/>
```

Available keys: `canvasBg`, `gridMinor`, `gridMajor`, `artboardFill`,
`artboardStroke`, `artboardShadowOpacity`, `wallFill`, `wallStroke`,
`wallMaterials` (per material, merged one by one), `accent`, `handleFill`,
`label`, `previewFill`. `VENUE_PALETTES` and `resolvePalette` are exported if
you'd rather start from the defaults.

### Alerts

The SweetAlert2 alerts paint their own DOM outside Tailwind, so they read the
variables at call time: background from `surface-muted`, text from `text`,
buttons from `accent` / `danger`. Nothing to configure — set the variables and
the alerts follow.

### Contrast

The library can't validate the colors you pick. Keep at least 4.5:1 on these
pairs: `text` over `surface`, `accent-fg` over `accent`, `accent-text` over
`surface`, and `text-subtle` over `surface`.


## Framework guides

The library ships **prebuilt** ESM + CJS + types, so no framework needs to
transpile it. Two things are always true, whatever the stack:

1. **Tailwind must scan the library's source.** The `@source` path is resolved
   **relative to the CSS file** where you write it — that is what changes from
   one framework to the next.
2. **The components are client-side.** They use `useState`, `useEffect`,
   `ResizeObserver`, pointer events and (for the alerts) SweetAlert2, so they
   need to run in the browser.

### Vite (React)

`src/index.css`:

```css
@import "tailwindcss";
@source "../node_modules/neogestify-ui-components/src";
@variant dark (&:where(.dark, .dark *));
```

Nothing else: `vite.config.ts` only needs `@tailwindcss/vite` and
`@vitejs/plugin-react`.

### Next.js (App Router)

`app/globals.css` — note the path only goes up **one** level:

```css
@import "tailwindcss";
@source "../node_modules/neogestify-ui-components/src";
@variant dark (&:where(.dark, .dark *));
```

The package has no `"use client"` banner, so **import it from a Client
Component**. Either mark your own component:

```tsx
'use client';
import { Button, Calendar, VenueMapEditor } from 'neogestify-ui-components';

export function BookingForm() {
  return <Calendar mode="range" />;
}
```

…or re-export the pieces you use once, and import that file everywhere:

```tsx
// components/ui.ts
'use client';
export { Button, Input, Modal, Calendar, DatePicker } from 'neogestify-ui-components';
```

`VenueMapEditor` and `ElementLibraryBuilder` measure the DOM on mount, so if
you hit a hydration mismatch, load them without SSR:

```tsx
'use client';
import dynamic from 'next/dynamic';

const VenueMapEditor = dynamic(
  () => import('neogestify-ui-components').then(m => m.VenueMapEditor),
  { ssr: false },
);
```

Avoid the flash of the wrong theme by setting the class before React hydrates —
in `app/layout.tsx`:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

Install with `@tailwindcss/postcss` (Next.js compiles CSS through PostCSS):

```bash
npm i neogestify-ui-components react react-dom sweetalert2 sweetalert2-react-content
npm i -D tailwindcss @tailwindcss/postcss
```

```js
// postcss.config.mjs
export default { plugins: { '@tailwindcss/postcss': {} } };
```

### Next.js (Pages Router)

Same CSS, imported from `pages/_app.tsx`. There are no Server Components here,
so no `'use client'` is needed — but `next/dynamic` with `ssr: false` still
applies to the map editor. The anti-flash script goes in `pages/_document.tsx`,
inside `<Head>`.

### Astro

```bash
npm create astro@latest
npx astro add react
npm i neogestify-ui-components sweetalert2 sweetalert2-react-content
npm i -D tailwindcss @tailwindcss/vite
```

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
```

`src/styles/global.css` — from `src/styles/` you go up **two** levels:

```css
@import "tailwindcss";
@source "../../node_modules/neogestify-ui-components/src";
@source "../../src";
@variant dark (&:where(.dark, .dark *));
```

Astro renders islands as static HTML by default, so every component needs a
**client directive** or it will not be interactive:

```astro
---
import '../styles/global.css';
import { Calendar } from 'neogestify-ui-components';
import { VenueMapEditor } from 'neogestify-ui-components';
---
<Calendar client:load mode="range" />
<VenueMapEditor client:only="react" height="520px" />
```

Use `client:only="react"` for `VenueMapEditor` / `ElementLibraryBuilder`: they
measure their container, so there is nothing useful to prerender.

### Remix / React Router v7

Vite-based, so the CSS setup is the Vite one. Import the stylesheet from
`app/root.tsx` and, since these components are browser-only, either render them
inside a `<ClientOnly>` boundary or guard with a mounted flag:

```tsx
import styles from './tailwind.css?url';
export const links = () => [{ rel: 'stylesheet', href: styles }];
```

### TanStack Start

Vite-based, so the CSS setup is the Vite one. Import the stylesheet from the
root route (`src/routes/__root.tsx`).

It does SSR, and these components are browser-only: wrap them in `clientOnly`
or mount them after the first render.

```tsx
import { clientOnly } from '@tanstack/react-router';

const VenueMapEditor = clientOnly(() =>
  import('neogestify-ui-components').then(m => ({ default: m.VenueMapEditor })),
);
```

### Storybook

With the Vite builder, add the Tailwind plugin and import the CSS from
`preview`:

```ts
// .storybook/main.ts
import tailwindcss from '@tailwindcss/vite';

export default {
  framework: '@storybook/react-vite',
  viteFinal: async config => {
    config.plugins?.push(tailwindcss());
    return config;
  },
};
```

```ts
// .storybook/preview.ts
import '../src/index.css';
```

For dark mode, put the class on a global decorator:

```tsx
export const decorators = [
  (Story, ctx) => (
    <div className={ctx.globals.theme === 'dark' ? 'dark' : ''}>
      <Story />
    </div>
  ),
];
```

### Other setups

| Stack | What to do |
|-------|------------|
| **Create React App / Craco** | Tailwind v4 needs PostCSS: add `@tailwindcss/postcss` to `postcss.config.js`. The `@source` path from `src/index.css` is `../node_modules/neogestify-ui-components/src` |
| **Gatsby** | Same as CRA, plus `gatsby-plugin-postcss` |
| **Monorepo (pnpm / workspaces)** | `node_modules` may be hoisted. Point `@source` at the real folder, e.g. `@source "../../../node_modules/neogestify-ui-components/src"`, or use the package root: `@source "../node_modules/.pnpm/**/neogestify-ui-components/src"` |
| **Tailwind CSS 3.x** | There is no `@source`; add the path to `content` in `tailwind.config.js`: `content: ['./src/**/*.{ts,tsx}', './node_modules/neogestify-ui-components/src/**/*.{ts,tsx}']` and set `darkMode: 'class'` |
| **No bundler / CDN** | Not supported: the package is distributed as ESM/CJS modules and expects a bundler |

### Checklist when classes don't show up

1. Is the `@source` path right **relative to the CSS file**? A wrong path fails
   silently — the components render unstyled.
2. Did you restart the dev server after touching the CSS? `@source` is read once
   at startup.
3. Is the `dark` variant declared? Without `@variant dark (&:where(.dark, .dark *))`
   every `dark:` class in the library is dead code.
4. Is `sweetalert2` installed? It is a peer dependency, not a bundled one.


## Usage

Import everything from a single entry point:

```tsx
import {
  Button,
  Input,
  TextArea,
  Form,
  Select,
  Table,
  Modal,
  Loading,
  // Icons
  HomeIcon,
  SaveIcon,
  DeleteIcon,
  // Alerts
  AlertaExito,
  AlertaError,
  AlertaAdvertencia,
  AlertaConfirmacion,
  AlertaToast,
  AlertaInfo,
  InfoAlert,
  // Theme
  ThemeProvider,
  useTheme,
  ThemeToggle,
  // VenueMapEditor
  VenueMapEditor,
  VenueMapViewer,
  // ElementLibraryBuilder
  ElementLibraryBuilder,
  // Presentation
  Card, CardHeader, CardBody, CardFooter,
  Avatar, AvatarGroup,
  Badge,
  Alert,
  Skeleton, SkeletonText,
  Progress,
  // Navigation
  Tabs,
  Accordion,
  Breadcrumb,
  Pagination,
  // Controls
  Switch,
  Tooltip,
  // Calendar
  Calendar,
  DatePicker,
  rangePresets,
  // Theming
  applyNuiColors,
  applyMotion,
  nuiColorsToCss,
  resolveColor,
  NUI_DEFAULTS,
} from 'neogestify-ui-components';
```

> **Note:** the alert functions keep their original Spanish names (`AlertaExito`,
> `AlertaError`, …) as part of the public API.

---

## HTML Components

### Button

Variants: `primary`, `secondary`, `danger`, `success`, `warning`, `outline`, `ghost`, `icon`, `nav`, `link`, `toggle`, `custom`

```tsx
<Button variant="primary" size="lg" isLoading loadingText="Saving...">
  Save
</Button>

<Button variant="ghost" leftIcon={<SaveIcon className="w-4 h-4" />}>
  Export
</Button>

<Button variant="primary" fullWidth shape="pill">
  Continue
</Button>

<Button variant="toggle" isActive={active} onClick={toggle}>
  Toggle
</Button>
```

Props:
- `variant`: Button variant (`primary` | `secondary` | `icon` | `danger` | `success` | `outline` | `ghost` | `nav` | `custom` | `link` | `warning` | `toggle`)
- `size`: Size (`'sm'` | `'md'` | `'lg'`). Default: `'md'`
- `shape`: Border shape (`'rounded'` | `'pill'` | `'square'`). Default: `'rounded'` (`'pill'` for `icon`)
- `leftIcon`: Icon before the text (ReactNode)
- `rightIcon`: Icon after the text (ReactNode)
- `fullWidth`: Takes 100% width (boolean)
- `isLoading`: Shows a loading state (boolean)
- `loadingText`: Text shown while loading
- `isActive`: Active state for the `toggle` or `nav` variant (boolean)
- `disabled`: Disables the button
- `type`: HTML type (`button`, `submit`, `reset`)
- `className`: Extra classes
- `children`: Button content

---

### Input

Supports types: `text`, `email`, `password`, `number`, `checkbox`, `radio`, `date`, `tel`, `url`, `file`

```tsx
<Input
  label="Email"
  type="email"
  required
  error="Invalid email"
  helperText="Enter your email address"
/>

{/* Visual variants */}
<Input label="Name" variant="filled" size="lg" />
<Input label="Search" variant="minimal" />

{/* With icon */}
<Input
  label="Search"
  icon={<SearchIcon className="w-4 h-4" />}
  iconSide="left"
/>

{/* Text addons (prefix / suffix) */}
<Input label="Price" prefix="$" suffix="USD" />
<Input label="Website" prefix="https://" suffix=".com" />

{/* Clearable */}
<Input
  label="Filter"
  value={filter}
  onChange={e => setFilter(e.target.value)}
  clearable
  onClear={() => setFilter('')}
/>

{/* Checkbox */}
<Input type="checkbox" label="I accept the terms" />
```

Props:
- `label`: Field label (string | ReactNode)
- `type`: HTML input type (`text`, `email`, `password`, `number`, `checkbox`, `radio`, `date`, `tel`, `url`, `file`)
- `variant`: Visual variant (`'default'` | `'outline'` | `'filled'` | `'minimal'`). Default: `'default'`
- `size`: Size (`'sm'` | `'md'` | `'lg'`). Default: `'md'`
- `prefix`: Addon attached to the left edge (ReactNode)
- `suffix`: Addon attached to the right edge (ReactNode)
- `clearable`: Shows a `×` button to clear when there is a value (boolean)
- `onClear`: Callback when the clear button is clicked
- `placeholder`: Placeholder
- `value`: Controlled value
- `onChange`: Change handler
- `error`: Error message (string)
- `helperText`: Helper text
- `icon`: Icon to display (ReactNode)
- `iconSide`: Icon side (`'left'` | `'right'`)
- `required`: Shows a `*` on the label (boolean)
- `disabled`: Disabled
- `className`: Extra classes
- `id`: Input ID (auto-generated if omitted)

> Native widgets (the date picker calendar, number spinners) follow the active
> theme via `color-scheme`, so they no longer render light-on-light in dark mode.

---

### TextArea

```tsx
<TextArea
  label="Description"
  placeholder="Write a description..."
  variant="outline"
  size="large"
  autoResize
/>

{/* With character counter */}
<TextArea
  label="Bio"
  value={bio}
  onChange={e => setBio(e.target.value)}
  maxLength={200}
  showCount
  variant="filled"
/>

{/* No resize */}
<TextArea label="Notes" resize="none" rows={4} />
```

Props:
- `label`: Label (string | ReactNode)
- `placeholder`: Placeholder
- `value`: Controlled value
- `onChange`: Change handler
- `rows`: Number of rows (inherited from HTML)
- `variant`: Visual variant (`'default'` | `'outline'` | `'filled'` | `'minimal'`)
- `size`: Size (`'small'` | `'medium'` | `'large'`)
- `autoResize`: Grows automatically as you type (boolean)
- `showCount`: Shows a character counter. With `maxLength` shows `12 / 200` (boolean)
- `resize`: Resize control (`'vertical'` | `'horizontal'` | `'both'` | `'none'`). Default: `'vertical'`
- `required`: Shows a `*` on the label (boolean)
- `error`: Error message
- `helperText`: Helper text
- `disabled`: Disabled
- `className`: Extra classes
- `id`: Textarea ID (auto-generated if omitted)

---

### Form

```tsx
{/* Card variant with real border and shadow */}
<Form onSubmit={handleSubmit} variant="card">
  <Input label="Name" placeholder="Your name" />
  <Input label="Email" type="email" />
  <Button variant="primary" type="submit">Submit</Button>
</Form>

{/* 2-column grid */}
<Form variant="card" columns={2}>
  <Input label="First name" />
  <Input label="Last name" />
  <Input label="Email" type="email" />
  <Input label="Phone" type="tel" />
  <Button variant="primary" type="submit" fullWidth>Register</Button>
</Form>

{/* 3-column grid */}
<Form columns={3}>
  <Input label="Street" />
  <Input label="City" />
  <Input label="Country" />
</Form>

<Form variant="inline">
  <Input label="Search" placeholder="..." />
  <Button variant="secondary">Search</Button>
</Form>
```

Props:
- `onSubmit`: Submit handler
- `variant`: Layout variant (`'default'` | `'modal'` | `'card'` | `'inline'` | `'compact'`)
  - `card`: includes a white/dark background, real border and shadow
- `columns`: Number of CSS grid columns (any integer ≥ 2 enables the grid layout with a `1rem` gap; `1` behaves like `default`)
- `className`: Extra classes
- Inherits `<form>` props (method, action, etc.)

---

### Select

```tsx
<Select
  label="Category"
  placeholder="Select..."
  required
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2', disabled: true },
    { value: '3', label: 'Option 3', selected: true },
  ]}
  error="You must select a category"
/>

{/* Visual variants */}
<Select label="Country" variant="outline" size="lg" />
<Select label="Status" variant="filled" />
<Select label="Type" variant="minimal" />

{/* With left icon */}
<Select
  label="Category"
  icon={<CategorieIcon className="w-4 h-4" />}
  options={options}
/>
```

Props:
- `label`: Label (string | ReactNode)
- `placeholder`: Placeholder
- `options`: Array of options:
  - `value`: Option value (string | number)
  - `label`: Display text
  - `disabled`: Disables the option (boolean)
  - `selected`: Pre-selects the option in uncontrolled mode (boolean)
- `variant`: Visual variant (`'default'` | `'outline'` | `'filled'` | `'minimal'` | `'custom'`). `'small'` is still accepted for backward compatibility (equivalent to `size='sm'`)
- `size`: Size (`'sm'` | `'md'` | `'lg'`). Default: `'md'`
- `icon`: Icon on the left side (ReactNode)
- `value`: Selected value (controlled)
- `onChange`: Change handler
- `error`: Error state. A `string` shows the message; `true` only applies error styles
- `helperText`: Helper text (shown when there is no `error` string)
- `required`: Shows a `*` on the label (boolean)
- `disabled`: Disables the select
- `className`: Extra classes
- `id`: Select ID (auto-generated if omitted)

> The native dropdown list follows the active theme via `color-scheme`, so it no
> longer opens with the system's light colors (or white-on-white on Chrome for
> Windows/Linux) when the app is in dark mode.

---

### Table

```tsx
<Table
  columns={[
    { header: 'ID', align: 'center', width: 60 },
    { header: 'Name', className: 'font-bold', sticky: true },
    { header: 'Email' },
    { header: 'Sales', key: 'sales', sortable: true, align: 'right' },
  ]}
  rows={[
    ['1', 'John', 'john@example.com', '$1,200'],
    ['2', 'Mary', 'mary@example.com', '$3,400'],
  ]}
  variant="striped"
  size="sm"
  rounded
  shadow
  onRowClick={(index) => console.log('Row click', index)}
  sortState={{ key: 'sales', direction: 'desc' }}
  onSort={(key) => console.log('Sort by', key)}
/>
```

#### Variants

| Variant | Description |
|----------|-------------|
| `default` | White background with horizontal dividers and gray hover |
| `striped` | Alternating gray/white rows with blue hover |
| `bordered` | Borders on every cell |
| `minimal` | No backgrounds, just a bottom line on header and cells |
| `ghost` | No backgrounds, double bottom border on header, subtle dividers |
| `card` | Header with a soft background, thin dividers between rows |
| `accent` | Blue header (`bg-blue-600`) with white text |
| `dark` | Dark header (`bg-gray-800`) with light text |
| `custom` | No predefined styles, full control via classes |

#### ColumnDef

```tsx
interface ColumnDef {
  header: ReactNode;           // Header content
  className?: string;          // Class for this column's th and td
  align?: 'left' | 'center' | 'right';
  width?: string | number;     // Fixed width (px, %, rem…)
  minWidth?: string | number;  // Minimum width
  sticky?: boolean;            // Pins the column to the left on horizontal scroll
  thStyle?: CSSProperties;     // Inline styles for <th> only
  tdStyle?: CSSProperties;     // Inline styles for <td> only
  sortable?: boolean;          // Shows a sort indicator (requires key)
  key?: string;                // Key used in sortState and onSort
}
```

#### Props

- `columns`: Array of `ColumnDef` or plain strings/ReactNode
- `rows`: Body data (`ReactNode[][]`)
- `variant`: Visual variant (see table above). Default: `'default'`
- `size`: Padding size (`'sm'` | `'md'` | `'lg'`). Default: `'md'`
- `className`: Extra classes for the wrapper `<div>`
- `tableClassName`: Extra classes for the `<table>`
- `thClassName`: Extra classes for each `<th>`
- `tdClassName`: Extra classes for each `<td>`
- `trClassName`: Classes per row (`string` | `(rowIndex: number) => string`)
- `emptyState`: Content shown when there is no data (ReactNode)
- `onRowClick`: Callback when a row is clicked (`(rowIndex) => void`)
- `hideHeader`: Hides the `<thead>` (boolean)
- `style`: Inline styles for the `<table>`
- `stickyHeader`: Pins the `<thead>` on vertical scroll (boolean)
- `caption`: Accessible caption rendered in `<caption>`
- `footerRows`: `<tfoot>` rows (`ReactNode[][]`)
- `loading`: Shows an animated skeleton instead of rows (boolean)
- `loadingRows`: Number of skeleton rows when `loading=true`. Default: `4`
- `getRowStyle`: Inline style per row (`(rowIndex: number) => CSSProperties`)
- `rounded`: Adds `rounded-lg` to the wrapper (boolean)
- `shadow`: Adds a shadow to the wrapper (boolean)
- `hoverable`: Disables the hover effect when `false`. Default: `true`
- `sortState`: Active sort state (`{ key: string, direction: 'asc' | 'desc' }`)
- `onSort`: Callback when a sortable `<th>` is clicked (`(key: string) => void`)

#### Additional examples

```tsx
{/* With loading skeleton */}
<Table columns={['Name', 'Email', 'Role']} rows={[]} loading loadingRows={5} />

{/* With totals footer */}
<Table
  columns={['Product', 'Quantity', 'Total']}
  rows={[['Keyboard', '2', '$60'], ['Mouse', '3', '$45']]}
  footerRows={[['', 'Total', '$105']]}
  variant="card"
  rounded
  shadow
/>

{/* Sticky header + sticky column + sort */}
<Table
  columns={[
    { header: '#', sticky: true, width: 50 },
    { header: 'Name', sticky: true },
    { header: 'Date', key: 'date', sortable: true },
    { header: 'Amount', key: 'amount', sortable: true, align: 'right' },
  ]}
  rows={data}
  stickyHeader
  sortState={sort}
  onSort={(key) => setSort(prev => ({ key, direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }))}
/>

{/* Dynamically colored rows */}
<Table
  columns={['Level', 'Message']}
  rows={logs.map(l => [l.level, l.message])}
  getRowStyle={(i) => logs[i].level === 'error' ? { background: '#fef2f2' } : {}}
  variant="minimal"
/>
```

---

### Modal

```tsx
const modalRef = useRef<ModalRef>(null);

<Modal
  ref={modalRef}
  title="Confirm action"
  size="md"
  variant="danger"
  closeOnBackdrop
  closeOnEsc
  onClose={() => setShowModal(false)}
  footer={
    <>
      <Button variant="secondary" onClick={() => modalRef.current?.handleClose()}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleConfirm}>
        Delete
      </Button>
    </>
  }
>
  <p>Are you sure you want to continue?</p>
</Modal>

{/* With title as ReactNode */}
<Modal
  title={<span className="flex items-center gap-2"><InfoIcon className="w-5 h-5" /> Information</span>}
  size="lg"
  onClose={onClose}
>
  {children}
</Modal>
```

#### Header variants

| Variant | Description |
|----------|-------------|
| `default` | Neutral gray header |
| `danger` | Red header for destructive actions |
| `success` | Green header for positive confirmations |
| `warning` | Yellow header for warnings |

#### Sizes

| Size | Max width |
|------|-------------|
| `sm` | `max-w-sm` |
| `md` | `max-w-md` |
| `lg` | `max-w-2xl` |
| `xl` | `max-w-4xl` |
| `full` | `95vw` |

Props:
- `title`: Modal title (string | ReactNode)
- `children`: Content
- `footer`: Footer content
- `onClose`: Close handler
- `size`: Predefined size (`'sm'` | `'md'` | `'lg'` | `'xl'` | `'full'`)
- `maxWidth`: Custom width class (deprecated, use `size`)
- `variant`: Header style (`'default'` | `'danger'` | `'success'` | `'warning'`)
- `closeOnBackdrop`: Close when clicking outside the modal (boolean, default: `false`)
- `closeOnEsc`: Close when pressing Escape (boolean, default: `false`)
- `showCloseButton`: Shows a close button (boolean, default: `true`)
- `zIndex`: Modal z-index (number, default: `50`)

Ref methods (`ModalRef`):
- `handleClose()`: Closes the modal with an animation

---

### Loading

```tsx
<Loading variant="spinner" size="large" color="primary" label="Loading..." />

<Loading variant="dots" size="medium" color="white" />
<Loading variant="pulse" size="small" color="success" />
<Loading variant="bars" size="xl" color="danger" />
<Loading variant="ring" color="warning" />
<Loading variant="cube" size="large" />

{/* Overlay over the container (the parent must be position: relative) */}
<div className="relative h-48">
  <MyContent />
  {loading && <Loading overlay variant="ring" color="primary" />}
</div>

{/* Full-page overlay */}
{loading && <Loading fullPage label="Processing..." />}
```

Props:
- `variant`: Loader variant (`'spinner'` | `'dots'` | `'pulse'` | `'bars'` | `'ring'` | `'cube'`)
- `size`: Size (`'small'` | `'medium'` | `'large'` | `'xl'`)
- `color`: Color (`'primary'` | `'white'` | `'gray'` | `'success'` | `'danger'` | `'warning'`)
- `label`: Text below the icon
- `overlay`: Covers the nearest `position: relative` container with a semi-transparent background (boolean)
- `fullPage`: `fixed` overlay covering the whole screen (`z-50`) (boolean)
- `className`: Extra classes

---
---

## Presentation Components

### Card

```tsx
<Card
  title="Monthly sales"
  description="Compared with last month"
  action={<Badge variant="success" dot>+12 %</Badge>}
  footer={<span className="text-xs">Updated 5 min ago</span>}
>
  <p className="text-3xl font-bold">48,320 EUR</p>
</Card>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'outlined' \| 'elevated' \| 'ghost' \| 'custom'` | `'default'` | Border and shadow |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Applies to every section |
| `title` / `description` / `action` | `ReactNode` | — | Header. A string `title` is wrapped in an `<h3>` |
| `footer` | `ReactNode` | — | Footer with a separator and a muted background |
| `media` | `ReactNode` | — | Full-bleed image above the header |
| `interactive` | `boolean` | `false` | Hover highlight, pointer cursor and keyboard focus |
| `href` | `string` | — | Renders as `<a>` and implies `interactive` |
| `fullHeight` | `boolean` | `false` | Fills the row height — for grids of uneven cards |

`CardHeader`, `CardBody` and `CardFooter` are exported for layouts the props
can't express.

### Avatar / AvatarGroup

Falls back in stages: image → initials → icon. Initials and the tint come from
`name`, and the tint is stable — the same person is always the same colour.

```tsx
<Avatar name="Ada Lovelace" src="/ada.jpg" status="online" />
<AvatarGroup max={4} avatars={[{ name: 'Ada' }, { name: 'Alan' }, …]} />
```

| Prop | Type | Default |
|------|------|---------|
| `src` / `name` / `alt` | `string` | — |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` |
| `shape` | `'circle' \| 'square'` | `'circle'` |
| `status` | `'online' \| 'offline' \| 'busy' \| 'away'` | — |
| `icon` / `ring` | `ReactNode` / `boolean` | — |

`AvatarGroup` takes `avatars`, `max` (default 4), `size` and `shape`. The
overflow becomes a `+N` chip. `initialsOf(name)` is exported too.

### Badge

```tsx
<Badge variant="success" dot>Active</Badge>
<Badge variant="accent" pill onRemove={() => remove(tag)}>{tag}</Badge>
```

`variant`: `neutral` (default), `accent`, `success`, `warning`, `danger`,
`info`, `outline`, `solid` · `size`: `sm | md | lg` · `dot` prefixes a coloured
dot · `pill` rounds it fully · `onRemove` adds a labelled close button.

### Alert

An **inline** notice, in the page flow — unlike the `Alerta*` functions, which
are SweetAlert2 dialogs that interrupt the user.

```tsx
<Alert variant="warning" title="Quota almost full" onClose={hide}
       actions={<Button size="sm" variant="outline">Upgrade</Button>}>
  You have used 92 % of your space.
</Alert>
```

`variant`: `info` (default), `success`, `warning`, `danger`, `neutral` ·
`title`, `icon` (`false` removes it), `onClose`, `actions`. The `danger`
variant uses `role="alert"` so it interrupts a screen reader; the rest use
`role="status"` and wait their turn.

### Skeleton

```tsx
<Skeleton variant="circle" width={40} />
<Skeleton lines={3} />
```

`variant`: `text` (default), `circle`, `rect`, `rounded` · `width`, `height`,
`lines` (the last one comes out shorter), `animated`. Marked `aria-hidden`:
announce loading on the container with `aria-busy`, not on every grey block.

### Progress

```tsx
<Progress value={72} label="Uploading" showValue />
<Progress indeterminate label="Processing…" variant="info" />
```

`value` / `max`, `variant` (`accent | success | warning | danger | info`),
`size` (`xs | sm | md | lg`), `label`, `showValue`, `indeterminate`,
`valueText`.

---

## Navigation Components

### Tabs

Full `tablist` pattern: roving tabindex, arrow keys, Home and End.

```tsx
<Tabs items={[
  { id: 'general', label: 'General', content: <Form /> },
  { id: 'security', label: 'Security', badge: <Badge size="sm" variant="danger">2</Badge>, content: <Security /> },
  { id: 'archived', label: 'Archived', disabled: true },
]} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TabItem[]` | — | `{ id, label, content?, icon?, badge?, disabled? }` |
| `value` / `defaultValue` / `onChange` | — | — | Controlled or uncontrolled |
| `variant` | `'line' \| 'pill' \| 'enclosed'` | `'line'` | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `fullWidth` | `boolean` | `false` | Splits the width evenly |
| `activation` | `'automatic' \| 'manual'` | `'automatic'` | `manual` only moves focus; Enter confirms |

Omit `content` and only the bar renders — you own the panel.

### Accordion

```tsx
<Accordion type="multiple" items={[
  { title: 'Shipping', content: <p>…</p>, meta: '3 days' },
]} />
```

`items`: `{ id?, title, content, meta?, icon?, disabled? }` · `type`:
`single` (default) or `multiple` · `value` / `defaultValue` / `onValueChange` ·
`collapsible` (default `true`) · `variant`: `separated` (default), `bordered`,
`plain`. Arrow keys, Home and End move between headers. Collapsed panels are
hidden, not unmounted, so their internal state survives.

### Breadcrumb

```tsx
<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Order 42' }]} />
```

The last item is the current page: it gets `aria-current="page"` and is not a
link. Past `maxItems` (default 4) the **middle** collapses into `…` — the start
and the end are what orient the user.

### Pagination

```tsx
<Pagination page={p} totalPages={12} onChange={setP} />
<Pagination page={p} totalPages={12} onChange={setP} compact />
```

`siblings` (pages either side, default 1), `boundaries` (fixed pages at each
end, default 1), `compact` (just Previous/Next with «Page X of Y» — the
sensible option on mobile), `size`, `labels` for translation. Returns `null`
when there is a single page. The `pageRange()` helper is exported.

### A note on narrow layouts

`Tabs` and `Table` scroll horizontally rather than wrapping, so their bar keeps
its shape on a phone. Both carry `min-w-0` / `overflow-x-auto` internally, which
means they will not stretch a grid or flex track wider than the viewport.

If you build your own grid around library components, give the columns
`min-w-0`. Grid and flex items default to `min-width: auto`, so a child that
doesn't wrap forces its track to grow instead of scrolling:

```tsx
<div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
```

`Calendar`, `VenueMapEditor` and `ElementLibraryBuilder` measure **their own
container** rather than the viewport, so they reflow correctly inside a sidebar
or a modal, not just at page level.

---

## Controls

### Switch

```tsx
<Switch label="Email notifications" description="We ping you on every order."
        checked={on} onChange={setOn} />
```

`role="switch"` with `aria-checked`. Props: `checked` / `defaultChecked` /
`onChange`, `label`, `description`, `labelPosition`, `size` (`sm | md | lg`),
`disabled`, `required`, `name` (hidden input for forms), `value`.

### Tooltip

```tsx
<Tooltip content="Export as JSON">
  <Button variant="icon" aria-label="Export"><SaveIcon /></Button>
</Tooltip>
```

Shows on hover and on keyboard focus; on touch screens it appears on
press-and-hold. It renders in a portal with fixed positioning, so no ancestor's
`overflow: hidden` can clip it, and it repositions on scroll. `Escape` hides it.

Props: `content`, `placement` (`top | bottom | left | right`), `delay` (ms),
`disabled`, `maxWidth`.

**The tooltip is not an accessible name.** An icon-only button still needs its
own `aria-label`.

---

## Animations

Everything that changes size or position animates: accordion panels, modals,
the date picker's panel and sheet, tooltips, the tab underline, the switch
thumb, progress bars and interactive cards.

All of it reads its duration from a single CSS variable, so the switch is one
variable — not a prop threaded through the tree.

### Turning it off globally

```tsx
<ThemeProvider animations={false}>
```

```ts
import { applyMotion } from 'neogestify-ui-components';
const undo = applyMotion(false);   // returns an undo function
```

```css
:root { --nui-duration: 0ms; --nui-duration-fast: 0ms; }
```

For SSR, `motionToCss(false)` gives you the same CSS as a string to drop into a
`<style>` and avoid the first frame animating before your setting applies.

### Turning it off for one component

Every animated component takes `animate`:

```tsx
<Accordion animate={false} items={faq} />
<Modal animate={false} …>
```

Because it writes the same CSS variable inline, it **cascades**: putting it on a
container silences everything inside it.

```tsx
<Card animate={false}>
  <Tabs …/>        {/* also instant */}
</Card>
```

### Reduced motion

Independently of all this, every transition carries
`motion-reduce:transition-none`, so a user with «reduce motion» in their OS gets
no animation without anyone configuring anything. `animations={false}` is for
the *product's* decision; `prefers-reduced-motion` is the *user's*, and it always
wins.

### Duration

| Variable | Default | Used by |
|----------|---------|---------|
| `--nui-duration` | `200ms` | Panels, modals, sheets, indicators |
| `--nui-duration-fast` | `120ms` | Tooltips, colour changes |

Any CSS time value works, so you can slow things down instead of switching them
off:

```css
:root { --nui-duration: 400ms; }
```

Setting `0ms` doesn't remove the transition, it makes it instant — the end state
is identical either way, so nothing in the library depends on an animation
actually running. `motionDuration()` reads the effective value in milliseconds
if you need to sync something in JavaScript.

### What animates, and how

| Component | Transition |
|-----------|-----------|
| `Accordion` | Real height, via `grid-template-rows: 0fr → 1fr` — no `max-height` guess, no measuring in JS |
| `Modal` | Backdrop fades, panel scales from 95 % |
| `DatePicker` | Desktop panel scales from its anchored edge; mobile sheet slides up from the bottom |
| `Tooltip` | Fades in with a 4 px nudge from the side it points at |
| `Tabs` | The underline slides and resizes between tabs instead of jumping |
| `Switch` | Thumb travel |
| `Progress` | Bar width |
| `Card` | `interactive` cards lift 2 px on hover |

The collapsed accordion panel stays in the DOM so it can animate — it gets the
`inert` attribute while closed, which takes it out of the tab order and hides it
from screen readers.


## SVG Icons

The library ships more than 90 SVG icons. **Every inline SVG in the library
lives here** — components never define their own, they import from this
collection, so an icon swapped here changes everywhere at once.

Added in 3.0: `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronUpIcon`,
`UserIcon`, `WarningIcon`, `ErrorIcon`, `SlashIcon`, `RingSpinnerIcon`,
`QuarterSpinnerIcon`.

```tsx
import {
  HomeIcon,
  SaveIcon,
  DeleteIcon,
  EditIcon,
  SearchIcon,
  AddIcon,
  CloseIcon,
  MenuIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  // ... and many more
} from 'neogestify-ui-components';

function MyComponent() {
  return (
    <div>
      <HomeIcon className="w-6 h-6 text-blue-500" />
      <SaveIcon className="w-5 h-5 text-green-600" />
    </div>
  );
}
```

**Full icon list:**

- SpinnerIcon, AnimateSpin, GearIcon, CheckIcon, BackIcon
- NotFoundIcon, BoxIcon, ChartIcon, UsersIcon, DocumentIcon
- LogoutIcon, HomeIcon, BuildingIcon, CashIcon, MenuIcon
- CloseIcon, AddIcon, SearchIcon, SaveIcon, CancelIcon
- DeleteIcon, EditIcon, CategorieIcon, FolderIcon, ArrowIcon
- FilterIcon, QuestionIcon, LocationIcon, CalendarIcon, InfoIcon
- MoonIcon, SunIcon, CamaraIcon, ArrowLeftIcon, ArrowRightIcon
- TrashIcon, MinusIcon, MoneyIcon, PercentIcon, StackIcon
- ClockIcon, CheckCircleIcon, CajasIcon, PrinterIcon, NetworkIcon
- TestIcon, FacturacionIcon, WhatsAppIcon, ArchiveIcon, CopyIcon
- PasteIcon, RestaurantMenuIcon, CloudIcon, ShieldIcon
- BarsChartsIcon, LightingIcon, LifeGuardIcon, MonitorIcon
- TruckIcon, IconCursor, IconHand, IconGrid, IconZoomIn
- IconZoomOut, IconReset, IconUndo, IconRedo, IconPlace
- IconErase, IconDuplicate, IconWall, IconDownload, IconUpload
- IconPolygon, IconLayers
- ChevronDownIcon, SortAscIcon, SortDescIcon, SortBothIcon
- FingerPrintIcon, PasswordIcon, ShareIcon, QRIcon

---

## Alerts (SweetAlert2)

```tsx
import {
  AlertaExito,
  AlertaError,
  AlertaAdvertencia,
  AlertaConfirmacion,
  AlertaToast,
  AlertaInfo,
  Alerta, // generic function
} from 'neogestify-ui-components';

function MyComponent() {
  const handleSave = async () => {
    await saveData();
    AlertaExito('Saved!', 'The data was saved successfully');
  };

  const handleError = () => {
    AlertaError('Error', 'The data could not be saved');
  };

  const handleWarning = () => {
    AlertaAdvertencia(
      'Are you sure?',
      'This action cannot be undone',
      async () => { await deleteData(); }
    );
  };

  const handleConfirm = () => {
    AlertaConfirmacion(
      'Continue?',
      'Do you want to proceed with the action?',
      () => { console.log('Confirmed'); },
      () => { console.log('Cancelled'); }
    );
  };

  const handleToast = () => {
    AlertaToast('Success', 'Operation completed', 'success', 3000, 'top-end');
  };

  return (
    <Button variant="danger" onClick={handleWarning}>
      Delete
    </Button>
  );
}
```

### Available functions

| Function | Description |
|---------|-------------|
| `Alerta(options)` | Generic function with all options |
| `AlertaExito(title, text, onConfirm?, options?)` | Success alert |
| `AlertaError(title, text, onConfirm?, options?)` | Error alert |
| `AlertaInfo(title, text, onConfirm?, options?)` | Info alert |
| `AlertaAdvertencia(title, text, onConfirm?, onCancel?, options?)` | Warning alert |
| `AlertaConfirmacion(title, text, onConfirm?, onCancel?, options?)` | Confirmation alert |
| `AlertaToast(title, text, icon?, timer?, position?)` | Toast notification |

### Generic Alerta options

```tsx
Alerta({
  title: 'Title',
  text: 'Description',
  icon: 'success' | 'error' | 'warning' | 'info' | 'question',
  confirmButtonText: 'OK',
  showCancelButton: true,
  cancelButtonText: 'Cancel',
  showDenyButton: true,
  denyButtonText: 'No',
  onConfirm: () => {},
  onCancel: () => {},
  onDeny: () => {},
  toast: true,
  timer: 3000,
  position: 'top-end',
  allowOutsideClick: true,
  allowEscapeKey: true,
  input: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select',
  inputLabel: 'Label',
  inputPlaceholder: 'Placeholder',
  inputValue: 'Initial value',
  inputValidator: (value) => null | 'Error message',
});
```

---

## InfoAlert (Component)

A button with a question-mark icon that opens an informational SweetAlert2 popup when clicked:

```tsx
import { InfoAlert } from 'neogestify-ui-components';

<InfoAlert title="Info" text="This is an informational message" />
```

Props:
- `title`: Popup title (string, required)
- `text`: Popup message (string, required)

---

## Theme System

### 1. Set up the ThemeProvider

Wrap your app with `ThemeProvider`:

```tsx
// main.tsx or App.tsx
import { ThemeProvider } from 'neogestify-ui-components';

function Main() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
```

The provider applies three things to `<html>`: the `.dark` class, the
`data-theme` attribute and the CSS **`color-scheme`** property. The last one is
what makes *native* controls (a `<select>`'s dropdown list, an `<input
type="date">`'s calendar, scrollbars) render in dark; without it the dropdown
opened with the system's light colors — and on Chrome for Windows/Linux, as
white text on a white background.

It is SSR-safe: it doesn't touch `localStorage` during render, so it won't break
hydration in Next.js. It also syncs the theme across open tabs.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultTheme` | `'light' \| 'dark'` | `'light'` | Theme for the first render (and SSR) |
| `enableSystem` | `boolean` | `true` | With no stored theme, use `prefers-color-scheme` |
| `storageKey` | `string` | `'theme'` | `localStorage` key |

### 2. Use the ThemeToggle

```tsx
import { ThemeToggle } from 'neogestify-ui-components';

function Header() {
  return (
    <nav>
      <ThemeToggle />
    </nav>
  );
}
```

### 3. Use the useTheme hook

```tsx
import { useTheme } from 'neogestify-ui-components';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle theme</button>
      <button onClick={() => setTheme('dark')}>Dark mode</button>
      <button onClick={() => setTheme('light')}>Light mode</button>
    </div>
  );
}
```

The theme is saved to `localStorage` automatically and applied on page load.

---

## VenueMapEditor

Interactive venue map editor built on pure SVG. It lets you design the floor
plan of any space (restaurants, parking lots, stadiums, offices, events, etc.)
with wall-drawing tools, object placement, multiple floors and a custom element
library system.

### Import

```tsx
import {
  VenueMapEditor,
  VenueMapViewer,
} from 'neogestify-ui-components';

import type {
  VenueMap, Floor, MapElement,
  ElementTypeDef, ElementGroup, ElementLibrary,
  ElementStatus, VenueMapEditorProps,
} from 'neogestify-ui-components';
```

### Basic usage

The component works with no props — it creates an empty map with a default floor:

```tsx
<VenueMapEditor />
```

With minimal configuration:

```tsx
<VenueMapEditor
  width="100%"
  height="700px"
  onChange={(map) => console.log('Map updated:', map)}
/>
```

### Loading and saving a map from code

The `initialMap` prop accepts a `VenueMap`. When the value changes by reference,
the editor resets its history to the new map.

```tsx
import { useState, useEffect } from 'react';
import { VenueMapEditor } from 'neogestify-ui-components';
import type { VenueMap } from 'neogestify-ui-components';

function App() {
  const [map, setMap] = useState<VenueMap | undefined>();

  useEffect(() => {
    fetch('/api/maps/1')
      .then(r => r.json())
      .then(setMap);
  }, []);

  const handleChange = (updated: VenueMap) => {
    setMap(updated);
    fetch('/api/maps/1', {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
  };

  return (
    <VenueMapEditor
      initialMap={map}
      onChange={handleChange}
      height="600px"
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialMap` | `VenueMap` | empty map | Initial map |
| `onChange` | `(map: VenueMap) => void` | — | Callback on every change |
| `domainConfigs` | `DomainConfig[]` | `[]` | Built-in type catalogs |
| `domainConfig` | `DomainConfig` | — | **Deprecated** — use `domainConfigs` |
| `libraryStorageKey` | `string` | `'venueMapEditor:libraries'` | localStorage key |
| `width` | `string \| number` | `'100%'` | Width |
| `height` | `string \| number` | `'600px'` | Height |
| `gridSize` | `number` | `20` | Grid size |
| `showGrid` | `boolean` | `true` | Show the grid |
| `snapToGrid` | `boolean` | `false` | Snap to grid |
| `readOnly` | `boolean` | `false` | Read-only mode (editing disabled) |
| `fixed` | `boolean` | `false` | Read-only + hides the toolbar |
| `containment` | `'full' \| 'center' \| 'none'` | `'full'` | Map collision — how elements are kept inside the floor (see below) |
| `elementStatus` | `ElementStatus[]` | — | Visual statuses per element |
| `onElementClick` | `(el: MapElement) => void` | — | Generic click |
| `onElementTypeClick` | `Record<string, (el: MapElement) => void>` | — | Click per type |
| `theme` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Editor theme (see below) |
| `className` | `string` | — | Extra classes for the root container |

### Collision with the map (`containment`)

Elements are kept inside the **floor area** — the collision is against the map,
not between elements (elements may overlap each other freely). The check is
**rotation-aware**: it uses the element's real footprint, not its unrotated box,
so a rotated element can't poke a corner outside the floor.

| Mode | Behavior |
|------|----------|
| `'full'` (default) | The element's whole footprint stays inside the floor. Not even a corner can leave. |
| `'center'` | Only the element's center must stay inside; it may overhang the edges (useful for point-like icons). |
| `'none'` | No containment; elements can be placed anywhere. |

```tsx
// Keep the whole element inside the floor (default)
<VenueMapEditor containment="full" />

// Allow elements to overhang the edge
<VenueMapEditor containment="center" />
```

Containment applies to every position change: dragging, arrow-key nudging,
placing, duplicating, rotating and typing coordinates into the properties panel.
On a rectangular floor the fit is exact; on a polygon floor the element is pushed
back onto the perimeter (exact for convex shapes, best-effort for concave ones).

The geometry helpers are exported for advanced use:

```tsx
import {
  containToFloor,     // clamp an element to a floor area
  elementFootprint,   // rotation-aware AABB of an element
  elementCorners,     // the four rotated corners
  pointInPolygon,
} from 'neogestify-ui-components';
```

### Light / dark theme

The whole editor — toolbar, tabs, properties panel and the **SVG canvas** —
follows the active theme.

With `theme="auto"` (default) it detects the document's theme and reacts to live
changes, in this order:

1. `.dark` class on `<html>` (what this library's `ThemeProvider` applies).
2. `data-theme="dark"` attribute.
3. The system's `prefers-color-scheme`.

```tsx
// Follows the page theme
<VenueMapEditor initialMap={map} />

// Force dark even if the page is light
<VenueMapEditor initialMap={map} theme="dark" />
```

The canvas colors (background, grid, floor, walls, selection) are exposed in case
you need to paint your own matching controls:

```tsx
import { useVenueTheme, VENUE_PALETTES } from 'neogestify-ui-components';

const theme = useVenueTheme('auto');      // 'light' | 'dark'
const palette = VENUE_PALETTES[theme];    // { canvasBg, gridMinor, accent, ... }
```

### Viewer mode

`VenueMapViewer` is an alias of `VenueMapEditor` with `fixed={true}`:

```tsx
import { VenueMapViewer } from 'neogestify-ui-components';
import type { ElementStatus } from 'neogestify-ui-components';

const statuses: ElementStatus[] = [
  { elementId: 'table-1', status: 'occupied' },
  { elementId: 'table-2', status: 'free' },
  { elementId: 'table-3', status: 'reserved' },
];

<VenueMapViewer
  initialMap={myMap}
  elementStatus={statuses}
  onElementTypeClick={{
    TABLE_ROUND: (el) => openReservation(el.id),
    TABLE_RECT: (el) => openReservation(el.id),
  }}
/>
```

### Clickable elements

Clicks are **only active in viewer mode** (`fixed`/`readOnly`) and only for
elements that are marked *clickable*. In the editor, clicks always select — they
never fire `onElementClick`, so interactive elements can be laid out without
triggering their handlers.

Clickability is resolved per element: `MapElement.clickable`, falling back to
the type default `ElementTypeDef.clickable`, falling back to `false`.

- **Per type (library default):** set `clickable: true` on an `ElementTypeDef`,
  or tick *"Clickable by default"* in the `ElementLibraryBuilder`.
- **Per element:** toggle the *Clickable* checkbox in the editor's Properties
  panel; this overrides the type default for that one element.

Clickability only affects the **viewer**: in the editor a clickable element is
moved, resized and edited like any other — the flag has no effect there.

### Multiple catalogs (domainConfigs)

```tsx
const furniture: DomainConfig = {
  id: 'furniture',
  name: 'Furniture',
  elementTypes: [
    { id: 'CHAIR', label: 'Chair', shape: 'circle', defaultWidth: 30, defaultHeight: 30, color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_RECT', label: 'Rect. table', shape: 'rect', defaultWidth: 100, defaultHeight: 60, color: '#fef3c7', strokeColor: '#d97706' },
  ],
};

const lighting: DomainConfig = {
  id: 'lighting',
  name: 'Lighting',
  elementTypes: [
    { id: 'SPOT_LIGHT', label: 'Spotlight', shape: 'circle', defaultWidth: 40, defaultHeight: 40, color: '#fef9c3', strokeColor: '#ca8a04' },
  ],
};

<VenueMapEditor domainConfigs={[furniture, lighting]} />
```

### Library JSON format

```json
{
  "tableGroup": {
    "name": "Restaurant tables",
    "objects": [
      {
        "id": "TABLE_ROUND_2",
        "label": "Table for 2",
        "shape": "circle",
        "defaultWidth": 60,
        "defaultHeight": 60,
        "color": "#fef3c7",
        "strokeColor": "#d97706"
      },
      {
        "id": "TABLE_RECT_4",
        "label": "Table for 4",
        "shape": "rect",
        "defaultWidth": 110,
        "defaultHeight": 70,
        "color": "#fef3c7",
        "strokeColor": "#d97706"
      }
    ]
  }
}
```

### Custom shapes

| `shape` | Description |
|---------|-------------|
| `rect` | Rectangle |
| `circle` | Ellipse/circle |
| `arrow` | Arrow |
| `path` | Custom SVG path |
| `svg` | Full inline SVG |
| `image` | Raster image (base64 or URL) |

**`path` shape:**
```json
{
  "id": "STAR",
  "label": "Star",
  "shape": "path",
  "svgPath": "M50 5 L61 35 ...",
  "viewBox": "0 0 100 100",
  "defaultWidth": 60,
  "defaultHeight": 60,
  "color": "#facc15",
  "strokeColor": "#ca8a04"
}
```

**`svg` shape:**
```json
{
  "id": "CAR",
  "label": "Car",
  "shape": "svg",
  "svgMarkup": "<svg viewBox=\"0 0 100 100\"><rect .../></svg>",
  "defaultWidth": 80,
  "defaultHeight": 80,
  "color": "#3b82f6",
  "strokeColor": "#1e40af"
}
```

### Status colors

| `status` | Color |
|----------|-------|
| `free` | Light green |
| `occupied` | Light red |
| `reserved` | Yellow |
| `disabled` | Gray |

### Library persistence

Imported libraries are saved to `localStorage` under the `libraryStorageKey` key
(default `'venueMapEditor:libraries'`). They are restored automatically on
reload.

**Smart merge on import:** if a group with the same `id` already exists, only the
elements whose `id` is not already present are added. Existing elements are never
overwritten.

```tsx
// Change the storage key (useful with multiple editors)
<VenueMapEditor libraryStorageKey="my-project:libs" />

// Disable persistence
<VenueMapEditor libraryStorageKey="" />
```

### Per-object properties

| Field | Type | Required | Description |
|-------|------|-----------|-------------|
| `id` | `string` | ✓ | Unique type identifier |
| `label` | `string` | ✓ | Name shown in the palette |
| `shape` | `"rect" \| "circle" \| "arrow" \| "path" \| "svg" \| "image"` | ✓ | Object shape |
| `defaultWidth` | `number` | ✓ | Initial width (canvas units) |
| `defaultHeight` | `number` | ✓ | Initial height |
| `color` | `string` | ✓ | Fill color (#hex, rgb(), hsl()) |
| `strokeColor` | `string` | ✓ | Border color |
| `svgPath` | `string` | `shape:"path"` only | The SVG path's `d` attribute |
| `svgMarkup` | `string` | `shape:"svg"` only | Full SVG markup |
| `imageSrc` | `string` | `shape:"image"` only | Image as a base64 data URI (or http(s) URL) |
| `preserveAspectRatio` | `string` | — | How the image fits its box (`"xMidYMid meet"` by default) |
| `viewBox` | `string` | — | Coordinate space of the path |
| `fillRule` | `"nonzero" \| "evenodd"` | — | SVG fill rule |

### `path` shape in detail

The `svgPath` field accepts the `d` attribute of any standard SVG `<path>`. The
system scales the figure so it fills the `width × height` bounding box exactly.

```json
{
  "special": {
    "name": "Special",
    "objects": [
      {
        "id": "STAR",
        "label": "Star",
        "shape": "path",
        "viewBox": "0 0 100 100",
        "svgPath": "M50 5 L61 35 L95 35 L68 57 L79 91 L50 70 L21 91 L32 57 L5 35 L39 35 Z",
        "defaultWidth": 60,
        "defaultHeight": 60,
        "color": "#facc15",
        "strokeColor": "#ca8a04"
      },
      {
        "id": "GEAR",
        "label": "Gear",
        "shape": "path",
        "viewBox": "0 0 100 100",
        "fillRule": "evenodd",
        "svgPath": "M36.61,17.66 ...",
        "defaultWidth": 70,
        "defaultHeight": 70,
        "color": "#94a3b8",
        "strokeColor": "#334155"
      }
    ]
  }
}
```

### `image` shape in detail (base64 images)

To use a real image (PNG, JPG, WEBP, GIF, AVIF) as a map element:

```json
{
  "furniture": {
    "name": "Photos",
    "objects": [
      {
        "id": "SOFA_PHOTO",
        "label": "Sofa",
        "shape": "image",
        "imageSrc": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "preserveAspectRatio": "xMidYMid meet",
        "defaultWidth": 120,
        "defaultHeight": 80,
        "color": "#ffffff",
        "strokeColor": "#334155"
      }
    ]
  }
}
```

| Field | Description |
|-------|-------------|
| `imageSrc` | **base64 data URI** (recommended) or `http(s)` URL |
| `preserveAspectRatio` | `'xMidYMid meet'` contain (default) · `'xMidYMid slice'` cover (crops) · `'none'` stretch |

**Why base64:** the data URI travels inside the library JSON and the exported
map, so the map looks the same on any machine without relying on an image server.
The cost is size: base64 is ~33% larger than the original file and is duplicated
in every map that uses the library. For simple icons `shape: 'svg'` is far
cheaper.

> **Security:** only `data:image/*` (except SVG, which can contain scripts — use
> `shape: 'svg'` for vectors, which is sanitized) and `http(s)` URLs are
> accepted. Any other scheme is discarded.

Editor behavior:

- The image is drawn inside the element's box and can be moved, resized and rotated like any other element.
- When **selected** it is highlighted with an accent rectangle (an `<image>` doesn't accept a stroke of its own).
- Viewer **status colors** are applied as a translucent layer on top, since a bitmap can't be tinted.
- If `imageSrc` is missing or fails validation, a dashed box with an "Image unavailable" note is drawn instead of an invisible gap.

In the **ElementLibraryBuilder** pick the `Image (base64)` shape: selecting a
file converts it automatically, shows the preview, the embedded KB, and warns if
the image is too heavy.

### `svg` shape in detail

The `svgMarkup` field accepts a **complete SVG** as a string. The system extracts
the `viewBox` from the `<svg>` tag and renders the inner elements scaled.

The markup is respected as-is: at rest the editor **imposes no stroke**, so the
illustration looks exactly as designed, with no added outlines. When the element
is **selected**, an accent-colored stroke is inherited as a highlight. It always
inherits from the type:

- **`fill`** → the type's `color` (or the status color in viewer mode), applied
  only to shapes that don't declare their own `fill`.
- **`color`** → the type's `strokeColor`, so the markup can use `currentColor`
  wherever it wants that color.

If you want an outline, declare it in the markup itself (`stroke="currentColor"`,
`stroke-width="4"`…). On primitive shapes (`rect`, `circle`, `arrow`, `path`)
`strokeColor` is applied as a border.

> **Security:** the markup is sanitized by rebuilding the DOM tree against an SVG
> tag allowlist; `<script>`, `<foreignObject>`, `on*` handlers, `javascript:`
> URLs and external references are dropped.

```json
{
  "icons": {
    "name": "SVG icons",
    "objects": [
      {
        "id": "CAR",
        "label": "Car",
        "shape": "svg",
        "svgMarkup": "<svg viewBox=\"0 0 100 100\"><rect x=\"10\" y=\"40\" width=\"80\" height=\"35\" rx=\"5\" fill=\"currentColor\"/><circle cx=\"28\" cy=\"75\" r=\"9\" fill=\"currentColor\"/></svg>",
        "defaultWidth": 80,
        "defaultHeight": 80,
        "color": "#3b82f6",
        "strokeColor": "#1e40af"
      }
    ]
  }
}
```

### Multiple groups in one JSON file

A single file can hold as many groups as you need. Each group appears as a
**separate tab** in the palette.

```json
{
  "chairs":  { "name": "Chairs & seats", "objects": [ ... ] },
  "service": { "name": "Service area",   "objects": [ ... ] },
  "decor":   { "name": "Decoration",     "objects": [ ... ] }
}
```

### Example library — Parking lot

```json
{
  "spots": {
    "name": "Spots",
    "objects": [
      { "id": "SPOT",        "label": "Standard",  "shape": "rect",   "defaultWidth": 60,  "defaultHeight": 120, "color": "#dbeafe", "strokeColor": "#3b82f6" },
      { "id": "SPOT_DISCAP", "label": "Accessible","shape": "rect",   "defaultWidth": 80,  "defaultHeight": 120, "color": "#dcfce7", "strokeColor": "#22c55e" },
      { "id": "SPOT_EV",     "label": "EV charge", "shape": "rect",   "defaultWidth": 65,  "defaultHeight": 120, "color": "#d1fae5", "strokeColor": "#059669" },
      { "id": "SPOT_MOTO",   "label": "Motorcycle","shape": "rect",   "defaultWidth": 35,  "defaultHeight": 75,  "color": "#fef9c3", "strokeColor": "#eab308" }
    ]
  },
  "circulation": {
    "name": "Circulation",
    "objects": [
      { "id": "ENTRANCE", "label": "Entrance", "shape": "arrow", "defaultWidth": 85, "defaultHeight": 35, "color": "#dcfce7", "strokeColor": "#16a34a" },
      { "id": "EXIT",     "label": "Exit",     "shape": "arrow", "defaultWidth": 85, "defaultHeight": 35, "color": "#fee2e2", "strokeColor": "#dc2626" },
      { "id": "LANE",     "label": "Lane",     "shape": "rect",  "defaultWidth": 300,"defaultHeight": 60,  "color": "#f3f4f6", "strokeColor": "#9ca3af" }
    ]
  }
}
```

### Full data model

```
VenueMap
├── id: string
├── name: string
├── libraries?: ElementLibrary          ← imported libraries (embedded in the map)
└── floors: Floor[]
    ├── id: string
    ├── name: string
    ├── order: number
    ├── area: FloorArea                 ← floor shape (rect | polygon)
    │   ├── shape: 'rect' | 'polygon'
    │   ├── x?, y?, width?, height?    ← for shape: 'rect'
    │   └── points?: [number,number][] ← for shape: 'polygon'
    ├── wallNodes: WallNode[]           ← wall graph vertices
    ├── walls: Wall[]                   ← wall segments with thickness and material
    └── elements: MapElement[]
        ├── id: string
        ├── type: string               ← id of the library's ElementTypeDef
        ├── x, y, width, height: number
        ├── rotation: number           ← degrees
        ├── label?: string
        └── metadata?: Record<string, unknown>  ← your app's own data
```

The `metadata` field is available for each app to store its own per-element data
(e.g. reservation ID, capacity, owner).

```tsx
const handleClick = (el: MapElement) => {
  const reservationId = el.metadata?.reservationId as string;
  openModal(reservationId);
};
```

### Editor tools

| Key | Tool | Function |
|-------|-------------|---------|
| `V` | Select | Move, resize and rotate elements. Drag the floor's **border** to move it. |
| `H` | Pan | Pan the canvas with the left button (or one finger). |
| `W` | Wall | A click sets the start; the next click ends the segment and chains the next one from that same node. Right-click or `Esc` cancels. |
| `P` | Place | A click on the floor places the element selected in the palette. |
| `E` | Erase | Clicking an element or wall deletes it. |
| `Esc` | — | Back to Select and clears the selection. |
| `Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y` | — | Undo / Redo. |
| `Ctrl+D` | — | Duplicate the selection. |
| `Ctrl+A` | — | Select all elements on the floor. |
| `Del / Backspace` | — | Delete the selection (elements or wall). |
| `↑ ↓ ← →` | — | Nudge the selection by 1 px (with `Shift`, one grid step). |
| `+ / -` | — | Zoom in / out, centered on the view. |
| `Ctrl+0` | — | Fit the view to the plan. |
| Mouse wheel | — | Zoom centered on the cursor (respects trackpad sensitivity). |
| Middle click + drag | — | Pan the canvas in any mode. |

> The shortcuts only fire when focus is **inside** the editor, so several editors
> (or a form next to it) can coexist on the same page without stealing keys.

### Responsive layout

The editor adapts to the space it is actually given. The breakpoints are based on
the **editor's own container**, measured with a `ResizeObserver` — not on the
viewport. This is deliberate: as an embeddable component it may live in a 300 px
sidebar on a 1920 px screen, where Tailwind's viewport-based `sm:`/`md:`
variants would wrongly apply the desktop layout.

| Container width | Layout |
|-----------------|--------|
| ≥ 640 px | Toolbar in one row · properties panel as a **side column** (224 px) |
| < 640 px | Properties panel becomes a **bottom sheet** (full width, max 45% height, with a close button) · palette scrolls in a single row |
| < 420 px | The zoom percentage and separators are hidden; the toolbar scrolls horizontally |

The toolbar never squashes or overflows: it scrolls horizontally when it doesn't
fit. Floor tabs already scroll.

**The view re-fits itself.** Whenever the layout changes — rotating a device,
opening the panel, switching to compact — the map is re-framed so it stays fully
visible. Without this, resizing left the plan cropped off-screen, since the fit
only happened on mount. If you have already panned or zoomed by hand, your
framing is kept and never overridden; press **Fit view** (or `Ctrl+0`) to hand
control back to the automatic fit.

### Touch screens

The editor is built on Pointer Events, so every gesture works the same with a
mouse, a finger or a stylus. On top of that, touch-specific behavior:

| Gesture | Action |
|---------|--------|
| One finger drag | Same as the active tool: move an element, draw the lasso, pan in PAN mode. |
| **Two fingers pinch** | Zoom, anchored at the midpoint between the fingers. |
| **Two fingers drag** | Pan the canvas — works in **any** tool, no need to switch to PAN. |
| Double tap on a vertex | Deletes it (polygon floor). |
| Double tap on a floor tab | Renames it. |

Touch adjustments applied automatically when a coarse pointer (a finger) is
detected via `(any-pointer: coarse)`:

- **Grab areas grow** from ~14 px to ~44 px. The handles keep their small visual
  size, but each one gets a larger invisible hit area, which is what makes
  resizing and rotating usable with a fingertip.
- **Floor tabs and their buttons get taller**, so switching or closing a floor
  doesn't need pixel precision.
- While drawing a wall, a **"Cancel" chip** appears on the canvas: touch has no
  right-click and no `Esc` key, so without it the wall tool would be impossible
  to back out of.

The canvas sets `touch-action: none`, so the browser never steals the gesture for
page scroll or its own pinch-zoom. Starting a two-finger gesture also cancels any
lasso or wall in progress, so a pinch can't be mistaken for a selection.

> Keyboard shortcuts obviously aren't available on a tablet without a keyboard.
> Every destructive action also has a button: delete and duplicate live in the
> properties panel, and undo/redo/zoom are in the toolbar.

### Selection

- **Click** an element to select it; with `Ctrl`/`Cmd`/`Shift` it is added or removed.
- **Lasso**: drag over the floor to select by area (with `Ctrl` it adds to the
  selection). The floor's interior is free for the lasso; to **move the floor**
  drag its **border**.
- **Click** a wall to select it and open its panel (material and thickness).

### Floor management

The tab bar (visible even in viewer mode) lets you:

- **Click** → switch the active floor
- **Double-click** the name → rename inline
- **◀ ▶** → reorder the active floor
- **×** → delete the floor (minimum 1)
- **+** → add a new floor

### Floor shape (Rect vs Polygon)

The **Rect / Poly** button on the toolbar toggles between:

- **Rect**: a rectangle with 8 resize handles on the edges and corners.
- **Poly**: a free polygon. Drag the vertices (blue squares). Clicking the center
  diamond of an edge adds a vertex. Double-clicking a vertex removes it (minimum 3).

Elements and walls are always kept inside the floor when moved or placed (see
[Collision with the map](#collision-with-the-map-containment)).

### Export / Import the map

| Button | Function |
|-------|---------|
| ⬇ Export map | Downloads the current state as `.json` (includes the embedded libraries for portability). |
| ⬆ Import map | Loads a previously exported `.json`, replacing the current map. |
| ⊞ Load library | Loads an elements `.json`. Groups are added to the palette as new tabs. If the group already exists, only objects with a new `id` are added. The library is persisted automatically to `localStorage`. |

---

## ElementLibraryBuilder

A visual interface to create JSON element libraries for the VenueMapEditor:

```tsx
import { ElementLibraryBuilder } from 'neogestify-ui-components';

function App() {
  return (
    <div style={{ height: '800px' }}>
      <ElementLibraryBuilder />
    </div>
  );
}
```

Features:
- Create/rename/delete element groups
- Add/edit/delete elements
- Configure shape, size, colors
- Supports shapes: rect, circle, arrow, path, svg, image (with base64 upload)
- Preview of the generated JSON
- Download as a .json file
- Copy to clipboard

### Responsive layout

Like the map editor, the builder measures **its own container** (not the
viewport) and reflows its three columns:

| Container width | Layout |
|-----------------|--------|
| ≥ 900 px | Three columns: groups/elements · element editor · output JSON |
| 640–900 px | Groups/elements and the editor side by side; **output JSON moves below** |
| < 640 px | Single column: everything stacked, form fields become one per row, and the element list is height-capped so it doesn't push the rest off-screen |

---

## Calendar / DatePicker

A dependency-free calendar (no `date-fns`, no `moment`) designed for touch:
large hit targets, swipe to change month, quick month/year pickers, and an
automatic collapse to a single month on narrow containers.

```tsx
import { Calendar, DatePicker, rangePresets } from 'neogestify-ui-components';
import type { DateRange } from 'neogestify-ui-components';

// Single date
const [date, setDate] = useState<Date | null>(null);
<Calendar value={date} onChange={setDate} />

// Several dates
const [days, setDays] = useState<Date[]>([]);
<Calendar mode="multiple" maxSelections={5} value={days} onChange={setDays} />

// Range — two months on desktop, one on mobile
const [range, setRange] = useState<DateRange>({ start: null, end: null });
<Calendar mode="range" value={range} onChange={setRange} presets={rangePresets()} maxRangeDays={30} />

// As a form field (popover on desktop, bottom sheet on mobile)
<DatePicker mode="range" label="Stay" name="stay" value={range} onChange={setRange} />
```

### Mobile behaviour

| Feature | Behaviour |
|---------|-----------|
| Hit targets | Day cells are 40 px tall by default (`size="lg"` → 48 px), the minimum recommended for touch |
| Swipe | Dragging horizontally over the grid moves to the previous/next month. Vertical page scroll is never blocked |
| Responsive months | The calendar measures **its own container**: under 640 px it always renders a single month, whatever `numberOfMonths` says |
| DatePicker | Under 640 px of viewport it opens as a full-width bottom sheet (portal + backdrop + scroll lock) instead of a floating popover |
| Quick navigation | Tapping the title opens a month grid, and from there a year grid — no need to tap `>` twelve times |

### `Calendar` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'single' \| 'range' \| 'multiple'` | `'single'` | Selection mode. The type of `value`/`onChange` follows it |
| `value` / `defaultValue` | `Date \| null`, `DateRange`, `Date[]` | — | Controlled / uncontrolled value |
| `onChange` | `(value) => void` | — | Fires on every change (including a half-open range) |
| `onComplete` | `(value) => void` | — | Fires only when the selection is complete (closed range, chosen date) |
| `month` / `defaultMonth` / `onMonthChange` | `Date` / `(m: Date) => void` | — | Visible month, controllable |
| `minDate` / `maxDate` | `Date \| string \| number` | — | Selectable bounds |
| `disabledDates` | `Date[] \| (d: Date) => boolean` | — | Blocked days |
| `disabledDaysOfWeek` | `WeekDay[]` | — | E.g. `[0, 6]` to block weekends |
| `minRangeDays` / `maxRangeDays` | `number` | — | Range length limits (while closing it, invalid days are disabled) |
| `maxSelections` | `number` | — | Cap in `multiple` mode |
| `numberOfMonths` | `number` | `2` in `range`, else `1` | Months rendered side by side |
| `responsive` | `boolean` | `true` | Collapse to one month under 640 px of container width |
| `locale` | `string` | `'es-ES'` | Any BCP-47 tag; month/day names come from `Intl` |
| `weekStartsOn` | `0..6` | locale's | `0` = Sunday |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Cell height: 32 / 40 / 48 px |
| `presets` | `CalendarPreset[]` | — | Range shortcuts. Use `rangePresets()` for the usual ones |
| `showOutsideDays` | `boolean` | `true` | Show the previous/next month filler days |
| `showFooter` | `boolean` | `true` | "Today" / "Clear" bar |
| `showValueSummary` | `boolean` | `false` | Text summary of the current selection |
| `swipeNavigation` | `boolean` | `true` | Change month by swiping |
| `readOnly` / `disabled` | `boolean` | `false` | `readOnly` still allows navigation |
| `labels` | `Partial<CalendarLabels>` | Spanish | UI strings (translate here) |
| `renderDay` | `(state: DayState) => ReactNode` | — | Custom cell content (dots, prices, availability…) |
| `onDayClick` | `(d: Date) => void` | — | Fires even on disabled days |

### `DatePicker` props

Takes every `Calendar` prop plus: `label`, `placeholder`, `error`,
`helperText`, `displayFormat` (an `Intl.DateTimeFormatOptions`), `clearable`,
`closeOnSelect`, `name` (renders a hidden input: `YYYY-MM-DD`, `start/end` for
ranges, comma-separated for multiple), `required`, `onOpenChange`, and the
`className` / `inputClassName` / `calendarClassName` slots.

### Keyboard

`←` `→` `↑` `↓` move day by day / week by week · `Home` / `End` jump to the
start/end of the week · `PageUp` / `PageDown` change month (with `Shift`, year)
· `Enter` / `Space` select · `Esc` cancels a half-open range, and closes the
`DatePicker`.

### Date helpers

The module also exports the utilities it uses internally, all local-time and
dependency-free: `startOfDay`, `addDays`, `addMonths`, `startOfMonth`,
`endOfMonth`, `isSameDay`, `isBeforeDay`, `isAfterDay`, `diffDays`,
`isWithin`, `normalizeRange`, `toDate`, `toISODate`, `formatDate`.

---

## Showcase / Demo

```bash
cd showcase
bun install
bun dev
```

Open http://localhost:5173 in your browser.

## Development

### Build

```bash
bun install
bun run build
```

### Project structure

```
ui-components/
├── src/
│   ├── components/
│   │   ├── html/          # HTML components
│   │   ├── icons/        # SVG icons
│   │   ├── alerts/       # SweetAlert2 alerts
│   │   ├── VenueMapEditor/  # Map editor
│   │   └── ElementLibraryBuilder/ # Library builder
│   ├── context/
│   │   └── theme/        # Theme system
│   └── types/            # TypeScript types
├── showcase/             # Demo/Showcase
└── dist/                 # Build output
```

## Dark Mode

The components support dark mode automatically using Tailwind's `dark:` classes.
If you use Tailwind v4, make sure the variant is configured in your main CSS (see
[Setup](#setup)):

```css
@variant dark (&:where(.dark, .dark *)) {
  /* dark mode variant */
}
```

To enable dark mode:

```tsx
document.documentElement.classList.add('dark');
```

Or use the library's theme system (ThemeProvider + ThemeToggle).

## License

MIT
