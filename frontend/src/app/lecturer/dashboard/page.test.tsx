import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LecturerDashboard from './page';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/api', () => ({
  getLecturerProfile: jest.fn(),
  getCourses: jest.fn(),
  createCourse: jest.fn(),
  deleteCourse: jest.fn(),
  createSession: jest.fn(),
  getSessionQR: jest.fn(),
  endSession: jest.fn(),
  getCourseReport: jest.fn(),
  lecturerLogout: jest.fn(),
}));

jest.mock('react-qr-code', () => ({
  __esModule: true,
  default: ({ value }: { value: string }) => <div data-testid="qr-code">{value}</div>,
}));

import {
  getLecturerProfile,
  getCourses,
  createCourse,
  deleteCourse,
  createSession,
  getSessionQR,
  endSession,
  lecturerLogout,
} from '@/lib/api';

const mockGetLecturerProfile = getLecturerProfile as jest.Mock;
const mockGetCourses = getCourses as jest.Mock;
const mockCreateCourse = createCourse as jest.Mock;
const mockDeleteCourse = deleteCourse as jest.Mock;
const mockCreateSession = createSession as jest.Mock;
const mockGetSessionQR = getSessionQR as jest.Mock;
const mockEndSession = endSession as jest.Mock;
const mockLecturerLogout = lecturerLogout as jest.Mock;

// ── Fixtures ───────────────────────────────────────────────────────────────────

const LECTURER = {
  id: 1,
  staff_id: 'ST001',
  full_name: 'Dr. Mensah',
  email: 'mensah@ug.edu.gh',
};

const COURSE = {
  id: 1,
  course_code: 'CS301',
  course_name: 'Algorithms',
  department: 'Computer Science',
  level: '300',
  academic_year: '2025/2026',
  semester: 'First',
  created_at: '2025-09-01T00:00:00Z',
};

const SESSION = {
  id: 5,
  session_name: 'Week 1 - Intro',
  session_type: 'Lecture',
  duration_minutes: 60,
  expires_at: '2025-09-01T10:00:00Z',
  classroom_lat: 5.65,
  classroom_lng: -0.19,
  allowed_radius_meters: 100,
  status: 'active',
  started_at: '2025-09-01T09:00:00Z',
  ended_at: null,
  course_id: 1,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function mockGeolocation(lat = 5.65, lng = -0.19) {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: {
      getCurrentPosition: jest.fn((success) =>
        success({ coords: { latitude: lat, longitude: lng } }),
      ),
    },
    configurable: true,
  });
}

function mockGeolocationDenied() {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: {
      getCurrentPosition: jest.fn((_, error) => error()),
    },
    configurable: true,
  });
}

function setupDashboard() {
  mockGetLecturerProfile.mockResolvedValue({ success: true, lecturer: LECTURER });
  mockGetCourses.mockResolvedValue({ success: true, courses: [COURSE] });
  mockLecturerLogout.mockResolvedValue({ success: true });
  mockGetSessionQR.mockResolvedValue({
    success: true,
    qr: { qrData: 'qr-token', expiresAt: 0, rotationInterval: 30 },
  });
}

// Opens the start-session modal and returns a user instance
async function openStartSessionModal() {
  const user = userEvent.setup();
  // Only one "Start Session" button exists before the modal opens
  await waitFor(() => screen.getByRole('button', { name: 'Start Session' }));
  await user.click(screen.getByRole('button', { name: 'Start Session' }));
  return user;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LecturerDashboard', () => {
  // ── Loading state ────────────────────────────────────────────────────────────

  it('shows a loading indicator before data arrives', () => {
    mockGetLecturerProfile.mockReturnValue(new Promise(() => {}));
    mockGetCourses.mockReturnValue(new Promise(() => {}));

    render(<LecturerDashboard />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  // ── Unauthenticated redirect ─────────────────────────────────────────────────

  it('redirects to /lecturer/login when profile fetch fails', async () => {
    mockGetLecturerProfile.mockResolvedValue({ success: false });
    mockGetCourses.mockResolvedValue({ success: true, courses: [] });

    render(<LecturerDashboard />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/lecturer/login');
    });
  });

  // ── Profile display ──────────────────────────────────────────────────────────

  it('shows the lecturer name and staff ID after loading', async () => {
    setupDashboard();
    render(<LecturerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Mensah')).toBeInTheDocument();
      expect(screen.getByText('Staff ID: ST001')).toBeInTheDocument();
    });
  });

  it('shows a welcome message using the first name', async () => {
    setupDashboard();
    render(<LecturerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, Dr.')).toBeInTheDocument();
    });
  });

  // ── Courses list ─────────────────────────────────────────────────────────────

  it('shows empty state when there are no courses', async () => {
    mockGetLecturerProfile.mockResolvedValue({ success: true, lecturer: LECTURER });
    mockGetCourses.mockResolvedValue({ success: true, courses: [] });

    render(<LecturerDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/No courses yet/)).toBeInTheDocument();
    });
  });

  it('renders a course card for each course', async () => {
    setupDashboard();
    render(<LecturerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('CS301')).toBeInTheDocument();
      expect(screen.getByText('Algorithms')).toBeInTheDocument();
    });
  });

  // ── Logout ───────────────────────────────────────────────────────────────────

  it('calls lecturerLogout and redirects to /lecturer/login on logout', async () => {
    const user = userEvent.setup();
    setupDashboard();
    render(<LecturerDashboard />);

    await waitFor(() => screen.getByRole('button', { name: 'Logout' }));
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(mockLecturerLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/lecturer/login');
    });
  });

  // ── Create Course Modal ──────────────────────────────────────────────────────

  it('opens the create course modal when "+ New Course" is clicked', async () => {
    const user = userEvent.setup();
    setupDashboard();
    render(<LecturerDashboard />);

    await waitFor(() => screen.getByRole('button', { name: '+ New Course' }));
    await user.click(screen.getByRole('button', { name: '+ New Course' }));

    expect(screen.getByRole('heading', { name: 'New Course' })).toBeInTheDocument();
  });

  it('closes the create course modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    setupDashboard();
    render(<LecturerDashboard />);

    await waitFor(() => screen.getByRole('button', { name: '+ New Course' }));
    await user.click(screen.getByRole('button', { name: '+ New Course' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('heading', { name: 'New Course' })).not.toBeInTheDocument();
  });

  it('creates a course and adds it to the list', async () => {
    const user = userEvent.setup();
    setupDashboard();
    const newCourse = { ...COURSE, id: 2, course_code: 'CS401', course_name: 'AI' };
    // First call returns empty; subsequent calls (if effect re-runs) return the new course
    mockGetCourses
      .mockResolvedValueOnce({ success: true, courses: [] })
      .mockResolvedValue({ success: true, courses: [newCourse] });
    mockCreateCourse.mockResolvedValue({ success: true, course: newCourse });

    render(<LecturerDashboard />);

    await waitFor(() => screen.getByRole('button', { name: '+ New Course' }));
    await user.click(screen.getByRole('button', { name: '+ New Course' }));

    await user.type(screen.getByPlaceholderText('e.g. CS301'), 'CS401');
    await user.type(screen.getByPlaceholderText('e.g. Data Structures'), 'AI');
    await user.type(screen.getByPlaceholderText('e.g. Computer Science'), 'Computer Science');
    await user.type(screen.getByPlaceholderText('e.g. 300'), '400');
    await user.type(screen.getByPlaceholderText('e.g. 2025/2026'), '2025/2026');
    await user.type(screen.getByPlaceholderText('1 or 2'), '1');
    await user.type(screen.getByPlaceholderText('e.g. 40'), '40');
    await user.click(screen.getByRole('button', { name: 'Create Course' }));

    await waitFor(() => {
      expect(screen.getByText('CS401')).toBeInTheDocument();
      expect(screen.getByText('AI')).toBeInTheDocument();
    });
  });

  it('shows error when course creation fails', async () => {
    const user = userEvent.setup();
    setupDashboard();
    mockCreateCourse.mockResolvedValue({ success: false, message: 'Course code already exists' });

    render(<LecturerDashboard />);

    await waitFor(() => screen.getByRole('button', { name: '+ New Course' }));
    await user.click(screen.getByRole('button', { name: '+ New Course' }));

    await user.type(screen.getByPlaceholderText('e.g. CS301'), 'CS301');
    await user.type(screen.getByPlaceholderText('e.g. Data Structures'), 'Algorithms');
    await user.type(screen.getByPlaceholderText('e.g. Computer Science'), 'CS');
    await user.type(screen.getByPlaceholderText('e.g. 300'), '300');
    await user.type(screen.getByPlaceholderText('e.g. 2025/2026'), '2025/2026');
    await user.type(screen.getByPlaceholderText('1 or 2'), '1');
    await user.type(screen.getByPlaceholderText('e.g. 40'), '40');
    await user.click(screen.getByRole('button', { name: 'Create Course' }));

    await waitFor(() => {
      expect(screen.getByText('Course code already exists')).toBeInTheDocument();
    });
  });

  // ── Delete Course ────────────────────────────────────────────────────────────

  it('removes a course from the list when Delete is clicked', async () => {
    const user = userEvent.setup();
    setupDashboard();
    mockDeleteCourse.mockResolvedValue({ success: true });

    render(<LecturerDashboard />);

    await waitFor(() => screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('CS301')).not.toBeInTheDocument();
    });
  });

  // ── Start Session Modal ──────────────────────────────────────────────────────

  it('opens the start session modal when "Start Session" is clicked', async () => {
    setupDashboard();
    render(<LecturerDashboard />);

    const user = await openStartSessionModal();

    // After the modal opens there are two "Start Session" buttons —
    // use the heading to confirm the modal is open
    expect(screen.getByRole('heading', { name: 'Start Session' })).toBeInTheDocument();
    expect(screen.getByText(/CS301 — Algorithms/)).toBeInTheDocument();

    // suppress unused var warning
    void user;
  });

  it('shows location denied error when geolocation is blocked', async () => {
    setupDashboard();
    mockGeolocationDenied();
    render(<LecturerDashboard />);

    const user = await openStartSessionModal();

    await user.type(screen.getByPlaceholderText('e.g. Week 3 — Linked Lists'), 'Week 1');

    // Pick the submit button (second "Start Session" button — index 1)
    const submitBtn = screen.getAllByRole('button', { name: 'Start Session' })[1];
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Location access denied/)).toBeInTheDocument();
    });
  });

  it('opens the active session modal after a session starts successfully', async () => {
    setupDashboard();
    mockGeolocation();
    mockCreateSession.mockResolvedValue({ success: true, session: SESSION });
    render(<LecturerDashboard />);

    const user = await openStartSessionModal();

    await user.type(screen.getByPlaceholderText('e.g. Week 3 — Linked Lists'), 'Week 1 - Intro');

    const submitBtn = screen.getAllByRole('button', { name: 'Start Session' })[1];
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Live Session' })).toBeInTheDocument();
      expect(screen.getByText('Week 1 - Intro')).toBeInTheDocument();
    });
  });

  // ── Active Session Modal ─────────────────────────────────────────────────────

  it('shows the QR code in the active session modal', async () => {
    setupDashboard();
    mockGeolocation();
    mockCreateSession.mockResolvedValue({ success: true, session: SESSION });
    render(<LecturerDashboard />);

    const user = await openStartSessionModal();

    await user.type(screen.getByPlaceholderText('e.g. Week 3 — Linked Lists'), 'Week 1 - Intro');
    const submitBtn = screen.getAllByRole('button', { name: 'Start Session' })[1];
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    });
  });

  it('ends the session and closes the modal when "End Session" is clicked', async () => {
    setupDashboard();
    mockGeolocation();
    mockCreateSession.mockResolvedValue({ success: true, session: SESSION });
    mockEndSession.mockResolvedValue({ success: true });
    render(<LecturerDashboard />);

    const user = await openStartSessionModal();

    await user.type(screen.getByPlaceholderText('e.g. Week 3 — Linked Lists'), 'Week 1 - Intro');
    const submitBtn = screen.getAllByRole('button', { name: 'Start Session' })[1];
    await user.click(submitBtn);

    await waitFor(() => screen.getByRole('button', { name: 'End Session' }));
    await user.click(screen.getByRole('button', { name: 'End Session' }));

    await waitFor(() => {
      expect(mockEndSession).toHaveBeenCalledWith(SESSION.id);
      expect(screen.queryByRole('heading', { name: 'Live Session' })).not.toBeInTheDocument();
    });
  });
});
