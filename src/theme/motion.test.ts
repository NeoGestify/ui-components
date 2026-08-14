import { describe, expect, it } from 'bun:test';
import {
  MOTION_VARS, blurStyle, motionStyle, motionToCss, motionToVars,
  NO_MOTION_STYLE,
} from './motion';

describe('motionToVars', () => {
  it('los números llevan su unidad', () => {
    expect(motionToVars({ duration: 320, durationFast: 90, blur: 12 })).toEqual([
      [MOTION_VARS.duration, '320ms'],
      [MOTION_VARS.durationFast, '90ms'],
      [MOTION_VARS.blur, '12px'],
    ]);
  });

  it('las cadenas pasan tal cual, para poder usar `s` o `rem`', () => {
    expect(motionToVars({ duration: '0.4s', blur: '1rem' })).toEqual([
      [MOTION_VARS.duration, '0.4s'],
      [MOTION_VARS.blur, '1rem'],
    ]);
  });

  it('`blur: false` es 0px y no `none`', () => {
    // `none` no es interpolable: el velo dejaría de animarse en vez de
    // animarse hacia nada.
    expect(motionToVars({ blur: false })).toEqual([[MOTION_VARS.blur, '0px']]);
  });

  it('lo que no se indica no se toca', () => {
    expect(motionToVars({ blur: 4 })).toHaveLength(1);
    expect(motionToVars({})).toEqual([]);
  });

  it('`blur: 0` se distingue de no indicarlo', () => {
    expect(motionToVars({ blur: 0 })).toEqual([[MOTION_VARS.blur, '0px']]);
  });
});

describe('motionStyle', () => {
  it('sin valor o con `true` no fuerza nada', () => {
    expect(motionStyle(undefined)).toBeUndefined();
    expect(motionStyle(true)).toBeUndefined();
  });

  it('`false` deja todo instantáneo', () => {
    expect(motionStyle(false)).toBe(NO_MOTION_STYLE);
  });

  it('un número ajusta las dos duraciones manteniendo la proporción', () => {
    // Si `durationFast` no bajara con ella, un valor alto dejaría los tooltips
    // tan lentos como un modal.
    expect(motionStyle(400)).toEqual({
      [MOTION_VARS.duration]: '400ms',
      [MOTION_VARS.durationFast]: '240ms',
    } as never);
  });

  it('un objeto pasa a variables', () => {
    expect(motionStyle({ blur: 20 })).toEqual({ [MOTION_VARS.blur]: '20px' } as never);
  });
});

describe('blurStyle', () => {
  it('sin valor no fuerza nada', () => {
    expect(blurStyle(undefined)).toBeUndefined();
  });

  it('número, cadena y `false`', () => {
    expect(blurStyle(16)).toEqual({ [MOTION_VARS.blur]: '16px' } as never);
    expect(blurStyle('2rem')).toEqual({ [MOTION_VARS.blur]: '2rem' } as never);
    expect(blurStyle(false)).toEqual({ [MOTION_VARS.blur]: '0px' } as never);
  });
});

describe('motionToCss', () => {
  it('`true` no escribe nada: es el valor por defecto', () => {
    expect(motionToCss(true)).toBe('');
  });

  it('`false` apaga las dos duraciones', () => {
    expect(motionToCss(false)).toBe(':root{--nui-duration:0ms;--nui-duration-fast:0ms}');
  });

  it('acepta ajustes y selector propio', () => {
    expect(motionToCss({ duration: 320, blur: 0 }, '.app'))
      .toBe('.app{--nui-duration:320ms;--nui-blur:0px}');
  });
});
