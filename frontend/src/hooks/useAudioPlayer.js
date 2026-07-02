/**
 * useAudioPlayer
 *
 * Plays audio for a given letter. Checks the in-memory audioPreloader cache
 * first so playback is instant when the file was pre-loaded on app start.
 * Falls back to a live fetch if the file isn't cached yet.
 *
 * play(letterId, voiceType?)
 *   voiceType: 'human' | 'ai'  (required – pass explicitly from the button clicked)
 */

import { useCallback } from 'react';
import { getCachedAudio } from '../utils/audioPreloader';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useAudioPlayer() {
  const play = useCallback(async (letterId, voiceType = 'auto') => {
    // Check in-memory preloader cache first (instant playback)
    const cachedUrl = getCachedAudio(letterId, voiceType);
    if (cachedUrl) {
      const audio = new Audio(cachedUrl);
      audio.play().catch(() => {}); // ignore autoplay policy errors
      return;
    }

    // Cache miss – fetch live (also benefits from browser HTTP cache)
    try {
      const response = await fetch(`${API}/tts/${letterId}?type=${voiceType}`);
      if (!response.ok) return;
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play().catch(() => {});
      audio.onended = () => URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  }, []);

  return { play };
}
