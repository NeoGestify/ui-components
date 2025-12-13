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
