import { describe, expect, test } from 'bun:test';
import { compareValues } from './DataTable';

describe('compareValues', () => {
  test('ordena números por valor y no como texto', () => {
    expect(compareValues(9, 10)).toBeLessThan(0);
  });

  test('ordena texto con números embebidos en orden humano', () => {
    // Con una comparación de cadenas normal, «Artículo 10» iría antes que
    // «Artículo 2», que es justo lo que nadie espera de una tabla.
    expect(compareValues('Artículo 2', 'Artículo 10')).toBeLessThan(0);
  });

  test('ignora acentos y mayúsculas', () => {
    expect(compareValues('ánimo', 'Animo')).toBe(0);
  });

  test('ordena fechas por instante', () => {
    expect(compareValues(new Date('2024-01-01'), new Date('2024-06-01'))).toBeLessThan(0);
  });

  test('los booleanos van falso primero', () => {
    expect(compareValues(false, true)).toBeLessThan(0);
  });

  // Una celda vacía no es «lo más pequeño»: es que no hay dato. Va al final
  // suba o baje el orden, y por eso se compara antes que nada.
  test('los vacíos van al final', () => {
    expect(compareValues(null, 5)).toBeGreaterThan(0);
    expect(compareValues('', 'a')).toBeGreaterThan(0);
    expect(compareValues(5, undefined)).toBeLessThan(0);
    expect(compareValues(null, undefined)).toBe(0);
  });
});
