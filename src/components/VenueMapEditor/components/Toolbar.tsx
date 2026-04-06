import { IconCursor, IconGrid, IconHand, IconReset, IconZoomIn, IconZoomOut } from '../../icons';
import type { ToolMode } from '../types';

// ─── Toolbar button ───────────────────────────────────────────────────────────

interface ToolButtonProps {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolButton({ active, title, onClick, children }: ToolButtonProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={[
        'flex items-center justify-center w-8 h-8 rounded transition-colors',
        active
          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-400'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────

function Sep() {
  return <div className="w-px h-6 bg-slate-200 mx-1" />;
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

interface ToolbarProps {
  tool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function Toolbar({
  tool,
  onToolChange,
  showGrid,
  onToggleGrid,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white border-b border-slate-200 shadow-sm">
      {/* ── Tool modes ── */}
      <ToolButton
        title="Seleccionar (V)"
        active={tool === 'SELECT'}
        onClick={() => onToolChange('SELECT')}
      >
        <IconCursor className='w-4 h-4' />
      </ToolButton>

      <ToolButton
        title="Desplazar (H)"
        active={tool === 'PAN'}
        onClick={() => onToolChange('PAN')}
      >
        <IconHand className='w-4 h-4' />
      </ToolButton>

      <Sep />

      {/* ── View options ── */}
      <ToolButton
        title={showGrid ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
        active={showGrid}
        onClick={onToggleGrid}
      >
        <IconGrid className='w-4 h-4' />
      </ToolButton>

      <Sep />

      {/* ── Zoom controls ── */}
      <ToolButton title="Acercar (+)" onClick={onZoomIn}>
        <IconZoomIn className='w-4 h-4' />
      </ToolButton>

      <span className="text-xs text-slate-500 w-10 text-center tabular-nums select-none">
        {Math.round(zoom * 100)}%
      </span>

      <ToolButton title="Alejar (-)" onClick={onZoomOut}>
        <IconZoomOut className='w-4 h-4' />
      </ToolButton>

      <ToolButton title="Restablecer vista" onClick={onResetView}>
        <IconReset className='w-4 h-4' />
      </ToolButton>
    </div>
  );
}
