import type {
  LinkedInConnection,
  QualificationCriteria,
} from '../../../types/connection-qualifier-types';

function parseLinkedInDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Format: "12 Nov 2025"
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function matchesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

export function preFilterConnections(
  connections: LinkedInConnection[],
  criteria: QualificationCriteria
): LinkedInConnection[] {
  const afterDate = criteria.connectedAfter ? new Date(criteria.connectedAfter) : null;

  return connections.filter((conn) => {
    if (criteria.excludeTitles.length > 0 && matchesAny(conn.position, criteria.excludeTitles)) {
      return false;
    }

    if (
      criteria.excludeCompanies.length > 0 &&
      matchesAny(conn.company, criteria.excludeCompanies)
    ) {
      return false;
    }

    if (afterDate) {
      const connDate = parseLinkedInDate(conn.connectedOn);
      if (!connDate || connDate < afterDate) {
        return false;
      }
    }

    return true;
  });
}
