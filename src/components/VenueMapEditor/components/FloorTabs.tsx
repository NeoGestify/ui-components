import { useState, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { useCoarsePointer } from '../hooks/usePointerCapabilities';
import type { Floor } from '../types';
import { bg, border, borderHover, focusVisibleRing, text, textHover } from '../../../theme/tokens';
import { motion } from '../../../theme/motion';

/**
 * Indicador de foco compartido. `focus-visible` para que el anillo aparezca al
 * navegar con teclado pero no al pulsar con el ratón.
 */
const FOCUS_CLS =
  focusVisibleRing;

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

  /** Patrón `tablist`: flechas para moverse, F2 para renombrar. */
  const handleTabKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>, floor: Floor, idx: number) => {
    const list = floors.slice().sort((a, b) => a.order - b.order);
    // El foco se mueve a mano: al cambiar de pestaña la anterior pasa a
    // tabIndex -1 y el foco se quedaría en un elemento ya no tabulable.
    const focusTab = (i: number) => {
      const tabs = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]');
      tabs?.[i]?.focus();
    };
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = idx + (e.key === 'ArrowLeft' ? -1 : 1);
      if (list[nextIdx]) { onSelect(list[nextIdx].id); focusTab(nextIdx); }
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const nextIdx = e.key === 'Home' ? 0 : list.length - 1;
      onSelect(list[nextIdx].id);
      focusTab(nextIdx);
    } else if (e.key === 'F2') {
      e.preventDefault();
      startEditing(floor);
    }
  }, [floors, onSelect, startEditing]);

  return (
    <div
      role="tablist"
      aria-label="Plantas"
      className={`flex items-center gap-1 px-2 py-1 border-b ${border.subtle} ${bg.surfaceMuted} text-xs overflow-x-auto shrink-0`}
    >
      {sorted.map(floor => {
        const isActive = floor.id === activeFloorId;
        const idx = sorted.indexOf(floor);
        const canMoveLeft = idx > 0;
        const canMoveRight = idx < sorted.length - 1;

        return (
          <div
            key={floor.id}
            role="tab"
            aria-selected={isActive}
            // Tabulador itinerante: solo la pestaña activa entra en el orden de
            // tabulación; entre pestañas se navega con las flechas.
            tabIndex={isActive ? 0 : -1}
            className={[
              `flex items-center gap-0.5 px-2 rounded-t border ${motion.colors} shrink-0`,
              FOCUS_CLS,
              coarse ? 'py-2' : 'py-1',
              isActive
                ? `${bg.surface} ${border.base} ${text.base} font-medium`
                : `border-transparent ${text.subtle} ${textHover.muted} cursor-pointer`,
            ].join(' ')}
            onClick={() => !isActive && onSelect(floor.id)}
            onKeyDown={e => handleTabKeyDown(e, floor, idx)}
          >
            {!readOnly && isActive && canMoveLeft && (
              <button
                type="button"
                className={`rounded ${text.subtle} ${textHover.muted} leading-none ${FOCUS_CLS} ${coarse ? 'px-2 py-1' : 'px-0.5'}`}
                onClick={e => { e.stopPropagation(); onReorder(floor.id, 'left'); }}
                title="Mover a la izquierda"
                aria-label={`Mover ${floor.name} a la izquierda`}
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
                aria-label="Nombre de la planta"
                className={`w-24 border ${border.accent} rounded px-1 text-xs ${bg.surface} ${text.base} ${FOCUS_CLS}`}
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
                type="button"
                className={`rounded ${text.subtle} ${textHover.muted} leading-none ${FOCUS_CLS} ${coarse ? 'px-2 py-1' : 'px-0.5'}`}
                onClick={e => { e.stopPropagation(); onReorder(floor.id, 'right'); }}
                title="Mover a la derecha"
                aria-label={`Mover ${floor.name} a la derecha`}
              >
                ▶
              </button>
            )}

            {!readOnly && floors.length > 1 && (
              <button
                type="button"
                className={`rounded ${text.subtle} ${textHover.danger} leading-none ${FOCUS_CLS} ${coarse ? 'px-2 py-1' : 'px-0.5'}`}
                onClick={e => { e.stopPropagation(); onDelete(floor.id); }}
                title="Eliminar planta"
                aria-label={`Eliminar ${floor.name}`}
              >
                ×
              </button>
            )}
          </div>
        );
      })}

      {!readOnly && (
        <button
          type="button"
          className={`flex items-center justify-center ${coarse ? 'w-9 h-9' : 'w-6 h-6'} rounded border border-dashed ${border.base} ${text.subtle} ${borderHover.accent} ${textHover.accent} ${motion.colors} shrink-0 ${FOCUS_CLS}`}
          onClick={onAdd}
          title="Añadir planta"
          aria-label="Añadir planta"
        >
          +
        </button>
      )}
    </div>
  );
}
