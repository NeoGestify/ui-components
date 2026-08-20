/**
 * Registro de los diálogos abiertos en la *top layer*.
 *
 * Un `<dialog>` abierto con `showModal()` se pinta en la *top layer*, que va por
 * encima de **todo** el documento al margen de cualquier `z-index`. Eso está
 * muy bien para el diálogo, pero rompe a las capas flotantes: `Dropdown`,
 * `Combobox`, `Popover`, `Tooltip` y `Toast` se portalizan a `document.body`
 * con `z-index` 60–80, así que al abrirlos DENTRO de un modal o un cajón
 * quedaban detrás — invisibles, sin ningún aviso.
 *
 * La solución es portalizarlos dentro del propio diálogo, que ya está en la
 * top layer. Para eso hay que saber cuál es el diálogo activo, y ese es el
 * último que se abrió: la top layer apila por orden de apertura, no por orden
 * en el DOM. Por eso hay una pila propia en vez de un `querySelector`.
 */

const pila: HTMLElement[] = [];

/** Apunta un diálogo al abrirse. Devuelve la función que lo da de baja. */
export function pushTopLayer(el: HTMLElement): () => void {
  pila.push(el);
  return () => {
    const i = pila.lastIndexOf(el);
    if (i !== -1) pila.splice(i, 1);
  };
}

/**
 * Diálogo activo, o `null` si no hay ninguno.
 *
 * Se comprueba que siga conectado al documento: si React desmontó el diálogo
 * sin pasar por su limpieza, la pila tendría un nodo huérfano y portalizaríamos
 * dentro de algo que ya no se pinta.
 */
export function currentTopLayer(): HTMLElement | null {
  for (let i = pila.length - 1; i >= 0; i--) {
    if (pila[i].isConnected) return pila[i];
  }
  return null;
}
