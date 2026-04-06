import type { ReactNode } from 'react';
import {
  IconCursor, IconGrid, IconHand, IconReset, IconZoomIn, IconZoomOut,
  IconUndo, IconRedo, IconPlace, IconErase, IconWall,
  IconDownload, IconUpload, IconLayers,
} from '../../icons';
import type { ToolMode, ElementTypeDef, AreaShape } from '../types';

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
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center justify-center w-8 h-8 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
        active
          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-400'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-6 bg-slate-200 mx-1" />;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PaletteGroup {
  id: string;
  name: string;
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
}

// ─── TypeChip ─────────────────────────────────────────────────────────────────

interface TypeChipProps {
  typeDef: ElementTypeDef;
  active: boolean;
  onClick: () => void;
}

function TypeChip({ typeDef, active, onClick }: TypeChipProps) {
  return (
    <button
      title={typeDef.label}
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 px-2 py-1 rounded border text-xs whitespace-nowrap transition-colors',
        active
          ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
      ].join(' ')}
    >
      <span
        className="w-2.5 h-2.5 rounded-sm shrink-0"
        style={{ background: typeDef.color, border: `1px solid ${typeDef.strokeColor}` }}
      />
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
}: ToolbarProps) {
  return (
    <div className="flex flex-col bg-white border-b border-slate-200 shadow-sm shrink-0">
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
        <span className="text-xs text-slate-500 w-10 text-center tabular-nums select-none">
          {Math.round(zoom * 100)}%
        </span>
        <ToolButton title="Alejar (-)" onClick={onZoomOut}>
          <IconZoomOut className="w-4 h-4" />
        </ToolButton>
        <ToolButton title="Restablecer vista" onClick={onResetView}>
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

      {/* ── Element palette (only when PLACE is active) ── */}
      {tool === 'PLACE' && (
        <div className="flex items-stretch gap-0 border-t border-slate-100 bg-slate-50 overflow-x-auto">
          {paletteGroups.map((group, gi) => (
            <div key={group.id} className="flex items-center shrink-0">
              {/* Group divider (not before the first group) */}
              {gi > 0 && (
                <div className="w-px self-stretch bg-slate-200 mx-1" />
              )}
              {/* Group label */}
              <span className="text-[10px] text-slate-400 font-medium px-1.5 whitespace-nowrap select-none">
                {group.name}
              </span>
              {/* Chips */}
              <div className="flex items-center gap-1 px-1 py-1.5">
                {group.types.map(typeDef => (
                  <TypeChip
                    key={typeDef.id}
                    typeDef={typeDef}
                    active={activePlaceTypeId === typeDef.id}
                    onClick={() => onActivePlaceTypeChange(typeDef.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
