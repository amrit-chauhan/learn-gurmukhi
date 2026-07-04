/**
 * useWordSession
 *
 * Session engine for the Practice Words feature. Supports two modes:
 *
 *   - Random  (ordered=false): the selected words, shuffled, each shown once.
 *   - In order (ordered=true): the words in their natural order (numbers 0→100,
 *     others in data order), each shown once. The position is PERSISTED per
 *     category in localStorage, so quitting and coming back resumes where you
 *     left off; finishing a full pass resets to the start.
 *
 * Per-word correctness history is saved to the backend via ProgressContext
 * (same as letters), so mastery colours update regardless of mode.
 *
 * Returns the same shape as useStudySession so it drops into the shared
 * Flashcard / ResultsScreen UI.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useProfile } from '../context/ProfileContext';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const orderKeyFor = (profileId, category) => `wordOrder:${profileId || 'default'}:${category}`;

export function useWordSession(pool, selectedIds, { ordered = false, category = null } = {}) {
  const navigate = useNavigate();
  const { updateProgress } = useProgress();
  const { activeProfileId } = useProfile();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);
  const [done, setDone] = useState(false);

  const answeredIdxRef = useRef(-1);
  const orderKey = ordered && category ? orderKeyFor(activeProfileId, category) : null;

  /** Persist the in-order resume position (no-op for random mode). */
  const saveOrderPos = useCallback(
    (pos) => {
      if (!orderKey) return;
      try { localStorage.setItem(orderKey, String(pos)); } catch { /* ignore */ }
    },
    [orderKey]
  );

  /** Build the deck. selected preserves pool order (matters for in-order). */
  const buildDeck = useCallback(() => {
    const selected = pool.filter((w) => selectedIds.includes(w.id));
    if (!ordered) return { deck: shuffle(selected), start: 0 };
    let start = 0;
    if (orderKey) {
      const saved = parseInt(localStorage.getItem(orderKey) || '0', 10);
      start = Number.isFinite(saved) && saved > 0 && saved < selected.length ? saved : 0;
    }
    return { deck: selected, start };
  }, [pool, selectedIds, ordered, orderKey]);

  useEffect(() => {
    if (!selectedIds || selectedIds.length === 0) { navigate('/words'); return; }
    if (pool.length === 0) return;
    const { deck, start } = buildDeck();
    setCards(deck);
    setCurrentIndex(start);
    answeredIdxRef.current = -1;
  }, [pool, selectedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback(
    (correct) => {
      const idx = currentIndex;
      const card = cards[idx];
      if (!card) return;
      if (answeredIdxRef.current === idx) return; // ignore duplicate (swipe + click)
      answeredIdxRef.current = idx;

      setSessionResults((prev) => [...prev, { letter: card, correct }]);
      setRevealed(false);

      const nextIdx = idx + 1;
      if (nextIdx >= cards.length) {
        setDone(true);
        if (ordered) saveOrderPos(0); // finished the pass → restart next time
      } else {
        setCurrentIndex(nextIdx);
        if (ordered) saveOrderPos(nextIdx); // resume here if the user quits
      }
      updateProgress(card.id, correct);
    },
    [cards, currentIndex, ordered, saveOrderPos, updateProgress]
  );

  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length && !done) setDone(true);
  }, [currentIndex, cards.length, done]);

  const reveal = useCallback(() => setRevealed(true), []);
  const endEarly = useCallback(() => setDone(true), []);

  const restart = useCallback(() => {
    // "Study Again": random reshuffles; in-order starts a fresh pass from 0.
    const selected = pool.filter((w) => selectedIds.includes(w.id));
    answeredIdxRef.current = -1;
    setCards(ordered ? selected : shuffle(selected));
    setCurrentIndex(0);
    if (ordered) saveOrderPos(0);
    setRevealed(false);
    setSessionResults([]);
    setDone(false);
  }, [pool, selectedIds, ordered, saveOrderPos]);

  const correctCount = sessionResults.filter((r) => r.correct).length;
  const wrongCount = sessionResults.length - correctCount;
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;
  const currentCard = cards[currentIndex] ?? null;

  return {
    cards, currentIndex, currentCard,
    revealed, reveal,
    sessionResults, done,
    handleAnswer, restart, endEarly,
    correctCount, wrongCount, progress,
  };
}
