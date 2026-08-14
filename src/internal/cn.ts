import { twMerge } from 'tailwind-merge';

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

function flatten(value: ClassValue, out: string[]): void {
  if (!value) return;
  if (typeof value === 'string' || typeof value === 'number') {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) flatten(item, out);
    return;
  }
  for (const key in value) if (value[key]) out.push(key);
}

/**
 * Une clases y **resuelve los conflictos de Tailwind**.
 *
 * Antes esto era `[...].filter(Boolean).join(' ')` y el comentario que lo
 * acompañaba decía que las clases del consumidor «se añaden al final, así que
 * ganan». Eso es falso: con la misma especificidad no gana la que va última en
 * el atributo, gana la que va última **en la hoja de estilos generada**. Así que
 *
 * ```tsx
 * <Button size="md" className="px-6" />   // px-3 de md + px-6
 * ```
 *
 * daba un resultado u otro según cómo hubiera ordenado Tailwind su CSS ese día.
 * `twMerge` lo arregla de raíz: detecta que `px-6` y `px-3` son el mismo grupo y
 * se queda solo con la última, la del consumidor.
 *
 * Entiende variantes (`hover:`, `dark:`, `md:`) y valores arbitrarios, que es
 * justo de lo que están hechos los tokens de esta librería:
 * `bg-[var(--nui-surface,#fff)]`.
 *
 * ```ts
 * cn('px-3 py-2', condicion && 'font-bold', { 'opacity-50': disabled }, className)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  const parts: string[] = [];
  for (const input of inputs) flatten(input, parts);
  return twMerge(parts.join(' '));
}
