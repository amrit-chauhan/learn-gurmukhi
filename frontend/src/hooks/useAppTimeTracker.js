/**
 * useAppTimeTracker
 *
 * Tracks time the user spends with the app tab active/focused.
 * - Pauses automatically when the tab is hidden (Page Visibility API)
 * - Flushes accumulated seconds to the backend every 30 s
 * - Sends remaining seconds on page hide (tab close / navigation) via sendBeacon
 *
 * Mount this hook inside a component that is always present in the tree
 * (e.g. a thin <AppTimeTracker /> wrapper rendered alongside <Routes>).
 */

import { useEffect, useRef } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const FLUSH_INTERVAL_MS = 30_000;

export function useAppTimeTracker() {
  const startRef  = useRef(null); // timestamp (ms) when current visible span started
  const pendingRef = useRef(0);   // accumulated seconds not yet sent to backend

  useEffect(() => {
    // ── helpers ──────────────────────────────────────────────────────────
    function pause() {
      if (!startRef.current) return;
      pendingRef.current += (Date.now() - startRef.current) / 1000;
      startRef.current = null;
    }

    function resume() {
      if (startRef.current) return; // already running
      startRef.current = Date.now();
    }

    async function flushAsync(seconds) {
      const rounded = Math.round(seconds);
      if (rounded <= 0) return;
      try {
        await axios.post(`${API}/stats/update`, { app_seconds: rounded, practice_seconds: 0 });
      } catch (_) {
        // non-critical – silently swallow
      }
    }

    // ── start immediately if the tab is already visible ──────────────────
    if (document.visibilityState === 'visible') resume();

    // ── Page Visibility – pause / resume ─────────────────────────────────
    const onVisibility = () => {
      if (document.hidden) pause();
      else resume();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // ── Periodic flush every 30 s ─────────────────────────────────────────
    const interval = setInterval(() => {
      pause();
      const seconds = pendingRef.current;
      pendingRef.current = 0;
      flushAsync(seconds);
      resume();
    }, FLUSH_INTERVAL_MS);

    // ── Beacon on tab close / unload ──────────────────────────────────────
    const onPageHide = () => {
      pause();
      const seconds = Math.round(pendingRef.current);
      pendingRef.current = 0;
      if (seconds > 0) {
        const payload = new Blob(
          [JSON.stringify({ app_seconds: seconds, practice_seconds: 0 })],
          { type: 'application/json' }
        );
        // sendBeacon cannot set custom headers, so pass the active profile id
        // as a query param (the backend reads it as a fallback).
        const profileId = axios.defaults.headers.common['X-Profile-Id'];
        const url = profileId
          ? `${API}/stats/update?profile_id=${encodeURIComponent(profileId)}`
          : `${API}/stats/update`;
        navigator.sendBeacon(url, payload);
      }
    };
    window.addEventListener('pagehide', onPageHide);

    // ── Cleanup (React strict-mode unmount / hot reload) ──────────────────
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      clearInterval(interval);
      pause();
      const seconds = pendingRef.current;
      pendingRef.current = 0;
      flushAsync(seconds);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
