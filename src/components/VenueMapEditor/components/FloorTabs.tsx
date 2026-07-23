import { useState, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { useCoarsePointer } from '../hooks/usePointerCapabilities';
import type { Floor } from '../types';

interface FloorTabsProps {
  floors: Floor[];
  activeFloorId: string;
  readOnly: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: 'left' | 'right') => void;
}

export function FloorTabs({
  floors,
  activeFloorId,
  readOnly,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onReorder,
}: FloorTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const coarse = useCoarsePointer();

  const sorted = floors.slice().sort((a, b) => a.order - b.order);

  const startEditing = useCallback((floor: Floor) => {
    if (readOnly) return;
    setEditingId(floor.id);
    setEditValue(floor.name);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [readOnly]);

  const commitEdit = useCallback(() => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  }, [editingId, editValue, onRename]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  // Con el dedo `dblclick` no es fiable, así que el doble toque se detecta a
  // mano para poder renombrar una planta en táctil.
  const lastTap = useRef<{ id: string; t: number } | null>(null);
  const handleTabTap = useCallback((floor: Floor) => {
    const now = Date.now();
    const prev = lastTap.current;
    if (prev && prev.id === floor.id && now - prev.t < 300) {
      lastTap.current = null;
      startEditing(floor);
      return;
    }
    lastTap.current = { id: floor.id, t: now };
  }, [startEditing]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
  }, [commitEdit, cancelEdit]);

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs overflow-x-auto shrink-0">
      {sorted.map(floor => {
        const isActive = floor.id === activeFloorId;
        const idx = sorted.indexOf(floor);
        const canMoveLeft = idx > 0;
        const canMoveRight = idx < sorted.length - 1;

        return (
          <div
            key={floor.id}
            className={[
              'flex items-center gap-0.5 px-2 rounded-t border transition-colors shrink-0',
              coarse ? 'py-2' : 'py-1',
              isActive
                ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 font-medium'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer',
            ].join(' ')}
            onClick={() => !isActive && onSelect(floor.id)}
          >
            {!readOnly && isActive && canMoveLeft && (
              <button
                className={`text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 leading-none ${coarse ? 'px-2 py-1' : 'px-0.5'}`}
                onClick={e => { e.stopPropagation(); onReorder(floor.id, 'left'); }}
                title="Mover a la izquierda"
              >
                ◀
              </button>
            )}

            {editingId === floor.id ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
                className="w-24 border border-blue-400 rounded px-1 text-xs outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            ) : (
              <span
                onDoubleClick={e => { e.stopPropagation(); startEditing(floor); }}
                onPointerDown={e => { if (e.pointerType === 'touch') handleTabTap(floor); }}
                className="select-none"
              >
                {floor.name}
              </span>
            )}

            {!readOnly && isActive && canMoveRight && (
              <button
                className={`text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 leading-none ${coarse ? 'px-2 py-1' : 'px-0.5'}`}
                onClick={e => { e.stopPropagation(); onReorder(floor.id, 'right'); }}
                title="Mover a la derecha"
              >
                ▶
              </button>
            )}

            {!readOnly && floors.length > 1 && (
              <button
                className={`text-slate-400 dark:text-slate-500 hover:text-red-500 leading-none ${coarse ? 'px-2 py-1' : 'px-0.5'}`}
                onClick={e => { e.stopPropagation(); onDelete(floor.id); }}
                title="Eliminar planta"
              >
                ×
              </button>
            )}
          </div>
        );
      })}

      {!readOnly && (
        <button
          className={`flex items-center justify-center ${coarse ? 'w-9 h-9' : 'w-6 h-6'} rounded border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-colors shrink-0`}
          onClick={onAdd}
          title="Añadir planta"
        >
          +
        </button>
      )}
    </div>
  );
}
