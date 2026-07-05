import { computeWordMastery } from './wordMastery';

describe('computeWordMastery', () => {
  test('no attempts → new', () => {
    expect(computeWordMastery([])).toBe('new');
    expect(computeWordMastery(undefined)).toBe('new');
  });

  test('last 3 all correct (exactly 3 attempts) → mastered', () => {
    expect(computeWordMastery([true, true, true])).toBe('mastered');
  });

  test('last 3 all wrong (exactly 3 attempts) → struggling', () => {
    expect(computeWordMastery([false, false, false])).toBe('struggling');
  });

  test('fewer than 3 attempts, all correct → learning (not yet mastered)', () => {
    expect(computeWordMastery([true, true])).toBe('learning');
  });

  test('fewer than 3 attempts, all wrong → learning (not yet struggling)', () => {
    expect(computeWordMastery([false, false])).toBe('learning');
  });

  test('one attempt, correct → learning', () => {
    expect(computeWordMastery([true])).toBe('learning');
  });

  test('one attempt, wrong → learning', () => {
    expect(computeWordMastery([false])).toBe('learning');
  });

  test('only the last 3 entries count for mastered', () => {
    // earlier wrong answers followed by 3 correct → mastered
    expect(computeWordMastery([false, false, false, true, true, true])).toBe('mastered');
  });

  test('only the last 3 entries count for struggling', () => {
    // earlier correct answers followed by 3 wrong → struggling
    expect(computeWordMastery([true, true, true, false, false, false])).toBe('struggling');
  });

  test('mixed last 3 → learning', () => {
    expect(computeWordMastery([true, false, true])).toBe('learning');
  });
});
