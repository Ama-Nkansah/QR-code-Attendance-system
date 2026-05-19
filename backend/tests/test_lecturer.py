"""
Tests for /api/lecturers routes.

These routes require the lecturer to be logged in.
We use the `logged_in_lecturer` fixture from conftest.py
which handles login for us automatically.
"""

COURSE_DATA = {
    'course_code': 'CS301',
    'course_name': 'Data Structures',
    'department': 'Computer Science',
    'level': '300',
    'academic_year': '2024/2025',
    'semester': 'First',
    'planned_sessions': 40,
}


class TestGetProfile:
    """GET /api/lecturers/me"""

    def test_logged_in_lecturer_can_get_profile(self, logged_in_lecturer):
        response = logged_in_lecturer.get('/api/lecturers/me')

        assert response.status_code == 200
        assert response.json['success'] is True
        assert response.json['lecturer']['staff_id'] == 'LEC001'

    def test_unauthenticated_request_is_rejected(self, client):
        """Without logging in first, this should be blocked."""
        response = client.get('/api/lecturers/me')

        assert response.status_code == 401


class TestCreateCourse:
    """POST /api/lecturers/courses"""

    def test_logged_in_lecturer_can_create_course(self, logged_in_lecturer):
        response = logged_in_lecturer.post('/api/lecturers/courses', json=COURSE_DATA)

        assert response.status_code == 201
        assert response.json['success'] is True
        assert response.json['course']['course_code'] == 'CS301'

    def test_missing_fields_are_rejected(self, logged_in_lecturer):
        response = logged_in_lecturer.post('/api/lecturers/courses', json={
            'course_code': 'CS301',
            # missing everything else
        })

        assert response.status_code == 400
        assert 'Missing fields' in response.json['message']

    def test_unauthenticated_request_is_rejected(self, client):
        response = client.post('/api/lecturers/courses', json=COURSE_DATA)

        assert response.status_code == 401


class TestGetCourses:
    """GET /api/lecturers/courses"""

    def test_returns_empty_list_when_no_courses(self, logged_in_lecturer):
        response = logged_in_lecturer.get('/api/lecturers/courses')

        assert response.status_code == 200
        assert response.json['courses'] == []

    def test_returns_created_courses(self, logged_in_lecturer):
        # Create a course first
        logged_in_lecturer.post('/api/lecturers/courses', json=COURSE_DATA)

        # Now fetch all courses
        response = logged_in_lecturer.get('/api/lecturers/courses')

        assert response.status_code == 200
        assert len(response.json['courses']) == 1
        assert response.json['courses'][0]['course_name'] == 'Data Structures'


class TestGetSingleCourse:
    """GET /api/lecturers/courses/<course_id>"""

    def test_can_get_existing_course(self, logged_in_lecturer):
        # Create a course and grab its ID from the response
        create_response = logged_in_lecturer.post('/api/lecturers/courses', json=COURSE_DATA)
        course_id = create_response.json['course']['id']

        response = logged_in_lecturer.get(f'/api/lecturers/courses/{course_id}')

        assert response.status_code == 200
        assert response.json['course']['id'] == course_id

    def test_nonexistent_course_returns_404(self, logged_in_lecturer):
        response = logged_in_lecturer.get('/api/lecturers/courses/9999')

        assert response.status_code == 404


class TestDeleteCourse:
    """DELETE /api/lecturers/courses/<course_id>"""

    def test_can_delete_existing_course(self, logged_in_lecturer):
        # Create then delete
        create_response = logged_in_lecturer.post('/api/lecturers/courses', json=COURSE_DATA)
        course_id = create_response.json['course']['id']

        response = logged_in_lecturer.delete(f'/api/lecturers/courses/{course_id}')

        assert response.status_code == 200
        assert response.json['success'] is True

    def test_deleted_course_no_longer_exists(self, logged_in_lecturer):
        # Create, delete, then try to fetch
        create_response = logged_in_lecturer.post('/api/lecturers/courses', json=COURSE_DATA)
        course_id = create_response.json['course']['id']

        logged_in_lecturer.delete(f'/api/lecturers/courses/{course_id}')

        response = logged_in_lecturer.get(f'/api/lecturers/courses/{course_id}')
        assert response.status_code == 404

    def test_cannot_delete_nonexistent_course(self, logged_in_lecturer):
        response = logged_in_lecturer.delete('/api/lecturers/courses/9999')

        assert response.status_code == 404
