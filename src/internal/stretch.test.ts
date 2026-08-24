import { describe, expect, it } from 'bun:test';
import { debeCentrarse } from './stretch';

describe('debeCentrarse', () => {
  it('un botón que mide lo que su texto no se toca', () => {
    expect(debeCentrarse('primary', false, '')).toBe(false);
    expect(debeCentrarse('secondary', false, 'px-6 shadow-lg')).toBe(false);
  });

  it('la prop `fullWidth` centra', () => {
    expect(debeCentrarse('primary', true, '')).toBe(true);
  });

  it('`w-full` en las clases centra igual que la prop', () => {
    // Es la forma que se usa de verdad en los proyectos: 37 botones escritos
    // así se quedaban con el texto a la izquierda.
    expect(debeCentrarse('primary', false, 'w-full')).toBe(true);
    expect(debeCentrarse('secondary', false, 'mt-4 w-full sm:w-auto')).toBe(true);
    expect(debeCentrarse('outline', false, 'w-full text-sm')).toBe(true);
  });

  it('`custom` y `nav` se quedan como estén', () => {
    // `custom` se estila entero desde fuera y `nav` es un elemento de menú
    // lateral: los dos quieren su contenido a la izquierda.
    expect(debeCentrarse('custom', false, 'w-full flex items-center px-3')).toBe(false);
    expect(debeCentrarse('nav', false, 'w-full text-left')).toBe(false);
    expect(debeCentrarse('custom', true, '')).toBe(false);
  });

  it('no confunde otra clase que empiece por `w-full`', () => {
    expect(debeCentrarse('primary', false, 'w-full/2')).toBe(false);
    expect(debeCentrarse('primary', false, 'sm:w-full')).toBe(false);
    expect(debeCentrarse('primary', false, 'max-w-full')).toBe(false);
  });
});
