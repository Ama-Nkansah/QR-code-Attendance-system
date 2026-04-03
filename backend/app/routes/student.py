from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity

from app import db
from app.models import AttendanceRecord, Student
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


def _serialize_record(record: AttendanceRecord) -> dict:
    return {
        'id': record.id,
        'session_id': record.session_id,
        'student_lat': record.student_lat,
        'student_lng': record.student_lng,
        'marked_at': record.marked_at.isoformat(),
    }
