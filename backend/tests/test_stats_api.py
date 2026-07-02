"""
Stats API tests - GET /api/stats and POST /api/stats/update
Tests for the new Time Tracker feature:
  - GET /api/stats returns correct shape
  - POST /api/stats/update increments atomically
  - POST with only app_seconds (practice_seconds=0) works
  - POST with only practice_seconds (app_seconds=0) works
  - Negative values are clamped to 0
"""

import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestGetStats:
    """Tests for GET /api/stats"""

    def test_get_stats_returns_200(self):
        """GET /api/stats should return HTTP 200"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/stats returns 200")

    def test_get_stats_response_shape(self):
        """GET /api/stats must contain the four required keys"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()

        required_keys = [
            "total_app_seconds",
            "total_practice_seconds",
            "today_app_seconds",
            "today_practice_seconds",
        ]
        for key in required_keys:
            assert key in data, f"Missing key: {key}"
            assert isinstance(data[key], int), f"Key {key} should be int, got {type(data[key])}"

        print(f"PASS: GET /api/stats shape correct: {data}")

    def test_get_stats_values_non_negative(self):
        """All stat values must be >= 0"""
        response = requests.get(f"{BASE_URL}/api/stats")
        data = response.json()
        for key, val in data.items():
            assert val >= 0, f"Negative value for {key}: {val}"
        print("PASS: All stats values are non-negative")


class TestUpdateStats:
    """Tests for POST /api/stats/update"""

    def test_update_stats_returns_ok(self):
        """POST /api/stats/update should return {'ok': True}"""
        response = requests.post(
            f"{BASE_URL}/api/stats/update",
            json={"app_seconds": 1, "practice_seconds": 0},
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("ok") is True, f"Expected ok=True, got {data}"
        print("PASS: POST /api/stats/update returns ok=True")

    def test_update_with_app_seconds_only(self):
        """POST with only app_seconds (practice_seconds=0) should work"""
        # Get current stats before
        before = requests.get(f"{BASE_URL}/api/stats").json()

        # Add app seconds only
        resp = requests.post(
            f"{BASE_URL}/api/stats/update",
            json={"app_seconds": 10, "practice_seconds": 0},
        )
        assert resp.status_code == 200
        assert resp.json().get("ok") is True

        # Get stats after
        after = requests.get(f"{BASE_URL}/api/stats").json()

        # total_app_seconds should increase by at least 10
        assert after["total_app_seconds"] >= before["total_app_seconds"] + 10, (
            f"total_app_seconds did not increment: before={before['total_app_seconds']}, after={after['total_app_seconds']}"
        )
        # practice_seconds should be unchanged
        assert after["total_practice_seconds"] == before["total_practice_seconds"], (
            f"practice_seconds changed unexpectedly: before={before['total_practice_seconds']}, after={after['total_practice_seconds']}"
        )
        print(f"PASS: app-only update increments total_app_seconds correctly")

    def test_update_with_practice_seconds_only(self):
        """POST with only practice_seconds (app_seconds=0) should work"""
        before = requests.get(f"{BASE_URL}/api/stats").json()

        resp = requests.post(
            f"{BASE_URL}/api/stats/update",
            json={"app_seconds": 0, "practice_seconds": 10},
        )
        assert resp.status_code == 200
        assert resp.json().get("ok") is True

        after = requests.get(f"{BASE_URL}/api/stats").json()

        # total_practice_seconds should increase by at least 10
        assert after["total_practice_seconds"] >= before["total_practice_seconds"] + 10, (
            f"total_practice_seconds did not increment: before={before['total_practice_seconds']}, after={after['total_practice_seconds']}"
        )
        # app_seconds should be unchanged
        assert after["total_app_seconds"] == before["total_app_seconds"], (
            f"app_seconds changed unexpectedly"
        )
        print(f"PASS: practice-only update increments total_practice_seconds correctly")

    def test_update_both_seconds(self):
        """POST with both app and practice seconds should increment both"""
        before = requests.get(f"{BASE_URL}/api/stats").json()

        resp = requests.post(
            f"{BASE_URL}/api/stats/update",
            json={"app_seconds": 5, "practice_seconds": 5},
        )
        assert resp.status_code == 200

        after = requests.get(f"{BASE_URL}/api/stats").json()

        assert after["total_app_seconds"] >= before["total_app_seconds"] + 5
        assert after["total_practice_seconds"] >= before["total_practice_seconds"] + 5
        print("PASS: Both app and practice seconds incremented correctly")

    def test_update_today_app_seconds(self):
        """POST update increments today_app_seconds"""
        before = requests.get(f"{BASE_URL}/api/stats").json()

        resp = requests.post(
            f"{BASE_URL}/api/stats/update",
            json={"app_seconds": 7, "practice_seconds": 0},
        )
        assert resp.status_code == 200

        after = requests.get(f"{BASE_URL}/api/stats").json()
        assert after["today_app_seconds"] >= before["today_app_seconds"] + 7, (
            f"today_app_seconds did not increment: {before['today_app_seconds']} -> {after['today_app_seconds']}"
        )
        print("PASS: today_app_seconds incremented correctly")

    def test_update_today_practice_seconds(self):
        """POST update increments today_practice_seconds"""
        before = requests.get(f"{BASE_URL}/api/stats").json()

        resp = requests.post(
            f"{BASE_URL}/api/stats/update",
            json={"app_seconds": 0, "practice_seconds": 7},
        )
        assert resp.status_code == 200

        after = requests.get(f"{BASE_URL}/api/stats").json()
        assert after["today_practice_seconds"] >= before["today_practice_seconds"] + 7, (
            f"today_practice_seconds did not increment: {before['today_practice_seconds']} -> {after['today_practice_seconds']}"
        )
        print("PASS: today_practice_seconds incremented correctly")

    def test_update_rejects_missing_fields(self):
        """POST without required fields should return 422"""
        response = requests.post(
            f"{BASE_URL}/api/stats/update",
            json={"app_seconds": 10},  # missing practice_seconds
        )
        assert response.status_code == 422, (
            f"Expected 422 for missing fields, got {response.status_code}"
        )
        print("PASS: Missing practice_seconds returns 422")

    def test_update_zero_zero_returns_ok(self):
        """POST with both 0 should still return ok (no-op but valid)"""
        response = requests.post(
            f"{BASE_URL}/api/stats/update",
            json={"app_seconds": 0, "practice_seconds": 0},
        )
        assert response.status_code == 200
        assert response.json().get("ok") is True
        print("PASS: Zero/zero update returns ok=True")

    def test_update_negative_values_clamped(self):
        """Negative seconds should be clamped to 0 (not decrease stats)"""
        before = requests.get(f"{BASE_URL}/api/stats").json()

        response = requests.post(
            f"{BASE_URL}/api/stats/update",
            json={"app_seconds": -100, "practice_seconds": -50},
        )
        assert response.status_code == 200

        after = requests.get(f"{BASE_URL}/api/stats").json()
        # Stats should NOT decrease
        assert after["total_app_seconds"] >= before["total_app_seconds"], (
            "Negative values should not decrease app_seconds"
        )
        assert after["total_practice_seconds"] >= before["total_practice_seconds"], (
            "Negative values should not decrease practice_seconds"
        )
        print("PASS: Negative values are clamped and do not decrease stats")
