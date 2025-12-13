# Configuración para Tailwind CSS v4

Esta librería utiliza clases de Tailwind CSS v4. Para que las clases funcionen correctamente en tu proyecto, debes configurar Tailwind para que escanee los archivos fuente de la librería.

## Por qué es necesario

Los componentes de esta librería usan clases de Tailwind dinámicamente. Tailwind necesita escanear estos archivos durante el build para generar el CSS correspondiente. Si no lo haces, las clases no se generarán y los componentes aparecerán sin estilos.

## Configuración Recomendada (Tailwind v4)

### Opción 1: Usando `@source` en tu CSS (Recomendado para v4)

En tu archivo CSS principal (por ejemplo `src/index.css` o `src/app.css`):

```css
@import "tailwindcss";

/* Escanear los archivos fuente de la librería */
@source "../node_modules/neogestify-ui-components/src";
```

Esta es la forma nativa de Tailwind v4 para incluir archivos adicionales en el escaneo.

### Opción 2: Usando `content` en tailwind.config.js

Si prefieres usar un archivo de configuración JavaScript:

```js
// tailwind.config.js
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/neogestify-ui-components/src/**/*.{ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Opción 3: Para monorepos con workspaces

Si estás usando un monorepo (npm/bun workspaces), ajusta la ruta según tu estructura:

```css
@import "tailwindcss";

/* Si la librería está en packages/ui-components */
@source "../../packages/ui-components/src";
```

O en `tailwind.config.js`:

```js
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../ui-components/src/**/*.{ts,tsx}"
  ],
  // ...
}
```

## Verificación

Para verificar que la configuración funciona:

1. Importa un componente en tu proyecto:
   ```tsx
   import { Button } from 'neogestify-ui-components/html';

   function App() {
     return <Button variant="primary">Hola Mundo</Button>;
   }
   ```

2. Ejecuta tu servidor de desarrollo
3. El botón debería verse con los estilos correctos (fondo azul/indigo, texto blanco, etc.)

Si el botón aparece sin estilos, verifica:
- ✅ Que agregaste la configuración `@source` o `content` correctamente
- ✅ Que la ruta al directorio `src` de la librería es correcta
- ✅ Que reiniciaste tu servidor de desarrollo después de cambiar la configuración
- ✅ Que Tailwind CSS v4 está instalado: `tailwindcss@^4.1.0`

## Modo Oscuro

Los componentes incluyen soporte para modo oscuro usando la estrategia `class`. Asegúrate de configurarlo en tu proyecto:

```js
// tailwind.config.js
export default {
  darkMode: 'class', // Importante para el modo oscuro
  // ...
}
```

Luego puedes activar el modo oscuro agregando la clase `dark` al elemento `<html>`:

```js
document.documentElement.classList.add('dark');
```

## Problemas Comunes

### "Los estilos no se aplican"

**Solución:** Asegúrate de que estás apuntando al directorio `src` de la librería, NO al directorio `dist`. Los archivos compilados en `dist` no contienen las clases de Tailwind en un formato que pueda escanear.

❌ Incorrecto:
```js
content: ["./node_modules/neogestify-ui-components/dist/**/*.js"]
```

✅ Correcto:
```js
content: ["./node_modules/neogestify-ui-components/src/**/*.{ts,tsx}"]
```

### "No encuentra el directorio src"

**Solución:** Verifica que la librería está instalada correctamente. El directorio `src` debe estar incluido en el paquete npm (revisa `package.json` → `files: ["dist", "src"]`).

### "Funciona en desarrollo pero no en producción"

**Solución:** Asegúrate de que tu configuración de Tailwind está siendo usada tanto en desarrollo como en producción. Algunos bundlers tienen configuraciones separadas.

## Tailwind CSS v3

Si estás usando Tailwind CSS v3, puedes usar solo la opción de `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/neogestify-ui-components/src/**/*.{ts,tsx}"
  ],
  darkMode: 'class',
  // ...
}
```

La directiva `@source` es exclusiva de Tailwind v4.
