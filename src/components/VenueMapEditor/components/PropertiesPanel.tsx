import { useCallback, useState, useEffect, useMemo } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { MapElement, ElementTypeDef, Wall, WallMaterial } from '../types';
import { parseSvgMarkup } from '../utils/svgParser';
import { sanitizeImageSrc } from '../utils/imageSrc';

interface PropertiesPanelProps {
  elements: MapElement[];
  typeDefs: Map<string, ElementTypeDef>;
  /** Pared seleccionada (tiene prioridad cuando no hay elementos elegidos). */
  wall?: Wall | null;
  onChangeWall?: (id: string, patch: Partial<Pick<Wall, 'thickness' | 'material'>>) => void;
  onDeleteWall?: (id: string) => void;
  onChangeLabel: (id: string, label: string) => void;
  onChangeGeometry: (id: string, x: number, y: number, w: number, h: number, r: number) => void;
  onDelete: (ids: string[]) => void;
  onDuplicate: (ids: string[]) => void;
  /** Contenedor estrecho: el panel pasa de columna lateral a hoja inferior. */
  compact?: boolean;
  /** Contenedor bajo: se limita más la altura de la hoja. */
  short?: boolean;
  /** Cierra el panel (solo se ofrece en compacto, donde tapa el lienzo). */
  onClose?: () => void;
}

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const PANEL_BASE =
  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col shrink-0';

/**
 * En pantallas anchas es una columna lateral fija; en estrechas se convierte en
 * una hoja inferior a todo el ancho, porque 224 px de columna se comen más de
 * la mitad de la pantalla de un móvil y dejan el lienzo inservible.
 */
function panelCls(compact: boolean, short: boolean): string {
  if (!compact) return `${PANEL_BASE} w-56 border-l`;
  return `${PANEL_BASE} w-full border-t ${short ? 'max-h-[55%]' : 'max-h-[45%]'} overflow-y-auto`;
}
const HEADER_CLS =
  'px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';
const FIELD_LABEL_CLS =
  'text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide';
const CONTROL_CLS =
  'w-full border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs ' +
  'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 ' +
  '[color-scheme:light] dark:[color-scheme:dark] ' +
  'focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-blue-500';
const BTN_CLS =
  'w-full text-xs px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 ' +
  'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors';
const DANGER_BTN_CLS =
  'w-full text-xs px-3 py-1.5 rounded bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 ' +
  'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors';

// ─── Small numeric field ──────────────────────────────────────────────────────

interface NumFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}

/**
 * Campo numérico con borrador local.
 *
 * Se edita como texto y solo se confirma al salir del campo o al pulsar Enter.
 * De este modo se puede escribir "-", vaciar el campo o teclear "150" sin que
 * cada pulsación genere una entrada en el historial ni produzca un `NaN` que
 * corrompa la geometría del elemento.
 */
function NumField({ label, value, onChange, step = 1, min }: NumFieldProps) {
  const rounded = Math.round(value);
  const [draft, setDraft] = useState(String(rounded));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(String(rounded));
  }, [rounded, editing]);

  const commit = () => {
    setEditing(false);
    const parsed = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(parsed)) {
      setDraft(String(rounded));   // entrada inválida: se revierte
      return;
    }
    const next = min !== undefined ? Math.max(min, parsed) : parsed;
    setDraft(String(Math.round(next)));
    if (next !== value) onChange(next);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
    if (e.key === 'Escape') { e.preventDefault(); setDraft(String(rounded)); setEditing(false); e.currentTarget.blur(); }
  };

  return (
    <label className="flex flex-col gap-0.5">
      <span className={FIELD_LABEL_CLS}>{label}</span>
      <input
        type="number"
        value={draft}
        step={step}
        onFocus={() => setEditing(true)}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        className={CONTROL_CLS}
      />
    </label>
  );
}

// ─── Cabecera ─────────────────────────────────────────────────────────────────

function PanelHeader({
  title,
  compact,
  onClose,
}: {
  title: string;
  compact: boolean;
  onClose?: () => void;
}) {
  return (
    <div className={`${HEADER_CLS} flex items-center justify-between gap-2`}>
      <span>{title}</span>
      {/* Como hoja inferior el panel tapa parte del lienzo, así que necesita
          una forma explícita de cerrarse. */}
      {compact && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 -my-1 text-base leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ─── Panel de pared ───────────────────────────────────────────────────────────

const MATERIAL_LABELS: Record<WallMaterial, string> = {
  concrete: 'Hormigón',
  brick: 'Ladrillo',
  glass: 'Cristal',
  drywall: 'Tabique',
  wood: 'Madera',
};

function WallPanel({
  wall,
  onChangeWall,
  onDeleteWall,
  compact = false,
  short = false,
  onClose,
}: {
  wall: Wall;
  onChangeWall?: PropertiesPanelProps['onChangeWall'];
  onDeleteWall?: PropertiesPanelProps['onDeleteWall'];
  compact?: boolean;
  short?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className={panelCls(compact, short)}>
      <PanelHeader title="Pared" compact={compact} onClose={onClose} />
      <div className="flex-1 flex flex-col gap-4 p-3">
        <label className="flex flex-col gap-0.5">
          <span className={FIELD_LABEL_CLS}>Material</span>
          <select
            value={wall.material}
            onChange={e => onChangeWall?.(wall.id, { material: e.target.value as WallMaterial })}
            className={CONTROL_CLS}
          >
            {(Object.keys(MATERIAL_LABELS) as WallMaterial[]).map(m => (
              <option key={m} value={m}>{MATERIAL_LABELS[m]}</option>
            ))}
          </select>
        </label>

        <NumField
          label="Grosor"
          value={wall.thickness}
          min={1}
          onChange={v => onChangeWall?.(wall.id, { thickness: v })}
        />
      </div>

      {onDeleteWall && (
        <div className="px-3 pb-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => onDeleteWall(wall.id)} className={DANGER_BTN_CLS}>
            Eliminar pared
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PropertiesPanel({
  elements,
  typeDefs,
  wall,
  onChangeWall,
  onDeleteWall,
  onChangeLabel,
  onChangeGeometry,
  onDelete,
  onDuplicate,
  compact = false,
  short = false,
  onClose,
}: PropertiesPanelProps) {
  const count = elements.length;

  const handleLabelChange = useCallback(
    (id: string, e: ChangeEvent<HTMLInputElement>) => onChangeLabel(id, e.target.value),
    [onChangeLabel],
  );

  const el = count === 1 ? elements[0] : null;
  const typeDef = el ? typeDefs.get(el.type) : undefined;

  // El markup SVG se parsea una vez por tipo, no en cada render del panel.
  const preview = useMemo(() => {
    if (!typeDef || typeDef.shape !== 'svg' || !typeDef.svgMarkup) return null;
    try {
      return parseSvgMarkup(typeDef.svgMarkup);
    } catch {
      return null;
    }
  }, [typeDef]);

  const imageHref = useMemo(
    () => (typeDef?.shape === 'image' ? sanitizeImageSrc(typeDef.imageSrc) : null),
    [typeDef],
  );

  if (count === 0) {
    return wall
      ? <WallPanel wall={wall} onChangeWall={onChangeWall} onDeleteWall={onDeleteWall}
                   compact={compact} short={short} onClose={onClose} />
      : null;
  }

  // ── Multi-selection ───────────────────────────────────────────────────────
  if (count > 1) {
    const ids = elements.map(e => e.id);
    return (
      <div className={panelCls(compact, short)}>
        <PanelHeader title="Propiedades" compact={compact} onClose={onClose} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{count}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">elementos seleccionados</span>
        </div>
        <div className="px-3 pb-3 flex flex-col gap-2">
          <button onClick={() => onDuplicate(ids)} className={BTN_CLS}>
            Duplicar selección
          </button>
          <button onClick={() => onDelete(ids)} className={DANGER_BTN_CLS}>
            Eliminar selección
          </button>
        </div>
      </div>
    );
  }

  // ── Single selection ──────────────────────────────────────────────────────
  if (!el) return null;

  const setGeom = (patch: Partial<{ x: number; y: number; w: number; h: number; r: number }>) => {
    onChangeGeometry(
      el.id,
      patch.x ?? el.x,
      patch.y ?? el.y,
      patch.w ?? el.width,
      patch.h ?? el.height,
      patch.r ?? el.rotation,
    );
  };

  return (
    <div className={`${panelCls(compact, short)} ${compact ? '' : 'overflow-y-auto'}`}>
      {/* Header */}
      <PanelHeader title="Propiedades" compact={compact} onClose={onClose} />

      <div className="flex-1 flex flex-col gap-4 p-3">
        {/* Type badge */}
        {typeDef && (
          <div className="flex items-center gap-2">
            {imageHref ? (
              <img
                src={imageHref}
                alt=""
                className="w-3.5 h-3.5 shrink-0 object-contain border border-slate-300 dark:border-slate-600 rounded-sm"
              />
            ) : preview ? (
              <svg
                viewBox={preview.viewBox}
                className="w-3.5 h-3.5 shrink-0 border border-slate-300 dark:border-slate-600 rounded-sm"
                style={{ color: typeDef.strokeColor }}
                dangerouslySetInnerHTML={{ __html: preview.innerHtml }}
              />
            ) : (
              <span
                className="w-3.5 h-3.5 rounded-sm shrink-0 border"
                style={{ background: typeDef.color, borderColor: typeDef.strokeColor }}
              />
            )}
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
              {typeDef.label}
            </span>
            {(typeDef.shape === 'svg' || typeDef.shape === 'image') && (
              <span className="text-[9px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium ml-auto">
                {typeDef.shape === 'svg' ? 'SVG' : 'IMG'}
              </span>
            )}
          </div>
        )}

        {/* Label */}
        <label className="flex flex-col gap-0.5">
          <span className={FIELD_LABEL_CLS}>Etiqueta</span>
          <input
            type="text"
            value={el.label ?? ''}
            placeholder={typeDef?.label ?? ''}
            onChange={e => handleLabelChange(el.id, e)}
            className={CONTROL_CLS}
          />
        </label>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <NumField label="X" value={el.x} onChange={v => setGeom({ x: v })} />
          <NumField label="Y" value={el.y} onChange={v => setGeom({ y: v })} />
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Ancho" value={el.width}  min={1} onChange={v => setGeom({ w: v })} />
          <NumField label="Alto"  value={el.height} min={1} onChange={v => setGeom({ h: v })} />
        </div>

        {/* Rotation */}
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Rotación °" value={el.rotation} onChange={v => setGeom({ r: v })} step={15} />
          <label className="flex flex-col gap-0.5">
            <span className={FIELD_LABEL_CLS}>&nbsp;</span>
            <button
              onClick={() => setGeom({ r: 0 })}
              className="border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Resetear
            </button>
          </label>
        </div>

        {/* Metadata (read-only key/value list) */}
        {el.metadata && Object.keys(el.metadata).length > 0 && (
          <div className="flex flex-col gap-1">
            <span className={FIELD_LABEL_CLS}>Metadata</span>
            {Object.entries(el.metadata).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate">{k}</span>
                <span className="ml-2 text-slate-400 dark:text-slate-500 truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
        <button onClick={() => onDuplicate([el.id])} className={BTN_CLS}>
          Duplicar (Ctrl+D)
        </button>
        <button onClick={() => onDelete([el.id])} className={DANGER_BTN_CLS}>
          Eliminar
        </button>
      </div>
    </div>
  );
}
