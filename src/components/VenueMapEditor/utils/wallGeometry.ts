// ─── Vector math ─────────────────────────────────────────────────────────────

type Vec2 = { x: number; y: number };

function norm(v: Vec2): Vec2 {
  const len = Math.hypot(v.x, v.y);
  return len < 1e-10 ? { x: 1, y: 0 } : { x: v.x / len, y: v.y / len };
}

/** 90° CCW rotation (left-normal of a forward direction). */
function perp(v: Vec2): Vec2 { return { x: -v.y, y: v.x }; }

function add(a: Vec2, b: Vec2): Vec2 { return { x: a.x + b.x, y: a.y + b.y }; }

function scale(v: Vec2, s: number): Vec2 { return { x: v.x * s, y: v.y * s }; }

/**
 * Intersect two infinite lines:  p1 + s·d1  and  p2 + t·d2.
 * Returns null when the lines are parallel.
 */
function lineIntersect(p1: Vec2, d1: Vec2, p2: Vec2, d2: Vec2): Vec2 | null {
  const det = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(det) < 1e-8) return null;
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const s = (dx * d2.y - dy * d2.x) / det;
  return { x: p1.x + s * d1.x, y: p1.y + s * d1.y };
}

// ─── Wall polygon ─────────────────────────────────────────────────────────────

/**
 * Compute the closed SVG path for a single wall segment (ax,ay)→(bx,by).
 *
 * Miter joints are applied at either end when an adjacent wall direction is
 * provided (exactly one other wall sharing that node).  With no adjacent wall
 * the end cap is a flat (square) termination.
 *
 * @param adjDirAtA - normalised direction of the OTHER wall leaving nodeA
 * @param adjDirAtB - normalised direction of the OTHER wall leaving nodeB
 */
export function wallSegmentPath(
  ax: number, ay: number,
  bx: number, by: number,
  thickness: number,
  adjDirAtA: Vec2 | null,
  adjDirAtB: Vec2 | null,
): string {
  const dir = norm({ x: bx - ax, y: by - ay });
  const n   = perp(dir);
  const h   = thickness / 2;
  const A: Vec2 = { x: ax, y: ay };
  const B: Vec2 = { x: bx, y: by };

  // Default (un-mitered) corners
  let lA = add(A, scale(n,  h));
  let rA = add(A, scale(n, -h));
  let lB = add(B, scale(n,  h));
  let rB = add(B, scale(n, -h));

  // Miter at A:
  // Intersect [left-of-W at A going in dir] with [left-of-W2 at A going in adjDirAtA]
  if (adjDirAtA) {
    const n2 = perp(adjDirAtA);
    const mL = lineIntersect(add(A, scale(n,  h)), dir, add(A, scale(n2,  h)), adjDirAtA);
    const mR = lineIntersect(add(A, scale(n, -h)), dir, add(A, scale(n2, -h)), adjDirAtA);
    if (mL) lA = mL;
    if (mR) rA = mR;
  }

  // Miter at B:
  // Intersect [left-of-W at B going in dir] with [left-of-W2 at B going in adjDirAtB]
  if (adjDirAtB) {
    const n2 = perp(adjDirAtB);
    const mL = lineIntersect(add(B, scale(n,  h)), dir, add(B, scale(n2,  h)), adjDirAtB);
    const mR = lineIntersect(add(B, scale(n, -h)), dir, add(B, scale(n2, -h)), adjDirAtB);
    if (mL) lB = mL;
    if (mR) rB = mR;
  }

  return `M ${lA.x} ${lA.y} L ${lB.x} ${lB.y} L ${rB.x} ${rB.y} L ${rA.x} ${rA.y} Z`;
}

export type { Vec2 };
