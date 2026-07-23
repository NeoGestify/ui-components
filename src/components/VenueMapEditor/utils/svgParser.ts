export interface ParsedSvgMarkup {
  viewBox: string;
  innerHtml: string;
}

// ─── Saneado ──────────────────────────────────────────────────────────────────

/** Etiquetas SVG permitidas dentro de una definición de elemento. */
const ALLOWED_TAGS = new Set([
  'g', 'defs', 'symbol', 'use', 'title', 'desc',
  'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'text', 'tspan', 'textpath',
  'lineargradient', 'radialgradient', 'stop', 'pattern', 'clippath', 'mask',
  'filter', 'fegaussianblur', 'fedropshadow', 'feoffset', 'feblend',
  'femerge', 'femergenode', 'feflood', 'fecomposite', 'fecolormatrix',
  'marker', 'switch',
]);

/** Atributos que nunca se copian, aunque la etiqueta esté permitida. */
const isDangerousAttr = (name: string, value: string): boolean => {
  const n = name.toLowerCase();
  if (n.startsWith('on')) return true;                       // onclick, onload…
  if (n === 'href' || n === 'xlink:href') {
    // eslint-disable-next-line no-control-regex -- los caracteres de control son justo lo que hay que eliminar
    const v = value.toLowerCase().replace(/[\s\u0000-\u001f]/g, "");
    // Solo se admiten referencias internas (#id) o data URIs de imagen.
    return !(v.startsWith('#') || v.startsWith('data:image/'));
  }
  if (n === 'style') return /url\s*\(|expression|javascript:/i.test(value);
  return false;
};

const hasDom = typeof DOMParser !== 'undefined' && typeof document !== 'undefined';

/**
 * Saneado por reconstrucción del árbol DOM: se recorre el SVG parseado y se
 * vuelve a emitir SOLO lo que está en la lista blanca. A diferencia de un
 * borrado por expresiones regulares, aquí no hay forma de colar una etiqueta
 * mediante codificaciones raras o anidamientos — lo que no se reconoce,
 * sencillamente no se copia.
 */
function sanitizeDom(root: Element): void {
  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      if (!ALLOWED_TAGS.has(child.tagName.toLowerCase())) {
        child.remove();
        continue;
      }
      for (const attr of Array.from(child.attributes)) {
        if (isDangerousAttr(attr.name, attr.value)) child.removeAttribute(attr.name);
      }
      walk(child);
    }
  };
  walk(root);
}

// ── Respaldo sin DOM (SSR / entornos sin DOMParser) ──────────────────────────

const UNSAFE_ELEMENTS = /<\s*\/?\s*(script|iframe|object|embed|link|meta|foreignobject|animate\w*|set)\b[^>]*>/gi;
const UNSAFE_HANDLERS = /\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const UNSAFE_URLS = /\s(?:xlink:)?href\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]*)/gi;

function sanitizeString(html: string): string {
  return html
    .replace(UNSAFE_ELEMENTS, '')
    .replace(UNSAFE_HANDLERS, '')
    .replace(UNSAFE_URLS, '');
}

// ─── Parseo ───────────────────────────────────────────────────────────────────

const VIEWBOX_RE = /viewBox\s*=\s*["']([^"']+)["']/i;
const SVG_OPEN_END_RE = /<svg[^>]*>/i;
const DEFAULT_VIEWBOX = '0 0 100 100';

/**
 * Cache de resultados: `parseSvgMarkup` se llama en cada render de cada
 * elemento SVG del mapa (y durante el arrastre eso son decenas de llamadas por
 * frame). El markup de un tipo es inmutable, así que se memoiza por cadena.
 */
const cache = new Map<string, ParsedSvgMarkup>();
const CACHE_LIMIT = 500;

function parse(markup: string): ParsedSvgMarkup {
  if (hasDom) {
    try {
      const doc = new DOMParser().parseFromString(markup.trim(), 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (svg && !doc.querySelector('parsererror')) {
        sanitizeDom(svg);
        return {
          viewBox: svg.getAttribute('viewBox') ?? DEFAULT_VIEWBOX,
          innerHtml: svg.innerHTML,
        };
      }
    } catch {
      // markup malformado: se cae al respaldo textual
    }
  }

  const viewBox = markup.match(VIEWBOX_RE)?.[1] ?? DEFAULT_VIEWBOX;
  const svgOpen = markup.match(SVG_OPEN_END_RE);
  const afterOpen = svgOpen ? markup.slice(svgOpen.index! + svgOpen[0].length) : markup;
  const closeIdx = afterOpen.lastIndexOf('</svg>');
  const inner = closeIdx >= 0 ? afterOpen.slice(0, closeIdx) : afterOpen;
  return { viewBox, innerHtml: sanitizeString(inner) };
}

/**
 * Extrae el `viewBox` y el contenido interno de un `<svg>` completo, saneando
 * cualquier construcción ejecutable (scripts, manejadores `on*`, URLs
 * `javascript:`, `<foreignObject>`…) antes de devolverlo.
 */
export function parseSvgMarkup(markup: string): ParsedSvgMarkup {
  const hit = cache.get(markup);
  if (hit) return hit;

  const result = parse(markup);

  // Cache acotada: se descarta la entrada más antigua al llegar al límite.
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(markup, result);
  return result;
}
