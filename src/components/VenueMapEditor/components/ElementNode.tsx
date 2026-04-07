import { useRef, useCallback } from 'react';
import type { RefObject, MouseEvent as ReactMouseEvent } from 'react';
import type { MapElement, ElementTypeDef, ToolMode } from '../types';
import type { PanZoomState } from '../hooks/usePanZoom';
import { useDrag } from '../hooks/useDrag';
import { snapToGrid } from '../utils/snapUtils';

// ─── Arrow shape ──────────────────────────────────────────────────────────────

function arrowPath(x: number, y: number, w: number, h: number): string {
  const headW = Math.min(w * 0.4, h * 0.9);
  const tailH = h * 0.45;
  const yt = y + (h - tailH) / 2;
  const yb = y + (h + tailH) / 2;
  return [
    `M ${x} ${yt}`,
    `L ${x + w - headW} ${yt}`,
    `L ${x + w - headW} ${y}`,
    `L ${x + w} ${y + h / 2}`,
    `L ${x + w - headW} ${y + h}`,
    `L ${x + w - headW} ${yb}`,
    `L ${x} ${yb}`,
    'Z',
  ].join(' ');
}

// ─── Resize-handle geometry ───────────────────────────────────────────────────

type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLE_CURSORS: Record<HandleType, string> = {
  nw: 'nwse-resize', ne: 'nesw-resize',
  se: 'nwse-resize', sw: 'nesw-resize',
  n: 'ns-resize',   s: 'ns-resize',
  e: 'ew-resize',   w: 'ew-resize',
};

const MIN_SIZE = 10;

/** Rotate a vector (dx, dy) by -θ (degrees) to map canvas delta → local delta. */
function rotateDelta(dx: number, dy: number, deg: number): [number, number] {
  const r = -deg * (Math.PI / 180);
  return [dx * Math.cos(r) - dy * Math.sin(r), dx * Math.sin(r) + dy * Math.cos(r)];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ElementNodeProps {
  element: MapElement;
  typeDef: ElementTypeDef;
  isSelected: boolean;
  tool: ToolMode;
  zoom: number;
  svgRef: RefObject<SVGSVGElement | null>;
  panZoomRef: { current: PanZoomState };
  snapEnabled: boolean;
  gridSize: number;
  statusFill?: string;
  onSelect: (multi: boolean) => void;
  onMove: (x: number, y: number) => void;
  onMoveCommit: (x: number, y: number) => void;
  onResize: (x: number, y: number, w: number, h: number) => void;
  onResizeCommit: (x: number, y: number, w: number, h: number) => void;
  onRotate: (rotation: number) => void;
  onRotateCommit: (rotation: number) => void;
  onDelete: () => void;
  onViewerClick?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ElementNode({
  element,
  typeDef,
  isSelected,
  tool,
  zoom,
  svgRef,
  panZoomRef,
  snapEnabled,
  gridSize,
  statusFill,
  onSelect,
  onMove,
  onMoveCommit,
  onResize,
  onResizeCommit,
  onRotate,
  onRotateCommit,
  onDelete,
  onViewerClick,
}: ElementNodeProps) {
  const { x, y, width: w, height: h, rotation } = element;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const sw = 1.5 / zoom;
  const hs = 7 / zoom;            // handle half-size
  const rotOffset = 22 / zoom;    // rotate handle distance above bbox
  const fontSize = Math.max(9 / zoom, Math.min(13 / zoom, h * 0.35));

  // ── Move drag ───────────────────────────────────────────────────────────────
  const startPos = useRef({ elX: 0, elY: 0, mouseX: 0, mouseY: 0 });
  const lastMovePos = useRef({ x: 0, y: 0 });

  const { handleMouseDown: handleBodyDown } = useDrag(svgRef, panZoomRef, {
    onDragStart: (mx, my) => {
      startPos.current = { elX: element.x, elY: element.y, mouseX: mx, mouseY: my };
      lastMovePos.current = { x: element.x, y: element.y };
    },
    onDragMove: (_dx, _dy, canvasX, canvasY) => {
      let nx = startPos.current.elX + (canvasX - startPos.current.mouseX);
      let ny = startPos.current.elY + (canvasY - startPos.current.mouseY);
      if (snapEnabled) { nx = snapToGrid(nx, gridSize); ny = snapToGrid(ny, gridSize); }
      lastMovePos.current = { x: nx, y: ny };
      onMove(nx, ny);
    },
    onDragEnd: () => {
      onMoveCommit(lastMovePos.current.x, lastMovePos.current.y);
    },
  });

  // ── Resize drag ─────────────────────────────────────────────────────────────
  const activeHandle = useRef<HandleType | null>(null);
  const startGeom = useRef({ x: 0, y: 0, w: 0, h: 0, mouseX: 0, mouseY: 0 });
  const lastResizeGeom = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const { handleMouseDown: handleHandleDown } = useDrag(svgRef, panZoomRef, {
    onDragStart: (mx, my) => {
      startGeom.current = { x: element.x, y: element.y, w: element.width, h: element.height, mouseX: mx, mouseY: my };
      lastResizeGeom.current = { x: element.x, y: element.y, w: element.width, h: element.height };
    },
    onDragMove: (_dx, _dy, canvasX, canvasY) => {
      const type = activeHandle.current;
      if (!type) return;
      const totalDx = canvasX - startGeom.current.mouseX;
      const totalDy = canvasY - startGeom.current.mouseY;
      const [ldx, ldy] = rotateDelta(totalDx, totalDy, rotation);
      const { x: sx, y: sy, w: sw_, h: sh } = startGeom.current;
      const right = sx + sw_;
      const bottom = sy + sh;

      let nx = sx, ny = sy, nw = sw_, nh = sh;
      switch (type) {
        case 'nw': nw = Math.max(MIN_SIZE, sw_ - ldx); nh = Math.max(MIN_SIZE, sh - ldy); nx = right - nw; ny = bottom - nh; break;
        case 'n':  nh = Math.max(MIN_SIZE, sh - ldy); ny = bottom - nh; break;
        case 'ne': nw = Math.max(MIN_SIZE, sw_ + ldx); nh = Math.max(MIN_SIZE, sh - ldy); ny = bottom - nh; break;
        case 'e':  nw = Math.max(MIN_SIZE, sw_ + ldx); break;
        case 'se': nw = Math.max(MIN_SIZE, sw_ + ldx); nh = Math.max(MIN_SIZE, sh + ldy); break;
        case 's':  nh = Math.max(MIN_SIZE, sh + ldy); break;
        case 'sw': nw = Math.max(MIN_SIZE, sw_ - ldx); nh = Math.max(MIN_SIZE, sh + ldy); nx = right - nw; break;
        case 'w':  nw = Math.max(MIN_SIZE, sw_ - ldx); nx = right - nw; break;
      }
      if (snapEnabled) {
        nw = Math.max(MIN_SIZE, snapToGrid(nw, gridSize));
        nh = Math.max(MIN_SIZE, snapToGrid(nh, gridSize));
      }
      lastResizeGeom.current = { x: nx, y: ny, w: nw, h: nh };
      onResize(nx, ny, nw, nh);
    },
    onDragEnd: () => {
      const { x: rx, y: ry, w: rw, h: rh } = lastResizeGeom.current;
      onResizeCommit(rx, ry, rw, rh);
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

  // ── Rotate drag ─────────────────────────────────────────────────────────────
  const rotStart = useRef({ angleOffset: 0 });

  const handleRotateDown = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { panX, panY, zoom: z } = panZoomRef.current;
      const mcx = (e.clientX - svgRect.left - panX) / z;
      const mcy = (e.clientY - svgRect.top - panY) / z;
      const initAngle = Math.atan2(mcy - cy, mcx - cx) * (180 / Math.PI);
      rotStart.current.angleOffset = element.rotation - initAngle;

      // Track the live rotation so onUp always commits the final value,
      // not the stale element.rotation captured in the useCallback closure.
      let currentRot = element.rotation;

      const onMove = (ev: MouseEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const { panX: px, panY: py, zoom: z2 } = panZoomRef.current;
        const mx2 = (ev.clientX - rect.left - px) / z2;
        const my2 = (ev.clientY - rect.top - py) / z2;
        let newRot = Math.atan2(my2 - cy, mx2 - cx) * (180 / Math.PI) + rotStart.current.angleOffset;
        if (ev.shiftKey) newRot = Math.round(newRot / 15) * 15;
        currentRot = newRot;
        onRotate(newRot);
      };

      const onUp = () => {
        onRotateCommit(currentRot);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [cx, cy, element.rotation, panZoomRef, svgRef, onRotate, onRotateCommit],
  );

  // ── Body click (select / erase) ─────────────────────────────────────────────
  const handleBodyClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      if (onViewerClick) { onViewerClick(); return; }
      if (tool === 'ERASE') { onDelete(); return; }
      if (tool === 'SELECT') { onSelect(e.ctrlKey || e.metaKey || e.shiftKey); }
    },
    [tool, onDelete, onSelect, onViewerClick],
  );

  // ── Derived ─────────────────────────────────────────────────────────────────
  const fillColor = statusFill ?? typeDef.color;
  const bodyCursor = onViewerClick ? 'pointer' : tool === 'ERASE' ? 'crosshair' : tool === 'SELECT' ? 'move' : 'default';

  // ── Custom SVG path geometry ─────────────────────────────────────────────────
  // Parse the viewBox to get the coordinate space the path was designed in.
  const customPath = typeDef.shape === 'path' && typeDef.svgPath
    ? (() => {
        const parts = (typeDef.viewBox ?? '0 0 100 100').split(/[\s,]+/).map(Number);
        const vw = parts[2] ?? 100;
        const vh = parts[3] ?? 100;
        const scaleX = vw > 0 ? w / vw : 1;
        const scaleY = vh > 0 ? h / vh : 1;
        // Compensate stroke so it renders as ~sw in canvas units regardless of shape scale
        const avgScale = Math.sqrt(Math.abs(scaleX * scaleY)) || 1;
        return { scaleX, scaleY, strokeWidth: sw / avgScale };
      })()
    : null;

  const handles: Array<{ type: HandleType; hx: number; hy: number }> = [
    { type: 'nw', hx: x,      hy: y },
    { type: 'n',  hx: x+w/2,  hy: y },
    { type: 'ne', hx: x+w,    hy: y },
    { type: 'e',  hx: x+w,    hy: y+h/2 },
    { type: 'se', hx: x+w,    hy: y+h },
    { type: 's',  hx: x+w/2,  hy: y+h },
    { type: 'sw', hx: x,      hy: y+h },
    { type: 'w',  hx: x,      hy: y+h/2 },
  ];

  return (
    <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
      {/* ── Shape ── */}
      {typeDef.shape === 'rect' && (
        <rect
          x={x} y={y} width={w} height={h}
          fill={fillColor}
          stroke={isSelected ? '#3b82f6' : typeDef.strokeColor}
          strokeWidth={isSelected ? sw * 1.5 : sw}
          style={{ cursor: bodyCursor }}
          onMouseDown={tool === 'SELECT' && !onViewerClick ? handleBodyDown : undefined}
          onClick={handleBodyClick}
        />
      )}
      {typeDef.shape === 'circle' && (
        <ellipse
          cx={cx} cy={cy} rx={w / 2} ry={h / 2}
          fill={fillColor}
          stroke={isSelected ? '#3b82f6' : typeDef.strokeColor}
          strokeWidth={isSelected ? sw * 1.5 : sw}
          style={{ cursor: bodyCursor }}
          onMouseDown={tool === 'SELECT' && !onViewerClick ? handleBodyDown : undefined}
          onClick={handleBodyClick}
        />
      )}
      {typeDef.shape === 'arrow' && (
        <path
          d={arrowPath(x, y, w, h)}
          fill={fillColor}
          stroke={isSelected ? '#3b82f6' : typeDef.strokeColor}
          strokeWidth={isSelected ? sw * 1.5 : sw}
          style={{ cursor: bodyCursor }}
          onMouseDown={tool === 'SELECT' && !onViewerClick ? handleBodyDown : undefined}
          onClick={handleBodyClick}
        />
      )}
      {typeDef.shape === 'path' && customPath && typeDef.svgPath && (
        <g transform={`translate(${x}, ${y}) scale(${customPath.scaleX}, ${customPath.scaleY})`}>
          <path
            d={typeDef.svgPath}
            fill={fillColor}
            fillRule={typeDef.fillRule ?? 'nonzero'}
            stroke={isSelected ? '#3b82f6' : typeDef.strokeColor}
            strokeWidth={isSelected ? customPath.strokeWidth * 1.5 : customPath.strokeWidth}
            style={{ cursor: bodyCursor }}
            onMouseDown={tool === 'SELECT' && !onViewerClick ? handleBodyDown : undefined}
            onClick={handleBodyClick}
          />
        </g>
      )}

      {/* ── Label ── */}
      {(element.label ?? typeDef.label) && (
        <text
          x={cx} y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fill={typeDef.strokeColor}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {element.label ?? typeDef.label}
        </text>
      )}

      {/* ── Selection overlays ── */}
      {isSelected && tool === 'SELECT' && (
        <>
          {/* Rotate line + handle */}
          <line
            x1={cx} y1={y}
            x2={cx} y2={y - rotOffset}
            stroke="#3b82f6" strokeWidth={sw}
            style={{ pointerEvents: 'none' }}
          />
          <circle
            cx={cx} cy={y - rotOffset} r={hs * 0.8}
            fill="white" stroke="#3b82f6" strokeWidth={sw}
            style={{ cursor: 'grab' }}
            onMouseDown={handleRotateDown}
          />

          {/* Resize handles */}
          {handles.map(({ type, hx, hy }) => (
            <rect
              key={type}
              x={hx - hs} y={hy - hs}
              width={hs * 2} height={hs * 2}
              rx={1 / zoom}
              fill="white" stroke="#3b82f6" strokeWidth={sw}
              style={{ cursor: HANDLE_CURSORS[type] }}
              onMouseDown={e => startHandleDrag(e, type)}
            />
          ))}
        </>
      )}
    </g>
  );
}
