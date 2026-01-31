# Attendo: Complete User Flow Documentation

## System Overview

**Two User Types:**
1. **Lecturers** - Create courses, start attendance sessions, view reports
2. **Students** - Join sessions, scan QR codes, view attendance history

---

## STUDENT FLOW

### 1. First-Time User (Sign Up)

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT FIRST TIME                        │
└─────────────────────────────────────────────────────────────┘

Step 1: Landing Page
┌──────────────────────────┐
│   ATTENDO SPLASH SCREEN  │
│                          │
│   [ I am a Student ]     │  ← Click this
│   [ I am a Lecturer ]    │
└──────────────────────────┘
                ↓
Step 2: Student Portal
┌──────────────────────────┐
│   STUDENT PORTAL         │
│                          │
│   Welcome to Attendo     │
│                          │
│   [ Login ]              │
│   [ Sign Up ]            │  ← Click this
└──────────────────────────┘
                ↓
Step 3: Sign Up Form
┌──────────────────────────────────┐
│   STUDENT SIGN UP                │
│                                  │
│   Full Name:    [___________]    │
│   Email:        [___________]    │
│   Index Number: [___________]    │
│   Department:   [▼Computer Sci]  │  ← Dropdown
│   Level:        [▼ 200]          │  ← Dropdown (100/200/300/400)
│   4-Digit PIN:  [____]           │  ← Password input
│   Confirm PIN:  [____]           │
│                                  │
│   [ Create Account ]             │
└──────────────────────────────────┘
                ↓
Step 4: Auto-Login → Dashboard
┌──────────────────────────────────┐
│   STUDENT DASHBOARD              │
│   Welcome, John Doe              │
│   Dept: Computer Science | L200  │
│                                  │
│   🔴 ACTIVE SESSIONS NOW         │
│   ┌──────────────────────────┐  │
│   │ CSC 201 - Data Struct    │  │
│   │ Dr. Mensah               │  │
│   │ Started: 10:00 AM        │  │
│   │ [ Scan Attendance ]      │  │  ← Can scan now
│   └──────────────────────────┘  │
│                                  │
│   ┌──────────────────────────┐  │
│   │ CSC 205 - Algorithms     │  │
│   │ Prof. Boateng            │  │
│   │ Started: 10:05 AM        │  │
│   │ [ Scan Attendance ]      │  │
│   └──────────────────────────┘  │
│                                  │
│   [ View My Courses ]            │
│   [ Attendance History ]         │
└──────────────────────────────────┘
```

---

### 2. Returning User (Login)

```
┌─────────────────────────────────────────────────────────────┐
│                   STUDENT RETURNING                          │
└─────────────────────────────────────────────────────────────┘

Step 1: Splash → Portal → Login
┌──────────────────────────┐
│   STUDENT LOGIN          │
│                          │
│   Index Number:          │
│   [___________]          │
│                          │
│   4-Digit PIN:           │
│   [____]                 │
│                          │
│   [ Sign In ]            │
│                          │
│   Don't have an account? │
│   Sign up                │
└──────────────────────────┘
                ↓
Step 2: Dashboard (Same as above)
```

---

### 3. Marking Attendance (Core Flow)

```
┌─────────────────────────────────────────────────────────────┐
│               STUDENT ATTENDANCE FLOW                        │
└─────────────────────────────────────────────────────────────┘

Step 1: Student in Dashboard
┌──────────────────────────────────┐
│   ACTIVE SESSIONS NOW            │
│   ┌──────────────────────────┐  │
│   │ CSC 201 - Data Struct    │  │
│   │ Dr. Mensah               │  │
│   │ Started: 10:00 AM        │  │
│   │ [ Scan Attendance ]      │  │  ← Click this
│   └──────────────────────────┘  │
└──────────────────────────────────┘
                ↓
Step 2: Camera Opens
┌──────────────────────────────────┐
│   QR CODE SCANNER                │
│                                  │
│   ┌──────────────────────────┐  │
│   │                          │  │
│   │    [CAMERA VIEW]         │  │
│   │                          │  │
│   │      📷 Point at QR      │  │
│   │                          │  │
│   └──────────────────────────┘  │
│                                  │
│   Scanning for:                  │
│   CSC 201 - Data Structures      │
│                                  │
│   [ Cancel ]                     │
└──────────────────────────────────┘
                ↓
Step 3a: Student Points Phone at Lecturer's Screen
┌──────────────────────────────────┐
│   LECTURER'S SCREEN/PROJECTOR    │
│   (In the classroom)             │
│                                  │
│   ┌──────────────────────────┐  │
│   │  ████████████████████    │  │
│   │  ██ ▄▄▄▄▄ █▀▄█ ▄▄▄▄▄ ██  │  │
│   │  ██ █   █ █ ▀█ █   █ ██  │  │
│   │  ██ █▄▄▄█ █▄ █ █▄▄▄█ ██  │  │
│   │  ████████████████████    │  │  ← Rotating QR Code
│   │                          │  │     (Changes every 30s)
│   │  CSC 201 - Data Struct   │  │
│   │  15 students present     │  │
│   └──────────────────────────┘  │
└──────────────────────────────────┘
                ↓
Step 3b: Scan Detected → Processing
┌──────────────────────────────────┐
│   PROCESSING...                  │
│                                  │
│   ⏳ Verifying attendance...     │
│                                  │
│   Backend checks:                │
│   ✓ QR signature valid           │
│   ✓ Session is active            │
│   ✓ Department & level match     │
│   ✓ Not duplicate attendance     │
│   ✓ Auto-enrolling in course... │
└──────────────────────────────────┘
                ↓
Step 4a: SUCCESS - First Time in Course
┌──────────────────────────────────┐
│   ✅ ATTENDANCE MARKED!          │
│                                  │
│   Course: CSC 201 - Data Struct  │
│   Lecturer: Dr. Mensah           │
│   Time: 10:12 AM                 │
│                                  │
│   🎉 You've been enrolled in     │
│      this course!                │
│                                  │
│   [ Back to Dashboard ]          │
└──────────────────────────────────┘
                ↓
Step 4b: SUCCESS - Already Enrolled
┌──────────────────────────────────┐
│   ✅ ATTENDANCE MARKED!          │
│                                  │
│   Course: CSC 201 - Data Struct  │
│   Lecturer: Dr. Mensah           │
│   Time: 10:12 AM                 │
│                                  │
│   Total Attendance: 12/15        │
│                                  │
│   [ Back to Dashboard ]          │
└──────────────────────────────────┘
```

---

### 4. Error Cases

```
┌─────────────────────────────────────────────────────────────┐
│                   ERROR SCENARIOS                            │
└─────────────────────────────────────────────────────────────┘

Error 1: Already Marked Attendance
┌──────────────────────────────────┐
│   ❌ ALREADY MARKED              │
│                                  │
│   You've already marked          │
│   attendance for this session.   │
│                                  │
│   [ Back to Dashboard ]          │
└──────────────────────────────────┘

Error 2: Wrong QR Code (Different Session)
┌──────────────────────────────────┐
│   ❌ INVALID QR CODE             │
│                                  │
│   This QR code is for a          │
│   different session.             │
│                                  │
│   Please scan the correct QR.    │
│                                  │
│   [ Try Again ]                  │
└──────────────────────────────────┘

Error 3: QR Code Expired
┌──────────────────────────────────┐
│   ❌ QR CODE EXPIRED             │
│                                  │
│   This QR code has expired.      │
│   Please scan the current QR.    │
│                                  │
│   [ Try Again ]                  │
└──────────────────────────────────┘

Error 4: Session Ended
┌──────────────────────────────────┐
│   ❌ SESSION ENDED               │
│                                  │
│   This attendance session has    │
│   been closed by the lecturer.   │
│                                  │
│   [ Back to Dashboard ]          │
└──────────────────────────────────┘
```

---

## LECTURER FLOW

### 1. First-Time User (Sign Up)

```
┌─────────────────────────────────────────────────────────────┐
│                  LECTURER FIRST TIME                         │
└─────────────────────────────────────────────────────────────┘

Step 1: Landing Page
┌──────────────────────────┐
│   ATTENDO SPLASH SCREEN  │
│                          │
│   [ I am a Student ]     │
│   [ I am a Lecturer ]    │  ← Click this
└──────────────────────────┘
                ↓
Step 2: Lecturer Portal
┌──────────────────────────┐
│   LECTURER PORTAL        │
│                          │
│   Welcome to Attendo     │
│                          │
│   [ Login ]              │
│   [ Sign Up ]            │  ← Click this
└──────────────────────────┘
                ↓
Step 3: Sign Up Form
┌──────────────────────────────────┐
│   LECTURER SIGN UP               │
│                                  │
│   Staff ID:     [___________]    │
│   Full Name:    [___________]    │
│   Email:        [___________]    │  ← Must end with .edu
│   Password:     [___________]    │  ← Min 8 chars, complex
│   Confirm:      [___________]    │
│                                  │
│   [ Create Account ]             │
│                                  │
│   Already have an account?       │
│   Sign in                        │
└──────────────────────────────────┘
                ↓
Step 4: Auto-Login → Dashboard
```

---

### 2. Lecturer Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                  LECTURER DASHBOARD                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│   LECTURER DASHBOARD                                     │
│   Dr. Mensah (Staff ID: LEC001)                          │
│                                                          │
│   📚 MY COURSES                                          │
│   ┌────────────────────────────────────────────────┐    │
│   │ CSC 201 - Data Structures                      │    │
│   │ Students: 45 | Sessions: 12                    │    │
│   │ [ Start Session ] [ View Reports ]             │    │
│   └────────────────────────────────────────────────┘    │
│                                                          │
│   ┌────────────────────────────────────────────────┐    │
│   │ CSC 305 - Operating Systems                    │    │
│   │ Students: 38 | Sessions: 10                    │    │
│   │ [ Start Session ] [ View Reports ]             │    │
│   └────────────────────────────────────────────────┘    │
│                                                          │
│   [ + Create New Course ]                               │
│                                                          │
│   🔴 ACTIVE SESSIONS                                     │
│   (No active sessions)                                   │
│                                                          │
│   [ Attendance Reports ] [ My Profile ]                  │
└──────────────────────────────────────────────────────────┘
```

---

### 3. Creating a Course

```
┌─────────────────────────────────────────────────────────────┐
│                   CREATE COURSE FLOW                         │
└─────────────────────────────────────────────────────────────┘

Step 1: Click "Create New Course"
┌──────────────────────────────────┐
│   CREATE NEW COURSE              │
│                                  │
│   Course Code:                   │
│   [CSC 201]                      │
│                                  │
│   Course Name:                   │
│   [Data Structures]              │
│                                  │
│   Department:                    │
│   [▼ Computer Science]           │  ← Dropdown
│                                  │
│   Level:                         │
│   [▼ 200]                        │  ← Dropdown
│                                  │
│   Academic Year:                 │
│   [2024/2025]                    │
│                                  │
│   Semester:                      │
│   [▼ 1]                          │  ← Dropdown (1 or 2)
│                                  │
│   [ Create Course ]              │
│   [ Cancel ]                     │
└──────────────────────────────────┘
                ↓
Step 2: Course Created → Back to Dashboard
```

---

### 4. Starting an Attendance Session

```
┌─────────────────────────────────────────────────────────────┐
│              START ATTENDANCE SESSION FLOW                   │
└─────────────────────────────────────────────────────────────┘

Step 1: From Dashboard, Click "Start Session"
┌──────────────────────────────────┐
│   START ATTENDANCE SESSION       │
│                                  │
│   Course: CSC 201 - Data Struct  │
│   Department: Computer Science   │
│   Level: 200                     │
│                                  │
│   Session Name:                  │
│   [Week 3 - Linked Lists]        │
│                                  │
│   Session Type:                  │
│   [▼ Lecture]                    │  ← Lecture/Tutorial/Lab
│                                  │
│   QR Rotation Interval:          │
│   [30] seconds                   │  ← Default 30
│                                  │
│   [ Start Session ]              │
│   [ Cancel ]                     │
└──────────────────────────────────┘
                ↓
Step 2: Session Created → QR Display Page
┌────────────────────────────────────────────────────────┐
│   🔴 LIVE SESSION                                      │
│   CSC 201 - Data Structures                            │
│   Week 3 - Linked Lists                                │
│   Started: 10:00 AM                                    │
│                                                        │
│   ┌────────────────────────────────────────────┐      │
│   │  ████████████████████████████████████      │      │
│   │  ████ ▄▄▄▄▄ █▀ ▄▄██▀▄ ▄ ▄▄▄▄▄ ████         │      │
│   │  ████ █   █ █▄▀█ ▄ ██▀█ █   █ ████         │      │
│   │  ████ █▄▄▄█ █ ▄ ▀▄ ▀▀▀█ █▄▄▄█ ████         │      │
│   │  ████▄▄▄▄▄▄▄█▀▄▀█ █ █ █▄▄▄▄▄▄▄████         │      │
│   │  ████ ▀█▀▄ ▄ ▄ ▀▀▄█▀█▄▀█  ▀▀▄████         │      │
│   │  ████████████████████████████████████      │      │
│   │                                            │      │
│   │  Scan this QR code to mark attendance     │      │
│   │  Code rotates every 30 seconds            │      │
│   └────────────────────────────────────────────┘      │
│                                                        │
│   📊 ATTENDANCE STATS                                  │
│   ┌─────────────────────┐                             │
│   │ Students Present: 15                              │
│   │ Last Scan: 10:12 AM - John Doe (IND12345)         │
│   └─────────────────────┘                             │
│                                                        │
│   📋 RECENT SCANS                                      │
│   • 10:12 AM - John Doe (IND12345) ✅ Enrolled        │
│   • 10:11 AM - Jane Smith (IND12346) ✅               │
│   • 10:10 AM - Mike Johnson (IND12347) ✅             │
│   • 10:09 AM - Sarah Wilson (IND12348) ✅ Enrolled    │
│                                                        │
│   [ End Session ]  [ Download Report ]                │
└────────────────────────────────────────────────────────┘
```

---

### 5. Ending a Session

```
┌─────────────────────────────────────────────────────────────┐
│                   END SESSION FLOW                           │
└─────────────────────────────────────────────────────────────┘

Step 1: Click "End Session"
┌──────────────────────────────────┐
│   END SESSION?                   │
│                                  │
│   Are you sure you want to end   │
│   this attendance session?       │
│                                  │
│   CSC 201 - Data Structures      │
│   15 students marked present     │
│                                  │
│   [ End Session ]                │
│   [ Cancel ]                     │
└──────────────────────────────────┘
                ↓
Step 2: Session Ended → Report Page
┌──────────────────────────────────┐
│   ✅ SESSION ENDED               │
│                                  │
│   CSC 201 - Data Structures      │
│   Duration: 25 minutes           │
│   Total Present: 15/45           │
│                                  │
│   [ View Full Report ]           │
│   [ Back to Dashboard ]          │
└──────────────────────────────────┘
```

---

## DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM DATA FLOW                          │
└─────────────────────────────────────────────────────────────┘

LECTURER CREATES SESSION:
┌──────────┐      ┌──────────┐      ┌──────────────┐
│ Lecturer │ ───→ │ Backend  │ ───→ │  Database    │
│  (Web)   │      │   API    │      │  - Session   │
└──────────┘      └──────────┘      │  - QR Secret │
                        │            └──────────────┘
                        ↓
                  Generate QR
                  (30s rotation)
                        │
                        ↓
                  ┌──────────┐
                  │ Frontend │
                  │ displays │
                  │    QR    │
                  └──────────┘

STUDENT MARKS ATTENDANCE:
┌──────────┐      ┌──────────┐      ┌──────────────┐
│ Student  │ ───→ │ Scan QR  │ ───→ │   Backend    │
│ (Mobile) │      │  Camera  │      │   Validate   │
└──────────┘      └──────────┘      └──────────────┘
                                            │
                                    Checks:
                                    1. QR signature ✓
                                    2. Session active ✓
                                    3. Dept/Level match ✓
                                    4. Not duplicate ✓
                                            │
                                            ↓
                                    ┌──────────────┐
                                    │  Database    │
                                    │  - Enroll    │
                                    │  - Attendance│
                                    └──────────────┘
                                            │
                                            ↓
                                    ┌──────────────┐
                                    │   Success    │
                                    │   Response   │
                                    └──────────────┘
```

---

## SESSION FILTERING LOGIC

```
┌─────────────────────────────────────────────────────────────┐
│            HOW STUDENTS SEE SESSIONS                         │
└─────────────────────────────────────────────────────────────┘

EXAMPLE:
Lecturer Dr. Mensah creates session:
  - Course: CSC 201
  - Department: Computer Science
  - Level: 200

Backend filters active sessions:
  - Show to students WHERE:
    • student.department = "Computer Science"
    • student.level = "200"
    • session.status = "active"

RESULT:
✅ John (CS, 200) → SEES session
✅ Jane (CS, 200) → SEES session
❌ Mike (CS, 300) → DOES NOT see (wrong level)
❌ Sarah (Engineering, 200) → DOES NOT see (wrong dept)
```

---

## SECURITY FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                 QR CODE SECURITY                             │
└─────────────────────────────────────────────────────────────┘

QR CODE GENERATION (Every 30 seconds):
┌────────────────────────────────────────────┐
│ Payload:                                   │
│   {                                        │
│     "session_id": 123,                     │
│     "time_slot": 12345678,  ← Changes!     │
│     "timestamp": 1234567890                │
│   }                                        │
└────────────────────────────────────────────┘
                ↓
       Create HMAC Signature
       (using session.qr_secret)
                ↓
┌────────────────────────────────────────────┐
│ Final QR Data:                             │
│   {                                        │
│     "p": payload,                          │
│     "s": "abc123..."  ← Signature          │
│   }                                        │
│   Base64 Encoded                           │
└────────────────────────────────────────────┘

QR CODE VALIDATION:
┌────────────────────────────────────────────┐
│ Student scans QR                           │
└────────────────────────────────────────────┘
                ↓
       Decode Base64
                ↓
       Verify Signature
       (using stored qr_secret)
                ↓
       Check timestamp
       (must be < 60s old)
                ↓
       Check session_id matches
                ↓
       ✅ Valid or ❌ Reject
```

---

## TIMING DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│              SESSION TIMELINE                                │
└─────────────────────────────────────────────────────────────┘

10:00 AM │ Lecturer starts session
         │ QR Code #1 generated
         │ Students can start scanning
         │
10:00:30 │ QR Code #2 generated (new token)
         │ QR Code #1 still valid (60s grace)
         │
10:01:00 │ QR Code #3 generated
         │ QR Code #1 expires
         │
10:01:30 │ QR Code #4 generated
         │ QR Code #2 expires
         │
   ...   │ Continues rotating...
         │
10:25:00 │ Lecturer ends session
         │ No more scanning allowed
         │ Report generated

GRACE PERIOD EXAMPLE:
QR generated at: 10:00:00
Valid until: 10:01:00 (60 second grace)
Student scans at 10:00:55 → ✅ Accepted
Student scans at 10:01:05 → ❌ Expired
```

---

## MOBILE RESPONSIVE VIEWS

```
┌─────────────────────────────────────────────────────────────┐
│              MOBILE VIEW (Student)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Attendo     ≡   │ ← Hamburger menu
├─────────────────┤
│ Active Sessions │
├─────────────────┤
│ ┌─────────────┐ │
│ │ CSC 201     │ │
│ │ Dr. Mensah  │ │
│ │ 10:00 AM    │ │
│ │ [Scan Now]  │ │ ← Big tap target
│ └─────────────┘ │
├─────────────────┤
│ ┌─────────────┐ │
│ │ CSC 205     │ │
│ │ Prof. Adu   │ │
│ │ 10:05 AM    │ │
│ │ [Scan Now]  │ │
│ └─────────────┘ │
├─────────────────┤
│ [My Courses]    │
│ [History]       │
└─────────────────┘
```

---

## EDGE CASES HANDLED

```
┌─────────────────────────────────────────────────────────────┐
│                    EDGE CASES                                │
└─────────────────────────────────────────────────────────────┘

1. STUDENT TRIES TO SCAN TWICE
   → Backend checks attendance_records table
   → If exists: Return error "Already marked"
   → Prevent duplicate attendance

2. STUDENT SCANS WRONG QR (Different Session)
   → QR contains session_id: 123
   → Student selected session_id: 456
   → Validation fails: "Wrong session"

3. STUDENT SCANS EXPIRED QR
   → Check timestamp in QR payload
   → If > 60 seconds old: "QR expired"

4. QR SCREENSHOT/PHOTO ATTACK
   → QR rotates every 30 seconds
   → Old screenshots become invalid
   → Timestamp validation prevents old QRs

5. LECTURER ENDS SESSION WHILE STUDENT SCANNING
   → Check session.status = 'active'
   → If status = 'ended': "Session closed"

6. NETWORK DISCONNECTION
   → Frontend shows loading state
   → Timeout after 10 seconds
   → Error message: "Check connection"

7. WRONG DEPARTMENT/LEVEL STUDENT SEES SESSION
   → Filtered at backend
   → SQL: WHERE course.department = student.department
   →      AND course.level = student.level
   → Won't appear in student's list
```

---

## SUCCESS METRICS

```
┌─────────────────────────────────────────────────────────────┐
│              WHAT SUCCESS LOOKS LIKE                         │
└─────────────────────────────────────────────────────────────┘

STUDENT EXPERIENCE:
✓ Login in < 5 seconds
✓ See relevant sessions immediately
✓ Scan QR in < 10 seconds
✓ Instant feedback (success/error)
✓ No confusion about which session to join

LECTURER EXPERIENCE:
✓ Start session in < 3 clicks
✓ See real-time attendance updates
✓ QR visible on screen/projector
✓ Easy session management
✓ Download reports with 1 click

SYSTEM SECURITY:
✓ No duplicate attendance
✓ No cross-session scanning
✓ PIN/password hashed
✓ JWT tokens expire
✓ QR codes rotate and expire
```

---

## SUMMARY

**STUDENT JOURNEY:**
Sign up → Login → See filtered sessions → Select → Scan QR → Marked present

**LECTURER JOURNEY:**
Sign up → Login → Create course → Start session → Display QR → Students scan → End session → View report

**KEY FEATURES:**
- Auto-enrollment on first scan
- Department/Level filtering
- Rotating QR codes (30s)
- Real-time attendance tracking
- No manual enrollment needed
- Mobile-first design
