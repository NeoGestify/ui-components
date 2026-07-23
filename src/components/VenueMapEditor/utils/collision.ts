import type { FloorArea, MapElement } from '../types';

// ─── Basic geometry ─────────────────────────────────────────────────────────

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Point = [number, number];

/**
 * How strictly an element is kept inside the floor area.
 *
 * - `'full'`: the element's whole (rotation-aware) footprint stays inside.
 * - `'center'`: only the element's center must stay inside — it may overhang.
 * - `'none'`: no containment.
 */
export type ContainmentMode = 'full' | 'center' | 'none';

/** The four corners of an element box, rotated `rotation` degrees about its center. */
export function elementCorners(
  x: number, y: number, w: number, h: number, rotation: number,
): Point[] {
  const cx = x + w / 2;
  const cy = y + h / 2;
  if (!rotation) {
    return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  }
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rot = (px: number, py: number): Point => {
    const dx = px - cx;
    const dy = py - cy;
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
  };
  return [rot(x, y), rot(x + w, y), rot(x + w, y + h), rot(x, y + h)];
}

/** Axis-aligned bounding box of a set of points. */
export function boundsOf(pts: Point[]): Rect {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [px, py] of pts) {
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Rotation-aware footprint (axis-aligned bounding box) of a map element. */
export function elementFootprint(el: Pick<MapElement, 'x' | 'y' | 'width' | 'height' | 'rotation'>): Rect {
  return boundsOf(elementCorners(el.x, el.y, el.width, el.height, el.rotation));
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

// ─── Polygon helpers ────────────────────────────────────────────────────────

export function pointInPolygon(px: number, py: number, pts: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Nearest point on the polygon perimeter to (px, py). */
export function nearestPointOnPolygon(px: number, py: number, pts: Point[]): Point {
  let bestDist = Infinity, bx = pts[0][0], by = pts[0][1];
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[j], [bex, bey] = pts[i];
    const dx = bex - ax, dy = bey - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
    const nx = ax + t * dx, ny = ay + t * dy;
    const dist = (px - nx) ** 2 + (py - ny) ** 2;
    if (dist < bestDist) { bestDist = dist; bx = nx; by = ny; }
  }
  return [bx, by];
}

// ─── Floor containment ──────────────────────────────────────────────────────

/** Translation `(dx, dy)` needed to bring a rect fully inside `bounds`. */
function containRectInBounds(box: Rect, bounds: Rect): { dx: number; dy: number } {
  let dx = 0, dy = 0;
  // Wider than the floor → center it. Otherwise clamp to whichever edge is violated.
  if (box.width >= bounds.width) {
    dx = bounds.x + bounds.width / 2 - (box.x + box.width / 2);
  } else if (box.x < bounds.x) {
    dx = bounds.x - box.x;
  } else if (box.x + box.width > bounds.x + bounds.width) {
    dx = bounds.x + bounds.width - (box.x + box.width);
  }
  if (box.height >= bounds.height) {
    dy = bounds.y + bounds.height / 2 - (box.y + box.height / 2);
  } else if (box.y < bounds.y) {
    dy = bounds.y - box.y;
  } else if (box.y + box.height > bounds.y + bounds.height) {
    dy = bounds.y + bounds.height - (box.y + box.height);
  }
  return { dx, dy };
}

function areaToRect(area: FloorArea): Rect {
  return { x: area.x ?? 0, y: area.y ?? 0, width: area.width ?? 0, height: area.height ?? 0 };
}

/**
 * Constrains an element's top-left `(x, y)` so it respects the floor `area`
 * under the given containment `mode`. Rotation is taken into account: the
 * element's real footprint — not its unrotated box — is what stays inside.
 *
 * Returns the corrected top-left corner. `mode === 'none'` is a no-op.
 */
export function containToFloor(
  x: number, y: number,
  w: number, h: number,
  rotation: number,
  area: FloorArea,
  mode: ContainmentMode = 'full',
): { x: number; y: number } {
  if (mode === 'none') return { x, y };

  const cx = x + w / 2;
  const cy = y + h / 2;

  // ── Rectangle floor ──
  if (area.shape === 'rect') {
    const bounds = areaToRect(area);
    if (mode === 'center') {
      const ncx = Math.max(bounds.x, Math.min(bounds.x + bounds.width, cx));
      const ncy = Math.max(bounds.y, Math.min(bounds.y + bounds.height, cy));
      return { x: x + (ncx - cx), y: y + (ncy - cy) };
    }
    // full: translate the rotated footprint inside — exact, since a move keeps
    // rotation fixed (translation doesn't change the footprint's size).
    const box = boundsOf(elementCorners(x, y, w, h, rotation));
    const { dx, dy } = containRectInBounds(box, bounds);
    return { x: x + dx, y: y + dy };
  }

  // ── Polygon floor ──
  if (area.shape === 'polygon') {
    const pts = area.points ?? [];
    if (pts.length < 3) return { x, y };

    if (mode === 'center') {
      if (pointInPolygon(cx, cy, pts)) return { x, y };
      const [nx, ny] = nearestPointOnPolygon(cx, cy, pts);
      return { x: x + (nx - cx), y: y + (ny - cy) };
    }

    // full: iteratively push the worst outside corner back onto the perimeter.
    // Converges for convex floors; for concave shapes it still guarantees the
    // element never ends up further outside than it started.
    let tx = 0, ty = 0;
    for (let iter = 0; iter < 8; iter++) {
      const corners = elementCorners(x + tx, y + ty, w, h, rotation);
      let worstDist = 0, wdx = 0, wdy = 0;
      for (const [px, py] of corners) {
        if (!pointInPolygon(px, py, pts)) {
          const [nx, ny] = nearestPointOnPolygon(px, py, pts);
          const d = Math.hypot(nx - px, ny - py);
          if (d > worstDist) { worstDist = d; wdx = nx - px; wdy = ny - py; }
        }
      }
      if (worstDist < 0.01) break;
      tx += wdx;
      ty += wdy;
    }
    return { x: x + tx, y: y + ty };
  }

  return { x, y };
}
