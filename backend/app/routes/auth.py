import bcrypt
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

from app import db
from app.models import Lecturer, Student

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/student/register', methods=['POST'])
def student_register():
    data = request.get_json()

    required = ['index_number', 'full_name', 'email', 'department', 'level', 'pin']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'success': False, 'message': f'Missing fields: {", ".join(missing)}'}), 400

    if Student.query.filter_by(index_number=data['index_number']).first():
        return jsonify({'success': False, 'message': 'Index number already registered'}), 409

    if Student.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 409

    pin = str(data['pin'])
    if not pin.isdigit() or len(pin) != 4:
        return jsonify({'success': False, 'message': 'PIN must be exactly 4 digits'}), 400

    pin_hash = bcrypt.hashpw(pin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    student = Student(
        index_number=data['index_number'].strip(),
        full_name=data['full_name'].strip(),
        email=data['email'].strip().lower(),
        department=data['department'].strip(),
        level=str(data['level']).strip(),
        pin_hash=pin_hash,
    )
    db.session.add(student)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Student registered successfully'}), 201


@auth_bp.route('/student/login', methods=['POST'])
def student_login():
    data = request.get_json()

    required = ['index_number', 'pin']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'success': False, 'message': f'Missing fields: {", ".join(missing)}'}), 400

    student = Student.query.filter_by(index_number=data['index_number']).first()
    if not student:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    pin = str(data['pin'])
    if not bcrypt.checkpw(pin.encode('utf-8'), student.pin_hash.encode('utf-8')):
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    token = create_access_token(
        identity=str(student.id),
        additional_claims={'type': 'student'},
    )

    return jsonify({
        'success': True,
        'token': token,
        'student': {
            'id': student.id,
            'index_number': student.index_number,
            'full_name': student.full_name,
            'email': student.email,
            'department': student.department,
            'level': student.level,
        },
    }), 200


@auth_bp.route('/lecturer/register', methods=['POST'])
def lecturer_register():
    data = request.get_json()

    required = ['staff_id', 'full_name', 'email', 'password']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'success': False, 'message': f'Missing fields: {", ".join(missing)}'}), 400

    if Lecturer.query.filter_by(staff_id=data['staff_id']).first():
        return jsonify({'success': False, 'message': 'Staff ID already registered'}), 409

    if Lecturer.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 409

    if len(data['password']) < 8:
        return jsonify({'success': False, 'message': 'Password must be at least 8 characters'}), 400

    password_hash = bcrypt.hashpw(
        data['password'].encode('utf-8'), bcrypt.gensalt()
    ).decode('utf-8')

    lecturer = Lecturer(
        staff_id=data['staff_id'].strip(),
        full_name=data['full_name'].strip(),
        email=data['email'].strip().lower(),
        password_hash=password_hash,
    )
    db.session.add(lecturer)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Lecturer registered successfully'}), 201


@auth_bp.route('/lecturer/login', methods=['POST'])
def lecturer_login():
    data = request.get_json()

    required = ['email', 'password']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'success': False, 'message': f'Missing fields: {", ".join(missing)}'}), 400

    lecturer = Lecturer.query.filter_by(email=data['email'].strip().lower()).first()
    if not lecturer:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    if not bcrypt.checkpw(data['password'].encode('utf-8'), lecturer.password_hash.encode('utf-8')):
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    token = create_access_token(
        identity=str(lecturer.id),
        additional_claims={'type': 'lecturer'},
    )

    return jsonify({
        'success': True,
        'token': token,
        'lecturer': {
            'id': lecturer.id,
            'staff_id': lecturer.staff_id,
            'full_name': lecturer.full_name,
            'email': lecturer.email,
        },
    }), 200
