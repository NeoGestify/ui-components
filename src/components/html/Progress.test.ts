import { describe, expect, test } from 'bun:test';
import { litSegments } from './Progress';

/**
 * En cuadros, la barra se lee de un vistazo, así que los bordes importan más
 * que el redondeo: un poco tiene que verse distinto de nada, y casi lleno
 * distinto de lleno.
 */
describe('cuadros encendidos', () => {
  test('nada enciende ninguno y lleno los enciende todos', () => {
    expect(litSegments(0, 32)).toBe(0);
    expect(litSegments(100, 32)).toBe(32);
  });

  test('un poco enciende al menos uno', () => {
    expect(litSegments(0.5, 32)).toBe(1);
    expect(litSegments(1, 32)).toBe(1);
  });

  test('casi lleno deja uno apagado', () => {
    expect(litSegments(99, 32)).toBe(31);
    expect(litSegments(98.9, 10)).toBe(9);
  });

  test('en el medio redondea al más cercano', () => {
    expect(litSegments(50, 32)).toBe(16);
    expect(litSegments(76, 32)).toBe(24);
    expect(litSegments(60, 32)).toBe(19);
  });

  test('un número de cuadros raro no rompe', () => {
    expect(litSegments(50, 0)).toBe(1);
    expect(litSegments(50, 10.7)).toBe(5);
    expect(litSegments(Number.NaN, 10)).toBe(0);
  });
});
