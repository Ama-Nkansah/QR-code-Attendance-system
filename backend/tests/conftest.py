"""
conftest.py — Shared test setup.

pytest automatically loads this file before running any test.
Everything defined here is available to ALL test files.

Think of it as the "before each test" setup.
"""

import pytest

from app import create_app, db


@pytest.fixture
def app():
    """
    Create a fresh Flask app configured for testing.

    'testing' config (from config.py) uses:
      - SQLite in-memory database  ← no MySQL needed
      - TESTING = True             ← disables error catching so we see real errors
    """
    app = create_app('testing')
    return app


@pytest.fixture
def client(app):
    """
    A test client — simulates sending HTTP requests to your Flask app
    without running a real server.

    Instead of:  curl -X POST http://localhost:5000/api/auth/student/login
    You write:   client.post('/api/auth/student/login', json={...})
    """
    with app.test_client() as client:
        with app.app_context():
            db.create_all()   # create all tables before each test
            yield client       # run the test
            db.drop_all()     # wipe the database after each test (clean slate)


@pytest.fixture
def registered_student(client):
    """
    A ready-made student already in the database.
    Use this in tests where you need a student to already exist.
    """
    client.post('/api/auth/student/register', json={
        'index_number': 'UG0001',
        'full_name': 'Ama Mensah',
        'email': 'ama@ug.edu.gh',
        'department': 'Computer Science',
        'level': '300',
        'pin': '1234',
    })
    return {'index_number': 'UG0001', 'pin': '1234'}


@pytest.fixture
def registered_lecturer(client):
    """
    A ready-made lecturer already in the database.
    Use this in tests where you need a lecturer to already exist.
    """
    client.post('/api/auth/lecturer/register', json={
        'staff_id': 'LEC001',
        'full_name': 'Dr. Kwame Asante',
        'email': 'kwame@ug.edu.gh',
        'password': 'securepassword123',
    })
    return {'email': 'kwame@ug.edu.gh', 'password': 'securepassword123'}


@pytest.fixture
def logged_in_lecturer(client, registered_lecturer):
    """
    A lecturer who is already logged in (has a session cookie).
    Use this in tests that require lecturer authentication.
    """
    client.post('/api/auth/lecturer/login', json=registered_lecturer)
    return client


@pytest.fixture
def logged_in_student(client, registered_student):
    """
    A student who is already logged in (has a session cookie).
    Use this in tests that require student authentication.
    """
    client.post('/api/auth/student/login', json=registered_student)
    return client


@pytest.fixture
def student_with_active_session(client, registered_student, registered_lecturer):
    """
    Sets up the complete attendance scenario in one fixture:
      1. Lecturer logs in → creates a course → starts an attendance session
      2. The session's QR secret is read directly from the database
      3. The student then logs in (replacing the lecturer's cookie)

    After this fixture runs, `client` is logged in as the STUDENT and
    ready to call POST /api/attendance/mark.

    Returns a dict with:
      - 'client'     : the test client, authenticated as the student
      - 'session_id' : ID of the active attendance session
      - 'qr_secret'  : the HMAC secret used to sign/validate QR tokens
    """
    # Step 1: Lecturer creates a course
    client.post('/api/auth/lecturer/login', json=registered_lecturer)
    course_resp = client.post('/api/lecturers/courses', json={
        'course_code': 'CS301',
        'course_name': 'Data Structures',
        'department': 'Computer Science',
        'level': '300',
        'academic_year': '2024/2025',
        'semester': 'First',
        'planned_sessions': 40,
    })
    course_id = course_resp.json['course']['id']

    # Step 2: Lecturer starts an attendance session
    session_resp = client.post('/api/attendance/sessions', json={
        'course_id': course_id,
        'session_name': 'Week 1 Lecture',
        'duration_minutes': 60,
        'classroom_lat': 5.6037,
        'classroom_lng': -0.1870,
    })
    session_id = session_resp.json['session']['id']

    # Step 3: Read the QR secret directly from the database.
    # qr_secret is never exposed in HTTP responses (by design), so we go
    # straight to the DB. The app context is already open from the `client`
    # fixture, so this query works without any extra setup.
    from app import db
    from app.models import Session as AttendanceSession
    attendance_session = db.session.get(AttendanceSession, session_id)
    qr_secret = attendance_session.qr_secret

    # Step 4: Switch to student.
    # Logging in as the student overwrites the lecturer's JWT cookie so all
    # subsequent requests on this client are authenticated as the student.
    client.post('/api/auth/student/login', json=registered_student)

    return {'client': client, 'session_id': session_id, 'qr_secret': qr_secret}
