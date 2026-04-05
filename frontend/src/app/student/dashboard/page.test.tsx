import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentDashboard from './page';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/api', () => ({
  getStudentProfile: jest.fn(),
  getAttendanceHistory: jest.fn(),
  studentLogout: jest.fn(),
}));

import { getStudentProfile, getAttendanceHistory, studentLogout } from '@/lib/api';
const mockGetStudentProfile = getStudentProfile as jest.Mock;
const mockGetAttendanceHistory = getAttendanceHistory as jest.Mock;
const mockStudentLogout = studentLogout as jest.Mock;

// ── Fixtures ───────────────────────────────────────────────────────────────────

const STUDENT = {
  id: 10,
  index_number: 'UG0001',
  full_name: 'Ama Serwaa',
  email: 'ama@ug.edu.gh',
  department: 'Computer Science',
  level: '300',
};

const RECORDS = [
  {
    id: 1,
    session_id: 5,
    student_id: 10,
    student_lat: 5.65,
    student_lng: -0.19,
    marked_at: '2025-09-01T09:10:00Z',
  },
  {
    id: 2,
    session_id: 6,
    student_id: 10,
    student_lat: 5.65,
    student_lng: -0.19,
    marked_at: '2025-09-08T10:00:00Z',
  },
];

// ── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockStudentLogout.mockResolvedValue({ success: true });
});

describe('StudentDashboard', () => {
  // ── Loading state ────────────────────────────────────────────────────────────

  it('shows a loading indicator before data arrives', () => {
    mockGetStudentProfile.mockReturnValue(new Promise(() => {}));
    mockGetAttendanceHistory.mockReturnValue(new Promise(() => {}));

    render(<StudentDashboard />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  // ── Unauthenticated redirect ─────────────────────────────────────────────────

  it('redirects to /student/login when the profile fetch fails', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: false });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: [] });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/student/login');
    });
  });

  // ── Profile display ──────────────────────────────────────────────────────────

  it('shows the student name and index number after loading', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: [] });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Ama Serwaa')).toBeInTheDocument();
      expect(screen.getByText('UG0001')).toBeInTheDocument();
    });
  });

  it('shows a welcome message using the first name', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: [] });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, Ama')).toBeInTheDocument();
    });
  });

  it('shows department, level and email in the profile section', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: [] });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
      expect(screen.getByText(/Level 300/)).toBeInTheDocument();
      expect(screen.getByText(/ama@ug\.edu\.gh/)).toBeInTheDocument();
    });
  });

  // ── Attendance records ───────────────────────────────────────────────────────

  it('shows empty state message when there are no records', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: [] });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/No attendance records yet/)).toBeInTheDocument();
    });
  });

  it('shows "0 records" when there are no records', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: [] });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('0 records')).toBeInTheDocument();
    });
  });

  it('renders a table row for each attendance record', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: RECORDS });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('#5')).toBeInTheDocument();
      expect(screen.getByText('#6')).toBeInTheDocument();
    });
  });

  it('shows "2 records" when there are two records', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: RECORDS });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('2 records')).toBeInTheDocument();
    });
  });

  it('shows "1 record" (singular) when there is one record', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: [RECORDS[0]] });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1 record')).toBeInTheDocument();
    });
  });

  it('marks all records as Present', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: RECORDS });

    render(<StudentDashboard />);

    await waitFor(() => {
      const badges = screen.getAllByText('Present');
      expect(badges).toHaveLength(2);
    });
  });

  // ── Scan QR link ─────────────────────────────────────────────────────────────

  it('renders a Scan QR Code link pointing to /student/scan', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: [] });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Scan QR Code' })).toHaveAttribute('href', '/student/scan');
    });
  });

  // ── Logout ───────────────────────────────────────────────────────────────────

  it('calls studentLogout and redirects to /student/login on logout', async () => {
    mockGetStudentProfile.mockResolvedValue({ success: true, student: STUDENT });
    mockGetAttendanceHistory.mockResolvedValue({ success: true, records: [] });

    render(<StudentDashboard />);

    await waitFor(() => screen.getByRole('button', { name: 'Logout' }));
    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(mockStudentLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/student/login');
    });
  });
});
