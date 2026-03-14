const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LecturerPayload {
  id: number;
  staff_id: string;
  full_name: string;
  email: string;
}

export interface StudentPayload {
  id: number;
  index_number: string;
  full_name: string;
  email: string;
  department: string;
  level: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  lecturer?: LecturerPayload;
  student?: StudentPayload;
}


async function post<T>(endpoint: string, body: object): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  return res.json();
}

async function get<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    credentials: 'include',
  });

  return res.json();
}

export function lecturerRegister(
  staffId: string,
  fullName: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return post('/api/auth/lecturer/register', {
    staff_id: staffId,
    full_name: fullName,
    email,
    password,
  });
}

export function lecturerLogin(email: string, password: string): Promise<AuthResponse> {
  return post('/api/auth/lecturer/login', { email, password });
}

export function lecturerLogout(): Promise<ApiResponse> {
  return post('/api/auth/lecturer/logout', {});
}

export function studentRegister(
  indexNumber: string,
  fullName: string,
  email: string,
  department: string,
  level: string,
  pin: string,
): Promise<AuthResponse> {
  return post('/api/auth/student/register', {
    index_number: indexNumber,
    full_name: fullName,
    email,
    department,
    level,
    pin,
  });
}

export function studentLogin(indexNumber: string, pin: string): Promise<AuthResponse> {
  return post('/api/auth/student/login', { index_number: indexNumber, pin });
}

export function studentLogout(): Promise<ApiResponse> {
  return post('/api/auth/student/logout', {});
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export interface CoursePayload {
  id: number;
  course_code: string;
  course_name: string;
  department: string;
  level: string;
  academic_year: string;
  semester: string;
  created_at: string;
}

export interface CoursesResponse {
  success: boolean;
  message?: string;
  courses?: CoursePayload[];
}

export interface CourseResponse {
  success: boolean;
  message?: string;
  course?: CoursePayload;
}

export interface CreateCourseBody {
  course_code: string;
  course_name: string;
  department: string;
  level: string;
  academic_year: string;
  semester: string;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export interface SessionPayload {
  id: number;
  session_name: string;
  session_type: string;
  duration_minutes: number;
  expires_at: string;
  classroom_lat: number;
  classroom_lng: number;
  allowed_radius_meters: number;
  status: string;
  started_at: string;
  ended_at: string | null;
  course_id: number;
}

export interface SessionResponse {
  success: boolean;
  message?: string;
  session?: SessionPayload;
}

export interface QRResponse {
  success: boolean;
  message?: string;
  qr?: string;
}

export interface AttendanceRecordPayload {
  id: number;
  session_id: number;
  student_id?: number;
  index_number?: string;
  full_name?: string;
  student_lat: number;
  student_lng: number;
  marked_at: string;
}

export interface SessionRecordsResponse {
  success: boolean;
  message?: string;
  session?: SessionPayload;
  records?: AttendanceRecordPayload[];
  total?: number;
}

export interface AttendanceHistoryResponse {
  success: boolean;
  message?: string;
  records?: AttendanceRecordPayload[];
  total?: number;
}

// ─── Lecturer ─────────────────────────────────────────────────────────────────

export function getLecturerProfile(): Promise<ApiResponse<LecturerPayload>> {
  return get('/api/lecturers/me');
}

export function getCourses(): Promise<CoursesResponse> {
  return get('/api/lecturers/courses');
}

export function getCourse(courseId: number): Promise<CourseResponse> {
  return get(`/api/lecturers/courses/${courseId}`);
}

export function createCourse(body: CreateCourseBody): Promise<CourseResponse> {
  return post('/api/lecturers/courses', body);
}

export async function deleteCourse(courseId: number): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/api/lecturers/courses/${courseId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.json();
}

export function createSession(body: {
  course_id: number;
  session_name: string;
  session_type?: string;
  duration_minutes: number;
  classroom_lat: number;
  classroom_lng: number;
  allowed_radius_meters?: number;
}): Promise<SessionResponse> {
  return post('/api/attendance/sessions', body);
}

export function getSessionQR(sessionId: number): Promise<QRResponse> {
  return get(`/api/attendance/sessions/${sessionId}/qr`);
}

export function endSession(sessionId: number): Promise<ApiResponse> {
  return post(`/api/attendance/sessions/${sessionId}/end`, {});
}

export function getSessionRecords(sessionId: number): Promise<SessionRecordsResponse> {
  return get(`/api/attendance/sessions/${sessionId}/records`);
}

// ─── Student ──────────────────────────────────────────────────────────────────

export function getStudentProfile(): Promise<ApiResponse<StudentPayload>> {
  return get('/api/students/me');
}

export function getAttendanceHistory(): Promise<AttendanceHistoryResponse> {
  return get('/api/students/attendance');
}

export function markAttendance(
  qrData: string,
  studentLat: number,
  studentLng: number,
): Promise<ApiResponse> {
  return post('/api/attendance/mark', {
    qr_data: qrData,
    student_lat: studentLat,
    student_lng: studentLng,
  });
}
