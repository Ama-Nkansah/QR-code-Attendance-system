"""
Tests for /api/attendance routes.

LEARNING NOTE — What are we testing here?
==========================================
There are 5 endpoints in attendance.py. None of them had tests before.
We cover each one with a dedicated class so it is easy to see at a glance
which endpoint a failing test belongs to.

The 5 endpoints:
  POST   /api/attendance/sessions               → create a session
  GET    /api/attendance/sessions/<id>/qr        → get the current QR code
  POST   /api/attendance/sessions/<id>/end       → end an active session
  POST   /api/attendance/mark                    → student marks attendance
  GET    /api/attendance/sessions/<id>/records   → lecturer views who attended
"""

from app.services.qr_service import generate_qr_token

# ─── Shared test data ────────────────────────────────────────────────────────
# These dicts are reused across tests. Defining them once at the top avoids
# copy-pasting and makes it obvious what "normal" input looks like.

COURSE_DATA = {
    'course_code': 'CS301',
    'course_name': 'Data Structures',
    'department': 'Computer Science',
    'level': '300',
    'academic_year': '2024/2025',
    'semester': 'First',
}

SESSION_DATA = {
    'session_name': 'Week 1 Lecture',
    'duration_minutes': 60,
    'classroom_lat': 5.6037,
    'classroom_lng': -0.1870,
}

# GPS right at the classroom — student should pass the proximity check
NEARBY_GPS = {'student_lat': 5.6037, 'student_lng': -0.1870}

# GPS in a different city (~200 km away) — student should fail the proximity check
FAR_GPS = {'student_lat': 6.6885, 'student_lng': -1.6244}


# ─── Helper ──────────────────────────────────────────────────────────────────

def _create_session(client):
    """
    Helper that creates a course + session and returns the session ID.

    LEARNING NOTE — Why a helper function instead of a fixture?
    We only need this in a few places and the logic is short. A helper
    function keeps things simple; a fixture would be overkill here.
    """
    course_resp = client.post('/api/lecturers/courses', json=COURSE_DATA)
    course_id = course_resp.json['course']['id']
    session_resp = client.post('/api/attendance/sessions', json={
        **SESSION_DATA, 'course_id': course_id,
    })
    return session_resp.json['session']['id']


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/attendance/sessions
# ─────────────────────────────────────────────────────────────────────────────

class TestCreateSession:
    """
    LEARNING NOTE — Why use a class per endpoint?
    Grouping tests into classes makes the output of `pytest -v` look like:
      TestCreateSession::test_lecturer_can_create_session  PASSED
      TestCreateSession::test_missing_fields_are_rejected  PASSED
    This instantly tells you *which* endpoint broke without reading each name.
    """

    def test_lecturer_can_create_session(self, logged_in_lecturer):
        """Happy path: a valid request returns 201 with session data."""
        course_resp = logged_in_lecturer.post('/api/lecturers/courses', json=COURSE_DATA)
        course_id = course_resp.json['course']['id']

        response = logged_in_lecturer.post('/api/attendance/sessions', json={
            **SESSION_DATA, 'course_id': course_id,
        })

        # LEARNING NOTE — assert checks: "is this what I expect?"
        # status_code 201 means "Created" — the server made a new resource.
        assert response.status_code == 201
        assert response.json['success'] is True
        assert response.json['session']['session_name'] == 'Week 1 Lecture'

    def test_missing_fields_are_rejected(self, logged_in_lecturer):
        """Sending incomplete data should return 400 Bad Request."""
        response = logged_in_lecturer.post('/api/attendance/sessions', json={
            'session_name': 'Week 1 Lecture',
            # missing: course_id, duration_minutes, classroom_lat, classroom_lng
        })

        assert response.status_code == 400

    def test_invalid_course_returns_404(self, logged_in_lecturer):
        """Referencing a course that does not exist should return 404."""
        response = logged_in_lecturer.post('/api/attendance/sessions', json={
            **SESSION_DATA, 'course_id': 9999,
        })

        assert response.status_code == 404

    def test_duration_must_be_positive(self, logged_in_lecturer):
        """A session with 0 or negative duration should be rejected."""
        course_resp = logged_in_lecturer.post('/api/lecturers/courses', json=COURSE_DATA)
        course_id = course_resp.json['course']['id']

        response = logged_in_lecturer.post('/api/attendance/sessions', json={
            **SESSION_DATA, 'course_id': course_id, 'duration_minutes': 0,
        })

        assert response.status_code == 400

    def test_unauthenticated_request_is_rejected(self, client):
        """
        No login cookie → 401 Unauthorized.

        LEARNING NOTE — We always test the "no auth" case for every protected
        endpoint. If we forget to add the @lecturer_required decorator, this
        test will catch it immediately.
        """
        response = client.post('/api/attendance/sessions', json=SESSION_DATA)

        assert response.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/attendance/sessions/<id>/qr
# ─────────────────────────────────────────────────────────────────────────────

class TestGetQr:

    def test_lecturer_can_get_qr_for_active_session(self, logged_in_lecturer):
        """A QR code should be returned for a session that is still running."""
        session_id = _create_session(logged_in_lecturer)

        response = logged_in_lecturer.get(f'/api/attendance/sessions/{session_id}/qr')

        assert response.status_code == 200
        # The response should contain a 'qr' field with the token data
        assert 'qr' in response.json

    def test_nonexistent_session_returns_404(self, logged_in_lecturer):
        response = logged_in_lecturer.get('/api/attendance/sessions/9999/qr')

        assert response.status_code == 404

    def test_ended_session_returns_400(self, logged_in_lecturer):
        """Asking for a QR code after the session has ended should fail."""
        session_id = _create_session(logged_in_lecturer)

        # End the session first
        logged_in_lecturer.post(f'/api/attendance/sessions/{session_id}/end')

        response = logged_in_lecturer.get(f'/api/attendance/sessions/{session_id}/qr')

        assert response.status_code == 400


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/attendance/sessions/<id>/end
# ─────────────────────────────────────────────────────────────────────────────

class TestEndSession:

    def test_lecturer_can_end_session(self, logged_in_lecturer):
        """Ending an active session should return 200."""
        session_id = _create_session(logged_in_lecturer)

        response = logged_in_lecturer.post(f'/api/attendance/sessions/{session_id}/end')

        assert response.status_code == 200
        assert response.json['success'] is True

    def test_ending_already_ended_session_returns_400(self, logged_in_lecturer):
        """
        Ending the same session twice should fail on the second attempt.

        LEARNING NOTE — This tests idempotency. We want the server to protect
        against double-ending a session, not silently succeed.
        """
        session_id = _create_session(logged_in_lecturer)

        logged_in_lecturer.post(f'/api/attendance/sessions/{session_id}/end')
        response = logged_in_lecturer.post(f'/api/attendance/sessions/{session_id}/end')

        assert response.status_code == 400

    def test_nonexistent_session_returns_404(self, logged_in_lecturer):
        response = logged_in_lecturer.post('/api/attendance/sessions/9999/end')

        assert response.status_code == 404


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/attendance/mark
# ─────────────────────────────────────────────────────────────────────────────

class TestMarkAttendance:
    """
    LEARNING NOTE — Why do these tests use `student_with_active_session`?
    Marking attendance requires BOTH a student (to mark) and an active session
    (created by a lecturer). The fixture in conftest.py handles that full
    setup so each test here can focus only on what it is checking.

    LEARNING NOTE — What is generate_qr_token?
    generate_qr_token(session_id, qr_secret) builds a signed token that the
    QR code scanner would normally read from the screen. In tests we call it
    directly so we do not need to actually display or scan a QR image.
    It returns a dict; the route only needs the 'qrData' string inside it.
    """

    def test_student_can_mark_attendance(self, student_with_active_session):
        """Happy path: valid QR + nearby GPS → attendance recorded."""
        client = student_with_active_session['client']
        session_id = student_with_active_session['session_id']
        qr_secret = student_with_active_session['qr_secret']

        # Build a real, signed QR token the server will accept
        qr = generate_qr_token(session_id, qr_secret)

        response = client.post('/api/attendance/mark', json={
            'qr_data': qr['qrData'],
            **NEARBY_GPS,
        })

        assert response.status_code == 201
        assert response.json['success'] is True

    def test_missing_fields_are_rejected(self, student_with_active_session):
        """Sending the QR but no GPS coordinates should return 400."""
        client = student_with_active_session['client']
        qr_secret = student_with_active_session['qr_secret']
        session_id = student_with_active_session['session_id']

        qr = generate_qr_token(session_id, qr_secret)

        response = client.post('/api/attendance/mark', json={
            'qr_data': qr['qrData'],
            # missing: student_lat, student_lng
        })

        assert response.status_code == 400

    def test_invalid_qr_is_rejected(self, student_with_active_session):
        """
        A forged or garbled QR string should be rejected.

        LEARNING NOTE — This is a security test. Even if a student somehow
        constructs a fake QR string, the HMAC signature check should reject it.
        """
        client = student_with_active_session['client']

        response = client.post('/api/attendance/mark', json={
            'qr_data': 'not-a-real-signed-token',
            **NEARBY_GPS,
        })

        assert response.status_code == 400

    def test_student_too_far_is_rejected(self, student_with_active_session):
        """
        A valid QR but GPS far from the classroom should fail.

        LEARNING NOTE — This tests the geo-fencing logic. The classroom is at
        (5.6037, -0.1870). FAR_GPS is ~200 km away, well outside the 100m
        allowed radius.
        """
        client = student_with_active_session['client']
        session_id = student_with_active_session['session_id']
        qr_secret = student_with_active_session['qr_secret']

        qr = generate_qr_token(session_id, qr_secret)

        response = client.post('/api/attendance/mark', json={
            'qr_data': qr['qrData'],
            **FAR_GPS,
        })

        assert response.status_code == 400

    def test_duplicate_attendance_is_rejected(self, student_with_active_session):
        """
        Marking the same session twice should return 409 Conflict.

        LEARNING NOTE — We generate a *fresh* QR token for the second attempt
        to prove the duplicate check is based on (student, session) identity,
        not on the QR token itself.
        """
        client = student_with_active_session['client']
        session_id = student_with_active_session['session_id']
        qr_secret = student_with_active_session['qr_secret']

        # First attempt — should succeed
        qr1 = generate_qr_token(session_id, qr_secret)
        client.post('/api/attendance/mark', json={'qr_data': qr1['qrData'], **NEARBY_GPS})

        # Second attempt with a brand-new token — should be rejected
        qr2 = generate_qr_token(session_id, qr_secret)
        response = client.post('/api/attendance/mark', json={
            'qr_data': qr2['qrData'], **NEARBY_GPS,
        })

        assert response.status_code == 409

    def test_unauthenticated_request_is_rejected(self, client):
        response = client.post('/api/attendance/mark', json={
            'qr_data': 'anything', **NEARBY_GPS,
        })

        assert response.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/attendance/sessions/<id>/records
# ─────────────────────────────────────────────────────────────────────────────

class TestGetSessionRecords:

    def test_returns_empty_list_for_new_session(self, logged_in_lecturer):
        """A brand-new session has no attendance records yet."""
        session_id = _create_session(logged_in_lecturer)

        response = logged_in_lecturer.get(f'/api/attendance/sessions/{session_id}/records')

        assert response.status_code == 200
        assert response.json['records'] == []
        assert response.json['total'] == 0

    def test_record_appears_after_student_marks(self, student_with_active_session):
        """
        After a student marks attendance, the lecturer should see one record.

        LEARNING NOTE — This is an integration test: it exercises the full
        flow across two roles (student marks, lecturer reads). This gives us
        confidence the two endpoints work together correctly.
        """
        client = student_with_active_session['client']
        session_id = student_with_active_session['session_id']
        qr_secret = student_with_active_session['qr_secret']

        # Student marks attendance
        qr = generate_qr_token(session_id, qr_secret)
        client.post('/api/attendance/mark', json={'qr_data': qr['qrData'], **NEARBY_GPS})

        # Switch back to lecturer to read the records
        client.post('/api/auth/lecturer/login', json={
            'email': 'kwame@ug.edu.gh', 'password': 'securepassword123',
        })

        response = client.get(f'/api/attendance/sessions/{session_id}/records')

        assert response.status_code == 200
        assert response.json['total'] == 1
        assert response.json['records'][0]['index_number'] == 'UG0001'

    def test_nonexistent_session_returns_404(self, logged_in_lecturer):
        response = logged_in_lecturer.get('/api/attendance/sessions/9999/records')

        assert response.status_code == 404
