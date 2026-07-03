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

import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Index of the card already answered, to ignore duplicate answers for the
  // same card. A single swipe can fire onCorrect/onWrong more than once (drag
  // end + click/keyboard), which would otherwise advance the index twice and
  // run past the end of the deck without ever hitting the completion check.
  const answeredIdxRef = useRef(-1);

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
    (correct) => {
      const idx = currentIndex;
      const card = cards[idx];
      if (!card) return;
      // Ignore a duplicate answer for the same card (swipe + click/keyboard).
      if (answeredIdxRef.current === idx) return;
      answeredIdxRef.current = idx;

      setSessionResults((prev) => [...prev, { letter: card, correct }]);
      setRevealed(false);
      if (idx + 1 >= cards.length) {
        setDone(true);
      } else {
        setCurrentIndex(idx + 1);
      }
      // Persist best-effort; don't block advancing the UI on the network.
      updateProgress(card.id, correct);
    },
    [cards, currentIndex, updateProgress]
  );

  // Safety net: never leave a permanent blank card. If the index ever lands
  // past the end of a non-empty deck, treat the session as finished.
  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length && !done) {
      setDone(true);
    }
  }, [currentIndex, cards.length, done]);

  /** Flip the current card to show the answer. */
  const reveal = useCallback(() => setRevealed(true), []);

  /** End the session immediately, jumping to the results screen. */
  const endEarly = useCallback(() => setDone(true), []);

  /** Rebuild the deck and restart the session (used by "Study Again"). */
  const restart = useCallback(() => {
    const selected = alphabet.filter((l) => selectedIds.includes(l.id));
    answeredIdxRef.current = -1;
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
