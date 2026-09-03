import { describe, expect, test } from 'bun:test';
import { acceptsFile, formatBytes } from './FileDropzone';

/** `File` mínimo: lo único que mira el filtro es el nombre y el tipo. */
const archivo = (name: string, type: string) => ({ name, type }) as File;

describe('acceptsFile', () => {
  test('sin `accept` entra todo', () => {
    expect(acceptsFile(archivo('a.exe', 'application/x-msdownload'))).toBe(true);
  });

  test('filtra por extensión', () => {
    expect(acceptsFile(archivo('informe.pdf', 'application/pdf'), '.pdf')).toBe(true);
    expect(acceptsFile(archivo('informe.doc', 'application/msword'), '.pdf')).toBe(false);
  });

  test('la extensión no distingue mayúsculas', () => {
    expect(acceptsFile(archivo('FOTO.PNG', 'image/png'), '.png')).toBe(true);
  });

  test('filtra por tipo exacto', () => {
    expect(acceptsFile(archivo('a.png', 'image/png'), 'image/png')).toBe(true);
    expect(acceptsFile(archivo('a.gif', 'image/gif'), 'image/png')).toBe(false);
  });

  test('entiende el comodín de familia', () => {
    expect(acceptsFile(archivo('a.gif', 'image/gif'), 'image/*')).toBe(true);
    expect(acceptsFile(archivo('a.pdf', 'application/pdf'), 'image/*')).toBe(false);
  });

  test('basta con cumplir uno de los patrones', () => {
    expect(acceptsFile(archivo('a.pdf', 'application/pdf'), 'image/*,.pdf')).toBe(true);
  });
});

describe('formatBytes', () => {
  test('por debajo de 1 KB va en bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  test('sube de unidad y deja una cifra decimal', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
