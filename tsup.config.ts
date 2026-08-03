import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'components/html/index': 'src/components/html/index.ts',
    'components/icons/index': 'src/components/icons/index.ts',
    'components/alerts/index': 'src/components/alerts/index.ts',
    'context/theme/index': 'src/context/theme/index.ts',
    'theme/index': 'src/theme/index.ts',
    'components/VenueMapEditor/index': 'src/components/VenueMapEditor/index.ts',
    'components/ElementLibraryBuilder/index': 'src/components/ElementLibraryBuilder/index.ts',
    'components/Calendar/index': 'src/components/Calendar/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  // Las 9 entradas comparten los iconos y los tokens de color. Sin splitting,
  // cada bundle se lleva su propia copia: `AnimateSpin` acababa duplicado en 6.
  splitting: true,
  // No se publican: eran ~1,5 MB del tarball, la mayor parte de su peso.
  sourcemap: false,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'sweetalert2'],
  treeshake: true,
})
