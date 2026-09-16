import { cn } from '../../../internal/cn';

/**
 * El contorno de la flecha, en el sistema de coordenadas de la caja del
 * elemento.
 *
 * Vive aquí y no dentro del nodo del mapa porque lo dibujan dos: el mapa y la
 * vista previa del constructor de librerías. Si cada uno tuviera el suyo, una
 * flecha se vería de una forma al elegirla y de otra al colocarla.
 */
export function arrowPath(x: number, y: number, w: number, h: number): string {
  const headW = Math.min(w * 0.4, h * 0.9);
  const tailH = h * 0.45;
  const yt = y + (h - tailH) / 2;
  const yb = y + (h + tailH) / 2;
  return cn(
    `M ${x} ${yt}`,
    `L ${x + w - headW} ${yt}`,
    `L ${x + w - headW} ${y}`,
    `L ${x + w} ${y + h / 2}`,
    `L ${x + w - headW} ${y + h}`,
    `L ${x + w - headW} ${yb}`,
    `L ${x} ${yb}`,
    'Z',
  );
}
