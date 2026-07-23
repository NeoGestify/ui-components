import type { VenuePalette } from '../theme';

interface GridOverlayProps {
  gridSize: number;
  zoom: number;
  palette: VenuePalette;
  /** Prefijo único por instancia para los ids de `<pattern>`. */
  uid: string;
}

/** Extensión del plano infinito, en unidades de lienzo. */
const PLANE = 50000;

/**
 * Rejilla "infinita" dibujada con `<pattern>` SVG.
 *
 * Dos niveles:
 *  - Líneas menores cada `gridSize` unidades.
 *  - Líneas mayores cada `5 × gridSize` unidades.
 *
 * Ambos patrones usan `patternUnits="userSpaceOnUse"` dentro del `<g>` con la
 * transformación de pan/zoom, así que la rejilla acompaña al lienzo.
 *
 * El grosor se compensa con `1/zoom` para que se vea igual a cualquier zoom, y
 * las líneas menores desaparecen al alejarse para no convertirse en ruido.
 */
export function GridOverlay({ gridSize, zoom, palette, uid }: GridOverlayProps) {
  const majorSize = gridSize * 5;
  const minorId = `${uid}-grid-minor`;
  const majorId = `${uid}-grid-major`;

  // Por debajo de ~4 px de separación en pantalla la rejilla menor se vuelve
  // una masa sólida: se oculta.
  const showMinor = gridSize * zoom >= 4;
  const minorWidth = 0.5 / zoom;
  const majorWidth = 1 / zoom;

  return (
    <>
      <defs>
        {/* Minor grid */}
        <pattern
          id={minorId}
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          {showMinor && (
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={palette.gridMinor}
              strokeWidth={minorWidth}
            />
          )}
        </pattern>

        {/* Major grid — tiles the minor pattern, then overlays thicker lines */}
        <pattern
          id={majorId}
          width={majorSize}
          height={majorSize}
          patternUnits="userSpaceOnUse"
        >
          <rect width={majorSize} height={majorSize} fill={`url(#${minorId})`} />
          <path
            d={`M ${majorSize} 0 L 0 0 0 ${majorSize}`}
            fill="none"
            stroke={palette.gridMajor}
            strokeWidth={majorWidth}
          />
        </pattern>
      </defs>

      <rect
        x={-PLANE}
        y={-PLANE}
        width={PLANE * 2}
        height={PLANE * 2}
        fill={`url(#${majorId})`}
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
}
