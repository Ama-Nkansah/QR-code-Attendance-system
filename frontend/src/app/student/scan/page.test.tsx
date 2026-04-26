import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScanPage from './page';

// ── Scanner mock ───────────────────────────────────────────────────────────────
//
// html5-qrcode is dynamically imported inside startScanner(). Jest intercepts
// dynamic imports the same way as static ones, so jest.mock works here too.
//
// We capture the onSuccess callback so tests can fire it manually to simulate
// a QR code being scanned.

const mockScannerStop = jest.fn(() => Promise.resolve());
const mockScannerClear = jest.fn();
let mockOnQrSuccess: ((qrData: string) => Promise<void>) | null = null;

const mockScannerStart = jest.fn((_config, _opts, onSuccess) => {
  mockOnQrSuccess = onSuccess;
  return Promise.resolve();
});

const mockScannerInstance = {
  start: mockScannerStart,
  stop: mockScannerStop,
  clear: mockScannerClear,
};

jest.mock('html5-qrcode', () => ({
  Html5Qrcode: jest.fn(() => mockScannerInstance),
}));

// ── Other mocks ────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/api', () => ({
  markAttendance: jest.fn(),
}));

import { markAttendance } from '@/lib/api';
const mockMarkAttendance = markAttendance as jest.Mock;

// ── Geolocation helpers ────────────────────────────────────────────────────────

function mockGeolocationSuccess(lat = 5.65, lng = -0.19) {
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

// ── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockOnQrSuccess = null;
});

describe('ScanPage', () => {
  // ── Idle state ───────────────────────────────────────────────────────────────

  it('renders the heading and idle state by default', () => {
    render(<ScanPage />);

    expect(screen.getByRole('heading', { name: 'Scan QR Code' })).toBeInTheDocument();
    expect(screen.getByText(/Camera is off/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Camera' })).toBeInTheDocument();
  });

  it('renders the Back button', () => {
    render(<ScanPage />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('navigates to /student/dashboard when Back is clicked', async () => {
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(mockPush).toHaveBeenCalledWith('/student/dashboard');
  });

  // ── Scanning state ───────────────────────────────────────────────────────────

  it('shows the Cancel button after Start Camera is clicked', async () => {
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  it('returns to idle state when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));
    await waitFor(() => screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start Camera' })).toBeInTheDocument();
    });
  });

  it('shows camera denied error when camera access is blocked', async () => {
    mockScannerStart.mockRejectedValueOnce(new Error('Camera denied'));
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));

    await waitFor(() => {
      expect(screen.getByText(/Camera access denied/)).toBeInTheDocument();
    });
  });

  // ── QR scan → success ────────────────────────────────────────────────────────

  it('shows "Attendance marked successfully!" after a successful scan', async () => {
    mockGeolocationSuccess();
    mockMarkAttendance.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));
    await waitFor(() => expect(mockOnQrSuccess).not.toBeNull());

    await act(async () => {
      await mockOnQrSuccess!('qr-token-abc');
    });

    await waitFor(() => {
      expect(screen.getByText('Attendance marked successfully!')).toBeInTheDocument();
    });
  });

  it('calls markAttendance with the scanned QR data and coordinates', async () => {
    mockGeolocationSuccess(5.65, -0.19);
    mockMarkAttendance.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));
    await waitFor(() => expect(mockOnQrSuccess).not.toBeNull());

    await act(async () => {
      await mockOnQrSuccess!('qr-token-abc');
    });

    await waitFor(() => {
      expect(mockMarkAttendance).toHaveBeenCalledWith('qr-token-abc', 5.65, -0.19);
    });
  });

  it('shows "Back to Dashboard" button after successful scan', async () => {
    mockGeolocationSuccess();
    mockMarkAttendance.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));
    await waitFor(() => expect(mockOnQrSuccess).not.toBeNull());

    await act(async () => {
      await mockOnQrSuccess!('qr-token-abc');
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back to Dashboard' })).toBeInTheDocument();
    });
  });

  it('navigates to /student/dashboard when "Back to Dashboard" is clicked after success', async () => {
    mockGeolocationSuccess();
    mockMarkAttendance.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));
    await waitFor(() => expect(mockOnQrSuccess).not.toBeNull());

    await act(async () => { await mockOnQrSuccess!('qr-token-abc'); });

    await waitFor(() => screen.getByRole('button', { name: 'Back to Dashboard' }));
    await user.click(screen.getByRole('button', { name: 'Back to Dashboard' }));

    expect(mockPush).toHaveBeenCalledWith('/student/dashboard');
  });

  // ── QR scan → location denied ────────────────────────────────────────────────

  it('shows location denied error when geolocation is blocked', async () => {
    mockGeolocationDenied();
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));
    await waitFor(() => expect(mockOnQrSuccess).not.toBeNull());

    await act(async () => { await mockOnQrSuccess!('qr-token-abc'); });

    await waitFor(() => {
      expect(screen.getByText(/Location access denied/)).toBeInTheDocument();
    });
  });

  // ── QR scan → API failure ────────────────────────────────────────────────────

  it('shows API error message when marking attendance fails', async () => {
    mockGeolocationSuccess();
    mockMarkAttendance.mockResolvedValue({ success: false, message: 'QR code has expired' });
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));
    await waitFor(() => expect(mockOnQrSuccess).not.toBeNull());

    await act(async () => { await mockOnQrSuccess!('qr-token-abc'); });

    await waitFor(() => {
      expect(screen.getByText('QR code has expired')).toBeInTheDocument();
    });
  });

  it('shows fallback error when API returns no message', async () => {
    mockGeolocationSuccess();
    mockMarkAttendance.mockResolvedValue({ success: false });
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));
    await waitFor(() => expect(mockOnQrSuccess).not.toBeNull());

    await act(async () => { await mockOnQrSuccess!('qr-token-abc'); });

    await waitFor(() => {
      expect(screen.getByText('Failed to mark attendance')).toBeInTheDocument();
    });
  });

  it('shows "Try Again" button on error', async () => {
    mockGeolocationSuccess();
    mockMarkAttendance.mockResolvedValue({ success: false, message: 'QR code has expired' });
    const user = userEvent.setup();
    render(<ScanPage />);

    await user.click(screen.getByRole('button', { name: 'Start Camera' }));
    await waitFor(() => expect(mockOnQrSuccess).not.toBeNull());

    await act(async () => { await mockOnQrSuccess!('qr-token-abc'); });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });
  });
});
