import Papa from 'papaparse';
import type { LinkedInConnection } from '../../../types/connection-qualifier-types';

export function parseLinkedInCsv(csvText: string): LinkedInConnection[] {
  if (!csvText.trim()) return [];

  const parsed = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = parsed.data;

  // Find the header row — LinkedIn CSVs have junk preamble rows before the actual headers
  const headerIndex = rows.findIndex(
    (row) => row[0]?.trim() === 'First Name' && row[1]?.trim() === 'Last Name'
  );

  if (headerIndex === -1) return [];

  const dataRows = rows.slice(headerIndex + 1);

  return dataRows
    .filter((row) => row.length >= 7 && (row[4]?.trim() || row[5]?.trim()))
    .map((row) => ({
      firstName: row[0]?.trim() || '',
      lastName: row[1]?.trim() || '',
      url: row[2]?.trim() || '',
      emailAddress: row[3]?.trim() || '',
      company: row[4]?.trim() || '',
      position: row[5]?.trim() || '',
      connectedOn: row[6]?.trim() || '',
    }));
}
