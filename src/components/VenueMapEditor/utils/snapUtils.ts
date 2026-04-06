/** Snap a single value to the nearest grid line. */
export const snapToGrid = (value: number, gridSize: number): number =>
  Math.round(value / gridSize) * gridSize;

/** Snap a 2-D point to the grid if `enabled`, otherwise return it unchanged. */
export const snapPoint = (
  x: number,
  y: number,
  gridSize: number,
  enabled: boolean,
): { x: number; y: number } => ({
  x: enabled ? snapToGrid(x, gridSize) : x,
  y: enabled ? snapToGrid(y, gridSize) : y,
});

/**
 * Find the closest WallNode within `threshold` canvas units.
 * Returns the node's id and position, or null when nothing is close enough.
 */
export const findNearestNode = (
  x: number,
  y: number,
  nodes: Array<{ id: string; x: number; y: number }>,
  threshold: number,
): { id: string; x: number; y: number } | null => {
  let best: { id: string; x: number; y: number } | null = null;
  let bestDist = threshold;

  for (const node of nodes) {
    const dist = Math.hypot(node.x - x, node.y - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = node;
    }
  }

  return best;
};
