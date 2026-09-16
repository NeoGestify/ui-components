import { useId, useMemo } from 'react';
import type { ElementTypeDef } from '../VenueMapEditor/types';
import { parseSvgMarkup } from '../VenueMapEditor/utils/svgParser';
import { sanitizeImageSrc } from '../VenueMapEditor/utils/imageSrc';
import { arrowPath } from '../VenueMapEditor/utils/shapePath';
import { text } from '../../theme/tokens';
import { cn } from '../../internal/cn';

interface VistaPreviaProps {
  pieza: ElementTypeDef;
  /** Píxeles del lienzo. La pieza se escala para caber dentro con margen. */
  ancho: number;
  alto: number;
  /** La rejilla de 20 px del editor, para ver el tamaño en su contexto. */
  conCuadricula?: boolean;
  /** El rótulo de la pieza dentro de la figura, como en el mapa. */
  conEtiqueta?: boolean;
  className?: string;
}

/** Paso de la rejilla del editor de mapas. */
const REJILLA = 20;

/**
 * La pieza dibujada como la dibuja el mapa.
 *
 * Es el mismo repertorio de formas que `ElementNode` —rectángulo, elipse,
 * flecha, trazo, SVG e imagen— con los mismos ayudantes (`arrowPath`,
 * `parseSvgMarkup`, `sanitizeImageSrc`), para que lo que se ve aquí sea lo que
 * se coloca allí. Lo que no trae es nada de interacción: aquí no se selecciona,
 * ni se arrastra, ni se redimensiona.
 */
export function VistaPrevia({ pieza, ancho, alto, conCuadricula = false, conEtiqueta = false, className = '' }: VistaPreviaProps) {
  const w = Math.max(1, pieza.defaultWidth || 1);
  const h = Math.max(1, pieza.defaultHeight || 1);

  // La escala deja un margen del 12 % para que el trazo no se coma el borde.
  const escala = Math.min((ancho * 0.88) / w, (alto * 0.88) / h);
  const dibW = w * escala;
  const dibH = h * escala;
  const x = (ancho - dibW) / 2;
  const y = (alto - dibH) / 2;
  const trazo = Math.max(1, 2 * Math.min(1, escala));

  const svgAnalizado = useMemo(
    () => (pieza.shape === 'svg' && pieza.svgMarkup ? parseSvgMarkup(pieza.svgMarkup) : null),
    [pieza.shape, pieza.svgMarkup],
  );
  const imagen = useMemo(
    () => (pieza.shape === 'image' ? sanitizeImageSrc(pieza.imageSrc) : null),
    [pieza.shape, pieza.imageSrc],
  );

  // `useId` trae dos puntos, que no valen dentro de un `url(#…)`.
  const idPatron = `rejilla${useId().replace(/:/g, '')}`;

  return (
    <svg
      width={ancho}
      height={alto}
      viewBox={`0 0 ${ancho} ${alto}`}
      className={cn('block', text.faint, className)}
      role="img"
      aria-label={`Vista previa de ${pieza.label || pieza.id || 'la pieza'}`}
    >
      {conCuadricula && (
        <>
          <defs>
            <pattern id={idPatron} width={REJILLA} height={REJILLA} patternUnits="userSpaceOnUse">
              {/* `currentColor` dentro de un patrón se resuelve contra el
                  propio patrón, no contra quien lo usa: el color lo pone la
                  clase del `<svg>` de arriba, que ambos heredan. */}
              <path d={`M ${REJILLA} 0 L 0 0 0 ${REJILLA}`} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.4} />
            </pattern>
          </defs>
          <rect width={ancho} height={alto} fill={`url(#${idPatron})`} />
        </>
      )}

      {pieza.shape === 'rect' && (
        <rect x={x} y={y} width={dibW} height={dibH} fill={pieza.color} stroke={pieza.strokeColor} strokeWidth={trazo} />
      )}

      {pieza.shape === 'circle' && (
        <ellipse
          cx={x + dibW / 2}
          cy={y + dibH / 2}
          rx={dibW / 2}
          ry={dibH / 2}
          fill={pieza.color}
          stroke={pieza.strokeColor}
          strokeWidth={trazo}
        />
      )}

      {pieza.shape === 'arrow' && (
        <path d={arrowPath(x, y, dibW, dibH)} fill={pieza.color} stroke={pieza.strokeColor} strokeWidth={trazo} />
      )}

      {pieza.shape === 'path' && pieza.svgPath && (() => {
        const partes = (pieza.viewBox ?? '0 0 100 100').split(/[\s,]+/).map(Number);
        const vw = partes[2] || 100;
        const vh = partes[3] || 100;
        const sx = dibW / vw;
        const sy = dibH / vh;
        const media = Math.sqrt(Math.abs(sx * sy)) || 1;
        return (
          <g transform={`translate(${x}, ${y}) scale(${sx}, ${sy})`}>
            <path
              d={pieza.svgPath}
              fill={pieza.color}
              fillRule={pieza.fillRule ?? 'nonzero'}
              stroke={pieza.strokeColor}
              strokeWidth={trazo / media}
            />
          </g>
        );
      })()}

      {pieza.shape === 'svg' && svgAnalizado && (() => {
        const partes = svgAnalizado.viewBox.split(/[\s,]+/).map(Number);
        const vw = partes[2] || 100;
        const vh = partes[3] || 100;
        return (
          // Como en el mapa: al markup terminado no se le impone `stroke`, solo
          // se le pasan `fill` y `color` por si usa `currentColor`.
          <g
            transform={`translate(${x}, ${y}) scale(${dibW / vw}, ${dibH / vh})`}
            fill={pieza.color}
            color={pieza.strokeColor}
            dangerouslySetInnerHTML={{ __html: svgAnalizado.innerHtml }}
          />
        );
      })()}

      {pieza.shape === 'image' && (
        imagen ? (
          <image
            href={imagen}
            x={x}
            y={y}
            width={dibW}
            height={dibH}
            preserveAspectRatio={pieza.preserveAspectRatio ?? 'xMidYMid meet'}
          />
        ) : (
          // Sin imagen la caja se ve igual, para que el hueco no parezca un fallo.
          <g>
            <rect
              x={x}
              y={y}
              width={dibW}
              height={dibH}
              fill="none"
              stroke={pieza.strokeColor}
              strokeWidth={trazo}
              strokeDasharray="6 5"
            />
            <text
              x={x + dibW / 2}
              y={y + dibH / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={Math.max(10, Math.min(14, dibW / 8))}
              fill={pieza.strokeColor}
            >
              sin imagen
            </text>
          </g>
        )
      )}

      {conEtiqueta && pieza.label && pieza.shape !== 'image' && (
        <text
          x={x + dibW / 2}
          y={y + dibH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.max(10, Math.min(18, dibH * 0.18))}
          fontWeight={600}
          fill={pieza.strokeColor}
          style={{ pointerEvents: 'none' }}
        >
          {pieza.label}
        </text>
      )}
    </svg>
  );
}
