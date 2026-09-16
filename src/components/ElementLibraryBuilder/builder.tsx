import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ElementLibrary, ElementTypeDef } from '../VenueMapEditor/types';
import { Button, Input, TextArea } from '../html';
import { useContainerSize } from '../VenueMapEditor/hooks/useContainerSize';
import { bg, border, focusVisibleRing, text } from '../../theme/tokens';
import { cn } from '../../internal/cn';
import { ListaPiezas } from './ListaPiezas';
import { PanelPieza } from './PanelPieza';
import { VistaPrevia } from './VistaPrevia';
import {
  PIEZA_NUEVA, gruposDesdeLibreria, identificadorDesde, identificadorUnico, leerLibreriaJson,
  libreriaDesdeGrupos, nombreLibreriaLibre, nuevoId, type GrupoInterno,
} from './piezas';

export interface ElementLibraryBuilderProps {
  /**
   * Con qué abre el taller. Sin ella arranca con una librería vacía.
   *
   * Se lee **al montar**, como `initialMap` del editor: el taller no es un
   * campo controlado y volver a pasarle otra librería no lo reinicia. Para
   * abrir otra, móntalo de nuevo con una `key` distinta.
   */
  librerias?: ElementLibrary;
  /**
   * Qué hacer con las librerías terminadas. Es el botón «Usar en el plano»;
   * sin esta prop el botón no aparece y quedan «Descargar» y «Copiar», que es
   * como funcionaba hasta la 3.9.
   */
  onGuardar?: (librerias: ElementLibrary) => void;
  /** Cierra el taller desde su propia barra. Sin ella no sale el botón. */
  onCerrar?: () => void;
  /** El título de la barra: «Piezas del plano», «Piezas del salón»… */
  titulo?: string;
  /** Nombre del `.json` que se descarga, sin extensión. */
  nombreArchivo?: string;
  className?: string;
}

/**
 * Ancho (del contenedor, no de la ventana) a partir del cual caben las tres
 * columnas. El taller se embebe en modales de todos los tamaños, así que manda
 * su propia caja.
 */
const TRES_COLUMNAS = 900;

/** Lo que dura el aviso de «Deshacer» antes de irse solo. */
const DESHACER_MS = 8000;

interface Deshacer {
  mensaje: string;
  restaurar: () => void;
}

/**
 * El taller donde se dibujan las piezas que luego se colocan en un plano.
 *
 * Tres zonas: qué hay (librerías y piezas), cómo queda (la pieza sobre la
 * rejilla del editor) y cómo se cambia (forma, tamaño, colores). Lo que se
 * toca se aplica: no hay botón de guardar la pieza, que era de donde salía el
 * fallo de perder lo escrito al saltar de una a otra.
 *
 * La salida sigue siendo el mismo JSON de librerías de siempre; lo nuevo es que
 * puede volver por {@link ElementLibraryBuilderProps.onGuardar} en vez de tener
 * que descargarlo e importarlo a mano.
 */
export const ElementLibraryBuilder: React.FC<ElementLibraryBuilderProps> = ({
  librerias,
  onGuardar,
  onCerrar,
  titulo = 'Piezas del plano',
  nombreArchivo = 'librerias',
  className = '',
}) => {
  const [grupos, setGrupos] = useState<GrupoInterno[]>(() => {
    const abiertos = gruposDesdeLibreria(librerias);
    return abiertos.length > 0 ? abiertos : [{ idInterno: nuevoId(), nombre: 'librería 1', piezas: [] }];
  });
  const [grupoActivoId, setGrupoActivoId] = useState('');
  const [indiceActivo, setIndiceActivo] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [verJson, setVerJson] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [sinGuardar, setSinGuardar] = useState(false);
  const [deshacer, setDeshacer] = useState<Deshacer | null>(null);

  const archivoRef = useRef<HTMLInputElement>(null);
  const raizRef = useRef<HTMLDivElement>(null);
  const lienzoRef = useRef<HTMLDivElement>(null);
  const { width: anchoCaja } = useContainerSize(raizRef);
  const { width: anchoLienzo, height: altoLienzo } = useContainerSize(lienzoRef);
  const apilado = anchoCaja > 0 && anchoCaja < TRES_COLUMNAS;

  // El grupo activo se resuelve contra la lista: así un borrado o una apertura
  // de archivo no dejan seleccionado algo que ya no existe.
  const grupoActivo = grupos.find(g => g.idInterno === grupoActivoId) ?? grupos[0];
  const piezas = grupoActivo?.piezas ?? [];
  const piezaActiva = indiceActivo !== null ? piezas[indiceActivo] : undefined;

  const libreriaGenerada = useMemo(() => libreriaDesdeGrupos(grupos), [grupos]);
  const json = useMemo(() => JSON.stringify(libreriaGenerada, null, 2), [libreriaGenerada]);

  useEffect(() => {
    if (!deshacer) return;
    const t = setTimeout(() => setDeshacer(null), DESHACER_MS);
    return () => clearTimeout(t);
  }, [deshacer]);

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  /** Toda modificación pasa por aquí: es lo que enciende «Sin guardar». */
  const cambiarGrupos = useCallback((siguiente: (previos: GrupoInterno[]) => GrupoInterno[]) => {
    setGrupos(previos => siguiente(previos));
    setSinGuardar(true);
  }, []);

  // ─── Librerías ─────────────────────────────────────────────────────────────

  const nuevoGrupo = () => {
    const grupo: GrupoInterno = { idInterno: nuevoId(), nombre: nombreLibreriaLibre(grupos), piezas: [] };
    cambiarGrupos(previos => [...previos, grupo]);
    setGrupoActivoId(grupo.idInterno);
    setIndiceActivo(null);
  };

  const renombrarGrupo = (idInterno: string, nombre: string) => {
    cambiarGrupos(previos => previos.map(g => (g.idInterno === idInterno ? { ...g, nombre } : g)));
  };

  const borrarGrupo = (idInterno: string) => {
    const indice = grupos.findIndex(g => g.idInterno === idInterno);
    if (indice < 0) return;
    const borrado = grupos[indice];
    cambiarGrupos(previos => previos.filter(g => g.idInterno !== idInterno));
    if (grupoActivoId === idInterno) {
      setGrupoActivoId('');
      setIndiceActivo(null);
    }
    setDeshacer({
      mensaje: `Se eliminó la librería «${borrado.nombre}»`,
      restaurar: () => {
        cambiarGrupos(previos => {
          const copia = [...previos];
          copia.splice(Math.min(indice, copia.length), 0, borrado);
          return copia;
        });
        setGrupoActivoId(borrado.idInterno);
      },
    });
  };

  // ─── Piezas ────────────────────────────────────────────────────────────────

  const nuevaPieza = () => {
    if (!grupoActivo) return;
    const usados = grupoActivo.piezas.map(p => p.id);
    const label = `Pieza ${grupoActivo.piezas.length + 1}`;
    const pieza: ElementTypeDef = {
      ...PIEZA_NUEVA,
      id: identificadorUnico(identificadorDesde(label), usados),
      label,
    };
    cambiarGrupos(previos => previos.map(g => (
      g.idInterno === grupoActivo.idInterno ? { ...g, piezas: [...g.piezas, pieza] } : g
    )));
    setIndiceActivo(grupoActivo.piezas.length);
    setErrorImagen(null);
  };

  const borrarPieza = (indice: number) => {
    if (!grupoActivo) return;
    const borrada = grupoActivo.piezas[indice];
    if (!borrada) return;
    const idGrupo = grupoActivo.idInterno;
    cambiarGrupos(previos => previos.map(g => (
      g.idInterno === idGrupo ? { ...g, piezas: g.piezas.filter((_, i) => i !== indice) } : g
    )));
    setIndiceActivo(null);
    setDeshacer({
      mensaje: `Se eliminó «${borrada.label || borrada.id}»`,
      restaurar: () => {
        cambiarGrupos(previos => previos.map(g => {
          if (g.idInterno !== idGrupo) return g;
          const copia = [...g.piezas];
          copia.splice(Math.min(indice, copia.length), 0, borrada);
          return { ...g, piezas: copia };
        }));
        setIndiceActivo(indice);
      },
    });
  };

  /** Escribe los cambios directamente en la pieza: no hay copia que confirmar. */
  const cambiarPieza = useCallback((cambios: Partial<ElementTypeDef>) => {
    if (!grupoActivo || indiceActivo === null) return;
    const idGrupo = grupoActivo.idInterno;
    cambiarGrupos(previos => previos.map(g => {
      if (g.idInterno !== idGrupo) return g;
      const copia = [...g.piezas];
      const actual = copia[indiceActivo];
      if (!actual) return g;
      const siguiente = { ...actual, ...cambios };
      // El identificador sigue al nombre mientras nadie lo haya escrito a mano:
      // así «Puesto de carro» da `puesto_de_carro` sin pedir nada, pero un
      // identificador propio no se pisa al corregir una tilde del rótulo.
      if (cambios.label !== undefined && actual.id === identificadorDesde(actual.label)) {
        const usados = copia.filter((_, i) => i !== indiceActivo).map(p => p.id);
        siguiente.id = identificadorUnico(identificadorDesde(cambios.label), usados);
      }
      copia[indiceActivo] = siguiente;
      return { ...g, piezas: copia };
    }));
  }, [cambiarGrupos, grupoActivo, indiceActivo]);

  const cambiarIdentificador = (valor: string) => {
    if (!grupoActivo || indiceActivo === null) return;
    const usados = grupoActivo.piezas.filter((_, i) => i !== indiceActivo).map(p => p.id);
    cambiarPieza({ id: identificadorUnico(identificadorDesde(valor), usados) });
  };

  // ─── Entrada y salida ──────────────────────────────────────────────────────

  const abrirArchivo = async (file: File | undefined) => {
    if (!file) return;
    setErrorArchivo(null);
    const { librerias: leidas, error } = leerLibreriaJson(await file.text());
    if (error || !leidas) {
      setErrorArchivo(error ?? 'No se pudo leer el archivo.');
      return;
    }
    const abiertos = gruposDesdeLibreria(leidas);
    // Las que ya estaban con el mismo nombre se sustituyen; el resto se suma.
    cambiarGrupos(previos => [
      ...previos.filter(g => !abiertos.some(n => n.nombre === g.nombre)),
      ...abiertos,
    ]);
    setGrupoActivoId(abiertos[0]?.idInterno ?? '');
    setIndiceActivo(null);
  };

  const descargar = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreArchivo}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copiar = () => {
    void navigator.clipboard?.writeText(json);
    setCopiado(true);
  };

  const guardar = () => {
    onGuardar?.(libreriaGenerada);
    setSinGuardar(false);
  };

  // ─── Pintado ───────────────────────────────────────────────────────────────

  const totalPiezas = grupos.reduce((n, g) => n + g.piezas.length, 0);

  const lista = (
    <ListaPiezas
      grupos={grupos}
      grupoActivoId={grupoActivo?.idInterno ?? ''}
      onElegirGrupo={id => { setGrupoActivoId(id); setIndiceActivo(null); }}
      onNuevoGrupo={nuevoGrupo}
      onRenombrarGrupo={renombrarGrupo}
      onBorrarGrupo={borrarGrupo}
      piezas={piezas}
      indiceActivo={indiceActivo}
      onElegirPieza={i => { setIndiceActivo(i); setErrorImagen(null); }}
      onNuevaPieza={nuevaPieza}
      enTira={apilado}
    />
  );

  const centro = (
    <div className={cn('flex flex-col gap-3 min-w-0', apilado ? '' : 'flex-1 min-h-0')}>
      <div
        ref={lienzoRef}
        className={cn(
          'rounded-xl border flex items-center justify-center overflow-hidden relative',
          border.subtle, bg.surface,
          apilado ? 'h-56' : 'flex-1 min-h-56',
        )}
      >
        {piezaActiva ? (
          <>
            <VistaPrevia
              pieza={piezaActiva}
              ancho={Math.max(160, Math.round(anchoLienzo) || 320)}
              alto={Math.max(140, Math.round(altoLienzo) || 240)}
              conCuadricula
              conEtiqueta
            />
            <span className={cn('absolute top-2 left-3 text-xs', text.subtle)}>Así se verá en el plano</span>
            <span className={cn('absolute bottom-2 right-3 text-xs tabular-nums', text.subtle)}>
              {piezaActiva.defaultWidth} × {piezaActiva.defaultHeight}
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center px-6 py-10">
            <p className="text-base font-semibold">
              {piezas.length === 0 ? 'Esta librería está vacía' : 'Elige una pieza'}
            </p>
            <p className={cn('text-sm max-w-xs', text.subtle)}>
              {piezas.length === 0
                ? 'Dibuja la primera pieza —un puesto, una columna, una flecha— o abre una librería que ya tengas.'
                : 'Toca una de las piezas de la lista para cambiarle la forma, el tamaño o el color.'}
            </p>
            <div className="flex gap-2 mt-2">
              <Button variant="primary" onClick={nuevaPieza}>Nueva pieza</Button>
              <Button variant="secondary" onClick={() => archivoRef.current?.click()}>Abrir librería…</Button>
            </div>
          </div>
        )}
      </div>

      {piezaActiva && (
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <Input
                label="Nombre de la pieza"
                value={piezaActiva.label}
                onChange={e => cambiarPieza({ label: e.target.value })}
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => indiceActivo !== null && borrarPieza(indiceActivo)}
              className={text.danger}
            >
              Eliminar
            </Button>
          </div>
          {editandoId ? (
            <Input
              autoFocus
              label="Identificador"
              helperText="Es lo que guarda cada elemento colocado en un plano. Cambiarlo en una librería ya usada deja sueltos los elementos viejos."
              value={piezaActiva.id}
              onChange={e => cambiarIdentificador(e.target.value)}
              onBlur={() => setEditandoId(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditandoId(false); }}
              className="font-mono text-sm"
            />
          ) : (
            <p className={cn('text-xs', text.subtle)}>
              Identificador: <span className="font-mono">{piezaActiva.id}</span>{' '}
              <button
                type="button"
                onClick={() => setEditandoId(true)}
                className={cn('font-semibold cursor-pointer rounded', text.accent, focusVisibleRing)}
              >
                cambiar
              </button>
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setVerJson(v => !v)} aria-expanded={verJson}>
            {verJson ? 'Ocultar el JSON' : 'Ver el JSON'}
          </Button>
          <span className={cn('text-xs', text.subtle)}>Para copiarlo a otro proyecto o revisarlo. Es de solo lectura.</span>
          {verJson && (
            <Button variant="secondary" size="sm" onClick={copiar} className="ml-auto">
              {copiado ? 'Copiado' : 'Copiar'}
            </Button>
          )}
        </div>
        {verJson && (
          <TextArea
            readOnly
            rows={apilado ? 8 : 10}
            value={json}
            aria-label="JSON de las librerías"
            className={cn('resize-none font-mono text-xs', bg.surfaceMuted, border.subtle, text.success)}
          />
        )}
      </div>
    </div>
  );

  const panel = piezaActiva ? (
    <PanelPieza
      pieza={piezaActiva}
      onCambio={cambiarPieza}
      errorImagen={errorImagen}
      onErrorImagen={setErrorImagen}
      apilado={apilado}
    />
  ) : (
    <p className={cn('text-sm', text.subtle)}>
      Elige una pieza para cambiarle la forma, el tamaño y los colores.
    </p>
  );

  return (
    <div
      ref={raizRef}
      className={cn('flex flex-col h-full min-h-0 text-sm', text.base, bg.surface, className)}
    >
      {/* Barra */}
      <div className={cn('shrink-0 flex flex-wrap items-center gap-2 px-4 py-3 border-b', border.subtle)}>
        <div className="flex-1 min-w-40">
          <h2 className="text-base font-bold leading-tight">{titulo}</h2>
          <p className={cn('text-xs', text.subtle)}>
            {grupos.length === 1 ? '1 librería' : `${grupos.length} librerías`} · {totalPiezas === 1 ? '1 pieza' : `${totalPiezas} piezas`}
          </p>
        </div>

        {onGuardar && (
          <span className={cn('text-xs font-semibold', sinGuardar ? text.warning : text.success)}>
            {sinGuardar ? '● Sin guardar' : '● Guardado'}
          </span>
        )}

        <input
          ref={archivoRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={e => { void abrirArchivo(e.target.files?.[0]); e.target.value = ''; }}
        />
        <Button variant="secondary" onClick={() => archivoRef.current?.click()}>Abrir…</Button>
        <Button variant="secondary" onClick={descargar}>Descargar</Button>
        {!onGuardar && (
          <Button variant="secondary" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar'}</Button>
        )}
        {onGuardar && <Button variant="primary" onClick={guardar}>Usar en el plano</Button>}
        {onCerrar && <Button variant="secondary" onClick={onCerrar}>Cerrar</Button>}
      </div>

      {errorArchivo && (
        <p role="alert" className={cn('shrink-0 px-4 py-2 text-sm border-b', border.subtle, text.danger)}>
          {errorArchivo}
        </p>
      )}

      {/* Cuerpo */}
      <div className={cn('flex-1 min-h-0', apilado ? 'overflow-y-auto' : 'flex')}>
        {apilado ? (
          <div className="flex flex-col gap-4 p-4">
            {lista}
            {centro}
            <div className={cn('border-t pt-4', border.subtle)}>{panel}</div>
          </div>
        ) : (
          <>
            <div className={cn('w-72 shrink-0 border-r p-4 overflow-y-auto', border.subtle)}>{lista}</div>
            <div className="flex-1 min-w-0 flex flex-col p-4 overflow-y-auto">{centro}</div>
            <div className={cn('w-80 shrink-0 border-l p-4 overflow-y-auto', border.subtle)}>{panel}</div>
          </>
        )}
      </div>

      {/* Deshacer */}
      <div aria-live="polite" className="shrink-0">
        {deshacer && (
          <div className={cn('flex items-center gap-3 px-4 py-3 border-t', border.subtle, bg.surfaceMuted)}>
            <span className="text-sm">{deshacer.mensaje}</span>
            <Button
              variant="secondary"
              size="sm"
              className="ml-auto"
              onClick={() => { deshacer.restaurar(); setDeshacer(null); }}
            >
              Deshacer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
