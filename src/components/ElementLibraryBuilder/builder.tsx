import React, { useState, useMemo, useRef } from 'react';
import { ElementShape, ElementTypeDef, ElementLibrary } from '../VenueMapEditor/types';
import { Button, Input, Select, TextArea } from '../html';
import { IMAGE_ACCEPT, fileToDataUri, sanitizeImageSrc } from '../VenueMapEditor/utils/imageSrc';
import { useContainerSize } from '../VenueMapEditor/hooks/useContainerSize';
import { bg, bgHover, border, focusVisibleRing, text } from '../../theme/tokens';
import { cn } from '../../internal/cn';

/**
 * Anchos (px del contenedor) en los que cambia la disposición.
 * Tres columnas simultáneas necesitan bastante más sitio que el editor de
 * mapas, de ahí que el umbral principal sea mayor que su `COMPACT_WIDTH`.
 */
const STACK_OUTPUT_WIDTH = 900;   // el JSON pasa debajo
const STACK_ALL_WIDTH = 640;      // todo en una sola columna

type InternalGroup = {
  internalId: string;
  name: string;
  objects: ElementTypeDef[];
};

const DEFAULT_ELEMENT: ElementTypeDef = {
  id: '',
  label: '',
  shape: 'rect',
  defaultWidth: 100,
  defaultHeight: 100,
  color: '#cccccc',
  strokeColor: '#000000',
};

const SHAPE_OPTIONS = [
  { value: 'rect', label: 'Rectangle' },
  { value: 'circle', label: 'Circle' },
  { value: 'arrow', label: 'Arrow' },
  { value: 'path', label: 'Path' },
  { value: 'svg', label: 'SVG Markup' },
  { value: 'image', label: 'Image (base64)' },
];

/**
 * Tamaño a partir del cual conviene avisar. Un data URI base64 ocupa ~33 % más
 * que el archivo original y se copia entero dentro del JSON de la librería y de
 * cada mapa que la use.
 */
const IMAGE_WARN_BYTES = 200 * 1024;

/**
 * Indicador de foco compartido. `focus-visible` para que el anillo aparezca al
 * navegar con teclado pero no al pulsar con el ratón.
 */
const FOCUS_CLS =
  focusVisibleRing;

/** Bytes reales que ocupa la carga útil de un data URI base64. */
function dataUriBytes(src: string): number {
  const base64 = src.slice(src.indexOf(',') + 1);
  return Math.floor((base64.length * 3) / 4);
}

export const ElementLibraryBuilder: React.FC = () => {
  const [groups, setGroups] = useState<InternalGroup[]>([
    { internalId: crypto.randomUUID(), name: 'defaultGroup', objects: [] }
  ]);
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0].internalId);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(null);
  const [currentElement, setCurrentElement] = useState<ElementTypeDef>({ ...DEFAULT_ELEMENT, id: 'rect_1', label: 'New Rect' });
  const [downloadFileName, setDownloadFileName] = useState<string>("libraries");
  const [imageError, setImageError] = useState<string | null>(null);

  // Igual que en el editor de mapas: la disposición depende del contenedor
  // propio, no del viewport, porque el constructor también puede embeberse.
  const rootRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerSize(rootRef);
  const stackOutput = width > 0 && width < STACK_OUTPUT_WIDTH;
  const stackAll = width > 0 && width < STACK_ALL_WIDTH;

  // ─── Group management ────────────────────────────────────────────────────────

  const handleAddGroup = () => {
    const newGroupId = crypto.randomUUID();
    const newName = `group_${groups.length + 1}`;
    setGroups([...groups, { internalId: newGroupId, name: newName, objects: [] }]);
    setActiveGroupId(newGroupId);
    setActiveElementIndex(null);
  };

  const handleRemoveGroup = (id: string) => {
    const newGroups = groups.filter((g) => g.internalId !== id);
    setGroups(newGroups);
    if (activeGroupId === id) {
      if (newGroups.length > 0) {
        setActiveGroupId(newGroups[0].internalId);
      } else {
        setActiveGroupId('');
      }
      setActiveElementIndex(null);
    }
  };

  const activeGroup = groups.find((g) => g.internalId === activeGroupId);

  // ─── Element management ──────────────────────────────────────────────────────

  const handleSelectGroup = (gId: string) => {
    setActiveGroupId(gId);
    setActiveElementIndex(null);
  }

  const handleAddElement = () => {
    if (!activeGroup) return;

    const newEl = { ...DEFAULT_ELEMENT, id: `shape_${activeGroup.objects.length + 1}`, label: `Shape ${activeGroup.objects.length + 1}` };
    const updatedGroups = groups.map((g) => {
      if (g.internalId === activeGroupId) {
        return { ...g, objects: [...g.objects, newEl] };
      }
      return g;
    });
    setGroups(updatedGroups);
    setActiveElementIndex(activeGroup.objects.length);
    setCurrentElement(newEl);
  };

  const handleSelectElement = (idx: number) => {
    if (!activeGroup) return;
    setActiveElementIndex(idx);
    setCurrentElement(activeGroup.objects[idx]);
  };

  const handleRemoveElement = (idx: number) => {
    if (!activeGroup) return;
    const updatedGroups = groups.map((g) => {
      if (g.internalId === activeGroupId) {
        const newObjs = [...g.objects];
        newObjs.splice(idx, 1);
        return { ...g, objects: newObjs };
      }
      return g;
    });
    setGroups(updatedGroups);
    if (activeElementIndex === idx) {
      setActiveElementIndex(null);
    } else if (activeElementIndex !== null && activeElementIndex > idx) {
      setActiveElementIndex(activeElementIndex - 1);
    }
  };

  const handleSaveElement = () => {
    if (!activeGroup || activeElementIndex === null) return;
    const updatedGroups = groups.map((g) => {
      if (g.internalId === activeGroupId) {
        const newObjs = [...g.objects];
        newObjs[activeElementIndex] = { ...currentElement };
        return { ...g, objects: newObjs };
      }
      return g;
    });
    setGroups(updatedGroups);
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const handleFieldChange = (field: keyof ElementTypeDef, value: ElementTypeDef[keyof ElementTypeDef]) => {
    setCurrentElement((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    setImageError(null);
    try {
      const dataUri = await fileToDataUri(file);
      if (!sanitizeImageSrc(dataUri)) {
        // El SVG en data URI se rechaza a propósito: puede contener scripts.
        // Para vectores existe el shape 'svg', que sí se sanea.
        setImageError('Formato no admitido. Usa PNG, JPG, WEBP, GIF o AVIF (para vectores usa el shape "SVG Markup").');
        return;
      }
      handleFieldChange('imageSrc', dataUri);
    } catch {
      setImageError('No se pudo leer el archivo.');
    }
  };

  const handleSvgMarkupChange = (value: string) => {
    // No manual sanitization needed — JSON.stringify() will automatically escape
    // double quotes and special characters when serializing the output object.
    // Modifying the string here (e.g. collapsing whitespace or replacing quotes)
    // would corrupt the SVG structure (paths, attributes, colors, etc.).
    handleFieldChange('svgMarkup', value);
  };

  const generatedLib = useMemo(() => {
    const lib: ElementLibrary = {};
    groups.forEach((g) => {
      lib[g.name] = {
        name: g.name,
        objects: g.objects,
      };
    });
    return JSON.stringify(lib, null, 2);
  }, [groups]);

  const handleDownload = () => {
    const blob = new Blob([generatedLib], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${downloadFileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      ref={rootRef}
      className={cn(
        `flex gap-4 p-4 h-full text-sm ${text.base} ${bg.surface}`,
        stackOutput
          // Apilado: el contenido crece más que el contenedor, así que éste es
          // quien scrollea. `min-h-0` evita que los hijos flex impongan su
          // altura mínima y desborden sin barra.
          ? 'flex-col overflow-y-auto min-h-0'
          : 'flex-row min-h-[600px] overflow-hidden',
      )}
    >
      {/* Listas + editor. Con sitio de sobra este envoltorio es `contents`, así
          que sus hijos participan directamente en el flex de 3 columnas. */}
      <div
        className={cn(
          stackOutput
            ? (stackAll ? 'flex flex-col gap-4 shrink-0' : 'flex flex-row gap-4 shrink-0')
            : 'contents',
        )}
      >
      {/* Sidebar columns for Groups and Elements */}
      <div className={cn(
        'flex flex-col gap-4',
        stackAll
          ? `w-full shrink-0 border-b ${border.subtle} pb-4`
          : `w-1/4 shrink-0 min-h-0 border-r ${border.subtle} pr-4`,
      )}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Libraries (Groups)</h3>
            <Button variant='primary' onClick={handleAddGroup}>+ Group</Button>
          </div>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div
                key={group.internalId}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${activeGroupId === group.internalId ? `${bg.accentSoft} ${text.accent} font-semibold` : `${bgHover.surface}`}`}
                onClick={() => handleSelectGroup(group.internalId)}
              >
                {editingGroupId === group.internalId ? (
                  <Input
                    autoFocus
                    value={group.name}
                    onChange={(e) => {
                      setGroups(groups.map(g => g.internalId === group.internalId ? { ...g, name: e.target.value } : g));
                    }}
                    onBlur={() => setEditingGroupId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingGroupId(null)}
                  />
                ) : (
                  <span onDoubleClick={() => setEditingGroupId(group.internalId)}>{group.name}</span>
                )}

                {groups.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveGroup(group.internalId); }}
                    aria-label={`Eliminar grupo ${group.name}`}
                    className={`rounded px-1 text-xs ${text.danger} hover:${text.danger} ${FOCUS_CLS}`}
                  >x</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <hr className={`${border.subtle}`} />

        <div className={`flex flex-col gap-2 overflow-hidden ${stackAll ? '' : 'flex-grow'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Elements in {activeGroup?.name || '?'}</h3>
            <Button variant='secondary' onClick={handleAddElement} disabled={!activeGroup}>+ Element</Button>
          </div>
          <div className={`flex flex-col gap-1 overflow-y-auto pr-1 ${stackAll ? 'max-h-40' : 'flex-grow'}`}>
            {activeGroup?.objects.map((el, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${activeElementIndex === i ? `${bg.accentSoft} ${text.accent} font-semibold` : `${bgHover.surface}`}`}
                onClick={() => handleSelectElement(i)}
              >
                <span>{el.id} ({el.shape})</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemoveElement(i); }}
                  aria-label={`Eliminar elemento ${el.id}`}
                  className={`rounded px-1 text-xs ${text.danger} hover:${text.danger} ${FOCUS_CLS}`}
                >x</button>
              </div>
            ))}
            {(!activeGroup || activeGroup.objects.length === 0) && (
              <span className={`${text.faint} italic text-xs`}>No elements yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div className={cn(
        'flex-1 min-w-0 flex flex-col gap-4 px-2',
        stackOutput ? 'shrink-0' : 'min-h-0 overflow-y-auto',
      )}>
        <h3 className="font-bold text-lg">Element Editor</h3>
        {activeElementIndex !== null ? (
          <div className="flex flex-col gap-4 w-full max-w-2xl">
            <div className={`grid gap-4 ${stackAll ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <Input
                label="Element ID (unique)"
                value={currentElement.id}
                onChange={(e) => handleFieldChange('id', e.target.value)}
              />
              <Input
                label="Label (display name)"
                value={currentElement.label}
                onChange={(e) => handleFieldChange('label', e.target.value)}
              />
            </div>

            <div className={`grid gap-4 ${stackAll ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <Select
                label="Shape"
                options={SHAPE_OPTIONS}
                value={currentElement.shape}
                onChange={(e) => handleFieldChange('shape', e.target.value as ElementShape)}
              />
              <Input
                label="Icon (emoji or class)"
                value={currentElement.icon || ''}
                onChange={(e) => handleFieldChange('icon', e.target.value)}
              />
            </div>

            <div className={`grid gap-4 ${stackAll ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <Input
                type="number"
                label="Default Width"
                value={currentElement.defaultWidth}
                onChange={(e) => handleFieldChange('defaultWidth', parseFloat(e.target.value) || 0)}
              />
              <Input
                type="number"
                label="Default Height"
                value={currentElement.defaultHeight}
                onChange={(e) => handleFieldChange('defaultHeight', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className={`grid gap-4 ${stackAll ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-semibold ${text.muted}`}>Fill Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className={`w-8 h-8 cursor-pointer rounded ${FOCUS_CLS}`}
                    value={currentElement.color}
                    onChange={(e) => handleFieldChange('color', e.target.value)}
                  />
                  <Input
                    value={currentElement.color}
                    onChange={(e) => handleFieldChange('color', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-semibold ${text.muted}`}>Stroke Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className={`w-8 h-8 cursor-pointer rounded ${FOCUS_CLS}`}
                    value={currentElement.strokeColor}
                    onChange={(e) => handleFieldChange('strokeColor', e.target.value)}
                  />
                  <Input
                    value={currentElement.strokeColor}
                    onChange={(e) => handleFieldChange('strokeColor', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!currentElement.clickable}
                onChange={(e) => handleFieldChange('clickable', e.target.checked)}
                className="mt-0.5 accent-[var(--nui-accent,oklch(51.1%_.262_276.966))] dark:accent-[var(--nui-accent-dark,oklch(58.5%_.233_277.117))] [color-scheme:light] dark:[color-scheme:dark]"
              />
              <span className="flex flex-col">
                <span className={`text-xs font-semibold ${text.muted}`}>
                  Clickable by default
                </span>
                <span className={`text-[11px] ${text.faint} leading-snug`}>
                  Elements of this type respond to clicks in the viewer only (not
                  in the editor). Each placed element can override this.
                </span>
              </span>
            </label>

            {currentElement.shape === 'path' && (
              <div className={`flex flex-col gap-4 border ${border.subtle} p-4 rounded ${bg.surfaceMuted}/50`}>
                <h4 className="font-semibold text-sm">Path Config</h4>
                <div className={`grid gap-4 ${stackAll ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <Input
                    label="ViewBox"
                    placeholder="0 0 100 100"
                    value={currentElement.viewBox || ''}
                    onChange={(e) => handleFieldChange('viewBox', e.target.value)}
                  />
                  <Select
                    label="Fill Rule"
                    options={[
                      { value: 'nonzero', label: 'nonzero' },
                      { value: 'evenodd', label: 'evenodd' }
                    ]}
                    value={currentElement.fillRule || 'nonzero'}
                    onChange={(e) => handleFieldChange('fillRule', e.target.value)}
                  />
                </div>
                <TextArea
                  label="SVG Path (d attribute)"
                  placeholder="M10 10 H 90 V 90 H 10 Z"
                  value={currentElement.svgPath || ''}
                  onChange={(e) => handleFieldChange('svgPath', e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {currentElement.shape === 'svg' && (
              <div className="flex flex-col gap-4 p-4 rounded border border-[color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_35%,transparent)] bg-[color-mix(in_oklab,var(--nui-warning,oklch(68.1%_.162_75.834))_10%,white)] dark:bg-[color-mix(in_oklab,var(--nui-warning-dark,oklch(79.5%_.184_86.047))_12%,transparent)]">
                <h4 className="font-semibold text-sm">SVG Markup (Autosanitized)</h4>
                <p className={`text-xs ${text.warning}`}>
                  Paste your raw SVG here. Double quotes will be converted to single quotes automatically to safely embed the string in JSON.
                </p>
                <TextArea
                  label="raw <svg>...</svg>"
                  value={currentElement.svgMarkup || ''}
                  onChange={(e) => handleSvgMarkupChange(e.target.value)}
                  rows={6}
                  placeholder={"<svg viewBox='0 0 100 100'><circle cx='50' cy='50' r='50'/></svg>"}
                />
              </div>
            )}

            {currentElement.shape === 'image' && (
              <div className="flex flex-col gap-4 p-4 rounded border border-[color-mix(in_oklab,var(--nui-info,oklch(54.6%_.245_262.881))_35%,transparent)] bg-[color-mix(in_oklab,var(--nui-info,oklch(54.6%_.245_262.881))_8%,white)] dark:bg-[color-mix(in_oklab,var(--nui-info-dark,oklch(62.3%_.214_259.815))_12%,transparent)]">
                <h4 className="font-semibold text-sm">Imagen (base64)</h4>
                <p className={`text-xs ${text.info}`}>
                  El archivo se incrusta como data URI dentro del JSON, así que la
                  librería y los mapas que la usen no dependen de ningún servidor.
                </p>

                <Input
                  type="file"
                  label="Archivo de imagen"
                  accept={IMAGE_ACCEPT}
                  onChange={(e) => handleImageFile(e.target.files?.[0])}
                  error={imageError ?? undefined}
                  helperText="PNG · JPG · WEBP · GIF · AVIF"
                />

                <Select
                  label="Ajuste dentro de la caja"
                  options={[
                    { value: 'xMidYMid meet', label: 'Contener (mantiene proporción)' },
                    { value: 'xMidYMid slice', label: 'Cubrir (recorta sobrante)' },
                    { value: 'none', label: 'Estirar (deforma)' },
                  ]}
                  value={currentElement.preserveAspectRatio || 'xMidYMid meet'}
                  onChange={(e) => handleFieldChange('preserveAspectRatio', e.target.value)}
                />

                {currentElement.imageSrc && (
                  <div className="flex items-center gap-3">
                    <img
                      src={currentElement.imageSrc}
                      alt="Vista previa"
                      className={`w-16 h-16 object-contain border ${border.subtle} rounded bg-white`}
                    />
                    <div className="flex flex-col gap-1 text-xs">
                      <span className={`${text.subtle}`}>
                        {(dataUriBytes(currentElement.imageSrc) / 1024).toFixed(0)} KB incrustados
                      </span>
                      {dataUriBytes(currentElement.imageSrc) > IMAGE_WARN_BYTES && (
                        <span className={`${text.warning}`}>
                          Imagen pesada: agranda el JSON de todos los mapas que la usen.
                        </span>
                      )}
                      <button
                        type="button"
                        className={`${text.danger} hover:${text.danger} text-left rounded ${FOCUS_CLS}`}
                        onClick={() => { handleFieldChange('imageSrc', undefined); setImageError(null); }}
                      >
                        Quitar imagen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={`flex justify-end gap-2 mt-4 pt-4 border-t ${border.subtle}`}>
              <Button onClick={handleSaveElement}>Save Changes to Element</Button>
            </div>
          </div>
        ) : (
          <div className={`flex items-center justify-center h-full ${text.subtle}`}>
            Select an element to edit or add a new one.
          </div>
        )}
      </div>
      </div>

      {/* output section */}
      <div className={cn(
        'flex flex-col gap-2',
        stackOutput
          ? `w-full shrink-0 border-t ${border.subtle} pt-4`
          : `w-1/3 shrink-0 min-h-0 border-l ${border.subtle} pl-4 h-full max-h-full`,
      )}>
        <div className={`flex gap-2 shrink-0 ${stackAll ? 'flex-col items-stretch' : 'items-center justify-between'}`}>
          <h3 className="font-bold">Output JSON</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              value={downloadFileName}
              onChange={(e) => setDownloadFileName(e.target.value)}
              placeholder="filename"
              title="Filename without extension"
            />
            <span className={`text-xs ${text.subtle}`}>.json</span>
            <Button
              variant="secondary"
              onClick={handleDownload}
              title="Download JSON file"
            >
              Descargar
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(generatedLib)}
            >
              Copy
            </Button>
          </div>
        </div>
        {/* La altura se fija con `rows`, no con `h-full`: el <textarea> vive
            dentro del wrapper de `TextArea`, que no tiene altura definida, así
            que `h-full` se resolvía como `auto` y dejaba el JSON en dos líneas. */}
        <div className={`pb-4 ${stackOutput ? '' : 'flex-1 min-h-0 overflow-hidden'}`}>
          <TextArea
            readOnly
            rows={stackOutput ? 12 : 22}
            className={`resize-none font-mono text-xs ${text.success} ${bg.surfaceMuted} ${border.subtle}`}
            value={generatedLib}
          />
        </div>
      </div>
    </div>
  );
};
