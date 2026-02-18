from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from config import config

db = SQLAlchemy()
jwt = JWTManager()


def create_app(config_name='development'):
    app = Flask(__name__)

    # 1. Load configuration from config.py
    app.config.from_object(config[config_name])

    # 2. Initialize Flask extensions
    CORS(app,
         origins=app.config['CORS_ORIGINS'],
         supports_credentials=app.config['CORS_SUPPORTS_CREDENTIALS'])

    jwt.init_app(app)
    db.init_app(app)

    with app.app_context():
        from app import models  # noqa: F401 — registers models with SQLAlchemy
        db.create_all()

    # 3. Register blueprints (routes)
    # TODO: Uncomment when you create these route files
    # from app.routes.auth import auth_bp
    # from app.routes.student import student_bp
    # from app.routes.lecturer import lecturer_bp
    # from app.routes.attendance import attendance_bp
    #
    # app.register_blueprint(auth_bp, url_prefix='/api/auth')
    # app.register_blueprint(student_bp, url_prefix='/api/students')
    # app.register_blueprint(lecturer_bp, url_prefix='/api/lecturers')
    # app.register_blueprint(attendance_bp, url_prefix='/api/attendance')

    # 4. Register error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    # 5. Health check route
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'environment': config_name,
            'debug': app.config['DEBUG']
        }), 200

    # 6. Root route
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Attendance System API',
            'version': '1.0',
            'environment': config_name
        }), 200

    return app
