/** Category filter tabs for the letter-selection grid. */

export const CATEGORIES = [
  { id: 'all',              label: 'All' },
  { id: 'vowel_carrier',   label: 'Carriers' },
  { id: 'consonant',       label: 'Consonants' },
  { id: 'consonant_nukta', label: 'Nukta' },
  { id: 'vowel',           label: 'Vowels' },
  { id: 'matra',           label: 'Matras' },
  { id: 'special',         label: 'Special' },
  { id: 'number',          label: 'Numbers' },
];

/**
 * Pedagogical sections for the letter-selection grid, in teaching order.
 *
 * Each group maps 1:1 to a letter's `group` field (from the backend alphabet
 * data) and belongs to a single `category`, so the CATEGORIES filter tabs above
 * still work: filtering by a category shows only the groups in that category.
 *
 * `divider: true` marks a section that should be visually set apart from the
 * ones before it (used to give Numbers its own clearly separated block).
 */
export const LETTER_GROUPS = [
  { id: 'vowel_carriers',       label: 'Vowel Carriers',                       category: 'vowel_carrier' },
  { id: 'consonants_sibilant',  label: 'Consonants · Sibilant & Glottal',      category: 'consonant' },
  { id: 'consonants_velar',     label: 'Consonants · Velars (Kavarg)',         category: 'consonant' },
  { id: 'consonants_palatal',   label: 'Consonants · Palatals (Chavarg)',      category: 'consonant' },
  { id: 'consonants_retroflex', label: 'Consonants · Retroflex (Tavarg)',      category: 'consonant' },
  { id: 'consonants_dental',    label: 'Consonants · Dentals (Tavarg)',        category: 'consonant' },
  { id: 'consonants_labial',    label: 'Consonants · Labials (Pavarg)',        category: 'consonant' },
  { id: 'consonants_semivowel', label: 'Consonants · Semivowels (Antim Toli)', category: 'consonant' },
  { id: 'nukta',                label: 'Nukta Consonants',                     category: 'consonant_nukta' },
  { id: 'vowels',               label: 'Independent Vowels',                   category: 'vowel' },
  { id: 'matras',               label: 'Matras (Vowel Signs)',                 category: 'matra' },
  { id: 'special',              label: 'Special Marks',                        category: 'special' },
  { id: 'numbers',              label: 'Numbers',                              category: 'number', divider: true },
];
