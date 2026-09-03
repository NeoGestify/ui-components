import { defineConfig } from 'tsup'

/**
 * Dos pasadas, y no una, por culpa de `"use client"`.
 *
 * Casi todo lo que exporta la librería usa hooks, así que en el App Router de
 * Next.js tiene que llevar la directiva o el import desde un Server Component
 * falla. Pero `theme/index` es justo lo contrario: `nuiColorsToCss()` y
 * `motionToCss()` existen para llamarse *desde el servidor* y escupir un
 * `<style>` que evite el parpadeo. Marcarlas como cliente las inutilizaría.
 *
 * Como `banner` es por configuración y no por entrada, se separan. El precio es
 * que los tokens acaban duplicados entre las dos pasadas (~4 KB de cadenas, sin
 * estado mutable), y a cambio cada mitad declara la verdad sobre sí misma.
 */

/** Entradas que se ejecutan en el navegador. */
const clientEntry = {
  'index': 'src/index.ts',
  'components/html/index': 'src/components/html/index.ts',
  'components/icons/index': 'src/components/icons/index.ts',
  'components/alerts/index': 'src/components/alerts/index.ts',
  'context/theme/index': 'src/context/theme/index.ts',
  'context/config/index': 'src/context/config/index.ts',
  'hooks/index': 'src/hooks/index.ts',
  'components/VenueMapEditor/index': 'src/components/VenueMapEditor/index.ts',
  'components/ElementLibraryBuilder/index': 'src/components/ElementLibraryBuilder/index.ts',
  'components/Calendar/index': 'src/components/Calendar/index.ts',
}

/** Entradas sin DOM ni hooks: valen igual en el servidor. */
const serverSafeEntry = {
  'theme/index': 'src/theme/index.ts',
}

const shared = {
  format: ['cjs', 'esm'] as const,
  dts: true,
  // Las entradas comparten los iconos y los tokens de color. Sin splitting,
  // cada bundle se lleva su propia copia: `AnimateSpin` acababa duplicado en 6.
  splitting: true,
  // No se publican: eran ~1,5 MB del tarball, la mayor parte de su peso.
  sourcemap: false,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'sweetalert2'],
  // `treeshake: true` NO se activa: esa opción añade una pasada de Rollup por
  // encima de esbuild que borra las directivas de módulo — «Module level
  // directives cause errors when bundled, "use client" was ignored» — y sin la
  // directiva se cae todo el arreglo del App Router. esbuild ya hace su propio
  // sacudido de árbol al empaquetar; la diferencia de tamaño es de unos pocos KB.
  treeshake: false,
  // Ninguna de las dos pasadas limpia: `defineConfig([...])` las lanza EN
  // PARALELO, así que un `clean: true` borraba lo que la otra acababa de
  // escribir. La limpieza vive ahora en el script `build`.
  clean: false,
}

export default defineConfig([
  {
    ...shared,
    entry: clientEntry,
    // La directiva `"use client"` la pone `scripts/use-client.mjs` después de
    // compilar: ni el `banner` de tsup ni el de esbuild la dejan donde debe ir.
    // Ver el comentario de cabecera de ese script.
  },
  {
    ...shared,
    entry: serverSafeEntry,
  },
])
