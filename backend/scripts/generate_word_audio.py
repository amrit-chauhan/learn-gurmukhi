#!/usr/bin/env python3
"""
Generate the practice-word mp3s in backend/data/audio/words/.

One clip per word in data/word_data.PRACTICE_WORDS, spoken by the authentic
Punjabi voice (Google TTS, lang="pa") reading the word's Gurmukhi spelling —
the same approach used for the letter AI voices (see generate_ai_audio.py).

Output: backend/data/audio/words/{word_id}.mp3

Usage
-----
    pip install gTTS
    python backend/scripts/generate_word_audio.py                 # all words
    python backend/scripts/generate_word_audio.py --only nw_5,cw_water
    python backend/scripts/generate_word_audio.py --skip-existing  # only missing clips

These are static, committed assets — the backend never generates audio at
runtime, it only reads these files from disk.
"""

import argparse
import sys
import time
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from data.word_data import PRACTICE_WORDS  # noqa: E402

WORDS_AUDIO_DIR = BACKEND_DIR / "data" / "audio" / "words"


def gen_gtts(text, out_path, lang):
    from gtts import gTTS
    gTTS(text=text, lang=lang, slow=False).save(str(out_path))


def main():
    ap = argparse.ArgumentParser(description="Generate practice-word mp3s (Punjabi voice).")
    ap.add_argument("--lang", default="pa", help="gTTS language (default pa = Punjabi)")
    ap.add_argument("--only", default="", help="Comma-separated word ids to (re)generate")
    ap.add_argument("--skip-existing", action="store_true", help="Skip words that already have an mp3")
    ap.add_argument("--sleep", type=float, default=0.0, help="Seconds to sleep between requests")
    args = ap.parse_args()

    WORDS_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    only = {s.strip() for s in args.only.split(",") if s.strip()}
    words = [w for w in PRACTICE_WORDS if not only or w["id"] in only]

    print(f"lang={args.lang} → {len(words)} words into {WORDS_AUDIO_DIR}")
    ok = skipped = failed = 0
    for w in words:
        out = WORDS_AUDIO_DIR / f'{w["id"]}.mp3'
        if args.skip_existing and out.exists():
            skipped += 1
            continue
        try:
            gen_gtts(w["gurmukhi"], out, args.lang)
            ok += 1
            if ok % 25 == 0:
                print(f"  … {ok} generated")
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f'  ✗ {w["id"]:<10} {e!r}')
        if args.sleep:
            time.sleep(args.sleep)
    print(f"Done: {ok} generated, {skipped} skipped, {failed} failed.")


if __name__ == "__main__":
    main()
