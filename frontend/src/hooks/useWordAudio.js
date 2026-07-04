/**
 * useWordAudio
 *
 * Plays the Punjabi pronunciation for a practice word via
 * GET /api/words/tts/{wordId}. Unlike the letter audio (which is preloaded
 * en masse on app start), word audio is fetched lazily on first play and then
 * cached as a Blob-URL for the lifetime of the page — there can be hundreds of
 * words, so preloading them all upfront would be wasteful.
 */

import { useCallback } from 'react';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

/** Blob-URL cache keyed by word id — survives for the page lifetime. */
const _cache = new Map();

export function useWordAudio() {
  const play = useCallback(async (wordId) => {
    const cached = _cache.get(wordId);
    if (cached) {
      new Audio(cached).play().catch(() => {});
      return;
    }
    try {
      const res = await fetch(`${API}/words/tts/${wordId}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      _cache.set(wordId, url);
      new Audio(url).play().catch(() => {});
    } catch (e) {
      console.error('Word audio playback error:', e);
    }
  }, []);

  return { play };
}
