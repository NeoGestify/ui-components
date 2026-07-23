// ─── Domain primitives ───────────────────────────────────────────────────────

export type WallMaterial = 'concrete' | 'brick' | 'glass' | 'drywall' | 'wood';
export type AreaShape = 'rect' | 'polygon';
export type ElementShape = 'rect' | 'circle' | 'arrow' | 'path' | 'svg' | 'image';
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
  /**
   * Raw SVG path `d` attribute for `shape === 'path'`.
   * Define the path in the coordinate space of `viewBox` (default `"0 0 100 100"`).
   * It will be automatically scaled to fit the element's `width × height` bounding box.
   *
   * @example
   * // A 5-pointed star in a 100×100 viewBox
   * svgPath: "M50 5 L61 35 L95 35 L68 57 L79 91 L50 70 L21 91 L32 57 L5 35 L39 35 Z"
   */
  svgPath?: string;
  /**
   * ViewBox for `svgPath`. Format: `"minX minY width height"`.
   * Defaults to `"0 0 100 100"` when omitted.
   */
  viewBox?: string;
  /**
   * SVG fill rule for `shape === 'path'`.
   * Use `'evenodd'` when the path contains sub-paths that should appear as holes
   * (e.g. a gear with a circular cutout, a donut, a letter with counter-forms).
   * Defaults to `'nonzero'`.
   */
  fillRule?: 'nonzero' | 'evenodd';
  /**
   * Complete SVG markup for `shape === 'svg'`.
   * Must be a valid `<svg>` element with a `viewBox` attribute.
   * The inner content is extracted and rendered inside the element's bounding box,
   * automatically scaled from the viewBox to `width × height`.
   *
   * @example
   * svgMarkup: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="5"/><path d="M50 10 L90 90 L10 90 Z"/></svg>'
   */
  svgMarkup?: string;
  /**
   * Imagen del elemento para `shape === 'image'`.
   *
   * Se recomienda un **data URI en base64** (`data:image/png;base64,…`): así la
   * imagen viaja dentro del JSON del mapa o de la librería y el mapa sigue
   * viéndose igual sin depender de ningún servidor.
   *
   * También se aceptan URLs `http(s)`. Cualquier otro esquema se descarta —
   * igual que los `data:image/svg+xml`, que pueden contener scripts.
   *
   * @example
   * imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...'
   */
  imageSrc?: string;
  /**
   * Cómo encaja la imagen en la caja del elemento (atributo SVG homónimo).
   * Por defecto `'xMidYMid meet'`: conserva la proporción y deja margen.
   * Usa `'none'` para estirarla hasta llenar la caja.
   */
  preserveAspectRatio?: string;
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
   * One or more built-in element type catalogs shown as separate palette groups.
   * Each `DomainConfig` becomes its own named section in the element palette.
   * Takes precedence over the legacy `domainConfig` singular prop.
   *
   * @example
   * ```tsx
   * <VenueMapEditor
   *   domainConfigs={[furnitureConfig, lightingConfig, audioConfig]}
   * />
   * ```
   */
  domainConfigs?: DomainConfig[];
  /**
   * @deprecated Use `domainConfigs` (array) instead.
   * Single built-in element type catalog. Ignored when `domainConfigs` is provided.
   */
  domainConfig?: DomainConfig;
  /**
   * localStorage key used to persist user-imported libraries across sessions.
   * Libraries are loaded **synchronously** on mount so all type definitions are
   * available before the map renders — preventing "unknown element type" errors.
   *
   * Set to `''` to disable persistence (libraries are lost on page reload).
   * Defaults to `'venueMapEditor:libraries'`.
   *
   * Multiple editor instances on the same page should use different keys if
   * they manage independent library sets.
   */
  libraryStorageKey?: string;
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
  /**
   * Tema del editor.
   *
   * - `'auto'` (por defecto): sigue al documento — clase `.dark`,
   *   `data-theme="dark"` o `prefers-color-scheme` — y reacciona en vivo.
   * - `'light'` / `'dark'`: fuerza el tema con independencia de la página.
   */
  theme?: 'light' | 'dark' | 'auto';
  /** Clases extra para el contenedor raíz. */
  className?: string;
  /**
   * Cómo se contienen los elementos dentro del suelo (colisión con el mapa).
   *
   * - `'full'` (por defecto): la huella completa del elemento —teniendo en
   *   cuenta su rotación— permanece dentro del suelo. No se puede sacar ni una
   *   esquina.
   * - `'center'`: solo el centro del elemento debe quedar dentro; se permite
   *   que sobresalga por los bordes (útil para iconos que representan un punto).
   * - `'none'`: sin contención; los elementos se pueden colocar libremente.
   *
   * La contención es siempre contra el **área del suelo**, no entre elementos:
   * los elementos pueden solaparse entre sí.
   */
  containment?: 'full' | 'center' | 'none';
}

export type VenueMapViewerProps = VenueMapEditorProps;
