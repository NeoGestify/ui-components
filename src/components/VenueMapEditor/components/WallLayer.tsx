import type { WallNode, Wall, ToolMode } from '../types';
import { wallSegmentPath } from '../utils/wallGeometry';
import type { Vec2 } from '../utils/wallGeometry';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WallLayerProps {
  nodes: WallNode[];
  walls: Wall[];
  zoom: number;
  tool: ToolMode;
  onDeleteWall?: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function vecNorm(v: Vec2): Vec2 {
  const len = Math.hypot(v.x, v.y);
  return len < 1e-10 ? { x: 1, y: 0 } : { x: v.x / len, y: v.y / len };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WallLayer({ nodes, walls, zoom, tool, onDeleteWall }: WallLayerProps) {
  if (walls.length === 0 && nodes.length === 0) return null;

  // ── Build lookup maps ──────────────────────────────────────────────────────
  const nodeMap = new Map<string, WallNode>(nodes.map(n => [n.id, n]));

  // nodeId → list of walls that touch it
  const nodeWalls = new Map<string, Wall[]>();
  for (const n of nodes) nodeWalls.set(n.id, []);
  for (const wall of walls) {
    nodeWalls.get(wall.nodeAId)?.push(wall);
    nodeWalls.get(wall.nodeBId)?.push(wall);
  }

  // ── Compute per-wall paths with miter ─────────────────────────────────────
  const sw    = 0.75 / zoom;
  const isErase = tool === 'ERASE';

  const items = walls.map(wall => {
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

  return (
    <g>
      {/* ── Wall fills ── */}
      {items.map(({ wall, path }) => (
        <g key={wall.id}>
          {/* Visible fill */}
          <path
            d={path}
            fill="#475569"
            stroke="#1e293b"
            strokeWidth={sw}
            strokeLinejoin="miter"
            style={{ pointerEvents: 'none' }}
          />
          {/* Wide invisible hit area for erasing */}
          {isErase && (
            <path
              d={path}
              fill="transparent"
              stroke="transparent"
              strokeWidth={Math.max(wall.thickness, 16) / zoom}
              style={{ cursor: 'crosshair', pointerEvents: 'all' }}
              onClick={() => onDeleteWall?.(wall.id)}
            />
          )}
        </g>
      ))}

      {/* ── Node dots (visible in WALL mode to show the graph) ── */}
      {tool === 'WALL' && nodes.map(node => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={4 / zoom}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1.5 / zoom}
          style={{ pointerEvents: 'none' }}
        />
      ))}
    </g>
  );
}
