import { computeMastery } from './mastery';

describe('computeMastery', () => {
  test('no attempts → new', () => {
    expect(computeMastery([])).toBe('new');
    expect(computeMastery(undefined)).toBe('new');
  });

  test('10/10 correct → mastered', () => {
    expect(computeMastery(Array(10).fill(true))).toBe('mastered');
  });

  test('fewer than 10 attempts, all correct → learning (not yet mastered)', () => {
    expect(computeMastery(Array(9).fill(true))).toBe('learning');
  });

  test('more than 3 wrong in last 10 → struggling', () => {
    const history = [true, true, true, true, true, true, false, false, false, false];
    expect(computeMastery(history)).toBe('struggling');
  });

  test('exactly 3 wrong in last 10 → learning, not struggling', () => {
    const history = [true, true, true, true, true, true, true, false, false, false];
    expect(computeMastery(history)).toBe('learning');
  });

  test('only the last 10 entries count', () => {
    // 20 wrong answers followed by 10 correct → should read as mastered
    const history = [...Array(20).fill(false), ...Array(10).fill(true)];
    expect(computeMastery(history)).toBe('mastered');
  });

  test('one attempt, correct → learning', () => {
    expect(computeMastery([true])).toBe('learning');
  });

  test('one attempt, wrong → learning', () => {
    expect(computeMastery([false])).toBe('learning');
  });
});
