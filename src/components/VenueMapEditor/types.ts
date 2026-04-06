// ─── Domain primitives ───────────────────────────────────────────────────────

export type WallMaterial = 'concrete' | 'brick' | 'glass' | 'drywall' | 'wood';
export type AreaShape = 'rect' | 'polygon';
export type ElementShape = 'rect' | 'circle' | 'arrow';
export type ToolMode = 'SELECT' | 'WALL' | 'PLACE' | 'PAN' | 'ERASE';

// ─── Wall graph ───────────────────────────────────────────────────────────────

export interface WallNode {
  id: string;
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  nodeAId: string;
  nodeBId: string;
  /** Thickness in canvas px */
  thickness: number;
  material: WallMaterial;
}

// ─── Map elements ─────────────────────────────────────────────────────────────

export interface MapElement {
  id: string;
  /** e.g. 'TABLE_ROUND', 'PARKING_SPOT', 'DOOR' */
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Rotation in degrees */
  rotation: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

// ─── Floor / Venue ────────────────────────────────────────────────────────────

export interface FloorArea {
  shape: AreaShape;
  // rect
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // polygon
  points?: [number, number][];
}

export interface Floor {
  id: string;
  name: string;
  order: number;
  area: FloorArea;
  wallNodes: WallNode[];
  walls: Wall[];
  elements: MapElement[];
}

export interface VenueMap {
  id: string;
  name: string;
  floors: Floor[];
}

// ─── Domain config ────────────────────────────────────────────────────────────

export interface ElementTypeDef {
  id: string;
  label: string;
  shape: ElementShape;
  defaultWidth: number;
  defaultHeight: number;
  /** SVG fill color */
  color: string;
  strokeColor: string;
  /** Emoji or icon name */
  icon?: string;
}

export interface DomainConfig {
  id: string;
  name: string;
  elementTypes: ElementTypeDef[];
}

// ─── Viewer status ────────────────────────────────────────────────────────────

export interface ElementStatus {
  elementId: string;
  status: 'free' | 'occupied' | 'reserved' | 'disabled';
  tooltip?: string;
}

// ─── Editor props ─────────────────────────────────────────────────────────────

export interface VenueMapEditorProps {
  domainConfig: DomainConfig;
  initialMap?: VenueMap;
  onChange?: (map: VenueMap) => void;
  width?: string | number;
  height?: string | number;
  gridSize?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
  readOnly?: boolean;
}

export interface VenueMapViewerProps extends VenueMapEditorProps {
  elementStatus?: ElementStatus[];
  onElementClick?: (element: MapElement) => void;
}
