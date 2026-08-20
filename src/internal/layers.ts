/**
 * Escala de apilamiento de la librería.
 *
 * Solo importa cuando algo **no** está en la *top layer* del navegador: ahí
 * dentro el orden lo decide el momento de apertura y ningún `z-index` cuenta.
 *
 * El orden no es arbitrario: un menú o un desplegable se abren DESDE dentro de
 * un modal, así que tienen que quedar por encima de él; un tooltip puede
 * aparecer sobre ese menú; y un aviso tiene que verse pase lo que pase.
 */
export const NUI_LAYERS = {
  /** Modales y cajones fuera de la top layer. */
  modal: 50,
  /** Popover, Dropdown y la lista del Combobox. */
  popover: 60,
  /** Tooltips. */
  tooltip: 70,
  /** Avisos: siempre lo más alto. */
  toast: 80,
} as const;
