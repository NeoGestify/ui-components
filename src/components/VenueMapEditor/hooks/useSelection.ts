import { useState, useCallback } from 'react';

/**
 * Selection state for map elements.
 *
 * - `select(id, multi)` : select an element; if `multi`, toggle it
 * - `selectSet(ids)`    : replace selection with a set of ids
 * - `clear()`           : deselect everything
 * - `isSelected(id)`    : check membership
 */
export function useSelection() {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());

  const select = useCallback((id: string, multi = false) => {
    setSelectedIds(prev => {
      if (multi) {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      // Single select: only switch if not already the sole selection
      if (prev.size === 1 && prev.has(id)) return prev;
      return new Set([id]);
    });
  }, []);

  const selectSet = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(prev => (prev.size === 0 ? prev : new Set()));
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  return { selectedIds, select, selectSet, clear, isSelected };
}
