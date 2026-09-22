import { describe, expect, test } from 'bun:test';
import { normalizarTamano } from './TextArea';
import { normalizarTamanoDeCarga } from './Loading';

/**
 * `TextArea` y `Loading` nacieron con `small | medium | large` cuando el resto
 * de la librería ya usaba `sm | md | lg`. Ahora entienden los dos, y lo que
 * estas pruebas fijan es que sean el MISMO tamaño: si un día alguien cambia una
 * tabla y no la otra, un formulario se descuadra sin que falle nada.
 */
describe('nombres de tamaño equivalentes', () => {
  test('TextArea: el nombre viejo es el nuevo', () => {
    expect(normalizarTamano('small')).toBe('sm');
    expect(normalizarTamano('medium')).toBe('md');
    expect(normalizarTamano('large')).toBe('lg');
  });

  test('TextArea: el nombre nuevo se queda como está', () => {
    expect(normalizarTamano('sm')).toBe('sm');
    expect(normalizarTamano('md')).toBe('md');
    expect(normalizarTamano('lg')).toBe('lg');
  });

  test('Loading: el nombre viejo es el nuevo, y xl no tiene versión vieja', () => {
    expect(normalizarTamanoDeCarga('small')).toBe('sm');
    expect(normalizarTamanoDeCarga('medium')).toBe('md');
    expect(normalizarTamanoDeCarga('large')).toBe('lg');
    expect(normalizarTamanoDeCarga('xl')).toBe('xl');
  });
});
