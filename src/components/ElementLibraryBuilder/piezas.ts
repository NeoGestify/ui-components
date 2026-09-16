import type { ElementLibrary, ElementShape, ElementTypeDef } from '../VenueMapEditor/types';

/**
 * Lo que el constructor maneja por dentro.
 *
 * Una librería del JSON se identifica por su nombre, pero el nombre se puede
 * editar mientras se trabaja: si fuese la clave, renombrarla perdería la
 * selección en cada tecla. Por eso cada una lleva un identificador interno que
 * no sale del componente.
 */
export interface GrupoInterno {
  idInterno: string;
  nombre: string;
  piezas: ElementTypeDef[];
}

/** La pieza con la que se empieza: un rectángulo gris del tamaño de la rejilla. */
export const PIEZA_NUEVA: Omit<ElementTypeDef, 'id' | 'label'> = {
  shape: 'rect',
  defaultWidth: 60,
  defaultHeight: 60,
  color: '#bfdbfe',
  strokeColor: '#1d4ed8',
};

/** Las formas, dichas como se dibujan y no como se llaman en el tipo. */
export const FORMAS: { valor: ElementShape; etiqueta: string }[] = [
  { valor: 'rect', etiqueta: 'Rectángulo' },
  { valor: 'circle', etiqueta: 'Círculo' },
  { valor: 'arrow', etiqueta: 'Flecha' },
  { valor: 'path', etiqueta: 'Trazo' },
  { valor: 'svg', etiqueta: 'SVG' },
  { valor: 'image', etiqueta: 'Imagen' },
];

/**
 * Colores de partida.
 *
 * Son pares relleno/borde que se distinguen entre sí de un vistazo sobre el
 * plano —que es para lo que sirve el color de una pieza— y siguen legibles en
 * tema oscuro, donde el plano no cambia de fondo.
 */
export const RELLENOS = ['#bfdbfe', '#fbcfe8', '#bbf7d0', '#fde68a', '#e9d5ff', '#cbd5e1', '#fed7aa', '#ffffff'];
export const BORDES = ['#1d4ed8', '#be185d', '#15803d', '#a16207', '#7e22ce', '#334155', '#c2410c', '#0f172a'];

/** Paso de la rejilla del editor de mapas: los tamaños se mueven de veinte en veinte. */
export const PASO_TAMANO = 10;
export const TAMANO_MINIMO = 10;
export const TAMANO_MAXIMO = 2000;

/**
 * Tamaño a partir del cual conviene avisar. Un data URI base64 ocupa ~33 % más
 * que el archivo original y se copia entero dentro del JSON de la librería y de
 * cada mapa que la use.
 */
export const AVISO_IMAGEN_BYTES = 200 * 1024;

/** Bytes reales que ocupa la carga útil de un data URI base64. */
export function bytesDeDataUri(src: string): number {
  const base64 = src.slice(src.indexOf(',') + 1);
  return Math.floor((base64.length * 3) / 4);
}

/**
 * El identificador que se genera solo desde el nombre visible.
 *
 * Es lo que va en el JSON y lo que guarda cada elemento colocado en un mapa,
 * así que se queda en minúsculas, sin tildes y sin espacios: «Puesto de carro»
 * → `puesto_de_carro`. Quien necesite otro lo puede escribir a mano.
 */
export function identificadorDesde(nombre: string): string {
  const limpio = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return limpio || 'pieza';
}

/** El mismo identificador, con un número detrás si ya estaba cogido. */
export function identificadorUnico(base: string, usados: Iterable<string>): string {
  const cogidos = new Set(usados);
  if (!cogidos.has(base)) return base;
  let n = 2;
  while (cogidos.has(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

/** Nombre de librería libre: «librería 2», «librería 3»… */
export function nombreLibreriaLibre(grupos: GrupoInterno[]): string {
  const usados = new Set(grupos.map(g => g.nombre));
  let n = grupos.length + 1;
  while (usados.has(`librería ${n}`)) n += 1;
  return `librería ${n}`;
}

/** Lo que sale del constructor: el JSON de librerías tal cual lo lee el mapa. */
export function libreriaDesdeGrupos(grupos: GrupoInterno[]): ElementLibrary {
  const lib: ElementLibrary = {};
  grupos.forEach(g => {
    lib[g.nombre] = { name: g.nombre, objects: g.piezas };
  });
  return lib;
}

/** Y lo contrario, para poder abrir una librería que ya existía. */
export function gruposDesdeLibreria(lib: ElementLibrary | undefined): GrupoInterno[] {
  const entradas = Object.entries(lib ?? {});
  return entradas.map(([clave, grupo]) => ({
    idInterno: nuevoId(),
    nombre: grupo?.name || clave,
    piezas: Array.isArray(grupo?.objects) ? grupo.objects : [],
  }));
}

/** Identificador interno; `crypto.randomUUID` no existe en contextos no seguros. */
export function nuevoId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `g_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export interface LecturaLibreria {
  librerias?: ElementLibrary;
  /** Qué le pasa al archivo, dicho de forma que se pueda arreglar. */
  error?: string;
}

/**
 * Lee el JSON de un archivo de librerías.
 *
 * Los errores se cuentan por lo que le falta al archivo —«no trae ninguna
 * librería», «la librería "x" no trae piezas»— en vez de dejar salir el
 * «Unexpected token» del `JSON.parse`, que no le dice nada a quien solo quería
 * recuperar sus puestos.
 */
export function leerLibreriaJson(texto: string): LecturaLibreria {
  let dato: unknown;
  try {
    dato = JSON.parse(texto);
  } catch {
    return { error: 'El archivo no es un JSON válido.' };
  }
  if (!dato || typeof dato !== 'object' || Array.isArray(dato)) {
    return { error: 'El archivo tiene que ser un objeto con una librería por clave.' };
  }
  const entradas = Object.entries(dato as Record<string, unknown>);
  if (entradas.length === 0) {
    return { error: 'El archivo no trae ninguna librería.' };
  }
  const librerias: ElementLibrary = {};
  for (const [clave, valor] of entradas) {
    if (!valor || typeof valor !== 'object') {
      return { error: `La librería «${clave}» no tiene la forma esperada.` };
    }
    const grupo = valor as { name?: unknown; objects?: unknown };
    if (!Array.isArray(grupo.objects)) {
      return { error: `La librería «${clave}» no trae la lista de piezas («objects»).` };
    }
    const piezas = grupo.objects.filter(
      (p): p is ElementTypeDef => !!p && typeof p === 'object' && typeof (p as ElementTypeDef).id === 'string',
    );
    librerias[clave] = {
      name: typeof grupo.name === 'string' && grupo.name ? grupo.name : clave,
      objects: piezas,
    };
  }
  return { librerias };
}
