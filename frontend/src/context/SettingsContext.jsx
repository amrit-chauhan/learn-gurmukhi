import React, { createContext, useContext, useState, useCallback } from 'react';

export const DEFAULT_SETTINGS = {
  srEnabled: false,
  weights: {
    new: 3,        // Never tried — moderate frequency to learn
    learning: 2,   // In progress — normal frequency
    struggling: 5, // >3 wrong in last 10 — high frequency
    mastered: 1,   // 10/10 in last 10 — low frequency (maintenance)
  },
  sessionMultiplier: 3, // Total cards = selected × this (SR mode only)
  avoidImmediateRepeat: true, // Don't show same letter back-to-back
  voicePreference: 'human', // 'human' = human when available (AI fallback) | 'ai' = always AI
};

const STORAGE_KEY = 'punjabi_learn_settings';

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const merged = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        weights: { ...DEFAULT_SETTINGS.weights, ...(parsed.weights || {}) },
      };
      // Migrate old default sessionMultiplier (1.5) to new default (3)
      if (merged.sessionMultiplier === 1.5) {
        merged.sessionMultiplier = 3;
      }
      return merged;
    }
  } catch (e) { /* localStorage unavailable */ }
  return DEFAULT_SETTINGS;
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  const updateSettings = useCallback((updates) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      if (updates.weights) {
        next.weights = { ...prev.weights, ...updates.weights };
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) { /* unavailable */ }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS)); } catch (e) { /* unavailable */ }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
