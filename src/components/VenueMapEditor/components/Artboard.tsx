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
const HANDLE_PX = 8;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArtboardProps {
  area: FloorArea;
  onResize: (area: FloorArea) => void;
  onMove?: (dx: number, dy: number) => void;
  onResizeCommit?: (area: FloorArea) => void;
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

// ─── PolygonArtboard ──────────────────────────────────────────────────────────

interface PolygonArtboardProps {
  area: FloorArea;
  onResize: (area: FloorArea) => void;
  onMove?: (dx: number, dy: number) => void;
  onResizeCommit?: (area: FloorArea) => void;
  svgRef: RefObject<SVGSVGElement | null>;
  panZoomRef: PanZoomRef;
  zoom: number;
  readOnly?: boolean;
}

function PolygonArtboard({
  area,
  onResize,
  onMove,
  onResizeCommit,
  svgRef,
  panZoomRef,
  zoom,
  readOnly = false,
}: PolygonArtboardProps) {
  const pts = area.points ?? [];
  const areaRef = useRef(area);
  areaRef.current = area;

  const activeVertex = useRef<number | null>(null);
  const vertexStart = useRef({ vx: 0, vy: 0, mx: 0, my: 0 });

  const { handleMouseDown: handleVertexDown } = useDrag(svgRef, panZoomRef, {
    onDragStart: (mx, my) => {
      const idx = activeVertex.current;
      if (idx === null) return;
      const currentPts = areaRef.current.points ?? [];
      vertexStart.current = { vx: currentPts[idx][0], vy: currentPts[idx][1], mx, my };
    },
    onDragMove: (_dx, _dy, canvasX, canvasY) => {
      const idx = activeVertex.current;
      if (idx === null) return;
      const { vx, vy, mx, my } = vertexStart.current;
      const newX = vx + (canvasX - mx);
      const newY = vy + (canvasY - my);
      const currentPts = areaRef.current.points ?? [];
      const newPts = currentPts.map((p, i): [number, number] =>
        i === idx ? [newX, newY] : p,
      );
      const newArea: FloorArea = { ...areaRef.current, points: newPts };
      onResize(newArea);
    },
    onDragEnd: () => {
      onResizeCommit?.(areaRef.current);
      activeVertex.current = null;
    },
  });

  const startVertexDrag = useCallback(
    (e: ReactMouseEvent, idx: number) => {
      activeVertex.current = idx;
      handleVertexDown(e);
    },
    [handleVertexDown],
  );

  const { handleMouseDown: handleBodyDown } = useDrag(svgRef, panZoomRef, {
    onDragMove: (dx, dy) => {
      onMove?.(dx, dy);
    },
  });

  const handleDeleteVertex = useCallback(
    (e: ReactMouseEvent, idx: number) => {
      e.stopPropagation();
      const currentPts = areaRef.current.points ?? [];
      if (currentPts.length <= 3) return;
      const newPts = currentPts.filter((_, i) => i !== idx);
      const newArea: FloorArea = { ...areaRef.current, points: newPts };
      onResize(newArea);
      onResizeCommit?.(newArea);
    },
    [onResize, onResizeCommit],
  );

  const handleAddVertex = useCallback(
    (e: ReactMouseEvent, insertAfterIdx: number) => {
      e.stopPropagation();
      const currentPts = areaRef.current.points ?? [];
      const a = currentPts[insertAfterIdx];
      const b = currentPts[(insertAfterIdx + 1) % currentPts.length];
      const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const newPts = [
        ...currentPts.slice(0, insertAfterIdx + 1),
        mid,
        ...currentPts.slice(insertAfterIdx + 1),
      ];
      const newArea: FloorArea = { ...areaRef.current, points: newPts };
      onResize(newArea);
      onResizeCommit?.(newArea);
    },
    [onResize, onResizeCommit],
  );

  if (pts.length < 3) return null;

  const pointsStr = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const hs = HANDLE_PX / zoom;
  const sw = 1.5 / zoom;
  const dash = `${6 / zoom},${3 / zoom}`;

  return (
    <g>
      <defs>
        <filter id="vme-artboard-shadow" x="-4%" y="-4%" width="108%" height="108%">
          <feDropShadow dx={0} dy={3 / zoom} stdDeviation={6 / zoom} floodOpacity={0.12} />
        </filter>
      </defs>

      {/* Shadow polygon */}
      <polygon
        points={pointsStr}
        fill="#fafaf9"
        stroke="none"
        filter="url(#vme-artboard-shadow)"
      />

      {/* Body drag target (dashed border) */}
      <polygon
        points={pointsStr}
        fill="transparent"
        stroke="#94a3b8"
        strokeWidth={sw}
        strokeDasharray={dash}
        style={{ cursor: readOnly ? 'default' : 'move' }}
        onMouseDown={readOnly ? undefined : handleBodyDown}
      />

      {!readOnly && (
        <>
          {/* Edge midpoint diamond handles — click to add vertex */}
          {pts.map(([ax, ay], i) => {
            const [bx, by] = pts[(i + 1) % pts.length];
            const mx = (ax + bx) / 2;
            const my = (ay + by) / 2;
            return (
              <rect
                key={`mid-${i}`}
                x={mx - hs * 0.75}
                y={my - hs * 0.75}
                width={hs * 1.5}
                height={hs * 1.5}
                fill="white"
                stroke="#94a3b8"
                strokeWidth={sw}
                style={{ cursor: 'copy', transform: `rotate(45deg)`, transformOrigin: `${mx}px ${my}px` }}
                onClick={e => handleAddVertex(e, i)}
              />
            );
          })}

          {/* Vertex square handles */}
          {pts.map(([vx, vy], i) => (
            <rect
              key={`v-${i}`}
              x={vx - hs}
              y={vy - hs}
              width={hs * 2}
              height={hs * 2}
              rx={1 / zoom}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={sw}
              style={{ cursor: 'move' }}
              onMouseDown={e => startVertexDrag(e, i)}
              onDoubleClick={e => handleDeleteVertex(e, i)}
            />
          ))}
        </>
      )}
    </g>
  );
}

// ─── Artboard ─────────────────────────────────────────────────────────────────

export function Artboard({
  area,
  onResize,
  onMove,
  onResizeCommit,
  svgRef,
  panZoomRef,
  zoom,
  readOnly = false,
}: ArtboardProps) {
  if (area.shape === 'polygon') {
    return (
      <PolygonArtboard
        area={area}
        onResize={onResize}
        onMove={onMove}
        onResizeCommit={onResizeCommit}
        svgRef={svgRef}
        panZoomRef={panZoomRef}
        zoom={zoom}
        readOnly={readOnly}
      />
    );
  }

  const ax = area.x ?? 0;
  const ay = area.y ?? 0;
  const aw = area.width ?? 400;
  const ah = area.height ?? 300;

  const activeHandle = useRef<HandleType | null>(null);
  const areaRef = useRef(area);
  areaRef.current = area;

  const { handleMouseDown: handleHandleDown } = useDrag(svgRef, panZoomRef, {
    onDragMove: (dx, dy) => {
      if (!activeHandle.current) return;
      onResize(applyHandleDelta(areaRef.current, activeHandle.current, dx, dy));
    },
    onDragEnd: () => {
      onResizeCommit?.(areaRef.current);
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

  const { handleMouseDown: handleBodyDown } = useDrag(svgRef, panZoomRef, {
    onDragMove: (dx, dy) => {
      onMove?.(dx, dy);
    },
  });

  const hs = HANDLE_PX / zoom;
  const sw = 1.5 / zoom;
  const dash = `${6 / zoom},${3 / zoom}`;

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

      <rect
        x={ax}
        y={ay}
        width={aw}
        height={ah}
        fill="#fafaf9"
        stroke="none"
        filter="url(#vme-artboard-shadow)"
      />

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
