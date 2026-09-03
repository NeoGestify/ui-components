import { describe, expect, it } from 'bun:test';
import { cn } from './cn';
import { bg, border, divide, focusRing, ringOffset, text } from '../theme/tokens';

/** ¿Está la clase suelta, y no solo como prefijo de otra? */
const tiene = (resultado: string, clase: string) =>
  resultado.split(' ').includes(clase);

describe('cn', () => {
  it('resuelve conflictos quedándose con la última', () => {
    expect(cn('px-3 py-2', 'px-6')).toBe('py-2 px-6');
  });

  it('acepta lo mismo que clsx', () => {
    expect(cn('a', false && 'b', ['c', { d: true, e: false }])).toBe('a c d');
  });

  it('las variantes no compiten entre sí', () => {
    const r = cn('dark:bg-blue-500 bg-white', 'dark:bg-green-500');
    expect(tiene(r, 'bg-white')).toBe(true);
    expect(tiene(r, 'dark:bg-green-500')).toBe(true);
    expect(tiene(r, 'dark:bg-blue-500')).toBe(false);
  });

  // ── Regresión ────────────────────────────────────────────────────────────
  //
  // Los tokens de esta librería son valores arbitrarios con variables CSS, y
  // ahí `tailwind-merge` no puede adivinar el tipo: `border-[var(--x)]` tanto
  // podría ser un color como un grosor, y `text-[var(--x)]` un color o un
  // tamaño de fuente. Elegía grosor/tamaño, así que se comía el `border` y el
  // `text-sm` que iban delante — y el componente se quedaba sin borde o con la
  // letra del tamaño equivocado.
  //
  // Se arregla en los tokens, anotando el tipo: `border-[color:var(--x)]`.
  // Estas pruebas fallan si alguien quita la anotación.
  describe('los tokens de color no se comen las utilidades de tamaño', () => {
    it('`border` sobrevive junto a un color de borde', () => {
      expect(tiene(cn('border', border.subtle), 'border')).toBe(true);
    });

    it('`border-2` sobrevive junto a un color de borde', () => {
      expect(tiene(cn('border-2', border.accent), 'border-2')).toBe(true);
    });

    it('`text-sm` sobrevive junto a un color de texto', () => {
      expect(tiene(cn('text-sm', text.base), 'text-sm')).toBe(true);
    });

    it('`divide-y` sobrevive junto a un color de separador', () => {
      expect(tiene(cn('divide-y', divide.base), 'divide-y')).toBe(true);
    });

    it('`ring-offset-2` sobrevive junto a su color', () => {
      expect(tiene(cn('focus:ring-offset-2', ringOffset), 'focus:ring-offset-2')).toBe(true);
    });

    it('`ring-2` sobrevive junto al anillo de foco', () => {
      expect(tiene(cn('focus:ring-2', focusRing), 'focus:ring-2')).toBe(true);
    });

    it('el color del consumidor sigue ganando al del token', () => {
      const r = cn(bg.surface, 'bg-red-500');
      expect(tiene(r, 'bg-red-500')).toBe(true);
      expect(r.includes('--nui-surface,')).toBe(false);
    });
  });
});

describe('conflictos que se han pagado caros', () => {
  // `overflow-x-auto` y `overflow-hidden` son el mismo grupo para `twMerge`, y
  // gana el último. La `Table` los ponía juntos al pedir `rounded`, así que una
  // tabla ancha y redondeada se quedaba recortada sin forma de desplazarla.
  it('overflow-hidden se come a overflow-x-auto', () => {
    expect(cn('overflow-x-auto', 'rounded-lg overflow-hidden')).not.toContain('overflow-x-auto');
  });

  // El arreglo: redondear no necesita recortar. Un contenedor con `overflow`
  // distinto de `visible` ya recorta por sus esquinas redondeadas.
  it('rounded-lg a secas conserva el desplazamiento', () => {
    const cls = cn('overflow-x-auto w-full', 'rounded-lg');
    expect(cls).toContain('overflow-x-auto');
    expect(cls).toContain('rounded-lg');
  });
});
