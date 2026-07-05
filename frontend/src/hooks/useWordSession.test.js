import { renderHook, act } from '@testing-library/react';
import { useWordSession } from './useWordSession';

const mockUpdateProgress = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../context/ProgressContext', () => ({
  useProgress: () => ({ updateProgress: mockUpdateProgress }),
}));

jest.mock('../context/ProfileContext', () => ({
  useProfile: () => ({ activeProfileId: 'p1' }),
}));

const pool = [
  { id: 'w1' },
  { id: 'w2' },
  { id: 'w3' },
  { id: 'w4' },
];

// IMPORTANT: selectedIds must be a STABLE reference across renders. The hook's
// deck-building effect depends on it, so passing a fresh inline array literal
// on every render would re-run the effect → setCards → re-render → infinite
// loop. In the real app selectedIds comes from stable router state, so these
// hoisted constants mirror that. Each test uses whichever fixed set it needs.
const SEL_13 = ['w1', 'w3'];
const SEL_31 = ['w3', 'w1'];
const SEL_12 = ['w1', 'w2'];
const SEL_123 = ['w1', 'w2', 'w3'];
const SEL_1 = ['w1'];
const SEL_EMPTY = [];

const orderKey = 'wordOrder:p1:numbers';

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('useWordSession deck building', () => {
  test('builds a deck from pool filtered by selectedIds (random mode, set membership)', () => {
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_13, { ordered: false })
    );
    const ids = result.current.cards.map((c) => c.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids)).toEqual(new Set(SEL_13));
  });

  test('in-order mode preserves pool order', () => {
    // order given by user should NOT matter — pool order wins
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_31, { ordered: true, category: 'numbers' })
    );
    expect(result.current.cards.map((c) => c.id)).toEqual(['w1', 'w3']);
  });

  test('empty selectedIds navigates away to /words', () => {
    renderHook(() => useWordSession(pool, SEL_EMPTY, { ordered: false }));
    expect(mockNavigate).toHaveBeenCalledWith('/words');
  });

  test('currentCard starts at the first card', () => {
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_12, { ordered: true, category: 'numbers' })
    );
    expect(result.current.currentCard.id).toBe('w1');
    expect(result.current.currentIndex).toBe(0);
  });
});

describe('useWordSession answering', () => {
  test('handleAnswer advances index, updates counts and progress, calls updateProgress with card id', () => {
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_12, { ordered: true, category: 'numbers' })
    );

    expect(result.current.progress).toBe(0);

    act(() => result.current.handleAnswer(true));

    expect(mockUpdateProgress).toHaveBeenCalledWith('w1', true);
    expect(result.current.correctCount).toBe(1);
    expect(result.current.wrongCount).toBe(0);
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.progress).toBe(50);

    act(() => result.current.handleAnswer(false));

    expect(mockUpdateProgress).toHaveBeenCalledWith('w2', false);
    expect(result.current.correctCount).toBe(1);
    expect(result.current.wrongCount).toBe(1);
    expect(result.current.done).toBe(true);
  });

  test('duplicate answer on the same index is ignored', () => {
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_12, { ordered: true, category: 'numbers' })
    );

    act(() => {
      result.current.handleAnswer(true);
      result.current.handleAnswer(true); // same index — should be ignored
    });

    // Only the first answer counted; index advanced by exactly one.
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.sessionResults).toHaveLength(1);
    expect(mockUpdateProgress).toHaveBeenCalledTimes(1);
  });
});

describe('useWordSession in-order persistence', () => {
  test('persists resume position to localStorage as answers advance', () => {
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_123, { ordered: true, category: 'numbers' })
    );

    act(() => result.current.handleAnswer(true));
    expect(localStorage.getItem(orderKey)).toBe('1');

    act(() => result.current.handleAnswer(true));
    expect(localStorage.getItem(orderKey)).toBe('2');
  });

  test('resumes from a saved position', () => {
    localStorage.setItem(orderKey, '2');
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_123, { ordered: true, category: 'numbers' })
    );
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.currentCard.id).toBe('w3');
  });

  test('finishing a full pass resets saved position to 0', () => {
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_12, { ordered: true, category: 'numbers' })
    );

    act(() => result.current.handleAnswer(true));
    act(() => result.current.handleAnswer(true)); // finishes pass

    expect(result.current.done).toBe(true);
    expect(localStorage.getItem(orderKey)).toBe('0');
  });

  test('random mode does not write an order key', () => {
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_12, { ordered: false })
    );
    act(() => result.current.handleAnswer(true));
    expect(localStorage.getItem(orderKey)).toBeNull();
  });
});

describe('useWordSession restart', () => {
  test('restart resets index, results, done and reveal', () => {
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_12, { ordered: true, category: 'numbers' })
    );

    act(() => result.current.handleAnswer(true));
    act(() => result.current.handleAnswer(false));
    expect(result.current.done).toBe(true);

    act(() => result.current.restart());

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.sessionResults).toHaveLength(0);
    expect(result.current.done).toBe(false);
    expect(result.current.revealed).toBe(false);
    expect(result.current.correctCount).toBe(0);
    expect(result.current.wrongCount).toBe(0);
    expect(localStorage.getItem(orderKey)).toBe('0');
  });

  test('reveal sets revealed to true', () => {
    const { result } = renderHook(() =>
      useWordSession(pool, SEL_1, { ordered: false })
    );
    act(() => result.current.reveal());
    expect(result.current.revealed).toBe(true);
  });
});
