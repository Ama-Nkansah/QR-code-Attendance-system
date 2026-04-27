from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity

from app import db
from app.models import AttendanceRecord, Course, Session, Student
from app.utils.decorators import student_required

student_bp = Blueprint('student', __name__)


@student_bp.route('/me', methods=['GET'])
@student_required
def get_profile():
    student_id = int(get_jwt_identity())
    student = db.session.get(Student, student_id)
    if not student:
        return jsonify({'success': False, 'message': 'Student not found'}), 404

    return jsonify({
        'success': True,
        'student': {
            'id': student.id,
            'index_number': student.index_number,
            'full_name': student.full_name,
            'email': student.email,
            'department': student.department,
            'level': student.level,
            'created_at': student.created_at.isoformat(),
        },
    }), 200


@student_bp.route('/attendance', methods=['GET'])
@student_required
def get_attendance_history():
    student_id = int(get_jwt_identity())

    records = (
        AttendanceRecord.query
        .filter_by(student_id=student_id)
        .order_by(AttendanceRecord.marked_at.desc())
        .all()
    )

    return jsonify({
        'success': True,
        'records': [_serialize_record(r) for r in records],
        'total': len(records),
    }), 200


@student_bp.route('/attendance/<int:session_id>', methods=['GET'])
@student_required
def get_attendance_for_session(session_id: int):
    student_id = int(get_jwt_identity())

    record = AttendanceRecord.query.filter_by(
        student_id=student_id,
        session_id=session_id,
    ).first()

    if not record:
        return jsonify({'success': False, 'message': 'No attendance record found for this session'}), 404

    return jsonify({'success': True, 'record': _serialize_record(record)}), 200


@student_bp.route('/courses/summary', methods=['GET'])
@student_required
def get_courses_summary():
    student_id = int(get_jwt_identity())

    records = (
        db.session.query(AttendanceRecord, Session, Course)
        .join(Session, AttendanceRecord.session_id == Session.id)
        .join(Course, Session.course_id == Course.id)
        .filter(AttendanceRecord.student_id == student_id)
        .all()
    )

    course_map: dict = {}
    for _record, session, course in records:
        if course.id not in course_map:
            course_map[course.id] = {
                'course_id': course.id,
                'course_code': course.course_code,
                'course_name': course.course_name,
                'department': course.department,
                'level': course.level,
                'planned_sessions': course.planned_sessions,
                'sessions_attended': 0,
            }
        course_map[course.id]['sessions_attended'] += 1

    threshold = 75.0
    summaries = []
    for course_id, data in course_map.items():
        sessions_held = Session.query.filter_by(course_id=course_id).count()
        planned = data['planned_sessions'] or sessions_held
        pct = round((data['sessions_attended'] / planned) * 100, 1) if planned > 0 else 0.0
        summaries.append({
            **data,
            'sessions_held': sessions_held,
            'total_sessions': planned,
            'attendance_percentage': pct,
            'can_write_exam': pct >= threshold,
        })

    summaries.sort(key=lambda x: x['course_code'])

    return jsonify({
        'success': True,
        'threshold': threshold,
        'courses': summaries,
    }), 200


def _serialize_record(record: AttendanceRecord) -> dict:
    return {
        'id': record.id,
        'session_id': record.session_id,
        'student_lat': record.student_lat,
        'student_lng': record.student_lng,
        'marked_at': record.marked_at.isoformat(),
    }
