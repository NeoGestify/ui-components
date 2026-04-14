import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { MapElement, ElementTypeDef } from '../types';
import { parseSvgMarkup } from '../utils/svgParser';

interface PropertiesPanelProps {
  elements: MapElement[];
  typeDefs: Map<string, ElementTypeDef>;
  onChangeLabel: (id: string, label: string) => void;
  onChangeGeometry: (id: string, x: number, y: number, w: number, h: number, r: number) => void;
  onDelete: (ids: string[]) => void;
  onDuplicate: (ids: string[]) => void;
}

// ─── Small numeric field ──────────────────────────────────────────────────────

interface NumFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}

function NumField({ label, value, onChange, step = 1 }: NumFieldProps) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <input
        type="number"
        value={Math.round(value)}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
      />
    </label>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PropertiesPanel({
  elements,
  typeDefs,
  onChangeLabel,
  onChangeGeometry,
  onDelete,
  onDuplicate,
}: PropertiesPanelProps) {
  const count = elements.length;

  const handleLabelChange = useCallback(
    (id: string, e: ChangeEvent<HTMLInputElement>) => onChangeLabel(id, e.target.value),
    [onChangeLabel],
  );

  if (count === 0) return null;

  // ── Multi-selection ───────────────────────────────────────────────────────
  if (count > 1) {
    const ids = elements.map(el => el.id);
    return (
      <div className="w-56 shrink-0 border-l border-slate-200 bg-white flex flex-col">
        <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Propiedades
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <span className="text-2xl font-bold text-slate-700">{count}</span>
          <span className="text-xs text-slate-400">elementos seleccionados</span>
        </div>
        <div className="px-3 pb-3 flex flex-col gap-2">
          <button
            onClick={() => onDuplicate(ids)}
            className="w-full text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Duplicar selección
          </button>
          <button
            onClick={() => onDelete(ids)}
            className="w-full text-xs px-3 py-1.5 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
          >
            Eliminar selección
          </button>
        </div>
      </div>
    );
  }

  // ── Single selection ──────────────────────────────────────────────────────
  const el = elements[0];
  const typeDef = typeDefs.get(el.type);

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
    <div className="w-56 shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Propiedades
      </div>

      <div className="flex-1 flex flex-col gap-4 p-3">
        {/* Type badge */}
        {typeDef && (
          <div className="flex items-center gap-2">
            {typeDef.shape === 'svg' ? (
              <svg
                viewBox={(() => { try { return typeDef.svgMarkup ? parseSvgMarkup(typeDef.svgMarkup).viewBox : '0 0 100 100'; } catch { return '0 0 100 100'; } })()}
                className="w-3.5 h-3.5 shrink-0 border border-slate-300 rounded-sm"
                style={{ color: typeDef.strokeColor }}
                dangerouslySetInnerHTML={{ __html: (() => { try { return typeDef.svgMarkup ? parseSvgMarkup(typeDef.svgMarkup).innerHtml : ''; } catch { return ''; } })() }}
              />
            ) : (
              <span
                className="w-3.5 h-3.5 rounded-sm shrink-0 border"
                style={{ background: typeDef.color, borderColor: typeDef.strokeColor }}
              />
            )}
            <span className="text-xs font-medium text-slate-700 truncate">{typeDef.label}</span>
            {typeDef.shape === 'svg' && (
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-medium ml-auto">SVG</span>
            )}
          </div>
        )}

        {/* Label */}
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
            Etiqueta
          </span>
          <input
            type="text"
            value={el.label ?? ''}
            placeholder={typeDef?.label ?? ''}
            onChange={e => handleLabelChange(el.id, e)}
            className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          />
        </label>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <NumField label="X" value={el.x} onChange={v => setGeom({ x: v })} />
          <NumField label="Y" value={el.y} onChange={v => setGeom({ y: v })} />
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Ancho" value={el.width}  onChange={v => setGeom({ w: Math.max(1, v) })} />
          <NumField label="Alto"  value={el.height} onChange={v => setGeom({ h: Math.max(1, v) })} />
        </div>

        {/* Rotation */}
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Rotación °" value={el.rotation} onChange={v => setGeom({ r: v })} step={15} />
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
              &nbsp;
            </span>
            <button
              onClick={() => setGeom({ r: 0 })}
              className="border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Resetear
            </button>
          </label>
        </div>

        {/* Metadata (read-only key/value list) */}
        {el.metadata && Object.keys(el.metadata).length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
              Metadata
            </span>
            {Object.entries(el.metadata).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs text-slate-500">
                <span className="truncate">{k}</span>
                <span className="ml-2 text-slate-400 truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
        <button
          onClick={() => onDuplicate([el.id])}
          className="w-full text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Duplicar (Ctrl+D)
        </button>
        <button
          onClick={() => onDelete([el.id])}
          className="w-full text-xs px-3 py-1.5 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
