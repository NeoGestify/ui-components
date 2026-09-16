import { describe, expect, test } from 'bun:test';
import {
  gruposDesdeLibreria, identificadorDesde, identificadorUnico, leerLibreriaJson, libreriaDesdeGrupos,
} from './piezas';
import type { ElementTypeDef } from '../VenueMapEditor/types';

const pieza = (id: string, label = id): ElementTypeDef => ({
  id, label, shape: 'rect', defaultWidth: 60, defaultHeight: 60, color: '#fff', strokeColor: '#000',
});

describe('identificadorDesde', () => {
  test('quita tildes, mayúsculas y espacios', () => {
    expect(identificadorDesde('Puesto de carro')).toBe('puesto_de_carro');
    expect(identificadorDesde('Rampa Nº 2 (salida)')).toBe('rampa_n_2_salida');
  });

  test('nunca devuelve vacío', () => {
    // Un nombre de solo símbolos dejaría el JSON con una clave vacía.
    expect(identificadorDesde('¿?¡!')).toBe('pieza');
    expect(identificadorDesde('')).toBe('pieza');
  });
});

describe('identificadorUnico', () => {
  test('respeta el que está libre', () => {
    expect(identificadorUnico('columna', ['puesto', 'rampa'])).toBe('columna');
  });

  test('numera desde el dos y salta los ya cogidos', () => {
    expect(identificadorUnico('columna', ['columna'])).toBe('columna_2');
    expect(identificadorUnico('columna', ['columna', 'columna_2'])).toBe('columna_3');
  });
});

describe('libreriaDesdeGrupos / gruposDesdeLibreria', () => {
  test('el JSON que sale es el que lee el mapa', () => {
    const lib = libreriaDesdeGrupos([{ idInterno: 'x', nombre: 'parqueadero', piezas: [pieza('puesto')] }]);
    expect(lib).toEqual({ parqueadero: { name: 'parqueadero', objects: [pieza('puesto')] } });
  });

  test('abrir y volver a generar deja la librería igual', () => {
    const original = { salon: { name: 'salon', objects: [pieza('mesa'), pieza('silla')] } };
    expect(libreriaDesdeGrupos(gruposDesdeLibreria(original))).toEqual(original);
  });

  test('sin librería no hay grupos', () => {
    expect(gruposDesdeLibreria(undefined)).toEqual([]);
  });
});

describe('leerLibreriaJson', () => {
  test('lee un archivo bueno', () => {
    const texto = JSON.stringify({ salon: { name: 'salon', objects: [pieza('mesa')] } });
    expect(leerLibreriaJson(texto).librerias).toEqual({ salon: { name: 'salon', objects: [pieza('mesa')] } });
  });

  test('toma la clave como nombre si el archivo no lo trae', () => {
    const { librerias } = leerLibreriaJson(JSON.stringify({ salon: { objects: [] } }));
    expect(librerias?.salon.name).toBe('salon');
  });

  test('descarta las piezas sin identificador en vez de romperse', () => {
    const { librerias } = leerLibreriaJson(JSON.stringify({ salon: { objects: [pieza('mesa'), { label: 'sin id' }] } }));
    expect(librerias?.salon.objects).toHaveLength(1);
  });

  test('dice qué le falta al archivo, no «Unexpected token»', () => {
    expect(leerLibreriaJson('{').error).toBe('El archivo no es un JSON válido.');
    expect(leerLibreriaJson('[]').error).toContain('un objeto');
    expect(leerLibreriaJson('{}').error).toContain('ninguna librería');
    expect(leerLibreriaJson(JSON.stringify({ salon: { name: 'salon' } })).error).toContain('«objects»');
  });
});
