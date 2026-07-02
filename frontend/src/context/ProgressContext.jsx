import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { preloadAllAudio } from '../utils/audioPreloader';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState({});
  const [alphabet, setAlphabet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [alphaRes, progRes] = await Promise.all([
          axios.get(`${API}/alphabet`),
          axios.get(`${API}/progress`),
        ]);
        setAlphabet(alphaRes.data);
        setProgress(progRes.data);

        // Pre-load all audio in the background so playback is instant
        preloadAllAudio(alphaRes.data).then(() => setAudioReady(true));
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
    if (history.length === 0) return 'new';
    const last10 = history.slice(-10);
    const correct = last10.filter(Boolean).length;
    const wrong = last10.length - correct;
    if (last10.length >= 10 && correct === 10) return 'mastered';
    if (wrong > 3) return 'struggling';
    return 'learning';
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
