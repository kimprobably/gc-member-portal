import { describe, it, expect } from 'vitest';
import {
  extractScoreData,
  extractAnalysisGroup,
  extractLeadMagnetOptions,
  extractHeadlineOptions,
  getProgressPercentage,
  isAnalysisComplete,
  getProspectDisplayName,
  Prospect,
} from '../../../types/blueprint-types';

// Minimal prospect factory for tests
function makeProspect(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: 'test-id',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('extractScoreData', () => {
  it('returns scores from prospect', () => {
    const prospect = makeProspect({
      scoreProfileOptimization: 8,
      scoreContentPresence: 6,
      scoreOutboundSystems: 4,
      scoreInboundInfrastructure: 7,
      scoreSocialProof: 5,
    });

    const result = extractScoreData(prospect);

    expect(result).toEqual({
      profileOptimization: 8,
      contentPresence: 6,
      outboundSystems: 4,
      inboundInfrastructure: 7,
      socialProof: 5,
    });
  });

  it('returns 0 for missing scores', () => {
    const result = extractScoreData(makeProspect());

    expect(result).toEqual({
      profileOptimization: 0,
      contentPresence: 0,
      outboundSystems: 0,
      inboundInfrastructure: 0,
      socialProof: 0,
    });
  });
});

describe('extractAnalysisGroup', () => {
  it('collects whats working and revenue leaks', () => {
    const prospect = makeProspect({
      whatsWorking1: 'Strong headline',
      whatsWorking2: 'Good engagement',
      whatsWorking3: 'Active posting',
      revenueLeaks1: 'No CTA',
      revenueLeaks2: 'Weak bio',
      bottomLine: 'Needs improvement',
    });

    const result = extractAnalysisGroup(prospect);

    expect(result.whatsWorking).toEqual(['Strong headline', 'Good engagement', 'Active posting']);
    expect(result.revenueLeaks).toEqual(['No CTA', 'Weak bio']);
    expect(result.bottomLine).toBe('Needs improvement');
  });

  it('returns empty arrays when fields are missing', () => {
    const result = extractAnalysisGroup(makeProspect());

    expect(result.whatsWorking).toEqual([]);
    expect(result.revenueLeaks).toEqual([]);
    expect(result.bottomLine).toBeUndefined();
  });
});

describe('extractLeadMagnetOptions', () => {
  it('returns 3 lead magnet options', () => {
    const prospect = makeProspect({
      lmCard1: {
        contentType: 'guide',
        headline: 'H1',
        subheadline: 'S1',
        match: 'M1',
        estHours: '2',
      },
      leadMag1: 'Description 1',
      lmPost1: 'Post 1',
    });

    const result = extractLeadMagnetOptions(prospect);

    expect(result).toHaveLength(3);
    expect(result[0].number).toBe(1);
    expect(result[0].card?.headline).toBe('H1');
    expect(result[0].description).toBe('Description 1');
    expect(result[0].promotionPost).toBe('Post 1');
    expect(result[1].number).toBe(2);
    expect(result[2].number).toBe(3);
  });
});

describe('extractHeadlineOptions', () => {
  it('returns 3 headline options with recommendation', () => {
    const prospect = makeProspect({
      headlineOutcomeBased: 'I help X achieve Y',
      headlineAuthorityBased: 'Top X expert',
      headlineHybrid: 'Expert who helps X',
      headlineRecommendation: 'Outcome-based',
    });

    const result = extractHeadlineOptions(prospect);

    expect(result).toHaveLength(3);
    expect(result[0].type).toBe('outcome');
    expect(result[0].isRecommended).toBe(true);
    expect(result[1].type).toBe('authority');
    expect(result[1].isRecommended).toBe(false);
    expect(result[2].type).toBe('hybrid');
    expect(result[2].isRecommended).toBe(false);
  });

  it('handles missing recommendation', () => {
    const result = extractHeadlineOptions(makeProspect());

    expect(result.every((h) => !h.isRecommended)).toBe(true);
  });
});

describe('getProgressPercentage', () => {
  it('returns correct percentages for each status', () => {
    expect(getProgressPercentage('pending_scrape')).toBe(0);
    expect(getProgressPercentage('scraping_profile')).toBe(20);
    expect(getProgressPercentage('complete')).toBe(100);
    expect(getProgressPercentage('error')).toBe(0);
  });

  it('returns 0 for undefined status', () => {
    expect(getProgressPercentage(undefined)).toBe(0);
  });
});

describe('isAnalysisComplete', () => {
  it('returns true for complete status', () => {
    expect(isAnalysisComplete(makeProspect({ status: 'complete' }))).toBe(true);
  });

  it('returns true for enrichment_complete status', () => {
    expect(isAnalysisComplete(makeProspect({ status: 'enrichment_complete' }))).toBe(true);
  });

  it('returns false for other statuses', () => {
    expect(isAnalysisComplete(makeProspect({ status: 'pending_scrape' }))).toBe(false);
    expect(isAnalysisComplete(makeProspect({ status: 'enriching' }))).toBe(false);
  });
});

describe('getProspectDisplayName', () => {
  it('returns fullName if available', () => {
    expect(getProspectDisplayName(makeProspect({ fullName: 'John Doe' }))).toBe('John Doe');
  });

  it('returns firstName + lastName if no fullName', () => {
    expect(getProspectDisplayName(makeProspect({ firstName: 'John', lastName: 'Doe' }))).toBe(
      'John Doe'
    );
  });

  it('returns firstName only if no lastName', () => {
    expect(getProspectDisplayName(makeProspect({ firstName: 'John' }))).toBe('John');
  });

  it('returns email if no name', () => {
    expect(getProspectDisplayName(makeProspect({ email: 'john@example.com' }))).toBe(
      'john@example.com'
    );
  });

  it('returns "Unknown Prospect" as fallback', () => {
    expect(getProspectDisplayName(makeProspect())).toBe('Unknown Prospect');
  });
});
