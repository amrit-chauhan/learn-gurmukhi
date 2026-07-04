/**
 * Mastery classification for a practice WORD's history.
 *
 * Words use a shorter window than letters (last 3 tries, not last 10):
 * - 'new'        – no attempts yet
 * - 'mastered'   – at least 3 attempts and the last 3 are all correct
 * - 'struggling' – at least 3 attempts and the last 3 are all wrong
 * - 'learning'   – anything else with at least one attempt
 */
export function computeWordMastery(history) {
  if (!history || history.length === 0) return 'new';
  const last3 = history.slice(-3);
  if (last3.length >= 3) {
    if (last3.every(Boolean)) return 'mastered';
    if (last3.every((h) => !h)) return 'struggling';
  }
  return 'learning';
}
