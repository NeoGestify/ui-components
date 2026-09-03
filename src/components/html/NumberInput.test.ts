import { describe, expect, test } from 'bun:test';
import { clampToStep, decimalsOf, parseNumber } from './NumberInput';

describe('decimalsOf', () => {
  test('cuenta los decimales del paso', () => {
    expect(decimalsOf(1)).toBe(0);
    expect(decimalsOf(0.5)).toBe(1);
    expect(decimalsOf(0.01)).toBe(2);
  });

  test('entiende la notación exponencial', () => {
    expect(decimalsOf(1e-3)).toBe(3);
  });
});

describe('parseNumber', () => {
  test('lee la coma como separador decimal', () => {
    // En un teclado español la coma es la tecla que cae debajo del dedo, y
    // `Number(',5')` es NaN.
    expect(parseNumber('1,5')).toBe(1.5);
  });

  test('aguanta los espacios de miles que deja una hoja de cálculo', () => {
    expect(parseNumber('1 234')).toBe(1234);
    expect(parseNumber('1 234')).toBe(1234);
  });

  test('lo que se está escribiendo todavía no es un número', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('-')).toBeNull();
    expect(parseNumber('.')).toBeNull();
  });

  test('descarta lo que no es número', () => {
    expect(parseNumber('hola')).toBeNull();
    expect(parseNumber('12px')).toBeNull();
  });

  test('acepta negativos y exponentes explícitos', () => {
    expect(parseNumber('-3,25')).toBe(-3.25);
  });
});

describe('clampToStep', () => {
  test('ajusta a la rejilla del paso', () => {
    expect(clampToStep(7, { step: 5, base: 0 })).toBe(5);
    expect(clampToStep(8, { step: 5, base: 0 })).toBe(10);
  });

  test('la rejilla arranca en el mínimo, no en cero', () => {
    expect(clampToStep(6, { min: 1, step: 5, base: 1 })).toBe(6);
  });

  test('respeta los límites', () => {
    expect(clampToStep(999, { min: 1, max: 99, step: 1, base: 1 })).toBe(99);
    expect(clampToStep(-5, { min: 0, max: 99, step: 1, base: 0 })).toBe(0);
  });

  // 0.1 + 0.2 === 0.30000000000000004. Sin redondear a los decimales del paso,
  // un precio acaba con doce cifras detrás de la coma.
  test('no arrastra el error binario del punto flotante', () => {
    expect(clampToStep(0.3, { step: 0.1, base: 0 })).toBe(0.3);
    expect(clampToStep(1.15, { step: 0.05, base: 0 })).toBe(1.15);
  });
});
