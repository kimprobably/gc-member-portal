import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import GCLogin from '../../components/gc/GCLogin';

// Mock the gc-airtable service
vi.mock('../../services/gc-airtable', () => ({
  verifyGCMember: vi.fn(),
}));

import { verifyGCMember } from '../../services/gc-airtable';

const mockVerifyGCMember = vi.mocked(verifyGCMember);

describe('GC Login Flow', () => {
  beforeEach(() => {
    mockVerifyGCMember.mockReset();
  });

  it('renders login form', () => {
    render(<GCLogin />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /access portal/i })).toBeInTheDocument();
  });

  it('shows error for invalid email', async () => {
    mockVerifyGCMember.mockResolvedValueOnce(null);

    render(<GCLogin />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /access portal/i });

    await userEvent.type(emailInput, 'invalid@example.com');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });

  it('calls verifyGCMember with normalized email', async () => {
    mockVerifyGCMember.mockResolvedValueOnce(null);

    render(<GCLogin />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /access portal/i });

    await userEvent.type(emailInput, '  TEST@EXAMPLE.COM  ');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockVerifyGCMember).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows loading state during verification', async () => {
    mockVerifyGCMember.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
    );

    render(<GCLogin />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /access portal/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
