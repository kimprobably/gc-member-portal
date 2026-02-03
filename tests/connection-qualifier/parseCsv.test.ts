import { describe, it, expect } from 'vitest';
import { parseLinkedInCsv } from '../../components/bootcamp/connection-qualifier/parseCsv';

const SAMPLE_CSV = `Notes:,,,,,,
"When exporting your connection data, you may notice...",,,,,,
,,,,,,
First Name,Last Name,URL,Email Address,Company,Position,Connected On
Kenny,Damian,https://www.linkedin.com/in/kenny-damian,,ColdIQ,GTM Engineer,12 Nov 2025
Andrei,Lucian,https://www.linkedin.com/in/andrei-lucian,,Self-employed,Ghostwriter,12 Nov 2025
Glenn,Crytzer,https://www.linkedin.com/in/glenncrytzer,,The Glenn Crytzer Orchestra,Musical and Artistic Director,12 Nov 2025`;

describe('parseLinkedInCsv', () => {
  it('parses LinkedIn CSV skipping preamble rows', () => {
    const result = parseLinkedInCsv(SAMPLE_CSV);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      firstName: 'Kenny',
      lastName: 'Damian',
      url: 'https://www.linkedin.com/in/kenny-damian',
      emailAddress: '',
      company: 'ColdIQ',
      position: 'GTM Engineer',
      connectedOn: '12 Nov 2025',
    });
  });

  it('handles empty CSV', () => {
    const result = parseLinkedInCsv('');
    expect(result).toEqual([]);
  });

  it('handles CSV with only preamble and no data', () => {
    const csv = `Notes:,,,,,,\nFirst Name,Last Name,URL,Email Address,Company,Position,Connected On`;
    const result = parseLinkedInCsv(csv);
    expect(result).toEqual([]);
  });

  it('skips rows with no company and no position', () => {
    const csv = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
Alice,Smith,https://linkedin.com/in/alice,,,,12 Nov 2025
Bob,Jones,https://linkedin.com/in/bob,,Acme,CEO,12 Nov 2025`;
    const result = parseLinkedInCsv(csv);
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe('Bob');
  });
});
