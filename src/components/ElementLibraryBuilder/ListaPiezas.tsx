import { useState } from 'react';
import type { ElementTypeDef } from '../VenueMapEditor/types';
import { Button, Input } from '../html';
import { bg, bgHover, border, focusVisibleRing, text } from '../../theme/tokens';
import { cn } from '../../internal/cn';
import { VistaPrevia } from './VistaPrevia';
import type { GrupoInterno } from './piezas';

interface ListaPiezasProps {
  grupos: GrupoInterno[];
  grupoActivoId: string;
  onElegirGrupo: (idInterno: string) => void;
  onNuevoGrupo: () => void;
  onRenombrarGrupo: (idInterno: string, nombre: string) => void;
  onBorrarGrupo: (idInterno: string) => void;

  piezas: ElementTypeDef[];
  indiceActivo: number | null;
  onElegirPieza: (indice: number) => void;
  onNuevaPieza: () => void;

  /** En columna estrecha las piezas van en una tira que se desplaza a lo ancho. */
  enTira: boolean;
}

function Papelera() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
    </svg>
  );
}

function Lapiz() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20h4L19 9a2.1 2.1 0 00-3-3L5 17v3z" />
    </svg>
  );
}

/**
 * Qué hay: las librerías y, dentro de la elegida, sus piezas dibujadas.
 *
 * Las piezas se enseñan con su dibujo y no con `id (shape)`, que era lo que
 * ponía antes: en una lista de doce puestos parecidos, el dibujo es lo único
 * que distingue uno de otro de un vistazo.
 */
export function ListaPiezas({
  grupos, grupoActivoId, onElegirGrupo, onNuevoGrupo, onRenombrarGrupo, onBorrarGrupo,
  piezas, indiceActivo, onElegirPieza, onNuevaPieza, enTira,
}: ListaPiezasProps) {
  const [renombrando, setRenombrando] = useState<string | null>(null);

  const cabecera = (titulo: string, extra: React.ReactNode) => (
    <div className="flex items-center justify-between gap-2">
      <h3 className={cn('text-xs font-bold uppercase tracking-wide', text.subtle)}>{titulo}</h3>
      {extra}
    </div>
  );

  return (
    <div className={cn('flex flex-col gap-4 min-w-0', enTira ? '' : 'h-full')}>

      <section className="flex flex-col gap-2 min-w-0">
        {cabecera('Librerías', (
          <Button variant="secondary" size="sm" onClick={onNuevoGrupo}>Nueva</Button>
        ))}
        <div className={cn('flex flex-col gap-1', enTira ? '' : 'max-h-48 overflow-y-auto pr-1')}>
          {grupos.map(grupo => {
            const activa = grupo.idInterno === grupoActivoId;
            return (
              <div
                key={grupo.idInterno}
                className={cn(
                  'flex items-center gap-1 rounded-lg border px-1',
                  activa ? cn(bg.accentSoft, border.accent) : cn('border-transparent', bgHover.surface),
                )}
              >
                {renombrando === grupo.idInterno ? (
                  <Input
                    autoFocus
                    aria-label={`Nombre de la librería ${grupo.nombre}`}
                    value={grupo.nombre}
                    onChange={e => onRenombrarGrupo(grupo.idInterno, e.target.value)}
                    onBlur={() => setRenombrando(null)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setRenombrando(null); }}
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      aria-pressed={activa}
                      onClick={() => onElegirGrupo(grupo.idInterno)}
                      onDoubleClick={() => setRenombrando(grupo.idInterno)}
                      className={cn('flex-1 min-w-0 text-left py-2 px-2 rounded-md cursor-pointer', focusVisibleRing)}
                    >
                      <span className={cn('block truncate font-semibold', activa ? text.base : text.muted)}>{grupo.nombre}</span>
                      <span className={cn('block text-xs', text.subtle)}>
                        {grupo.piezas.length === 1 ? '1 pieza' : `${grupo.piezas.length} piezas`}
                      </span>
                    </button>
                    {/* Renombrar y eliminar solo salen en la librería abierta:
                        en la lista son ruido, y la papelera a un toque de la
                        que no se está mirando es la que se pulsa sin querer. */}
                    {activa && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Cambiar el nombre de ${grupo.nombre}`}
                        title="Cambiar el nombre"
                        onClick={() => setRenombrando(grupo.idInterno)}
                        className="!px-2"
                      >
                        <Lapiz />
                      </Button>
                    )}
                    {activa && grupos.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Eliminar la librería ${grupo.nombre}`}
                        title="Eliminar la librería"
                        onClick={() => onBorrarGrupo(grupo.idInterno)}
                        className={cn('!px-2', text.danger)}
                      >
                        <Papelera />
                      </Button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className={cn('border-t', border.subtle)} />

      <section className={cn('flex flex-col gap-2 min-w-0', enTira ? '' : 'flex-1 min-h-0')}>
        {cabecera('Piezas', <span className={cn('text-xs', text.subtle)}>{piezas.length}</span>)}

        <div
          className={cn(
            enTira
              ? 'flex gap-2 overflow-x-auto pb-1'
              : 'grid grid-cols-2 gap-2 overflow-y-auto pr-1 flex-1 min-h-0 content-start',
          )}
        >
          {piezas.map((pieza, i) => {
            const elegida = indiceActivo === i;
            return (
              <div key={`${pieza.id}_${i}`} className={cn(enTira && 'shrink-0 w-24')}>
                <button
                  type="button"
                  aria-pressed={elegida}
                  onClick={() => onElegirPieza(i)}
                  className={cn(
                    'w-full min-h-24 rounded-xl border p-2 flex flex-col items-center justify-center gap-1 cursor-pointer',
                    elegida ? cn(bg.accentSoft, border.accent) : cn(bg.surfaceMuted, border.subtle, bgHover.surface),
                    focusVisibleRing,
                  )}
                >
                  <VistaPrevia pieza={pieza} ancho={56} alto={44} />
                  <span className={cn('text-xs font-semibold text-center leading-tight line-clamp-2', text.base)}>
                    {pieza.label || pieza.id}
                  </span>
                  <span className={cn('text-[11px] tabular-nums', text.subtle)}>
                    {pieza.defaultWidth} × {pieza.defaultHeight}
                  </span>
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={onNuevaPieza}
            className={cn(
              'min-h-24 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 text-sm font-semibold cursor-pointer',
              enTira && 'shrink-0 w-24',
              border.base, text.muted, bgHover.surface, focusVisibleRing,
            )}
          >
            <span aria-hidden="true" className="text-xl leading-none">+</span>
            Nueva pieza
          </button>
        </div>
      </section>
    </div>
  );
}
