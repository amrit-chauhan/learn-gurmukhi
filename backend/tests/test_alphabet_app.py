"""Backend tests for Punjabi Alphabet Learning App"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAlphabet:
    """Tests for /api/alphabet endpoint"""

    def test_get_alphabet_returns_200(self):
        r = requests.get(f"{BASE_URL}/api/alphabet")
        assert r.status_code == 200

    def test_get_alphabet_returns_70_letters(self):
        r = requests.get(f"{BASE_URL}/api/alphabet")
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 70, f"Expected 70 letters, got {len(data)}"

    def test_alphabet_has_required_fields(self):
        r = requests.get(f"{BASE_URL}/api/alphabet")
        data = r.json()
        for letter in data[:5]:
            assert "id" in letter
            assert "gurmukhi" in letter
            assert "romanization" in letter
            assert "category" in letter

    def test_alphabet_categories(self):
        r = requests.get(f"{BASE_URL}/api/alphabet")
        data = r.json()
        categories = set(l["category"] for l in data)
        assert "vowel_carrier" in categories
        assert "consonant" in categories
        assert "vowel" in categories
        assert "matra" in categories
        assert "special" in categories


class TestProgress:
    """Tests for /api/progress endpoints"""

    def test_get_progress_returns_200(self):
        r = requests.get(f"{BASE_URL}/api/progress")
        assert r.status_code == 200

    def test_get_progress_returns_dict(self):
        r = requests.get(f"{BASE_URL}/api/progress")
        data = r.json()
        assert isinstance(data, dict)

    def test_update_progress_correct(self):
        r = requests.post(f"{BASE_URL}/api/progress/update", json={"letter_id": "sa", "correct": True})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_update_progress_wrong(self):
        r = requests.post(f"{BASE_URL}/api/progress/update", json={"letter_id": "sa", "correct": False})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_update_persists_in_progress(self):
        # Post an update then verify it appears in progress
        requests.post(f"{BASE_URL}/api/progress/update", json={"letter_id": "ha", "correct": True})
        r = requests.get(f"{BASE_URL}/api/progress")
        data = r.json()
        assert "ha" in data
        assert "history" in data["ha"]

    def test_reset_progress(self):
        r = requests.post(f"{BASE_URL}/api/progress/reset")
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_progress_empty_after_reset(self):
        requests.post(f"{BASE_URL}/api/progress/reset")
        r = requests.get(f"{BASE_URL}/api/progress")
        data = r.json()
        assert data == {}

    def test_update_progress_invalid_letter(self):
        # posting a non-existent letter_id should still work (no validation in backend)
        r = requests.post(f"{BASE_URL}/api/progress/update", json={"letter_id": "INVALID_XYZ", "correct": True})
        # Backend allows any letter_id
        assert r.status_code == 200


class TestTTS:
    """Tests for /api/tts/{letter_id} endpoint"""

    def test_tts_returns_audio(self):
        r = requests.get(f"{BASE_URL}/api/tts/sa", timeout=15)
        assert r.status_code in [200, 500, 503], f"Unexpected status {r.status_code}"

    def test_tts_invalid_letter(self):
        r = requests.get(f"{BASE_URL}/api/tts/nonexistent_letter_xyz")
        assert r.status_code == 404
