/**
 * audioPreloader.js
 *
 * Module-level audio cache. Audio files are fetched once on app startup and
 * stored as Blob-URLs so every subsequent play is instant (no network wait).
 *
 * Browser HTTP caching (Cache-Control: immutable) means repeated page loads
 * are also instant once the browser has stored the files.
 *
 * Cache key format: `${letterId}|${voiceType}`
 * Voice types:      'human' | 'ai'
 */

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

/** Blob-URL cache – survives for the lifetime of the page */
const _cache = new Map();

/** How many fetches can run in parallel (avoid hammering the server) */
const CONCURRENCY = 6;

/**
 * Returns the cached Blob-URL for (letterId, voiceType), or null if not ready yet.
 * @param {string} letterId
 * @param {'human'|'ai'} voiceType
 * @returns {string|null}
 */
export function getCachedAudio(letterId, voiceType) {
  return _cache.get(`${letterId}|${voiceType}`) ?? null;
}

/**
 * Fetch a single audio file and store it in the cache.
 * Silently ignores errors (e.g. 404 when type=human has no file).
 */
async function _preloadOne(letterId, voiceType) {
  const key = `${letterId}|${voiceType}`;
  if (_cache.has(key)) return;
  try {
    const res = await fetch(`${API}/tts/${letterId}?type=${voiceType}`);
    if (!res.ok) return;
    const blob = await res.blob();
    _cache.set(key, URL.createObjectURL(blob));
  } catch {
    // network error – ignore, will fall back to live fetch on play
  }
}

/**
 * Pre-load all audio for the given alphabet array.
 * Schedules fetches in parallel with a concurrency cap.
 *
 * @param {Array<{id: string, has_human_audio: boolean}>} alphabet
 * @returns {Promise<void>} resolves when all fetches finish (or fail)
 */
export async function preloadAllAudio(alphabet) {
  // Build the list of (letterId, voiceType) pairs to fetch
  const tasks = [];
  for (const letter of alphabet) {
    if (letter.has_human_audio) {
      tasks.push([letter.id, 'human']);
    }
    tasks.push([letter.id, 'ai']);
  }

  // Run with CONCURRENCY limit using a simple pool
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const [id, type] = tasks[idx++];
      await _preloadOne(id, type);
    }
  }

  await Promise.allSettled(
    Array.from({ length: CONCURRENCY }, () => worker())
  );
}
