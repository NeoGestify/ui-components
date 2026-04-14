export interface ParsedSvgMarkup {
  viewBox: string;
  innerHtml: string;
}

const DANGEROUS_TAGS = /\b(script|iframe|object|embed|link|style|meta)\b/gi;
const DANGEROUS_ATTRS = /\bon\w+\s*=/gi;
const DANGEROUS_HREF = /\bhref\s*=\s*["']?\s*javascript:/gi;
const DANGEROUS_XLINK = /\bxlink:href\s*=\s*["']?\s*javascript:/gi;

function sanitize(html: string): string {
  return html
    .replace(DANGEROUS_TAGS, '')
    .replace(DANGEROUS_ATTRS, '')
    .replace(DANGEROUS_HREF, '')
    .replace(DANGEROUS_XLINK, '');
}

const VIEWBOX_RE = /viewBox\s*=\s*"([^"]+)"/i;
const SVG_OPEN_END_RE = /<svg[^>]*>/i;

export function parseSvgMarkup(markup: string): ParsedSvgMarkup {
  const viewBoxMatch = markup.match(VIEWBOX_RE);
  const viewBox = viewBoxMatch?.[1] ?? '0 0 100 100';

  const svgOpenMatch = markup.match(SVG_OPEN_END_RE);
  const afterOpen = svgOpenMatch ? markup.slice(svgOpenMatch.index! + svgOpenMatch[0].length) : markup;

  const closeIdx = afterOpen.lastIndexOf('</svg>');
  const inner = closeIdx >= 0 ? afterOpen.slice(0, closeIdx) : afterOpen;

  return { viewBox, innerHtml: sanitize(inner) };
}