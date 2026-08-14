import { describe, expect, it, beforeAll } from 'bun:test';
import { computePosition, type Rect } from './position';

/** Ventana de 1000×800 para que las cuentas salgan redondas. */
beforeAll(() => {
  (globalThis as unknown as { window: { innerWidth: number; innerHeight: number } }).window = {
    innerWidth: 1000,
    innerHeight: 800,
  };
});

/** Anclaje de 100×40. */
const anchor = (top: number, left: number): Rect => ({ top, left, width: 100, height: 40 });
const tip = { width: 200, height: 60 };

describe('computePosition', () => {
  it('coloca arriba y centrado cuando hay sitio', () => {
    const r = computePosition(anchor(400, 400), tip, { placement: 'top', gap: 8 });
    expect(r.side).toBe('top');
    // 400 (arriba del anclaje) - 60 (alto del globo) - 8 (hueco)
    expect(r.top).toBe(332);
    // Centro del anclaje (450) menos medio globo (100)
    expect(r.left).toBe(350);
  });

  it('voltea a abajo cuando no cabe arriba', () => {
    const r = computePosition(anchor(10, 400), tip, { placement: 'top', gap: 8 });
    expect(r.side).toBe('bottom');
    expect(r.top).toBe(58); // 10 + 40 + 8
  });

  it('voltea a arriba cuando no cabe abajo', () => {
    const r = computePosition(anchor(740, 400), tip, { placement: 'bottom', gap: 8 });
    expect(r.side).toBe('top');
    expect(r.top).toBe(672); // 740 - 60 - 8
  });

  it('no voltea si tampoco cabe en el lado contrario', () => {
    // Ventana de 800 de alto y un globo de 700: no cabe ni arriba ni abajo.
    const r = computePosition(anchor(300, 400), { width: 200, height: 700 }, { placement: 'top' });
    expect(r.side).toBe('top');
  });

  it('respeta el lado pedido si `flip` está desactivado', () => {
    const r = computePosition(anchor(10, 400), tip, { placement: 'top', flip: false });
    expect(r.side).toBe('top');
  });

  it('desplaza para no salirse por la izquierda', () => {
    const r = computePosition(anchor(400, 0), tip, { placement: 'top', padding: 8 });
    expect(r.left).toBe(8);
  });

  it('desplaza para no salirse por la derecha', () => {
    const r = computePosition(anchor(400, 950), tip, { placement: 'top', padding: 8 });
    // 1000 - 200 - 8
    expect(r.left).toBe(792);
  });

  it('con `align: start` alinea el borde, no el centro', () => {
    const r = computePosition(anchor(400, 300), tip, { placement: 'bottom-start' });
    expect(r.left).toBe(300);
  });

  it('con `align: end` alinea por el final', () => {
    const r = computePosition(anchor(400, 300), tip, { placement: 'bottom-end' });
    // 300 + 100 (ancho del anclaje) - 200 (ancho del globo)
    expect(r.left).toBe(200);
  });

  it('un globo más ancho que la ventana se pega al borde inicial, no al final', () => {
    // Si el `Math.max(padding, …)` fuera antes del `Math.min`, este caso lo
    // dejaría pegado a la derecha y cortado por la izquierda.
    const r = computePosition(anchor(400, 400), { width: 1200, height: 60 }, { placement: 'top', padding: 8 });
    expect(r.left).toBe(8);
  });

  it('coloca a los lados', () => {
    const r = computePosition(anchor(400, 400), tip, { placement: 'right', gap: 8 });
    expect(r.side).toBe('right');
    expect(r.left).toBe(508); // 400 + 100 + 8
    expect(r.top).toBe(390);  // centro vertical: 420 - 30
  });
});
