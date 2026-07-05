/**
 * useWords
 *
 * Fetches the practice-word vocabulary (common words, days, numbers 0-100)
 * from GET /api/words once and exposes it grouped by category.
 *
 * Words are static, so a module-level cache means the list is fetched only
 * once per page load no matter how many components use the hook.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

/** Display order + labels for the practice-word sections. */
export const WORD_CATEGORIES = [
  { id: 'common',      label: 'Common Words',        desc: 'Everyday Punjabi essentials' },
  { id: 'more_common', label: 'More Common Words',   desc: 'Broader everyday vocabulary' },
  { id: 'songs',       label: 'Words from Songs',    desc: 'Vocabulary from Punjabi songs' },
  { id: 'more_songs',  label: 'More Words from Songs', desc: 'Harder song vocabulary' },
  { id: 'days',        label: 'Days of the Week',    desc: 'Somvaar to Aitvaar' },
  { id: 'numbers',     label: 'Numbers (0–100)',     desc: 'Count in Punjabi' },
];

let _cache = null; // resolved words array, shared across mounts

export function useWords() {
  const [words, setWords] = useState(_cache || []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    let cancelled = false;
    axios
      .get(`${API}/words`)
      .then((res) => {
        _cache = res.data;
        if (!cancelled) { setWords(res.data); setLoading(false); }
      })
      .catch((e) => {
        console.error('Failed to load words', e);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const byCategory = (categoryId) => words.filter((w) => w.category === categoryId);

  return { words, byCategory, loading };
}
