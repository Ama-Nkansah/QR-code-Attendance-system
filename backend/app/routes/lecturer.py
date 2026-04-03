from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from app import db
from app.models import Course, Lecturer
from app.utils.decorators import lecturer_required

lecturer_bp = Blueprint('lecturer', __name__)


@lecturer_bp.route('/me', methods=['GET'])
@lecturer_required
def get_profile():
    lecturer_id = int(get_jwt_identity())
    lecturer = db.session.get(Lecturer, lecturer_id)
    if not lecturer:
        return jsonify({'success': False, 'message': 'Lecturer not found'}), 404

    return jsonify({
        'success': True,
        'lecturer': {
            'id': lecturer.id,
            'staff_id': lecturer.staff_id,
            'full_name': lecturer.full_name,
            'email': lecturer.email,
            'created_at': lecturer.created_at.isoformat(),
        },
    }), 200


@lecturer_bp.route('/courses', methods=['POST'])
@lecturer_required
def create_course():
    lecturer_id = int(get_jwt_identity())
    data = request.get_json()

    required = ['course_code', 'course_name', 'department', 'level', 'academic_year', 'semester']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'success': False, 'message': f'Missing fields: {", ".join(missing)}'}), 400

    course = Course(
        course_code=data['course_code'].strip().upper(),
        course_name=data['course_name'].strip(),
        department=data['department'].strip(),
        level=str(data['level']).strip(),
        academic_year=data['academic_year'].strip(),
        semester=data['semester'].strip(),
        lecturer_id=lecturer_id,
    )
    db.session.add(course)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Course created successfully',
        'course': _serialize_course(course),
    }), 201


@lecturer_bp.route('/courses', methods=['GET'])
@lecturer_required
def get_courses():
    lecturer_id = int(get_jwt_identity())
    courses = Course.query.filter_by(lecturer_id=lecturer_id).all()

    return jsonify({
        'success': True,
        'courses': [_serialize_course(c) for c in courses],
    }), 200


@lecturer_bp.route('/courses/<int:course_id>', methods=['GET'])
@lecturer_required
def get_course(course_id: int):
    lecturer_id = int(get_jwt_identity())
    course = Course.query.filter_by(id=course_id, lecturer_id=lecturer_id).first()
    if not course:
        return jsonify({'success': False, 'message': 'Course not found'}), 404

    return jsonify({'success': True, 'course': _serialize_course(course)}), 200


@lecturer_bp.route('/courses/<int:course_id>', methods=['DELETE'])
@lecturer_required
def delete_course(course_id: int):
    lecturer_id = int(get_jwt_identity())
    course = Course.query.filter_by(id=course_id, lecturer_id=lecturer_id).first()
    if not course:
        return jsonify({'success': False, 'message': 'Course not found'}), 404

    db.session.delete(course)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Course deleted successfully'}), 200


def _serialize_course(course: Course) -> dict:
    return {
        'id': course.id,
        'course_code': course.course_code,
        'course_name': course.course_name,
        'department': course.department,
        'level': course.level,
        'academic_year': course.academic_year,
        'semester': course.semester,
        'created_at': course.created_at.isoformat(),
    }
