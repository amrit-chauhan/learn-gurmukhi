#!/usr/bin/env python3
"""
Regenerate the AI-voice mp3s in backend/data/audio/ai_cache/.

Why this exists
---------------
The committed AI clips had drifted from the data (numbers said "punjabi
number ...", ਅ/Ara said "ra", etc.) and did not follow the human style of
saying the letter NAME then its SOUND. This script regenerates every AI clip
from a single, reviewable SPEECH map below.

It must be run somewhere with internet access (the default gTTS engine and the
optional OpenAI engine both call a network API). It writes one file per letter:
    backend/data/audio/ai_cache/{letter_id}.mp3

Usage
-----
    pip install gTTS                       # default, free, no key
    python backend/scripts/generate_ai_audio.py

    # Authentic Punjabi voice (reads the text with a Punjabi accent):
    python backend/scripts/generate_ai_audio.py --lang pa

    # Higher quality via OpenAI TTS (needs a key):
    pip install openai
    export OPENAI_API_KEY=sk-...
    python backend/scripts/generate_ai_audio.py --engine openai --voice nova

    # Only regenerate specific letters:
    python backend/scripts/generate_ai_audio.py --only num_1,num_2,ara

After running, LISTEN to a few clips and tweak the SPEECH strings as needed,
then commit the updated mp3s.

Style
-----
- Consonants / vowels: "<Name>, <sound>"  e.g. "Haha, huh"  (name, short pause, sound)
- Numbers:             just the number word            e.g. "ik"
- Carriers / signs:    the name (they have no standalone consonant sound)

The "," gives a short natural pause. Text is romanized for the default English
voice; for --lang pa you may prefer to replace values with Gurmukhi spellings.
"""

import argparse
import sys
from pathlib import Path

# Make the backend package importable so we can pull the canonical letter list.
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from data.alphabet_data import PUNJABI_ALPHABET  # noqa: E402

AI_CACHE_DIR = BACKEND_DIR / "data" / "audio" / "ai_cache"

# What each letter should SAY. Keyed by letter id. Reviewable / editable in one
# place — change any string here and re-run to fix a pronunciation.
SPEECH = {
    # ── Vowel carriers (name only) ──────────────────────────────────────────
    "ura": "Oorha", "ara": "Aira", "iri": "Eeri",
    # ── Consonants — "Name, sound" ──────────────────────────────────────────
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
    # ── Nukta consonants ────────────────────────────────────────────────────
    "sha": "Sha, shuh",     "kha_n": "Khha, khuh",  "gha_n": "Ghha, ghuh",
    "za": "Zazza, zuh",     "lla": "Lla, lluh",     "fa": "Faffa, fuh",
    # ── Independent vowels — "Name, sound" ──────────────────────────────────
    "v_aa": "Aa, aa",  "v_i": "I, ih",   "v_ee": "Ee, ee",  "v_u": "U, uh",
    "v_uu": "Oo, oo",  "v_e": "E, ay",   "v_ai": "Ai, eye",  "v_o": "O, oh",
    "v_au": "Au, ow",
    # ── Matras (sign name, then the ਕ+vowel syllable) ───────────────────────
    "m_aa": "Kanna, kaa",   "m_i": "Sihari, ki",    "m_ee": "Bihari, kee",
    "m_u": "Aunkar, ku",    "m_uu": "Dulainkar, koo","m_e": "Laav, kay",
    "m_ai": "Dulaav, kai",  "m_o": "Hora, ko",      "m_au": "Kanaura, kau",
    # ── Special marks (name) ────────────────────────────────────────────────
    "tippi": "Tippi", "addak": "Addak",
    # ── Numerals (just the number word) ─────────────────────────────────────
    "num_0": "sifar", "num_1": "ik",   "num_2": "do",    "num_3": "teen",
    "num_4": "chaar", "num_5": "panj", "num_6": "chhe",  "num_7": "satt",
    "num_8": "aath",  "num_9": "nau",
}


def speech_for(letter):
    """Text to synthesize for a letter — SPEECH map, else a sane fallback."""
    if letter["id"] in SPEECH:
        return SPEECH[letter["id"]]
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
    ap.add_argument("--lang", default="en", help="gTTS language (e.g. en, pa)")
    ap.add_argument("--voice", default="nova", help="OpenAI voice")
    ap.add_argument("--only", default="", help="Comma-separated letter ids to (re)generate")
    args = ap.parse_args()

    AI_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    only = {s.strip() for s in args.only.split(",") if s.strip()}
    letters = [l for l in PUNJABI_ALPHABET if not only or l["id"] in only]

    print(f"Engine={args.engine} lang={args.lang} → {len(letters)} clips into {AI_CACHE_DIR}")
    ok = 0
    for letter in letters:
        text = speech_for(letter)
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
