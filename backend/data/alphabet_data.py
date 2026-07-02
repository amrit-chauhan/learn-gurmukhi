"""
Static alphabet data.
Single source of truth for all 70 Gurmukhi letters + numbers.
Each entry is an immutable dict; shape is enforced by models.AlphabetLetter.

audio_file: filename (no extension) inside data/audio/human/, or None for AI-TTS-only letters.
"""

from typing import List, Dict, Any

PUNJABI_ALPHABET: List[Dict[str, Any]] = [
    # ── Vowel Carriers ──────────────────────────────────────────────────────
    {"id": "ura",   "gurmukhi": "ੳ",  "romanization": "Ura",          "tts_text": "oo rah",              "name": "Ura",             "category": "vowel_carrier",    "audio_file": "oorhaa"},
    {"id": "ara",   "gurmukhi": "ਅ",  "romanization": "Ara",          "tts_text": "uh rah",              "name": "Ara",             "category": "vowel_carrier",    "audio_file": "airhaa"},
    {"id": "iri",   "gurmukhi": "ੲ",  "romanization": "Iri",          "tts_text": "ee ree",              "name": "Iri",             "category": "vowel_carrier",    "audio_file": "eerhee"},

    # ── Consonants ──────────────────────────────────────────────────────────
    {"id": "sa",    "gurmukhi": "ਸ",  "romanization": "sa",           "tts_text": "suh",                 "name": "Sassa",           "category": "consonant",        "audio_file": "sassaa"},
    {"id": "ha",    "gurmukhi": "ਹ",  "romanization": "ha",           "tts_text": "huh",                 "name": "Haha",            "category": "consonant",        "audio_file": "haahaa"},
    {"id": "ka",    "gurmukhi": "ਕ",  "romanization": "ka",           "tts_text": "kuh",                 "name": "Kakka",           "category": "consonant",        "audio_file": "kakkaa"},
    {"id": "kha",   "gurmukhi": "ਖ",  "romanization": "kha",          "tts_text": "k-huh",               "name": "Khakha",          "category": "consonant",        "audio_file": "khakhkhaa"},
    {"id": "ga",    "gurmukhi": "ਗ",  "romanization": "ga",           "tts_text": "guh",                 "name": "Gagga",           "category": "consonant",        "audio_file": "gaggaa"},
    {"id": "gha",   "gurmukhi": "ਘ",  "romanization": "gha",          "tts_text": "g-huh",               "name": "Ghagha",          "category": "consonant",        "audio_file": "ghaggaa"},
    {"id": "nga",   "gurmukhi": "ਙ",  "romanization": "nga",          "tts_text": "ng-uh",               "name": "Nganga",          "category": "consonant",        "audio_file": "nganngaa"},
    {"id": "cha",   "gurmukhi": "ਚ",  "romanization": "cha",          "tts_text": "chuh",                "name": "Chacha",          "category": "consonant",        "audio_file": "chachchaa"},
    {"id": "chha",  "gurmukhi": "ਛ",  "romanization": "chha",         "tts_text": "chh-uh",              "name": "Chhachha",        "category": "consonant",        "audio_file": "chhachhchhaa"},
    {"id": "ja",    "gurmukhi": "ਜ",  "romanization": "ja",           "tts_text": "juh",                 "name": "Jajja",           "category": "consonant",        "audio_file": "jajjaa"},
    {"id": "jha",   "gurmukhi": "ਝ",  "romanization": "jha",          "tts_text": "jh-uh",               "name": "Jhajha",          "category": "consonant",        "audio_file": "jhajjaa"},
    {"id": "nya",   "gurmukhi": "ਞ",  "romanization": "nya",          "tts_text": "nyuh",                "name": "Njanja",          "category": "consonant",        "audio_file": "njannjaa"},
    {"id": "tta",   "gurmukhi": "ਟ",  "romanization": "tta",          "tts_text": "retroflex tuh",       "name": "Taitta",          "category": "consonant",        "audio_file": "tainkaa"},
    {"id": "ttha",  "gurmukhi": "ਠ",  "romanization": "ttha",         "tts_text": "retroflex thuh",      "name": "Taitta aspirated","category": "consonant",        "audio_file": "thaththaa1"},
    {"id": "dda",   "gurmukhi": "ਡ",  "romanization": "dda",          "tts_text": "retroflex duh",       "name": "Dadda",           "category": "consonant",        "audio_file": "daddaa1"},
    {"id": "ddha",  "gurmukhi": "ਢ",  "romanization": "ddha",         "tts_text": "retroflex dhuh",      "name": "Dhadha",          "category": "consonant",        "audio_file": "dhaddaa1"},
    {"id": "nna",   "gurmukhi": "ਣ",  "romanization": "nna",          "tts_text": "retroflex nnuh",      "name": "Nanna",           "category": "consonant",        "audio_file": "nhaanhaa"},
    {"id": "ta",    "gurmukhi": "ਤ",  "romanization": "ta",           "tts_text": "tuh",                 "name": "Tatta",           "category": "consonant",        "audio_file": "tattaa"},
    {"id": "tha",   "gurmukhi": "ਥ",  "romanization": "tha",          "tts_text": "thuh",                "name": "Thatha",          "category": "consonant",        "audio_file": "thaththaa2"},
    {"id": "da",    "gurmukhi": "ਦ",  "romanization": "da",           "tts_text": "duh",                 "name": "Dadda dental",    "category": "consonant",        "audio_file": "daddaa2"},
    {"id": "dha",   "gurmukhi": "ਧ",  "romanization": "dha",          "tts_text": "dhuh",                "name": "Dhadha dental",   "category": "consonant",        "audio_file": "dhaddaa2"},
    {"id": "na",    "gurmukhi": "ਨ",  "romanization": "na",           "tts_text": "nuh",                 "name": "Nanna",           "category": "consonant",        "audio_file": "nannaa"},
    {"id": "pa",    "gurmukhi": "ਪ",  "romanization": "pa",           "tts_text": "puh",                 "name": "Pappa",           "category": "consonant",        "audio_file": "pappaa"},
    {"id": "pha",   "gurmukhi": "ਫ",  "romanization": "pha",          "tts_text": "phuh",                "name": "Phappha",         "category": "consonant",        "audio_file": "phaphphaa"},
    {"id": "ba",    "gurmukhi": "ਬ",  "romanization": "ba",           "tts_text": "buh",                 "name": "Babba",           "category": "consonant",        "audio_file": "babbaa"},
    {"id": "bha",   "gurmukhi": "ਭ",  "romanization": "bha",          "tts_text": "bhuh",                "name": "Bhabbha",         "category": "consonant",        "audio_file": "bhabbaa"},
    {"id": "ma",    "gurmukhi": "ਮ",  "romanization": "ma",           "tts_text": "muh",                 "name": "Mamma",           "category": "consonant",        "audio_file": "mammaa"},
    {"id": "ya",    "gurmukhi": "ਯ",  "romanization": "ya",           "tts_text": "yuh",                 "name": "Yayya",           "category": "consonant",        "audio_file": "yayyaa"},
    {"id": "ra",    "gurmukhi": "ਰ",  "romanization": "ra",           "tts_text": "ruh",                 "name": "Rara",            "category": "consonant",        "audio_file": "raaraa"},
    {"id": "la",    "gurmukhi": "ਲ",  "romanization": "la",           "tts_text": "luh",                 "name": "Lalla",           "category": "consonant",        "audio_file": "lallaa"},
    {"id": "va",    "gurmukhi": "ਵ",  "romanization": "va / wa",      "tts_text": "vuh",                 "name": "Vava",            "category": "consonant",        "audio_file": "vavvaa"},

    # ── Nukta Consonants (borrowed sounds) ──────────────────────────────────
    {"id": "sha",   "gurmukhi": "ਸ਼", "romanization": "sha",          "tts_text": "shuh",                "name": "Sha (nukta)",     "category": "consonant_nukta",  "audio_file": "shashashaa"},
    {"id": "kha_n", "gurmukhi": "ਖ਼", "romanization": "kha (nukta)",  "tts_text": "guttural khuh",       "name": "Kha (nukta)",     "category": "consonant_nukta",  "audio_file": "khhakhhkhha"},
    {"id": "gha_n", "gurmukhi": "ਗ਼", "romanization": "gha (nukta)",  "tts_text": "guttural ghuh",       "name": "Gha (nukta)",     "category": "consonant_nukta",  "audio_file": "ghagghaa"},
    {"id": "za",    "gurmukhi": "ਜ਼", "romanization": "za",           "tts_text": "zuh",                 "name": "Za (nukta)",      "category": "consonant_nukta",  "audio_file": "zazzaa"},
    {"id": "lla",   "gurmukhi": "ਲ਼", "romanization": "lla",          "tts_text": "lluh",                "name": "Lla (nukta)",     "category": "consonant_nukta",  "audio_file": "lallaadot"},
    {"id": "fa",    "gurmukhi": "ਫ਼", "romanization": "fa",           "tts_text": "fuh",                 "name": "Fa (nukta)",      "category": "consonant_nukta",  "audio_file": "faffaa"},

    # ── Independent Vowels ───────────────────────────────────────────────────
    {"id": "v_aa",  "gurmukhi": "ਆ",  "romanization": "aa",           "tts_text": "aah",                 "name": "Aa",              "category": "vowel",            "audio_file": "aa"},
    {"id": "v_i",   "gurmukhi": "ਇ",  "romanization": "i",            "tts_text": "ih",                  "name": "I",               "category": "vowel",            "audio_file": None},
    {"id": "v_ee",  "gurmukhi": "ਈ",  "romanization": "ee",           "tts_text": "eeh",                 "name": "Ee",              "category": "vowel",            "audio_file": "ee"},
    {"id": "v_u",   "gurmukhi": "ਉ",  "romanization": "u",            "tts_text": "oo short",            "name": "U",               "category": "vowel",            "audio_file": "u"},
    {"id": "v_uu",  "gurmukhi": "ਊ",  "romanization": "uu",           "tts_text": "ooh long",            "name": "Uu",              "category": "vowel",            "audio_file": "oo"},
    {"id": "v_e",   "gurmukhi": "ਏ",  "romanization": "e",            "tts_text": "eh",                  "name": "E",               "category": "vowel",            "audio_file": "e"},
    {"id": "v_ai",  "gurmukhi": "ਐ",  "romanization": "ai",           "tts_text": "ai as in eye",        "name": "Ai",              "category": "vowel",            "audio_file": "ai"},
    {"id": "v_o",   "gurmukhi": "ਓ",  "romanization": "o",            "tts_text": "oh",                  "name": "O",               "category": "vowel",            "audio_file": "o"},
    {"id": "v_au",  "gurmukhi": "ਔ",  "romanization": "au",           "tts_text": "ow as in cow",        "name": "Au",              "category": "vowel",            "audio_file": "au"},

    # ── Matras (vowel signs shown with ਕ base) ──────────────────────────────
    {"id": "m_aa",  "gurmukhi": "ਕਾ", "romanization": "kaa · aa matra (ਾ)",  "tts_text": "kaah — long aa vowel sign",  "name": "Lavan aa",    "category": "matra",  "audio_file": None},
    {"id": "m_i",   "gurmukhi": "ਕਿ", "romanization": "ki · i matra (ਿ)",   "tts_text": "kih — short i vowel sign",   "name": "Sihari i",    "category": "matra",  "audio_file": "sihari"},
    {"id": "m_ee",  "gurmukhi": "ਕੀ", "romanization": "kee · ee matra (ੀ)", "tts_text": "keeh — long ee vowel sign",  "name": "Bihari ee",   "category": "matra",  "audio_file": "bihari"},
    {"id": "m_u",   "gurmukhi": "ਕੁ", "romanization": "ku · u matra (ੁ)",   "tts_text": "koo — short u vowel sign",   "name": "Aunkar u",    "category": "matra",  "audio_file": "aunkar"},
    {"id": "m_uu",  "gurmukhi": "ਕੂ", "romanization": "kuu · uu matra (ੂ)", "tts_text": "kooh — long uu vowel sign",  "name": "Dulainkar uu","category": "matra",  "audio_file": "dulainkar"},
    {"id": "m_e",   "gurmukhi": "ਕੇ", "romanization": "ke · e matra (ੇ)",   "tts_text": "keh — e vowel sign",         "name": "Lavan e",     "category": "matra",  "audio_file": "e"},
    {"id": "m_ai",  "gurmukhi": "ਕੈ", "romanization": "kai · ai matra (ੈ)", "tts_text": "kai — ai vowel sign",        "name": "Dulavan ai",  "category": "matra",  "audio_file": "ai"},
    {"id": "m_o",   "gurmukhi": "ਕੋ", "romanization": "ko · o matra (ੋ)",   "tts_text": "koh — o vowel sign",         "name": "Hora o",      "category": "matra",  "audio_file": "hora"},
    {"id": "m_au",  "gurmukhi": "ਕੌ", "romanization": "kau · au matra (ੌ)", "tts_text": "kow — au vowel sign",        "name": "Kanaura au",  "category": "matra",  "audio_file": "kanaura"},

    # ── Special Marks ────────────────────────────────────────────────────────
    {"id": "tippi", "gurmukhi": "ਕੰ",  "romanization": "tippi · nasal ੰ",            "tts_text": "tippi — nasalises the vowel, like n in bon",         "name": "Tippi",  "category": "special",  "audio_file": None},
    {"id": "addak", "gurmukhi": "ੱਕ",  "romanization": "addak · doubles consonant ੱ", "tts_text": "addak — doubles the following consonant",            "name": "Addak",  "category": "special",  "audio_file": None},

    # ── Gurmukhi Numerals ────────────────────────────────────────────────────
    {"id": "num_0", "gurmukhi": "੦",  "romanization": "0 · sifar", "tts_text": "sifar",  "name": "Sifar",  "category": "number",  "audio_file": None},
    {"id": "num_1", "gurmukhi": "੧",  "romanization": "1 · ik",    "tts_text": "ik",     "name": "Ik",     "category": "number",  "audio_file": None},
    {"id": "num_2", "gurmukhi": "੨",  "romanization": "2 · do",    "tts_text": "do",     "name": "Do",     "category": "number",  "audio_file": None},
    {"id": "num_3", "gurmukhi": "੩",  "romanization": "3 · teen",  "tts_text": "teen",   "name": "Teen",   "category": "number",  "audio_file": None},
    {"id": "num_4", "gurmukhi": "੪",  "romanization": "4 · chaar", "tts_text": "chaar",  "name": "Chaar",  "category": "number",  "audio_file": None},
    {"id": "num_5", "gurmukhi": "੫",  "romanization": "5 · panj",  "tts_text": "panj",   "name": "Panj",   "category": "number",  "audio_file": None},
    {"id": "num_6", "gurmukhi": "੬",  "romanization": "6 · chhe",  "tts_text": "chhe",   "name": "Chhe",   "category": "number",  "audio_file": None},
    {"id": "num_7", "gurmukhi": "੭",  "romanization": "7 · satt",  "tts_text": "sat",    "name": "Satt",   "category": "number",  "audio_file": None},
    {"id": "num_8", "gurmukhi": "੮",  "romanization": "8 · aath",  "tts_text": "ath",    "name": "Aath",   "category": "number",  "audio_file": None},
    {"id": "num_9", "gurmukhi": "੯",  "romanization": "9 · nau",   "tts_text": "nau",    "name": "Nau",    "category": "number",  "audio_file": None},
]
