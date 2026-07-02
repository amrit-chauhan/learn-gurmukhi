"""
Backend tests for audio/TTS feature.
Tests: GET /api/alphabet (has_human_audio field) and GET /api/tts/{letter_id}?type=human|ai|auto
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAlphabetEndpoint:
    """GET /api/alphabet - verify has_human_audio and audio_file fields"""

    def test_alphabet_returns_70_letters(self):
        response = requests.get(f"{BASE_URL}/api/alphabet")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 70, f"Expected 70 letters, got {len(data)}"
        print(f"PASS: /api/alphabet returned {len(data)} letters")

    def test_alphabet_has_human_audio_field(self):
        response = requests.get(f"{BASE_URL}/api/alphabet")
        assert response.status_code == 200
        data = response.json()
        for letter in data:
            assert "has_human_audio" in letter, f"Letter {letter.get('id')} missing has_human_audio"
            assert isinstance(letter["has_human_audio"], bool), f"has_human_audio must be bool for {letter.get('id')}"
        print("PASS: All 70 letters have has_human_audio boolean field")

    def test_alphabet_56_letters_have_human_audio(self):
        response = requests.get(f"{BASE_URL}/api/alphabet")
        assert response.status_code == 200
        data = response.json()
        with_human = [l for l in data if l["has_human_audio"]]
        without_human = [l for l in data if not l["has_human_audio"]]
        assert len(with_human) == 56, f"Expected 56 letters with human audio, got {len(with_human)}"
        assert len(without_human) == 14, f"Expected 14 letters without human audio, got {len(without_human)}"
        print(f"PASS: {len(with_human)} letters have human audio, {len(without_human)} use AI-only")

    def test_alphabet_numbers_have_no_human_audio(self):
        response = requests.get(f"{BASE_URL}/api/alphabet")
        assert response.status_code == 200
        data = response.json()
        numbers = [l for l in data if l.get("category") == "number"]
        assert len(numbers) == 10, f"Expected 10 numbers, got {len(numbers)}"
        for num in numbers:
            assert num["has_human_audio"] is False, f"Number {num['id']} should NOT have human audio"
        print(f"PASS: All 10 numbers have has_human_audio=False")

    def test_alphabet_consonant_has_human_audio(self):
        response = requests.get(f"{BASE_URL}/api/alphabet")
        assert response.status_code == 200
        data = response.json()
        sa = next((l for l in data if l["id"] == "sa"), None)
        assert sa is not None, "Letter 'sa' not found"
        assert sa["has_human_audio"] is True, "sa should have human audio"
        assert sa.get("audio_file") == "sassaa", f"Expected audio_file='sassaa', got {sa.get('audio_file')}"
        print(f"PASS: 'sa' has has_human_audio=True and audio_file='sassaa'")

    def test_alphabet_tippi_addak_no_human_audio(self):
        response = requests.get(f"{BASE_URL}/api/alphabet")
        assert response.status_code == 200
        data = response.json()
        for mark_id in ["tippi", "addak"]:
            mark = next((l for l in data if l["id"] == mark_id), None)
            assert mark is not None, f"Letter '{mark_id}' not found"
            assert mark["has_human_audio"] is False, f"'{mark_id}' should NOT have human audio"
        print("PASS: tippi and addak have has_human_audio=False")

    def test_alphabet_v_i_no_human_audio(self):
        """Independent vowel 'i' (v_i) has no human audio"""
        response = requests.get(f"{BASE_URL}/api/alphabet")
        assert response.status_code == 200
        data = response.json()
        v_i = next((l for l in data if l["id"] == "v_i"), None)
        assert v_i is not None, "Letter 'v_i' not found"
        assert v_i["has_human_audio"] is False, "v_i should NOT have human audio"
        print("PASS: v_i has has_human_audio=False")


class TestTTSHumanVoice:
    """GET /api/tts/{letter_id}?type=human - serve real human recordings"""

    def test_tts_human_sa_returns_200_mpeg(self):
        response = requests.get(f"{BASE_URL}/api/tts/sa?type=human")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.headers.get("content-type", "").startswith("audio/mpeg"), \
            f"Expected audio/mpeg, got {response.headers.get('content-type')}"
        assert len(response.content) > 1000, "Audio content too small"
        print(f"PASS: /api/tts/sa?type=human returned {len(response.content)} bytes of audio/mpeg")

    def test_tts_human_vowel_carrier_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/tts/ura?type=human")
        assert response.status_code == 200
        assert response.headers.get("content-type", "").startswith("audio/mpeg")
        print(f"PASS: /api/tts/ura?type=human returned 200")

    def test_tts_human_num_1_returns_404(self):
        """num_1 has no human audio - should 404"""
        response = requests.get(f"{BASE_URL}/api/tts/num_1?type=human")
        assert response.status_code == 404, f"Expected 404 (no human audio for num_1), got {response.status_code}"
        detail = response.json().get("detail", "")
        assert "num_1" in detail or "human" in detail.lower() or "No human audio" in detail, \
            f"Unexpected error detail: {detail}"
        print(f"PASS: /api/tts/num_1?type=human returned 404 as expected")

    def test_tts_human_tippi_returns_404(self):
        """tippi has no human audio"""
        response = requests.get(f"{BASE_URL}/api/tts/tippi?type=human")
        assert response.status_code == 404, f"Expected 404 for tippi?type=human, got {response.status_code}"
        print("PASS: /api/tts/tippi?type=human returned 404")

    def test_tts_human_v_i_returns_404(self):
        """v_i (independent vowel i) has no human audio"""
        response = requests.get(f"{BASE_URL}/api/tts/v_i?type=human")
        assert response.status_code == 404, f"Expected 404 for v_i?type=human, got {response.status_code}"
        print("PASS: /api/tts/v_i?type=human returned 404")

    def test_tts_human_nonexistent_letter_returns_404(self):
        """Unknown letter_id should return 404"""
        response = requests.get(f"{BASE_URL}/api/tts/nonexistent_letter?type=human")
        assert response.status_code == 404, f"Expected 404 for unknown letter, got {response.status_code}"
        print("PASS: /api/tts/nonexistent_letter?type=human returned 404")


class TestTTSAIVoice:
    """GET /api/tts/{letter_id}?type=ai - AI generated (cached to disk)"""

    def test_tts_ai_num_1_returns_200_mpeg(self):
        """num_1 has cached AI audio at data/audio/ai_cache/num_1.mp3"""
        response = requests.get(f"{BASE_URL}/api/tts/num_1?type=ai")
        assert response.status_code == 200, f"Expected 200 from cached AI audio, got {response.status_code}"
        assert response.headers.get("content-type", "").startswith("audio/mpeg"), \
            f"Expected audio/mpeg content-type, got {response.headers.get('content-type')}"
        assert len(response.content) > 1000, "AI audio content too small"
        print(f"PASS: /api/tts/num_1?type=ai returned {len(response.content)} bytes (from AI cache)")

    def test_tts_ai_invalid_type_returns_400(self):
        """type parameter validation - unsupported value"""
        response = requests.get(f"{BASE_URL}/api/tts/sa?type=invalid")
        assert response.status_code == 400, f"Expected 400 for invalid type, got {response.status_code}"
        print("PASS: /api/tts/sa?type=invalid returned 400")

    def test_tts_ai_nonexistent_letter_returns_404(self):
        response = requests.get(f"{BASE_URL}/api/tts/unknown?type=ai")
        assert response.status_code == 404
        print("PASS: /api/tts/unknown?type=ai returned 404")


class TestTTSAutoVoice:
    """GET /api/tts/{letter_id}?type=auto - human preferred, AI fallback"""

    def test_tts_auto_sa_returns_200(self):
        """sa has human audio - auto should serve it"""
        response = requests.get(f"{BASE_URL}/api/tts/sa?type=auto")
        assert response.status_code == 200, f"Expected 200 for sa?type=auto, got {response.status_code}"
        assert response.headers.get("content-type", "").startswith("audio/mpeg")
        print(f"PASS: /api/tts/sa?type=auto returned 200 (human recording)")

    def test_tts_auto_num_1_returns_200_ai_fallback(self):
        """num_1 has no human audio but has cached AI - auto should serve AI"""
        response = requests.get(f"{BASE_URL}/api/tts/num_1?type=auto")
        assert response.status_code == 200, f"Expected 200 for num_1?type=auto (cached AI), got {response.status_code}"
        assert response.headers.get("content-type", "").startswith("audio/mpeg")
        print(f"PASS: /api/tts/num_1?type=auto returned 200 (AI fallback from cache)")

    def test_tts_auto_default_type(self):
        """Calling without type parameter should default to auto (return 200 for human letter)"""
        response = requests.get(f"{BASE_URL}/api/tts/sa")
        assert response.status_code == 200
        print(f"PASS: /api/tts/sa (no type param) returned 200 (default auto)")

    def test_tts_auto_consonant_with_human_serves_human_size(self):
        """Verify auto for letters with human audio returns similar size as explicit human"""
        r_human = requests.get(f"{BASE_URL}/api/tts/ka?type=human")
        r_auto = requests.get(f"{BASE_URL}/api/tts/ka?type=auto")
        assert r_human.status_code == 200
        assert r_auto.status_code == 200
        # Both should return same bytes (same file)
        assert r_human.content == r_auto.content, \
            "auto should serve identical bytes as human for letters with human audio"
        print(f"PASS: /api/tts/ka?type=auto serves identical bytes as type=human ({len(r_auto.content)} bytes)")
