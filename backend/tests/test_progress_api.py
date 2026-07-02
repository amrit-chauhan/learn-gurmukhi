"""
Test suite for the Progress API.

Covers:
- GET /api/progress
- POST /api/progress/update
- POST /api/progress/reset
- History cap (settings.progress_history_cap)
"""

import os

import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

PROGRESS_URL = f"{BASE_URL}/api/progress"
UPDATE_URL = f"{BASE_URL}/api/progress/update"
RESET_URL = f"{BASE_URL}/api/progress/reset"


class TestGetProgress:
    """GET /api/progress"""

    def test_get_progress_returns_200(self):
        response = requests.get(PROGRESS_URL)
        assert response.status_code == 200

    def test_get_progress_returns_dict(self):
        response = requests.get(PROGRESS_URL)
        data = response.json()
        assert isinstance(data, dict), f"Expected dict, got {type(data)}"

    def test_progress_entries_have_history_list(self):
        response = requests.get(PROGRESS_URL)
        data = response.json()
        for letter_id, entry in data.items():
            assert "history" in entry, f"Missing 'history' for {letter_id}"
            assert isinstance(entry["history"], list), f"'history' not a list for {letter_id}"


class TestUpdateProgress:
    """POST /api/progress/update"""

    def test_update_correct_answer_returns_ok(self):
        response = requests.post(UPDATE_URL, json={"letter_id": "sa", "correct": True})
        assert response.status_code == 200
        assert response.json().get("ok") is True

    def test_update_wrong_answer_returns_ok(self):
        response = requests.post(UPDATE_URL, json={"letter_id": "sa", "correct": False})
        assert response.status_code == 200
        assert response.json().get("ok") is True

    def test_update_appends_to_history(self):
        requests.post(RESET_URL)
        requests.post(UPDATE_URL, json={"letter_id": "ka", "correct": True})
        requests.post(UPDATE_URL, json={"letter_id": "ka", "correct": False})
        requests.post(UPDATE_URL, json={"letter_id": "ka", "correct": True})

        data = requests.get(PROGRESS_URL).json()
        assert data["ka"]["history"] == [True, False, True]

    def test_update_missing_letter_id_returns_422(self):
        response = requests.post(UPDATE_URL, json={"correct": True})
        assert response.status_code == 422

    def test_update_missing_correct_returns_422(self):
        response = requests.post(UPDATE_URL, json={"letter_id": "sa"})
        assert response.status_code == 422

    def test_update_history_capped_at_50(self):
        requests.post(RESET_URL)
        for i in range(60):
            requests.post(UPDATE_URL, json={"letter_id": "ha", "correct": i % 2 == 0})

        data = requests.get(PROGRESS_URL).json()
        assert len(data["ha"]["history"]) == 50, \
            f"Expected history capped at 50, got {len(data['ha']['history'])}"
        # Most recent entry should be last of the 60 pushed (i=59 -> False)
        assert data["ha"]["history"][-1] is False


class TestResetProgress:
    """POST /api/progress/reset"""

    def test_reset_returns_ok(self):
        response = requests.post(RESET_URL)
        assert response.status_code == 200
        assert response.json().get("ok") is True

    def test_reset_clears_all_progress(self):
        requests.post(UPDATE_URL, json={"letter_id": "ba", "correct": True})
        requests.post(RESET_URL)
        data = requests.get(PROGRESS_URL).json()
        assert data == {}, f"Expected empty progress after reset, got {data}"
