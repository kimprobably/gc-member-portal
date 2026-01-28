import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils';
import BlueprintHeader from '../../../../components/blueprint/BlueprintHeader';
import { Prospect } from '../../../../types/blueprint-types';

function makeProspect(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: 'test-id',
    fullName: 'Gabrielle San Nicola',
    company: 'Acme Corp',
    jobTitle: 'CEO',
    authorityScore: 72,
    scoreSummary: 'Strong LinkedIn presence with room for growth.',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('BlueprintHeader', () => {
  it('renders prospect name in uppercase', () => {
    render(<BlueprintHeader prospect={makeProspect()} />);

    expect(screen.getByText('GABRIELLE SAN NICOLA')).toBeInTheDocument();
  });

  it('renders "GTM BLUEPRINT FOR" heading', () => {
    render(<BlueprintHeader prospect={makeProspect()} />);

    expect(screen.getByText(/GTM BLUEPRINT FOR/)).toBeInTheDocument();
  });

  it('renders authority score', () => {
    render(<BlueprintHeader prospect={makeProspect()} />);

    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('Authority Score')).toBeInTheDocument();
  });

  it('renders company and job title', () => {
    render(<BlueprintHeader prospect={makeProspect()} />);

    expect(screen.getByText('Acme Corp | CEO')).toBeInTheDocument();
  });

  it('renders score summary', () => {
    render(<BlueprintHeader prospect={makeProspect()} />);

    expect(screen.getByText('Strong LinkedIn presence with room for growth.')).toBeInTheDocument();
  });

  it('defaults authority score to 0 when missing', () => {
    render(<BlueprintHeader prospect={makeProspect({ authorityScore: undefined })} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders fallback avatar when no profile photo', () => {
    render(<BlueprintHeader prospect={makeProspect({ profilePhoto: undefined })} />);

    // Should show first initial as fallback
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('does not render score summary when missing', () => {
    render(<BlueprintHeader prospect={makeProspect({ scoreSummary: undefined })} />);

    expect(screen.queryByText('Strong LinkedIn presence')).not.toBeInTheDocument();
  });
});
