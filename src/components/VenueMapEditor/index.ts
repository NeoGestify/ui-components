// Main component
export { VenueMapEditor } from './VenueMapEditor';
export { VenueMapViewer } from './VenueMapViewer';

// Types
export type {
  WallMaterial,
  AreaShape,
  ElementShape,
  ToolMode,
  WallNode,
  Wall,
  MapElement,
  FloorArea,
  Floor,
  VenueMap,
  ElementTypeDef,
  DomainConfig,
  ElementGroup,
  ElementLibrary,
  ElementStatus,
  VenueMapEditorProps,
  VenueMapViewerProps,
} from './types';

export type { PaletteGroup } from './components/Toolbar';

// Tema
export { useVenueTheme, VENUE_PALETTES } from './theme';
export type { VenueTheme, VenueThemeSetting, VenuePalette } from './theme';

// Hooks (for advanced consumers)
export { usePanZoom } from './hooks/usePanZoom';
export type { PanZoomState, Bounds } from './hooks/usePanZoom';
export { useLibraryStorage } from './hooks/useLibraryStorage';

// Utils (for advanced consumers)
export { genId } from './utils/idGen';
export { snapToGrid, snapPoint, findNearestNode } from './utils/snapUtils';
export { parseSvgMarkup } from './utils/svgParser';
export type { ParsedSvgMarkup } from './utils/svgParser';
