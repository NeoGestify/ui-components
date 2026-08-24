/**
 * ¿Este botón está estirado, y hay que centrarle el contenido?
 *
 * `Button` se arma sobre `inline-flex items-center` sin ningún `justify-*`.
 * Mientras el botón mide lo que mide su texto eso da igual. En cuanto se
 * estira —el «Iniciar sesión» de un formulario, el botón que ocupa el pie de
 * una tarjeta— el contenido se queda pegado al borde izquierdo y el botón
 * parece roto.
 *
 * La prop `fullWidth` ya resolvía el caso, pero apenas se usa: lo que se
 * escribe de verdad es `className="w-full"`, que estira el botón y no centra
 * nada. De ahí que el ancho se mire también en las clases.
 *
 * Dos variantes quedan fuera a propósito:
 *
 *  - `custom` es la salida de emergencia: quien la elige se estila el botón
 *    entero. Centrarle el contenido sería meterle mano a un botón que pidió
 *    que no se la metieran.
 *  - `nav` ya es de ancho completo por definición y es un elemento de menú
 *    lateral. Su sitio es la izquierda.
 *
 * Quien quiera otra alineación la pide y gana, porque `cn` resuelve por
 * `twMerge` y las clases del consumidor van después.
 */

/** Variantes que NO se centran solas. */
const SIN_CENTRAR = new Set(['custom', 'nav']);

/** `w-full` como clase suelta: `w-full/2` o `sm:w-full` no cuentan. */
const ANCHO_COMPLETO = /(?:^|\s)w-full(?:\s|$)/;

export function debeCentrarse(variant: string, fullWidth: boolean, className: string): boolean {
  if (SIN_CENTRAR.has(variant)) return false;
  return fullWidth || ANCHO_COMPLETO.test(className);
}
