import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LecturerSignupPage from './page';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/api', () => ({
  lecturerRegister: jest.fn(),
}));

import { lecturerRegister } from '@/lib/api';
const mockLecturerRegister = lecturerRegister as jest.Mock;

// ── Helpers ────────────────────────────────────────────────────────────────────

const VALID_FORM = {
  staffId: 'ST001',
  fullName: 'Dr. Mensah',
  email: 'mensah@ug.edu',
  password: 'Secret@123',
  confirmPassword: 'Secret@123',
};

async function fillForm(overrides: Partial<typeof VALID_FORM> = {}) {
  const data = { ...VALID_FORM, ...overrides };
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Staff ID'), data.staffId);
  await user.type(screen.getByLabelText('Full Name'), data.fullName);
  await user.type(screen.getByLabelText('Email Address'), data.email);
  await user.type(screen.getByLabelText('Password'), data.password);
  await user.type(screen.getByLabelText('Confirm Password'), data.confirmPassword);
  return user;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LecturerSignupPage', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────

  it('renders the page heading', () => {
    render(<LecturerSignupPage />);
    expect(screen.getByRole('heading', { name: 'Lecturer Sign Up' })).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<LecturerSignupPage />);
    expect(screen.getByLabelText('Staff ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('renders the Create Account button and Sign in link', () => {
    render(<LecturerSignupPage />);
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  // ── Password toggles ─────────────────────────────────────────────────────────

  it('password field is hidden by default', () => {
    render(<LecturerSignupPage />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('confirm password field is hidden by default', () => {
    render(<LecturerSignupPage />);
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('type', 'password');
  });

  it('reveals password when its toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    const toggles = screen.getAllByLabelText('Show password');
    await user.click(toggles[0]);

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('reveals confirm password when its toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    const toggles = screen.getAllByLabelText('Show password');
    await user.click(toggles[1]);

    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('type', 'text');
  });

  // ── Email validation ─────────────────────────────────────────────────────────

  it('shows error when email does not end with .edu', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Email Address'), 'mensah@gmail.com');

    expect(screen.getByText('Email must end with .edu')).toBeInTheDocument();
  });

  it('shows no email error when email ends with .edu', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Email Address'), 'mensah@ug.edu');

    expect(screen.queryByText('Email must end with .edu')).not.toBeInTheDocument();
  });

  // ── Password validation ──────────────────────────────────────────────────────

  it('shows error when password is shorter than 8 characters', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Password'), 'Ab@1');

    expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
  });

  it('shows error when password has no uppercase letter', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Password'), 'secret@123');

    expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
  });

  it('shows error when password has no lowercase letter', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Password'), 'SECRET@123');

    expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument();
  });

  it('shows error when password has no number', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Password'), 'Secret@abc');

    expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
  });

  it('shows error when password has no special character', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Password'), 'Secret123');

    expect(screen.getByText('Password must contain at least one special character')).toBeInTheDocument();
  });

  it('shows no password error for a valid password', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Password'), 'Secret@123');

    expect(screen.queryByText(/Password must/)).not.toBeInTheDocument();
  });

  // ── Confirm password validation ──────────────────────────────────────────────

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Password'), 'Secret@123');
    await user.type(screen.getByLabelText('Confirm Password'), 'Different@123');

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('shows no error when passwords match', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Password'), 'Secret@123');
    await user.type(screen.getByLabelText('Confirm Password'), 'Secret@123');

    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
  });

  // ── Submit blocked by validation ─────────────────────────────────────────────

  it('does not call lecturerRegister when validation fails', async () => {
    const user = userEvent.setup();
    render(<LecturerSignupPage />);

    await user.type(screen.getByLabelText('Email Address'), 'mensah@gmail.com');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(mockLecturerRegister).not.toHaveBeenCalled();
  });

  // ── Loading state ────────────────────────────────────────────────────────────

  it('shows "Creating Account..." and disables the button while loading', async () => {
    mockLecturerRegister.mockReturnValue(new Promise(() => {}));
    render(<LecturerSignupPage />);

    await fillForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByRole('button', { name: 'Creating Account...' })).toBeDisabled();
  });

  // ── Success ──────────────────────────────────────────────────────────────────

  it('redirects to /lecturer/login on successful registration', async () => {
    mockLecturerRegister.mockResolvedValue({ success: true });
    render(<LecturerSignupPage />);

    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/lecturer/login');
    });
  });

  it('calls lecturerRegister with the correct arguments', async () => {
    mockLecturerRegister.mockResolvedValue({ success: true });
    render(<LecturerSignupPage />);

    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockLecturerRegister).toHaveBeenCalledWith(
        'ST001',
        'Dr. Mensah',
        'mensah@ug.edu',
        'Secret@123',
      );
    });
  });

  // ── Failure ──────────────────────────────────────────────────────────────────

  it('shows the API error message on failed registration', async () => {
    mockLecturerRegister.mockResolvedValue({ success: false, message: 'Staff ID already exists' });
    render(<LecturerSignupPage />);

    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Staff ID already exists')).toBeInTheDocument();
    });
  });

  it('shows a fallback error when the API returns no message', async () => {
    mockLecturerRegister.mockResolvedValue({ success: false });
    render(<LecturerSignupPage />);

    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('does not redirect on failed registration', async () => {
    mockLecturerRegister.mockResolvedValue({ success: false, message: 'Staff ID already exists' });
    render(<LecturerSignupPage />);

    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
