import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils';
import AnalysisSection from '../../../../components/blueprint/AnalysisSection';
import { Prospect } from '../../../../types/blueprint-types';

function makeProspect(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: 'test-id',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('AnalysisSection', () => {
  it('renders nothing when no analysis data', () => {
    const { container } = render(<AnalysisSection prospect={makeProspect()} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders whats working section', () => {
    render(
      <AnalysisSection
        prospect={makeProspect({
          whatsWorking1: 'Strong Headline: Your headline is clear and compelling',
          whatsWorking2: 'Active Posting: Consistent posting schedule',
        })}
      />
    );

    expect(screen.getByText("What's Working")).toBeInTheDocument();
    expect(screen.getByText('Strong Headline')).toBeInTheDocument();
    expect(screen.getByText('Your headline is clear and compelling')).toBeInTheDocument();
    expect(screen.getByText('Active Posting')).toBeInTheDocument();
  });

  it('renders revenue leaks section', () => {
    render(
      <AnalysisSection
        prospect={makeProspect({
          revenueLeaks1: 'Weak CTA: No clear call to action in bio',
        })}
      />
    );

    expect(screen.getByText('Revenue Leaks')).toBeInTheDocument();
    expect(screen.getByText('Weak CTA')).toBeInTheDocument();
    expect(screen.getByText('No clear call to action in bio')).toBeInTheDocument();
  });

  it('renders bottom line callout', () => {
    render(
      <AnalysisSection
        prospect={makeProspect({
          bottomLine: 'You have a strong foundation but need better conversion.',
        })}
      />
    );

    expect(screen.getByText('The Bottom Line')).toBeInTheDocument();
    expect(
      screen.getByText('You have a strong foundation but need better conversion.')
    ).toBeInTheDocument();
  });

  it('handles items without colon separator', () => {
    render(
      <AnalysisSection
        prospect={makeProspect({
          whatsWorking1: 'Great engagement numbers overall',
        })}
      />
    );

    // Should use "Point" as default title
    expect(screen.getByText('Point')).toBeInTheDocument();
    expect(screen.getByText('Great engagement numbers overall')).toBeInTheDocument();
  });

  it('renders all three sections together', () => {
    render(
      <AnalysisSection
        prospect={makeProspect({
          whatsWorking1: 'Good: Content quality',
          revenueLeaks1: 'Bad: Missing funnel',
          bottomLine: 'Summary here',
        })}
      />
    );

    expect(screen.getByText("What's Working")).toBeInTheDocument();
    expect(screen.getByText('Revenue Leaks')).toBeInTheDocument();
    expect(screen.getByText('The Bottom Line')).toBeInTheDocument();
  });
});
