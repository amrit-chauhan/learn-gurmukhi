"""
Tests for refactored backend - verifying all API endpoints work correctly
after modular restructuring (config, database, data, models, repositories, services, routes)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAlphabet:
    """GET /api/alphabet endpoint tests"""

    def test_get_alphabet_status(self):
        r = requests.get(f"{BASE_URL}/api/alphabet")
        assert r.status_code == 200

    def test_get_alphabet_count(self):
        r = requests.get(f"{BASE_URL}/api/alphabet")
        data = r.json()
        assert len(data) == 60

    def test_get_alphabet_fields(self):
        r = requests.get(f"{BASE_URL}/api/alphabet")
        data = r.json()
        letter = data[0]
        for field in ("id", "gurmukhi", "romanization", "tts_text", "name", "category"):
            assert field in letter, f"Missing field: {field}"

    def test_get_alphabet_no_empty_ids(self):
        r = requests.get(f"{BASE_URL}/api/alphabet")
        data = r.json()
        for letter in data:
            assert letter["id"], "Empty id found"
            assert letter["gurmukhi"], "Empty gurmukhi found"


class TestProgress:
    """GET/POST /api/progress endpoints"""

    def test_get_progress_status(self):
        r = requests.get(f"{BASE_URL}/api/progress")
        assert r.status_code == 200

    def test_get_progress_format(self):
        r = requests.get(f"{BASE_URL}/api/progress")
        data = r.json()
        assert isinstance(data, dict)

    def test_update_progress_correct_true(self):
        r = requests.post(f"{BASE_URL}/api/progress/update", json={"letter_id": "ka", "correct": True})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_update_progress_correct_false(self):
        r = requests.post(f"{BASE_URL}/api/progress/update", json={"letter_id": "ka", "correct": False})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_update_progress_persists(self):
        # Reset first for clean state
        requests.post(f"{BASE_URL}/api/progress/reset")
        # Record an answer
        requests.post(f"{BASE_URL}/api/progress/update", json={"letter_id": "ka", "correct": True})
        # Verify persisted
        r = requests.get(f"{BASE_URL}/api/progress")
        data = r.json()
        assert "ka" in data
        assert "history" in data["ka"]
        assert True in data["ka"]["history"]

    def test_reset_progress(self):
        # Add some data first
        requests.post(f"{BASE_URL}/api/progress/update", json={"letter_id": "ka", "correct": True})
        # Reset
        r = requests.post(f"{BASE_URL}/api/progress/reset")
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_reset_clears_progress(self):
        requests.post(f"{BASE_URL}/api/progress/update", json={"letter_id": "ka", "correct": True})
        requests.post(f"{BASE_URL}/api/progress/reset")
        r = requests.get(f"{BASE_URL}/api/progress")
        data = r.json()
        # After reset, ka should have empty history or not be present
        if "ka" in data:
            assert data["ka"]["history"] == []


class TestTTS:
    """GET /api/tts/{letter_id} endpoint tests"""

    def test_tts_valid_letter(self):
        r = requests.get(f"{BASE_URL}/api/tts/ka")
        assert r.status_code == 200

    def test_tts_content_type(self):
        r = requests.get(f"{BASE_URL}/api/tts/ka")
        assert "audio" in r.headers.get("content-type", "")

    def test_tts_invalid_letter(self):
        r = requests.get(f"{BASE_URL}/api/tts/invalid_xyz_letter")
        assert r.status_code == 404
