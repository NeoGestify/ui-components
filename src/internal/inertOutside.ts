/**
 * Marca como `inert` todo lo que hay en `<body>` salvo el elemento dado.
 *
 * Es lo que hace el navegador solo cuando un `<dialog>` se abre con
 * `showModal()`. Al salirse de la *top layer* —que es lo que hace falta para
 * que un `z-index` signifique algo— ese comportamiento se pierde, y sin él el
 * diálogo es modal solo de aspecto: el tabulador se pasea por la página de
 * detrás y un lector de pantalla lee el contenido que hay debajo del velo.
 *
 * `inert` lo cubre entero —foco, puntero y árbol de accesibilidad—, que es más
 * de lo que consigue una trampa de foco casera interceptando el tabulador.
 *
 * Espera un elemento colgado directamente de `<body>`: si estuviera enterrado
 * en el árbol de la aplicación, su propio contenedor lo contendría y no se
 * podría marcar nada sin desactivar también el diálogo.
 */
export function inertOutside(el: HTMLElement): () => void {
  if (typeof document === 'undefined') return () => {};

  const tocados: HTMLElement[] = [];
  for (const hijo of Array.from(document.body.children)) {
    if (!(hijo instanceof HTMLElement)) continue;
    if (hijo === el || hijo.contains(el)) continue;
    // Lo que ya estaba inerte por otro motivo se deja como está: al limpiar
    // no nos toca a nosotros reactivarlo.
    if (hijo.hasAttribute('inert')) continue;
    hijo.setAttribute('inert', '');
    tocados.push(hijo);
  }

  return () => {
    for (const hijo of tocados) hijo.removeAttribute('inert');
  };
}
