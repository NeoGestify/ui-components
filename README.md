# UI Components

Biblioteca de componentes UI reutilizables con React, Tailwind CSS y SweetAlert2.

## Características

- Componentes HTML preestilizados (Button, Input, TextArea, Form, Select, Table, Modal, Loading)
- Colección de iconos SVG (50+ iconos)
- Alertas preconfiguradas con SweetAlert2 + componente InfoAlert
- Sistema de tema (light/dark) con Context Provider
- Editor de mapas interactivo (VenueMapEditor/VenueMapViewer)
- Constructor de librerías de elementos (ElementLibraryBuilder)
- Soporte para modo claro/oscuro
- TypeScript incluido
- Compatible con Tailwind CSS 4.x

## Instalación

### NPM
```bash
npm i neogestify-ui-components
```

### BUN
```bash
bun add neogestify-ui-components
```

## Configuración

### 1. Asegúrate de tener Tailwind CSS configurado en tu proyecto

```bash
bun add -D tailwindcss
```

Tu proyecto debe tener Tailwind configurado ya que los componentes solo usan clases de Tailwind (no incluyen CSS compilado).

### 2. Configura Tailwind para escanear los componentes de la biblioteca

**⚠️ IMPORTANTE:** Esta librería requiere que configures Tailwind para escanear sus archivos fuente.

En tu archivo CSS principal (por ejemplo `src/index.css`):

```css
@import "tailwindcss";

@source "../node_modules/neogestify-ui-components/src";
```

**Agrega este script a tu index.html**
```html
<script>
      // Prevenir flash de contenido sin estilo (FOUC)
      const theme = localStorage.getItem('theme') || 'light';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
</script>
```

### 3. Instala las dependencias peer

```bash
bun add react react-dom sweetalert2 sweetalert2-react-content
```

## Uso

Importa todo desde un solo punto:

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
  // Iconos
  HomeIcon,
  SaveIcon,
  DeleteIcon,
  // Alertas
  AlertaExito,
  AlertaError,
  AlertaAdvertencia,
  AlertaConfirmacion,
  AlertaToast,
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

---

## Componentes HTML

### Button

Variantes: `primary`, `secondary`, `danger`, `success`, `warning`, `outline`, `icon`, `nav`, `link`, `toggle`, `custom`

```tsx
<Button variant="primary" isLoading loadingText="Guardando...">
  Guardar
</Button>

<Button variant="toggle" isActive={active} onClick={toggle}>
  Toggle
</Button>
```

Props:
- `variant`: Variante del botón (`primary` | `secondary` | `icon` | `danger` | `success` | `outline` | `nav` | `custom` | `link` | `warning` | `toggle`)
- `isLoading`: Muestra estado de carga (boolean)
- `loadingText`: Texto durante carga
- `isActive`: Estado activo para variant `toggle` o `nav` (boolean)
- `disabled`: Deshabilita el botón
- `type`: Tipo HTML (`button`, `submit`, `reset`)
- `className`: Clases adicionales
- `children`: Contenido del botón

---

### Input

Soporta tipos: `text`, `email`, `password`, `number`, `checkbox`, `radio`, `date`, `tel`, `url`, `file`

```tsx
<Input
  label="Email"
  type="email"
  error="Email inválido"
  helperText="Ingresa tu correo electrónico"
/>

{/* Con icono */}
<Input
  label="Buscar"
  icon={<SearchIcon className="w-5 h-5" />}
  iconSide="left"
/>

{/* Checkbox */}
<Input type="checkbox" label="Acepto términos" />
```

Props:
- `label`: Etiqueta del campo (string | ReactNode)
- `type`: Tipo de input HTML (`text`, `email`, `password`, `number`, `checkbox`, `radio`, `date`, `tel`, `url`, `file`)
- `placeholder`: Placeholder
- `value`: Valor controlado
- `onChange`: Handler de cambio
- `error`: Mensaje de error
- `helperText`: Texto de ayuda
- `icon`: Icono a mostrar (ReactNode)
- `iconSide`: Lado del icono (`'left'` | `'right'`)
- `disabled`: Deshabilitado
- `required`: Requerido
- `className`: Clases adicionales
- `id`: ID del input (auto-generado si no se provee)

---

### TextArea

```tsx
<TextArea
  label="Descripción"
  placeholder="Escribe una descripción..."
  variant="outline"
  size="large"
/>
```

Props:
- `label`: Etiqueta (string | ReactNode)
- `placeholder`: Placeholder
- `value`: Valor controlado
- `onChange`: Handler de cambio
- `rows`: Número de filas (heredado de HTML)
- `variant`: Variante visual (`'default'` | `'outline'` | `'filled'` | `'minimal'`)
- `size`: Tamaño (`'small'` | `'medium'` | `'large'`)
- `error`: Mensaje de error
- `helperText`: Texto de ayuda
- `disabled`: Deshabilitado
- `className`: Clases adicionales
- `id`: ID del textarea (auto-generado si no se provee)

---

### Form

```tsx
<Form onSubmit={handleSubmit} variant="card">
  <Input label="Nombre" placeholder="Tu nombre" />
  <Input label="Email" type="email" />
  <Button variant="primary" type="submit">Enviar</Button>
</Form>

<Form variant="inline">
  <Input label="Buscar" placeholder="..." />
  <Button variant="secondary">Buscar</Button>
</Form>
```

Props:
- `onSubmit`: Handler del submit
- `variant`: Variante del layout (`'default'` | `'modal'` | `'card'` | `'inline'` | `'compact'`)
- `className`: Clases adicionales
- Hereda props de `<form>` (method, action, etc.)

---

### Select

```tsx
<Select
  label="Categoría"
  placeholder="Selecciona..."
  options={[
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2', disabled: true },
    { value: '3', label: 'Opción 3', selected: true }
  ]}
  variant="small"
  error
  helperText="Selecciona una opción"
/>
```

Props:
- `label`: Etiqueta (string | ReactNode)
- `placeholder`: Placeholder
- `options`: Array de opciones:
  - `value`: Valor de la opción (string | number)
  - `label`: Texto a mostrar
  - `disabled`: Deshabilita la opción (boolean)
  - `selected`: Selecciona la opción por defecto (boolean)
- `value`: Valor seleccionado (controlado)
- `onChange`: Handler de cambio
- `variant`: Variante (`'default'` | `'small'`)
- `error`: Muestra estado de error (boolean)
- `helperText`: Texto de ayuda
- `disabled`: Deshabilita el select
- `className`: Clases adicionales
- `id`: ID del select (auto-generado si no se provee)

---

### Table

```tsx
<Table
  columns={[
    { header: 'ID', align: 'center' },
    { header: 'Nombre', className: 'font-bold' },
    { header: 'Email' }
  ]}
  rows={[
    [<Badge>1</Badge>, 'Juan', 'juan@ejemplo.com'],
    [<Badge>2</Badge>, 'María', 'maria@ejemplo.com']
  ]}
  variant="striped"
  size="sm"
  onRowClick={(index) => console.log('Click fila', index)}
/>
```

Props:
- `columns`: Encabezados de columnas. Puede ser:
  - Array de strings o ReactNode (simple)
  - Array de `ColumnDef`: `{ header: ReactNode, className?: string, align?: 'left' | 'center' | 'right' }`
- `rows`: Datos de las filas (Array de Arrays de ReactNode)
- `variant`: Variante visual (`'default'` | `'striped'` | `'bordered'` | `'minimal'` | `'custom'`)
- `size`: Tamaño de celdas (`'sm'` | `'md'` | `'lg'`)
- `className`: Clases adicionales para el wrapper
- `tableClassName`: Clases adicionales para el `<table>`
- `thClassName`: Clases adicionales para cada `<th>`
- `tdClassName`: Clases adicionales para cada `<td>`
- `trClassName`: Clases adicionales para cada `<tr>` (string | función `(rowIndex) => string`)
- `emptyState`: Contenido a mostrar cuando no hay datos (ReactNode)
- `onRowClick`: Callback al hacer click en una fila `(rowIndex) => void`
- `hideHeader`: Oculta el encabezado (boolean)
- `style`: Estilos inline para el `<table>`

---

### Modal

```tsx
const modalRef = useRef<ModalRef>(null);

<Modal
  ref={modalRef}
  title="Mi Modal"
  maxWidth="max-w-md"
  showCloseButton={true}
  zIndex={60}
  onClose={() => setShowModal(false)}
  footer={
    <>
      <Button variant="secondary" onClick={() => modalRef.current?.handleClose()}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>
        Confirmar
      </Button>
    </>
  }
>
  <p>Contenido del modal</p>
</Modal>
```

Props:
- `title`: Título del modal
- `children`: Contenido
- `footer`: Contenido del pie
- `onClose`: Handler al cerrar
- `maxWidth`: Ancho máximo (`max-w-2xl` por defecto)
- `showCloseButton`: Muestra botón de cerrar (boolean, default: true)
- `zIndex`: Z-index del modal (number, default: 50)
- `className`: Clases adicionales

Métodos del ref (ModalRef):
- `handleClose()`: Cierra el modal con animación

---

### Loading

```tsx
<Loading variant="spinner" size="large" color="primary" label="Cargando..." />

<Loading variant="dots" size="medium" color="white" />
<Loading variant="pulse" size="small" color="success" />
<Loading variant="bars" size="xl" color="danger" />
<Loading variant="ring" color="warning" />
<Loading variant="cube" size="large" />
```

Props:
- `variant`: Variante del loader (`'spinner'` | `'dots'` | `'pulse'` | `'bars'` | `'ring'` | `'cube'`)
- `size`: Tamaño (`'small'` | `'medium'` | `'large'` | `'xl'`)
- `color`: Color del icono (`'primary'` | `'white'` | `'gray'` | `'success'` | `'danger'` | `'warning'`)
- `label`: Texto a mostrar debajo del icono
- `className`: Clases adicionales

---

## Iconos SVG

La biblioteca incluye más de 50 iconos SVG:

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
  // ... y muchos más
} from 'neogestify-ui-components';

function MiComponente() {
  return (
    <div>
      <HomeIcon className="w-6 h-6 text-blue-500" />
      <SaveIcon className="w-5 h-5 text-green-600" />
    </div>
  );
}
```

**Lista completa de iconos:**

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

---

## Alertas (SweetAlert2)

```tsx
import {
  AlertaExito,
  AlertaError,
  AlertaAdvertencia,
  AlertaConfirmacion,
  AlertaToast,
  AlertaInfo,
  Alerta, // función genérica
} from 'neogestify-ui-components';

function MiComponente() {
  const handleGuardar = async () => {
    await guardarDatos();
    AlertaExito('¡Guardado!', 'Los datos se guardaron correctamente');
  };

  const handleError = () => {
    AlertaError('Error', 'No se pudieron guardar los datos');
  };

  const handleAdvertencia = () => {
    AlertaAdvertencia(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer',
      async () => { await eliminarDatos(); }
    );
  };

  const handleConfirmacion = () => {
    AlertaConfirmacion(
      '¿Continuar?',
      '¿Deseas proceder con la acción?',
      () => { console.log('Confirmado'); },
      () => { console.log('Cancelado'); }
    );
  };

  const handleToast = () => {
    AlertaToast('Éxito', 'Operación completada', 'success', 3000, 'top-end');
  };

  return (
    <Button variant="danger" onClick={handleAdvertencia}>
      Eliminar
    </Button>
  );
}
```

### Funciones disponibles

| Función | Descripción |
|---------|-------------|
| `Alerta(options)` | Función genérica con todas las opciones |
| `AlertaExito(title, text, onConfirm?, options?)` | Alerta de éxito |
| `AlertaError(title, text, onConfirm?, options?)` | Alerta de error |
| `AlertaInfo(title, text, onConfirm?, options?)` | Alerta informativa |
| `AlertaAdvertencia(title, text, onConfirm?, onCancel?, options?)` | Alerta de advertencia |
| `AlertaConfirmacion(title, text, onConfirm?, onCancel?, options?)` | Alerta de confirmación |
| `AlertaToast(title, text, icon?, timer?, position?)` | Notificación toast |

### Opciones de Alerta genérica

```tsx
Alerta({
  title: 'Título',
  text: 'Descripción',
  icon: 'success' | 'error' | 'warning' | 'info' | 'question',
  confirmButtonText: 'Aceptar',
  showCancelButton: true,
  cancelButtonText: 'Cancelar',
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
  inputValue: 'Valor inicial',
  inputValidator: (value) => null | 'Error message',
});
```

---

## InfoAlert (Componente)

Componente visual de alerta en línea:

```tsx
import { InfoAlert } from 'neogestify-ui-components';

<InfoAlert>
  Este es un mensaje informativo
</InfoAlert>

<InfoAlert type="success">
  Operación exitosa
</InfoAlert>

<InfoAlert type="warning">
  Advertencia importante
</InfoAlert>

<InfoAlert type="error">
  Ha ocurrido un error
</InfoAlert>
```

Props:
- `type`: Variante (`info` | `success` | `warning` | `error`)
- `children`: Contenido
- `className`: Clases adicionales

---

## Sistema de Tema

### 1. Configurar el ThemeProvider

Envuelve tu aplicación con el `ThemeProvider`:

```tsx
// main.tsx o App.tsx
import { ThemeProvider } from 'neogestify-ui-components';

function Main() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
```

### 2. Usar el ThemeToggle

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

### 3. Usar el hook useTheme

```tsx
import { useTheme } from 'neogestify-ui-components';

function MiComponente() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={toggleTheme}>Cambiar tema</button>
      <button onClick={() => setTheme('dark')}>Modo oscuro</button>
      <button onClick={() => setTheme('light')}>Modo claro</button>
    </div>
  );
}
```

El tema se guarda automáticamente en `localStorage` y se aplica al cargar la página.

---

## VenueMapEditor

Editor de mapas de recintos interactivo basado en SVG puro. Permite diseñar la planta de cualquier espacio (restaurantes, parqueaderos, estadios, oficinas, eventos, etc.) con herramientas de dibujo de paredes, colocación de objetos, múltiples plantas y sistema de librerías de elementos personalizados.

### Importación

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

### Uso básico

El componente funciona sin ninguna prop — crea un mapa vacío con una planta por defecto:

```tsx
<VenueMapEditor />
```

Con configuración mínima:

```tsx
<VenueMapEditor
  width="100%"
  height="700px"
  onChange={(map) => console.log('Mapa actualizado:', map)}
/>
```

### Cargar y guardar un mapa desde código

El prop `initialMap` acepta un `VenueMap`. Cuando el valor cambia por referencia, el editor reinicia su historial al nuevo mapa.

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

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `initialMap` | `VenueMap` | mapa vacío | Mapa inicial |
| `onChange` | `(map: VenueMap) => void` | — | Callback en cada cambio |
| `domainConfigs` | `DomainConfig[]` | `[]` | Catálogos de tipos predefinidos |
| `domainConfig` | `DomainConfig` | — | **Obsoleto** — usa `domainConfigs` |
| `libraryStorageKey` | `string` | `'venueMapEditor:libraries'` | Clave de localStorage |
| `width` | `string \| number` | `'100%'` | Ancho |
| `height` | `string \| number` | `'600px'` | Alto |
| `gridSize` | `number` | `20` | Tamaño de cuadrícula |
| `showGrid` | `boolean` | `true` | Mostrar cuadrícula |
| `snapToGrid` | `boolean` | `false` | Snap a cuadrícula |
| `readOnly` | `boolean` | `false` | Modo lectura (edición deshabilitada) |
| `fixed` | `boolean` | `false` | Modo lectura + oculta toolbar |
| `elementStatus` | `ElementStatus[]` | — | Estados visuales por elemento |
| `onElementClick` | `(el: MapElement) => void` | — | Click genérico |
| `onElementTypeClick` | `Record<string, (el: MapElement) => void>` | — | Click por tipo |

### Modo Viewer

`VenueMapViewer` es un alias de `VenueMapEditor` con `fixed={true}`:

```tsx
import { VenueMapViewer } from 'neogestify-ui-components';
import type { ElementStatus } from 'neogestify-ui-components';

const estados: ElementStatus[] = [
  { elementId: 'mesa-1', status: 'occupied' },
  { elementId: 'mesa-2', status: 'free' },
  { elementId: 'mesa-3', status: 'reserved' },
];

<VenueMapViewer
  initialMap={myMap}
  elementStatus={estados}
  onElementTypeClick={{
    TABLE_ROUND: (el) => abrirReserva(el.id),
    TABLE_RECT: (el) => abrirReserva(el.id),
  }}
/>
```

### Múltiples catálogos (domainConfigs)

```tsx
const mobiliario: DomainConfig = {
  id: 'furniture',
  name: 'Mobiliario',
  elementTypes: [
    { id: 'CHAIR', label: 'Silla', shape: 'circle', defaultWidth: 30, defaultHeight: 30, color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_RECT', label: 'Mesa rect.', shape: 'rect', defaultWidth: 100, defaultHeight: 60, color: '#fef3c7', strokeColor: '#d97706' },
  ],
};

const iluminacion: DomainConfig = {
  id: 'lighting',
  name: 'Iluminación',
  elementTypes: [
    { id: 'SPOT_LIGHT', label: 'Foco', shape: 'circle', defaultWidth: 40, defaultHeight: 40, color: '#fef9c3', strokeColor: '#ca8a04' },
  ],
};

<VenueMapEditor domainConfigs={[mobiliario, iluminacion]} />
```

### Formato JSON de librería

```json
{
  "grupoDeMesas": {
    "name": "Mesas de restaurante",
    "objects": [
      {
        "id": "TABLE_ROUND_2",
        "label": "Mesa 2 pers.",
        "shape": "circle",
        "defaultWidth": 60,
        "defaultHeight": 60,
        "color": "#fef3c7",
        "strokeColor": "#d97706"
      },
      {
        "id": "TABLE_RECT_4",
        "label": "Mesa 4 pers.",
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

### Formas personalizadas

| `shape` | Descripción |
|---------|-------------|
| `rect` | Rectángulo |
| `circle` | Elipse/círculo |
| `arrow` | Flecha |
| `path` | SVG path personalizado |
| `svg` | SVG completo inline |

**Shape `path`:**
```json
{
  "id": "STAR",
  "label": "Estrella",
  "shape": "path",
  "svgPath": "M50 5 L61 35 ...",
  "viewBox": "0 0 100 100",
  "defaultWidth": 60,
  "defaultHeight": 60,
  "color": "#facc15",
  "strokeColor": "#ca8a04"
}
```

**Shape `svg`:**
```json
{
  "id": "CAR",
  "label": "Carro",
  "shape": "svg",
  "svgMarkup": "<svg viewBox=\"0 0 100 100\"><rect .../></svg>",
  "defaultWidth": 80,
  "defaultHeight": 80,
  "color": "#3b82f6",
  "strokeColor": "#1e40af"
}
```

### Colores de estado

| `status` | Color |
|----------|-------|
| `free` | Verde claro |
| `occupied` | Rojo claro |
| `reserved` | Amarillo |
| `disabled` | Gris |

### Persistencia de librerías

Las librerías importadas se guardan en `localStorage` bajo la clave `libraryStorageKey` (por defecto `'venueMapEditor:libraries'`). Al recargar la página se restauran automáticamente.

**Merge inteligente al importar:** si un grupo con el mismo `id` ya existe, se añaden únicamente los elementos cuyo `id` no esté duplicado. Los elementos existentes nunca se sobrescriben.

```tsx
// Cambiar la clave de almacenamiento (útil con múltiples editores)
<VenueMapEditor libraryStorageKey="mi-proyecto:libs" />

// Deshabilitar persistencia
<VenueMapEditor libraryStorageKey="" />
```

### Propiedades de cada objeto

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` | ✓ | Identificador único del tipo |
| `label` | `string` | ✓ | Nombre visible en la paleta |
| `shape` | `"rect" \| "circle" \| "arrow" \| "path" \| "svg"` | ✓ | Forma del objeto |
| `defaultWidth` | `number` | ✓ | Ancho inicial (unidades de canvas) |
| `defaultHeight` | `number` | ✓ | Alto inicial |
| `color` | `string` | ✓ | Color de relleno (#hex, rgb(), hsl()) |
| `strokeColor` | `string` | ✓ | Color del borde |
| `svgPath` | `string` | solo para `shape:"path"` | Atributo `d` del path SVG |
| `svgMarkup` | `string` | solo para `shape:"svg"` | Markup SVG completo |
| `viewBox` | `string` | — | Espacio de coordenadas del path |
| `fillRule` | `"nonzero" \| "evenodd"` | — | Regla de relleno SVG |

> **Hitbox de piso:** para formas personalizadas que no llenan su bounding box (estrellas, logos), la detección de bordes usa un cuadrado de lado `min(width, height)` centrado en el elemento.

### Shape `path` detallado

El campo `svgPath` acepta el atributo `d` de cualquier `<path>` SVG estándar. El sistema escala la figura para que ocupe exactamente el bounding box `width × height`.

```json
{
  "especiales": {
    "name": "Especiales",
    "objects": [
      {
        "id": "STAR",
        "label": "Estrella",
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
        "label": "Engranaje",
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

### Shape `svg` detallado

El campo `svgMarkup` acepta un **SVG completo** como string. El sistema extrae el `viewBox` del tag `<svg>` y renderiza los elementos internos escalados.

> **Seguridad:** el markup se sanitiza automáticamente eliminando `<script>`, `on*` event handlers, `javascript:` URIs y tags peligrosos.

```json
{
  "iconos": {
    "name": "Iconos SVG",
    "objects": [
      {
        "id": "CAR",
        "label": "Carro",
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

### Varios grupos en un archivo JSON

Un mismo archivo puede tener tantos grupos como necesites. Cada grupo aparece como una **pestaña separada** en la paleta.

```json
{
  "sillas":     { "name": "Sillas y asientos", "objects": [ ... ] },
  "servicio":   { "name": "Zona de servicio",  "objects": [ ... ] },
  "decoracion": { "name": "Decoración",         "objects": [ ... ] }
}
```

### Librería de ejemplo — Parqueadero

```json
{
  "spots": {
    "name": "Espacios",
    "objects": [
      { "id": "SPOT",        "label": "Normal",       "shape": "rect",   "defaultWidth": 60,  "defaultHeight": 120, "color": "#dbeafe", "strokeColor": "#3b82f6" },
      { "id": "SPOT_DISCAP", "label": "Discapacidad", "shape": "rect",   "defaultWidth": 80,  "defaultHeight": 120, "color": "#dcfce7", "strokeColor": "#22c55e" },
      { "id": "SPOT_EV",     "label": "Carga EV",     "shape": "rect",   "defaultWidth": 65,  "defaultHeight": 120, "color": "#d1fae5", "strokeColor": "#059669" },
      { "id": "SPOT_MOTO",   "label": "Moto",         "shape": "rect",   "defaultWidth": 35,  "defaultHeight": 75,  "color": "#fef9c3", "strokeColor": "#eab308" }
    ]
  },
  "circulacion": {
    "name": "Circulación",
    "objects": [
      { "id": "ENTRANCE", "label": "Entrada", "shape": "arrow", "defaultWidth": 85, "defaultHeight": 35, "color": "#dcfce7", "strokeColor": "#16a34a" },
      { "id": "EXIT",     "label": "Salida",  "shape": "arrow", "defaultWidth": 85, "defaultHeight": 35, "color": "#fee2e2", "strokeColor": "#dc2626" },
      { "id": "LANE",     "label": "Carril",  "shape": "rect",  "defaultWidth": 300,"defaultHeight": 60,  "color": "#f3f4f6", "strokeColor": "#9ca3af" }
    ]
  }
}
```

### Modelo de datos completo

```
VenueMap
├── id: string
├── name: string
├── libraries?: ElementLibrary          ← librerías importadas (embebidas en el mapa)
└── floors: Floor[]
    ├── id: string
    ├── name: string
    ├── order: number
    ├── area: FloorArea                 ← forma del piso (rect | polygon)
    │   ├── shape: 'rect' | 'polygon'
    │   ├── x?, y?, width?, height?    ← para shape: 'rect'
    │   └── points?: [number,number][] ← para shape: 'polygon'
    ├── wallNodes: WallNode[]           ← vértices del grafo de paredes
    ├── walls: Wall[]                   ← segmentos de pared con grosor y material
    └── elements: MapElement[]
        ├── id: string
        ├── type: string               ← id del ElementTypeDef de la librería
        ├── x, y, width, height: number
        ├── rotation: number           ← grados
        ├── label?: string
        └── metadata?: Record<string, unknown>  ← datos propios de tu app
```

El campo `metadata` está disponible para que cada app guarde datos propios por elemento (ej. ID de reserva, capacidad, propietario).

```tsx
const handleClick = (el: MapElement) => {
  const reservaId = el.metadata?.reservaId as string;
  abrirModal(reservaId);
};
```

### Herramientas del editor

| Tecla | Herramienta | Función |
|-------|-------------|---------|
| `V` | Seleccionar | Mover, redimensionar y rotar elementos. Arrastra el fondo del piso para moverlo. |
| `H` | Desplazar | Pan del canvas con click izquierdo. |
| `W` | Pared | Click fija el inicio; siguiente click termina el segmento (encadenado). Click derecho cancela. |
| `P` | Colocar | Click en el piso coloca el elemento seleccionado en la paleta. |
| `E` | Borrar | Click sobre un elemento o pared los elimina. |
| `Esc` | — | Vuelve a Seleccionar. |
| `Ctrl+Z / Y` | — | Deshacer / Rehacer. |
| `Ctrl+D` | — | Duplicar selección. |
| `Del / Backspace` | — | Eliminar selección. |
| `+ / -` | — | Zoom in / out. |
| Rueda ratón | — | Zoom centrado en el cursor. |
| Click medio + drag | — | Pan del canvas en cualquier modo. |

### Gestión de plantas

La barra de pestañas (visible incluso en viewer) permite:

- **Click** → cambiar de planta activa
- **Doble click** en el nombre → renombrar en línea
- **◀ ▶** → reordenar la planta activa
- **×** → eliminar la planta (mínimo 1)
- **+** → añadir nueva planta

### Forma del piso (Rect vs Polígono)

El botón **Rect / Poly** de la barra de herramientas alterna entre:

- **Rect**: rectángulo con 8 handles de redimensión en los bordes y esquinas.
- **Poly**: polígono libre. Arrastra los vértices (cuadrados azules). Click en el diamante central de una arista añade un vértice. Doble-click en un vértice lo elimina (mínimo 3).

Los elementos y paredes siempre se mantienen dentro del piso al moverlos o colocarlos.

### Exportar / Importar el mapa

| Botón | Función |
|-------|---------|
| ⬇ Exportar mapa | Descarga el estado actual como `.json` (incluye las librerías embebidas para portabilidad). |
| ⬆ Importar mapa | Carga un `.json` exportado previamente, reemplazando el mapa actual. |
| ⊞ Cargar librería | Carga un `.json` de elementos. Los grupos se añaden a la paleta como nuevas pestañas. Si el grupo ya existe, sólo se añaden los objetos con `id` nuevo. La librería se persiste automáticamente en `localStorage`. |

---

## ElementLibraryBuilder

Interfaz visual para crear librerías de elementos JSON para el VenueMapEditor:

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

Características:
- Crear/renombrar/eliminar grupos de elementos
- Añadir/editar/eliminar elementos
- Configurar forma, tamaño, colores
- Soporte para shapes: rect, circle, arrow, path, svg
- Vista previa del JSON generado
- Descargar como archivo .json
- Copiar al portapapeles

---

## Showcase / Demo

```bash
cd showcase
bun install
bun dev
```

Abre http://localhost:5173 en tu navegador.

## Desarrollo

### Build

```bash
bun install
bun run build
```

### Estructura del proyecto

```
ui-components/
├── src/
│   ├── components/
│   │   ├── html/          # Componentes HTML
│   │   ├── icons/        # Iconos SVG
│   │   ├── alerts/       # Alertas SweetAlert2
│   │   ├── VenueMapEditor/  # Editor de mapas
│   │   └── ElementLibraryBuilder/ # Constructor de librerías
│   ├── context/
│   │   └── theme/        # Sistema de tema
│   └── types/            # Tipos TypeScript
├── showcase/             # Demo/Showcase
└── dist/                 # Build output
```

## Modo Oscuro

Los componentes soportan modo oscuro automáticamente usando las clases `dark:` de Tailwind. Asegúrate de configurar el modo oscuro en tu proyecto:

```js
// tailwind.config.js
export default {
  darkMode: 'class',
}
```

Para activar el modo oscuro:

```tsx
document.documentElement.classList.add('dark');
```

O usa el sistema de tema de la librería (ThemeProvider + ThemeToggle).

## Licencia

MIT