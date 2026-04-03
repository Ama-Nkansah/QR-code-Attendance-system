from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from app import db
from app.models import AttendanceRecord, Course, Session, Student
from app.services.qr_service import (
    extract_session_id,
    generate_qr_token,
    generate_secret,
    haversine_distance,
    validate_qr_token,
)
from app.utils.decorators import lecturer_required, student_required

attendance_bp = Blueprint('attendance', __name__)


@attendance_bp.route('/sessions', methods=['POST'])
@lecturer_required
def create_session():
    lecturer_id = int(get_jwt_identity())
    data = request.get_json()

    required = ['course_id', 'session_name', 'duration_minutes', 'classroom_lat', 'classroom_lng']
    missing = [f for f in required if data.get(f) is None]
    if missing:
        return jsonify({'success': False, 'message': f'Missing fields: {", ".join(missing)}'}), 400

    course = Course.query.filter_by(id=data['course_id'], lecturer_id=lecturer_id).first()
    if not course:
        return jsonify({'success': False, 'message': 'Course not found'}), 404

    try:
        duration = int(data['duration_minutes'])
        classroom_lat = float(data['classroom_lat'])
        classroom_lng = float(data['classroom_lng'])
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Invalid numeric values'}), 400

    if duration < 1:
        return jsonify({'success': False, 'message': 'Duration must be at least 1 minute'}), 400

    now = datetime.now(timezone.utc)
    session = Session(
        session_name=data['session_name'].strip(),
        session_type=data.get('session_type', 'Lecture').strip(),
        duration_minutes=duration,
        expires_at=now + timedelta(minutes=duration),
        classroom_lat=classroom_lat,
        classroom_lng=classroom_lng,
        allowed_radius_meters=int(data.get('allowed_radius_meters', 100)),
        qr_secret=generate_secret(),
        course_id=course.id,
    )
    db.session.add(session)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Session created successfully',
        'session': _serialize_session(session),
    }), 201


@attendance_bp.route('/sessions/<int:session_id>/qr', methods=['GET'])
@lecturer_required
def get_qr(session_id: int):
    lecturer_id = int(get_jwt_identity())

    session = _get_lecturer_session(session_id, lecturer_id)
    if not session:
        return jsonify({'success': False, 'message': 'Session not found'}), 404

    if not session.is_active:
        return jsonify({'success': False, 'message': 'Session has ended'}), 400

    from flask import current_app
    rotation_interval = current_app.config.get('QR_ROTATION_INTERVAL', 30)

    qr = generate_qr_token(session.id, session.qr_secret, rotation_interval)

    return jsonify({'success': True, 'qr': qr}), 200


@attendance_bp.route('/sessions/<int:session_id>/end', methods=['POST'])
@lecturer_required
def end_session(session_id: int):
    lecturer_id = int(get_jwt_identity())

    session = _get_lecturer_session(session_id, lecturer_id)
    if not session:
        return jsonify({'success': False, 'message': 'Session not found'}), 404

    if session.status == 'ended':
        return jsonify({'success': False, 'message': 'Session already ended'}), 400

    session.status = 'ended'
    session.ended_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Session ended successfully'}), 200


@attendance_bp.route('/sessions/<int:session_id>/records', methods=['GET'])
@lecturer_required
def get_session_records(session_id: int):
    lecturer_id = int(get_jwt_identity())

    session = _get_lecturer_session(session_id, lecturer_id)
    if not session:
        return jsonify({'success': False, 'message': 'Session not found'}), 404

    records = (
        AttendanceRecord.query
        .filter_by(session_id=session_id)
        .order_by(AttendanceRecord.marked_at.asc())
        .all()
    )

    return jsonify({
        'success': True,
        'session': _serialize_session(session),
        'records': [_serialize_record_with_student(r) for r in records],
        'total': len(records),
    }), 200


@attendance_bp.route('/mark', methods=['POST'])
@student_required
def mark_attendance():
    student_id = int(get_jwt_identity())
    data = request.get_json()

    required = ['qr_data', 'student_lat', 'student_lng']
    missing = [f for f in required if data.get(f) is None]
    if missing:
        return jsonify({'success': False, 'message': f'Missing fields: {", ".join(missing)}'}), 400

    try:
        student_lat = float(data['student_lat'])
        student_lng = float(data['student_lng'])
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Invalid GPS coordinates'}), 400

    # Extract session_id from QR to fetch the session's secret
    session_id, err = extract_session_id(data['qr_data'])
    if err:
        return jsonify({'success': False, 'message': err}), 400

    session = db.session.get(Session, session_id)
    if not session:
        return jsonify({'success': False, 'message': 'Invalid QR code'}), 400

    if not session.is_active:
        return jsonify({'success': False, 'message': 'This session has ended'}), 400

    # Validate QR signature and expiry using the session's secret
    from flask import current_app
    expiry_seconds = current_app.config.get('QR_EXPIRY_SECONDS', 60)
    _, err = validate_qr_token(data['qr_data'], session.qr_secret, expiry_seconds)
    if err:
        return jsonify({'success': False, 'message': err}), 400

    # Check student is within the allowed radius
    distance = haversine_distance(
        session.classroom_lat, session.classroom_lng,
        student_lat, student_lng,
    )
    if distance > session.allowed_radius_meters:
        return jsonify({
            'success': False,
            'message': f'You are too far from the classroom ({int(distance)}m away)',
        }), 400

    # Check for duplicate attendance
    existing = AttendanceRecord.query.filter_by(
        student_id=student_id,
        session_id=session_id,
    ).first()
    if existing:
        return jsonify({'success': False, 'message': 'Attendance already marked for this session'}), 409

    record = AttendanceRecord(
        student_id=student_id,
        session_id=session_id,
        student_lat=student_lat,
        student_lng=student_lng,
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Attendance marked successfully'}), 201


def _get_lecturer_session(session_id: int, lecturer_id: int):
    return (
        Session.query
        .join(Course)
        .filter(Session.id == session_id, Course.lecturer_id == lecturer_id)
        .first()
    )


def _serialize_session(session: Session) -> dict:
    return {
        'id': session.id,
        'session_name': session.session_name,
        'session_type': session.session_type,
        'duration_minutes': session.duration_minutes,
        'expires_at': session.expires_at.isoformat(),
        'classroom_lat': session.classroom_lat,
        'classroom_lng': session.classroom_lng,
        'allowed_radius_meters': session.allowed_radius_meters,
        'status': session.status,
        'started_at': session.started_at.isoformat(),
        'ended_at': session.ended_at.isoformat() if session.ended_at else None,
        'course_id': session.course_id,
    }


def _serialize_record_with_student(record: AttendanceRecord) -> dict:
    student = db.session.get(Student, record.student_id)
    return {
        'id': record.id,
        'student_id': record.student_id,
        'index_number': student.index_number if student else None,
        'full_name': student.full_name if student else None,
        'student_lat': record.student_lat,
        'student_lng': record.student_lng,
        'marked_at': record.marked_at.isoformat(),
    }
