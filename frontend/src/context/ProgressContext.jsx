import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { preloadAllAudio } from '../utils/audioPreloader';
import { computeMastery } from '../utils/mastery';
import { useProfile } from './ProfileContext';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { activeProfileId } = useProfile();
  const [progress, setProgress] = useState({});
  const [alphabet, setAlphabet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioReady, setAudioReady] = useState(false);

  // Load the static alphabet once on mount. It does not depend on the active
  // profile, so fetching it here — rather than inside the profile-scoped effect
  // below — lets the letter list (and its audio) start downloading while the
  // user is still on the profile-selection screen, instead of waiting until a
  // profile is chosen.
  useEffect(() => {
    let cancelled = false;
    async function loadAlphabet() {
      try {
        const { data } = await axios.get(`${API}/alphabet`);
        if (cancelled) return;
        setAlphabet(data);

        // Pre-load all audio, but defer the burst of ~124 fetches until the
        // browser is idle so it doesn't compete with first paint, fonts, and
        // the profile/progress requests. Playback still falls back to a live
        // fetch for anything not yet cached, so nothing breaks if this is slow.
        const startPreload = () =>
          preloadAllAudio(data).then(() => { if (!cancelled) setAudioReady(true); });
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(startPreload, { timeout: 3000 });
        } else {
          setTimeout(startPreload, 1200);
        }
      } catch (e) {
        console.error('Failed to load alphabet', e);
      }
    }
    loadAlphabet();
    return () => { cancelled = true; };
  }, []);

  // Reload progress whenever the active profile changes. The X-Profile-Id
  // axios header is already published by ProfileContext, so this request is
  // scoped to the active profile.
  useEffect(() => {
    if (!activeProfileId) {
      setProgress({});
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    async function loadProgress() {
      try {
        const { data } = await axios.get(`${API}/progress`);
        if (cancelled) return;
        setProgress(data);
      } catch (e) {
        console.error('Failed to load progress', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProgress();
    return () => { cancelled = true; };
  }, [activeProfileId]);

  const updateProgress = useCallback(async (letterId, correct) => {
    // Optimistic update
    setProgress(prev => {
      const current = prev[letterId]?.history || [];
      const updated = [...current, correct].slice(-50);
      return { ...prev, [letterId]: { history: updated } };
    });
    try {
      await axios.post(`${API}/progress/update`, { letter_id: letterId, correct });
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }, []);

  const resetProgress = useCallback(async () => {
    await axios.post(`${API}/progress/reset`);
    setProgress({});
  }, []);

  const getMastery = useCallback((letterId) => {
    const history = progress[letterId]?.history || [];
    return computeMastery(history);
  }, [progress]);

  return (
    <ProgressContext.Provider value={{ alphabet, progress, loading, audioReady, updateProgress, resetProgress, getMastery }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
