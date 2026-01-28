import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import CTAButton from '../../../../components/blueprint/CTAButton';

describe('CTAButton', () => {
  it('renders button text', () => {
    render(<CTAButton text="Book Your Strategy Call" />);

    expect(screen.getByRole('button', { name: /Book Your Strategy Call/ })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<CTAButton text="Click Me" onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders with primary variant by default', () => {
    render(<CTAButton text="Primary CTA" />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-violet-500');
  });

  it('renders with secondary variant', () => {
    render(<CTAButton text="Secondary CTA" variant="secondary" />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-zinc-800');
  });

  it('applies custom className', () => {
    render(<CTAButton text="Custom" className="mt-4" />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('mt-4');
  });
});
