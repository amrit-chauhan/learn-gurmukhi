/**
 * useStudySession
 *
 * Owns all study-session state and logic:
 *   - Building and rebuilding the card deck (SR or pseudo-random)
 *   - Tracking the current card index and revealed state
 *   - Recording answers via ProgressContext
 *   - Detecting session completion
 *
 * Returns plain values + action callbacks so the page component
 * stays a pure renderer with no business logic.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { buildSRDeck, buildRandomDeck } from '../utils/srAlgorithm';

export function useStudySession(mode, selectedIds, sessionLength = null) {
  const navigate = useNavigate();
  const { alphabet, updateProgress, getMastery } = useProgress();
  const { settings } = useSettings();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);
  const [done, setDone] = useState(false);

  /** Build a deck from the given letter subset using current SR settings. */
  const buildDeck = useCallback(
    (letters) => {
      let deck = settings.srEnabled
        ? buildSRDeck(letters, getMastery, settings)
        : buildRandomDeck(letters);

      if (sessionLength !== null) {
        if (sessionLength <= deck.length) {
          // Cap to chosen length
          deck = deck.slice(0, sessionLength);
        } else {
          // Extend by repeating shuffled rounds until we reach the target
          while (deck.length < sessionLength) {
            const more = settings.srEnabled
              ? buildSRDeck(letters, getMastery, settings)
              : buildRandomDeck(letters);
            deck = [...deck, ...more];
          }
          deck = deck.slice(0, sessionLength);
        }
      }
      return deck;
    },
    [settings, getMastery, sessionLength]
  );

  /** Initial deck build – runs once when the alphabet loads. */
  useEffect(() => {
    if (!selectedIds || !mode) { navigate('/'); return; }
    if (alphabet.length === 0) return;
    const selected = alphabet.filter((l) => selectedIds.includes(l.id));
    setCards(buildDeck(selected));
  }, [selectedIds, mode, alphabet]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Record the user's answer and advance to the next card. */
  const handleAnswer = useCallback(
    async (correct) => {
      const card = cards[currentIndex];
      if (!card) return;
      await updateProgress(card.id, correct);
      setSessionResults((prev) => [...prev, { letter: card, correct }]);
      setRevealed(false);
      if (currentIndex + 1 >= cards.length) {
        setDone(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [cards, currentIndex, updateProgress]
  );

  /** Flip the current card to show the answer. */
  const reveal = useCallback(() => setRevealed(true), []);

  /** End the session immediately, jumping to the results screen. */
  const endEarly = useCallback(() => setDone(true), []);

  /** Rebuild the deck and restart the session (used by "Study Again"). */
  const restart = useCallback(() => {
    const selected = alphabet.filter((l) => selectedIds.includes(l.id));
    setCards(buildDeck(selected));
    setCurrentIndex(0);
    setRevealed(false);
    setSessionResults([]);
    setDone(false);
  }, [alphabet, selectedIds, buildDeck]);

  // ── Derived values ──────────────────────────────────────────────────────
  const correctCount = sessionResults.filter((r) => r.correct).length;
  const wrongCount = sessionResults.length - correctCount;
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;
  const currentCard = cards[currentIndex] ?? null;

  return {
    cards,
    currentIndex,
    currentCard,
    revealed,
    reveal,
    sessionResults,
    done,
    handleAnswer,
    restart,
    endEarly,
    correctCount,
    wrongCount,
    progress,
  };
}
