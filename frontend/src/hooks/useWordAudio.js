/**
 * useWordAudio
 *
 * Plays the Punjabi pronunciation for a practice word via
 * GET /api/words/tts/{wordId}.
 *
 * Unlike letter audio (all ~124 files preloaded en masse on app start), the
 * word library has ~1,700 files, so preloading everything upfront would be
 * wasteful. Instead:
 *   - `play(id)`      fetches lazily on first play, then caches for the page.
 *   - `preload(ids)`  warms the cache for just the deck the user entered
 *                     (a handful of words), deferred to idle time — so the
 *                     first tap on each card in the session is instant without
 *                     ever downloading the whole library.
 */

import { useCallback } from 'react';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

/** Blob-URL cache keyed by word id — survives for the page lifetime. */
const _cache = new Map();
/** In-flight fetches, so a concurrent play + preload of the same word share one request. */
const _inflight = new Map();

/** How many word-audio fetches run in parallel during a deck preload. */
const PRELOAD_CONCURRENCY = 4;

/**
 * Fetch one word's audio into the cache. Returns the Blob-URL (or null on
 * failure). No-ops if already cached; dedupes concurrent requests for the
 * same word so we never fetch the same file twice at once.
 */
function fetchIntoCache(wordId) {
  if (_cache.has(wordId)) return Promise.resolve(_cache.get(wordId));
  if (_inflight.has(wordId)) return _inflight.get(wordId);

  const p = (async () => {
    try {
      const res = await fetch(`${API}/words/tts/${wordId}`);
      if (!res.ok) return null;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      _cache.set(wordId, url);
      return url;
    } catch (e) {
      return null; // network error – play() will retry live on next tap
    } finally {
      _inflight.delete(wordId);
    }
  })();

  _inflight.set(wordId, p);
  return p;
}

export function useWordAudio() {
  const play = useCallback(async (wordId) => {
    const cached = _cache.get(wordId);
    if (cached) {
      new Audio(cached).play().catch(() => {});
      return;
    }
    const url = await fetchIntoCache(wordId);
    if (url) new Audio(url).play().catch(() => {});
  }, []);

  /**
   * Warm the cache for a specific set of words (the active deck). Runs at
   * browser idle with a small concurrency cap so it never competes with
   * rendering the first card. Fetches follow the given order, so the words
   * that appear first are ready first.
   */
  const preload = useCallback((wordIds) => {
    if (!Array.isArray(wordIds)) return;
    const todo = wordIds.filter((id) => id && !_cache.has(id));
    if (todo.length === 0) return;

    let idx = 0;
    async function worker() {
      while (idx < todo.length) {
        await fetchIntoCache(todo[idx++]);
      }
    }
    const run = () => {
      for (let i = 0; i < Math.min(PRELOAD_CONCURRENCY, todo.length); i++) worker();
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: 2000 });
    } else {
      setTimeout(run, 500);
    }
  }, []);

  return { play, preload };
}
