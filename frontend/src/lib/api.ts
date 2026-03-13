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

// ─── Lecturer ─────────────────────────────────────────────────────────────────

export function getLecturerProfile(): Promise<ApiResponse<LecturerPayload>> {
  return get('/api/lecturers/me');
}

// ─── Student ──────────────────────────────────────────────────────────────────

export function getStudentProfile(): Promise<ApiResponse<StudentPayload>> {
  return get('/api/students/me');
}
