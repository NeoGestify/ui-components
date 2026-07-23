import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  IconCursor, IconGrid, IconHand, IconReset, IconZoomIn, IconZoomOut,
  IconUndo, IconRedo, IconPlace, IconErase, IconWall,
  IconDownload, IconUpload, IconLayers,
} from '../../icons';
import type { ToolMode, ElementTypeDef, AreaShape } from '../types';
import { parseSvgMarkup } from '../utils/svgParser';

// ─── ToolButton ───────────────────────────────────────────────────────────────

interface ToolButtonProps {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}

function ToolButton({ active, disabled, title, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center justify-center w-8 h-8 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
        active
          ? 'bg-blue-100 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 ring-1 ring-blue-400 dark:ring-blue-500'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PaletteGroup {
  id: string;
  name: string;
  /** True for the built-in domain config group; false for imported library groups. */
  isBase?: boolean;
  types: ElementTypeDef[];
}

interface ToolbarProps {
  tool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  /** All element groups: base config group + any imported library groups. */
  paletteGroups: PaletteGroup[];
  activePlaceTypeId: string | null;
  onActivePlaceTypeChange: (id: string) => void;
  areaShape?: AreaShape;
  onToggleAreaShape?: () => void;
  onExportMap?: () => void;
  onImportMap?: () => void;
  onLoadLibrary?: () => void;
  onRemoveLibraryGroup?: (groupId: string) => void;
}

// ─── TypeChip ─────────────────────────────────────────────────────────────────

interface TypeChipProps {
  typeDef: ElementTypeDef;
  active: boolean;
  onClick: () => void;
}

function TypeChip({ typeDef, active, onClick }: TypeChipProps) {
  const preview = useMemo(
    () => (typeDef.shape === 'svg' && typeDef.svgMarkup ? parseSvgMarkup(typeDef.svgMarkup) : null),
    [typeDef.shape, typeDef.svgMarkup],
  );

  return (
    <button
      type="button"
      title={typeDef.label}
      aria-pressed={active}
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 px-2 py-1 rounded border text-xs whitespace-nowrap transition-colors',
        active
          ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-medium'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700',
      ].join(' ')}
    >
      {preview ? (
        <svg
          viewBox={preview.viewBox}
          className="w-2.5 h-2.5 shrink-0"
          style={{ color: typeDef.strokeColor }}
          dangerouslySetInnerHTML={{ __html: preview.innerHtml }}
        />
      ) : (
        <span
          className="w-2.5 h-2.5 rounded-sm shrink-0"
          style={{ background: typeDef.color, border: `1px solid ${typeDef.strokeColor}` }}
        />
      )}
      {typeDef.label}
    </button>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

export function Toolbar({
  tool,
  onToolChange,
  showGrid,
  onToggleGrid,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  paletteGroups,
  activePlaceTypeId,
  onActivePlaceTypeChange,
  areaShape,
  onToggleAreaShape,
  onExportMap,
  onImportMap,
  onLoadLibrary,
  onRemoveLibraryGroup,
}: ToolbarProps) {
  // Active palette tab — track by group ID
  const [activeGroupId, setActiveGroupId] = useState<string | null>(
    () => paletteGroups[0]?.id ?? null,
  );

  // When groups change (library imported / removed), make sure active tab is still valid
  useEffect(() => {
    if (paletteGroups.length === 0) { setActiveGroupId(null); return; }
    if (!paletteGroups.find(g => g.id === activeGroupId)) {
      setActiveGroupId(paletteGroups[0].id);
    }
  }, [paletteGroups, activeGroupId]);

  const activeGroup = paletteGroups.find(g => g.id === activeGroupId) ?? null;

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
      {/* ── Main row ── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5">
        {/* Selection tools */}
        <ToolButton title="Seleccionar (V)" active={tool === 'SELECT'} onClick={() => onToolChange('SELECT')}>
          <IconCursor className="w-4 h-4" />
        </ToolButton>
        <ToolButton title="Desplazar (H)" active={tool === 'PAN'} onClick={() => onToolChange('PAN')}>
          <IconHand className="w-4 h-4" />
        </ToolButton>
        <ToolButton title="Dibujar pared (W)" active={tool === 'WALL'} onClick={() => onToolChange('WALL')}>
          <IconWall className="w-4 h-4" />
        </ToolButton>
        <ToolButton title="Colocar elemento (P)" active={tool === 'PLACE'} onClick={() => onToolChange('PLACE')}>
          <IconPlace className="w-4 h-4" />
        </ToolButton>
        <ToolButton title="Borrar (E)" active={tool === 'ERASE'} onClick={() => onToolChange('ERASE')}>
          <IconErase className="w-4 h-4" />
        </ToolButton>

        <Sep />

        {/* History */}
        <ToolButton title="Deshacer (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}>
          <IconUndo className="w-4 h-4" />
        </ToolButton>
        <ToolButton title="Rehacer (Ctrl+Y)" disabled={!canRedo} onClick={onRedo}>
          <IconRedo className="w-4 h-4" />
        </ToolButton>

        <Sep />

        {/* View */}
        <ToolButton
          title={showGrid ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
          active={showGrid}
          onClick={onToggleGrid}
        >
          <IconGrid className="w-4 h-4" />
        </ToolButton>

        <Sep />

        {/* Zoom */}
        <ToolButton title="Acercar (+)" onClick={onZoomIn}>
          <IconZoomIn className="w-4 h-4" />
        </ToolButton>
        <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-center tabular-nums select-none">
          {Math.round(zoom * 100)}%
        </span>
        <ToolButton title="Alejar (-)" onClick={onZoomOut}>
          <IconZoomOut className="w-4 h-4" />
        </ToolButton>
        <ToolButton title="Ajustar vista al plano (Ctrl+0)" onClick={onResetView}>
          <IconReset className="w-4 h-4" />
        </ToolButton>

        <Sep />

        {/* Map export / import */}
        <ToolButton title="Exportar mapa JSON" onClick={() => onExportMap?.()}>
          <IconDownload className="w-4 h-4" />
        </ToolButton>
        <ToolButton title="Importar mapa JSON" onClick={() => onImportMap?.()}>
          <IconUpload className="w-4 h-4" />
        </ToolButton>

        {/* Element library import */}
        <ToolButton title="Cargar librería de elementos (.json)" onClick={() => onLoadLibrary?.()}>
          <IconLayers className="w-4 h-4" />
        </ToolButton>

        {areaShape !== undefined && (
          <>
            <Sep />
            <ToolButton title={areaShape === 'polygon' ? 'Cambiar a rectángulo' : 'Cambiar a polígono'} onClick={() => onToggleAreaShape?.()}>
              <span className="text-xs font-medium">{areaShape === 'polygon' ? 'Poly' : 'Rect'}</span>
            </ToolButton>
          </>
        )}
      </div>

      {/* ── Element palette (only when PLACE is active and there are groups) ── */}
      {tool === 'PLACE' && paletteGroups.length > 0 && (
        <div className="flex flex-col border-t border-slate-100 dark:border-slate-800">
          {/* Tab bar — one tab per group */}
          <div className="flex items-end gap-0 overflow-x-auto bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-2 pt-1">
            {paletteGroups.map(group => (
              <div
                key={group.id}
                className={[
                  'flex items-center shrink-0 rounded-t border-x border-t transition-colors',
                  group.id === activeGroupId
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 -mb-px'
                    : 'bg-slate-50 dark:bg-slate-800 border-transparent',
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() => setActiveGroupId(group.id)}
                  className={[
                    'px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap',
                    group.id === activeGroupId
                      ? 'text-slate-800 dark:text-slate-100'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
                  ].join(' ')}
                >
                  {group.name || 'Sin nombre'}
                </button>
                {!group.isBase && onRemoveLibraryGroup && (
                  <button
                    type="button"
                    title={`Eliminar "${group.name}"`}
                    aria-label={`Eliminar librería ${group.name}`}
                    onClick={() => onRemoveLibraryGroup(group.id)}
                    className="pr-2 pl-0.5 py-1 text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Active group chips */}
          {activeGroup && (
            <div className="flex items-center gap-1 flex-wrap px-2 py-1.5 bg-white dark:bg-slate-900 min-h-[36px]">
              {activeGroup.types.map(typeDef => (
                <TypeChip
                  key={typeDef.id}
                  typeDef={typeDef}
                  active={activePlaceTypeId === typeDef.id}
                  onClick={() => onActivePlaceTypeChange(typeDef.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
