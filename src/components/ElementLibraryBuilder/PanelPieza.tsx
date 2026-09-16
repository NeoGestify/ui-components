import type { ReactNode } from 'react';
import type { ElementShape, ElementTypeDef } from '../VenueMapEditor/types';
import { Button, Input, Select, Switch, TextArea } from '../html';
import { IMAGE_ACCEPT, fileToDataUri, sanitizeImageSrc } from '../VenueMapEditor/utils/imageSrc';
import { bg, bgHover, border, focusVisibleRing, text } from '../../theme/tokens';
import { cn } from '../../internal/cn';
import {
  AVISO_IMAGEN_BYTES, BORDES, FORMAS, PASO_TAMANO, RELLENOS, TAMANO_MAXIMO, TAMANO_MINIMO,
  bytesDeDataUri,
} from './piezas';

interface PanelPiezaProps {
  pieza: ElementTypeDef;
  /** Cambia una o varias propiedades de la pieza. Se aplica al momento. */
  onCambio: (cambios: Partial<ElementTypeDef>) => void;
  /** Lo que le pasa al archivo de imagen elegido, si algo le pasa. */
  errorImagen: string | null;
  onErrorImagen: (error: string | null) => void;
  /** En una columna estrecha los pares de campos se apilan. */
  apilado: boolean;
}

/** Los dibujos de las seis formas, para elegir viendo y no leyendo. */
const GLIFOS: Record<ElementShape, ReactNode> = {
  rect: <rect x="3" y="5" width="18" height="14" rx="1.5" />,
  circle: <ellipse cx="12" cy="12" rx="9" ry="7" />,
  arrow: <path d="M3 12h13m-4-5 6 5-6 5" />,
  path: <path d="M4 18c4-12 12-12 16 0" />,
  svg: <path d="M9 7 4 12l5 5m6-10 5 5-5 5" />,
  image: <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m5 17 5-5 4 4 2-2 3 3" /></>,
};

function Glifo({ forma }: { forma: ElementShape }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {GLIFOS[forma]}
    </svg>
  );
}

function Apartado({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h4 className={cn('text-xs font-bold uppercase tracking-wide', text.subtle)}>{titulo}</h4>
      {children}
    </section>
  );
}

/** Un número que se puede tocar con el dedo: menos, el valor y más. */
function Paso({ etiqueta, valor, onCambio }: { etiqueta: string; valor: number; onCambio: (v: number) => void }) {
  const acotar = (v: number) => Math.min(TAMANO_MAXIMO, Math.max(TAMANO_MINIMO, Math.round(v)));
  return (
    <div className="flex flex-col gap-1">
      <div className={cn('flex items-stretch h-11 rounded-lg border overflow-hidden', border.base)}>
        <button
          type="button"
          aria-label={`Menos ${etiqueta}`}
          onClick={() => onCambio(acotar(valor - PASO_TAMANO))}
          className={cn('w-11 text-lg font-semibold cursor-pointer', bg.surfaceMuted, bgHover.surface, text.muted, focusVisibleRing)}
        >
          −
        </button>
        <input
          type="number"
          aria-label={etiqueta}
          value={Number.isFinite(valor) ? valor : ''}
          onChange={e => onCambio(acotar(Number(e.target.value)))}
          className={cn(
            'flex-1 min-w-0 text-center text-base font-semibold tabular-nums bg-transparent outline-none',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            text.base,
          )}
        />
        <button
          type="button"
          aria-label={`Más ${etiqueta}`}
          onClick={() => onCambio(acotar(valor + PASO_TAMANO))}
          className={cn('w-11 text-lg font-semibold cursor-pointer', bg.surfaceMuted, bgHover.surface, text.muted, focusVisibleRing)}
        >
          +
        </button>
      </div>
      <span className={cn('text-xs text-center', text.subtle)}>{etiqueta}</span>
    </div>
  );
}

/** Fila de colores de partida más el selector del sistema para cualquier otro. */
function Muestras({
  etiqueta, colores, valor, onCambio,
}: { etiqueta: string; colores: string[]; valor: string; onCambio: (color: string) => void }) {
  const propio = !colores.includes((valor ?? '').toLowerCase());
  return (
    <div className="flex flex-wrap items-center gap-2">
      {colores.map(color => {
        const elegido = (valor ?? '').toLowerCase() === color;
        return (
          <button
            key={color}
            type="button"
            aria-label={`${etiqueta} ${color}`}
            aria-pressed={elegido}
            onClick={() => onCambio(color)}
            style={{ backgroundColor: color }}
            className={cn(
              'w-9 h-9 rounded-lg border cursor-pointer',
              border.base,
              elegido && 'ring-2 ring-offset-2 ring-[color:var(--nui-ring,oklch(58.5%_.233_277.117))]',
              focusVisibleRing,
            )}
          />
        );
      })}
      <label
        className={cn(
          'w-9 h-9 rounded-lg border border-dashed flex items-center justify-center cursor-pointer relative',
          border.base, bg.surfaceMuted, text.muted,
          propio && 'ring-2 ring-offset-2 ring-[color:var(--nui-ring,oklch(58.5%_.233_277.117))]',
        )}
        style={propio ? { backgroundColor: valor } : undefined}
        title={`Otro color de ${etiqueta.toLowerCase()}`}
      >
        <span aria-hidden="true" className={propio ? 'sr-only' : ''}>+</span>
        <input
          type="color"
          aria-label={`Otro color de ${etiqueta.toLowerCase()}`}
          value={valor || '#000000'}
          onChange={e => onCambio(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
    </div>
  );
}

/**
 * Lo que se puede cambiar de una pieza: forma, tamaño, colores, si se puede
 * tocar y lo que pida su forma.
 *
 * Cada cambio se aplica en el momento. No hay botón de guardar porque no hay
 * nada que confirmar: el estado de arriba es el único sitio donde vive la
 * pieza.
 */
export function PanelPieza({ pieza, onCambio, errorImagen, onErrorImagen, apilado }: PanelPiezaProps) {
  const rejilla = apilado ? 'grid-cols-1' : 'grid-cols-2';

  const elegirImagen = async (file: File | undefined) => {
    if (!file) return;
    onErrorImagen(null);
    try {
      const dataUri = await fileToDataUri(file);
      if (!sanitizeImageSrc(dataUri)) {
        // El SVG en data URI se rechaza a propósito: puede traer scripts. Para
        // vectores está la forma «SVG», que sí se limpia.
        onErrorImagen('Ese formato no sirve. Usa PNG, JPG, WEBP, GIF o AVIF; si es un vector, elige la forma «SVG».');
        return;
      }
      onCambio({ imageSrc: dataUri });
    } catch {
      onErrorImagen('No se pudo leer el archivo.');
    }
  };

  const bytes = pieza.imageSrc ? bytesDeDataUri(pieza.imageSrc) : 0;

  return (
    <div className="flex flex-col gap-5">

      <Apartado titulo="Forma">
        <div className="grid grid-cols-3 gap-2">
          {FORMAS.map(f => {
            const elegida = pieza.shape === f.valor;
            return (
              <button
                key={f.valor}
                type="button"
                aria-pressed={elegida}
                onClick={() => onCambio({ shape: f.valor })}
                className={cn(
                  'min-h-16 rounded-lg border flex flex-col items-center justify-center gap-1 text-xs font-semibold cursor-pointer',
                  elegida
                    ? cn(bg.accentSoft, border.accent, text.accent)
                    : cn(bg.surfaceMuted, border.subtle, text.muted, bgHover.surface),
                  focusVisibleRing,
                )}
              >
                <Glifo forma={f.valor} />
                {f.etiqueta}
              </button>
            );
          })}
        </div>
      </Apartado>

      <Apartado titulo="Tamaño en el plano">
        <div className="grid grid-cols-2 gap-2">
          <Paso etiqueta="ancho" valor={pieza.defaultWidth} onCambio={v => onCambio({ defaultWidth: v })} />
          <Paso etiqueta="alto" valor={pieza.defaultHeight} onCambio={v => onCambio({ defaultHeight: v })} />
        </div>
        <p className={cn('text-xs', text.subtle)}>
          En píxeles del plano, que van de veinte en veinte: la rejilla del editor.
        </p>
      </Apartado>

      <Apartado titulo="Relleno">
        <Muestras etiqueta="Relleno" colores={RELLENOS} valor={pieza.color} onCambio={color => onCambio({ color })} />
      </Apartado>

      <Apartado titulo="Borde">
        <Muestras etiqueta="Borde" colores={BORDES} valor={pieza.strokeColor} onCambio={strokeColor => onCambio({ strokeColor })} />
      </Apartado>

      <div className={cn('border-t pt-4', border.subtle)}>
        <Switch
          checked={!!pieza.clickable}
          onChange={clickable => onCambio({ clickable })}
          label="Se puede tocar en el plano"
          description="Quien mire el plano podrá tocar esta pieza para abrir su ficha. Mientras se edita, todas se tocan."
        />
      </div>

      {pieza.shape === 'path' && (
        <div className={cn('flex flex-col gap-3 border rounded-lg p-3', border.subtle, bg.surfaceMuted)}>
          <h4 className="text-sm font-semibold">El trazo</h4>
          <div className={cn('grid gap-3', rejilla)}>
            <Input
              label="Espacio de coordenadas"
              placeholder="0 0 100 100"
              value={pieza.viewBox ?? ''}
              onChange={e => onCambio({ viewBox: e.target.value })}
            />
            <Select
              label="Cómo se rellenan los huecos"
              options={[
                { value: 'nonzero', label: 'Rellenar todo (nonzero)' },
                { value: 'evenodd', label: 'Dejar huecos (evenodd)' },
              ]}
              value={pieza.fillRule ?? 'nonzero'}
              onChange={e => onCambio({ fillRule: e.target.value as 'nonzero' | 'evenodd' })}
            />
          </div>
          <TextArea
            label="Dibujo del trazo"
            placeholder="M10 10 H 90 V 90 H 10 Z"
            value={pieza.svgPath ?? ''}
            onChange={e => onCambio({ svgPath: e.target.value })}
            rows={4}
            className="font-mono text-xs"
          />
        </div>
      )}

      {pieza.shape === 'svg' && (
        <div className={cn('flex flex-col gap-3 border rounded-lg p-3', border.subtle, bg.surfaceMuted)}>
          <h4 className="text-sm font-semibold">El SVG</h4>
          <TextArea
            label="Pega aquí el SVG"
            value={pieza.svgMarkup ?? ''}
            onChange={e => onCambio({ svgMarkup: e.target.value })}
            rows={6}
            placeholder={"<svg viewBox='0 0 100 100'><circle cx='50' cy='50' r='50'/></svg>"}
            className="font-mono text-xs"
          />
          <p className={cn('text-xs', text.subtle)}>
            Se limpia solo: se quitan los <code>&lt;script&gt;</code> y los eventos antes de guardarlo. Tiene que
            traer su <code>viewBox</code>.
          </p>
        </div>
      )}

      {pieza.shape === 'image' && (
        <div className={cn('flex flex-col gap-3 border rounded-lg p-3', border.subtle, bg.surfaceMuted)}>
          <h4 className="text-sm font-semibold">La imagen</h4>
          <Input
            type="file"
            label="Archivo"
            accept={IMAGE_ACCEPT}
            onChange={e => void elegirImagen(e.target.files?.[0])}
            error={errorImagen ?? undefined}
            helperText="PNG · JPG · WEBP · GIF · AVIF"
          />
          {pieza.imageSrc && (
            <div className="flex items-center gap-3">
              <img
                src={pieza.imageSrc}
                alt="La imagen elegida"
                className={cn('w-16 h-16 object-contain border rounded bg-white', border.subtle)}
              />
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className={cn('text-xs', text.subtle)}>{(bytes / 1024).toFixed(0)} KB dentro del JSON</span>
                {bytes > AVISO_IMAGEN_BYTES && (
                  <span className={cn('text-xs', text.warning)}>
                    Pesada: se copia en cada plano que la use. Por debajo de 100 KB carga más rápido.
                  </span>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { onCambio({ imageSrc: undefined }); onErrorImagen(null); }}
              >
                Quitar
              </Button>
            </div>
          )}
          <Select
            label="Cómo encaja en la caja"
            options={[
              { value: 'xMidYMid meet', label: 'Contener (mantiene la proporción)' },
              { value: 'xMidYMid slice', label: 'Cubrir (recorta lo que sobra)' },
              { value: 'none', label: 'Estirar (la deforma)' },
            ]}
            value={pieza.preserveAspectRatio ?? 'xMidYMid meet'}
            onChange={e => onCambio({ preserveAspectRatio: e.target.value })}
          />
          <p className={cn('text-xs', text.subtle)}>
            El archivo se guarda dentro del JSON, así que el plano se ve igual sin depender de ningún servidor.
          </p>
        </div>
      )}
    </div>
  );
}
