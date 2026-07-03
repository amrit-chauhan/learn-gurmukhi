/**
 * usePracticeTimeTracker
 *
 * Tracks active practice time for a single study session.
 * - Starts timing the moment the Study page mounts
 * - Flushes elapsed seconds to the backend when `done` becomes true
 * - Also flushes on unmount (user navigated away before finishing)
 * - A flushedRef guard ensures we never double-count a session
 */

import { useEffect, useRef } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

export function usePracticeTimeTracker(done) {
  const startRef   = useRef(Date.now());
  const flushedRef = useRef(false);

  useEffect(() => {
    async function flush() {
      if (flushedRef.current) return;
      flushedRef.current = true;
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      if (seconds <= 0) return;
      try {
        await axios.post(`${API}/stats/update`, { app_seconds: 0, practice_seconds: seconds });
      } catch (_) {
        // non-critical – silently swallow
      }
    }

    if (done) flush();

    return () => { flush(); };
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps
}
