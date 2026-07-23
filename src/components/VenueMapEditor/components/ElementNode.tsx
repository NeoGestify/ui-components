import { useRef, useCallback, useMemo, memo } from 'react';
import type { RefObject, PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent, CSSProperties } from 'react';
import type { MapElement, ElementTypeDef, ToolMode } from '../types';
import type { PanZoomState } from '../hooks/usePanZoom';
import type { VenuePalette } from '../theme';
import { useDrag } from '../hooks/useDrag';
import { snapToGrid } from '../utils/snapUtils';
import { parseSvgMarkup } from '../utils/svgParser';

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

/** Normaliza a [0, 360) para que la rotación no crezca sin límite al girar. */
function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
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
  palette: VenuePalette;
  statusFill?: string;
  statusTooltip?: string;
  /** Todos los callbacks reciben el id para que el padre pueda pasar
   *  referencias estables y `memo` evite re-renderizar el resto del mapa. */
  onSelect: (id: string, multi: boolean) => void;
  onMove: (id: string, x: number, y: number) => void;
  onMoveCommit: (id: string, x: number, y: number) => void;
  onResize: (id: string, x: number, y: number, w: number, h: number) => void;
  onResizeCommit: (id: string, x: number, y: number, w: number, h: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onRotateCommit: (id: string, rotation: number) => void;
  onDelete: (id: string) => void;
  onViewerClick?: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function ElementNodeImpl({
  element,
  typeDef,
  isSelected,
  tool,
  zoom,
  svgRef,
  panZoomRef,
  snapEnabled,
  gridSize,
  palette,
  statusFill,
  statusTooltip,
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
  const { id, x, y, width: w, height: h, rotation } = element;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const sw = 1.5 / zoom;
  const hs = 7 / zoom;            // handle half-size
  const rotOffset = 22 / zoom;    // rotate handle distance above bbox
  const fontSize = Math.max(9 / zoom, Math.min(13 / zoom, h * 0.35));

  const isInteractive = tool === 'SELECT' && !onViewerClick;

  /** Marca un arrastre recién terminado para que el `click` posterior no
   *  reinterprete el gesto como una selección (y, con Ctrl, deseleccione). */
  const justDragged = useRef(false);

  // ── Move drag ───────────────────────────────────────────────────────────────
  const startPos = useRef({ elX: 0, elY: 0, mouseX: 0, mouseY: 0 });
  const lastMovePos = useRef({ x: 0, y: 0 });

  const { handlePointerDown: handleBodyDown } = useDrag(svgRef, panZoomRef, {
    onDragStart: (mx, my) => {
      startPos.current = { elX: element.x, elY: element.y, mouseX: mx, mouseY: my };
      lastMovePos.current = { x: element.x, y: element.y };
    },
    onDragMove: (_dx, _dy, canvasX, canvasY) => {
      let nx = startPos.current.elX + (canvasX - startPos.current.mouseX);
      let ny = startPos.current.elY + (canvasY - startPos.current.mouseY);
      if (snapEnabled) { nx = snapToGrid(nx, gridSize); ny = snapToGrid(ny, gridSize); }
      lastMovePos.current = { x: nx, y: ny };
      onMove(id, nx, ny);
    },
    onDragEnd: (_x, _y, moved) => {
      // Un clic sin desplazamiento no debe ensuciar el historial con un
      // estado idéntico al anterior.
      if (!moved) return;
      justDragged.current = true;
      onMoveCommit(id, lastMovePos.current.x, lastMovePos.current.y);
    },
  });

  // ── Resize drag ─────────────────────────────────────────────────────────────
  const activeHandle = useRef<HandleType | null>(null);
  const startGeom = useRef({ x: 0, y: 0, w: 0, h: 0, mouseX: 0, mouseY: 0 });
  const lastResizeGeom = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const { handlePointerDown: handleHandleDown } = useDrag(svgRef, panZoomRef, {
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
        // Al ajustar el tamaño hay que recolocar el borde anclado, o el lado
        // opuesto al handle se desplaza.
        if (type === 'nw' || type === 'sw' || type === 'w') nx = right - nw;
        if (type === 'nw' || type === 'ne' || type === 'n') ny = bottom - nh;
      }
      lastResizeGeom.current = { x: nx, y: ny, w: nw, h: nh };
      onResize(id, nx, ny, nw, nh);
    },
    onDragEnd: (_x, _y, moved) => {
      activeHandle.current = null;
      if (!moved) return;
      justDragged.current = true;
      const { x: rx, y: ry, w: rw, h: rh } = lastResizeGeom.current;
      onResizeCommit(id, rx, ry, rw, rh);
    },
  });

  const startHandleDrag = useCallback(
    (e: ReactPointerEvent, type: HandleType) => {
      activeHandle.current = type;
      handleHandleDown(e);
    },
    [handleHandleDown],
  );

  // ── Rotate drag ─────────────────────────────────────────────────────────────
  const rotStart = useRef({ angleOffset: 0 });

  const handleRotateDown = useCallback(
    (e: ReactPointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const pointerId = e.pointerId;
      const { panX, panY, zoom: z } = panZoomRef.current;
      const mcx = (e.clientX - svgRect.left - panX) / z;
      const mcy = (e.clientY - svgRect.top - panY) / z;
      const initAngle = Math.atan2(mcy - cy, mcx - cx) * (180 / Math.PI);
      rotStart.current.angleOffset = element.rotation - initAngle;

      // Track the live rotation so onUp always commits the final value,
      // not the stale element.rotation captured in the useCallback closure.
      let currentRot = element.rotation;
      let moved = false;

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const { panX: px, panY: py, zoom: z2 } = panZoomRef.current;
        const mx2 = (ev.clientX - rect.left - px) / z2;
        const my2 = (ev.clientY - rect.top - py) / z2;
        let newRot = Math.atan2(my2 - cy, mx2 - cx) * (180 / Math.PI) + rotStart.current.angleOffset;
        // Shift → pasos de 15°, igual que en la mayoría de editores vectoriales.
        if (ev.shiftKey) newRot = Math.round(newRot / 15) * 15;
        newRot = normalizeAngle(newRot);
        if (Math.abs(newRot - currentRot) > 0.01) moved = true;
        currentRot = newRot;
        onRotate(id, newRot);
      };

      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        if (!moved) return;
        justDragged.current = true;
        onRotateCommit(id, currentRot);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [id, cx, cy, element.rotation, panZoomRef, svgRef, onRotate, onRotateCommit],
  );

  // ── Body click (select / erase) ─────────────────────────────────────────────
  const handleBodyClick = useCallback(
    (e: ReactMouseEvent) => {
      // Cierre de un arrastre: el clic sintético que emite el navegador al
      // soltar no debe alterar la selección.
      if (justDragged.current) {
        justDragged.current = false;
        e.stopPropagation();
        return;
      }
      if (onViewerClick) { e.stopPropagation(); onViewerClick(id); return; }
      if (tool === 'ERASE') { e.stopPropagation(); onDelete(id); return; }
      if (tool === 'SELECT') {
        e.stopPropagation();
        onSelect(id, e.ctrlKey || e.metaKey || e.shiftKey);
      }
      // En PLACE / WALL / PAN el evento sigue su curso hasta el lienzo, para
      // poder colocar un elemento o trazar una pared encima de otro.
    },
    [id, tool, onDelete, onSelect, onViewerClick],
  );

  // ── Derived ─────────────────────────────────────────────────────────────────
  const fillColor = statusFill ?? typeDef.color;
  const bodyCursor = onViewerClick ? 'pointer' : tool === 'ERASE' ? 'crosshair' : tool === 'SELECT' ? 'move' : 'inherit';
  const selectionStroke = palette.accent;

  // Durante PLACE/WALL el cuerpo no debe capturar el puntero: el clic tiene que
  // llegar al lienzo para colocar o trazar sobre un elemento existente.
  const passThrough = tool === 'PLACE' || tool === 'WALL' || tool === 'PAN';
  const bodyStyle: CSSProperties = {
    cursor: bodyCursor,
    pointerEvents: passThrough && !onViewerClick ? 'none' : 'auto',
  };

  const bodyHandlers = {
    onPointerDown: isInteractive ? handleBodyDown : undefined,
    onClick: handleBodyClick,
    style: bodyStyle,
  };

  // ── Custom SVG path geometry ─────────────────────────────────────────────────
  // Parse the viewBox to get the coordinate space the path was designed in.
  const customPath = useMemo(() => {
    if (typeDef.shape !== 'path' || !typeDef.svgPath) return null;
    const parts = (typeDef.viewBox ?? '0 0 100 100').split(/[\s,]+/).map(Number);
    const vw = parts[2] || 100;
    const vh = parts[3] || 100;
    return { vw, vh };
  }, [typeDef.shape, typeDef.svgPath, typeDef.viewBox]);

  const parsedSvg = useMemo(
    () => (typeDef.shape === 'svg' && typeDef.svgMarkup ? parseSvgMarkup(typeDef.svgMarkup) : null),
    [typeDef.shape, typeDef.svgMarkup],
  );

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

  const label = element.label ?? typeDef.label;
  const tooltip = statusTooltip ?? label;

  return (
    <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
      {/* ── Shape ── */}
      {typeDef.shape === 'rect' && (
        <rect
          x={x} y={y} width={w} height={h}
          fill={fillColor}
          stroke={isSelected ? selectionStroke : typeDef.strokeColor}
          strokeWidth={isSelected ? sw * 1.5 : sw}
          {...bodyHandlers}
        >
          {tooltip && <title>{tooltip}</title>}
        </rect>
      )}
      {typeDef.shape === 'circle' && (
        <ellipse
          cx={cx} cy={cy} rx={w / 2} ry={h / 2}
          fill={fillColor}
          stroke={isSelected ? selectionStroke : typeDef.strokeColor}
          strokeWidth={isSelected ? sw * 1.5 : sw}
          {...bodyHandlers}
        >
          {tooltip && <title>{tooltip}</title>}
        </ellipse>
      )}
      {typeDef.shape === 'arrow' && (
        <path
          d={arrowPath(x, y, w, h)}
          fill={fillColor}
          stroke={isSelected ? selectionStroke : typeDef.strokeColor}
          strokeWidth={isSelected ? sw * 1.5 : sw}
          {...bodyHandlers}
        >
          {tooltip && <title>{tooltip}</title>}
        </path>
      )}
      {typeDef.shape === 'path' && customPath && typeDef.svgPath && (() => {
        const scaleX = w / customPath.vw;
        const scaleY = h / customPath.vh;
        // Compensa el trazo para que se vea con el mismo grosor sin importar
        // cuánto se haya escalado la forma.
        const avgScale = Math.sqrt(Math.abs(scaleX * scaleY)) || 1;
        const strokeWidth = sw / avgScale;
        return (
          <g transform={`translate(${x}, ${y}) scale(${scaleX}, ${scaleY})`}>
            <path
              d={typeDef.svgPath}
              fill={fillColor}
              fillRule={typeDef.fillRule ?? 'nonzero'}
              stroke={isSelected ? selectionStroke : typeDef.strokeColor}
              strokeWidth={isSelected ? strokeWidth * 1.5 : strokeWidth}
              {...bodyHandlers}
            >
              {tooltip && <title>{tooltip}</title>}
            </path>
          </g>
        );
      })()}
      {typeDef.shape === 'svg' && parsedSvg && (() => {
        const parts = parsedSvg.viewBox.split(/[\s,]+/).map(Number);
        const vw = parts[2] || 100;
        const vh = parts[3] || 100;
        const sx = w / vw;
        const sy = h / vh;
        const avgScale = Math.sqrt(Math.abs(sx * sy)) || 1;
        return (
          // A diferencia de las formas primitivas, el markup SVG es una
          // ilustración terminada: en reposo NO se le impone `stroke`. Al
          // heredarlo del grupo, cualquier trazo que la ilustración no definiera
          // explícitamente se pintaba con `strokeColor` — negro por defecto — y
          // aparecía un contorno que el diseño original no tenía.
          //
          // Al seleccionar sí se hereda, en color de acento, como resalte.
          // Se heredan siempre `fill` (permite teñir por estado) y `color`,
          // para que el markup pueda usar `currentColor`.
          <g
            transform={`translate(${x}, ${y}) scale(${sx}, ${sy})`}
            fill={fillColor}
            color={typeDef.strokeColor}
            stroke={isSelected ? selectionStroke : undefined}
            strokeWidth={isSelected ? (sw / avgScale) * 1.5 : undefined}
            {...bodyHandlers}
            dangerouslySetInnerHTML={{ __html: parsedSvg.innerHtml }}
          />
        );
      })()}

      {/* ── Label ── */}
      {label && (
        <text
          x={cx} y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fill={typeDef.strokeColor}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {label}
        </text>
      )}

      {/* ── Selection overlays ── */}
      {isSelected && tool === 'SELECT' && !onViewerClick && (
        <>
          {/* Rotate line + handle */}
          <line
            x1={cx} y1={y}
            x2={cx} y2={y - rotOffset}
            stroke={selectionStroke} strokeWidth={sw}
            style={{ pointerEvents: 'none' }}
          />
          <circle
            cx={cx} cy={y - rotOffset} r={hs * 0.8}
            fill={palette.handleFill} stroke={selectionStroke} strokeWidth={sw}
            style={{ cursor: 'grab' }}
            onPointerDown={handleRotateDown}
          >
            <title>Girar (Mayús: pasos de 15°)</title>
          </circle>

          {/* Resize handles */}
          {handles.map(({ type, hx, hy }) => (
            <rect
              key={type}
              x={hx - hs} y={hy - hs}
              width={hs * 2} height={hs * 2}
              rx={1 / zoom}
              fill={palette.handleFill} stroke={selectionStroke} strokeWidth={sw}
              style={{ cursor: HANDLE_CURSORS[type] }}
              onPointerDown={e => startHandleDrag(e, type)}
            />
          ))}
        </>
      )}
    </g>
  );
}

export const ElementNode = memo(ElementNodeImpl);
