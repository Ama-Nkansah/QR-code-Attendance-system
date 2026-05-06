import {
  lecturerRegister,
  lecturerLogin,
  lecturerLogout,
  studentRegister,
  studentLogin,
  studentLogout,
  getLecturerProfile,
  getCourses,
  getCourse,
  createCourse,
  deleteCourse,
  createSession,
  getSessionQR,
  endSession,
  getSessionRecords,
  getStudentProfile,
  getAttendanceHistory,
  markAttendance,
  type AuthResponse,
  type ApiResponse,
  type CoursesResponse,
  type CourseResponse,
  type SessionResponse,
  type QRResponse,
  type SessionRecordsResponse,
  type LecturerProfileResponse,
  type StudentProfileResponse,
  type AttendanceHistoryResponse,
} from '@/lib/api';

const API_URL = 'http://localhost:8080';

function mockFetch(body: unknown, ok = true, status = 200): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response);
}

afterEach(() => {
  jest.resetAllMocks();
});

// ─── Auth — Lecturer ──────────────────────────────────────────────────────────

describe('lecturerRegister', () => {
  it('sends correct payload and returns the parsed response', async () => {
    const expected: AuthResponse = {
      success: true,
      lecturer: { id: 1, staff_id: 'ST001', full_name: 'Dr. Mensah', email: 'mensah@ug.edu.gh' },
    };
    mockFetch(expected);

    const result = await lecturerRegister('ST001', 'Dr. Mensah', 'mensah@ug.edu.gh', 'secret');

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/auth/lecturer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        staff_id: 'ST001',
        full_name: 'Dr. Mensah',
        email: 'mensah@ug.edu.gh',
        password: 'secret',
      }),
    });
    expect(result).toEqual(expected);
  });

  it('returns failure response when registration fails', async () => {
    const expected: AuthResponse = { success: false, message: 'Staff ID already exists' };
    mockFetch(expected);

    const result = await lecturerRegister('ST001', 'Dr. Mensah', 'mensah@ug.edu.gh', 'secret');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Staff ID already exists');
  });
});

describe('lecturerLogin', () => {
  it('sends correct payload and returns the parsed response', async () => {
    const expected: AuthResponse = {
      success: true,
      lecturer: { id: 1, staff_id: 'ST001', full_name: 'Dr. Mensah', email: 'mensah@ug.edu.gh' },
    };
    mockFetch(expected);

    const result = await lecturerLogin('mensah@ug.edu.gh', 'secret');

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/auth/lecturer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: 'mensah@ug.edu.gh', password: 'secret' }),
    });
    expect(result).toEqual(expected);
  });

  it('returns failure response on bad credentials', async () => {
    const expected: AuthResponse = { success: false, message: 'Invalid credentials' };
    mockFetch(expected);

    const result = await lecturerLogin('wrong@ug.edu.gh', 'wrong');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });
});

describe('lecturerLogout', () => {
  it('posts to logout endpoint and returns success', async () => {
    const expected: ApiResponse = { success: true };
    mockFetch(expected);

    const result = await lecturerLogout();

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/auth/lecturer/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });
    expect(result).toEqual(expected);
  });
});

// ─── Auth — Student ───────────────────────────────────────────────────────────

describe('studentRegister', () => {
  it('sends correct payload and returns the parsed response', async () => {
    const expected: AuthResponse = {
      success: true,
      student: {
        id: 10,
        index_number: 'UG0001',
        full_name: 'Ama Serwaa',
        email: 'ama@ug.edu.gh',
        department: 'Computer Science',
        level: '300',
      },
    };
    mockFetch(expected);

    const result = await studentRegister(
      'UG0001',
      'Ama Serwaa',
      'ama@ug.edu.gh',
      'Computer Science',
      '300',
      '1234',
    );

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/auth/student/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        index_number: 'UG0001',
        full_name: 'Ama Serwaa',
        email: 'ama@ug.edu.gh',
        department: 'Computer Science',
        level: '300',
        pin: '1234',
      }),
    });
    expect(result).toEqual(expected);
  });

  it('returns failure when index number is already taken', async () => {
    const expected: AuthResponse = { success: false, message: 'Index number already registered' };
    mockFetch(expected);

    const result = await studentRegister('UG0001', 'A', 'a@ug.edu.gh', 'CS', '300', '1234');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Index number already registered');
  });
});

describe('studentLogin', () => {
  it('sends correct payload and returns the parsed response', async () => {
    const expected: AuthResponse = {
      success: true,
      student: {
        id: 10,
        index_number: 'UG0001',
        full_name: 'Ama Serwaa',
        email: 'ama@ug.edu.gh',
        department: 'Computer Science',
        level: '300',
      },
    };
    mockFetch(expected);

    const result = await studentLogin('UG0001', '1234');

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ index_number: 'UG0001', pin: '1234' }),
    });
    expect(result).toEqual(expected);
  });

  it('returns failure response on wrong PIN', async () => {
    const expected: AuthResponse = { success: false, message: 'Invalid credentials' };
    mockFetch(expected);

    const result = await studentLogin('UG0001', '0000');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });
});

describe('studentLogout', () => {
  it('posts to logout endpoint and returns success', async () => {
    const expected: ApiResponse = { success: true };
    mockFetch(expected);

    const result = await studentLogout();

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/auth/student/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });
    expect(result).toEqual(expected);
  });
});

// ─── Lecturer profile & courses ───────────────────────────────────────────────

describe('getLecturerProfile', () => {
  it('fetches and returns lecturer profile', async () => {
    const expected: LecturerProfileResponse = {
      success: true,
      lecturer: { id: 1, staff_id: 'ST001', full_name: 'Dr. Mensah', email: 'mensah@ug.edu.gh' },
    };
    mockFetch(expected);

    const result = await getLecturerProfile();

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/lecturers/me`, {
      method: 'GET',
      credentials: 'include',
    });
    expect(result).toEqual(expected);
  });

  it('returns failure when not authenticated', async () => {
    const expected: LecturerProfileResponse = { success: false, message: 'Unauthorized' };
    mockFetch(expected);

    const result = await getLecturerProfile();
    expect(result.success).toBe(false);
  });
});

describe('getCourses', () => {
  it('fetches and returns all courses', async () => {
    const expected: CoursesResponse = {
      success: true,
      courses: [
        {
          id: 1,
          course_code: 'CS301',
          course_name: 'Algorithms',
          department: 'Computer Science',
          level: '300',
          academic_year: '2025/2026',
          semester: 'First',
          planned_sessions: 40,
          created_at: '2025-09-01T00:00:00Z',
        },
      ],
    };
    mockFetch(expected);

    const result = await getCourses();

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/lecturers/courses`, {
      method: 'GET',
      credentials: 'include',
    });
    expect(result).toEqual(expected);
  });

  it('returns empty courses list when none exist', async () => {
    const expected: CoursesResponse = { success: true, courses: [] };
    mockFetch(expected);

    const result = await getCourses();
    expect(result.courses).toHaveLength(0);
  });
});

describe('getCourse', () => {
  it('fetches and returns a single course by id', async () => {
    const expected: CourseResponse = {
      success: true,
      course: {
        id: 1,
        course_code: 'CS301',
        course_name: 'Algorithms',
        department: 'Computer Science',
        level: '300',
        academic_year: '2025/2026',
        semester: 'First',
        planned_sessions: 40,
        created_at: '2025-09-01T00:00:00Z',
      },
    };
    mockFetch(expected);

    const result = await getCourse(1);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/lecturers/courses/1`, {
      method: 'GET',
      credentials: 'include',
    });
    expect(result).toEqual(expected);
  });

  it('returns failure when course does not exist', async () => {
    const expected: CourseResponse = { success: false, message: 'Course not found' };
    mockFetch(expected);

    const result = await getCourse(999);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Course not found');
  });
});

describe('createCourse', () => {
  it('posts correct payload and returns created course', async () => {
    const body = {
      course_code: 'CS301',
      course_name: 'Algorithms',
      department: 'Computer Science',
      level: '300',
      academic_year: '2025/2026',
      semester: 'First',
      planned_sessions: 40,
    };
    const expected: CourseResponse = {
      success: true,
      course: { id: 1, created_at: '2025-09-01T00:00:00Z', ...body },
    };
    mockFetch(expected);

    const result = await createCourse(body);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/lecturers/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    expect(result).toEqual(expected);
  });
});

describe('deleteCourse', () => {
  it('sends DELETE request and returns success', async () => {
    const expected: ApiResponse = { success: true };
    mockFetch(expected);

    const result = await deleteCourse(1);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/lecturers/courses/1`, {
      method: 'DELETE',
      credentials: 'include',
    });
    expect(result).toEqual(expected);
  });

  it('returns failure when course not found', async () => {
    const expected: ApiResponse = { success: false, message: 'Course not found' };
    mockFetch(expected);

    const result = await deleteCourse(999);
    expect(result.success).toBe(false);
  });
});

// ─── Sessions ─────────────────────────────────────────────────────────────────

describe('createSession', () => {
  it('posts correct payload and returns created session', async () => {
    const body = {
      course_id: 1,
      session_name: 'Lecture 1',
      session_type: 'lecture',
      duration_minutes: 60,
      classroom_lat: 5.6502,
      classroom_lng: -0.1962,
      allowed_radius_meters: 50,
    };
    const expected: SessionResponse = {
      success: true,
      session: {
        id: 5,
        session_name: 'Lecture 1',
        session_type: 'lecture',
        duration_minutes: 60,
        expires_at: '2025-09-01T10:00:00Z',
        classroom_lat: 5.6502,
        classroom_lng: -0.1962,
        allowed_radius_meters: 50,
        status: 'active',
        started_at: '2025-09-01T09:00:00Z',
        ended_at: null,
        course_id: 1,
      },
    };
    mockFetch(expected);

    const result = await createSession(body);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/attendance/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    expect(result).toEqual(expected);
  });
});

describe('getSessionQR', () => {
  it('fetches and returns QR data for a session', async () => {
    const expected: QRResponse = {
      success: true,
      qr: { qrData: 'session-token-xyz', expiresAt: 1700000000, rotationInterval: 30 },
    };
    mockFetch(expected);

    const result = await getSessionQR(5);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/attendance/sessions/5/qr`, {
      method: 'GET',
      credentials: 'include',
    });
    expect(result).toEqual(expected);
  });
});

describe('endSession', () => {
  it('posts to end endpoint and returns success', async () => {
    const expected: ApiResponse = { success: true };
    mockFetch(expected);

    const result = await endSession(5);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/attendance/sessions/5/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });
    expect(result).toEqual(expected);
  });
});

describe('getSessionRecords', () => {
  it('fetches and returns attendance records for a session', async () => {
    const expected: SessionRecordsResponse = {
      success: true,
      total: 1,
      records: [
        {
          id: 100,
          session_id: 5,
          student_id: 10,
          index_number: 'UG0001',
          full_name: 'Ama Serwaa',
          student_lat: 5.6503,
          student_lng: -0.1961,
          marked_at: '2025-09-01T09:10:00Z',
        },
      ],
    };
    mockFetch(expected);

    const result = await getSessionRecords(5);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/attendance/sessions/5/records`, {
      method: 'GET',
      credentials: 'include',
    });
    expect(result).toEqual(expected);
  });
});

// ─── Student profile & attendance ─────────────────────────────────────────────

describe('getStudentProfile', () => {
  it('fetches and returns student profile', async () => {
    const expected: StudentProfileResponse = {
      success: true,
      student: {
        id: 10,
        index_number: 'UG0001',
        full_name: 'Ama Serwaa',
        email: 'ama@ug.edu.gh',
        department: 'Computer Science',
        level: '300',
      },
    };
    mockFetch(expected);

    const result = await getStudentProfile();

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/students/me`, {
      method: 'GET',
      credentials: 'include',
    });
    expect(result).toEqual(expected);
  });

  it('returns failure when not authenticated', async () => {
    const expected: StudentProfileResponse = { success: false, message: 'Unauthorized' };
    mockFetch(expected);

    const result = await getStudentProfile();
    expect(result.success).toBe(false);
  });
});

describe('getAttendanceHistory', () => {
  it('fetches and returns student attendance history', async () => {
    const expected: AttendanceHistoryResponse = {
      success: true,
      total: 1,
      records: [
        {
          id: 100,
          session_id: 5,
          student_id: 10,
          student_lat: 5.6503,
          student_lng: -0.1961,
          marked_at: '2025-09-01T09:10:00Z',
        },
      ],
    };
    mockFetch(expected);

    const result = await getAttendanceHistory();

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/students/attendance`, {
      method: 'GET',
      credentials: 'include',
    });
    expect(result).toEqual(expected);
  });

  it('returns empty records when no attendance yet', async () => {
    const expected: AttendanceHistoryResponse = { success: true, total: 0, records: [] };
    mockFetch(expected);

    const result = await getAttendanceHistory();
    expect(result.records).toHaveLength(0);
  });
});

describe('markAttendance', () => {
  it('posts correct payload and returns success', async () => {
    const expected: ApiResponse = { success: true, message: 'Attendance marked' };
    mockFetch(expected);

    const result = await markAttendance('session-token-xyz', 5.6503, -0.1961);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/attendance/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        qr_data: 'session-token-xyz',
        student_lat: 5.6503,
        student_lng: -0.1961,
      }),
    });
    expect(result).toEqual(expected);
  });

  it('returns failure when QR token is expired', async () => {
    const expected: ApiResponse = { success: false, message: 'QR code has expired' };
    mockFetch(expected);

    const result = await markAttendance('expired-token', 5.6503, -0.1961);
    expect(result.success).toBe(false);
    expect(result.message).toBe('QR code has expired');
  });

  it('returns failure when student is outside allowed radius', async () => {
    const expected: ApiResponse = { success: false, message: 'You are not within the classroom' };
    mockFetch(expected);

    const result = await markAttendance('session-token-xyz', 6.0, 0.0);
    expect(result.success).toBe(false);
    expect(result.message).toBe('You are not within the classroom');
  });
});
