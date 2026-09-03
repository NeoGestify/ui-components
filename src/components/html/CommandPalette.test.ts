import { describe, expect, test } from 'bun:test';
import { matchesQuery, normalize, type CommandItem } from './CommandPalette';

const item = (label: string, keywords?: string[]): CommandItem => ({ id: label, label, keywords });

describe('normalize', () => {
  test('quita acentos y mayúsculas', () => {
    expect(normalize('Envío')).toBe('envio');
  });

  // La eñe también pierde su virgulilla, y está bien que así sea: quien escribe
  // «nino» con prisa espera encontrar «Niño».
  test('la eñe se normaliza como cualquier otro acento', () => {
    expect(normalize('Añadir')).toBe('anadir');
  });
});

describe('matchesQuery', () => {
  test('sin búsqueda entra todo', () => {
    expect(matchesQuery(item('Crear cliente'), '  ')).toBe(true);
  });

  test('encuentra sin escribir los acentos', () => {
    expect(matchesQuery(item('Ver artículos'), 'articulo')).toBe(true);
  });

  // Es lo que hace usable un buscador de acciones: nadie escribe el nombre
  // entero, se escriben trozos de dos letras de cada palabra.
  test('cada palabra de la búsqueda puede caer en cualquier sitio', () => {
    expect(matchesQuery(item('Crear cliente nuevo'), 'cl cr')).toBe(true);
  });

  test('todas las palabras tienen que aparecer', () => {
    expect(matchesQuery(item('Crear cliente'), 'crear factura')).toBe(false);
  });

  test('también busca en los sinónimos', () => {
    expect(matchesQuery(item('Facturar', ['cobro', 'ticket']), 'cobro')).toBe(true);
  });
});
