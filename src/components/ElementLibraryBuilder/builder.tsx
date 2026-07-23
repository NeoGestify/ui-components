import React, { useState, useMemo } from 'react';
import { ElementShape, ElementTypeDef, ElementLibrary } from '../VenueMapEditor/types';
import { Button, Input, Select, TextArea } from '../html';

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
];

export const ElementLibraryBuilder: React.FC = () => {
  const [groups, setGroups] = useState<InternalGroup[]>([
    { internalId: crypto.randomUUID(), name: 'defaultGroup', objects: [] }
  ]);
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0].internalId);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(null);
  const [currentElement, setCurrentElement] = useState<ElementTypeDef>({ ...DEFAULT_ELEMENT, id: 'rect_1', label: 'New Rect' });
  const [downloadFileName, setDownloadFileName] = useState<string>("libraries");

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
    <div className="flex gap-4 p-4 h-full min-h-[600px] text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900">
      {/* Sidebar columns for Groups and Elements */}
      <div className="w-1/4 flex flex-col gap-4 border-r dark:border-gray-700 pr-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Libraries (Groups)</h3>
            <Button variant='primary' onClick={handleAddGroup}>+ Group</Button>
          </div>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div
                key={group.internalId}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${activeGroupId === group.internalId ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
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
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveGroup(group.internalId); }} className="text-red-500 text-xs">x</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <hr className="dark:border-gray-700" />

        <div className="flex flex-col gap-2 flex-grow overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Elements in {activeGroup?.name || '?'}</h3>
            <Button variant='secondary' onClick={handleAddElement} disabled={!activeGroup}>+ Element</Button>
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto flex-grow pr-1">
            {activeGroup?.objects.map((el, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${activeElementIndex === i ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => handleSelectElement(i)}
              >
                <span>{el.id} ({el.shape})</span>
                <button onClick={(e) => { e.stopPropagation(); handleRemoveElement(i); }} className="text-red-500 text-xs">x</button>
              </div>
            ))}
            {(!activeGroup || activeGroup.objects.length === 0) && (
              <span className="text-gray-400 dark:text-gray-500 italic text-xs">No elements yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div className="flex-1 flex flex-col gap-4 px-2 overflow-y-auto">
        <h3 className="font-bold text-lg">Element Editor</h3>
        {activeElementIndex !== null ? (
          <div className="flex flex-col gap-4 w-full max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Fill Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-8 h-8 cursor-pointer rounded"
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
                <label className="text-xs font-semibold text-gray-700">Stroke Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-8 h-8 cursor-pointer rounded"
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

            {currentElement.shape === 'path' && (
              <div className="flex flex-col gap-4 border dark:border-gray-700 p-4 rounded bg-gray-50 dark:bg-gray-800/50">
                <h4 className="font-semibold text-sm">Path Config</h4>
                <div className="grid grid-cols-2 gap-4">
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
              <div className="flex flex-col gap-4 border dark:border-amber-700/50 p-4 rounded bg-amber-50 dark:bg-amber-900/10">
                <h4 className="font-semibold text-sm">SVG Markup (Autosanitized)</h4>
                <p className="text-xs text-amber-800 dark:text-amber-400">
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

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-gray-700">
              <Button onClick={handleSaveElement}>Save Changes to Element</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select an element to edit or add a new one.
          </div>
        )}
      </div>

      {/* output section */}
      <div className="w-1/3 flex flex-col gap-2 border-l dark:border-gray-700 pl-4 h-full max-h-full">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="font-bold">Output JSON</h3>
          <div className="flex items-center gap-2">
            <Input
              value={downloadFileName}
              onChange={(e) => setDownloadFileName(e.target.value)}
              placeholder="filename"
              title="Filename without extension"
            />
            <span className="text-xs text-gray-500">.json</span>
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
        <div className="flex-1 overflow-hidden h-full pb-4">
          <TextArea
            readOnly
            className="h-full resize-none font-mono text-xs text-green-600 dark:text-green-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            value={generatedLib}
          />
        </div>
      </div>
    </div>
  );
};
