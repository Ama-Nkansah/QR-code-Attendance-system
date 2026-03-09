from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required


def lecturer_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("type") != "lecturer":
            return jsonify({"success": False, "message": "Lecturer access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


def student_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("type") != "student":
            return jsonify({"success": False, "message": "Student access required"}), 403
        return fn(*args, **kwargs)
    return wrapper
