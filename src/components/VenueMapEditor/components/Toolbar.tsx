import type { ReactNode } from 'react';
import {
  IconCursor, IconGrid, IconHand, IconReset, IconZoomIn, IconZoomOut,
  IconUndo, IconRedo, IconPlace, IconErase, TrashIcon,
} from '../../icons';
import type { ToolMode, DomainConfig, ElementTypeDef } from '../types';

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
  domainConfig: DomainConfig;
  activePlaceTypeId: string | null;
  onActivePlaceTypeChange: (id: string) => void;
}

// ─── Element type chip ────────────────────────────────────────────────────────

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
  domainConfig,
  activePlaceTypeId,
  onActivePlaceTypeChange,
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
      </div>

      {/* ── Element palette (only when PLACE is active) ── */}
      {tool === 'PLACE' && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-slate-100 bg-slate-50 overflow-x-auto">
          <TrashIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          {domainConfig.elementTypes.map(typeDef => (
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
  );
}
