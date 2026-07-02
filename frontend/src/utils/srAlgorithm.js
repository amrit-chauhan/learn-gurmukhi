/**
 * Spaced Repetition Algorithm
 * Builds a weighted deck from selected letters based on mastery.
 * Struggling letters appear more; mastered letters less.
 */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a pseudo-random deck for non-SR mode.
 *
 * Rule: in every window of 2×N cards, each of the N selected letters
 * appears AT LEAST ONCE. The remaining N slots are filled with
 * completely random picks from the pool.
 *
 * The whole 2N window is then shuffled so guaranteed and random
 * cards are evenly distributed — not all guaranteed ones first.
 *
 * Clicking "Study Again" produces a fresh 2N window with the same
 * guarantee, so the rule applies to every block of 2N practices.
 */
export function buildRandomDeck(letters) {
  const N = letters.length;
  if (N === 0) return [];

  // One of each letter, shuffled — this is the guarantee
  const guaranteed = shuffle(letters);

  // N fully random extras (can repeat any letter)
  const extras = Array.from(
    { length: N },
    () => letters[Math.floor(Math.random() * N)]
  );

  // Merge and re-shuffle so the distribution feels natural
  return shuffle([...guaranteed, ...extras]);
}

function pickWeighted(letters, getMastery, weights, excludeId = null) {
  const pool = letters.map(letter => {
    const mastery = getMastery(letter.id);
    let w = weights[mastery] ?? 2;
    // Penalise immediate repeat
    if (excludeId && letter.id === excludeId) w *= 0.05;
    return { letter, w: Math.max(w, 0.01) };
  });

  const total = pool.reduce((sum, item) => sum + item.w, 0);
  let rand = Math.random() * total;
  for (const { letter, w } of pool) {
    rand -= w;
    if (rand <= 0) return letter;
  }
  return pool[pool.length - 1].letter;
}

/**
 * Build a deck for a spaced-repetition session.
 * Total cards = Math.round(selectedLetters.length * sessionMultiplier)
 * Each card is picked via weighted random based on current mastery.
 */
export function buildSRDeck(selectedLetters, getMastery, settings) {
  const { weights, sessionMultiplier, avoidImmediateRepeat } = settings;
  const totalCards = Math.max(
    selectedLetters.length,
    Math.round(selectedLetters.length * sessionMultiplier)
  );

  const deck = [];
  let lastId = null;

  for (let i = 0; i < totalCards; i++) {
    const card = pickWeighted(
      selectedLetters,
      getMastery,
      weights,
      avoidImmediateRepeat ? lastId : null
    );
    deck.push(card);
    lastId = card.id;
  }

  return deck;
}

/** Estimate total card count for UI display */
export function estimateDeckSize(selectedCount, settings) {
  if (!settings.srEnabled) return selectedCount * 2; // pseudo-random: 2× window guarantee
  return Math.max(selectedCount, Math.round(selectedCount * settings.sessionMultiplier));
}
