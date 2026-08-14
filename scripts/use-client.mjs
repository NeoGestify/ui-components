/**
 * Coloca `"use client"` como PRIMERA sentencia de cada fichero de `dist`, menos
 * los de `theme/`.
 *
 * Se hace aquí y no con el `banner` de esbuild porque en CJS esbuild inyecta el
 * banner detrás de su propio preámbulo de interoperabilidad:
 *
 *     "use strict";Object.defineProperty(exports, "__esModule", …);"use client";
 *                                                                  ^ ya no es
 *                                                                    prólogo
 *
 * Y una directiva que no está en el prólogo del módulo es una expresión muerta:
 * el empaquetador de Next.js no la ve y el componente sigue siendo de servidor.
 *
 * `theme/` queda fuera a propósito: `nuiColorsToCss()` y `motionToCss()` existen
 * para llamarse desde el servidor y devolver el `<style>` que evita el parpadeo
 * de color antes de hidratar. Marcarlas como cliente las inutilizaría.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const DIST = new URL('../dist/', import.meta.url).pathname
const DIRECTIVE = '"use client";\n'
/** Rutas (relativas a dist) que deben poder ejecutarse en el servidor. */
const SERVER_SAFE = ['theme']

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

let touched = 0

for await (const file of walk(DIST)) {
  if (!/\.(js|mjs|cjs)$/.test(file)) continue

  const rel = relative(DIST, file)
  if (SERVER_SAFE.includes(rel.split(sep)[0])) continue

  const original = await readFile(file, 'utf8')

  // Quita cualquier copia mal colocada que haya dejado el empaquetador antes de
  // poner la buena; si no, se acumularían una por compilación.
  const cleaned = original.replace(/(["'])use client\1;?\n?/g, '')
  const next = DIRECTIVE + cleaned

  if (next !== original) {
    await writeFile(file, next)
    touched++
  }
}

console.log(`use-client: directiva aplicada en ${touched} ficheros`)
