import { describe, it, expect } from 'vitest';
import { preFilterConnections } from '../../components/bootcamp/connection-qualifier/preFilter';
import type {
  LinkedInConnection,
  QualificationCriteria,
} from '../../types/connection-qualifier-types';

const connections: LinkedInConnection[] = [
  {
    firstName: 'Alice',
    lastName: 'A',
    url: '',
    emailAddress: '',
    company: 'Acme SaaS',
    position: 'CEO',
    connectedOn: '12 Nov 2025',
  },
  {
    firstName: 'Bob',
    lastName: 'B',
    url: '',
    emailAddress: '',
    company: 'University',
    position: 'Student',
    connectedOn: '01 Jan 2024',
  },
  {
    firstName: 'Carol',
    lastName: 'C',
    url: '',
    emailAddress: '',
    company: 'Self-employed',
    position: 'Freelancer',
    connectedOn: '15 Jun 2025',
  },
  {
    firstName: 'Dave',
    lastName: 'D',
    url: '',
    emailAddress: '',
    company: 'BigCo',
    position: 'VP Sales',
    connectedOn: '20 Mar 2023',
  },
];

const baseCriteria: QualificationCriteria = {
  targetTitles: [],
  targetIndustries: [],
  excludeTitles: [],
  excludeCompanies: [],
  connectedAfter: null,
  freeTextDescription: '',
};

describe('preFilterConnections', () => {
  it('excludes connections matching excluded titles', () => {
    const criteria = { ...baseCriteria, excludeTitles: ['Student'] };
    const result = preFilterConnections(connections, criteria);
    expect(result.map((c) => c.firstName)).toEqual(['Alice', 'Carol', 'Dave']);
  });

  it('excludes connections matching excluded companies', () => {
    const criteria = { ...baseCriteria, excludeCompanies: ['Self-employed'] };
    const result = preFilterConnections(connections, criteria);
    expect(result.map((c) => c.firstName)).toEqual(['Alice', 'Bob', 'Dave']);
  });

  it('filters by connected after date', () => {
    const criteria = { ...baseCriteria, connectedAfter: '2025-01-01' };
    const result = preFilterConnections(connections, criteria);
    expect(result.map((c) => c.firstName)).toEqual(['Alice', 'Carol']);
  });

  it('combines all filters', () => {
    const criteria: QualificationCriteria = {
      ...baseCriteria,
      excludeTitles: ['Student'],
      excludeCompanies: ['Self-employed'],
      connectedAfter: '2025-01-01',
    };
    const result = preFilterConnections(connections, criteria);
    expect(result.map((c) => c.firstName)).toEqual(['Alice']);
  });

  it('returns all connections when no filters set', () => {
    const result = preFilterConnections(connections, baseCriteria);
    expect(result).toHaveLength(4);
  });

  it('case-insensitive title matching', () => {
    const criteria = { ...baseCriteria, excludeTitles: ['student'] };
    const result = preFilterConnections(connections, criteria);
    expect(result.map((c) => c.firstName)).toEqual(['Alice', 'Carol', 'Dave']);
  });
});
