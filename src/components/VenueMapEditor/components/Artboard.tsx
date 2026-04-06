import { useRef, useCallback } from 'react';
import type { RefObject, MouseEvent as ReactMouseEvent } from 'react';
import type { FloorArea } from '../types';
import type { PanZoomState } from '../hooks/usePanZoom';
import { useDrag } from '../hooks/useDrag';

type PanZoomRef = { current: PanZoomState };

// ─── Types ────────────────────────────────────────────────────────────────────

type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLE_CURSORS: Record<HandleType, string> = {
  nw: 'nwse-resize',
  ne: 'nesw-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
};

const MIN_SIZE = 50;
/** Handle size in screen pixels — divided by zoom for canvas units. */
const HANDLE_PX = 8;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArtboardProps {
  area: FloorArea;
  onResize: (area: FloorArea) => void;
  svgRef: RefObject<SVGSVGElement | null>;
  panZoomRef: PanZoomRef;
  zoom: number;
  readOnly?: boolean;
}

// ─── Geometry helper ──────────────────────────────────────────────────────────

function applyHandleDelta(
  area: FloorArea,
  handle: HandleType,
  dx: number,
  dy: number,
): FloorArea {
  const ax = area.x ?? 0;
  const ay = area.y ?? 0;
  const aw = area.width ?? 400;
  const ah = area.height ?? 300;

  // right / bottom edges that stay fixed for the opposite handles
  const right = ax + aw;
  const bottom = ay + ah;

  let nx = ax, ny = ay, nw = aw, nh = ah;

  switch (handle) {
    case 'nw':
      nw = Math.max(MIN_SIZE, aw - dx);
      nh = Math.max(MIN_SIZE, ah - dy);
      nx = right - nw;
      ny = bottom - nh;
      break;
    case 'n':
      nh = Math.max(MIN_SIZE, ah - dy);
      ny = bottom - nh;
      break;
    case 'ne':
      nw = Math.max(MIN_SIZE, aw + dx);
      nh = Math.max(MIN_SIZE, ah - dy);
      ny = bottom - nh;
      break;
    case 'e':
      nw = Math.max(MIN_SIZE, aw + dx);
      break;
    case 'se':
      nw = Math.max(MIN_SIZE, aw + dx);
      nh = Math.max(MIN_SIZE, ah + dy);
      break;
    case 's':
      nh = Math.max(MIN_SIZE, ah + dy);
      break;
    case 'sw':
      nw = Math.max(MIN_SIZE, aw - dx);
      nh = Math.max(MIN_SIZE, ah + dy);
      nx = right - nw;
      break;
    case 'w':
      nw = Math.max(MIN_SIZE, aw - dx);
      nx = right - nw;
      break;
  }

  return { ...area, x: nx, y: ny, width: nw, height: nh };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Artboard({
  area,
  onResize,
  svgRef,
  panZoomRef,
  zoom,
  readOnly = false,
}: ArtboardProps) {
  const ax = area.x ?? 0;
  const ay = area.y ?? 0;
  const aw = area.width ?? 400;
  const ah = area.height ?? 300;

  /** Which handle the current drag belongs to. */
  const activeHandle = useRef<HandleType | null>(null);
  /** Stable ref so window listeners always see the latest area. */
  const areaRef = useRef(area);
  areaRef.current = area;

  // ── Handle drag ─────────────────────────────────────────────────────────────
  const { handleMouseDown: handleHandleDown } = useDrag(svgRef, panZoomRef, {
    onDragMove: (dx, dy) => {
      if (!activeHandle.current) return;
      onResize(applyHandleDelta(areaRef.current, activeHandle.current, dx, dy));
    },
    onDragEnd: () => {
      activeHandle.current = null;
    },
  });

  const startHandleDrag = useCallback(
    (e: ReactMouseEvent, type: HandleType) => {
      activeHandle.current = type;
      handleHandleDown(e);
    },
    [handleHandleDown],
  );

  // ── Body drag (move the whole artboard) ─────────────────────────────────────
  const { handleMouseDown: handleBodyDown } = useDrag(svgRef, panZoomRef, {
    onDragMove: (dx, dy) => {
      const a = areaRef.current;
      onResize({ ...a, x: (a.x ?? 0) + dx, y: (a.y ?? 0) + dy });
    },
  });

  // ── Derived sizing ──────────────────────────────────────────────────────────
  const hs = HANDLE_PX / zoom;   // handle half-size in canvas units
  const sw = 1.5 / zoom;         // stroke width in canvas units
  const dash = `${6 / zoom},${3 / zoom}`;

  // ── Handle positions ────────────────────────────────────────────────────────
  const handles: Array<{ type: HandleType; cx: number; cy: number }> = [
    { type: 'nw', cx: ax,        cy: ay },
    { type: 'n',  cx: ax + aw/2, cy: ay },
    { type: 'ne', cx: ax + aw,   cy: ay },
    { type: 'e',  cx: ax + aw,   cy: ay + ah/2 },
    { type: 'se', cx: ax + aw,   cy: ay + ah },
    { type: 's',  cx: ax + aw/2, cy: ay + ah },
    { type: 'sw', cx: ax,        cy: ay + ah },
    { type: 'w',  cx: ax,        cy: ay + ah/2 },
  ];

  return (
    <g>
      {/* Drop shadow filter (size-independent) */}
      <defs>
        <filter id="vme-artboard-shadow" x="-4%" y="-4%" width="108%" height="108%">
          <feDropShadow
            dx={0}
            dy={3 / zoom}
            stdDeviation={6 / zoom}
            floodOpacity={0.12}
          />
        </filter>
      </defs>

      {/* Artboard background */}
      <rect
        x={ax}
        y={ay}
        width={aw}
        height={ah}
        fill="#fafaf9"
        stroke="none"
        filter="url(#vme-artboard-shadow)"
      />

      {/* Artboard border (dashed) */}
      <rect
        x={ax}
        y={ay}
        width={aw}
        height={ah}
        fill="transparent"
        stroke="#94a3b8"
        strokeWidth={sw}
        strokeDasharray={dash}
        style={{ cursor: readOnly ? 'default' : 'move' }}
        onMouseDown={readOnly ? undefined : handleBodyDown}
      />

      {/* Resize handles — only in edit mode */}
      {!readOnly &&
        handles.map(({ type, cx, cy }) => (
          <rect
            key={type}
            x={cx - hs}
            y={cy - hs}
            width={hs * 2}
            height={hs * 2}
            rx={1 / zoom}
            fill="white"
            stroke="#3b82f6"
            strokeWidth={sw}
            style={{ cursor: HANDLE_CURSORS[type] }}
            onMouseDown={e => startHandleDrag(e, type)}
          />
        ))}
    </g>
  );
}
