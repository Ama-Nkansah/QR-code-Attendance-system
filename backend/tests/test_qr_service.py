"""
Tests for qr_service.py

What we're testing here:
  - haversine_distance()  → the GPS distance calculator
  - generate_secret()     → the random secret generator
  - generate_qr_token()   → creates a QR token
  - validate_qr_token()   → checks if a QR token is valid
  - extract_session_id()  → pulls the session ID out of a QR token

We start simple: no database, no server, just plain Python functions.
"""

import time

import pytest

from app.services.qr_service import (
    extract_session_id,
    generate_qr_token,
    generate_secret,
    haversine_distance,
    validate_qr_token,
)


# ---------------------------------------------------------------------------
# haversine_distance
# ---------------------------------------------------------------------------

class TestHaversineDistance:
    """GPS distance calculation tests."""

    def test_same_point_is_zero(self):
        """Same coordinates should give 0 meters."""
        dist = haversine_distance(5.6037, -0.1870, 5.6037, -0.1870)
        assert dist == 0.0

    def test_known_distance(self):
        """
        Kotoka Airport (5.6052, -0.1668) to University of Ghana (5.6502, -0.1870).
        Real distance is roughly 5.4 km. We check we're in the right ballpark.
        """
        dist = haversine_distance(5.6052, -0.1668, 5.6502, -0.1870)
        assert 5000 < dist < 6000  # between 5 km and 6 km

    def test_student_inside_radius(self):
        """Student 30 m away from classroom → should be inside a 50 m radius."""
        classroom_lat, classroom_lng = 5.6037, -0.1870
        # Shift slightly (about 30 m north)
        student_lat = classroom_lat + 0.00027
        student_lng = classroom_lng

        dist = haversine_distance(classroom_lat, classroom_lng, student_lat, student_lng)
        assert dist < 50  # within 50 metres

    def test_student_outside_radius(self):
        """Student 200 m away → should be outside a 50 m radius."""
        classroom_lat, classroom_lng = 5.6037, -0.1870
        # Shift about 200 m north
        student_lat = classroom_lat + 0.0018
        student_lng = classroom_lng

        dist = haversine_distance(classroom_lat, classroom_lng, student_lat, student_lng)
        assert dist > 50  # outside 50 metres


# ---------------------------------------------------------------------------
# generate_secret
# ---------------------------------------------------------------------------

class TestGenerateSecret:
    """Secret key generation tests."""

    def test_returns_a_string(self):
        secret = generate_secret()
        assert isinstance(secret, str)

    def test_is_64_characters(self):
        """secrets.token_hex(32) always gives 64 hex characters."""
        secret = generate_secret()
        assert len(secret) == 64

    def test_two_secrets_are_different(self):
        """Each call should produce a unique secret (random)."""
        assert generate_secret() != generate_secret()


# ---------------------------------------------------------------------------
# generate_qr_token + validate_qr_token
# ---------------------------------------------------------------------------

class TestQrToken:
    """QR token generation and validation tests."""

    def test_valid_token_passes(self):
        """A freshly generated token should pass validation."""
        secret = generate_secret()
        session_id = 42

        token = generate_qr_token(session_id, secret)
        result_id, error = validate_qr_token(token["qrData"], secret)

        assert error is None
        assert result_id == session_id

    def test_wrong_secret_fails(self):
        """Using the wrong secret to validate should fail."""
        secret = generate_secret()
        wrong_secret = generate_secret()

        token = generate_qr_token(1, secret)
        result_id, error = validate_qr_token(token["qrData"], wrong_secret)

        assert result_id is None
        assert error is not None

    def test_expired_token_fails(self):
        """
        We generate a token but then tell validate_qr_token that the
        expiry window is 0 seconds — so it's immediately expired.
        """
        secret = generate_secret()
        token = generate_qr_token(5, secret)

        result_id, error = validate_qr_token(token["qrData"], secret, expiry_seconds=0)

        assert result_id is None
        assert "expired" in error.lower()

    def test_garbage_data_fails(self):
        """Random string that isn't a valid QR token should return an error."""
        result_id, error = validate_qr_token("not-a-real-token", "any-secret")

        assert result_id is None
        assert error is not None

    def test_token_contains_expiry(self):
        """The returned token dict should include an expiresAt field."""
        token = generate_qr_token(1, generate_secret())
        assert "expiresAt" in token
        assert token["expiresAt"] > time.time()


# ---------------------------------------------------------------------------
# extract_session_id
# ---------------------------------------------------------------------------

class TestExtractSessionId:
    """Session ID extraction from QR data."""

    def test_extracts_correct_session_id(self):
        secret = generate_secret()
        token = generate_qr_token(99, secret)

        session_id, error = extract_session_id(token["qrData"])

        assert error is None
        assert session_id == 99

    def test_garbage_data_returns_error(self):
        session_id, error = extract_session_id("garbage!!!")

        assert session_id is None
        assert error is not None
