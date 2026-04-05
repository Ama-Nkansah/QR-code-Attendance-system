import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentLoginPage from './page';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/api', () => ({
  studentLogin: jest.fn(),
}));

import { studentLogin } from '@/lib/api';
const mockStudentLogin = studentLogin as jest.Mock;

// ── Helpers ────────────────────────────────────────────────────────────────────

async function fillAndSubmit(indexNumber = 'UG0001', pin = '1234') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Index Number'), indexNumber);
  await user.type(screen.getByLabelText('4-Digit PIN'), pin);
  await user.click(screen.getByRole('button', { name: 'Sign In' }));
  return user;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('StudentLoginPage', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────

  it('renders the page heading', () => {
    render(<StudentLoginPage />);
    expect(screen.getByRole('heading', { name: 'Student Login' })).toBeInTheDocument();
  });

  it('renders index number and PIN fields', () => {
    render(<StudentLoginPage />);
    expect(screen.getByLabelText('Index Number')).toBeInTheDocument();
    expect(screen.getByLabelText('4-Digit PIN')).toBeInTheDocument();
  });

  it('renders the Sign In button and Sign up link', () => {
    render(<StudentLoginPage />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
  });

  // ── Field interactions ───────────────────────────────────────────────────────

  it('updates fields as the user types', async () => {
    const user = userEvent.setup();
    render(<StudentLoginPage />);

    await user.type(screen.getByLabelText('Index Number'), 'UG0001');
    await user.type(screen.getByLabelText('4-Digit PIN'), '1234');

    expect(screen.getByLabelText('Index Number')).toHaveValue('UG0001');
    expect(screen.getByLabelText('4-Digit PIN')).toHaveValue('1234');
  });

  it('PIN field is hidden by default', () => {
    render(<StudentLoginPage />);
    expect(screen.getByLabelText('4-Digit PIN')).toHaveAttribute('type', 'password');
  });

  it('PIN field has a max length of 4', () => {
    render(<StudentLoginPage />);
    expect(screen.getByLabelText('4-Digit PIN')).toHaveAttribute('maxLength', '4');
  });

  it('reveals PIN when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<StudentLoginPage />);

    await user.click(screen.getByLabelText('Show PIN'));

    expect(screen.getByLabelText('4-Digit PIN')).toHaveAttribute('type', 'text');
  });

  it('hides PIN again when the toggle is clicked a second time', async () => {
    const user = userEvent.setup();
    render(<StudentLoginPage />);

    await user.click(screen.getByLabelText('Show PIN'));
    await user.click(screen.getByLabelText('Hide PIN'));

    expect(screen.getByLabelText('4-Digit PIN')).toHaveAttribute('type', 'password');
  });

  // ── Loading state ────────────────────────────────────────────────────────────

  it('shows "Signing In..." and disables the button while loading', async () => {
    mockStudentLogin.mockReturnValue(new Promise(() => {}));
    render(<StudentLoginPage />);

    await fillAndSubmit();

    expect(screen.getByRole('button', { name: 'Signing In...' })).toBeDisabled();
  });

  // ── Success ──────────────────────────────────────────────────────────────────

  it('redirects to /student/dashboard on successful login', async () => {
    mockStudentLogin.mockResolvedValue({ success: true });
    render(<StudentLoginPage />);

    await fillAndSubmit();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/student/dashboard');
    });
  });

  it('calls studentLogin with the correct index number and PIN', async () => {
    mockStudentLogin.mockResolvedValue({ success: true });
    render(<StudentLoginPage />);

    await fillAndSubmit('UG0042', '5678');

    await waitFor(() => {
      expect(mockStudentLogin).toHaveBeenCalledWith('UG0042', '5678');
    });
  });

  // ── Failure ──────────────────────────────────────────────────────────────────

  it('shows the API error message on failed login', async () => {
    mockStudentLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });
    render(<StudentLoginPage />);

    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows a fallback error when the API returns no message', async () => {
    mockStudentLogin.mockResolvedValue({ success: false });
    render(<StudentLoginPage />);

    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('does not redirect on failed login', async () => {
    mockStudentLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });
    render(<StudentLoginPage />);

    await fillAndSubmit();

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
