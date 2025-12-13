import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'components/html/index': 'src/components/html/index.ts',
    'components/icons/index': 'src/components/icons/index.ts',
    'components/alerts/index': 'src/components/alerts/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'sweetalert2', 'sweetalert2-react-content'],
  treeshake: true,
})
