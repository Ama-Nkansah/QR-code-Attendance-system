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
  token?: string;
  lecturer?: LecturerPayload;
  student?: StudentPayload;
}



async function post<T>(endpoint: string, body: object, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return res.json();
}

async function get<T>(endpoint: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
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

// ─── Lecturer ─────────────────────────────────────────────────────────────────

export function getLecturerProfile(token: string): Promise<ApiResponse<LecturerPayload>> {
  return get('/api/lecturers/me', token);
}

// ─── Student ──────────────────────────────────────────────────────────────────

export function getStudentProfile(token: string): Promise<ApiResponse<StudentPayload>> {
  return get('/api/students/me', token);
}
