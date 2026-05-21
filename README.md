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

@theme {
    /* Configuración de dark mode para Tailwind v4 */
}

@variant dark (&:where(.dark, .dark *)) {
    /* Variante dark mode */
}
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

Variantes: `primary`, `secondary`, `danger`, `success`, `warning`, `outline`, `ghost`, `icon`, `nav`, `link`, `toggle`, `custom`

```tsx
<Button variant="primary" size="lg" isLoading loadingText="Guardando...">
  Guardar
</Button>

<Button variant="ghost" leftIcon={<SaveIcon className="w-4 h-4" />}>
  Exportar
</Button>

<Button variant="primary" fullWidth shape="pill">
  Continuar
</Button>

<Button variant="toggle" isActive={active} onClick={toggle}>
  Toggle
</Button>
```

Props:
- `variant`: Variante del botón (`primary` | `secondary` | `icon` | `danger` | `success` | `outline` | `ghost` | `nav` | `custom` | `link` | `warning` | `toggle`)
- `size`: Tamaño (`'sm'` | `'md'` | `'lg'`). Default: `'md'`
- `shape`: Forma del borde (`'rounded'` | `'pill'` | `'square'`). Default: `'rounded'` (`'pill'` para `icon`)
- `leftIcon`: Icono antes del texto (ReactNode)
- `rightIcon`: Icono después del texto (ReactNode)
- `fullWidth`: Ocupa el 100% del ancho (boolean)
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
  required
  error="Email inválido"
  helperText="Ingresa tu correo electrónico"
/>

{/* Variantes visuales */}
<Input label="Nombre" variant="filled" size="lg" />
<Input label="Buscar" variant="minimal" />

{/* Con icono */}
<Input
  label="Buscar"
  icon={<SearchIcon className="w-4 h-4" />}
  iconSide="left"
/>

{/* Addons de texto (prefix / suffix) */}
<Input label="Precio" prefix="$" suffix="USD" />
<Input label="Sitio web" prefix="https://" suffix=".com" />

{/* Clearable */}
<Input
  label="Filtrar"
  value={filtro}
  onChange={e => setFiltro(e.target.value)}
  clearable
  onClear={() => setFiltro('')}
/>

{/* Checkbox */}
<Input type="checkbox" label="Acepto términos" />
```

Props:
- `label`: Etiqueta del campo (string | ReactNode)
- `type`: Tipo de input HTML (`text`, `email`, `password`, `number`, `checkbox`, `radio`, `date`, `tel`, `url`, `file`)
- `variant`: Variante visual (`'default'` | `'outline'` | `'filled'` | `'minimal'`). Default: `'default'`
- `size`: Tamaño (`'sm'` | `'md'` | `'lg'`). Default: `'md'`
- `prefix`: Addon pegado al borde izquierdo (ReactNode)
- `suffix`: Addon pegado al borde derecho (ReactNode)
- `clearable`: Muestra botón `×` para limpiar cuando hay valor (boolean)
- `onClear`: Callback al hacer click en el botón limpiar
- `placeholder`: Placeholder
- `value`: Valor controlado
- `onChange`: Handler de cambio
- `error`: Mensaje de error (string)
- `helperText`: Texto de ayuda
- `icon`: Icono a mostrar (ReactNode)
- `iconSide`: Lado del icono (`'left'` | `'right'`)
- `required`: Muestra asterisco `*` en el label (boolean)
- `disabled`: Deshabilitado
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
  autoResize
/>

{/* Con contador de caracteres */}
<TextArea
  label="Bio"
  value={bio}
  onChange={e => setBio(e.target.value)}
  maxLength={200}
  showCount
  variant="filled"
/>

{/* Sin redimensión */}
<TextArea label="Notas" resize="none" rows={4} />
```

Props:
- `label`: Etiqueta (string | ReactNode)
- `placeholder`: Placeholder
- `value`: Valor controlado
- `onChange`: Handler de cambio
- `rows`: Número de filas (heredado de HTML)
- `variant`: Variante visual (`'default'` | `'outline'` | `'filled'` | `'minimal'`)
- `size`: Tamaño (`'small'` | `'medium'` | `'large'`)
- `autoResize`: Crece automáticamente al escribir (boolean)
- `showCount`: Muestra contador de caracteres. Con `maxLength` muestra `12 / 200` (boolean)
- `resize`: Control de redimensión (`'vertical'` | `'horizontal'` | `'both'` | `'none'`). Default: `'vertical'`
- `required`: Muestra asterisco `*` en el label (boolean)
- `error`: Mensaje de error
- `helperText`: Texto de ayuda
- `disabled`: Deshabilitado
- `className`: Clases adicionales
- `id`: ID del textarea (auto-generado si no se provee)

---

### Form

```tsx
{/* Variante card con borde y sombra reales */}
<Form onSubmit={handleSubmit} variant="card">
  <Input label="Nombre" placeholder="Tu nombre" />
  <Input label="Email" type="email" />
  <Button variant="primary" type="submit">Enviar</Button>
</Form>

{/* Grid de 2 columnas */}
<Form variant="card" columns={2}>
  <Input label="Nombre" />
  <Input label="Apellido" />
  <Input label="Email" type="email" />
  <Input label="Teléfono" type="tel" />
  <Button variant="primary" type="submit" fullWidth>Registrar</Button>
</Form>

{/* Grid de 3 columnas */}
<Form columns={3}>
  <Input label="Calle" />
  <Input label="Ciudad" />
  <Input label="País" />
</Form>

<Form variant="inline">
  <Input label="Buscar" placeholder="..." />
  <Button variant="secondary">Buscar</Button>
</Form>
```

Props:
- `onSubmit`: Handler del submit
- `variant`: Variante del layout (`'default'` | `'modal'` | `'card'` | `'inline'` | `'compact'`)
  - `card`: Ahora incluye fondo blanco/oscuro, borde y sombra reales
- `columns`: Número de columnas del grid CSS (cualquier entero ≥ 2 activa el layout de grid con `gap` de `1rem`; con `1` se comporta como `default`)
- `className`: Clases adicionales
- Hereda props de `<form>` (method, action, etc.)

---

### Select

```tsx
<Select
  label="Categoría"
  placeholder="Selecciona..."
  required
  options={[
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2', disabled: true },
    { value: '3', label: 'Opción 3', selected: true },
  ]}
  error="Debes seleccionar una categoría"
/>

{/* Variantes visuales */}
<Select label="País" variant="outline" size="lg" />
<Select label="Estado" variant="filled" />
<Select label="Tipo" variant="minimal" />

{/* Con icono izquierdo */}
<Select
  label="Categoría"
  icon={<CategorieIcon className="w-4 h-4" />}
  options={opciones}
/>
```

Props:
- `label`: Etiqueta (string | ReactNode)
- `placeholder`: Placeholder
- `options`: Array de opciones:
  - `value`: Valor de la opción (string | number)
  - `label`: Texto a mostrar
  - `disabled`: Deshabilita la opción (boolean)
  - `selected`: Pre-selecciona la opción en modo no controlado (boolean)
- `variant`: Variante visual (`'default'` | `'outline'` | `'filled'` | `'minimal'` | `'custom'`). `'small'` sigue siendo válido por compatibilidad (equivale a `size='sm'`)
- `size`: Tamaño (`'sm'` | `'md'` | `'lg'`). Default: `'md'`
- `icon`: Icono en el lado izquierdo (ReactNode)
- `value`: Valor seleccionado (controlado)
- `onChange`: Handler de cambio
- `error`: Estado de error. Si es `string` muestra el mensaje; si es `true` solo aplica estilos de error
- `helperText`: Texto de ayuda (se muestra si no hay `error` string)
- `required`: Muestra asterisco `*` en el label (boolean)
- `disabled`: Deshabilita el select
- `className`: Clases adicionales
- `id`: ID del select (auto-generado si no se provee)

---

### Table

```tsx
<Table
  columns={[
    { header: 'ID', align: 'center', width: 60 },
    { header: 'Nombre', className: 'font-bold', sticky: true },
    { header: 'Email' },
    { header: 'Ventas', key: 'ventas', sortable: true, align: 'right' },
  ]}
  rows={[
    ['1', 'Juan', 'juan@ejemplo.com', '$1,200'],
    ['2', 'María', 'maria@ejemplo.com', '$3,400'],
  ]}
  variant="striped"
  size="sm"
  rounded
  shadow
  onRowClick={(index) => console.log('Click fila', index)}
  sortState={{ key: 'ventas', direction: 'desc' }}
  onSort={(key) => console.log('Ordenar por', key)}
/>
```

#### Variantes

| Variante | Descripción |
|----------|-------------|
| `default` | Fondo blanco con divisores horizontales y hover gris |
| `striped` | Filas alternas gris/blanco con hover azul |
| `bordered` | Bordes en todas las celdas |
| `minimal` | Sin fondos, solo línea inferior en header y celdas |
| `ghost` | Sin fondos, borde inferior doble en header, divisores sutiles |
| `card` | Header con fondo suave, divisores finos entre filas |
| `accent` | Header azul (`bg-blue-600`) con texto blanco |
| `dark` | Header oscuro (`bg-gray-800`) con texto claro |
| `custom` | Sin estilos predefinidos, control total vía clases |

#### ColumnDef

```tsx
interface ColumnDef {
  header: ReactNode;           // Contenido del encabezado
  className?: string;          // Clase para th y td de esta columna
  align?: 'left' | 'center' | 'right';
  width?: string | number;     // Ancho fijo (px, %, rem…)
  minWidth?: string | number;  // Ancho mínimo
  sticky?: boolean;            // Fija la columna a la izquierda en scroll horizontal
  thStyle?: CSSProperties;     // Estilos inline solo para <th>
  tdStyle?: CSSProperties;     // Estilos inline solo para <td>
  sortable?: boolean;          // Muestra indicador de ordenación (requiere key)
  key?: string;                // Clave usada en sortState y onSort
}
```

#### Props

- `columns`: Array de `ColumnDef` o strings/ReactNode simples
- `rows`: Datos del cuerpo (`ReactNode[][]`)
- `variant`: Variante visual (ver tabla arriba). Default: `'default'`
- `size`: Tamaño de padding (`'sm'` | `'md'` | `'lg'`). Default: `'md'`
- `className`: Clases adicionales para el wrapper `<div>`
- `tableClassName`: Clases adicionales para el `<table>`
- `thClassName`: Clases adicionales para cada `<th>`
- `tdClassName`: Clases adicionales para cada `<td>`
- `trClassName`: Clases por fila (`string` | `(rowIndex: number) => string`)
- `emptyState`: Contenido cuando no hay datos (ReactNode)
- `onRowClick`: Callback al hacer click en una fila (`(rowIndex) => void`)
- `hideHeader`: Oculta el `<thead>` (boolean)
- `style`: Estilos inline para el `<table>`
- `stickyHeader`: Fija el `<thead>` al hacer scroll vertical (boolean)
- `caption`: Caption accesible renderizado en `<caption>`
- `footerRows`: Filas del `<tfoot>` (`ReactNode[][]`)
- `loading`: Muestra esqueleto animado en lugar de filas (boolean)
- `loadingRows`: Número de filas esqueleto cuando `loading=true`. Default: `4`
- `getRowStyle`: Estilo inline por fila (`(rowIndex: number) => CSSProperties`)
- `rounded`: Agrega `rounded-lg` al wrapper (boolean)
- `shadow`: Agrega sombra al wrapper (boolean)
- `hoverable`: Desactiva el efecto hover si es `false`. Default: `true`
- `sortState`: Estado de ordenación activo (`{ key: string, direction: 'asc' | 'desc' }`)
- `onSort`: Callback al hacer click en un `<th>` sortable (`(key: string) => void`)

#### Ejemplos adicionales

```tsx
{/* Con loading skeleton */}
<Table columns={['Nombre', 'Email', 'Rol']} rows={[]} loading loadingRows={5} />

{/* Con footer de totales */}
<Table
  columns={['Producto', 'Cantidad', 'Total']}
  rows={[['Teclado', '2', '$60'], ['Mouse', '3', '$45']]}
  footerRows={[['', 'Total', '$105']]}
  variant="card"
  rounded
  shadow
/>

{/* Header fijo + columna sticky + sort */}
<Table
  columns={[
    { header: '#', sticky: true, width: 50 },
    { header: 'Nombre', sticky: true },
    { header: 'Fecha', key: 'fecha', sortable: true },
    { header: 'Monto', key: 'monto', sortable: true, align: 'right' },
  ]}
  rows={data}
  stickyHeader
  sortState={sort}
  onSort={(key) => setSort(prev => ({ key, direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }))}
/>

{/* Filas coloreadas dinámicamente */}
<Table
  columns={['Estado', 'Mensaje']}
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
  title="Confirmar acción"
  size="md"
  variant="danger"
  closeOnBackdrop
  closeOnEsc
  onClose={() => setShowModal(false)}
  footer={
    <>
      <Button variant="secondary" onClick={() => modalRef.current?.handleClose()}>
        Cancelar
      </Button>
      <Button variant="danger" onClick={handleConfirm}>
        Eliminar
      </Button>
    </>
  }
>
  <p>¿Estás seguro de que deseas continuar?</p>
</Modal>

{/* Con title como ReactNode */}
<Modal
  title={<span className="flex items-center gap-2"><InfoIcon className="w-5 h-5" /> Información</span>}
  size="lg"
  onClose={onClose}
>
  {children}
</Modal>
```

#### Variantes de header

| Variante | Descripción |
|----------|-------------|
| `default` | Header gris neutro |
| `danger` | Header rojo para acciones destructivas |
| `success` | Header verde para confirmaciones positivas |
| `warning` | Header amarillo para advertencias |

#### Tamaños

| Size | Ancho máximo |
|------|-------------|
| `sm` | `max-w-sm` |
| `md` | `max-w-md` |
| `lg` | `max-w-2xl` |
| `xl` | `max-w-4xl` |
| `full` | `95vw` |

Props:
- `title`: Título del modal (string | ReactNode)
- `children`: Contenido
- `footer`: Contenido del pie
- `onClose`: Handler al cerrar
- `size`: Tamaño predefinido (`'sm'` | `'md'` | `'lg'` | `'xl'` | `'full'`)
- `maxWidth`: Clase de ancho personalizada (deprecated, usar `size`)
- `variant`: Estilo del header (`'default'` | `'danger'` | `'success'` | `'warning'`)
- `closeOnBackdrop`: Cierra al hacer click fuera del modal (boolean, default: `false`)
- `closeOnEsc`: Cierra al presionar Escape (boolean, default: `false`)
- `showCloseButton`: Muestra botón de cerrar (boolean, default: `true`)
- `zIndex`: Z-index del modal (number, default: `50`)

Métodos del ref (`ModalRef`):
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

{/* Overlay sobre el contenedor (el padre debe tener position: relative) */}
<div className="relative h-48">
  <MiContenido />
  {cargando && <Loading overlay variant="ring" color="primary" />}
</div>

{/* Overlay de página completa */}
{cargando && <Loading fullPage label="Procesando..." />}
```

Props:
- `variant`: Variante del loader (`'spinner'` | `'dots'` | `'pulse'` | `'bars'` | `'ring'` | `'cube'`)
- `size`: Tamaño (`'small'` | `'medium'` | `'large'` | `'xl'`)
- `color`: Color (`'primary'` | `'white'` | `'gray'` | `'success'` | `'danger'` | `'warning'`)
- `label`: Texto debajo del icono
- `overlay`: Cubre el contenedor más cercano con `position: relative` con fondo semitransparente (boolean)
- `fullPage`: Overlay `fixed` que cubre toda la pantalla (`z-50`) (boolean)
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
- ChevronDownIcon, SortAscIcon, SortDescIcon, SortBothIcon

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