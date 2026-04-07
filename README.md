# UI Components

Biblioteca de componentes UI reutilizables con React, Tailwind CSS y SweetAlert2.

## Características

- Componentes HTML preestilizados (Button, Input, Form, Select, Table, Modal)
- Colección de iconos SVG
- Alertas preconfiguradas con SweetAlert2
- Soporte para modo claro/oscuro
- TypeScript incluido
- Compatible con Tailwind CSS 4.1

## Instalación

Si estás usando workspaces con npm/bun:

### NPM

```bash
# En tu proyecto
npm i neogestify-ui-components
```

### BUN
```bash
# En tu proyecto
npm i neogestify-ui-components
```


## Configuración

### 1. Asegúrate de tener Tailwind CSS configurado en tu proyecto

```bash
bun add -D tailwindcss@4.1.0
```

Tu proyecto debe tener Tailwind configurado ya que los componentes solo usan clases de Tailwind (no incluyen CSS compilado).

### 2. Configura Tailwind para escanear los componentes de la biblioteca

**⚠️ IMPORTANTE:** Esta librería requiere que configures Tailwind para escanear sus archivos fuente.

**Para Tailwind CSS v4:**

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

La biblioteca está organizada en módulos independientes:

### Componentes HTML

```tsx
import { Button, Input, Form, Select, Table, Modal } from 'neogestify-ui-components/html';

function MiComponente() {
  return (
    <Form onSubmit={handleSubmit}>
      <Input
        label="Nombre"
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <Select
        label="País"
        options={[
          { value: 'mx', label: 'México' },
          { value: 'ar', label: 'Argentina' }
        ]}
      />

      <Button variant="primary" type="submit">
        Enviar
      </Button>
    </Form>
  );
}
```

### Iconos

```tsx
import {
  HomeIcon,
  SaveIcon,
  DeleteIcon,
  EditIcon
} from 'neogestify-ui-components/icons';

function MiComponente() {
  return (
    <div>
      <HomeIcon className="w-6 h-6 text-blue-500" />
      <SaveIcon className="w-5 h-5 text-green-600" />
    </div>
  );
}
```

### Alertas

```tsx
import {
  AlertaExito,
  AlertaError,
  AlertaAdvertencia,
  AlertaConfirmacion,
  AlertaToast
} from 'neogestify-ui-components/alerts';

function MiComponente() {
  const handleGuardar = async () => {
    try {
      await guardarDatos();
      AlertaExito('¡Guardado!', 'Los datos se guardaron correctamente');
    } catch (error) {
      AlertaError('Error', 'No se pudieron guardar los datos');
    }
  };

  const handleEliminar = () => {
    AlertaAdvertencia(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer',
      async () => {
        await eliminarDatos();
        AlertaToast('Eliminado', 'Registro eliminado', 'success');
      }
    );
  };

  return (
    <Button variant="danger" onClick={handleEliminar}>
      Eliminar
    </Button>
  );
}
```

### Sistema de Tema

El sistema de tema incluye un Context Provider y un componente toggle listo para usar.

#### 1. Configurar el ThemeProvider

Envuelve tu aplicación con el `ThemeProvider`:

```tsx
// main.tsx o App.tsx
import { ThemeProvider } from 'neogestify-ui-components/theme';

function Main() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
```

#### 2. Usar el ThemeToggle

```tsx
import { ThemeToggle } from 'neogestify-ui-components/theme';

function Header() {
  return (
    <nav>
      <ThemeToggle />
    </nav>
  );
}
```

#### 3. Usar el hook useTheme

```tsx
import { useTheme } from 'neogestify-ui-components/theme';

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

## Componentes Disponibles

### Button

Variantes: `primary`, `secondary`, `danger`, `success`, `warning`, `outline`, `icon`, `nav`, `link`, `toggle`

```tsx
<Button variant="primary" isLoading loadingText="Guardando...">
  Guardar
</Button>
```

### Input

Soporta tipos: `text`, `email`, `password`, `number`, `checkbox`, etc.

```tsx
<Input
  label="Email"
  type="email"
  error="Email inválido"
  helperText="Ingresa tu correo electrónico"
/>
```

### Select

```tsx
<Select
  label="Categoría"
  placeholder="Selecciona..."
  options={categorias}
  variant="default"
/>
```

### Table

```tsx
<Table
  headers={['ID', 'Nombre', 'Email']}
  rows={[
    ['1', 'Juan', 'juan@ejemplo.com'],
    ['2', 'María', 'maria@ejemplo.com']
  ]}
/>
```

### Modal

```tsx
const modalRef = useRef<ModalRef>(null);

<Modal
  ref={modalRef}
  title="Mi Modal"
  onClose={() => setShowModal(false)}
  footer={
    <Button onClick={() => modalRef.current?.handleClose()}>
      Cerrar
    </Button>
  }
>
  <p>Contenido del modal</p>
</Modal>
```

---

## VenueMapEditor

Editor de mapas de recintos interactivo basado en SVG puro. Permite diseñar la planta de cualquier espacio (restaurantes, parqueaderos, estadios, oficinas, eventos, etc.) con herramientas de dibujo de paredes, colocación de objetos, múltiples plantas y sistema de librerías de elementos personalizados.

### Importación

```tsx
import {
  VenueMapEditor,  // editor completo
  VenueMapViewer,  // modo solo lectura
} from 'neogestify-ui-components/VenueMapEditor';

// Tipos TypeScript
import type {
  VenueMap, Floor, MapElement,
  ElementTypeDef, ElementGroup, ElementLibrary,
  ElementStatus, VenueMapEditorProps,
} from 'neogestify-ui-components/VenueMapEditor';
```

---

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

---

### Cargar y guardar un mapa desde código

El prop `initialMap` acepta un `VenueMap` (del estado de la app, de una API, de `localStorage`, etc.). Cuando el valor cambia por referencia, el editor reinicia su historial al nuevo mapa. El ciclo `onChange → initialMap` es **seguro** — el componente detecta el eco de su propio `onChange` y no genera bucles infinitos.

```tsx
import { useState, useEffect } from 'react';
import { VenueMapEditor } from 'neogestify-ui-components/VenueMapEditor';
import type { VenueMap } from 'neogestify-ui-components/VenueMapEditor';

function App() {
  const [map, setMap] = useState<VenueMap | undefined>();

  // Carga asíncrona desde API
  useEffect(() => {
    fetch('/api/maps/1')
      .then(r => r.json())
      .then(setMap);
  }, []);

  // Guarda automáticamente en cada cambio
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

---

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `initialMap` | `VenueMap` | mapa vacío | Mapa inicial. Se puede actualizar desde fuera para recargar el editor. |
| `onChange` | `(map: VenueMap) => void` | — | Se llama en cada cambio del estado interno. |
| `domainConfig` | `DomainConfig` | vacío | Tipos de elementos predefinidos disponibles en la paleta (opcional). |
| `width` | `string \| number` | `'100%'` | Ancho del componente. |
| `height` | `string \| number` | `'600px'` | Alto del componente. |
| `gridSize` | `number` | `20` | Tamaño de la cuadrícula en unidades de canvas. |
| `showGrid` | `boolean` | `true` | Mostrar/ocultar cuadrícula al iniciar. |
| `snapToGrid` | `boolean` | `false` | Activar snap de elementos a la cuadrícula. |
| `readOnly` | `boolean` | `false` | Modo lectura: no se puede editar pero sí hacer pan/zoom. |
| `fixed` | `boolean` | `false` | Igual que `readOnly` pero además oculta la barra de herramientas. Pensado para el viewer en producción. |
| `elementStatus` | `ElementStatus[]` | — | Array de estados visuales por elemento (libre, ocupado, reservado, deshabilitado). |
| `onElementClick` | `(el: MapElement) => void` | — | Callback genérico al hacer click en cualquier elemento (en modo viewer). |
| `onElementTypeClick` | `Record<string, (el: MapElement) => void>` | — | Callbacks por tipo de elemento. El tipo específico tiene prioridad sobre `onElementClick`. |

---

### Modo Viewer

`VenueMapViewer` es un alias de `VenueMapEditor` con `fixed={true}`. Úsalo para mostrar el mapa en producción con elementos interactivos:

```tsx
import { VenueMapViewer } from 'neogestify-ui-components/VenueMapEditor';
import type { ElementStatus } from 'neogestify-ui-components/VenueMapEditor';

const estados: ElementStatus[] = [
  { elementId: 'mesa-1', status: 'occupied' },
  { elementId: 'mesa-2', status: 'free' },
  { elementId: 'mesa-3', status: 'reserved' },
  { elementId: 'spot-4', status: 'disabled' },
];

<VenueMapViewer
  initialMap={myMap}
  elementStatus={estados}
  onElementTypeClick={{
    // El key es el `id` del tipo definido en la librería JSON
    TABLE_ROUND: (el) => abrirReserva(el.id),
    TABLE_RECT:  (el) => abrirReserva(el.id),
    PARKING_SPOT:(el) => asignarEspacio(el.id),
  }}
  // Fallback para tipos sin handler específico
  onElementClick={(el) => console.log('click en', el.type, el.id)}
/>
```

**Colores de estado:**

| `status` | Color |
|----------|-------|
| `free` | Verde claro |
| `occupied` | Rojo claro |
| `reserved` | Amarillo |
| `disabled` | Gris |

---

### Crear una librería de elementos (JSON)

Los elementos que aparecen en la paleta del editor se definen en archivos JSON que el usuario carga desde el botón **⊞** (Cargar librería) de la barra de herramientas. Una vez cargada, la librería queda **embebida dentro del propio mapa** y se exporta junto a él — no se pierde al reabrir el archivo.

#### Formato del JSON

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
  },
  "infraestructura": {
    "name": "Infraestructura",
    "objects": [
      {
        "id": "PILLAR",
        "label": "Columna",
        "shape": "circle",
        "defaultWidth": 25,
        "defaultHeight": 25,
        "color": "#e5e7eb",
        "strokeColor": "#6b7280"
      },
      {
        "id": "ENTRANCE",
        "label": "Entrada",
        "shape": "arrow",
        "defaultWidth": 80,
        "defaultHeight": 30,
        "color": "#dcfce7",
        "strokeColor": "#16a34a"
      }
    ]
  }
}
```

#### Formas personalizadas SVG (`shape: "path"`)

Ahora puedes definir cualquier figura SVG usando un path:

```json
{
  "mi_libreria": {
    "name": "Mi librería",
    "objects": [
      {
        "id": "STAR",
        "label": "Estrella",
        "shape": "path",
        "svgPath": "M50 5 L61 35 L95 35 L68 57 L79 91 L50 70 L21 91 L32 57 L5 35 L39 35 Z",
        "viewBox": "0 0 100 100",
        "defaultWidth": 60,
        "defaultHeight": 60,
        "color": "#facc15",
        "strokeColor": "#ca8a04"
      }
    ]
  }
}
```

**Propiedades para `shape: "path"`:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `svgPath` | `string` | **requerido** | El atributo `d` del elemento `<path>` SVG |
| `viewBox` | `string` | `"0 0 100 100"` | Espacio de coordenadas del path (formato: `"minX minY width height"`) |

> **Nota:** El path se escala automáticamente para llenar el bounding box `width × height` del elemento. El `strokeWidth` se compensa por el factor de escala para que sea visualmente consistente con los otros shapes.

#### Propiedades de cada objeto

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | Identificador único del tipo. Debe ser **único en toda la librería**. Se usa como key en `onElementTypeClick`. |
| `label` | `string` | Nombre visible en la paleta. |
| `shape` | `"rect" \| "circle" \| "arrow" \| "path"` | Forma del objeto en el canvas. |
| `defaultWidth` | `number` | Ancho inicial al colocar el elemento (unidades de canvas ≈ píxeles a zoom 1×). |
| `defaultHeight` | `number` | Alto inicial. |
| `color` | `string` | Color de relleno (cualquier valor CSS: `#hex`, `rgb()`, `hsl()`, etc.). |
| `strokeColor` | `string` | Color del borde. |
| `svgPath` | `string` | **Requerido si `shape="path"`**. Atributo `d` del path SVG. |
| `viewBox` | `string` | **Opcional si `shape="path"`**. ViewBox del path (default: `"0 0 100 100"`). |

#### Formas disponibles

| `shape` | Descripción | Caso de uso típico |
|---------|-------------|-------------------|
| `rect` | Rectángulo | Mesas, espacios de parqueo, habitaciones |
| `circle` | Elipse (círculo si `width === height`) | Mesas redondas, columnas, plantas |
| `arrow` | Flecha apuntando a la derecha | Entradas, salidas, sentidos de circulación |
| `path` | Forma SVG personalizada | Logos, iconos, estrellas, formas complejas |

#### Colisión con el piso

La detección de colisión con el piso usa un **cuadrado de lado `min(width, height)` centrado en el elemento**, en vez del bounding box completo. Esto evita que formas que no llenan su bounding box (estrellas, iconos, logos) queden excesivamente restringidas al moverse cerca del borde del piso.

#### Varios grupos en un archivo

Un mismo archivo puede tener tantos grupos como necesites. Cada grupo aparece como una sección separada en la paleta. Se pueden cargar múltiples archivos — los grupos se acumulan. Cada grupo importado muestra un botón **×** para eliminarlo.

```json
{
  "sillas":     { "name": "Sillas y asientos", "objects": [ ... ] },
  "servicio":   { "name": "Zona de servicio",  "objects": [ ... ] },
  "decoracion": { "name": "Decoración",         "objects": [ ... ] }
}
```

#### Librería de ejemplo — Parqueadero

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

---

### Modelo de datos TypeScript

El estado del editor se serializa en un objeto `VenueMap`. Puedes guardarlo en tu base de datos como JSON y restaurarlo con `initialMap`.

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

El campo `metadata` en `MapElement` está disponible para que cada app guarde datos propios por elemento (ej. ID de reserva, capacidad, propietario, estado personalizado).

```tsx
// Ejemplo: guardar datos de negocio en metadata al crear elementos
const handleClick = (el: MapElement) => {
  // El metadata lo pone tu app, no el editor
  const reservaId = el.metadata?.reservaId as string;
  abrirModal(reservaId);
};
```

---

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

---

### Gestión de plantas

La barra de pestañas (visible incluso en viewer) permite:

- **Click** → cambiar de planta activa
- **Doble click** en el nombre → renombrar en línea
- **◀ ▶** → reordenar la planta activa
- **×** → eliminar la planta (mínimo 1)
- **+** → añadir nueva planta

---

### Forma del piso (Rect vs Polígono)

El botón **Rect / Poly** de la barra de herramientas alterna entre:

- **Rect**: rectángulo con 8 handles de redimensión en los bordes y esquinas.
- **Poly**: polígono libre. Arrastra los vértices (cuadrados azules). Click en el diamante central de una arista añade un vértice. Doble-click en un vértice lo elimina (mínimo 3).

Los elementos y paredes siempre se mantienen dentro del piso al moverlos o colocarlos.

---

### Exportar / Importar el mapa

| Botón | Función |
|-------|---------|
| ⬇ Exportar mapa | Descarga el estado actual como `.json` (incluye las librerías embebidas). |
| ⬆ Importar mapa | Carga un `.json` exportado previamente, reemplazando el mapa actual. |
| ⊞ Cargar librería | Carga un `.json` de elementos y añade sus grupos a la paleta sin reemplazar los existentes. |

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
│   │   ├── html/        # Componentes HTML
│   │   ├── icons/       # Iconos SVG
│   │   └── alerts/      # Alertas SweetAlert2
│   └── types/           # Tipos TypeScript
├── showcase/            # Demo/Showcase
└── dist/                # Build output
```

## Modo Oscuro

Los componentes soportan modo oscuro automáticamente usando las clases `dark:` de Tailwind. Asegúrate de configurar el modo oscuro en tu proyecto:

```js
// tailwind.config.js
export default {
  darkMode: 'class', // o 'media'
  // ...
}
```

Para activar el modo oscuro:

```tsx
// Agregar/quitar la clase 'dark' en el html
document.documentElement.classList.add('dark');
```

## Licencia

MIT
