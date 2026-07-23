# UI Components

Reusable UI component library built with React, Tailwind CSS and SweetAlert2.

## Features

- Pre-styled HTML components (Button, Input, TextArea, Form, Select, Table, Modal, Loading)
- SVG icon collection (80+ icons)
- Preconfigured SweetAlert2 alerts + InfoAlert component
- Theme system (light/dark) with a Context Provider
- Interactive venue map editor (VenueMapEditor/VenueMapViewer)
- Element library builder (ElementLibraryBuilder)
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

## SVG Icons

The library ships more than 80 SVG icons:

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
| `H` | Pan | Pan the canvas with the left button. |
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
| Touch / stylus | — | All gestures work with finger and stylus. |

> The shortcuts only fire when focus is **inside** the editor, so several editors
> (or a form next to it) can coexist on the same page without stealing keys.

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
