/**
 * useSavedSelections
 *
 * Named, reusable word selections, persisted per profile in localStorage so a
 * user can save a set of words on the selection screen and practice the exact
 * same set again later.
 *
 * Shape stored: [{ id, name, category, ids: [...], createdAt }]
 */

import { useState, useCallback } from 'react';
import { useProfile } from '../context/ProfileContext';

const keyFor = (profileId) => `wordSelections:${profileId || 'default'}`;

function read(profileId) {
  try {
    const raw = localStorage.getItem(keyFor(profileId));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(profileId, list) {
  try { localStorage.setItem(keyFor(profileId), JSON.stringify(list)); } catch { /* ignore */ }
}

export function useSavedSelections() {
  const { activeProfileId } = useProfile();
  const [selections, setSelections] = useState(() => read(activeProfileId));

  const refresh = useCallback(() => setSelections(read(activeProfileId)), [activeProfileId]);

  const save = useCallback((name, ids, category = null) => {
    const cleanName = (name || '').trim() || `Set of ${ids.length}`;
    const entry = {
      id: `sel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: cleanName,
      category,
      ids: [...ids],
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...read(activeProfileId)];
    write(activeProfileId, next);
    setSelections(next);
    return entry;
  }, [activeProfileId]);

  const remove = useCallback((id) => {
    const next = read(activeProfileId).filter((s) => s.id !== id);
    write(activeProfileId, next);
    setSelections(next);
  }, [activeProfileId]);

  return { selections, save, remove, refresh };
}
