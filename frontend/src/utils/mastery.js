/**
 * Mastery classification for a single letter's practice history.
 *
 * - 'new'        – no attempts yet
 * - 'mastered'   – last 10 attempts all correct (needs at least 10 attempts)
 * - 'struggling' – more than 3 wrong in the last 10 attempts
 * - 'learning'   – everything else with at least one attempt
 */
export function computeMastery(history) {
  if (!history || history.length === 0) return 'new';
  const last10 = history.slice(-10);
  const correct = last10.filter(Boolean).length;
  const wrong = last10.length - correct;
  if (last10.length >= 10 && correct === 10) return 'mastered';
  if (wrong > 3) return 'struggling';
  return 'learning';
}
