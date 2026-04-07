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
  /** Custom element libraries imported by the user; persisted with the map. */
  libraries?: ElementLibrary;
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

// ─── Custom element libraries ─────────────────────────────────────────────────

export interface ElementGroup {
  name: string;
  objects: ElementTypeDef[];
}

/** A library JSON file: top-level keys are group IDs. */
export type ElementLibrary = Record<string, ElementGroup>;

// ─── Viewer status ────────────────────────────────────────────────────────────

export interface ElementStatus {
  elementId: string;
  status: 'free' | 'occupied' | 'reserved' | 'disabled';
  tooltip?: string;
}

// ─── Editor props ─────────────────────────────────────────────────────────────

export interface VenueMapEditorProps {
  /**
   * Optional built-in element type catalog.
   * If omitted the palette is empty until the user imports a library JSON.
   */
  domainConfig?: DomainConfig;
  /**
   * Map to render. When this prop changes (by reference) from outside the
   * component, the editor resets its history to the new map — allowing the
   * parent to hydrate the editor from an API or local storage without causing
   * a render loop (changes made inside the editor that are echoed back via
   * `onChange` are detected and ignored).
   */
  initialMap?: VenueMap;
  /** Called every time the internal map state changes. */
  onChange?: (map: VenueMap) => void;
  width?: string | number;
  height?: string | number;
  gridSize?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
  readOnly?: boolean;
  /** Viewer-only mode: pan and zoom are allowed but nothing can be edited. */
  fixed?: boolean;
  elementStatus?: ElementStatus[];
  onElementClick?: (element: MapElement) => void;
  /**
   * Per-type click handlers active in viewer/fixed mode.
   * Keys are element type IDs (e.g. `'TABLE_ROUND'`).
   * When an element is clicked, its type-specific handler fires first;
   * if none is registered, `onElementClick` is used as fallback.
   *
   * @example
   * ```tsx
   * <VenueMapViewer
   *   onElementTypeClick={{
   *     TABLE_ROUND: (el) => openReservation(el.id),
   *     CHAIR:       (el) => showInfo(el),
   *   }}
   * />
   * ```
   */
  onElementTypeClick?: Record<string, (element: MapElement) => void>;
}

export type VenueMapViewerProps = VenueMapEditorProps;
