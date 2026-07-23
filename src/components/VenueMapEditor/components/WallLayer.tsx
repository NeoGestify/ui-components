import { useMemo } from 'react';
import type { WallNode, Wall, ToolMode } from '../types';
import type { VenuePalette } from '../theme';
import { wallSegmentPath } from '../utils/wallGeometry';
import type { Vec2 } from '../utils/wallGeometry';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WallLayerProps {
  nodes: WallNode[];
  walls: Wall[];
  zoom: number;
  tool: ToolMode;
  palette: VenuePalette;
  selectedWallId?: string | null;
  onSelectWall?: (id: string | null) => void;
  onDeleteWall?: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function vecNorm(v: Vec2): Vec2 {
  const len = Math.hypot(v.x, v.y);
  return len < 1e-10 ? { x: 1, y: 0 } : { x: v.x / len, y: v.y / len };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WallLayer({
  nodes,
  walls,
  zoom,
  tool,
  palette,
  selectedWallId,
  onSelectWall,
  onDeleteWall,
}: WallLayerProps) {
  // Recalcular los mitres de todas las paredes es O(n) sobre el grafo; se
  // memoiza para que el pan/zoom (que cambia `zoom` pero no la geometría) no
  // rehaga el trabajo en cada frame.
  const items = useMemo(() => {
    const nodeMap = new Map<string, WallNode>(nodes.map(n => [n.id, n]));

    // nodeId → list of walls that touch it
    const nodeWalls = new Map<string, Wall[]>();
    for (const n of nodes) nodeWalls.set(n.id, []);
    for (const wall of walls) {
      nodeWalls.get(wall.nodeAId)?.push(wall);
      nodeWalls.get(wall.nodeBId)?.push(wall);
    }

    return walls.map(wall => {
      const nodeA = nodeMap.get(wall.nodeAId);
      const nodeB = nodeMap.get(wall.nodeBId);
      if (!nodeA || !nodeB) return null;

      // Adjacent-wall direction at nodeA (only when exactly 1 other wall present)
      const wallsAtA = (nodeWalls.get(wall.nodeAId) ?? []).filter(w => w.id !== wall.id);
      let adjDirAtA: Vec2 | null = null;
      if (wallsAtA.length === 1) {
        const w2 = wallsAtA[0];
        const otherId = w2.nodeAId === wall.nodeAId ? w2.nodeBId : w2.nodeAId;
        const other = nodeMap.get(otherId);
        if (other) adjDirAtA = vecNorm({ x: other.x - nodeA.x, y: other.y - nodeA.y });
      }

      // Adjacent-wall direction at nodeB
      const wallsAtB = (nodeWalls.get(wall.nodeBId) ?? []).filter(w => w.id !== wall.id);
      let adjDirAtB: Vec2 | null = null;
      if (wallsAtB.length === 1) {
        const w2 = wallsAtB[0];
        const otherId = w2.nodeAId === wall.nodeBId ? w2.nodeBId : w2.nodeAId;
        const other = nodeMap.get(otherId);
        if (other) adjDirAtB = vecNorm({ x: other.x - nodeB.x, y: other.y - nodeB.y });
      }

      const path = wallSegmentPath(
        nodeA.x, nodeA.y, nodeB.x, nodeB.y,
        wall.thickness, adjDirAtA, adjDirAtB,
      );
      return { wall, path };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [nodes, walls]);

  if (walls.length === 0 && nodes.length === 0) return null;

  const sw = 0.75 / zoom;
  const isErase = tool === 'ERASE';
  const isSelect = tool === 'SELECT';
  const interactive = isErase || (isSelect && !!onSelectWall);

  return (
    <g>
      {/* ── Wall fills ── */}
      {items.map(({ wall, path }) => {
        const mat = palette.wallMaterials[wall.material] ?? palette.wallMaterials.concrete;
        const isSelected = wall.id === selectedWallId;
        return (
          <g key={wall.id}>
            {/* Visible fill */}
            <path
              d={path}
              fill={mat.fill}
              fillOpacity={mat.opacity ?? 1}
              stroke={isSelected ? palette.accent : mat.stroke}
              strokeWidth={isSelected ? sw * 3 : sw}
              strokeLinejoin="miter"
              style={{ pointerEvents: 'none' }}
            />
            {/* Zona de impacto ancha para poder seleccionar/borrar sin precisión */}
            {interactive && (
              <path
                d={path}
                fill="transparent"
                stroke="transparent"
                strokeWidth={Math.max(wall.thickness, 16 / zoom)}
                style={{ cursor: isErase ? 'crosshair' : 'pointer', pointerEvents: 'all' }}
                onPointerDown={e => e.stopPropagation()}
                onClick={e => {
                  e.stopPropagation();
                  if (isErase) onDeleteWall?.(wall.id);
                  else onSelectWall?.(isSelected ? null : wall.id);
                }}
              >
                <title>{isErase ? 'Eliminar pared' : `Pared (${wall.material})`}</title>
              </path>
            )}
          </g>
        );
      })}

      {/* ── Node dots (visible in WALL mode to show the graph) ── */}
      {tool === 'WALL' && nodes.map(node => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={4 / zoom}
          fill={palette.accent}
          stroke={palette.handleFill}
          strokeWidth={1.5 / zoom}
          style={{ pointerEvents: 'none' }}
        />
      ))}
    </g>
  );
}
