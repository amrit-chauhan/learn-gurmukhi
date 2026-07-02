import { renderHook, act } from '@testing-library/react';
import { useLetterSelection } from './useLetterSelection';

const letters = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('useLetterSelection', () => {
  test('starts with nothing selected', () => {
    const { result } = renderHook(() => useLetterSelection());
    expect(result.current.selectedIds.size).toBe(0);
  });

  test('toggle adds then removes a letter', () => {
    const { result } = renderHook(() => useLetterSelection());

    act(() => result.current.toggle('a'));
    expect(result.current.selectedIds.has('a')).toBe(true);

    act(() => result.current.toggle('a'));
    expect(result.current.selectedIds.has('a')).toBe(false);
  });

  test('selectAll selects every provided letter', () => {
    const { result } = renderHook(() => useLetterSelection());
    act(() => result.current.selectAll(letters));
    expect(result.current.isAllSelected(letters)).toBe(true);
  });

  test('deselectAll only clears the given subset, keeping other selections', () => {
    const { result } = renderHook(() => useLetterSelection());
    act(() => result.current.selectAll(letters));
    act(() => result.current.toggle('extra'));

    act(() => result.current.deselectAll(letters));

    expect(result.current.selectedIds.has('extra')).toBe(true);
    letters.forEach((l) => expect(result.current.selectedIds.has(l.id)).toBe(false));
  });

  test('applyDrag "select" adds without toggling off if already selected', () => {
    const { result } = renderHook(() => useLetterSelection());
    act(() => result.current.applyDrag('a', 'select'));
    act(() => result.current.applyDrag('a', 'select'));
    expect(result.current.selectedIds.has('a')).toBe(true);
  });

  test('applyDrag "deselect" removes without erroring if already absent', () => {
    const { result } = renderHook(() => useLetterSelection());
    act(() => result.current.applyDrag('a', 'deselect'));
    expect(result.current.selectedIds.has('a')).toBe(false);
  });

  test('isAllSelected is false for an empty letter set', () => {
    const { result } = renderHook(() => useLetterSelection());
    expect(result.current.isAllSelected([])).toBe(false);
  });
});
