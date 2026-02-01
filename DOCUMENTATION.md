# Attendo: System Documentation

**Project:** QR-Based Attendance Management System
**Version:** 1.0
**Date:** January 2026
**Author:** Aman Kansah

---

## Table of Contents

1. [Requirements Documentation](#1-requirements-documentation)
2. [System Architecture](#2-system-architecture)
3. [API Documentation](#3-api-documentation)

---

# 1. Requirements Documentation

## 1.1 Project Overview

Attendo is a web-based attendance management system that uses rotating QR codes to mark student attendance in university lectures. The system eliminates manual attendance taking, reduces time spent on roll calls, and prevents proxy attendance through secure, time-based QR codes.

## 1.2 Functional Requirements

### FR1: User Authentication

**FR1.1 Student Registration**
- Students must register with: Index Number, Full Name, Email, Department, Level, 4-digit PIN
- Email validation required
- Index Number must be unique across the system
- PIN must be exactly 4 digits
- Department and Level are mandatory for session filtering

**FR1.2 Student Login**
- Students login using Index Number + 4-digit PIN
- System issues JWT token valid for 7 days
- Failed login attempts tracked for security

**FR1.3 Lecturer Registration**
- Lecturers register with: Staff ID, Full Name, Email, Password
- Email must end with .edu domain
- Password requirements: minimum 8 characters, uppercase, lowercase, number, special character
- Staff ID must be unique

**FR1.4 Lecturer Login**
- Lecturers login using Staff ID + Email + Password
- System issues JWT token valid for 7 days
- Support password reset functionality

### FR2: Course Management

**FR2.1 Course Creation**
- Lecturers can create courses with: Course Code, Course Name, Department, Level, Academic Year, Semester
- Course Code must be unique
- Department and Level determine which students see the course
- One lecturer per course (course owner)

**FR2.2 Course Listing**
- Lecturers view all their created courses
- Display shows: Course Code, Name, Total Students, Number of Sessions
- Courses can be edited or deleted

**FR2.3 Auto-Enrollment**
- Students automatically enrolled in a course upon first QR scan
- No manual enrollment process required
- Enrollment record created with timestamp

### FR3: Session Management

**FR3.1 Session Creation**
- Lecturers start attendance sessions for specific courses
- Session details: Session Name, Session Type (Lecture/Tutorial/Lab), QR Rotation Interval
- Default QR rotation: 30 seconds
- Session status: Active or Ended

**FR3.2 QR Code Generation**
- System generates rotating QR codes every 30 seconds (configurable)
- QR contains: Session ID, Timestamp, HMAC Signature
- QR codes expire after 60 seconds (grace period)
- Each QR is cryptographically bound to the session

**FR3.3 Session Display**
- Lecturers view live QR code on dashboard
- Real-time attendance count displayed
- Recent scans shown with student details
- Indication when new students are enrolled

**FR3.4 Session Termination**
- Lecturers can end sessions manually
- Ended sessions no longer accept attendance
- System records session duration and total attendance

### FR4: Attendance Marking

**FR4.1 Active Session Discovery**
- Students see list of active sessions filtered by their Department and Level
- Display shows: Course Code, Course Name, Lecturer Name, Start Time
- List updates every 10 seconds (polling)

**FR4.2 QR Scanning**
- Students select session and activate camera scanner
- Camera scans lecturer's displayed QR code
- QR validation happens server-side

**FR4.3 Attendance Validation**
- System validates:
  - QR signature is authentic
  - QR timestamp is within 60-second grace period
  - Session is still active
  - Student has not already marked attendance for this session
  - Session ID matches selected session

**FR4.4 Attendance Recording**
- Upon successful validation:
  - Create enrollment record if first time in course
  - Create attendance record with timestamp
  - Prevent duplicate attendance for same session
- Return success/error response to student

**FR4.5 Duplicate Prevention**
- Students cannot mark attendance twice for the same session
- System checks attendance_records table before marking
- Clear error message if duplicate attempt

### FR5: Reporting

**FR5.1 Attendance Reports**
- Lecturers view attendance for each session
- Display: Student Index Number, Full Name, Time Marked
- Indicate newly enrolled students
- Export to CSV/PDF

**FR5.2 Student Attendance History**
- Students view their attendance records
- Display: Course Code, Course Name, Session Name, Date/Time
- Calculate attendance percentage per course

**FR5.3 Course Statistics**
- Lecturers view overall course statistics
- Total students enrolled
- Average attendance rate
- Session-by-session breakdown

## 1.3 Non-Functional Requirements

### NFR1: Performance
- System must handle 200 concurrent QR scans
- Session list updates within 2 seconds
- QR code generation completes in < 100ms
- Database queries optimized with indexes

### NFR2: Security
- All passwords hashed using bcrypt (12 rounds)
- 4-digit PINs hashed using bcrypt
- JWT tokens signed with secret key
- QR codes use HMAC-SHA256 signatures
- HTTPS required for production
- CORS restricted to frontend origin
- SQL injection prevention via parameterized queries

### NFR3: Availability
- System uptime: 99% during class hours
- Database backup daily
- Session state persists across server restarts

### NFR4: Usability
- Student can mark attendance in < 15 seconds
- Lecturer can start session in < 3 clicks
- Mobile-responsive design
- Clear error messages for all failure cases
- Accessible on smartphones (primary use case)

### NFR5: Scalability
- Support up to 50 concurrent active sessions
- Handle 5,000 students in system
- Database design supports multi-semester data

### NFR6: Maintainability
- Code follows MVC architecture
- API uses RESTful conventions
- Comprehensive error logging
- Environment-based configuration

## 1.4 User Stories

### Student User Stories

**US1:** As a student, I want to register with my index number and department so that I can access sessions relevant to my level.

**US2:** As a student, I want to login quickly with my index number and PIN so that I can mark attendance in class.

**US3:** As a student, I want to see only active sessions for my department and level so that I don't get confused with irrelevant courses.

**US4:** As a student, I want to scan a QR code to mark attendance so that the process is fast and contactless.

**US5:** As a student, I want to be automatically enrolled in a course on first scan so that I don't need manual enrollment steps.

**US6:** As a student, I want to see my attendance history so that I can track which classes I've attended.

**US7:** As a student, I want clear error messages if my scan fails so that I know what went wrong.

### Lecturer User Stories

**US8:** As a lecturer, I want to create courses with department and level so that only relevant students see them.

**US9:** As a lecturer, I want to start an attendance session with one click so that I can quickly begin taking attendance.

**US10:** As a lecturer, I want to see a rotating QR code on my screen so that students can scan it to mark attendance.

**US11:** As a lecturer, I want to see real-time attendance updates so that I know how many students are present.

**US12:** As a lecturer, I want to end a session when class is over so that late students cannot mark attendance.

**US13:** As a lecturer, I want to view attendance reports so that I can track student participation.

**US14:** As a lecturer, I want to export attendance data so that I can submit it to the department.

## 1.5 System Constraints

### SC1: Technical Constraints
- Backend: Python 3.13+ with Flask
- Frontend: Next.js 16+ with React 19+
- Database: MySQL 8.0+
- QR Library: html5-qrcode for scanning, qrcode.react for display

### SC2: Business Constraints
- Students must have smartphones with cameras
- Reliable internet connection required during attendance
- Lecturers need devices with screens to display QR codes

### SC3: Regulatory Constraints
- GDPR compliance for student data
- University data privacy policies
- Email addresses must be .edu for lecturers

---

# 2. System Architecture

## 2.1 Technology Stack

### Frontend
- **Framework:** Next.js 16.1.4 (React 19.2.3)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **QR Libraries:**
  - `qrcode.react` (QR display)
  - `html5-qrcode` (QR scanning)
- **HTTP Client:** Fetch API
- **State Management:** React Hooks (useState, useEffect)
- **Build Tool:** Turbopack (Next.js built-in)

### Backend
- **Framework:** Flask 3.1.2
- **Language:** Python 3.13
- **ORM:** SQLAlchemy 3.1.1
- **Authentication:** Flask-JWT-Extended 4.7.1
- **Password Hashing:** bcrypt 4.2.1
- **QR Generation:** qrcode 8.0, Pillow 11.1.0
- **CORS:** Flask-CORS 6.0.2

### Database
- **DBMS:** MySQL 8.0+
- **Connector:** mysql-connector-python 9.5.0
- **Schema:** Relational database with 7 core tables

### Deployment
- **Web Server:** Gunicorn (production)
- **Reverse Proxy:** Nginx (production)
- **Process Manager:** systemd or PM2
- **Environment:** Linux (Ubuntu 22.04+)

## 2.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   STUDENT CLIENT     │         │  LECTURER CLIENT     │
│   (Mobile Browser)   │         │  (Desktop/Laptop)    │
│                      │         │                      │
│  - React/Next.js     │         │  - React/Next.js     │
│  - QR Scanner        │         │  - QR Display        │
│  - Session List      │         │  - Session Control   │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                │
           │         HTTPS/REST API         │
           │                                │
           └────────────┬───────────────────┘
                        │
                        ↓
           ┌────────────────────────┐
           │    FLASK BACKEND       │
           │                        │
           │  ┌──────────────────┐  │
           │  │  API Routes      │  │
           │  │  - /auth         │  │
           │  │  - /sessions     │  │
           │  │  - /attendance   │  │
           │  │  - /courses      │  │
           │  └──────────────────┘  │
           │                        │
           │  ┌──────────────────┐  │
           │  │  Services        │  │
           │  │  - QR Service    │  │
           │  │  - Auth Service  │  │
           │  │  - Session Svc   │  │
           │  └──────────────────┘  │
           │                        │
           │  ┌──────────────────┐  │
           │  │  Middleware      │  │
           │  │  - JWT Auth      │  │
           │  │  - CORS          │  │
           │  │  - Error Handler │  │
           │  └──────────────────┘  │
           └────────┬───────────────┘
                    │
                    │ SQLAlchemy ORM
                    ↓
           ┌────────────────────────┐
           │    MYSQL DATABASE      │
           │                        │
           │  - users               │
           │  - lecturers           │
           │  - students            │
           │  - courses             │
           │  - sessions            │
           │  - enrollments         │
           │  - attendance_records  │
           └────────────────────────┘
```

## 2.3 Component Architecture

### 2.3.1 Frontend Components

```
frontend/
├── app/
│   ├── page.tsx                    # Splash screen (role selection)
│   ├── layout.tsx                  # Root layout
│   ├── student/
│   │   ├── login/page.tsx          # Student login
│   │   ├── signup/page.tsx         # Student registration
│   │   ├── dashboard/page.tsx      # Active sessions list
│   │   ├── scan/page.tsx           # QR scanner
│   │   └── history/page.tsx        # Attendance history
│   └── lecturer/
│       ├── login/page.tsx          # Lecturer login
│       ├── signup/page.tsx         # Lecturer registration
│       ├── dashboard/page.tsx      # Lecturer dashboard
│       ├── courses/
│       │   ├── page.tsx            # Course list
│       │   └── create/page.tsx     # Create course
│       └── sessions/
│           ├── create/page.tsx     # Create session
│           └── [id]/page.tsx       # Session QR display
└── components/
    ├── auth/
    │   ├── PINInput.tsx            # 4-digit PIN component
    │   └── AuthGuard.tsx           # Protected route wrapper
    ├── session/
    │   ├── SessionCard.tsx         # Session display card
    │   ├── QRDisplay.tsx           # Rotating QR component
    │   └── SessionList.tsx         # List of sessions
    ├── scanner/
    │   └── QRScanner.tsx           # Camera scanner
    └── common/
        ├── Button.tsx              # Reusable button
        ├── Logo.tsx                # App logo
        └── FeedbackModal.tsx       # Feedback modal
```

### 2.3.2 Backend Components

```
backend/
├── app/
│   ├── __init__.py                 # Flask app factory
│   ├── models/
│   │   ├── user.py                 # User base model
│   │   ├── lecturer.py             # Lecturer model
│   │   ├── student.py              # Student model (with PIN)
│   │   ├── course.py               # Course model
│   │   ├── enrollment.py           # Enrollment model
│   │   ├── session.py              # Session model
│   │   └── attendance.py           # Attendance model
│   ├── routes/
│   │   ├── auth.py                 # Authentication endpoints
│   │   ├── sessions.py             # Session management
│   │   ├── attendance.py           # Attendance marking
│   │   └── courses.py              # Course management
│   ├── services/
│   │   ├── qr_service.py           # QR generation/validation
│   │   ├── auth_service.py         # Auth business logic
│   │   ├── session_service.py      # Session lifecycle
│   │   └── attendance_service.py   # Attendance logic
│   ├── utils/
│   │   ├── security.py             # JWT, hashing
│   │   ├── validators.py           # Input validation
│   │   └── decorators.py           # Auth decorators
│   └── database.py                 # DB connection
├── config.py                       # Configuration
└── run.py                          # App entry point
```

## 2.4 Database Schema

### 2.4.1 Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE SCHEMA (ERD)                          │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │    users     │
                    ├──────────────┤
                    │ id (PK)      │
                    │ email        │
                    │ user_type    │
                    │ created_at   │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ↓                         ↓
    ┌─────────────────┐       ┌─────────────────┐
    │   lecturers     │       │    students     │
    ├─────────────────┤       ├─────────────────┤
    │ id (PK)         │       │ id (PK)         │
    │ user_id (FK)    │       │ user_id (FK)    │
    │ staff_id        │       │ index_number    │
    │ full_name       │       │ full_name       │
    │ email           │       │ email           │
    │ password_hash   │       │ department      │
    └────────┬────────┘       │ level           │
             │                │ pin_hash        │
             │                └────────┬────────┘
             │                         │
             │                         │
             ↓                         │
    ┌─────────────────┐                │
    │    courses      │                │
    ├─────────────────┤                │
    │ id (PK)         │                │
    │ course_code     │                │
    │ course_name     │                │
    │ lecturer_id(FK) │←───────────────┘ (Many-to-Many)
    │ department      │                ↓
    │ level           │       ┌──────────────────┐
    │ academic_year   │       │  enrollments     │
    │ semester        │       ├──────────────────┤
    └────────┬────────┘       │ id (PK)          │
             │                │ student_id (FK)  │
             │                │ course_id (FK)   │
             │                │ enrolled_at      │
             │                └──────────────────┘
             ↓
    ┌─────────────────┐
    │    sessions     │
    ├─────────────────┤
    │ id (PK)         │
    │ course_id (FK)  │
    │ lecturer_id(FK) │
    │ session_name    │
    │ session_type    │
    │ status          │
    │ qr_secret       │
    │ started_at      │
    │ ended_at        │
    └────────┬────────┘
             │
             ↓
    ┌──────────────────────┐
    │ attendance_records   │
    ├──────────────────────┤
    │ id (PK)              │
    │ session_id (FK)      │
    │ student_id (FK)      │
    │ course_id (FK)       │
    │ marked_at            │
    │ qr_token_used        │
    └──────────────────────┘
```

### 2.4.2 Table Definitions

#### users
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_type ENUM('student', 'lecturer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);
```

#### lecturers
```sql
CREATE TABLE lecturers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_staff_id (staff_id),
    INDEX idx_email (email)
);
```

#### students
```sql
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    index_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    level ENUM('100', '200', '300', '400') NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_index_number (index_number),
    INDEX idx_email (email),
    INDEX idx_department_level (department, level)
);
```

#### courses
```sql
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    lecturer_id INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    level ENUM('100', '200', '300', '400') NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester ENUM('1', '2') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE,
    INDEX idx_course_code (course_code),
    INDEX idx_lecturer_id (lecturer_id),
    INDEX idx_department_level (department, level)
);
```

#### course_enrollments
```sql
CREATE TABLE course_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id),
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id)
);
```

#### sessions
```sql
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    lecturer_id INT NOT NULL,
    session_name VARCHAR(255) NOT NULL,
    session_type ENUM('lecture', 'tutorial', 'lab', 'other') DEFAULT 'lecture',
    status ENUM('active', 'ended') DEFAULT 'active',
    qr_secret VARCHAR(255) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    qr_rotation_interval INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
);
```

#### attendance_records
```sql
CREATE TABLE attendance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    qr_token_used VARCHAR(255) NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_attendance (session_id, student_id),
    INDEX idx_session_id (session_id),
    INDEX idx_student_id (student_id),
    INDEX idx_marked_at (marked_at)
);
```

## 2.5 Data Flow Architecture

### 2.5.1 Attendance Marking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              ATTENDANCE MARKING DATA FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. STUDENT SELECTS SESSION
   Student (Browser)
      │
      ↓ GET /api/student/sessions/active
   Backend API
      │
      ↓ Query sessions filtered by dept/level
   Database
      │
      ↓ Return active sessions
   Student (Browser) → Displays list

2. STUDENT SCANS QR
   Student (Browser)
      │ Camera opens
      ↓ Scans QR code
   QR Data Extracted
      │
      ↓ POST /api/student/attendance/mark
   Backend API
      │
      ↓ Decode QR token
   QR Service
      │
      ├─→ Verify HMAC signature
      ├─→ Check timestamp (< 60s)
      └─→ Extract session_id
      │
      ↓ Validation passed
   Attendance Service
      │
      ├─→ Check session is active
      ├─→ Check no duplicate attendance
      ├─→ Check/create enrollment
      └─→ Create attendance record
      │
      ↓ Save to database
   Database
      │
      ↓ Return success
   Student (Browser) → Show success message

3. REAL-TIME UPDATE TO LECTURER
   Database attendance_records updated
      │
      ↓ Lecturer polls: GET /api/lecturer/sessions/:id
   Backend API
      │
      ↓ Query attendance count
   Database
      │
      ↓ Return updated count
   Lecturer (Browser) → Updates display
```

### 2.5.2 QR Code Generation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              QR CODE GENERATION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Lecturer Browser (Every 30s)
      │
      ↓ GET /api/lecturer/sessions/:id/qr
Backend API
      │
      ↓ Call QR Service
QR Service
      │
      ├─→ Get current timestamp
      ├─→ Calculate time_slot = timestamp // 30
      ├─→ Create payload {session_id, time_slot, timestamp}
      ├─→ Generate HMAC-SHA256 signature
      │     using session.qr_secret
      ├─→ Combine payload + signature
      └─→ Base64 encode
      │
      ↓ Return QR data
Backend API
      │
      ↓ JSON response
Lecturer Browser
      │
      ↓ Render QR code using qrcode.react
QR Code displayed on screen
```

## 2.6 Security Architecture

### 2.6.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

STUDENT LOGIN:
Student → Enter Index Number + PIN → Submit
   ↓
Backend receives credentials
   ↓
Query database: SELECT * FROM students WHERE index_number = ?
   ↓
Verify PIN: bcrypt.checkpw(entered_pin, stored_pin_hash)
   ↓
IF valid:
   Generate JWT token:
   {
     "user_id": 123,
     "user_type": "student",
     "index_number": "IND12345",
     "exp": timestamp + 7_days
   }
   Sign with SECRET_KEY
   ↓
   Return token to frontend
   ↓
   Frontend stores in localStorage
   ↓
   All subsequent requests include:
   Authorization: Bearer <token>

LECTURER LOGIN:
Lecturer → Enter Staff ID + Email + Password → Submit
   ↓
Backend receives credentials
   ↓
Query: SELECT * FROM lecturers
       WHERE staff_id = ? AND email = ?
   ↓
Verify password: bcrypt.checkpw(entered_password, stored_hash)
   ↓
IF valid:
   Generate JWT token (same process)
   Return to frontend
```

### 2.6.2 QR Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                  QR SECURITY MODEL                              │
└─────────────────────────────────────────────────────────────────┘

GENERATION (Server-side):
session.qr_secret = random 32-byte string (stored in DB)
current_time = 1234567890
time_slot = current_time // 30  (changes every 30s)

payload = {
  "session_id": 42,
  "time_slot": 41152263,
  "timestamp": 1234567890
}

signature = HMAC-SHA256(
  key = session.qr_secret,
  message = JSON.stringify(payload)
)

qr_data = Base64Encode({
  "p": payload,
  "s": signature
})

VALIDATION (Server-side):
1. Decode Base64 → Extract payload + signature
2. Verify signature:
   expected_sig = HMAC-SHA256(qr_secret, payload)
   IF signature != expected_sig → REJECT
3. Check timestamp:
   IF current_time - payload.timestamp > 60s → REJECT (expired)
4. Check session_id:
   IF payload.session_id != expected_session_id → REJECT
5. Check session status:
   IF session.status != 'active' → REJECT
6. All checks pass → ACCEPT

SECURITY GUARANTEES:
✓ QR cannot be tampered (HMAC signature)
✓ QR expires after 60s (timestamp check)
✓ QR bound to specific session (session_id check)
✓ Old QRs cannot be reused (time_slot rotation)
✓ Screenshot attacks prevented (timestamp expiration)
```

## 2.7 Deployment Architecture

### 2.7.1 Production Environment

```
┌─────────────────────────────────────────────────────────────────┐
│              PRODUCTION DEPLOYMENT                              │
└─────────────────────────────────────────────────────────────────┘

Internet
   │
   ↓ HTTPS (Port 443)
┌────────────────┐
│     Nginx      │ ← Reverse Proxy
│  (Load Balancer)│   SSL Termination
└────────┬───────┘   Static file serving
         │
         ├─→ /api/* → Backend
         └─→ /* → Frontend
         │           │
         ↓           ↓
┌─────────────┐  ┌──────────────┐
│  Gunicorn   │  │   Next.js    │
│  (WSGI)     │  │  (Node.js)   │
│  Flask App  │  │   Build      │
│  Port 5000  │  │  Port 3000   │
└──────┬──────┘  └──────────────┘
       │
       ↓
┌─────────────┐
│   MySQL     │
│  Database   │
│  Port 3306  │
└─────────────┘

Services managed by:
- systemd (backend service)
- PM2 (frontend service)
```

### 2.7.2 Environment Configuration

```bash
# Production .env (Backend)
FLASK_ENV=production
DB_HOST=localhost
DB_NAME=attendo_prod
DB_USER=attendo_user
DB_PASSWORD=<secure-password>
JWT_SECRET_KEY=<random-64-char-string>
CORS_ORIGINS=https://attendo.university.edu

# Production .env.local (Frontend)
NEXT_PUBLIC_API_URL=https://api.attendo.university.edu
NODE_ENV=production
```

---

# 3. API Documentation

## 3.1 API Overview

**Base URL:** `http://localhost:5000/api` (Development)
**Base URL:** `https://api.attendo.university.edu/api` (Production)

**Authentication:** JWT Bearer Token
**Content-Type:** `application/json`
**Response Format:** JSON

## 3.2 Authentication Endpoints

### 3.2.1 Student Signup

**Endpoint:** `POST /api/auth/student/signup`

**Description:** Register a new student account

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "indexNumber": "IND12345",
  "fullName": "John Doe",
  "email": "john.doe@student.edu",
  "department": "Computer Science",
  "level": "200",
  "pin": "1234"
}
```

**Validation Rules:**
- `indexNumber`: Required, unique, alphanumeric
- `fullName`: Required, 3-100 characters
- `email`: Required, valid email format
- `department`: Required, from predefined list
- `level`: Required, enum ("100", "200", "300", "400")
- `pin`: Required, exactly 4 digits

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Student account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 42,
    "indexNumber": "IND12345",
    "fullName": "John Doe",
    "email": "john.doe@student.edu",
    "department": "Computer Science",
    "level": "200",
    "userType": "student"
  }
}
```

**Error Responses:**

400 Bad Request - Invalid input:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "pin": "PIN must be exactly 4 digits",
    "email": "Email already exists"
  }
}
```

409 Conflict - Index number exists:
```json
{
  "success": false,
  "message": "Index number already registered"
}
```

---

### 3.2.2 Student Login

**Endpoint:** `POST /api/auth/student/login`

**Description:** Authenticate student and receive JWT token

**Request Body:**
```json
{
  "indexNumber": "IND12345",
  "pin": "1234"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 42,
    "indexNumber": "IND12345",
    "fullName": "John Doe",
    "email": "john.doe@student.edu",
    "department": "Computer Science",
    "level": "200",
    "userType": "student"
  }
}
```

**Error Responses:**

401 Unauthorized - Invalid credentials:
```json
{
  "success": false,
  "message": "Invalid index number or PIN"
}
```

---

### 3.2.3 Lecturer Signup

**Endpoint:** `POST /api/auth/lecturer/signup`

**Request Body:**
```json
{
  "staffId": "LEC001",
  "fullName": "Dr. Kwame Mensah",
  "email": "k.mensah@university.edu",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Validation Rules:**
- `staffId`: Required, unique, alphanumeric
- `fullName`: Required, 3-100 characters
- `email`: Required, must end with .edu
- `password`: Min 8 chars, uppercase, lowercase, number, special char
- `confirmPassword`: Must match password

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Lecturer account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 10,
    "staffId": "LEC001",
    "fullName": "Dr. Kwame Mensah",
    "email": "k.mensah@university.edu",
    "userType": "lecturer"
  }
}
```

---

### 3.2.4 Lecturer Login

**Endpoint:** `POST /api/auth/lecturer/login`

**Request Body:**
```json
{
  "staffId": "LEC001",
  "email": "k.mensah@university.edu",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 10,
    "staffId": "LEC001",
    "fullName": "Dr. Kwame Mensah",
    "email": "k.mensah@university.edu",
    "userType": "lecturer"
  }
}
```

---

## 3.3 Course Management Endpoints

### 3.3.1 Create Course

**Endpoint:** `POST /api/lecturer/courses`

**Authentication:** Required (Lecturer only)

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseCode": "CSC 201",
  "courseName": "Data Structures and Algorithms",
  "department": "Computer Science",
  "level": "200",
  "academicYear": "2024/2025",
  "semester": "1"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "course": {
    "id": 15,
    "courseCode": "CSC 201",
    "courseName": "Data Structures and Algorithms",
    "department": "Computer Science",
    "level": "200",
    "academicYear": "2024/2025",
    "semester": "1",
    "lecturerId": 10,
    "lecturerName": "Dr. Kwame Mensah",
    "createdAt": "2026-01-31T10:00:00Z"
  }
}
```

---

### 3.3.2 Get Lecturer's Courses

**Endpoint:** `GET /api/lecturer/courses`

**Authentication:** Required (Lecturer only)

**Success Response (200 OK):**
```json
{
  "success": true,
  "courses": [
    {
      "id": 15,
      "courseCode": "CSC 201",
      "courseName": "Data Structures and Algorithms",
      "department": "Computer Science",
      "level": "200",
      "academicYear": "2024/2025",
      "semester": "1",
      "totalStudents": 45,
      "totalSessions": 12
    },
    {
      "id": 16,
      "courseCode": "CSC 305",
      "courseName": "Operating Systems",
      "department": "Computer Science",
      "level": "300",
      "academicYear": "2024/2025",
      "semester": "1",
      "totalStudents": 38,
      "totalSessions": 10
    }
  ]
}
```

---

### 3.3.3 Get Student's Enrolled Courses

**Endpoint:** `GET /api/student/courses`

**Authentication:** Required (Student only)

**Success Response (200 OK):**
```json
{
  "success": true,
  "courses": [
    {
      "id": 15,
      "courseCode": "CSC 201",
      "courseName": "Data Structures and Algorithms",
      "lecturerName": "Dr. Kwame Mensah",
      "enrolledAt": "2026-01-15T08:30:00Z",
      "attendanceCount": 10,
      "totalSessions": 12,
      "attendancePercentage": 83.33
    }
  ]
}
```

---

## 3.4 Session Management Endpoints

### 3.4.1 Create Session

**Endpoint:** `POST /api/lecturer/sessions`

**Authentication:** Required (Lecturer only)

**Request Body:**
```json
{
  "courseId": 15,
  "sessionName": "Week 3 - Linked Lists",
  "sessionType": "lecture",
  "qrRotationInterval": 30
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Session started successfully",
  "session": {
    "id": 101,
    "courseId": 15,
    "courseCode": "CSC 201",
    "courseName": "Data Structures and Algorithms",
    "sessionName": "Week 3 - Linked Lists",
    "sessionType": "lecture",
    "status": "active",
    "qrSecret": "a7f9e3b2c1d4f8a6...",
    "qrRotationInterval": 30,
    "startedAt": "2026-01-31T10:00:00Z",
    "endedAt": null
  }
}
```

---

### 3.4.2 Get Active Sessions (Student)

**Endpoint:** `GET /api/student/sessions/active`

**Authentication:** Required (Student only)

**Description:** Returns active sessions filtered by student's department and level

**Success Response (200 OK):**
```json
{
  "success": true,
  "sessions": [
    {
      "id": 101,
      "courseId": 15,
      "courseCode": "CSC 201",
      "courseName": "Data Structures and Algorithms",
      "sessionName": "Week 3 - Linked Lists",
      "sessionType": "lecture",
      "lecturerName": "Dr. Kwame Mensah",
      "department": "Computer Science",
      "level": "200",
      "startedAt": "2026-01-31T10:00:00Z"
    },
    {
      "id": 102,
      "courseId": 17,
      "courseCode": "CSC 205",
      "courseName": "Computer Architecture",
      "sessionName": "Week 2 - CPU Design",
      "sessionType": "lecture",
      "lecturerName": "Prof. Ama Boateng",
      "department": "Computer Science",
      "level": "200",
      "startedAt": "2026-01-31T10:05:00Z"
    }
  ]
}
```

---

### 3.4.3 Get Session QR Code

**Endpoint:** `GET /api/lecturer/sessions/:sessionId/qr`

**Authentication:** Required (Lecturer only)

**Description:** Generate current rotating QR token for display

**Success Response (200 OK):**
```json
{
  "success": true,
  "qrData": "eyJwIjp7InNlc3Npb25faWQiOjEwMSwidGltZV9zbG90Ijo0MTE1MjI2Mywi...",
  "expiresAt": "2026-01-31T10:01:00Z",
  "sessionId": 101,
  "rotationInterval": 30
}
```

**Note:** Frontend should poll this endpoint every 30 seconds to get fresh QR

---

### 3.4.4 Get Session Details

**Endpoint:** `GET /api/lecturer/sessions/:sessionId`

**Authentication:** Required (Lecturer only)

**Success Response (200 OK):**
```json
{
  "success": true,
  "session": {
    "id": 101,
    "courseCode": "CSC 201",
    "courseName": "Data Structures and Algorithms",
    "sessionName": "Week 3 - Linked Lists",
    "status": "active",
    "startedAt": "2026-01-31T10:00:00Z",
    "endedAt": null,
    "attendanceCount": 15,
    "recentScans": [
      {
        "studentId": 42,
        "indexNumber": "IND12345",
        "fullName": "John Doe",
        "markedAt": "2026-01-31T10:12:00Z",
        "newlyEnrolled": true
      },
      {
        "studentId": 43,
        "indexNumber": "IND12346",
        "fullName": "Jane Smith",
        "markedAt": "2026-01-31T10:11:00Z",
        "newlyEnrolled": false
      }
    ]
  }
}
```

---

### 3.4.5 End Session

**Endpoint:** `PUT /api/lecturer/sessions/:sessionId/end`

**Authentication:** Required (Lecturer only)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Session ended successfully",
  "session": {
    "id": 101,
    "status": "ended",
    "startedAt": "2026-01-31T10:00:00Z",
    "endedAt": "2026-01-31T10:25:00Z",
    "duration": "25 minutes",
    "totalAttendance": 15
  }
}
```

---

## 3.5 Attendance Endpoints

### 3.5.1 Mark Attendance

**Endpoint:** `POST /api/student/attendance/mark`

**Authentication:** Required (Student only)

**Description:** Validate QR and mark attendance (with auto-enrollment)

**Request Body:**
```json
{
  "qrData": "eyJwIjp7InNlc3Npb25faWQiOjEwMSwidGltZV9zbG90Ijo0MTE1MjI2Mywi..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "attendance": {
    "sessionId": 101,
    "courseCode": "CSC 201",
    "courseName": "Data Structures and Algorithms",
    "sessionName": "Week 3 - Linked Lists",
    "lecturerName": "Dr. Kwame Mensah",
    "markedAt": "2026-01-31T10:12:00Z"
  },
  "enrolled": true,
  "enrollmentMessage": "You have been enrolled in this course"
}
```

**Error Responses:**

400 Bad Request - Invalid QR:
```json
{
  "success": false,
  "message": "Invalid QR code"
}
```

400 Bad Request - Expired QR:
```json
{
  "success": false,
  "message": "QR code has expired. Please scan the current QR."
}
```

400 Bad Request - Wrong session:
```json
{
  "success": false,
  "message": "This QR code is for a different session"
}
```

409 Conflict - Already marked:
```json
{
  "success": false,
  "message": "You have already marked attendance for this session"
}
```

410 Gone - Session ended:
```json
{
  "success": false,
  "message": "This session has ended. Attendance is no longer being accepted."
}
```

---

### 3.5.2 Get Student Attendance History

**Endpoint:** `GET /api/student/attendance/history`

**Authentication:** Required (Student only)

**Query Parameters:**
- `courseId` (optional): Filter by specific course
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Pagination offset

**Success Response (200 OK):**
```json
{
  "success": true,
  "attendance": [
    {
      "id": 301,
      "courseCode": "CSC 201",
      "courseName": "Data Structures and Algorithms",
      "sessionName": "Week 3 - Linked Lists",
      "sessionType": "lecture",
      "lecturerName": "Dr. Kwame Mensah",
      "markedAt": "2026-01-31T10:12:00Z"
    },
    {
      "id": 298,
      "courseCode": "CSC 201",
      "courseName": "Data Structures and Algorithms",
      "sessionName": "Week 2 - Arrays",
      "sessionType": "lecture",
      "lecturerName": "Dr. Kwame Mensah",
      "markedAt": "2026-01-24T10:15:00Z"
    }
  ],
  "totalRecords": 25,
  "limit": 50,
  "offset": 0
}
```

---

### 3.5.3 Get Session Attendance Report

**Endpoint:** `GET /api/lecturer/sessions/:sessionId/attendance`

**Authentication:** Required (Lecturer only)

**Success Response (200 OK):**
```json
{
  "success": true,
  "session": {
    "id": 101,
    "courseCode": "CSC 201",
    "courseName": "Data Structures and Algorithms",
    "sessionName": "Week 3 - Linked Lists",
    "status": "ended",
    "startedAt": "2026-01-31T10:00:00Z",
    "endedAt": "2026-01-31T10:25:00Z"
  },
  "totalPresent": 15,
  "totalEnrolled": 45,
  "attendanceRate": 33.33,
  "students": [
    {
      "indexNumber": "IND12345",
      "fullName": "John Doe",
      "email": "john.doe@student.edu",
      "markedAt": "2026-01-31T10:12:00Z",
      "newlyEnrolled": true
    },
    {
      "indexNumber": "IND12346",
      "fullName": "Jane Smith",
      "email": "jane.smith@student.edu",
      "markedAt": "2026-01-31T10:11:00Z",
      "newlyEnrolled": false
    }
  ]
}
```

---

## 3.6 Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": {
    "field": "Specific field error"
  },
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input/validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., index number exists)
- `410 Gone` - Resource no longer available (e.g., session ended)
- `422 Unprocessable Entity` - Semantic validation error
- `500 Internal Server Error` - Server error

---

## 3.7 Rate Limiting

**Limits:**
- Authentication endpoints: 5 requests per minute per IP
- QR generation endpoint: 3 requests per second (rotation interval)
- Attendance marking: 10 requests per minute per student
- General endpoints: 100 requests per minute per user

**Rate Limit Response (429 Too Many Requests):**
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

---

## 3.8 Pagination

Endpoints returning lists support pagination:

**Query Parameters:**
- `limit`: Number of items per page (default: 50, max: 100)
- `offset`: Number of items to skip (default: 0)

**Paginated Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 250,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## 3.9 Webhook Events (Future Enhancement)

Planned webhooks for real-time notifications:

- `session.started` - New session created
- `session.ended` - Session terminated
- `attendance.marked` - Student marked present
- `student.enrolled` - Student auto-enrolled in course

---

**End of Documentation**
