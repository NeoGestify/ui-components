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
  ElementStatus,
  VenueMapEditorProps,
  VenueMapViewerProps,
} from './types';

// Domain configs
export { parkingConfig } from './config/parkingConfig';
export { restaurantConfig } from './config/restaurantConfig';

// Hooks (for advanced consumers)
export { usePanZoom } from './hooks/usePanZoom';
export type { PanZoomState } from './hooks/usePanZoom';

// Utils (for advanced consumers)
export { genId } from './utils/idGen';
export { snapToGrid, snapPoint, findNearestNode } from './utils/snapUtils';
