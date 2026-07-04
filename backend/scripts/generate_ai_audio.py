#!/usr/bin/env python3
"""
Regenerate the AI-voice mp3s in backend/data/audio/ai_cache/.

Why this exists
---------------
The committed AI clips had drifted from the data (numbers said "punjabi
number ...", ਅ/Ara said "ra", etc.) and did not follow the human style of
saying the letter NAME then its SOUND. This script regenerates every AI clip
from a single, reviewable SPEECH map below.

Authentic Punjabi voice
------------------------
The default engine is Google TTS with **lang="pa" (Punjabi)** reading the text
in **Gurmukhi**. A native Punjabi voice reading Gurmukhi is the closest we can
get to "exactly correct" pronunciation — more reliable than any IPA/romanized
hack. Each SPEECH value is therefore written in Gurmukhi:

    - Consonants / vowel carriers:  "<Gurmukhi name>, <Gurmukhi letter>"
                                    e.g. "ਹਾਹਾ, ਹ"  → "haha, ha"  (name, pause, sound)
    - Independent vowels:           "<name>, <vowel>"      e.g. "ਆ, ਆ"
    - Matras:                       "<sign name>, <ਕ+matra>" e.g. "ਕੰਨਾ, ਕਾ"
    - Special marks:                the sign name           e.g. "ਟਿੱਪੀ"
    - Numbers:                      just the number word    e.g. "ਇੱਕ"  (no "number ...")

The "," gives a short natural pause, matching the human clips.

Usage
-----
    pip install gTTS                       # free, no key
    python backend/scripts/generate_ai_audio.py            # authentic Punjabi (default)

    # English-accent fallback (reads romanized text with an English voice):
    python backend/scripts/generate_ai_audio.py --lang en --romanized

    # Higher quality via OpenAI TTS (needs a key):
    pip install openai
    export OPENAI_API_KEY=sk-...
    python backend/scripts/generate_ai_audio.py --engine openai --voice nova

    # Only regenerate specific letters:
    python backend/scripts/generate_ai_audio.py --only num_1,num_2,ara

After running, LISTEN to a few clips and tweak the SPEECH strings (or
SPEECH_ROMANIZED) as needed, then commit the updated mp3s.
"""

import argparse
import sys
from pathlib import Path

# Make the backend package importable so we can pull the canonical letter list.
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from data.alphabet_data import PUNJABI_ALPHABET  # noqa: E402

AI_CACHE_DIR = BACKEND_DIR / "data" / "audio" / "ai_cache"

# ── Authentic Punjabi (Gurmukhi) speech — the default ───────────────────────
# What each letter should SAY, in Gurmukhi, read by a Punjabi (lang="pa") voice.
# Reviewable / editable in one place — change any string and re-run to fix a clip.
SPEECH = {
    # ── Vowel carriers — name only (they have no standalone sound) ──────────
    "ura": "ਊੜਾ",   "ara": "ਐੜਾ",   "iri": "ਈੜੀ",
    # ── Consonants — "<name>, <sound syllable>" ─────────────────────────────
    # The SOUND is the consonant + aunkar (ੁ), e.g. ਸੁ → "su". A *bare* Gurmukhi
    # consonant is read by the TTS as its NAME ("sassa"), which made the clip
    # say the name twice; a consonant+matra is read as an actual syllable.
    "sa": "ਸੱਸਾ, ਸੁ",     "ha": "ਹਾਹਾ, ਹੁ",     "ka": "ਕੱਕਾ, ਕੁ",
    "kha": "ਖੱਖਾ, ਖੁ",    "ga": "ਗੱਗਾ, ਗੁ",     "gha": "ਘੱਗਾ, ਘੁ",
    "nga": "ਙੰਙਾ, ਙੁ",    "cha": "ਚੱਚਾ, ਚੁ",     "chha": "ਛੱਛਾ, ਛੁ",
    "ja": "ਜੱਜਾ, ਜੁ",     "jha": "ਝੱਜਾ, ਝੁ",     "nya": "ਞੰਞਾ, ਞੁ",
    "tta": "ਟੈਂਕਾ, ਟੁ",    "ttha": "ਠੱਠਾ, ਠੁ",    "dda": "ਡੱਡਾ, ਡੁ",
    "ddha": "ਢੱਡਾ, ਢੁ",   "nna": "ਣਾਣਾ, ਣੁ",    "ta": "ਤੱਤਾ, ਤੁ",
    "tha": "ਥੱਥਾ, ਥੁ",    "da": "ਦੱਦਾ, ਦੁ",      "dha": "ਧੱਦਾ, ਧੁ",
    "na": "ਨੰਨਾ, ਨੁ",     "pa": "ਪੱਪਾ, ਪੁ",      "pha": "ਫੱਫਾ, ਫੁ",
    "ba": "ਬੱਬਾ, ਬੁ",     "bha": "ਭੱਬਾ, ਭੁ",     "ma": "ਮੰਮਾ, ਮੁ",
    "ya": "ਯੱਯਾ, ਯੁ",     "ra": "ਰਾਰਾ, ਰੁ",      "la": "ਲੱਲਾ, ਲੁ",
    "va": "ਵੱਵਾ, ਵੁ",
    # ── Nukta consonants (borrowed sounds) — "<name>, <sound>" ──────────────
    "sha": "ਸ਼ੱਸ਼ਾ, ਸ਼ੁ",   "kha_n": "ਖ਼ੱਖ਼ਾ, ਖ਼ੁ",  "gha_n": "ਗ਼ੱਗ਼ਾ, ਗ਼ੁ",
    "za": "ਜ਼ੱਜ਼ਾ, ਜ਼ੁ",    "lla": "ਲ਼ੱਲ਼ਾ, ਲ਼ੁ",    "fa": "ਫ਼ੱਫ਼ਾ, ਫ਼ੁ",
    # ── Independent vowels — the vowel once (its name IS its sound) ──────────
    "v_aa": "ਆ",  "v_i": "ਇ",   "v_ee": "ਈ",  "v_u": "ਉ",
    "v_uu": "ਊ",  "v_e": "ਏ",   "v_ai": "ਐ",  "v_o": "ਓ",
    "v_au": "ਔ",
    # ── Matras (sign name, then the ਕ+vowel syllable) ───────────────────────
    "m_aa": "ਕੰਨਾ, ਕਾ",    "m_i": "ਸਿਹਾਰੀ, ਕਿ",    "m_ee": "ਬਿਹਾਰੀ, ਕੀ",
    "m_u": "ਔਂਕੜ, ਕੁ",     "m_uu": "ਦੁਲੈਂਕੜ, ਕੂ",   "m_e": "ਲਾਂ, ਕੇ",
    "m_ai": "ਦੁਲਾਂ, ਕੈ",    "m_o": "ਹੋੜਾ, ਕੋ",       "m_au": "ਕਨੌੜਾ, ਕੌ",
    # ── Special marks (name only) ───────────────────────────────────────────
    "tippi": "ਟਿੱਪੀ", "addak": "ਅੱਧਕ",
    # ── Numerals (just the number word) ─────────────────────────────────────
    "num_0": "ਸਿਫ਼ਰ", "num_1": "ਇੱਕ",  "num_2": "ਦੋ",    "num_3": "ਤਿੰਨ",
    "num_4": "ਚਾਰ",  "num_5": "ਪੰਜ",  "num_6": "ਛੇ",    "num_7": "ਸੱਤ",
    "num_8": "ਅੱਠ",  "num_9": "ਨੌਂ",
}

# ── English-accent fallback (used with --romanized) ─────────────────────────
# Romanized "name, sound" for an English voice. Keeps every clip usable even
# without a Punjabi voice; addresses the same bugs (numbers say the number,
# Ara is fixed, name+sound style).
SPEECH_ROMANIZED = {
    "ura": "Oorha", "ara": "Aira", "iri": "Eeri",
    "sa": "Sassa, suh",     "ha": "Haha, huh",      "ka": "Kakka, kuh",
    "kha": "Khakha, khuh",  "ga": "Gagga, guh",     "gha": "Ghagga, ghuh",
    "nga": "Nganga, nga",   "cha": "Chacha, chuh",  "chha": "Chhachha, chhuh",
    "ja": "Jajja, juh",     "jha": "Jhajja, jhuh",  "nya": "Nyanya, nyuh",
    "tta": "Tainka, tuh",   "ttha": "Thattha, thuh","dda": "Dadda, duh",
    "ddha": "Dhadda, dhuh", "nna": "Naanna, nuh",   "ta": "Tatta, tuh",
    "tha": "Thatha, thuh",  "da": "Dadda, duh",     "dha": "Dhadha, dhuh",
    "na": "Nanna, nuh",     "pa": "Pappa, puh",     "pha": "Phappha, phuh",
    "ba": "Babba, buh",     "bha": "Bhabba, bhuh",  "ma": "Mamma, muh",
    "ya": "Yayya, yuh",     "ra": "Rara, ruh",      "la": "Lalla, luh",
    "va": "Vava, wuh",
    "sha": "Sha, shuh",     "kha_n": "Khha, khuh",  "gha_n": "Ghha, ghuh",
    "za": "Zazza, zuh",     "lla": "Lla, lluh",     "fa": "Faffa, fuh",
    "v_aa": "Aa, aa",  "v_i": "I, ih",   "v_ee": "Ee, ee",  "v_u": "U, uh",
    "v_uu": "Oo, oo",  "v_e": "E, ay",   "v_ai": "Ai, eye",  "v_o": "O, oh",
    "v_au": "Au, ow",
    "m_aa": "Kanna, kaa",   "m_i": "Sihari, ki",    "m_ee": "Bihari, kee",
    "m_u": "Aunkar, ku",    "m_uu": "Dulainkar, koo","m_e": "Laav, kay",
    "m_ai": "Dulaav, kai",  "m_o": "Hora, ko",      "m_au": "Kanaura, kau",
    "tippi": "Tippi", "addak": "Addak",
    "num_0": "sifar", "num_1": "ik",   "num_2": "do",    "num_3": "tinn",
    "num_4": "chaar", "num_5": "panj", "num_6": "chhe",  "num_7": "satt",
    "num_8": "aath",  "num_9": "nau",
}


def speech_for(letter, romanized):
    """Text to synthesize for a letter — from the chosen SPEECH map, else fallback."""
    table = SPEECH_ROMANIZED if romanized else SPEECH
    if letter["id"] in table:
        return table[letter["id"]]
    # Sane fallback if a new letter isn't in the map yet.
    if letter["category"] == "number":
        return letter["tts_text"]
    return f'{letter["name"]}, {letter["tts_text"]}'


def gen_gtts(text, out_path, lang):
    from gtts import gTTS
    gTTS(text=text, lang=lang, slow=False).save(str(out_path))


def gen_openai(text, out_path, voice):
    from openai import OpenAI
    client = OpenAI()  # reads OPENAI_API_KEY
    with client.audio.speech.with_streaming_response.create(
        model="tts-1", voice=voice, input=text
    ) as resp:
        resp.stream_to_file(str(out_path))


def main():
    ap = argparse.ArgumentParser(description="Regenerate AI-voice mp3s.")
    ap.add_argument("--engine", choices=["gtts", "openai"], default="gtts")
    ap.add_argument("--lang", default="pa", help="gTTS language (default pa = Punjabi; use en for English)")
    ap.add_argument("--romanized", action="store_true",
                    help="Use the romanized English SPEECH map instead of Gurmukhi (pair with --lang en)")
    ap.add_argument("--voice", default="nova", help="OpenAI voice")
    ap.add_argument("--only", default="", help="Comma-separated letter ids to (re)generate")
    args = ap.parse_args()

    AI_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    only = {s.strip() for s in args.only.split(",") if s.strip()}
    letters = [l for l in PUNJABI_ALPHABET if not only or l["id"] in only]

    print(f"Engine={args.engine} lang={args.lang} romanized={args.romanized} "
          f"→ {len(letters)} clips into {AI_CACHE_DIR}")
    ok = 0
    for letter in letters:
        text = speech_for(letter, args.romanized)
        out = AI_CACHE_DIR / f'{letter["id"]}.mp3'
        try:
            if args.engine == "gtts":
                gen_gtts(text, out, args.lang)
            else:
                gen_openai(text, out, args.voice)
            ok += 1
            print(f'  ✓ {letter["id"]:<7} "{text}"')
        except Exception as e:  # noqa: BLE001
            print(f'  ✗ {letter["id"]:<7} {e!r}')
    print(f"Done: {ok}/{len(letters)} generated.")


if __name__ == "__main__":
    main()
