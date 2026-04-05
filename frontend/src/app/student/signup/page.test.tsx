import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentSignupPage from './page';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/api', () => ({
  studentRegister: jest.fn(),
}));

import { studentRegister } from '@/lib/api';
const mockStudentRegister = studentRegister as jest.Mock;

// ── Helpers ────────────────────────────────────────────────────────────────────

const VALID_FORM = {
  indexNumber: 'UG0001',
  fullName: 'Ama Serwaa',
  email: 'ama@ug.edu.gh',
  department: 'Computer Science',
  level: '300',
  pin: '1234',
  confirmPin: '1234',
};

async function fillForm(overrides: Partial<typeof VALID_FORM> = {}) {
  const data = { ...VALID_FORM, ...overrides };
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Index Number'), data.indexNumber);
  await user.type(screen.getByLabelText('Full Name'), data.fullName);
  await user.type(screen.getByLabelText('Email Address'), data.email);
  await user.type(screen.getByLabelText('Department'), data.department);
  await user.selectOptions(screen.getByLabelText('Level'), data.level);
  await user.type(screen.getByLabelText('4-Digit PIN'), data.pin);
  await user.type(screen.getByLabelText('Confirm PIN'), data.confirmPin);
  return user;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('StudentSignupPage', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────

  it('renders the page heading', () => {
    render(<StudentSignupPage />);
    expect(screen.getByRole('heading', { name: 'Student Sign Up' })).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<StudentSignupPage />);
    expect(screen.getByLabelText('Index Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Department')).toBeInTheDocument();
    expect(screen.getByLabelText('Level')).toBeInTheDocument();
    expect(screen.getByLabelText('4-Digit PIN')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm PIN')).toBeInTheDocument();
  });

  it('renders the Create Account button and Sign in link', () => {
    render(<StudentSignupPage />);
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('level dropdown defaults to empty', () => {
    render(<StudentSignupPage />);
    expect(screen.getByLabelText('Level')).toHaveValue('');
  });

  // ── PIN toggles ──────────────────────────────────────────────────────────────

  it('PIN field is hidden by default', () => {
    render(<StudentSignupPage />);
    expect(screen.getByLabelText('4-Digit PIN')).toHaveAttribute('type', 'password');
  });

  it('Confirm PIN field is hidden by default', () => {
    render(<StudentSignupPage />);
    expect(screen.getByLabelText('Confirm PIN')).toHaveAttribute('type', 'password');
  });

  it('reveals PIN when its toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<StudentSignupPage />);

    const toggles = screen.getAllByLabelText('Show PIN');
    await user.click(toggles[0]);

    expect(screen.getByLabelText('4-Digit PIN')).toHaveAttribute('type', 'text');
  });

  it('reveals Confirm PIN when its toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<StudentSignupPage />);

    const toggles = screen.getAllByLabelText('Show PIN');
    await user.click(toggles[1]);

    expect(screen.getByLabelText('Confirm PIN')).toHaveAttribute('type', 'text');
  });

  // ── Email validation ─────────────────────────────────────────────────────────

  it('shows error for an invalid email address', async () => {
    const user = userEvent.setup();
    render(<StudentSignupPage />);

    await user.type(screen.getByLabelText('Email Address'), 'not-an-email');

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('shows no error for a valid email address', async () => {
    const user = userEvent.setup();
    render(<StudentSignupPage />);

    await user.type(screen.getByLabelText('Email Address'), 'ama@ug.edu.gh');

    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
  });

  // ── PIN validation ───────────────────────────────────────────────────────────

  it('shows error when PIN is not exactly 4 digits', async () => {
    const user = userEvent.setup();
    render(<StudentSignupPage />);

    await user.type(screen.getByLabelText('4-Digit PIN'), '12');

    expect(screen.getByText('PIN must be exactly 4 digits')).toBeInTheDocument();
  });

  it('shows no error for a valid 4-digit PIN', async () => {
    const user = userEvent.setup();
    render(<StudentSignupPage />);

    await user.type(screen.getByLabelText('4-Digit PIN'), '1234');

    expect(screen.queryByText('PIN must be exactly 4 digits')).not.toBeInTheDocument();
  });

  it('shows error when PINs do not match', async () => {
    const user = userEvent.setup();
    render(<StudentSignupPage />);

    await user.type(screen.getByLabelText('4-Digit PIN'), '1234');
    await user.type(screen.getByLabelText('Confirm PIN'), '5678');

    expect(screen.getByText('PINs do not match')).toBeInTheDocument();
  });

  it('shows no error when PINs match', async () => {
    const user = userEvent.setup();
    render(<StudentSignupPage />);

    await user.type(screen.getByLabelText('4-Digit PIN'), '1234');
    await user.type(screen.getByLabelText('Confirm PIN'), '1234');

    expect(screen.queryByText('PINs do not match')).not.toBeInTheDocument();
  });

  // ── Department title casing ──────────────────────────────────────────────────

  it('title-cases the department value as the user types', async () => {
    const user = userEvent.setup();
    render(<StudentSignupPage />);

    await user.type(screen.getByLabelText('Department'), 'computer science');

    expect(screen.getByLabelText('Department')).toHaveValue('Computer Science');
  });

  // ── Submit blocked by validation ─────────────────────────────────────────────

  it('does not call studentRegister when validation fails', async () => {
    const user = userEvent.setup();
    render(<StudentSignupPage />);

    await user.type(screen.getByLabelText('Email Address'), 'bad-email');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(mockStudentRegister).not.toHaveBeenCalled();
  });

  // ── Loading state ────────────────────────────────────────────────────────────

  it('shows "Creating Account..." and disables the button while loading', async () => {
    mockStudentRegister.mockReturnValue(new Promise(() => {}));
    render(<StudentSignupPage />);

    await fillForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByRole('button', { name: 'Creating Account...' })).toBeDisabled();
  });

  // ── Success ──────────────────────────────────────────────────────────────────

  it('redirects to /student/login on successful registration', async () => {
    mockStudentRegister.mockResolvedValue({ success: true });
    render(<StudentSignupPage />);

    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/student/login');
    });
  });

  it('calls studentRegister with the correct arguments', async () => {
    mockStudentRegister.mockResolvedValue({ success: true });
    render(<StudentSignupPage />);

    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockStudentRegister).toHaveBeenCalledWith(
        'UG0001',
        'Ama Serwaa',
        'ama@ug.edu.gh',
        'Computer Science',
        '300',
        '1234',
      );
    });
  });

  // ── Failure ──────────────────────────────────────────────────────────────────

  it('shows the API error message on failed registration', async () => {
    mockStudentRegister.mockResolvedValue({ success: false, message: 'Index number already registered' });
    render(<StudentSignupPage />);

    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Index number already registered')).toBeInTheDocument();
    });
  });

  it('shows a fallback error when the API returns no message', async () => {
    mockStudentRegister.mockResolvedValue({ success: false });
    render(<StudentSignupPage />);

    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('does not redirect on failed registration', async () => {
    mockStudentRegister.mockResolvedValue({ success: false, message: 'Index number already registered' });
    render(<StudentSignupPage />);

    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
