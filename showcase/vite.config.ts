import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['sweetalert2', 'sweetalert2-react-content'],
    force: true
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // La librería se resuelve contra su CÓDIGO FUENTE, no contra el paquete
      // instalado. Antes era una dependencia de ruta (`"../../ui-components"`),
      // y bun trata eso como una carpeta: copiaba el directorio entero —`.git`,
      // `node_modules` y el propio `showcase/`, que apunta de vuelta aquí— así
      // que `bun install` se quedaba copiándose a sí mismo sin llegar nunca a
      // `dist`.
      //
      // Con el alias no hay nada que instalar ni que enlazar, y además cada
      // cambio en la librería se ve al instante: no hace falta `bun run build`
      // entre medias.
      //
      // Para probar el PAQUETE de verdad (mapa de `exports`, `"use client"`,
      // el `dist` compilado) hay que instalarlo en un proyecto aparte; de eso
      // se encarga la CI.
      'neogestify-ui-components': path.resolve(__dirname, '../src/index.ts'),
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@context': path.resolve(__dirname, '../src/context'),
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
