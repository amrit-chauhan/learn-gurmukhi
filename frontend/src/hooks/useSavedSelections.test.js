import { renderHook, act } from '@testing-library/react';
import { useSavedSelections } from './useSavedSelections';

jest.mock('../context/ProfileContext', () => ({
  useProfile: () => ({ activeProfileId: 'p1' }),
}));

const storageKey = 'wordSelections:p1';

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('useSavedSelections', () => {
  test('starts empty when nothing is persisted', () => {
    const { result } = renderHook(() => useSavedSelections());
    expect(result.current.selections).toEqual([]);
  });

  test('loads existing selections from localStorage on init', () => {
    const existing = [
      { id: 'sel_1', name: 'My set', category: 'numbers', ids: ['w1'], createdAt: 'x' },
    ];
    localStorage.setItem(storageKey, JSON.stringify(existing));

    const { result } = renderHook(() => useSavedSelections());
    expect(result.current.selections).toEqual(existing);
  });

  test('save persists a new named selection and returns the entry', () => {
    const { result } = renderHook(() => useSavedSelections());

    let entry;
    act(() => {
      entry = result.current.save('Favorites', ['w1', 'w2'], 'numbers');
    });

    expect(entry.name).toBe('Favorites');
    expect(entry.category).toBe('numbers');
    expect(entry.ids).toEqual(['w1', 'w2']);
    expect(entry.id).toMatch(/^sel_/);

    expect(result.current.selections).toHaveLength(1);
    expect(result.current.selections[0]).toEqual(entry);

    const persisted = JSON.parse(localStorage.getItem(storageKey));
    expect(persisted).toHaveLength(1);
    expect(persisted[0].name).toBe('Favorites');
  });

  test('save falls back to a default name when name is blank', () => {
    const { result } = renderHook(() => useSavedSelections());
    let entry;
    act(() => {
      entry = result.current.save('   ', ['a', 'b', 'c']);
    });
    expect(entry.name).toBe('Set of 3');
    expect(entry.category).toBeNull();
  });

  test('saving multiple prepends newest first', () => {
    const { result } = renderHook(() => useSavedSelections());
    act(() => { result.current.save('first', ['w1']); });
    act(() => { result.current.save('second', ['w2']); });

    expect(result.current.selections.map((s) => s.name)).toEqual(['second', 'first']);
  });

  test('remove deletes a selection by id and persists the removal', () => {
    const { result } = renderHook(() => useSavedSelections());

    let a;
    act(() => { a = result.current.save('a', ['w1']); });
    act(() => { result.current.save('b', ['w2']); });

    act(() => { result.current.remove(a.id); });

    expect(result.current.selections.map((s) => s.name)).toEqual(['b']);
    const persisted = JSON.parse(localStorage.getItem(storageKey));
    expect(persisted).toHaveLength(1);
    expect(persisted[0].name).toBe('b');
  });

  test('refresh re-reads selections from localStorage', () => {
    const { result } = renderHook(() => useSavedSelections());
    expect(result.current.selections).toEqual([]);

    const injected = [
      { id: 'sel_x', name: 'external', category: null, ids: ['w9'], createdAt: 'y' },
    ];
    localStorage.setItem(storageKey, JSON.stringify(injected));

    act(() => { result.current.refresh(); });
    expect(result.current.selections).toEqual(injected);
  });

  test('tolerates corrupt localStorage data (returns empty)', () => {
    localStorage.setItem(storageKey, 'not-json{');
    const { result } = renderHook(() => useSavedSelections());
    expect(result.current.selections).toEqual([]);
  });
});
