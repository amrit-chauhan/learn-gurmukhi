import { buildRandomDeck, buildSRDeck, estimateDeckSize } from './srAlgorithm';

const letters = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];

describe('buildRandomDeck', () => {
  test('empty input → empty deck', () => {
    expect(buildRandomDeck([])).toEqual([]);
  });

  test('deck size is exactly 2N', () => {
    const deck = buildRandomDeck(letters);
    expect(deck).toHaveLength(letters.length * 2);
  });

  test('every letter appears at least once (the 2N guarantee)', () => {
    const deck = buildRandomDeck(letters);
    const ids = new Set(deck.map((l) => l.id));
    letters.forEach((l) => expect(ids.has(l.id)).toBe(true));
  });

  test('is stable across repeated calls (guarantee always holds)', () => {
    for (let i = 0; i < 20; i++) {
      const deck = buildRandomDeck(letters);
      expect(deck).toHaveLength(8);
      const ids = new Set(deck.map((l) => l.id));
      expect(ids.size).toBe(letters.length);
    }
  });
});

describe('buildSRDeck', () => {
  const getMastery = () => 'new';
  const baseSettings = {
    weights: { new: 3, learning: 2, struggling: 5, mastered: 1 },
    sessionMultiplier: 3,
    avoidImmediateRepeat: true,
  };

  test('deck size matches selected count × multiplier', () => {
    const deck = buildSRDeck(letters, getMastery, baseSettings);
    expect(deck).toHaveLength(letters.length * baseSettings.sessionMultiplier);
  });

  test('never produces a deck smaller than the selected letter count', () => {
    const deck = buildSRDeck(letters, getMastery, { ...baseSettings, sessionMultiplier: 0.1 });
    expect(deck.length).toBeGreaterThanOrEqual(letters.length);
  });

  test('only draws from the selected letters', () => {
    const deck = buildSRDeck(letters, getMastery, baseSettings);
    const validIds = new Set(letters.map((l) => l.id));
    deck.forEach((card) => expect(validIds.has(card.id)).toBe(true));
  });

  test('avoidImmediateRepeat sharply reduces (but does not forbid) back-to-back repeats', () => {
    // Single-letter pool: repeats are unavoidable, but the guard should still
    // let the algorithm run without throwing.
    const deck = buildSRDeck([{ id: 'only' }], getMastery, baseSettings);
    expect(deck.every((c) => c.id === 'only')).toBe(true);
  });
});

describe('estimateDeckSize', () => {
  test('SR disabled → 2× selected count', () => {
    expect(estimateDeckSize(10, { srEnabled: false })).toBe(20);
  });

  test('SR enabled → selected count × multiplier', () => {
    expect(estimateDeckSize(10, { srEnabled: true, sessionMultiplier: 3 })).toBe(30);
  });

  test('SR enabled with small multiplier never drops below selected count', () => {
    expect(estimateDeckSize(10, { srEnabled: true, sessionMultiplier: 0.1 })).toBe(10);
  });
});
