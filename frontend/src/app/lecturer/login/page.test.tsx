import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LecturerLoginPage from './page';

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Replace useRouter with a stunt double so we can check if router.push was called
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Replace lecturerLogin so no real HTTP call is made
jest.mock('@/lib/api', () => ({
  lecturerLogin: jest.fn(),
}));

import { lecturerLogin } from '@/lib/api';
const mockLecturerLogin = lecturerLogin as jest.Mock;

// ── Helpers ────────────────────────────────────────────────────────────────────

function fillAndSubmit(email = 'mensah@ug.edu.gh', password = 'secret') {
  return async () => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email Address'), email);
    await user.type(screen.getByLabelText('Password'), password);
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('LecturerLoginPage', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────

  it('renders the page heading', () => {
    render(<LecturerLoginPage />);
    expect(screen.getByRole('heading', { name: 'Lecturer Login' })).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    render(<LecturerLoginPage />);
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders the Sign In button', () => {
    render(<LecturerLoginPage />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders the Sign up and Forgot password links', () => {
    render(<LecturerLoginPage />);
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toBeInTheDocument();
  });

  // ── Field interactions ───────────────────────────────────────────────────────

  it('updates email and password as the user types', async () => {
    const user = userEvent.setup();
    render(<LecturerLoginPage />);

    await user.type(screen.getByLabelText('Email Address'), 'mensah@ug.edu.gh');
    await user.type(screen.getByLabelText('Password'), 'secret');

    expect(screen.getByLabelText('Email Address')).toHaveValue('mensah@ug.edu.gh');
    expect(screen.getByLabelText('Password')).toHaveValue('secret');
  });

  it('password field is hidden by default', () => {
    render(<LecturerLoginPage />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('reveals password when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<LecturerLoginPage />);

    await user.click(screen.getByLabelText('Show password'));

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('hides password again when the toggle is clicked a second time', async () => {
    const user = userEvent.setup();
    render(<LecturerLoginPage />);

    await user.click(screen.getByLabelText('Show password'));
    await user.click(screen.getByLabelText('Hide password'));

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  // ── Loading state ────────────────────────────────────────────────────────────

  it('shows "Signing In..." and disables the button while loading', async () => {
    // Never resolves so we stay in the loading state
    mockLecturerLogin.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<LecturerLoginPage />);

    await user.type(screen.getByLabelText('Email Address'), 'mensah@ug.edu.gh');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByRole('button', { name: 'Signing In...' })).toBeDisabled();
  });

  // ── Success ──────────────────────────────────────────────────────────────────

  it('saves lecturer to localStorage and redirects on success', async () => {
    const lecturer = { id: 1, staff_id: 'ST001', full_name: 'Dr. Mensah', email: 'mensah@ug.edu.gh' };
    mockLecturerLogin.mockResolvedValue({ success: true, lecturer });

    render(<LecturerLoginPage />);
    await fillAndSubmit()();

    await waitFor(() => {
      expect(localStorage.getItem('lecturer')).toBe(JSON.stringify(lecturer));
      expect(mockPush).toHaveBeenCalledWith('/lecturer/dashboard');
    });
  });

  it('calls lecturerLogin with the correct email and password', async () => {
    mockLecturerLogin.mockResolvedValue({ success: true, lecturer: {} });

    render(<LecturerLoginPage />);
    await fillAndSubmit('mensah@ug.edu.gh', 'mypassword')();

    expect(mockLecturerLogin).toHaveBeenCalledWith('mensah@ug.edu.gh', 'mypassword');
  });

  // ── Failure ──────────────────────────────────────────────────────────────────

  it('shows the API error message on failed login', async () => {
    mockLecturerLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });

    render(<LecturerLoginPage />);
    await fillAndSubmit()();

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows a fallback error when the API returns no message', async () => {
    mockLecturerLogin.mockResolvedValue({ success: false });

    render(<LecturerLoginPage />);
    await fillAndSubmit()();

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('does not redirect on failed login', async () => {
    mockLecturerLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });

    render(<LecturerLoginPage />);
    await fillAndSubmit()();

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
