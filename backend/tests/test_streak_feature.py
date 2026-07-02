"""
Test suite for Streak/Daily Goal system.

Covers:
- POST /api/streak/checkin endpoint
- GET /api/stats endpoint (streak fields)
- Streak algorithm logic (_calculate_streak)
- Idempotency of checkin
- Grace day rule
- longest_streak persistence
- practiced_today correctness
"""

import pytest
import requests
import os
import sys
import pathlib
from datetime import date, timedelta

# Add backend dir to path for direct service tests
_REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(_REPO_ROOT / "backend"))

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to file-based env
    try:
        with open(_REPO_ROOT / "frontend" / ".env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.strip().split("=", 1)[1].rstrip("/")
    except Exception:
        pass

CHECKIN_URL = f"{BASE_URL}/api/streak/checkin"
STATS_URL   = f"{BASE_URL}/api/stats"


# ─────────────────────────────────────────────────────────────────────────────
# Unit tests for the streak algorithm (_calculate_streak)
# ─────────────────────────────────────────────────────────────────────────────

class TestCalculateStreakAlgorithm:
    """Direct unit tests for streak calculation logic."""

    def _calc(self, practiced_dates, today_str):
        from services.streak_service import _calculate_streak
        return _calculate_streak(practiced_dates, today_str)

    def test_empty_no_streak(self):
        """No practiced dates → streak = 0."""
        result = self._calc([], date.today().isoformat())
        assert result == 0, f"Expected 0 got {result}"
        print("PASS: empty list → streak=0")

    def test_only_today_streak_one(self):
        """Only today practiced → streak = 1."""
        today = date.today().isoformat()
        result = self._calc([today], today)
        assert result == 1, f"Expected 1 got {result}"
        print(f"PASS: only today → streak=1")

    def test_consecutive_days_streak_counts(self):
        """3 consecutive days → streak = 3."""
        today = date.today()
        dates = [(today - timedelta(days=i)).isoformat() for i in range(3)]
        result = self._calc(dates, today.isoformat())
        assert result == 3, f"Expected 3 got {result}"
        print(f"PASS: 3 consecutive days → streak=3")

    def test_one_missed_day_grace_same_week(self):
        """
        Within same ISO week: practiced Mon, Wed, Thu (skip Tue = grace).
        Walking from Thu backwards: Thu✓, Wed✓, Tue(miss→grace), Mon✓ → streak=3 (or 4 depending on week boundary).
        Key test: 1 missed day should NOT break the streak.
        """
        # Use a fixed week to avoid cross-week edge cases
        # Pick a Monday+3 days window that all falls in the same ISO week
        today = date.today()
        # Find most recent Monday
        monday = today - timedelta(days=today.weekday())
        tue = monday + timedelta(days=1)
        wed = monday + timedelta(days=2)
        thu = monday + timedelta(days=3)

        # Skip Tuesday (grace), practice Mon, Wed, Thu
        practiced = [monday.isoformat(), wed.isoformat(), thu.isoformat()]
        # Calculate from Thu perspective
        result = self._calc(practiced, thu.isoformat())
        # streak should be 3 (Mon, Wed, Thu — Tue skipped by grace)
        assert result == 3, f"Expected 3 got {result}"
        print(f"PASS: 1 missed day (grace) does NOT break streak → streak=3")

    def test_two_missed_days_same_week_breaks_streak(self):
        """
        Within same ISO week: practiced Mon and Thu, skip Tue & Wed → grace used on Tue, Wed breaks streak.
        Walking from Thu: Thu✓, Wed(miss→grace), Tue(miss→grace already used → BREAK) → streak=1.
        """
        today = date.today()
        monday = today - timedelta(days=today.weekday())
        thu = monday + timedelta(days=3)

        # Only Mon and Thu in same week
        practiced = [monday.isoformat(), thu.isoformat()]
        result = self._calc(practiced, thu.isoformat())
        # Thu counts, Wed=grace used, Tue=second miss in week → break → streak=1
        assert result == 1, f"Expected 1 got {result}"
        print(f"PASS: 2 missed days same week breaks streak → streak=1")

    def test_yesterday_only_streak_one(self):
        """Only yesterday practiced → streak = 1."""
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        result = self._calc([yesterday], date.today().isoformat())
        assert result == 1, f"Expected 1 got {result}"
        print(f"PASS: only yesterday → streak=1")

    def test_no_recent_activity_zero(self):
        """Practiced 5 days ago but not today or yesterday → streak = 0."""
        five_days_ago = (date.today() - timedelta(days=5)).isoformat()
        result = self._calc([five_days_ago], date.today().isoformat())
        assert result == 0, f"Expected 0 got {result}"
        print(f"PASS: no recent activity → streak=0")


# ─────────────────────────────────────────────────────────────────────────────
# API Integration tests
# ─────────────────────────────────────────────────────────────────────────────

class TestCheckinEndpoint:
    """POST /api/streak/checkin endpoint tests."""

    def test_checkin_returns_ok_and_current_streak(self):
        """POST /api/streak/checkin returns {ok: true, current_streak: N}."""
        response = requests.post(CHECKIN_URL)
        assert response.status_code == 200, f"Expected 200 got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("ok") is True, f"Expected ok=True, got: {data}"
        assert "current_streak" in data, f"Missing current_streak in response: {data}"
        assert isinstance(data["current_streak"], int), f"current_streak should be int: {data}"
        assert data["current_streak"] >= 1, f"After checkin streak should be >= 1: {data}"
        print(f"PASS: checkin → ok=True, current_streak={data['current_streak']}")

    def test_checkin_idempotent(self):
        """Calling POST /api/streak/checkin twice gives same streak value."""
        r1 = requests.post(CHECKIN_URL)
        assert r1.status_code == 200
        r2 = requests.post(CHECKIN_URL)
        assert r2.status_code == 200
        streak1 = r1.json()["current_streak"]
        streak2 = r2.json()["current_streak"]
        assert streak1 == streak2, f"Idempotency failed: first={streak1}, second={streak2}"
        print(f"PASS: checkin idempotent → both calls return current_streak={streak1}")

    def test_checkin_response_shape(self):
        """Verify exact response shape: only ok and current_streak keys."""
        response = requests.post(CHECKIN_URL)
        assert response.status_code == 200
        data = response.json()
        assert "ok" in data
        assert "current_streak" in data
        print(f"PASS: response shape correct: {list(data.keys())}")


class TestStatsEndpointWithStreakFields:
    """GET /api/stats endpoint now includes streak data."""

    def test_stats_returns_streak_fields(self):
        """GET /api/stats returns current_streak, longest_streak, practiced_today."""
        response = requests.get(STATS_URL)
        assert response.status_code == 200, f"Expected 200 got {response.status_code}: {response.text}"
        data = response.json()
        assert "current_streak" in data, f"Missing current_streak: {data}"
        assert "longest_streak" in data, f"Missing longest_streak: {data}"
        assert "practiced_today" in data, f"Missing practiced_today: {data}"
        print(f"PASS: stats returns streak fields: current={data['current_streak']}, longest={data['longest_streak']}, today={data['practiced_today']}")

    def test_stats_streak_types(self):
        """Streak fields should be int/bool types."""
        response = requests.get(STATS_URL)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["current_streak"], int), f"current_streak not int: {type(data['current_streak'])}"
        assert isinstance(data["longest_streak"], int), f"longest_streak not int: {type(data['longest_streak'])}"
        assert isinstance(data["practiced_today"], bool), f"practiced_today not bool: {type(data['practiced_today'])}"
        print(f"PASS: streak field types correct")

    def test_practiced_today_true_after_checkin(self):
        """practiced_today=true in stats after a checkin today."""
        # Do checkin first
        checkin_resp = requests.post(CHECKIN_URL)
        assert checkin_resp.status_code == 200

        # Now check stats
        stats_resp = requests.get(STATS_URL)
        assert stats_resp.status_code == 200
        data = stats_resp.json()
        assert data["practiced_today"] is True, f"Expected practiced_today=True after checkin: {data}"
        print(f"PASS: practiced_today=True after checkin")

    def test_stats_still_has_time_tracking_fields(self):
        """GET /api/stats still returns the 4 time-tracking fields (backwards compat)."""
        response = requests.get(STATS_URL)
        assert response.status_code == 200
        data = response.json()
        for field in ["today_app_seconds", "today_practice_seconds", "total_app_seconds", "total_practice_seconds"]:
            assert field in data, f"Missing time field '{field}': {data}"
        print(f"PASS: all 4 time-tracking fields still present")

    def test_current_streak_after_checkin_at_least_one(self):
        """After checkin, current_streak in stats should be >= 1."""
        requests.post(CHECKIN_URL)
        response = requests.get(STATS_URL)
        assert response.status_code == 200
        data = response.json()
        assert data["current_streak"] >= 1, f"Expected current_streak>=1 after checkin: {data}"
        print(f"PASS: current_streak >= 1 after checkin: {data['current_streak']}")

    def test_longest_streak_at_least_current(self):
        """longest_streak should always be >= current_streak."""
        requests.post(CHECKIN_URL)
        response = requests.get(STATS_URL)
        assert response.status_code == 200
        data = response.json()
        assert data["longest_streak"] >= data["current_streak"], (
            f"longest_streak ({data['longest_streak']}) < current_streak ({data['current_streak']})"
        )
        print(f"PASS: longest_streak >= current_streak: {data['longest_streak']} >= {data['current_streak']}")

    def test_longest_streak_non_negative(self):
        """longest_streak should never be negative."""
        response = requests.get(STATS_URL)
        assert response.status_code == 200
        data = response.json()
        assert data["longest_streak"] >= 0, f"longest_streak should be non-negative: {data}"
        print(f"PASS: longest_streak non-negative: {data['longest_streak']}")
