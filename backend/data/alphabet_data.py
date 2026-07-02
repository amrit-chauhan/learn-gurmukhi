"""
Static alphabet data.
Single source of truth for all 70 Gurmukhi letters + numbers.
Each entry is an immutable dict; shape is enforced by models.AlphabetLetter.

audio_file: filename (no extension) inside data/audio/human/, or None for AI-TTS-only letters.

group: pedagogical section id used to render the letter-selection screen as
ordered, labelled sections (see frontend/src/constants/categories.js → LETTER_GROUPS
for the section labels and display order). Every entry belongs to exactly one group,
and every group maps to a single `category`, so the category-filter tabs keep working
alongside the sectioned layout. `group` is a finer-grained pedagogical key than
`category` (e.g. the consonants split into the traditional varnmala rows by place
of articulation), while `category` stays the coarse filter dimension.
"""

from typing import List, Dict, Any

PUNJABI_ALPHABET: List[Dict[str, Any]] = [
    # ── Vowel Carriers ──────────────────────────────────────────────────────
    {"id": "ura",   "gurmukhi": "ੳ",  "romanization": "Ura",          "tts_text": "oo rah",              "name": "Ura",             "category": "vowel_carrier",    "group": "vowel_carriers",       "audio_file": "oorhaa"},
    {"id": "ara",   "gurmukhi": "ਅ",  "romanization": "Ara",          "tts_text": "uh rah",              "name": "Ara",             "category": "vowel_carrier",    "group": "vowel_carriers",       "audio_file": "airhaa"},
    {"id": "iri",   "gurmukhi": "ੲ",  "romanization": "Iri",          "tts_text": "ee ree",              "name": "Iri",             "category": "vowel_carrier",    "group": "vowel_carriers",       "audio_file": "eerhee"},

    # ── Consonants — Sibilant & Glottal (ਸ ਹ) ────────────────────────────────
    {"id": "sa",    "gurmukhi": "ਸ",  "romanization": "sa",           "tts_text": "suh",                 "name": "Sassa",           "category": "consonant",        "group": "consonants_sibilant",  "audio_file": "sassaa"},
    {"id": "ha",    "gurmukhi": "ਹ",  "romanization": "ha",           "tts_text": "huh",                 "name": "Haha",            "category": "consonant",        "group": "consonants_sibilant",  "audio_file": "haahaa"},

    # ── Consonants — Velars / Kavarg (ਕ ਖ ਗ ਘ ਙ) ─────────────────────────────
    {"id": "ka",    "gurmukhi": "ਕ",  "romanization": "ka",           "tts_text": "kuh",                 "name": "Kakka",           "category": "consonant",        "group": "consonants_velar",     "audio_file": "kakkaa"},
    {"id": "kha",   "gurmukhi": "ਖ",  "romanization": "kha",          "tts_text": "k-huh",               "name": "Khakha",          "category": "consonant",        "group": "consonants_velar",     "audio_file": "khakhkhaa"},
    {"id": "ga",    "gurmukhi": "ਗ",  "romanization": "ga",           "tts_text": "guh",                 "name": "Gagga",           "category": "consonant",        "group": "consonants_velar",     "audio_file": "gaggaa"},
    {"id": "gha",   "gurmukhi": "ਘ",  "romanization": "gha",          "tts_text": "g-huh",               "name": "Ghagha",          "category": "consonant",        "group": "consonants_velar",     "audio_file": "ghaggaa"},
    {"id": "nga",   "gurmukhi": "ਙ",  "romanization": "nga",          "tts_text": "ng-uh",               "name": "Nganga",          "category": "consonant",        "group": "consonants_velar",     "audio_file": "nganngaa"},

    # ── Consonants — Palatals / Chavarg (ਚ ਛ ਜ ਝ ਞ) ──────────────────────────
    {"id": "cha",   "gurmukhi": "ਚ",  "romanization": "cha",          "tts_text": "chuh",                "name": "Chacha",          "category": "consonant",        "group": "consonants_palatal",   "audio_file": "chachchaa"},
    {"id": "chha",  "gurmukhi": "ਛ",  "romanization": "chha",         "tts_text": "chh-uh",              "name": "Chhachha",        "category": "consonant",        "group": "consonants_palatal",   "audio_file": "chhachhchhaa"},
    {"id": "ja",    "gurmukhi": "ਜ",  "romanization": "ja",           "tts_text": "juh",                 "name": "Jajja",           "category": "consonant",        "group": "consonants_palatal",   "audio_file": "jajjaa"},
    {"id": "jha",   "gurmukhi": "ਝ",  "romanization": "jha",          "tts_text": "jh-uh",              "name": "Jhajha",          "category": "consonant",        "group": "consonants_palatal",   "audio_file": "jhajjaa"},
    {"id": "nya",   "gurmukhi": "ਞ",  "romanization": "nya",          "tts_text": "nyuh",                "name": "Njanja",          "category": "consonant",        "group": "consonants_palatal",   "audio_file": "njannjaa"},

    # ── Consonants — Retroflex / Tavarg (ਟ ਠ ਡ ਢ ਣ) ──────────────────────────
    {"id": "tta",   "gurmukhi": "ਟ",  "romanization": "tta",          "tts_text": "retroflex tuh",       "name": "Taitta",          "category": "consonant",        "group": "consonants_retroflex", "audio_file": "tainkaa"},
    {"id": "ttha",  "gurmukhi": "ਠ",  "romanization": "ttha",         "tts_text": "retroflex thuh",      "name": "Taitta aspirated","category": "consonant",        "group": "consonants_retroflex", "audio_file": "thaththaa1"},
    {"id": "dda",   "gurmukhi": "ਡ",  "romanization": "dda",          "tts_text": "retroflex duh",       "name": "Dadda",           "category": "consonant",        "group": "consonants_retroflex", "audio_file": "daddaa1"},
    {"id": "ddha",  "gurmukhi": "ਢ",  "romanization": "ddha",         "tts_text": "retroflex dhuh",      "name": "Dhadha",          "category": "consonant",        "group": "consonants_retroflex", "audio_file": "dhaddaa1"},
    {"id": "nna",   "gurmukhi": "ਣ",  "romanization": "nna",          "tts_text": "retroflex nnuh",      "name": "Nanna",           "category": "consonant",        "group": "consonants_retroflex", "audio_file": "nhaanhaa"},

    # ── Consonants — Dentals / Tavarg (ਤ ਥ ਦ ਧ ਨ) ────────────────────────────
    {"id": "ta",    "gurmukhi": "ਤ",  "romanization": "ta",           "tts_text": "tuh",                 "name": "Tatta",           "category": "consonant",        "group": "consonants_dental",    "audio_file": "tattaa"},
    {"id": "tha",   "gurmukhi": "ਥ",  "romanization": "tha",          "tts_text": "thuh",                "name": "Thatha",          "category": "consonant",        "group": "consonants_dental",    "audio_file": "thaththaa2"},
    {"id": "da",    "gurmukhi": "ਦ",  "romanization": "da",           "tts_text": "duh",                 "name": "Dadda dental",    "category": "consonant",        "group": "consonants_dental",    "audio_file": "daddaa2"},
    {"id": "dha",   "gurmukhi": "ਧ",  "romanization": "dha",          "tts_text": "dhuh",                "name": "Dhadha dental",   "category": "consonant",        "group": "consonants_dental",    "audio_file": "dhaddaa2"},
    {"id": "na",    "gurmukhi": "ਨ",  "romanization": "na",           "tts_text": "nuh",                 "name": "Nanna",           "category": "consonant",        "group": "consonants_dental",    "audio_file": "nannaa"},

    # ── Consonants — Labials / Pavarg (ਪ ਫ ਬ ਭ ਮ) ────────────────────────────
    {"id": "pa",    "gurmukhi": "ਪ",  "romanization": "pa",           "tts_text": "puh",                 "name": "Pappa",           "category": "consonant",        "group": "consonants_labial",    "audio_file": "pappaa"},
    {"id": "pha",   "gurmukhi": "ਫ",  "romanization": "pha",          "tts_text": "phuh",                "name": "Phappha",         "category": "consonant",        "group": "consonants_labial",    "audio_file": "phaphphaa"},
    {"id": "ba",    "gurmukhi": "ਬ",  "romanization": "ba",           "tts_text": "buh",                 "name": "Babba",           "category": "consonant",        "group": "consonants_labial",    "audio_file": "babbaa"},
    {"id": "bha",   "gurmukhi": "ਭ",  "romanization": "bha",          "tts_text": "bhuh",                "name": "Bhabbha",         "category": "consonant",        "group": "consonants_labial",    "audio_file": "bhabbaa"},
    {"id": "ma",    "gurmukhi": "ਮ",  "romanization": "ma",           "tts_text": "muh",                 "name": "Mamma",           "category": "consonant",        "group": "consonants_labial",    "audio_file": "mammaa"},

    # ── Consonants — Semivowels & Liquids / Antim Toli (ਯ ਰ ਲ ਵ) ─────────────
    {"id": "ya",    "gurmukhi": "ਯ",  "romanization": "ya",           "tts_text": "yuh",                 "name": "Yayya",           "category": "consonant",        "group": "consonants_semivowel", "audio_file": "yayyaa"},
    {"id": "ra",    "gurmukhi": "ਰ",  "romanization": "ra",           "tts_text": "ruh",                 "name": "Rara",            "category": "consonant",        "group": "consonants_semivowel", "audio_file": "raaraa"},
    {"id": "la",    "gurmukhi": "ਲ",  "romanization": "la",           "tts_text": "luh",                 "name": "Lalla",           "category": "consonant",        "group": "consonants_semivowel", "audio_file": "lallaa"},
    {"id": "va",    "gurmukhi": "ਵ",  "romanization": "va / wa",      "tts_text": "vuh",                 "name": "Vava",            "category": "consonant",        "group": "consonants_semivowel", "audio_file": "vavvaa"},

    # ── Nukta Consonants (borrowed sounds) ──────────────────────────────────
    {"id": "sha",   "gurmukhi": "ਸ਼", "romanization": "sha",          "tts_text": "shuh",                "name": "Sha (nukta)",     "category": "consonant_nukta",  "group": "nukta",                "audio_file": "shashashaa"},
    {"id": "kha_n", "gurmukhi": "ਖ਼", "romanization": "kha (nukta)",  "tts_text": "guttural khuh",       "name": "Kha (nukta)",     "category": "consonant_nukta",  "group": "nukta",                "audio_file": "khhakhhkhha"},
    {"id": "gha_n", "gurmukhi": "ਗ਼", "romanization": "gha (nukta)",  "tts_text": "guttural ghuh",       "name": "Gha (nukta)",     "category": "consonant_nukta",  "group": "nukta",                "audio_file": "ghagghaa"},
    {"id": "za",    "gurmukhi": "ਜ਼", "romanization": "za",           "tts_text": "zuh",                 "name": "Za (nukta)",      "category": "consonant_nukta",  "group": "nukta",                "audio_file": "zazzaa"},
    {"id": "lla",   "gurmukhi": "ਲ਼", "romanization": "lla",          "tts_text": "lluh",                "name": "Lla (nukta)",     "category": "consonant_nukta",  "group": "nukta",                "audio_file": "lallaadot"},
    {"id": "fa",    "gurmukhi": "ਫ਼", "romanization": "fa",           "tts_text": "fuh",                 "name": "Fa (nukta)",      "category": "consonant_nukta",  "group": "nukta",                "audio_file": "faffaa"},

    # ── Independent Vowels ───────────────────────────────────────────────────
    {"id": "v_aa",  "gurmukhi": "ਆ",  "romanization": "aa",           "tts_text": "aah",                 "name": "Aa",              "category": "vowel",            "group": "vowels",               "audio_file": "aa"},
    {"id": "v_i",   "gurmukhi": "ਇ",  "romanization": "i",            "tts_text": "ih",                  "name": "I",               "category": "vowel",            "group": "vowels",               "audio_file": None},
    {"id": "v_ee",  "gurmukhi": "ਈ",  "romanization": "ee",           "tts_text": "eeh",                 "name": "Ee",              "category": "vowel",            "group": "vowels",               "audio_file": "ee"},
    {"id": "v_u",   "gurmukhi": "ਉ",  "romanization": "u",            "tts_text": "oo short",            "name": "U",               "category": "vowel",            "group": "vowels",               "audio_file": "u"},
    {"id": "v_uu",  "gurmukhi": "ਊ",  "romanization": "uu",           "tts_text": "ooh long",            "name": "Uu",              "category": "vowel",            "group": "vowels",               "audio_file": "oo"},
    {"id": "v_e",   "gurmukhi": "ਏ",  "romanization": "e",            "tts_text": "eh",                  "name": "E",               "category": "vowel",            "group": "vowels",               "audio_file": "e"},
    {"id": "v_ai",  "gurmukhi": "ਐ",  "romanization": "ai",           "tts_text": "ai as in eye",        "name": "Ai",              "category": "vowel",            "group": "vowels",               "audio_file": "ai"},
    {"id": "v_o",   "gurmukhi": "ਓ",  "romanization": "o",            "tts_text": "oh",                  "name": "O",               "category": "vowel",            "group": "vowels",               "audio_file": "o"},
    {"id": "v_au",  "gurmukhi": "ਔ",  "romanization": "au",           "tts_text": "ow as in cow",        "name": "Au",              "category": "vowel",            "group": "vowels",               "audio_file": "au"},

    # ── Matras (vowel signs shown with ਕ base) ──────────────────────────────
    {"id": "m_aa",  "gurmukhi": "ਕਾ", "romanization": "kaa · aa matra (ਾ)",  "tts_text": "kaah — long aa vowel sign",  "name": "Lavan aa",    "category": "matra",  "group": "matras",  "audio_file": None},
    {"id": "m_i",   "gurmukhi": "ਕਿ", "romanization": "ki · i matra (ਿ)",   "tts_text": "kih — short i vowel sign",   "name": "Sihari i",    "category": "matra",  "group": "matras",  "audio_file": "sihari"},
    {"id": "m_ee",  "gurmukhi": "ਕੀ", "romanization": "kee · ee matra (ੀ)", "tts_text": "keeh — long ee vowel sign",  "name": "Bihari ee",   "category": "matra",  "group": "matras",  "audio_file": "bihari"},
    {"id": "m_u",   "gurmukhi": "ਕੁ", "romanization": "ku · u matra (ੁ)",   "tts_text": "koo — short u vowel sign",   "name": "Aunkar u",    "category": "matra",  "group": "matras",  "audio_file": "aunkar"},
    {"id": "m_uu",  "gurmukhi": "ਕੂ", "romanization": "kuu · uu matra (ੂ)", "tts_text": "kooh — long uu vowel sign",  "name": "Dulainkar uu","category": "matra",  "group": "matras",  "audio_file": "dulainkar"},
    {"id": "m_e",   "gurmukhi": "ਕੇ", "romanization": "ke · e matra (ੇ)",   "tts_text": "keh — e vowel sign",         "name": "Lavan e",     "category": "matra",  "group": "matras",  "audio_file": "e"},
    {"id": "m_ai",  "gurmukhi": "ਕੈ", "romanization": "kai · ai matra (ੈ)", "tts_text": "kai — ai vowel sign",        "name": "Dulavan ai",  "category": "matra",  "group": "matras",  "audio_file": "ai"},
    {"id": "m_o",   "gurmukhi": "ਕੋ", "romanization": "ko · o matra (ੋ)",   "tts_text": "koh — o vowel sign",         "name": "Hora o",      "category": "matra",  "group": "matras",  "audio_file": "hora"},
    {"id": "m_au",  "gurmukhi": "ਕੌ", "romanization": "kau · au matra (ੌ)", "tts_text": "kow — au vowel sign",        "name": "Kanaura au",  "category": "matra",  "group": "matras",  "audio_file": "kanaura"},

    # ── Special Marks ────────────────────────────────────────────────────────
    {"id": "tippi", "gurmukhi": "ਕੰ",  "romanization": "tippi · nasal ੰ",            "tts_text": "tippi — nasalises the vowel, like n in bon",         "name": "Tippi",  "category": "special",  "group": "special",  "audio_file": None},
    {"id": "addak", "gurmukhi": "ੱਕ",  "romanization": "addak · doubles consonant ੱ", "tts_text": "addak — doubles the following consonant",            "name": "Addak",  "category": "special",  "group": "special",  "audio_file": None},

    # ── Gurmukhi Numerals ────────────────────────────────────────────────────
    {"id": "num_0", "gurmukhi": "੦",  "romanization": "0 · sifar", "tts_text": "sifar",  "name": "Sifar",  "category": "number",  "group": "numbers",  "audio_file": None},
    {"id": "num_1", "gurmukhi": "੧",  "romanization": "1 · ik",    "tts_text": "ik",     "name": "Ik",     "category": "number",  "group": "numbers",  "audio_file": None},
    {"id": "num_2", "gurmukhi": "੨",  "romanization": "2 · do",    "tts_text": "do",     "name": "Do",     "category": "number",  "group": "numbers",  "audio_file": None},
    {"id": "num_3", "gurmukhi": "੩",  "romanization": "3 · teen",  "tts_text": "teen",   "name": "Teen",   "category": "number",  "group": "numbers",  "audio_file": None},
    {"id": "num_4", "gurmukhi": "੪",  "romanization": "4 · chaar", "tts_text": "chaar",  "name": "Chaar",  "category": "number",  "group": "numbers",  "audio_file": None},
    {"id": "num_5", "gurmukhi": "੫",  "romanization": "5 · panj",  "tts_text": "panj",   "name": "Panj",   "category": "number",  "group": "numbers",  "audio_file": None},
    {"id": "num_6", "gurmukhi": "੬",  "romanization": "6 · chhe",  "tts_text": "chhe",   "name": "Chhe",   "category": "number",  "group": "numbers",  "audio_file": None},
    {"id": "num_7", "gurmukhi": "੭",  "romanization": "7 · satt",  "tts_text": "sat",    "name": "Satt",   "category": "number",  "group": "numbers",  "audio_file": None},
    {"id": "num_8", "gurmukhi": "੮",  "romanization": "8 · aath",  "tts_text": "ath",    "name": "Aath",   "category": "number",  "group": "numbers",  "audio_file": None},
    {"id": "num_9", "gurmukhi": "੯",  "romanization": "9 · nau",   "tts_text": "nau",    "name": "Nau",    "category": "number",  "group": "numbers",  "audio_file": None},
]
