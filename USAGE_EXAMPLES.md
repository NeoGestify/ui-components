# Ejemplos de Uso - UI Components

## Instalación en tus proyectos

### Opción 1: Link local (desarrollo)

```bash
# En ui-components
cd /mnt/1TBNso/proyectosPersonales/ui-components
bun link

# En tu proyecto
cd /mnt/1TBNso/proyectosPersonales/tu-proyecto
bun link @mi-empresa/ui-components
```

### Opción 2: Path relativo en package.json

```json
{
  "dependencies": {
    "@mi-empresa/ui-components": "file:../ui-components"
  }
}
```

## Configuración de Tailwind en tu proyecto

Asegúrate de tener esta configuración:

```js
// tailwind.config.js (Tailwind 4.1)
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@mi-empresa/ui-components/dist/**/*.{js,mjs}"
  ],
  darkMode: 'class',
}
```

Para Tailwind 4.1, en tu CSS:

```css
/* src/index.css */
@import "tailwindcss";

@source "../src";

@variant dark (&:is(.dark *));
```

---

## 1. Componentes HTML

### Importación

```tsx
import {
  Button,
  Input,
  Form,
  Select,
  Table,
  Modal
} from '@mi-empresa/ui-components/html';
import type { ModalRef } from '@mi-empresa/ui-components/html';
```

### Ejemplo completo de un formulario

```tsx
import { useState } from 'react';
import { Button, Input, Form, Select } from '@mi-empresa/ui-components/html';

function RegistroUsuario() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    pais: '',
    aceptaTerminos: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos enviados:', formData);
  };

  return (
    <Form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <Input
        label="Nombre completo"
        type="text"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        placeholder="Juan Pérez"
        helperText="Ingresa tu nombre completo"
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="correo@ejemplo.com"
        required
      />

      <Select
        label="País"
        value={formData.pais}
        onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
        placeholder="Selecciona tu país"
        options={[
          { value: 'mx', label: 'México' },
          { value: 'ar', label: 'Argentina' },
          { value: 'cl', label: 'Chile' }
        ]}
        required
      />

      <Input
        type="checkbox"
        label="Acepto los términos y condiciones"
        checked={formData.aceptaTerminos}
        onChange={(e) => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
      />

      <div className="flex gap-2">
        <Button variant="primary" type="submit">
          Registrarse
        </Button>
        <Button variant="secondary" type="button">
          Cancelar
        </Button>
      </div>
    </Form>
  );
}
```

### Ejemplo de Modal

```tsx
import { useState, useRef } from 'react';
import { Modal, Button, Input } from '@mi-empresa/ui-components/html';
import type { ModalRef } from '@mi-empresa/ui-components/html';

function MiComponente() {
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const modalRef = useRef<ModalRef>(null);

  const handleGuardar = () => {
    console.log('Guardando:', nombre);
    modalRef.current?.handleClose();
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Abrir Modal
      </Button>

      {showModal && (
        <Modal
          ref={modalRef}
          title="Editar Usuario"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => modalRef.current?.handleClose()}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleGuardar}>
                Guardar
              </Button>
            </>
          }
        >
          <Input
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingresa el nombre"
          />
        </Modal>
      )}
    </>
  );
}
```

### Ejemplo de Tabla

```tsx
import { Table, Button } from '@mi-empresa/ui-components/html';
import { EditIcon, DeleteIcon } from '@mi-empresa/ui-components/icons';

function ListaUsuarios() {
  const usuarios = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@ejemplo.com', rol: 'Admin' },
    { id: 2, nombre: 'María García', email: 'maria@ejemplo.com', rol: 'Usuario' }
  ];

  const handleEditar = (id: number) => console.log('Editar', id);
  const handleEliminar = (id: number) => console.log('Eliminar', id);

  return (
    <Table
      headers={['ID', 'Nombre', 'Email', 'Rol', 'Acciones']}
      rows={usuarios.map(user => [
        user.id.toString(),
        user.nombre,
        user.email,
        user.rol,
        <div key={user.id} className="flex gap-2">
          <Button variant="icon" onClick={() => handleEditar(user.id)}>
            <EditIcon className="w-4 h-4" />
          </Button>
          <Button variant="icon" onClick={() => handleEliminar(user.id)}>
            <DeleteIcon className="w-4 h-4" />
          </Button>
        </div>
      ])}
    />
  );
}
```

---

## 2. Iconos

### Importación

```tsx
import {
  HomeIcon,
  SaveIcon,
  DeleteIcon,
  EditIcon,
  SearchIcon,
  CheckIcon,
  CloseIcon,
  AddIcon,
  SpinnerIcon,
  // ... más de 40 iconos disponibles
} from '@mi-empresa/ui-components/icons';
```

### Ejemplo de uso

```tsx
import { HomeIcon, SaveIcon, SearchIcon } from '@mi-empresa/ui-components/icons';
import { Button } from '@mi-empresa/ui-components/html';

function Toolbar() {
  return (
    <div className="flex gap-2">
      <Button variant="icon">
        <HomeIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </Button>

      <Button variant="primary">
        <SaveIcon className="w-5 h-5 mr-2" />
        Guardar
      </Button>

      <div className="relative">
        <SearchIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
        <input
          className="pl-10 pr-4 py-2 border rounded-lg"
          placeholder="Buscar..."
        />
      </div>
    </div>
  );
}
```

---

## 3. Alertas (SweetAlert2)

### Importación

```tsx
import {
  Alerta,
  AlertaExito,
  AlertaError,
  AlertaAdvertencia,
  AlertaConfirmacion,
  AlertaToast
} from '@mi-empresa/ui-components/alerts';
```

### Ejemplo de CRUD completo

```tsx
import { Button } from '@mi-empresa/ui-components/html';
import {
  AlertaExito,
  AlertaError,
  AlertaAdvertencia,
  AlertaConfirmacion,
  AlertaToast
} from '@mi-empresa/ui-components/alerts';

function GestionProductos() {
  const handleCrear = async () => {
    try {
      // Simular API call
      await crearProducto();
      AlertaExito('¡Creado!', 'El producto se creó correctamente');
    } catch (error) {
      AlertaError('Error', 'No se pudo crear el producto');
    }
  };

  const handleEditar = async (id: number) => {
    try {
      await editarProducto(id);
      AlertaToast('Actualizado', 'Producto actualizado', 'success');
    } catch (error) {
      AlertaToast('Error', 'No se pudo actualizar', 'error');
    }
  };

  const handleEliminar = (id: number) => {
    AlertaAdvertencia(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer',
      async () => {
        try {
          await eliminarProducto(id);
          AlertaToast('Eliminado', 'Producto eliminado', 'success');
        } catch (error) {
          AlertaError('Error', 'No se pudo eliminar el producto');
        }
      },
      () => {
        AlertaToast('Cancelado', 'Operación cancelada', 'info');
      }
    );
  };

  const handleConfirmacion = () => {
    AlertaConfirmacion(
      'Confirmar acción',
      '¿Deseas continuar con esta operación?',
      () => console.log('Confirmado'),
      () => console.log('Cancelado')
    );
  };

  return (
    <div className="flex gap-2">
      <Button variant="success" onClick={handleCrear}>
        Crear Producto
      </Button>
      <Button variant="primary" onClick={() => handleEditar(1)}>
        Editar
      </Button>
      <Button variant="danger" onClick={() => handleEliminar(1)}>
        Eliminar
      </Button>
    </div>
  );
}
```

### Alerta personalizada completa

```tsx
import { Alerta } from '@mi-empresa/ui-components/alerts';

async function mostrarFormularioEnAlerta() {
  const result = await Alerta({
    title: 'Ingresa tu nombre',
    text: 'Por favor completa el siguiente campo',
    icon: 'question',
    input: 'text',
    inputLabel: 'Nombre completo',
    inputPlaceholder: 'Juan Pérez',
    inputValidator: (value) => {
      if (!value) {
        return 'El nombre es requerido';
      }
      if (value.length < 3) {
        return 'El nombre debe tener al menos 3 caracteres';
      }
      return null;
    },
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    console.log('Nombre ingresado:', result.value);
  }
}
```

---

## 4. Sistema de Tema

### Importación

```tsx
// Context Provider y Hook
import { ThemeProvider, useTheme } from '@mi-empresa/ui-components/context/theme';
import type { Theme } from '@mi-empresa/ui-components/context/theme';

// Componente ThemeToggle
import { ThemeToggle } from '@mi-empresa/ui-components/theme';
```

### Configurar en tu aplicación

```tsx
// main.tsx o App.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from '@mi-empresa/ui-components/context/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

### Usar el ThemeToggle

```tsx
import { ThemeToggle } from '@mi-empresa/ui-components/theme';

function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
      <h1 className="text-xl font-bold">Mi App</h1>
      <ThemeToggle />
    </header>
  );
}
```

### Usar el hook useTheme

```tsx
import { useTheme } from '@mi-empresa/ui-components/context/theme';
import { Button } from '@mi-empresa/ui-components/html';

function ConfiguracionTema() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        Tema Actual: {theme}
      </h2>

      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() => setTheme('light')}
          isActive={theme === 'light'}
        >
          Modo Claro
        </Button>

        <Button
          variant="secondary"
          onClick={() => setTheme('dark')}
          isActive={theme === 'dark'}
        >
          Modo Oscuro
        </Button>

        <Button variant="outline" onClick={toggleTheme}>
          Alternar Tema
        </Button>
      </div>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        El tema se guarda automáticamente en localStorage
      </p>
    </div>
  );
}
```

---

## Ejemplo Completo: Página de Login

```tsx
import { useState } from 'react';
import { Button, Input, Form } from '@mi-empresa/ui-components/html';
import { ThemeToggle } from '@mi-empresa/ui-components/theme';
import { AlertaError, AlertaExito } from '@mi-empresa/ui-components/alerts';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular login
      await login(email, password);
      AlertaExito('¡Bienvenido!', 'Has iniciado sesión correctamente');
    } catch (error) {
      AlertaError('Error', 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Iniciar Sesión
        </h1>

        <Form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            variant="primary"
            type="submit"
            className="w-full"
            isLoading={loading}
            loadingText="Iniciando sesión..."
          >
            Iniciar Sesión
          </Button>
        </Form>
      </div>
    </div>
  );
}
```

---

## Resumen de Importaciones

```tsx
// Componentes HTML
import { Button, Input, Form, Select, Table, Modal } from '@mi-empresa/ui-components/html';
import type { ModalRef } from '@mi-empresa/ui-components/html';

// Iconos
import { HomeIcon, SaveIcon, DeleteIcon } from '@mi-empresa/ui-components/icons';

// Alertas
import { AlertaExito, AlertaError, AlertaToast } from '@mi-empresa/ui-components/alerts';

// Sistema de Tema
import { ThemeProvider, useTheme } from '@mi-empresa/ui-components/context/theme';
import { ThemeToggle } from '@mi-empresa/ui-components/theme';
```
