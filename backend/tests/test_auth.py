"""
Tests for /api/auth routes.

We test both the happy path (things that should work)
and the sad path (things that should fail).

Each test method name tells you exactly what scenario is being tested.
"""


class TestStudentRegister:
    """POST /api/auth/student/register"""

    def test_successful_registration(self, client):
        """A new student with valid data should register successfully."""
        response = client.post('/api/auth/student/register', json={
            'index_number': 'UG0001',
            'full_name': 'Ama Mensah',
            'email': 'ama@ug.edu.gh',
            'department': 'Computer Science',
            'level': '300',
            'pin': '1234',
        })

        assert response.status_code == 201
        assert response.json['success'] is True

    def test_duplicate_index_number_is_rejected(self, client, registered_student):
        """Registering the same index number twice should fail."""
        response = client.post('/api/auth/student/register', json={
            'index_number': 'UG0001',  # same as registered_student
            'full_name': 'Someone Else',
            'email': 'other@ug.edu.gh',
            'department': 'Mathematics',
            'level': '200',
            'pin': '5678',
        })

        assert response.status_code == 409  # 409 = Conflict
        assert 'already registered' in response.json['message']

    def test_duplicate_email_is_rejected(self, client, registered_student):
        """Registering the same email twice should fail."""
        response = client.post('/api/auth/student/register', json={
            'index_number': 'UG9999',
            'full_name': 'Someone Else',
            'email': 'ama@ug.edu.gh',  # same email as registered_student
            'department': 'Mathematics',
            'level': '200',
            'pin': '5678',
        })

        assert response.status_code == 409

    def test_missing_fields_are_rejected(self, client):
        """Sending incomplete data should fail with 400."""
        response = client.post('/api/auth/student/register', json={
            'index_number': 'UG0002',
            # missing full_name, email, department, level, pin
        })

        assert response.status_code == 400
        assert 'Missing fields' in response.json['message']

    def test_pin_must_be_4_digits(self, client):
        """A PIN that is not exactly 4 digits should be rejected."""
        response = client.post('/api/auth/student/register', json={
            'index_number': 'UG0003',
            'full_name': 'Kofi Boateng',
            'email': 'kofi@ug.edu.gh',
            'department': 'Physics',
            'level': '100',
            'pin': '12',  # too short
        })

        assert response.status_code == 400
        assert 'PIN' in response.json['message']


class TestStudentLogin:
    """POST /api/auth/student/login"""

    def test_successful_login(self, client, registered_student):
        """Correct index number and PIN should log the student in."""
        response = client.post('/api/auth/student/login', json={
            'index_number': registered_student['index_number'],
            'pin': registered_student['pin'],
        })

        assert response.status_code == 200
        assert response.json['success'] is True
        assert 'student' in response.json

    def test_wrong_pin_is_rejected(self, client, registered_student):
        """Wrong PIN should return 401 Unauthorized."""
        response = client.post('/api/auth/student/login', json={
            'index_number': registered_student['index_number'],
            'pin': '0000',  # wrong pin
        })

        assert response.status_code == 401
        assert response.json['success'] is False

    def test_unknown_index_number_is_rejected(self, client):
        """A student that doesn't exist should return 401."""
        response = client.post('/api/auth/student/login', json={
            'index_number': 'DOESNOTEXIST',
            'pin': '1234',
        })

        assert response.status_code == 401

    def test_login_sets_cookie(self, client, registered_student):
        """After login, the response should set an access_token cookie."""
        response = client.post('/api/auth/student/login', json=registered_student)

        # Flask test client stores cookies in client.cookie_jar (werkzeug)
        # We check the Set-Cookie header in the response instead
        set_cookie_header = response.headers.get('Set-Cookie', '')
        assert 'access_token' in set_cookie_header


class TestStudentLogout:
    """POST /api/auth/student/logout"""

    def test_logout_succeeds(self, client):
        """Logout should always return success."""
        response = client.post('/api/auth/student/logout')

        assert response.status_code == 200
        assert response.json['success'] is True


class TestLecturerRegister:
    """POST /api/auth/lecturer/register"""

    def test_successful_registration(self, client):
        """A new lecturer with valid data should register successfully."""
        response = client.post('/api/auth/lecturer/register', json={
            'staff_id': 'LEC001',
            'full_name': 'Dr. Kwame Asante',
            'email': 'kwame@ug.edu.gh',
            'password': 'securepassword123',
        })

        assert response.status_code == 201
        assert response.json['success'] is True

    def test_short_password_is_rejected(self, client):
        """Password shorter than 8 characters should be rejected."""
        response = client.post('/api/auth/lecturer/register', json={
            'staff_id': 'LEC002',
            'full_name': 'Dr. Short',
            'email': 'short@ug.edu.gh',
            'password': '123',  # too short
        })

        assert response.status_code == 400
        assert 'Password' in response.json['message']

    def test_duplicate_staff_id_is_rejected(self, client, registered_lecturer):
        """Same staff ID should not be allowed twice."""
        response = client.post('/api/auth/lecturer/register', json={
            'staff_id': 'LEC001',  # already exists
            'full_name': 'Another Person',
            'email': 'another@ug.edu.gh',
            'password': 'anotherpassword',
        })

        assert response.status_code == 409


class TestLecturerLogin:
    """POST /api/auth/lecturer/login"""

    def test_successful_login(self, client, registered_lecturer):
        """Correct email and password should log the lecturer in."""
        response = client.post('/api/auth/lecturer/login', json=registered_lecturer)

        assert response.status_code == 200
        assert response.json['success'] is True
        assert 'lecturer' in response.json

    def test_wrong_password_is_rejected(self, client, registered_lecturer):
        """Wrong password should return 401."""
        response = client.post('/api/auth/lecturer/login', json={
            'email': registered_lecturer['email'],
            'password': 'wrongpassword',
        })

        assert response.status_code == 401

    def test_login_sets_cookie(self, client, registered_lecturer):
        """After login, the response should set an access_token cookie."""
        response = client.post('/api/auth/lecturer/login', json=registered_lecturer)

        set_cookie_header = response.headers.get('Set-Cookie', '')
        assert 'access_token' in set_cookie_header
