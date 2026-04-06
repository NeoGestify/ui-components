import type { ToolMode } from '../types';

// ─── Icon helpers (plain SVG) ─────────────────────────────────────────────────

function IconCursor() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
      <path d="M2 1l12 5.5-5.5 1.5L7 13.5 2 1z" />
    </svg>
  );
}

function IconHand() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
      <path d="M8 1a1 1 0 011 1v4.586l1.293-1.293a1 1 0 111.414 1.414L8 10.414 4.293 6.707a1 1 0 111.414-1.414L7 6.586V2a1 1 0 011-1z" />
      <path d="M3 8a1 1 0 011-1h.5V4.5a1 1 0 012 0V7h1V3.5a1 1 0 012 0V7h1V4.5a1 1 0 012 0V9a5 5 0 01-5 5H6A3 3 0 013 11V8z" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z"
        clipRule="evenodd"
        opacity={0.7}
      />
    </svg>
  );
}

function IconZoomIn() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
      <path d="M6.5 1a5.5 5.5 0 104.39 8.803l3.154 3.153a.75.75 0 001.06-1.06l-3.153-3.154A5.5 5.5 0 006.5 1zM2.5 6.5a4 4 0 118 0 4 4 0 01-8 0zM6 4.75a.75.75 0 011.5 0V6h1.25a.75.75 0 010 1.5H7.5v1.25a.75.75 0 01-1.5 0V7.5H4.75a.75.75 0 010-1.5H6V4.75z" />
    </svg>
  );
}

function IconZoomOut() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
      <path d="M6.5 1a5.5 5.5 0 104.39 8.803l3.154 3.153a.75.75 0 001.06-1.06l-3.153-3.154A5.5 5.5 0 006.5 1zM2.5 6.5a4 4 0 118 0 4 4 0 01-8 0zM4.75 6a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" />
    </svg>
  );
}

function IconReset() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM8 4a.75.75 0 01.75.75v3.19l1.28 1.28a.75.75 0 01-1.06 1.06l-1.5-1.5A.75.75 0 017.25 8V4.75A.75.75 0 018 4z" />
    </svg>
  );
}

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
        <IconCursor />
      </ToolButton>

      <ToolButton
        title="Desplazar (H)"
        active={tool === 'PAN'}
        onClick={() => onToolChange('PAN')}
      >
        <IconHand />
      </ToolButton>

      <Sep />

      {/* ── View options ── */}
      <ToolButton
        title={showGrid ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
        active={showGrid}
        onClick={onToggleGrid}
      >
        <IconGrid />
      </ToolButton>

      <Sep />

      {/* ── Zoom controls ── */}
      <ToolButton title="Acercar (+)" onClick={onZoomIn}>
        <IconZoomIn />
      </ToolButton>

      <span className="text-xs text-slate-500 w-10 text-center tabular-nums select-none">
        {Math.round(zoom * 100)}%
      </span>

      <ToolButton title="Alejar (-)" onClick={onZoomOut}>
        <IconZoomOut />
      </ToolButton>

      <ToolButton title="Restablecer vista" onClick={onResetView}>
        <IconReset />
      </ToolButton>
    </div>
  );
}
