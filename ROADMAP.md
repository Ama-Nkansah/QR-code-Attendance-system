# Attendo Development Roadmap

**Last Updated:** 2026-02-13
**Purpose:** Personal learning and development guide

---

## 📊 Current Status

### ✅ What's Complete

**Backend (Python/Flask):**
- ✅ `config.py` - Configuration management (dev/prod/test)
- ✅ `run.py` - Entry point to start server
- ✅ `app/__init__.py` - Application factory with CORS, JWT, DB setup
- ✅ `requirements.txt` - All dependencies defined
- ✅ `.env` - Environment variables configured

**Frontend (Next.js/TypeScript):**
- ✅ Basic Next.js setup
- ✅ Components folder structure
- ✅ TypeScript configuration

**Documentation:**
- ✅ Complete requirements documentation
- ✅ User flow documentation
- ✅ System architecture plans

---

### ❌ What's Missing

**Critical Backend Components:**
- ❌ Database models (User, Student, Lecturer, Course, Attendance, Session)
- ❌ API routes/endpoints (auth, students, lecturers, attendance)
- ❌ Authentication logic (JWT, login, register)
- ❌ Database initialization and migrations
- ❌ QR code generation and validation service
- ❌ Dependencies installation

**Additional Backend:**
- ❌ Unit tests
- ❌ Integration tests
- ❌ Logging setup
- ❌ Error handling middleware
- ❌ Rate limiting
- ❌ Input validation

**Frontend:**
- ❌ Authentication pages (login/register)
- ❌ Student dashboard
- ❌ Lecturer dashboard
- ❌ QR code scanner
- ❌ Course management UI
- ❌ Attendance reports

---

## 🎯 Development Phases

### Phase 1: Foundation (Week 1)

#### Priority 1: Environment Setup ⚡ **DO THIS FIRST**

**1. Install Python Dependencies**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**2. Verify Installation**
```bash
pip list | grep -E "Flask|SQLAlchemy|jwt|bcrypt"
```

**3. Set Up Database**
```bash
# Start MySQL
sudo systemctl start mysql

# Create database
mysql -u root -p
CREATE DATABASE attendo_db;
GRANT ALL PRIVILEGES ON attendo_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**4. Test Basic Server**
```bash
python run.py
```

Expected output:
```
* Running on http://0.0.0.0:5000
* Debug mode: on
```

**5. Test Health Endpoint**
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "development",
  "debug": true
}
```

---

#### Priority 2: Database Models

**Create `backend/app/models.py`**

Models needed:
1. **User (Base Model)**
   - id (primary key)
   - email (unique)
   - created_at
   - updated_at

2. **Student**
   - Inherits from User
   - index_number (unique)
   - full_name
   - department
   - level (100/200/300/400)
   - pin_hash (4-digit PIN, hashed)

3. **Lecturer**
   - Inherits from User
   - staff_id (unique)
   - full_name
   - password_hash

4. **Course**
   - id
   - code (unique, e.g., "CS101")
   - name
   - lecturer_id (foreign key)
   - department
   - created_at

5. **CourseEnrollment**
   - id
   - course_id (foreign key)
   - student_id (foreign key)
   - enrolled_at

6. **AttendanceSession**
   - id
   - course_id (foreign key)
   - qr_code_data
   - started_at
   - expires_at
   - ended_at (nullable)
   - is_active

7. **AttendanceRecord**
   - id
   - session_id (foreign key)
   - student_id (foreign key)
   - marked_at
   - location (optional)

**Relationships:**
- Lecturer has many Courses
- Course has many Students (through CourseEnrollment)
- Course has many AttendanceSessions
- AttendanceSession has many AttendanceRecords
- Student has many AttendanceRecords

---

### Phase 2: Authentication (Week 1-2)

#### Step 1: Create Auth Utilities

**Create `backend/app/utils/auth.py`**
- Password hashing (bcrypt)
- PIN hashing
- JWT token generation
- JWT token validation
- Token required decorator

#### Step 2: Create Auth Routes

**Create `backend/app/routes/auth.py`**

Endpoints:
- `POST /api/auth/student/register`
  - Body: full_name, email, index_number, department, level, pin
  - Returns: JWT token

- `POST /api/auth/student/login`
  - Body: index_number, pin
  - Returns: JWT token

- `POST /api/auth/lecturer/register`
  - Body: staff_id, full_name, email, password
  - Returns: JWT token

- `POST /api/auth/lecturer/login`
  - Body: staff_id, email, password
  - Returns: JWT token

- `GET /api/auth/me`
  - Headers: Authorization: Bearer <token>
  - Returns: Current user info

- `POST /api/auth/logout`
  - Invalidate token (if using token blacklist)

#### Step 3: Register Blueprints

Update `backend/app/__init__.py`:
```python
from app.routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')
```

---

### Phase 3: Core Features (Week 2-3)

#### Step 1: Lecturer Features

**Create `backend/app/routes/lecturer.py`**

Endpoints:
- `POST /api/lecturers/courses`
  - Create new course
  - Body: code, name, department

- `GET /api/lecturers/courses`
  - List all courses for logged-in lecturer

- `GET /api/lecturers/courses/:id`
  - Get single course details

- `PUT /api/lecturers/courses/:id`
  - Update course details

- `DELETE /api/lecturers/courses/:id`
  - Delete course

- `GET /api/lecturers/courses/:id/students`
  - List enrolled students

- `POST /api/lecturers/sessions/start`
  - Start attendance session
  - Body: course_id, duration_minutes
  - Returns: session_id, qr_code

- `GET /api/lecturers/sessions/:id`
  - Get session details and attendance list

- `POST /api/lecturers/sessions/:id/end`
  - End attendance session

- `GET /api/lecturers/courses/:id/reports`
  - Get attendance reports for course

#### Step 2: Student Features

**Create `backend/app/routes/student.py`**

Endpoints:
- `GET /api/students/courses`
  - List available courses (by department/level)

- `POST /api/students/courses/:id/join`
  - Enroll in a course

- `GET /api/students/courses/enrolled`
  - List my enrolled courses

- `POST /api/students/courses/:id/leave`
  - Unenroll from course

- `GET /api/students/sessions/active`
  - Get currently active attendance sessions

- `POST /api/students/attendance/mark`
  - Mark attendance
  - Body: session_id, qr_code_data
  - Returns: success/failure

- `GET /api/students/attendance/history`
  - Get my attendance history

- `GET /api/students/courses/:id/attendance`
  - Get my attendance for specific course

#### Step 3: QR Code Service

**Create `backend/app/services/qr_service.py`**

Functions:
- `generate_session_qr(session_id, course_id, expires_at)`
  - Creates time-based QR data
  - Returns QR code image (base64)

- `validate_qr_code(qr_data, session_id)`
  - Checks if QR is valid
  - Checks expiration
  - Prevents duplicate scanning

- `rotate_qr_code(session_id)`
  - Called by background task
  - Generates new QR every 30 seconds

**Background Task:**
- Implement QR rotation using threading or celery
- Update session QR code every 30 seconds while active

---

### Phase 4: Frontend Integration (Week 3-4)

#### Step 1: API Client Setup

**Create `frontend/src/lib/api.ts`**
- Axios/fetch wrapper
- Token management
- Error handling
- Request/response interceptors

#### Step 2: Authentication Pages

**Create:**
- `frontend/src/app/(auth)/student/login/page.tsx`
- `frontend/src/app/(auth)/student/register/page.tsx`
- `frontend/src/app/(auth)/lecturer/login/page.tsx`
- `frontend/src/app/(auth)/lecturer/register/page.tsx`

#### Step 3: Student Dashboard

**Create:**
- `frontend/src/app/student/dashboard/page.tsx` - Overview
- `frontend/src/app/student/courses/page.tsx` - My courses
- `frontend/src/app/student/scan/page.tsx` - QR scanner
- `frontend/src/app/student/history/page.tsx` - Attendance history

#### Step 4: Lecturer Dashboard

**Create:**
- `frontend/src/app/lecturer/dashboard/page.tsx` - Overview
- `frontend/src/app/lecturer/courses/page.tsx` - My courses
- `frontend/src/app/lecturer/courses/[id]/page.tsx` - Course details
- `frontend/src/app/lecturer/session/[id]/page.tsx` - Active session
- `frontend/src/app/lecturer/reports/page.tsx` - Reports

#### Step 5: Shared Components

**Create:**
- `frontend/src/components/QRScanner.tsx` - Camera QR scanner
- `frontend/src/components/QRDisplay.tsx` - Display rotating QR
- `frontend/src/components/CourseCard.tsx` - Course item
- `frontend/src/components/AttendanceChart.tsx` - Visualization

---

### Phase 5: Testing & Polish (Week 4-5)

#### Backend Tests

**Create `backend/tests/`**
- `test_auth.py` - Test authentication
- `test_student.py` - Test student endpoints
- `test_lecturer.py` - Test lecturer endpoints
- `test_qr.py` - Test QR generation/validation
- `test_models.py` - Test database models

**Run tests:**
```bash
pytest tests/ -v
```

#### Frontend Tests

**Create tests:**
- Component tests (Jest + React Testing Library)
- E2E tests (Playwright/Cypress)

#### Integration Testing

- Test full user flows
- Test QR code rotation
- Test concurrent attendance marking
- Test error scenarios

---

### Phase 6: Deployment (Week 5-6)

#### Backend Deployment

**Options:**
1. **Railway/Render** (Easy)
2. **AWS EC2** (Flexible)
3. **Heroku** (Simple)
4. **DigitalOcean** (Affordable)

**Setup:**
- Use production config
- Set environment variables
- Use Gunicorn instead of Flask dev server
- Set up MySQL/PostgreSQL
- Configure CORS for production domain

#### Frontend Deployment

**Vercel (Recommended for Next.js):**
```bash
vercel --prod
```

**Configure:**
- Set API URL environment variable
- Set up custom domain
- Configure redirects

#### Database

**Options:**
1. **PlanetScale** (MySQL, free tier)
2. **Supabase** (PostgreSQL, free tier)
3. **AWS RDS** (Reliable)

---

## 📚 Learning Resources

### Python/Flask
- Flask Mega-Tutorial
- SQLAlchemy Documentation
- JWT Authentication Guide

### Frontend
- Next.js Documentation
- React Query for API calls
- QR Scanner libraries (html5-qrcode)

### DevOps
- Docker basics
- CI/CD with GitHub Actions
- Environment management

---

## 🎓 Weekly Learning Plan

### Week 1: Backend Foundation
- ✅ Day 1-2: Config and App Factory (DONE)
- Day 3-4: Database Models
- Day 5: Authentication Setup
- Day 6-7: Auth Endpoints

### Week 2: Core Features
- Day 8-9: Lecturer Endpoints
- Day 10-11: Student Endpoints
- Day 12-13: QR Service
- Day 14: Testing

### Week 3: Frontend Start
- Day 15-16: API Client & Auth Context
- Day 17-18: Auth Pages
- Day 19-20: Student Dashboard
- Day 21: Integration

### Week 4: Frontend Complete
- Day 22-23: Lecturer Dashboard
- Day 24-25: QR Scanner/Display
- Day 26-27: Testing & Polish
- Day 28: Documentation

### Week 5-6: Launch
- Day 29-30: Backend Deployment
- Day 31-32: Frontend Deployment
- Day 33-34: Integration Testing
- Day 35: Go Live!

---

## ✅ Daily Checklist Template

```markdown
### Date: ____-__-__

**Today's Goal:**
- [ ] Main task 1
- [ ] Main task 2

**Completed:**
-

**Learned:**
-

**Blockers:**
-

**Next Session:**
-
```

---

## 🚀 Immediate Next Steps

1. **RIGHT NOW:**
   ```bash
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **THEN:**
   ```bash
   python run.py
   curl http://localhost:5000/health
   ```

3. **NEXT:**
   - Create database models
   - Test database connection
   - Create first auth endpoint

---

## 📝 Notes

**Things to Remember:**
- Always activate venv before working
- Test each endpoint as you create it
- Commit small, working changes
- Keep security in mind (hash passwords, validate inputs)
- Document as you go

**Common Pitfalls:**
- Forgetting to activate venv
- Not testing before moving to next feature
- Hardcoding secrets (use .env)
- Not handling errors properly
- Skipping validation

---

**Remember:** Take it one step at a time. You're learning Python AND building a full-stack app. It's okay to go slow and understand each piece!
