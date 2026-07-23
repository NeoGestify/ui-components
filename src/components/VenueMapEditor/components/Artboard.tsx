import { useRef, useCallback } from 'react';
import type { RefObject, PointerEvent as ReactPointerEvent, SyntheticEvent } from 'react';
import type { FloorArea } from '../types';
import type { PanZoomState } from '../hooks/usePanZoom';
import type { VenuePalette } from '../theme';
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
/** Ancho (px de pantalla) de la banda del borde que sirve para mover la planta. */
const EDGE_GRAB_PX = 12;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArtboardProps {
  area: FloorArea;
  onResize: (area: FloorArea) => void;
  onMove?: (dx: number, dy: number) => void;
  onMoveCommit?: () => void;
  onResizeCommit?: (area: FloorArea) => void;
  svgRef: RefObject<SVGSVGElement | null>;
  panZoomRef: PanZoomRef;
  zoom: number;
  palette: VenuePalette;
  /** Prefijo único por instancia para los ids de `<filter>`. */
  uid: string;
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

// ─── Shadow filter ────────────────────────────────────────────────────────────

function ShadowDef({ id, zoom, opacity }: { id: string; zoom: number; opacity: number }) {
  return (
    <defs>
      <filter id={id} x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow dx={0} dy={3 / zoom} stdDeviation={6 / zoom} floodOpacity={opacity} />
      </filter>
    </defs>
  );
}

// ─── PolygonArtboard ──────────────────────────────────────────────────────────

function PolygonArtboard({
  area,
  onResize,
  onMove,
  onMoveCommit,
  onResizeCommit,
  svgRef,
  panZoomRef,
  zoom,
  palette,
  uid,
  readOnly = false,
}: ArtboardProps) {
  const pts = area.points ?? [];
  const areaRef = useRef(area);
  areaRef.current = area;

  const activeVertex = useRef<number | null>(null);
  const vertexStart = useRef({ vx: 0, vy: 0, mx: 0, my: 0 });

  const { handlePointerDown: handleVertexDown } = useDrag(svgRef, panZoomRef, {
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
    onDragEnd: (_x, _y, moved) => {
      // Sin movimiento no hay nada que registrar en el historial: un clic
      // simple no debe generar una entrada de deshacer.
      if (moved) onResizeCommit?.(areaRef.current);
      activeVertex.current = null;
    },
  });

  const startVertexDrag = useCallback(
    (e: ReactPointerEvent, idx: number) => {
      activeVertex.current = idx;
      handleVertexDown(e);
    },
    [handleVertexDown],
  );

  const { handlePointerDown: handleBodyDown } = useDrag(svgRef, panZoomRef, {
    onDragMove: (dx, dy) => {
      onMove?.(dx, dy);
    },
    onDragEnd: (_x, _y, moved) => {
      if (moved) onMoveCommit?.();
    },
  });

  const handleDeleteVertex = useCallback(
    (e: SyntheticEvent, idx: number) => {
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
    (e: SyntheticEvent, insertAfterIdx: number) => {
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
  const shadowId = `${uid}-artboard-shadow`;

  return (
    <g>
      <ShadowDef id={shadowId} zoom={zoom} opacity={palette.artboardShadowOpacity} />

      {/* Superficie de la planta */}
      <polygon
        points={pointsStr}
        fill={palette.artboardFill}
        stroke="none"
        filter={`url(#${shadowId})`}
        style={{ pointerEvents: 'none' }}
      />

      {/* Borde visible */}
      <polygon
        points={pointsStr}
        fill="none"
        stroke={palette.artboardStroke}
        strokeWidth={sw}
        strokeDasharray={dash}
        style={{ pointerEvents: 'none' }}
      />

      {/* Banda de agarre: SOLO el borde mueve la planta, así el interior
          queda libre para el lazo de selección. */}
      {!readOnly && (
        <polygon
          points={pointsStr}
          fill="none"
          stroke="transparent"
          strokeWidth={EDGE_GRAB_PX / zoom}
          style={{ cursor: 'move', pointerEvents: 'stroke' }}
          onPointerDown={handleBodyDown}
        />
      )}

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
                fill={palette.handleFill}
                stroke={palette.artboardStroke}
                strokeWidth={sw}
                style={{ cursor: 'copy', transform: `rotate(45deg)`, transformOrigin: `${mx}px ${my}px` }}
                onPointerDown={e => handleAddVertex(e, i)}
              >
                <title>Añadir vértice</title>
              </rect>
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
              fill={palette.handleFill}
              stroke={palette.accent}
              strokeWidth={sw}
              style={{ cursor: 'move' }}
              onPointerDown={e => startVertexDrag(e, i)}
              onDoubleClick={e => handleDeleteVertex(e, i)}
            >
              <title>Arrastrar para mover · doble clic para eliminar</title>
            </rect>
          ))}
        </>
      )}
    </g>
  );
}

// ─── RectArtboard ─────────────────────────────────────────────────────────────
// Extracted so all hooks are at the top level of a single component (Rules of Hooks).

function RectArtboard({
  area,
  onResize,
  onMove,
  onMoveCommit,
  onResizeCommit,
  svgRef,
  panZoomRef,
  zoom,
  palette,
  uid,
  readOnly = false,
}: ArtboardProps) {
  const activeHandle = useRef<HandleType | null>(null);
  const areaRef = useRef(area);
  areaRef.current = area;

  const { handlePointerDown: handleHandleDown } = useDrag(svgRef, panZoomRef, {
    onDragMove: (dx, dy) => {
      if (!activeHandle.current) return;
      onResize(applyHandleDelta(areaRef.current, activeHandle.current, dx, dy));
    },
    onDragEnd: (_x, _y, moved) => {
      if (moved) onResizeCommit?.(areaRef.current);
      activeHandle.current = null;
    },
  });

  const startHandleDrag = useCallback(
    (e: ReactPointerEvent, type: HandleType) => {
      activeHandle.current = type;
      handleHandleDown(e);
    },
    [handleHandleDown],
  );

  const { handlePointerDown: handleBodyDown } = useDrag(svgRef, panZoomRef, {
    onDragMove: (dx, dy) => {
      onMove?.(dx, dy);
    },
    onDragEnd: (_x, _y, moved) => {
      if (moved) onMoveCommit?.();
    },
  });

  const ax = area.x ?? 0;
  const ay = area.y ?? 0;
  const aw = area.width ?? 400;
  const ah = area.height ?? 300;

  const hs = HANDLE_PX / zoom;
  const sw = 1.5 / zoom;
  const dash = `${6 / zoom},${3 / zoom}`;
  const shadowId = `${uid}-artboard-shadow`;

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
      <ShadowDef id={shadowId} zoom={zoom} opacity={palette.artboardShadowOpacity} />

      {/* Superficie de la planta */}
      <rect
        x={ax}
        y={ay}
        width={aw}
        height={ah}
        fill={palette.artboardFill}
        stroke="none"
        filter={`url(#${shadowId})`}
        style={{ pointerEvents: 'none' }}
      />

      {/* Borde visible */}
      <rect
        x={ax}
        y={ay}
        width={aw}
        height={ah}
        fill="none"
        stroke={palette.artboardStroke}
        strokeWidth={sw}
        strokeDasharray={dash}
        style={{ pointerEvents: 'none' }}
      />

      {/* Banda de agarre en el borde — el interior queda libre para el lazo. */}
      {!readOnly && (
        <rect
          x={ax}
          y={ay}
          width={aw}
          height={ah}
          fill="none"
          stroke="transparent"
          strokeWidth={EDGE_GRAB_PX / zoom}
          style={{ cursor: 'move', pointerEvents: 'stroke' }}
          onPointerDown={handleBodyDown}
        />
      )}

      {!readOnly &&
        handles.map(({ type, cx, cy }) => (
          <rect
            key={type}
            x={cx - hs}
            y={cy - hs}
            width={hs * 2}
            height={hs * 2}
            rx={1 / zoom}
            fill={palette.handleFill}
            stroke={palette.accent}
            strokeWidth={sw}
            style={{ cursor: HANDLE_CURSORS[type] }}
            onPointerDown={e => startHandleDrag(e, type)}
          />
        ))}
    </g>
  );
}

// ─── Artboard (router) ────────────────────────────────────────────────────────

export function Artboard(props: ArtboardProps) {
  if (props.area.shape === 'polygon') {
    return <PolygonArtboard {...props} />;
  }
  return <RectArtboard {...props} />;
}
