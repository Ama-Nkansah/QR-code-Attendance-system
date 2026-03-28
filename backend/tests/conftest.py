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
