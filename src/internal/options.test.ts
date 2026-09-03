import { describe, expect, test } from 'bun:test';
import { optionText, toOptions } from './options';

describe('toOptions', () => {
  test('convierte valores sueltos en opciones', () => {
    expect(toOptions(['S', 'M'])).toEqual([
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
    ]);
  });

  test('deja intactas las que ya son opciones', () => {
    const o = { value: 'a', label: 'A', disabled: true };
    expect(toOptions([o])[0]).toBe(o);
  });

  test('admite mezcla de las dos formas', () => {
    expect(toOptions(['a', { value: 'b', label: 'B' }])).toHaveLength(2);
  });

  test('acepta números como valor', () => {
    expect(toOptions<number>([10, 20])).toEqual([
      { value: 10, label: '10' },
      { value: 20, label: '20' },
    ]);
  });
});

describe('optionText', () => {
  test('devuelve la etiqueta cuando es texto', () => {
    expect(optionText({ value: 'a', label: 'Alfa' })).toBe('Alfa');
  });

  // Una etiqueta de JSX no se puede leer sin renderizarla; el valor es lo
  // único que queda, y sirve para buscar y para el `title`.
  test('cae al valor cuando la etiqueta es JSX', () => {
    expect(optionText({ value: 'a', label: { type: 'span' } as never })).toBe('a');
  });
});
