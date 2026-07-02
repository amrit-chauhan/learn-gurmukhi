/**
 * useLetterSelection
 *
 * Manages the set of selected letter ids for the letter-selection screen.
 * Provides toggle, selectAll (for a filtered subset), deselectAll, and
 * applyDrag (for the drag-to-select gesture).
 */

import { useState, useCallback } from 'react';

export function useLetterSelection() {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggle = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /**
   * Apply a drag gesture to a letter.
   * mode: 'select' → add the letter; 'deselect' → remove the letter.
   * No-ops if the letter is already in the desired state (avoids thrash).
   */
  const applyDrag = useCallback((id, mode) => {
    setSelectedIds((prev) => {
      if (mode === 'select' && prev.has(id)) return prev;
      if (mode === 'deselect' && !prev.has(id)) return prev;
      const next = new Set(prev);
      if (mode === 'select') next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((letters) => {
    setSelectedIds(new Set(letters.map((l) => l.id)));
  }, []);

  /** Deselect only the letters in the provided subset (respects other selections). */
  const deselectAll = useCallback((letters) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      letters.forEach((l) => next.delete(l.id));
      return next;
    });
  }, []);

  const isAllSelected = useCallback(
    (letters) => letters.length > 0 && letters.every((l) => selectedIds.has(l.id)),
    [selectedIds]
  );

  return { selectedIds, toggle, applyDrag, selectAll, deselectAll, isAllSelected };
}
