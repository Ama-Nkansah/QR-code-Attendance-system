import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackModal } from './FeedbackModal';

// Helper: fill and submit the form with valid data
async function submitForm() {
  await userEvent.type(screen.getByLabelText('Name'), 'Ama Serwaa');
  await userEvent.type(screen.getByLabelText('Email'), 'ama@ug.edu.gh');
  await userEvent.type(screen.getByLabelText('Message'), 'Great app!');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
}

describe('FeedbackModal', () => {
  // ── Visibility ─────────────────────────────────────────────────────────────

  it('renders nothing when isOpen is false', () => {
    render(<FeedbackModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByText('Send Feedback')).not.toBeInTheDocument();
  });

  it('renders the modal when isOpen is true', () => {
    render(<FeedbackModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Send Feedback')).toBeInTheDocument();
  });

  // ── Form fields ────────────────────────────────────────────────────────────

  it('shows all form fields', () => {
    render(<FeedbackModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('category defaults to "General Feedback"', () => {
    render(<FeedbackModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByLabelText('Category')).toHaveValue('general');
  });

  it('updates field values as the user types', async () => {
    render(<FeedbackModal isOpen={true} onClose={jest.fn()} />);

    await userEvent.type(screen.getByLabelText('Name'), 'Ama');
    await userEvent.type(screen.getByLabelText('Message'), 'Hello');

    expect(screen.getByLabelText('Name')).toHaveValue('Ama');
    expect(screen.getByLabelText('Message')).toHaveValue('Hello');
  });

  // ── Close / Cancel ─────────────────────────────────────────────────────────

  it('calls onClose when the X button is clicked', async () => {
    const onClose = jest.fn();
    render(<FeedbackModal isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByLabelText('Close modal'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the Cancel button is clicked', async () => {
    const onClose = jest.fn();
    render(<FeedbackModal isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Submit flow ────────────────────────────────────────────────────────────

  it('shows "Submitting..." while the form is being submitted', async () => {
    jest.useFakeTimers();

    render(<FeedbackModal isOpen={true} onClose={jest.fn()} />);

    // Fill form but do NOT advance timers yet — we want to catch the mid-flight state
    await userEvent.setup({ delay: null }).type(screen.getByLabelText('Name'), 'Ama');
    await userEvent.setup({ delay: null }).type(screen.getByLabelText('Email'), 'ama@ug.edu.gh');
    await userEvent.setup({ delay: null }).type(screen.getByLabelText('Message'), 'Great!');

    await act(async () => {
      await userEvent.setup({ delay: null }).click(screen.getByRole('button', { name: 'Submit' }));
    });

    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('shows the success message after submit completes', async () => {
    jest.useFakeTimers();

    render(<FeedbackModal isOpen={true} onClose={jest.fn()} />);

    await userEvent.setup({ delay: null }).type(screen.getByLabelText('Name'), 'Ama');
    await userEvent.setup({ delay: null }).type(screen.getByLabelText('Email'), 'ama@ug.edu.gh');
    await userEvent.setup({ delay: null }).type(screen.getByLabelText('Message'), 'Great!');

    await act(async () => {
      await userEvent.setup({ delay: null }).click(screen.getByRole('button', { name: 'Submit' }));
      // Advance past the 1-second simulated API delay
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Thank you!')).toBeInTheDocument();
    expect(screen.getByText('Your feedback has been submitted successfully.')).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('calls onClose 2 seconds after the success message appears', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null, advanceTimers: jest.advanceTimersByTime });
    const onClose = jest.fn();

    render(<FeedbackModal isOpen={true} onClose={onClose} />);

    await user.type(screen.getByLabelText('Name'), 'Ama');
    await user.type(screen.getByLabelText('Email'), 'ama@ug.edu.gh');
    await user.type(screen.getByLabelText('Message'), 'Great!');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Step 1: advance past the 1s fake API delay so the promise resolves
    // and the second setTimeout(onClose, 2000) gets registered
    await act(async () => { jest.advanceTimersByTime(1000); });

    // Step 2: advance past the 2s reset delay so onClose is called
    await act(async () => { jest.advanceTimersByTime(2000); });

    expect(onClose).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
