/** Study mode descriptors – single source of truth for mode config. */

export const STUDY_MODES = [
  {
    id: 'gurmukhi_to_sound',
    title: 'Gurmukhi → Sound',
    desc: 'See the Gurmukhi letter, guess the pronunciation',
    lightBg: 'bg-pink-50',
    textColor: 'text-pink-700',
    icon: 'ਕ',
    iconIsGurmukhi: true,
  },
  {
    id: 'sound_to_gurmukhi',
    title: 'Sound → Gurmukhi',
    desc: 'See the romanization, recall the Gurmukhi letter',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: 'ka',
    iconIsGurmukhi: false,
  },
];

/** Human-readable label for a mode id. */
export const MODE_LABELS = {
  gurmukhi_to_sound: 'Gurmukhi → Sound',
  sound_to_gurmukhi: 'Sound → Gurmukhi',
};

/** Writing / tracing sub-modes (used by the /writing page). */
export const WRITING_SUBMODES = [
  { id: 'trace', title: 'Trace', desc: 'Follow the outlined guide' },
  { id: 'free',  title: 'Free draw', desc: 'No guide — draw from memory' },
];

/**
 * The three bundled Gurmukhi faces shown when the answer is revealed, so the
 * learner sees real-world variation of the same character (print, traditional,
 * handwritten). Font files live in src/fonts/ (see gurmukhi-fonts.css).
 */
export const WRITING_FONT_VARIANTS = [
  { label: 'Print',       family: "'Noto Sans Gurmukhi', sans-serif" },
  { label: 'Traditional', family: "'Noto Serif Gurmukhi', serif" },
  { label: 'Handwritten', family: "'Baloo Paaji 2', cursive" },
];
