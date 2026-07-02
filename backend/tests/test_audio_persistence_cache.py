"""
Backend tests for audio persistence and caching features (iteration 11).
Tests:
  - All 70 AI cache files exist on disk and are servable via API
  - TTS endpoint returns Cache-Control: public headers
  - Server health and alphabet endpoint return 70 letters
  - Numbers (AI-only) serve audio via AI cache
  - Human audio (54 files) serve correctly with cache headers
"""

import pytest
import requests
import os
import pathlib

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

AI_CACHE_DIR = pathlib.Path('/app/backend/data/audio/ai_cache')
HUMAN_AUDIO_DIR = pathlib.Path('/app/backend/data/audio/human')


class TestAudioFilePersistence:
    """Verify audio files exist on disk as expected"""

    def test_ai_cache_dir_has_70_files(self):
        """Verify 70 AI mp3 files are present on disk"""
        files = list(AI_CACHE_DIR.glob('*.mp3'))
        assert len(files) == 70, f"Expected 70 AI cache files, found {len(files)}"
        print(f"PASS: AI cache dir has {len(files)} .mp3 files")

    def test_human_audio_dir_has_54_files(self):
        """Verify 54 human mp3 files are present on disk"""
        files = list(HUMAN_AUDIO_DIR.glob('*.mp3'))
        assert len(files) == 54, f"Expected 54 human audio files, found {len(files)}"
        print(f"PASS: Human audio dir has {len(files)} .mp3 files")

    def test_ai_cache_all_files_are_nonzero(self):
        """All AI cache files should be non-empty MP3 files"""
        files = list(AI_CACHE_DIR.glob('*.mp3'))
        empty = [f.name for f in files if f.stat().st_size < 500]
        assert len(empty) == 0, f"Found empty/tiny AI cache files: {empty}"
        print(f"PASS: All 70 AI cache files are non-empty")

    def test_human_audio_all_files_are_nonzero(self):
        """All human audio files should be non-empty"""
        files = list(HUMAN_AUDIO_DIR.glob('*.mp3'))
        empty = [f.name for f in files if f.stat().st_size < 500]
        assert len(empty) == 0, f"Found empty/tiny human files: {empty}"
        print(f"PASS: All 54 human audio files are non-empty")


class TestCacheControlHeaders:
    """TTS endpoint must return Cache-Control: public headers"""

    def test_tts_cache_control_human_sa(self):
        """GET /api/tts/sa?type=human should have Cache-Control: public"""
        response = requests.get(f"{BASE_URL}/api/tts/sa?type=human")
        assert response.status_code == 200
        cc = response.headers.get("Cache-Control", "")
        assert "public" in cc, f"Expected 'public' in Cache-Control, got: '{cc}'"
        print(f"PASS: /api/tts/sa?type=human Cache-Control: {cc}")

    def test_tts_cache_control_ai_num_1(self):
        """GET /api/tts/num_1?type=ai should have Cache-Control: public"""
        response = requests.get(f"{BASE_URL}/api/tts/num_1?type=ai")
        assert response.status_code == 200
        cc = response.headers.get("Cache-Control", "")
        assert "public" in cc, f"Expected 'public' in Cache-Control for AI, got: '{cc}'"
        print(f"PASS: /api/tts/num_1?type=ai Cache-Control: {cc}")

    def test_tts_cache_control_max_age(self):
        """Cache-Control must include max-age=86400"""
        response = requests.get(f"{BASE_URL}/api/tts/sa?type=human")
        assert response.status_code == 200
        cc = response.headers.get("Cache-Control", "")
        assert "max-age=86400" in cc, f"Expected max-age=86400 in Cache-Control, got: '{cc}'"
        print(f"PASS: Cache-Control has max-age=86400: {cc}")

    def test_tts_cache_control_immutable(self):
        """Cache-Control should include 'immutable' directive"""
        response = requests.get(f"{BASE_URL}/api/tts/sa?type=human")
        assert response.status_code == 200
        cc = response.headers.get("Cache-Control", "")
        assert "immutable" in cc, f"Expected 'immutable' in Cache-Control, got: '{cc}'"
        print(f"PASS: Cache-Control has immutable: {cc}")

    def test_tts_cache_control_auto_type(self):
        """GET /api/tts/sa (default auto) also has Cache-Control headers"""
        response = requests.get(f"{BASE_URL}/api/tts/sa")
        assert response.status_code == 200
        cc = response.headers.get("Cache-Control", "")
        assert "public" in cc, f"Expected 'public' in Cache-Control for auto, got: '{cc}'"
        print(f"PASS: /api/tts/sa (auto) Cache-Control: {cc}")

    def test_content_type_is_audio_mpeg(self):
        """All TTS responses must return audio/mpeg content-type"""
        for letter_id, voice_type in [("sa", "human"), ("num_1", "ai"), ("ka", "auto")]:
            response = requests.get(f"{BASE_URL}/api/tts/{letter_id}?type={voice_type}")
            assert response.status_code == 200
            ct = response.headers.get("content-type", "")
            assert "audio/mpeg" in ct, f"Expected audio/mpeg for {letter_id}?type={voice_type}, got: {ct}"
        print("PASS: All TTS responses return audio/mpeg content-type")


class TestAllAICacheViaAPI:
    """All 70 AI cached letters must be servable via the API"""

    def _get_all_letter_ids(self):
        response = requests.get(f"{BASE_URL}/api/alphabet")
        assert response.status_code == 200
        return [l['id'] for l in response.json()]

    def test_all_70_ai_letters_serve_audio(self):
        """Each of the 70 letters should return 200 for type=ai (from cache)"""
        letter_ids = self._get_all_letter_ids()
        assert len(letter_ids) == 70, f"Expected 70 letters, got {len(letter_ids)}"

        failed = []
        for lid in letter_ids:
            r = requests.get(f"{BASE_URL}/api/tts/{lid}?type=ai")
            if r.status_code != 200:
                failed.append((lid, r.status_code))

        assert len(failed) == 0, \
            f"{len(failed)} AI TTS calls failed (expected all 200 from cache): {failed[:10]}"
        print(f"PASS: All 70 letters return 200 for type=ai")

    def test_number_letters_ai_cache(self):
        """Numbers (num_0 through num_9) must all serve AI audio from cache"""
        failed = []
        for i in range(10):
            lid = f"num_{i}"
            r = requests.get(f"{BASE_URL}/api/tts/{lid}?type=ai")
            if r.status_code != 200:
                failed.append((lid, r.status_code))
            elif len(r.content) < 500:
                failed.append((lid, f"tiny={len(r.content)}bytes"))

        assert len(failed) == 0, \
            f"Number AI TTS failures: {failed}"
        print(f"PASS: All 10 number letters return 200 for type=ai with proper content")

    def test_numbers_no_human_audio(self):
        """Numbers should return 404 for type=human"""
        for i in range(10):
            lid = f"num_{i}"
            r = requests.get(f"{BASE_URL}/api/tts/{lid}?type=human")
            assert r.status_code == 404, \
                f"Expected 404 for {lid}?type=human (AI-only), got {r.status_code}"
        print("PASS: All 10 number letters return 404 for type=human (AI-only)")

    def test_number_ai_auto_fallback(self):
        """Numbers with no human audio: type=auto should fall back to AI cache"""
        for i in range(10):
            lid = f"num_{i}"
            r = requests.get(f"{BASE_URL}/api/tts/{lid}?type=auto")
            assert r.status_code == 200, \
                f"Expected 200 for {lid}?type=auto (AI fallback), got {r.status_code}"
        print("PASS: All 10 numbers return 200 for type=auto (AI fallback from cache)")


class TestServerHealthAfterLoad:
    """Server must remain healthy and responsive"""

    def test_alphabet_still_returns_70_after_load(self):
        """alphabet endpoint returns 70 letters even while under load"""
        response = requests.get(f"{BASE_URL}/api/alphabet")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 70, f"Expected 70 letters, got {len(data)}"
        print(f"PASS: /api/alphabet returned {len(data)} letters")

    def test_alphabet_response_time_acceptable(self):
        """alphabet endpoint responds within 3 seconds"""
        import time
        start = time.time()
        response = requests.get(f"{BASE_URL}/api/alphabet")
        elapsed = time.time() - start
        assert response.status_code == 200
        assert elapsed < 3.0, f"Alphabet endpoint took too long: {elapsed:.2f}s"
        print(f"PASS: /api/alphabet responded in {elapsed:.3f}s")

    def test_multiple_concurrent_tts_requests(self):
        """Server handles multiple TTS requests without errors"""
        import concurrent.futures

        def fetch_tts(letter_id):
            r = requests.get(f"{BASE_URL}/api/tts/{letter_id}?type=ai")
            return letter_id, r.status_code

        # Simulate preloader: 12 concurrent requests
        test_ids = ["sa", "ka", "num_1", "num_2", "num_3", "ka", "ba", "ga", "ha", "ja", "na", "pa"]
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            results = list(executor.map(fetch_tts, test_ids))

        failed = [(lid, code) for lid, code in results if code != 200]
        assert len(failed) == 0, f"Concurrent TTS requests failed: {failed}"
        print(f"PASS: All {len(results)} concurrent TTS requests returned 200")

    def test_tts_audio_bytes_size_reasonable(self):
        """Sampled TTS responses should have reasonable audio sizes"""
        sample_ids = ["sa", "ka", "num_0", "num_5", "ba"]
        for lid in sample_ids:
            r = requests.get(f"{BASE_URL}/api/tts/{lid}?type=ai")
            assert r.status_code == 200
            size = len(r.content)
            assert 1000 < size < 10_000_000, \
                f"Unexpected size for {lid}: {size} bytes"
        print(f"PASS: All sampled AI audio files have reasonable sizes")
