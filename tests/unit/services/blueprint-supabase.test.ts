import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSlug } from '../../../services/blueprint-supabase';

// Mock the supabase client before importing the module
vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('generateSlug', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('converts name to lowercase hyphenated slug with suffix', () => {
    const slug = generateSlug('Gabrielle San Nicola');

    // Check format: lowercase, hyphenated, 4-char suffix
    expect(slug).toMatch(/^gabrielle-san-nicola-[a-z0-9]{4}$/);
  });

  it('removes special characters', () => {
    const slug = generateSlug("John O'Brien Jr.");

    expect(slug).toMatch(/^john-obrien-jr-[a-z0-9]{4}$/);
  });

  it('handles extra whitespace', () => {
    const slug = generateSlug('  Jane   Doe  ');

    expect(slug).toMatch(/^jane-doe-[a-z0-9]{4}$/);
  });

  it('generates different suffixes (randomness)', () => {
    const slugs = new Set(Array.from({ length: 20 }, () => generateSlug('Test User')));

    // With 20 attempts, we should get at least 2 unique slugs
    expect(slugs.size).toBeGreaterThan(1);
  });

  it('handles single word names', () => {
    const slug = generateSlug('Madonna');

    expect(slug).toMatch(/^madonna-[a-z0-9]{4}$/);
  });

  it('handles names with hyphens', () => {
    const slug = generateSlug('Mary-Jane Watson');

    expect(slug).toMatch(/^mary-jane-watson-[a-z0-9]{4}$/);
  });

  it('excludes confusing characters from suffix', () => {
    // Run many times to ensure we never get 0, O, 1, I, l
    for (let i = 0; i < 100; i++) {
      const slug = generateSlug('Test');
      const suffix = slug.slice(-4);
      expect(suffix).not.toMatch(/[01OIl]/);
    }
  });
});
