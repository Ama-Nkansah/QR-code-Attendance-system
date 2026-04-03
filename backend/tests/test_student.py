"""
Tests for /api/students routes.

LEARNING NOTE — What routes does student.py expose?
====================================================
  GET /api/students/me                        → student's own profile
  GET /api/students/attendance                → all attendance records for this student
  GET /api/students/attendance/<session_id>   → one specific record

All three require the student to be logged in (@student_required).
"""

from app.services.qr_service import generate_qr_token

NEARBY_GPS = {'student_lat': 5.6037, 'student_lng': -0.1870}


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/students/me
# ─────────────────────────────────────────────────────────────────────────────

class TestGetStudentProfile:
    """
    LEARNING NOTE — What does this endpoint do?
    It returns the profile of whoever is currently logged in.
    The student ID comes from the JWT cookie, not from the URL, so there is
    no way to look up *another* student's profile with this endpoint.
    """

    def test_logged_in_student_can_get_profile(self, logged_in_student):
        response = logged_in_student.get('/api/students/me')

        assert response.status_code == 200
        assert response.json['success'] is True
        # The index_number should match what was registered in the fixture
        assert response.json['student']['index_number'] == 'UG0001'

    def test_unauthenticated_request_is_rejected(self, client):
        """No cookie → the @student_required decorator returns 401."""
        response = client.get('/api/students/me')

        assert response.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/students/attendance
# ─────────────────────────────────────────────────────────────────────────────

class TestGetAttendanceHistory:
    """
    LEARNING NOTE — Why test an empty list separately?
    It confirms the endpoint works correctly even when the database has no
    records for this student. A common bug is forgetting to handle the empty
    case and returning an error instead of an empty list.
    """

    def test_returns_empty_list_when_no_records(self, logged_in_student):
        response = logged_in_student.get('/api/students/attendance')

        assert response.status_code == 200
        assert response.json['records'] == []
        assert response.json['total'] == 0

    def test_record_appears_after_marking(self, student_with_active_session):
        """
        After marking attendance, the history endpoint should show one record.

        LEARNING NOTE — `student_with_active_session` (defined in conftest.py)
        logs in as the student at the end of setup. So `client` here is already
        authenticated as the student — we can call the route directly.
        """
        client = student_with_active_session['client']
        session_id = student_with_active_session['session_id']
        qr_secret = student_with_active_session['qr_secret']

        # Mark attendance first so there is something to retrieve
        qr = generate_qr_token(session_id, qr_secret)
        client.post('/api/attendance/mark', json={'qr_data': qr['qrData'], **NEARBY_GPS})

        response = client.get('/api/students/attendance')

        assert response.status_code == 200
        assert response.json['total'] == 1
        assert response.json['records'][0]['session_id'] == session_id

    def test_unauthenticated_request_is_rejected(self, client):
        response = client.get('/api/students/attendance')

        assert response.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/students/attendance/<session_id>
# ─────────────────────────────────────────────────────────────────────────────

class TestGetAttendanceForSession:
    """
    LEARNING NOTE — This endpoint returns a single record for a specific
    session. It is useful when the frontend wants to confirm "did I attend
    this particular class?" without fetching the full history.
    """

    def test_no_record_returns_404(self, logged_in_student):
        """
        Asking for a session that either does not exist or was never attended
        should return 404, not 200 with empty data.
        """
        response = logged_in_student.get('/api/students/attendance/9999')

        assert response.status_code == 404

    def test_can_get_record_after_marking(self, student_with_active_session):
        """Once attendance is marked, the specific record is retrievable."""
        client = student_with_active_session['client']
        session_id = student_with_active_session['session_id']
        qr_secret = student_with_active_session['qr_secret']

        qr = generate_qr_token(session_id, qr_secret)
        client.post('/api/attendance/mark', json={'qr_data': qr['qrData'], **NEARBY_GPS})

        response = client.get(f'/api/students/attendance/{session_id}')

        assert response.status_code == 200
        assert response.json['record']['session_id'] == session_id

    def test_unauthenticated_request_is_rejected(self, client):
        response = client.get('/api/students/attendance/1')

        assert response.status_code == 401
