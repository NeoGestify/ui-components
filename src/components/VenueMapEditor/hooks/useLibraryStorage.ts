import { useState, useCallback } from 'react';
import type { ElementLibrary } from '../types';

/**
 * Persists an `ElementLibrary` in `localStorage` and exposes it as React state.
 *
 * - Initialises **synchronously** from localStorage so type definitions are
 *   available before the map renders (no flash of unknown element types).
 * - Gracefully degrades when localStorage is unavailable (SSR, private mode,
 *   storage quota exceeded) — falls back to plain in-memory state.
 *
 * @param storageKey  localStorage key to read/write.
 *                    Pass `''` or `undefined` to disable persistence entirely.
 */
export function useLibraryStorage(
  storageKey: string | undefined,
): [ElementLibrary, (libs: ElementLibrary) => void] {
  const [libs, setLibs] = useState<ElementLibrary>(() => {
    if (!storageKey) return {};
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as ElementLibrary) : {};
    } catch {
      return {};
    }
  });

  const setAndPersist = useCallback(
    (newLibs: ElementLibrary) => {
      setLibs(newLibs);
      if (!storageKey) return;
      try {
        if (Object.keys(newLibs).length === 0) {
          localStorage.removeItem(storageKey);
        } else {
          localStorage.setItem(storageKey, JSON.stringify(newLibs));
        }
      } catch {
        // localStorage unavailable — state update still works
      }
    },
    [storageKey],
  );

  return [libs, setAndPersist];
}
