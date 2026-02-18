"""
Database models for Attendo.

Each class here maps directly to a table in MySQL.
SQLAlchemy handles creating, reading, and writing rows for us.
"""

from datetime import datetime, timezone
from app import db


# ---------------------------------------------------------------------------
# STUDENT
# Represents a student account.
# ---------------------------------------------------------------------------

class Student(db.Model):
    """
    Stores student accounts.

    A student belongs to a department and level.
    The backend uses department + level to filter which sessions they see.
    """

    __tablename__ = 'students'

    # Primary key — auto-increments (1, 2, 3 ...)
    id = db.Column(db.Integer, primary_key=True)

    # Student's university index number e.g. "IND12345" — must be unique
    index_number = db.Column(db.String(20), unique=True, nullable=False)

    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    # Department e.g. "Computer Science"
    department = db.Column(db.String(100), nullable=False)

    # Level e.g. "100", "200", "300", "400"
    level = db.Column(db.String(10), nullable=False)

    # PIN is stored as a bcrypt hash — never store plain PINs
    pin_hash = db.Column(db.String(255), nullable=False)

    # When the account was created
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship: one student can have many attendance records
    attendance_records = db.relationship('AttendanceRecord', backref='student', lazy=True)

    def __repr__(self):
        return f'<Student {self.index_number} - {self.full_name}>'


# ---------------------------------------------------------------------------
# LECTURER
# Represents a lecturer account.
# ---------------------------------------------------------------------------

class Lecturer(db.Model):
    """
    Stores lecturer accounts.

    Lecturers create courses and start attendance sessions.
    """
    
    __tablename__ = 'lecturers'

    id = db.Column(db.Integer, primary_key=True)

    # Staff ID e.g. "LEC001" — must be unique
    staff_id = db.Column(db.String(20), unique=True, nullable=False)

    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    # Password stored as a bcrypt hash
    password_hash = db.Column(db.String(255), nullable=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship: one lecturer can have many courses
    courses = db.relationship('Course', backref='lecturer', lazy=True)

    def __repr__(self):
        return f'<Lecturer {self.staff_id} - {self.full_name}>'


# ---------------------------------------------------------------------------
# COURSE
# Represents a course created by a lecturer.
# ---------------------------------------------------------------------------

class Course(db.Model):
    """
    Stores courses.

    A course belongs to one lecturer.
    The department and level on the course determine which students see its sessions.
    """

    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)

    # e.g. "CSC 201"
    course_code = db.Column(db.String(20), nullable=False)

    # e.g. "Data Structures"
    course_name = db.Column(db.String(150), nullable=False)

    # e.g. "Computer Science"
    department = db.Column(db.String(100), nullable=False)

    # e.g. "200"
    level = db.Column(db.String(10), nullable=False)

    # e.g. "2024/2025"
    academic_year = db.Column(db.String(20), nullable=False)

    # e.g. "1" or "2"
    semester = db.Column(db.String(5), nullable=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Foreign key — links this course to the lecturer who created it
    # db.ForeignKey means: this value must exist as an id in the lecturers table
    lecturer_id = db.Column(db.Integer, db.ForeignKey('lecturers.id'), nullable=False)

    # Relationship: one course can have many sessions
    sessions = db.relationship('Session', backref='course', lazy=True)

    def __repr__(self):
        return f'<Course {self.course_code} - {self.course_name}>'


# ---------------------------------------------------------------------------
# SESSION
# Represents one attendance-taking session started by a lecturer.
# ---------------------------------------------------------------------------

class Session(db.Model):
    """
    Stores attendance sessions.

    Key fields:
    - expires_at: when the session auto-closes (start_time + duration)
    - classroom_lat / classroom_lng: lecturer's GPS when they started the session
    - allowed_radius_meters: how close a student must be to mark attendance
    - qr_secret: random string used to sign rotating QR tokens (never exposed)
    """

    __tablename__ = 'sessions'

    id = db.Column(db.Integer, primary_key=True)

    # e.g. "Week 3 - Linked Lists"
    session_name = db.Column(db.String(150), nullable=False)

    # e.g. "Lecture", "Tutorial", "Lab"
    session_type = db.Column(db.String(50), nullable=False, default='Lecture')

    # How long the lecturer set the session to run (in minutes)
    duration_minutes = db.Column(db.Integer, nullable=False)

    # Calculated at creation: started_at + duration_minutes
    # After this time, no more attendance is accepted
    expires_at = db.Column(db.DateTime, nullable=False)

    # Lecturer's GPS coordinates captured automatically when session starts
    classroom_lat = db.Column(db.Float, nullable=False)
    classroom_lng = db.Column(db.Float, nullable=False)

    # Students must be within this many meters to mark attendance
    # Default 100m — accounts for indoor GPS drift
    allowed_radius_meters = db.Column(db.Integer, nullable=False, default=100)

    # A random secret used to sign QR tokens — never sent to any client
    # Each session has its own unique secret
    qr_secret = db.Column(db.String(64), nullable=False)

    # "active" or "ended"
    status = db.Column(db.String(20), nullable=False, default='active')

    started_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at = db.Column(db.DateTime, nullable=True)

    # Foreign key — links this session to its course
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)

    # Relationship: one session can have many attendance records
    attendance_records = db.relationship('AttendanceRecord', backref='session', lazy=True)

    @property
    def is_active(self):
        """Returns True if the session is still within its time window."""
        now = datetime.now(timezone.utc)
        expires = self.expires_at
        # Make expires_at timezone-aware if it isn't (MySQL stores naive datetimes)
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return self.status == 'active' and now < expires

    def __repr__(self):
        return f'<Session {self.id} - {self.session_name} [{self.status}]>'


# ---------------------------------------------------------------------------
# ATTENDANCE RECORD
# One row = one student marked present in one session.
# ---------------------------------------------------------------------------

class AttendanceRecord(db.Model):
    """
    Stores individual attendance marks.

    The unique constraint on (student_id, session_id) prevents a student
    from marking attendance twice for the same session.
    """

    __tablename__ = 'attendance_records'

    id = db.Column(db.Integer, primary_key=True)

    # The GPS coordinates of the student at the moment they confirmed
    student_lat = db.Column(db.Float, nullable=False)
    student_lng = db.Column(db.Float, nullable=False)

    marked_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Foreign keys
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)

    # This constraint is what prevents duplicate attendance at the database level
    # Even if the API has a bug, the database itself will reject a second row
    __table_args__ = (
        db.UniqueConstraint('student_id', 'session_id', name='uq_student_session'),
    )

    def __repr__(self):
        return f'<AttendanceRecord student={self.student_id} session={self.session_id}>'
