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
