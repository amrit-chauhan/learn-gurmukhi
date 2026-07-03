/**
 * ProfileContext
 *
 * Holds the list of selectable profiles and the currently active one.
 *
 * The profiles themselves — and all of their progress/stats — live on the
 * server (MongoDB) and are shared across every device/browser that reaches
 * this deployment; they are NOT local to one browser. The only thing stored
 * locally is the *active profile id* (in localStorage, mirroring
 * SettingsContext), purely so a returning visitor on the same browser skips
 * the selection screen. Clearing browser storage loses only that shortcut,
 * never the profile or its progress.
 *
 * The active profile id is also published as the default axios
 * `X-Profile-Id` header so every API call (progress, stats, streak) is
 * scoped to the active profile without each caller having to pass it.
 * It is set synchronously during render so it is in place before any
 * child context's data-loading effect fires.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
const STORAGE_KEY = 'punjabi_active_profile_id';
const HEADER = 'X-Profile-Id';

// Preset avatars the user can choose from when editing a profile.
// Single-codepoint emoji only (no ZWJ/skin-tone sequences) for consistent
// cross-platform rendering.
export const AVATAR_OPTIONS = [
  // Animals & creatures
  '🦚', '🦁', '🦋', '🐯', '🦊', '🐼', '🦉', '🐸',
  '🐨', '🦄', '🐵', '🐧', '🐳', '🐶', '🐱', '🐭',
  '🐹', '🐰', '🐻', '🐷', '🐮', '🐔', '🐣', '🦝',
  '🐗', '🐴', '🦓', '🦌', '🐢', '🐙', '🦈', '🐬',
  '🐟', '🐝', '🐞', '🦔', '🐺', '🦇', '🦥', '🦦',
  '🦜', '🦢', '🦩', '🦡', '🦫', '🦙', '🦛', '🐘',
  '🦒', '🐊', '🦀', '🦑', '🦖', '🦕', '🐲', '🦭',
  // Nature & sky
  '🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌈', '⭐',
  '🌟', '✨', '🌙', '☀️', '⚡', '🔥', '🌊', '❄️',
  '🍀', '🌵', '🍄', '🌴', '🍁',
  // Characters, objects & treats
  '🦸', '🦹', '🧙', '🧚', '🤖', '👻', '👽', '🎃',
  '🥳', '😎', '🤠', '🚀', '🎈', '🎸', '🎨', '🎧',
  '🎯', '💎', '👑', '🏆', '⚽', '🪁', '🎮', '🍎',
  '🍕', '🍩', '🍓', '🍦', '🍪', '🌮',
];

function loadActiveProfileId() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch (e) {
    return null;
  }
}

function persistActiveProfileId(id) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* localStorage unavailable */ }
}

function applyHeader(id) {
  if (id) axios.defaults.headers.common[HEADER] = id;
  else delete axios.defaults.headers.common[HEADER];
}

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(loadActiveProfileId);
  const [loading, setLoading] = useState(true);

  // Publish the header synchronously on every render so it is present before
  // any child provider's fetch effect runs.
  applyHeader(activeProfileId);

  // Fetch the profile list once on mount.
  useEffect(() => {
    let cancelled = false;
    axios.get(`${API}/profiles`)
      .then(({ data }) => {
        if (cancelled) return;
        setProfiles(data);
        // If the stored active id no longer exists, drop it.
        setActiveProfileId(prev => {
          if (prev && !data.some(p => p.id === prev)) {
            persistActiveProfileId(null);
            return null;
          }
          return prev;
        });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const selectProfile = useCallback((id) => {
    applyHeader(id);
    persistActiveProfileId(id);
    setActiveProfileId(id);
  }, []);

  const clearActiveProfile = useCallback(() => {
    applyHeader(null);
    persistActiveProfileId(null);
    setActiveProfileId(null);
  }, []);

  const updateProfile = useCallback(async (id, updates) => {
    const { data } = await axios.patch(`${API}/profiles/${id}`, updates);
    setProfiles(prev => prev.map(p => (p.id === id ? data : p)));
    return data;
  }, []);

  const resetProfile = useCallback(async (id) => {
    await axios.post(`${API}/profiles/${id}/reset`);
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        activeProfileId,
        loading,
        selectProfile,
        clearActiveProfile,
        updateProfile,
        resetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
