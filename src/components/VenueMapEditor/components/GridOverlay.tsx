interface GridOverlayProps {
  gridSize: number;
}

/**
 * Infinite grid rendered as SVG `<pattern>` tiles.
 *
 * Two tiers:
 *  - Minor lines every `gridSize` units (very light)
 *  - Major lines every `5 × gridSize` units (slightly darker)
 *
 * Because both patterns use `patternUnits="userSpaceOnUse"` and the component
 * is rendered inside a `<g transform="translate scale">`, the grid automatically
 * scales and pans with the canvas.
 */
export function GridOverlay({ gridSize }: GridOverlayProps) {
  const majorSize = gridSize * 5;

  return (
    <>
      <defs>
        {/* Minor grid */}
        <pattern
          id="vme-grid-minor"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={0.5}
          />
        </pattern>

        {/* Major grid — tiles the minor pattern, then overlays thicker lines */}
        <pattern
          id="vme-grid-major"
          width={majorSize}
          height={majorSize}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={majorSize}
            height={majorSize}
            fill="url(#vme-grid-minor)"
          />
          <path
            d={`M ${majorSize} 0 L 0 0 0 ${majorSize}`}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={1}
          />
        </pattern>
      </defs>

      <rect
        x={-50000}
        y={-50000}
        width={100000}
        height={100000}
        fill="url(#vme-grid-major)"
      />
    </>
  );
}
