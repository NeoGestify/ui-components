/**
 * Valida el origen de una imagen antes de inyectarlo en el SVG.
 *
 * Solo se admiten dos formas:
 *  - **data URI de imagen** (`data:image/png;base64,…`) — la recomendada, porque
 *    viaja dentro del JSON del mapa y no depende de ninguna red.
 *  - **URL http(s)** — cómoda en desarrollo, pero el elemento aparecerá vacío
 *    si el servidor no está disponible o bloquea la petición.
 *
 * Se rechaza cualquier otro esquema (`javascript:`, `file:`, `blob:`…): un
 * `href` controlado por una librería importada es una vía de inyección.
 */
export function sanitizeImageSrc(src: string | undefined): string | null {
  if (!src) return null;

  // Se eliminan espacios y caracteres de control, el truco habitual para
  // disfrazar el esquema (`java\tscript:`).
  // eslint-disable-next-line no-control-regex -- eliminarlos es justo el objetivo
  const normalized = src.replace(/[\s\u0000-\u001f]/g, "").toLowerCase();

  if (normalized.startsWith('data:image/')) {
    // Un SVG en data URI puede contener scripts; se descarta.
    if (normalized.startsWith('data:image/svg')) return null;
    return src.trim();
  }
  if (normalized.startsWith('https://') || normalized.startsWith('http://')) {
    return src.trim();
  }
  return null;
}

/** Extensiones aceptadas por el selector de archivos del constructor. */
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/avif';

/** Convierte un `File` en un data URI base64 listo para `imageSrc`. */
export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}
