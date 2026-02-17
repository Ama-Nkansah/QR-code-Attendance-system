# Attendo: Complete User Flow Documentation

## System Overview

**Two User Types:**
1. **Lecturers** - Create courses, start attendance sessions, view reports
2. **Students** - Mark attendance via phone, view attendance history

**Attendance Model:**
- Lecturer starts session with a duration timer and GPS auto-captured from their device
- Students fetch the current rotating QR on their own phone screen
- Students confirm attendance — GPS validates physical presence, no phone raising needed
- Session auto-expires when timer runs out

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
│   ACTIVE SESSIONS NOW            │
│   ┌──────────────────────────┐  │
│   │ CSC 201 - Data Struct    │  │
│   │ Dr. Mensah               │  │
│   │ Started: 10:00 AM        │  │
│   │ Time Left: 12:34         │  │
│   │ [ Mark Attendance ]      │  │  ← Tap to mark
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
│   │ Time Left: 12:34         │  │
│   │ [ Mark Attendance ]      │  │  ← Tap this
│   └──────────────────────────┘  │
└──────────────────────────────────┘
                ↓
Step 2: App fetches current QR from backend
        GPS permission requested (if not already granted)
┌──────────────────────────────────┐
│   MARK ATTENDANCE                │
│   CSC 201 - Data Structures      │
│                                  │
│   ┌──────────────────────────┐  │
│   │  ████████████████████    │  │
│   │  ██ ▄▄▄▄▄ █▀▄█ ▄▄▄▄▄ ██ │  │  ← QR displayed on
│   │  ██ █   █ █ ▀█ █   █ ██ │  │    student's own phone
│   │  ██ █▄▄▄█ █▄ █ █▄▄▄█ ██ │  │    (silently rotates
│   │  ████████████████████    │  │     every 30s)
│   └──────────────────────────┘  │
│                                  │
│   [ Confirm Attendance ]         │  ← Tap to submit
│   [ Cancel ]                     │
└──────────────────────────────────┘
                ↓
Step 3: On tap — app submits QR token + GPS coords silently
┌──────────────────────────────────┐
│   PROCESSING...                  │
│                                  │
│   Verifying attendance...        │
│                                  │
│   Backend checks:                │
│   - QR signature valid           │
│   - QR not expired               │
│   - Session timer active         │
│   - GPS within classroom range   │
│   - Not duplicate attendance     │
│   - Auto-enrolling if new...     │
└──────────────────────────────────┘
                ↓
Step 4a: SUCCESS - First Time in Course
┌──────────────────────────────────┐
│   ATTENDANCE MARKED!             │
│                                  │
│   Course: CSC 201 - Data Struct  │
│   Lecturer: Dr. Mensah           │
│   Time: 10:12 AM                 │
│                                  │
│   You have been enrolled in      │
│   this course!                   │
│                                  │
│   [ Back to Dashboard ]          │
└──────────────────────────────────┘
                ↓
Step 4b: SUCCESS - Already Enrolled
┌──────────────────────────────────┐
│   ATTENDANCE MARKED!             │
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
│   ALREADY MARKED                 │
│                                  │
│   You have already marked        │
│   attendance for this session.   │
│                                  │
│   [ Back to Dashboard ]          │
└──────────────────────────────────┘

Error 2: QR Code Expired (took too long to confirm)
┌──────────────────────────────────┐
│   QR CODE EXPIRED                │
│                                  │
│   The QR code has refreshed.     │
│   Please tap Mark Attendance     │
│   again to get the latest code.  │
│                                  │
│   [ Try Again ]                  │
└──────────────────────────────────┘

Error 3: Session Timer Elapsed
┌──────────────────────────────────┐
│   SESSION ENDED                  │
│                                  │
│   The attendance window for      │
│   this session has closed.       │
│                                  │
│   [ Back to Dashboard ]          │
└──────────────────────────────────┘

Error 4: Outside Classroom Range (GPS check failed)
┌──────────────────────────────────┐
│   LOCATION CHECK FAILED          │
│                                  │
│   You must be in the classroom   │
│   to mark attendance.            │
│                                  │
│   Make sure GPS is enabled       │
│   and try again.                 │
│                                  │
│   [ Try Again ]                  │
└──────────────────────────────────┘

Error 5: GPS Permission Denied
┌──────────────────────────────────┐
│   LOCATION REQUIRED              │
│                                  │
│   Attendo needs your location    │
│   to verify classroom presence.  │
│                                  │
│   Please enable location in      │
│   your browser settings.         │
│                                  │
│   [ Open Settings ]              │
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
│   MY COURSES                                             │
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
│   ACTIVE SESSIONS                                        │
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
│   Duration:                      │
│   [▼ 15 mins]                    │  ← 5/10/15/20/30 mins
│                                  │
│   Your classroom location will   │
│   be captured automatically.     │
│                                  │
│   [ Start Session ]              │
│   [ Cancel ]                     │
└──────────────────────────────────┘
                ↓
Step 2: Browser requests GPS permission (one-time)
        Classroom coordinates captured silently
                ↓
Step 3: Session Created → Live Session View
┌────────────────────────────────────────────────────────┐
│   LIVE SESSION                                         │
│   CSC 201 - Data Structures                            │
│   Week 3 - Linked Lists                                │
│   Started: 10:00 AM                                    │
│                                                        │
│   Time Remaining:                                      │
│        14:32                     ← Countdown timer    │
│                                                        │
│   Students Present: 15                                 │
│                                                        │
│   RECENT SCANS                                         │
│   • 10:12 AM - John Doe (IND12345) - Enrolled         │
│   • 10:11 AM - Jane Smith (IND12346)                  │
│   • 10:10 AM - Mike Johnson (IND12347)                │
│   • 10:09 AM - Sarah Wilson (IND12348) - Enrolled     │
│                                                        │
│   [ End Early ]  [ Download Report ]                  │
└────────────────────────────────────────────────────────┘
                ↓
Step 4a: Timer reaches 0:00 → Session auto-closes
┌──────────────────────────────────┐
│   SESSION ENDED                  │
│                                  │
│   CSC 201 - Data Structures      │
│   Duration: 15 minutes           │
│   Total Present: 15/45           │
│                                  │
│   [ View Full Report ]           │
│   [ Back to Dashboard ]          │
└──────────────────────────────────┘
```

---

### 5. Ending a Session Early (Optional)

```
┌─────────────────────────────────────────────────────────────┐
│                   END EARLY FLOW                             │
└─────────────────────────────────────────────────────────────┘

Step 1: Click "End Early"
┌──────────────────────────────────┐
│   END SESSION EARLY?             │
│                                  │
│   Are you sure you want to end   │
│   this session before the timer? │
│                                  │
│   CSC 201 - Data Structures      │
│   15 students marked present     │
│   Time Remaining: 08:45          │
│                                  │
│   [ End Now ]                    │
│   [ Cancel ]                     │
└──────────────────────────────────┘
                ↓
Step 2: Session Ended → Report Page (same as timer expiry)
```

---

## DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM DATA FLOW                          │
└─────────────────────────────────────────────────────────────┘

LECTURER CREATES SESSION:
┌──────────┐      ┌──────────┐      ┌──────────────────────┐
│ Lecturer │ ───→ │ Backend  │ ───→ │  Database            │
│  (Web)   │      │   API    │      │  - Session           │
│          │      │          │      │  - QR Secret         │
│ GPS auto │      │ Captures │      │  - Classroom lat/lng │
│ captured │      │ GPS      │      │  - Duration / expiry │
└──────────┘      └──────────┘      └──────────────────────┘
                        │
                  Generate rotating QR
                  (30s backend-only)
                  No QR on lecturer screen


STUDENT MARKS ATTENDANCE:
┌──────────┐      ┌──────────────┐      ┌──────────────┐
│ Student  │ ───→ │ GET /qr      │ ───→ │  Backend     │
│ (Mobile) │      │ fetch token  │      │  Returns     │
│          │      └──────────────┘      │  current QR  │
│          │                            └──────────────┘
│          │      QR displayed on
│          │      student's phone
│          │
│          │      ┌──────────────┐      ┌──────────────┐
│          │ ───→ │ POST /attend │ ───→ │  Backend     │
│  GPS     │      │ token + GPS  │      │  Validate    │
│ captured │      └──────────────┘      └──────────────┘
└──────────┘                                   │
                                       Checks:
                                       1. QR signature valid
                                       2. QR not expired
                                       3. Session timer active
                                       4. GPS within radius
                                       5. Not duplicate
                                               │
                                               ↓
                                       ┌──────────────┐
                                       │  Database    │
                                       │  - Enroll    │
                                       │  - Attendance│
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
    • session.expires_at > now()

RESULT:
✓ John (CS, 200) → SEES session
✓ Jane (CS, 200) → SEES session
✗ Mike (CS, 300) → DOES NOT see (wrong level)
✗ Sarah (Engineering, 200) → DOES NOT see (wrong dept)
```

---

## SECURITY MODEL

```
┌─────────────────────────────────────────────────────────────┐
│                 DUAL-LAYER SECURITY                          │
└─────────────────────────────────────────────────────────────┘

LAYER 1 — ROTATING QR (Token Validity):

QR CODE GENERATION (Every 30 seconds, backend only):
┌────────────────────────────────────────┐
│ Payload:                               │
│   {                                    │
│     "session_id": 123,                 │
│     "time_slot": 12345678,  ← Changes │
│     "timestamp": 1234567890            │
│   }                                    │
└────────────────────────────────────────┘
                ↓
       Create HMAC Signature
       (using session.qr_secret)
                ↓
┌────────────────────────────────────────┐
│ QR served to authenticated student:    │
│   {                                    │
│     "p": payload,                      │
│     "s": "abc123..."  ← Signature     │
│   }                                    │
│   Base64 Encoded                       │
└────────────────────────────────────────┘

QR is NEVER displayed on lecturer's screen.
QR is ONLY served via authenticated API to enrolled students.


LAYER 2 — GEOLOCATION (Physical Presence):

On session start:
  → Lecturer's GPS coordinates stored as classroom_lat / classroom_lng
  → Allowed radius: 100m (configurable per session)

On attendance submission:
  → Student's GPS coordinates submitted with QR token
  → Backend calculates distance (Haversine formula)
  → If distance > allowed_radius: REJECTED


COMBINED VALIDATION:
┌────────────────────────────────────────┐
│ Student submits: token + GPS           │
└────────────────────────────────────────┘
                ↓
       Decode + verify HMAC signature
                ↓
       Check timestamp (< 60s old)
                ↓
       Check session_id matches
                ↓
       Check session timer not elapsed
                ↓
       Check GPS within classroom radius
                ↓
       Check not duplicate
                ↓
       ✓ Valid or ✗ Reject with reason
```

---

## TIMING DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│              SESSION TIMELINE                                │
└─────────────────────────────────────────────────────────────┘

10:00 AM │ Lecturer starts 15-minute session
         │ GPS auto-captured → classroom coords stored
         │ QR Code #1 generated (backend only)
         │ Students see session on their dashboard
         │
10:00:30 │ QR Code #2 generated (new token)
         │ QR Code #1 still valid (60s grace)
         │
10:01:00 │ QR Code #3 generated
         │ QR Code #1 expires
         │
   ...   │ QR continues rotating every 30s...
         │
10:15:00 │ Session timer reaches 0:00
         │ Session auto-closes
         │ No more attendance accepted
         │ Report generated automatically

GRACE PERIOD:
QR generated at: 10:00:00
Valid until:      10:01:00 (60 second window)
Student confirms at 10:00:55 → Accepted
Student confirms at 10:01:05 → Expired, try again
```

---

## PROXY ATTACK RESISTANCE

```
┌─────────────────────────────────────────────────────────────┐
│              ATTACK SCENARIOS                                │
└─────────────────────────────────────────────────────────────┘

Attack 1: Student marks attendance from home
  → GPS check fails (not within classroom radius)
  → REJECTED

Attack 2: Student shares QR token with absent friend
  → Friend's GPS is not in classroom
  → REJECTED

Attack 3: Student uses GPS spoofing app
  → Requires technical knowledge + developer tools
  → Much harder than casual sharing
  → Combined with rotating QR window narrows attack

Attack 4: Student hands phone to friend inside classroom
  → No technical system can fully prevent this
  → Disciplinary / policy matter

Attack 5: Old QR screenshot/photo
  → QR rotates every 30 seconds
  → Timestamp validation rejects tokens > 60s old
  → REJECTED
```

---

## EDGE CASES HANDLED

```
┌─────────────────────────────────────────────────────────────┐
│                    EDGE CASES                                │
└─────────────────────────────────────────────────────────────┘

1. STUDENT TRIES TO MARK TWICE
   → Backend checks attendance_records table
   → If exists: Return error "Already marked"

2. STUDENT CONFIRMS AFTER QR ROTATES
   → Token submitted is older than 60s
   → Response: "QR expired, tap Mark Attendance again"
   → Student fetches fresh QR and resubmits

3. SESSION TIMER EXPIRES WHILE STUDENT IS ON SCREEN
   → Backend checks session expires_at before accepting
   → Response: "Session has ended"

4. GPS PERMISSION DENIED
   → Frontend blocks confirm button
   → Shows prompt to enable location in settings

5. GPS INACCURATE (indoors / weak signal)
   → Allowed radius set to 150m to account for drift
   → Lecturer can adjust radius at session creation if needed

6. LECTURER ENDS EARLY WHILE STUDENT SCANNING
   → Backend checks session status = 'active'
   → If ended: Response: "Session closed"

7. NETWORK DISCONNECTION DURING SUBMIT
   → Frontend shows loading state
   → Timeout after 10 seconds
   → Error: "Check your connection and try again"

8. WRONG DEPARTMENT/LEVEL STUDENT
   → Filtered at backend — session not visible in their list
   → SQL: WHERE course.department = student.department
   →      AND course.level = student.level
```

---

## MOBILE RESPONSIVE VIEWS

```
┌─────────────────────────────────────────────────────────────┐
│              MOBILE VIEW (Student)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Attendo     ≡   │  ← Hamburger menu
├─────────────────┤
│ Active Sessions │
├─────────────────┤
│ ┌─────────────┐ │
│ │ CSC 201     │ │
│ │ Dr. Mensah  │ │
│ │ 10:00 AM    │ │
│ │ 12:34 left  │ │
│ │ [Mark Now]  │ │  ← Big tap target
│ └─────────────┘ │
├─────────────────┤
│ ┌─────────────┐ │
│ │ CSC 205     │ │
│ │ Prof. Adu   │ │
│ │ 10:05 AM    │ │
│ │ 08:21 left  │ │
│ │ [Mark Now]  │ │
│ └─────────────┘ │
├─────────────────┤
│ [My Courses]    │
│ [History]       │
└─────────────────┘
```

---

## SUCCESS METRICS

```
┌─────────────────────────────────────────────────────────────┐
│              WHAT SUCCESS LOOKS LIKE                         │
└─────────────────────────────────────────────────────────────┘

STUDENT EXPERIENCE:
✓ Login in < 5 seconds
✓ See relevant sessions immediately with time remaining
✓ Mark attendance in < 5 seconds (no phone raising)
✓ Instant feedback (success/error)
✓ Clear error messages with actionable steps

LECTURER EXPERIENCE:
✓ Start session in < 3 clicks
✓ GPS captured automatically — no manual input
✓ See real-time attendance count and recent scans
✓ Session closes itself — no manual end needed
✓ Download reports with 1 click

SYSTEM SECURITY:
✓ No duplicate attendance
✓ No remote attendance (GPS enforced)
✓ PIN/password hashed
✓ JWT tokens expire
✓ QR codes rotate every 30s and expire after 60s
✓ QR never exposed on public screen
✓ Classroom coordinates stored server-side only
```

---

## SUMMARY

**STUDENT JOURNEY:**
Sign up → Login → See filtered sessions with timer → Tap Mark Attendance → QR shown on own phone → Tap Confirm → GPS + QR validated → Marked present

**LECTURER JOURNEY:**
Sign up → Login → Create course → Start session (set duration, GPS auto-captured) → Watch countdown + live attendance → Session auto-closes → View report

**KEY FEATURES:**
- Auto-enrollment on first attendance mark
- Department/Level filtering
- Session duration timer (auto-close)
- Rotating QR codes (30s, backend only)
- Geolocation presence validation (100-150m radius)
- QR displayed on student's own phone — no phone raising
- Real-time attendance tracking for lecturer
- Mobile-first design
