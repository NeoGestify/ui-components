# UI Components

Biblioteca de componentes UI reutilizables con React, Tailwind CSS y SweetAlert2.

[Construyamos juntos esta libreria](https://github.com/NeoGestify/ui-components)

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
bun i neogestify-ui-components
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

@variant dark (&:where(.dark, .dark *)) {}
```

> 📖 **Para más detalles sobre la configuración de Tailwind v4, incluyendo monorepos y troubleshooting, consulta [TAILWIND_V4_SETUP.md](./TAILWIND_V4_SETUP.md)**

### 3. Instala las dependencias peer

```bash
bun add react react-dom sweetalert2 sweetalert2-react-content
```

## Uso

La biblioteca está organizada en módulos independientes:

### Componentes HTML

```tsx
import { Button, Input, Form, Select, Table, Modal } from '@mi-empresa/ui-components/html';

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
} from '@mi-empresa/ui-components/icons';

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
} from '@mi-empresa/ui-components/alerts';

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
import { ThemeProvider } from '@mi-empresa/ui-components/context/theme';

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
import { ThemeToggle } from '@mi-empresa/ui-components/theme';

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
import { useTheme } from '@mi-empresa/ui-components/context/theme';

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

## Showcase / Demo

Para ver todos los componentes en acción:

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
