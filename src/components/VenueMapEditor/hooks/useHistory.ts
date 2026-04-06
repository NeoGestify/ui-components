import { useState, useCallback } from 'react';
import type { VenueMap } from '../types';

const MAX_HISTORY = 50;

interface HistoryState {
  past: VenueMap[];
  present: VenueMap;
  future: VenueMap[];
}

/**
 * Undo/redo stack for VenueMap snapshots.
 *
 * - `push(next)`  : commit a new state (clears redo stack)
 * - `undo()`      : step back one snapshot
 * - `redo()`      : step forward one snapshot
 * - `replace(next)`: update present WITHOUT pushing to history (e.g. live-drag)
 */
export function useHistory(initial: VenueMap) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initial,
    future: [],
  });

  /** Commit a new state — adds present to `past`, clears `future`. */
  const push = useCallback((next: VenueMap) => {
    setHistory(h => ({
      past: [...h.past.slice(-(MAX_HISTORY - 1)), h.present],
      present: next,
      future: [],
    }));
  }, []);

  /** Update present WITHOUT touching the undo stack (for live dragging). */
  const replace = useCallback((next: VenueMap) => {
    setHistory(h => ({ ...h, present: next }));
  }, []);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(h => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      return {
        past: [...h.past, h.present],
        present: next,
        future: h.future.slice(1),
      };
    });
  }, []);

  return {
    map: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    push,
    replace,
    undo,
    redo,
  };
}
