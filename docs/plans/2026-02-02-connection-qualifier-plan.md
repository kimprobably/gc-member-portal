# LinkedIn Connection Qualifier — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a bootcamp tool that lets students upload their LinkedIn connections CSV, define ICP criteria, pre-filter junk, AI-qualify the rest with Claude Haiku, and download a qualified CSV.

**Architecture:** Stateless client-side tool. CSV parsing and pre-filtering in the browser. AI qualification via a new Supabase edge function calling Claude Haiku in batches of 50. No database tables. Integrated into the bootcamp sidebar as a virtual lesson (same pattern as TAM Builder).

**Tech Stack:** React + TypeScript, Papa Parse (CSV), Supabase Edge Function, Claude Haiku API, Tailwind CSS

---

### Task 1: Install Papa Parse

**Files:**
- Modify: `package.json`

**Step 1: Install dependency**

Run: `npm install papaparse && npm install -D @types/papaparse`

**Step 2: Verify install**

Run: `npm ls papaparse`
Expected: `papaparse@5.x.x`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add papaparse for CSV parsing"
```

---

### Task 2: Create types for Connection Qualifier

**Files:**
- Create: `src/types/connection-qualifier-types.ts`

**Step 1: Write the types file**

```typescript
export interface LinkedInConnection {
  firstName: string;
  lastName: string;
  url: string;
  emailAddress: string;
  company: string;
  position: string;
  connectedOn: string;
}

export interface QualificationCriteria {
  targetTitles: string[];
  targetIndustries: string[];
  excludeTitles: string[];
  excludeCompanies: string[];
  connectedAfter: string | null; // ISO date string or null
  freeTextDescription: string;
}

export interface QualificationResult {
  qualification: 'qualified' | 'not_qualified';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface QualifiedConnection extends LinkedInConnection {
  qualification: string;
  confidence: string;
  reasoning: string;
}

export type QualifierStep = 'upload' | 'criteria' | 'preview' | 'processing' | 'results';

export const DEFAULT_EXCLUDE_TITLES = [
  'Student',
  'Intern',
  'Retired',
  'Unemployed',
  'Seeking',
];

export const DEFAULT_EXCLUDE_COMPANIES: string[] = [];
```

**Step 2: Commit**

```bash
git add src/types/connection-qualifier-types.ts
git commit -m "feat: add types for connection qualifier"
```

---

### Task 3: Build CSV parser utility

**Files:**
- Create: `src/components/bootcamp/connection-qualifier/parseCsv.ts`
- Create: `src/components/bootcamp/connection-qualifier/__tests__/parseCsv.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { parseLinkedInCsv } from '../parseCsv';

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
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/bootcamp/connection-qualifier/__tests__/parseCsv.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

```typescript
import Papa from 'papaparse';
import type { LinkedInConnection } from '../../../types/connection-qualifier-types';

const EXPECTED_HEADERS = ['First Name', 'Last Name', 'URL', 'Email Address', 'Company', 'Position', 'Connected On'];

export function parseLinkedInCsv(csvText: string): LinkedInConnection[] {
  if (!csvText.trim()) return [];

  const parsed = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = parsed.data;

  // Find the header row
  const headerIndex = rows.findIndex(row =>
    row[0]?.trim() === 'First Name' && row[1]?.trim() === 'Last Name'
  );

  if (headerIndex === -1) return [];

  const dataRows = rows.slice(headerIndex + 1);

  return dataRows
    .filter(row => row.length >= 7 && (row[4]?.trim() || row[5]?.trim())) // must have company or position
    .map(row => ({
      firstName: row[0]?.trim() || '',
      lastName: row[1]?.trim() || '',
      url: row[2]?.trim() || '',
      emailAddress: row[3]?.trim() || '',
      company: row[4]?.trim() || '',
      position: row[5]?.trim() || '',
      connectedOn: row[6]?.trim() || '',
    }));
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/bootcamp/connection-qualifier/__tests__/parseCsv.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/bootcamp/connection-qualifier/parseCsv.ts src/components/bootcamp/connection-qualifier/__tests__/parseCsv.test.ts
git commit -m "feat: add LinkedIn CSV parser with preamble detection"
```

---

### Task 4: Build pre-filter utility

**Files:**
- Create: `src/components/bootcamp/connection-qualifier/preFilter.ts`
- Create: `src/components/bootcamp/connection-qualifier/__tests__/preFilter.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { preFilterConnections } from '../preFilter';
import type { LinkedInConnection, QualificationCriteria } from '../../../types/connection-qualifier-types';

const connections: LinkedInConnection[] = [
  { firstName: 'Alice', lastName: 'A', url: '', emailAddress: '', company: 'Acme SaaS', position: 'CEO', connectedOn: '12 Nov 2025' },
  { firstName: 'Bob', lastName: 'B', url: '', emailAddress: '', company: 'University', position: 'Student', connectedOn: '01 Jan 2024' },
  { firstName: 'Carol', lastName: 'C', url: '', emailAddress: '', company: 'Self-employed', position: 'Freelancer', connectedOn: '15 Jun 2025' },
  { firstName: 'Dave', lastName: 'D', url: '', emailAddress: '', company: 'BigCo', position: 'VP Sales', connectedOn: '20 Mar 2023' },
];

describe('preFilterConnections', () => {
  it('excludes connections matching excluded titles', () => {
    const criteria: QualificationCriteria = {
      targetTitles: [],
      targetIndustries: [],
      excludeTitles: ['Student'],
      excludeCompanies: [],
      connectedAfter: null,
      freeTextDescription: '',
    };
    const result = preFilterConnections(connections, criteria);
    expect(result.map(c => c.firstName)).toEqual(['Alice', 'Carol', 'Dave']);
  });

  it('excludes connections matching excluded companies', () => {
    const criteria: QualificationCriteria = {
      targetTitles: [],
      targetIndustries: [],
      excludeTitles: [],
      excludeCompanies: ['Self-employed'],
      connectedAfter: null,
      freeTextDescription: '',
    };
    const result = preFilterConnections(connections, criteria);
    expect(result.map(c => c.firstName)).toEqual(['Alice', 'Bob', 'Dave']);
  });

  it('filters by connected after date', () => {
    const criteria: QualificationCriteria = {
      targetTitles: [],
      targetIndustries: [],
      excludeTitles: [],
      excludeCompanies: [],
      connectedAfter: '2025-01-01',
      freeTextDescription: '',
    };
    const result = preFilterConnections(connections, criteria);
    expect(result.map(c => c.firstName)).toEqual(['Alice', 'Carol']);
  });

  it('combines all filters', () => {
    const criteria: QualificationCriteria = {
      targetTitles: [],
      targetIndustries: [],
      excludeTitles: ['Student'],
      excludeCompanies: ['Self-employed'],
      connectedAfter: '2025-01-01',
      freeTextDescription: '',
    };
    const result = preFilterConnections(connections, criteria);
    expect(result.map(c => c.firstName)).toEqual(['Alice']);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/bootcamp/connection-qualifier/__tests__/preFilter.test.ts`
Expected: FAIL

**Step 3: Write the implementation**

```typescript
import type { LinkedInConnection, QualificationCriteria } from '../../../types/connection-qualifier-types';

function parseLinkedInDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Format: "12 Nov 2025"
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function matchesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some(term => lower.includes(term.toLowerCase()));
}

export function preFilterConnections(
  connections: LinkedInConnection[],
  criteria: QualificationCriteria
): LinkedInConnection[] {
  const afterDate = criteria.connectedAfter ? new Date(criteria.connectedAfter) : null;

  return connections.filter(conn => {
    // Exclude matching titles
    if (criteria.excludeTitles.length > 0 && matchesAny(conn.position, criteria.excludeTitles)) {
      return false;
    }

    // Exclude matching companies
    if (criteria.excludeCompanies.length > 0 && matchesAny(conn.company, criteria.excludeCompanies)) {
      return false;
    }

    // Filter by date
    if (afterDate) {
      const connDate = parseLinkedInDate(conn.connectedOn);
      if (!connDate || connDate < afterDate) {
        return false;
      }
    }

    return true;
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/bootcamp/connection-qualifier/__tests__/preFilter.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/bootcamp/connection-qualifier/preFilter.ts src/components/bootcamp/connection-qualifier/__tests__/preFilter.test.ts
git commit -m "feat: add pre-filter for LinkedIn connections"
```

---

### Task 5: Create the Supabase edge function `qualify-connections`

**Files:**
- Create: `supabase/functions/qualify-connections/index.ts`

**Step 1: Write the edge function**

Follow the exact pattern from `supabase/functions/generate-icp/index.ts` — same CORS setup, same error handling, same Anthropic API call pattern.

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ALLOWED_ORIGINS = [
  'https://modernagencysales.com',
  'https://www.modernagencysales.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { connections, criteria } = await req.json();

    if (!connections || !Array.isArray(connections) || connections.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing or empty connections array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const connectionsList = connections
      .map((c: { firstName: string; lastName: string; company: string; position: string }, i: number) =>
        `${i}. ${c.firstName} ${c.lastName} | Company: ${c.company} | Position: ${c.position}`
      )
      .join('\n');

    const criteriaText = [
      criteria.targetTitles?.length ? `Target titles: ${criteria.targetTitles.join(', ')}` : '',
      criteria.targetIndustries?.length ? `Target industries/company types: ${criteria.targetIndustries.join(', ')}` : '',
      criteria.freeTextDescription ? `Additional context: ${criteria.freeTextDescription}` : '',
    ].filter(Boolean).join('\n');

    const prompt = `You are a lead qualification assistant. Given ICP criteria and a batch of LinkedIn connections, classify each as qualified or not_qualified.

## ICP Criteria
${criteriaText}

## Connections
${connectionsList}

## Instructions
For each connection, determine if they match the ICP criteria based on their title and company. Use your knowledge of well-known companies to inform your decisions. For unknown companies, make your best judgment based on the company name and the person's title.

Return a JSON array with one object per connection, in the same order:
[
  { "index": 0, "qualification": "qualified", "confidence": "high", "reasoning": "Brief reason" },
  ...
]

qualification: "qualified" or "not_qualified"
confidence: "high" (clear match/non-match), "medium" (likely but uncertain), "low" (guessing)
reasoning: One sentence explaining why.

Return ONLY valid JSON, no markdown or explanation.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-3-5-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      throw new Error(`Claude API error: ${errorText}`);
    }

    const result = await claudeResponse.json();
    const text = result.content?.[0]?.text || '[]';

    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const parsed = JSON.parse(cleanedText);

    return new Response(JSON.stringify({ results: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Connection qualification error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

**Step 2: Commit**

```bash
git add supabase/functions/qualify-connections/index.ts
git commit -m "feat: add qualify-connections edge function for Haiku batch classification"
```

---

### Task 6: Build the CsvUploader component

**Files:**
- Create: `src/components/bootcamp/connection-qualifier/CsvUploader.tsx`

**Step 1: Write the component**

Drag-and-drop file upload zone. Reads the file, parses with `parseLinkedInCsv`, calls `onParsed` with the results. Shows error if parsing fails or no valid rows found.

```typescript
import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { parseLinkedInCsv } from './parseCsv';
import type { LinkedInConnection } from '../../../types/connection-qualifier-types';

interface CsvUploaderProps {
  onParsed: (connections: LinkedInConnection[]) => void;
}

export default function CsvUploader({ onParsed }: CsvUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const connections = parseLinkedInCsv(text);

      if (connections.length === 0) {
        setError('No valid connections found. Make sure this is a LinkedIn connections export.');
        return;
      }

      setFileName(file.name);
      onParsed(connections);
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  }, [onParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Upload LinkedIn Connections</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Export your connections from{' '}
          <a
            href="https://www.linkedin.com/mypreferences/d/download-my-data"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 dark:text-violet-400 underline"
          >
            LinkedIn Data Export
          </a>
          {' '}and upload the Connections CSV file here.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-600'
        }`}
        onClick={() => document.getElementById('csv-file-input')?.click()}
      >
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        {fileName ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-10 h-10 text-violet-500" />
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{fileName}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-600" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Drag & drop your CSV here, or click to browse
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/bootcamp/connection-qualifier/CsvUploader.tsx
git commit -m "feat: add CSV uploader component with drag-and-drop"
```

---

### Task 7: Build the QualificationCriteria component

**Files:**
- Create: `src/components/bootcamp/connection-qualifier/QualificationCriteria.tsx`

**Step 1: Write the component**

Tag input form for target titles, target industries, exclude titles, exclude companies, optional date filter, free-text description. Pre-fills from saved ICP if provided. Uses the same tag-input pattern from `IcpWizard.tsx` (comma-separated input, Enter to add, X to remove).

```typescript
import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import type { QualificationCriteria as CriteriaType } from '../../../types/connection-qualifier-types';
import { DEFAULT_EXCLUDE_TITLES } from '../../../types/connection-qualifier-types';
import type { MemberICP } from '../../../types/gc-types';

interface QualificationCriteriaProps {
  savedIcp: MemberICP | null;
  onSubmit: (criteria: CriteriaType) => void;
  onBack: () => void;
}

function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = input.trim().replace(/,$/, '');
      if (trimmed && !tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
        onAdd(trimmed);
      }
      setInput('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs rounded-full"
          >
            {tag}
            <button onClick={() => onRemove(i)} className="hover:text-violet-900 dark:hover:text-violet-200">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={() => {
            const trimmed = input.trim();
            if (trimmed && !tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
              onAdd(trimmed);
            }
            setInput('');
          }}
          className="px-3 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function QualificationCriteria({ savedIcp, onSubmit, onBack }: QualificationCriteriaProps) {
  const [targetTitles, setTargetTitles] = useState<string[]>([]);
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);
  const [excludeTitles, setExcludeTitles] = useState<string[]>([...DEFAULT_EXCLUDE_TITLES]);
  const [excludeCompanies, setExcludeCompanies] = useState<string[]>([]);
  const [connectedAfter, setConnectedAfter] = useState<string>('');
  const [freeTextDescription, setFreeTextDescription] = useState('');

  // Pre-fill from saved ICP
  useEffect(() => {
    if (savedIcp) {
      if (savedIcp.jobTitles) {
        setTargetTitles(savedIcp.jobTitles.split(',').map(t => t.trim()).filter(Boolean));
      }
      if (savedIcp.verticals) {
        setTargetIndustries(savedIcp.verticals.split(',').map(t => t.trim()).filter(Boolean));
      }
      if (savedIcp.targetDescription) {
        setFreeTextDescription(savedIcp.targetDescription);
      }
    }
  }, [savedIcp]);

  const isValid = targetTitles.length > 0 || targetIndustries.length > 0 || freeTextDescription.trim().length > 0;

  const handleSubmit = () => {
    onSubmit({
      targetTitles,
      targetIndustries,
      excludeTitles,
      excludeCompanies,
      connectedAfter: connectedAfter || null,
      freeTextDescription,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Define Your Qualification Criteria</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Tell us who you're looking for. We'll filter out the noise and AI-qualify the rest.
          {savedIcp && (
            <span className="text-violet-600 dark:text-violet-400"> Pre-filled from your saved ICP.</span>
          )}
        </p>
      </div>

      <div className="space-y-5">
        <TagInput
          label="Target Job Titles"
          tags={targetTitles}
          onAdd={(t) => setTargetTitles([...targetTitles, t])}
          onRemove={(i) => setTargetTitles(targetTitles.filter((_, idx) => idx !== i))}
          placeholder="e.g. CEO, Founder, VP Sales — press Enter to add"
        />

        <TagInput
          label="Target Industries / Company Types"
          tags={targetIndustries}
          onAdd={(t) => setTargetIndustries([...targetIndustries, t])}
          onRemove={(i) => setTargetIndustries(targetIndustries.filter((_, idx) => idx !== i))}
          placeholder="e.g. SaaS, Marketing Agency — press Enter to add"
        />

        <TagInput
          label="Exclude Job Titles"
          tags={excludeTitles}
          onAdd={(t) => setExcludeTitles([...excludeTitles, t])}
          onRemove={(i) => setExcludeTitles(excludeTitles.filter((_, idx) => idx !== i))}
          placeholder="e.g. Recruiter, HR — press Enter to add"
        />

        <TagInput
          label="Exclude Companies"
          tags={excludeCompanies}
          onAdd={(t) => setExcludeCompanies([...excludeCompanies, t])}
          onRemove={(i) => setExcludeCompanies(excludeCompanies.filter((_, idx) => idx !== i))}
          placeholder="e.g. Self-employed, Freelance — press Enter to add"
        />

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Connected After (optional)
          </label>
          <input
            type="date"
            value={connectedAfter}
            onChange={(e) => setConnectedAfter(e.target.value)}
            className="px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Additional Context (optional)
          </label>
          <textarea
            value={freeTextDescription}
            onChange={(e) => setFreeTextDescription(e.target.value)}
            rows={3}
            placeholder="e.g. I'm looking for B2B SaaS founders scaling past $1M ARR who might need help with outbound sales"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="px-6 py-2.5 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/bootcamp/connection-qualifier/QualificationCriteria.tsx
git commit -m "feat: add qualification criteria form with ICP pre-fill and tag inputs"
```

---

### Task 8: Build the ProcessingProgress component

**Files:**
- Create: `src/components/bootcamp/connection-qualifier/ProcessingProgress.tsx`

**Step 1: Write the component**

Shows a progress bar and batch counter. Receives `completedBatches` and `totalBatches` as props.

```typescript
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingProgressProps {
  completedBatches: number;
  totalBatches: number;
  qualifiedSoFar: number;
  processedSoFar: number;
}

export default function ProcessingProgress({
  completedBatches,
  totalBatches,
  qualifiedSoFar,
  processedSoFar,
}: ProcessingProgressProps) {
  const progress = totalBatches > 0 ? Math.round((completedBatches / totalBatches) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Qualifying Connections...</h2>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          <span>Batch {completedBatches} of {totalBatches}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{processedSoFar.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Processed</p>
        </div>
        <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-900/10">
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{qualifiedSoFar.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Qualified so far</p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/bootcamp/connection-qualifier/ProcessingProgress.tsx
git commit -m "feat: add processing progress component"
```

---

### Task 9: Build the QualificationResults component

**Files:**
- Create: `src/components/bootcamp/connection-qualifier/QualificationResults.tsx`

**Step 1: Write the component**

Summary stats and a download CSV button. Uses `generateOutputCsv` helper to build the output.

```typescript
import React, { useCallback } from 'react';
import { Download, CheckCircle2, RotateCcw } from 'lucide-react';
import type { QualifiedConnection } from '../../../types/connection-qualifier-types';

interface QualificationResultsProps {
  totalParsed: number;
  preFiltered: number;
  results: QualifiedConnection[];
  onStartOver: () => void;
}

function generateOutputCsv(connections: QualifiedConnection[]): string {
  const headers = ['First Name', 'Last Name', 'URL', 'Email Address', 'Company', 'Position', 'Connected On', 'Qualification', 'Confidence', 'Reasoning'];
  const rows = connections.map(c => [
    c.firstName,
    c.lastName,
    c.url,
    c.emailAddress,
    c.company,
    c.position,
    c.connectedOn,
    c.qualification,
    c.confidence,
    `"${c.reasoning.replace(/"/g, '""')}"`,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export default function QualificationResults({ totalParsed, preFiltered, results, onStartOver }: QualificationResultsProps) {
  const qualified = results.filter(r => r.qualification === 'qualified');
  const notQualified = results.filter(r => r.qualification === 'not_qualified');
  const highConfidence = qualified.filter(r => r.confidence === 'high');

  const handleDownloadAll = useCallback(() => {
    const csv = generateOutputCsv(results);
    downloadCsv(csv, 'qualified-connections-all.csv');
  }, [results]);

  const handleDownloadQualified = useCallback(() => {
    const csv = generateOutputCsv(qualified);
    downloadCsv(csv, 'qualified-connections.csv');
  }, [qualified]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Qualification Complete</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Connections" value={totalParsed} />
        <StatCard label="Pre-filtered Out" value={totalParsed - preFiltered} />
        <StatCard label="Qualified" value={qualified.length} color="green" />
        <StatCard label="High Confidence" value={highConfidence.length} color="violet" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadQualified}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Qualified ({qualified.length})
        </button>
        <button
          onClick={handleDownloadAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download All with Scores ({results.length})
        </button>
        <button
          onClick={onStartOver}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: 'green' | 'violet' }) {
  const valueClass = color === 'green'
    ? 'text-green-600 dark:text-green-400'
    : color === 'violet'
    ? 'text-violet-600 dark:text-violet-400'
    : 'text-zinc-900 dark:text-white';

  return (
    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
      <p className={`text-2xl font-bold ${valueClass}`}>{value.toLocaleString()}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Step 2: Commit**

```bash
git add src/components/bootcamp/connection-qualifier/QualificationResults.tsx
git commit -m "feat: add qualification results with stats and CSV download"
```

---

### Task 10: Build the main ConnectionQualifier orchestrator

**Files:**
- Create: `src/components/bootcamp/connection-qualifier/ConnectionQualifier.tsx`

**Step 1: Write the component**

Manages step state (upload → criteria → preview → processing → results). Handles the batch qualification loop: chunks connections into groups of 50, calls the edge function for each, tracks progress, collects results.

```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { fetchMemberICP } from '../../../services/supabase';
import CsvUploader from './CsvUploader';
import QualificationCriteria from './QualificationCriteria';
import ProcessingProgress from './ProcessingProgress';
import QualificationResults from './QualificationResults';
import { preFilterConnections } from './preFilter';
import type {
  LinkedInConnection,
  QualificationCriteria as CriteriaType,
  QualifiedConnection,
  QualifierStep,
  QualificationResult,
} from '../../../types/connection-qualifier-types';
import type { MemberICP } from '../../../types/gc-types';
import { ArrowRight, Filter } from 'lucide-react';

const BATCH_SIZE = 50;

interface ConnectionQualifierProps {
  userId: string;
}

export default function ConnectionQualifier({ userId }: ConnectionQualifierProps) {
  const [step, setStep] = useState<QualifierStep>('upload');
  const [connections, setConnections] = useState<LinkedInConnection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<LinkedInConnection[]>([]);
  const [criteria, setCriteria] = useState<CriteriaType | null>(null);
  const [savedIcp, setSavedIcp] = useState<MemberICP | null>(null);
  const [results, setResults] = useState<QualifiedConnection[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Progress tracking
  const [completedBatches, setCompletedBatches] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [qualifiedSoFar, setQualifiedSoFar] = useState(0);
  const [processedSoFar, setProcessedSoFar] = useState(0);

  // Load saved ICP on mount
  useEffect(() => {
    if (userId) {
      fetchMemberICP(userId).then(icp => {
        if (icp) setSavedIcp(icp);
      });
    }
  }, [userId]);

  const handleParsed = useCallback((parsed: LinkedInConnection[]) => {
    setConnections(parsed);
    setStep('criteria');
  }, []);

  const handleCriteriaSubmit = useCallback((c: CriteriaType) => {
    setCriteria(c);
    const filtered = preFilterConnections(connections, c);
    setFilteredConnections(filtered);
    setStep('preview');
  }, [connections]);

  const handleRunQualification = useCallback(async () => {
    if (!criteria || filteredConnections.length === 0) return;

    setStep('processing');
    setError(null);

    const batches: LinkedInConnection[][] = [];
    for (let i = 0; i < filteredConnections.length; i += BATCH_SIZE) {
      batches.push(filteredConnections.slice(i, i + BATCH_SIZE));
    }

    setTotalBatches(batches.length);
    setCompletedBatches(0);
    setQualifiedSoFar(0);
    setProcessedSoFar(0);

    const allResults: QualifiedConnection[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        const { data, error: fnError } = await supabase.functions.invoke('qualify-connections', {
          body: {
            connections: batch.map(c => ({
              firstName: c.firstName,
              lastName: c.lastName,
              company: c.company,
              position: c.position,
            })),
            criteria: {
              targetTitles: criteria.targetTitles,
              targetIndustries: criteria.targetIndustries,
              freeTextDescription: criteria.freeTextDescription,
            },
          },
        });

        if (fnError) throw fnError;

        const batchResults: QualificationResult[] = data.results || [];

        batch.forEach((conn, idx) => {
          const result = batchResults[idx];
          allResults.push({
            ...conn,
            qualification: result?.qualification || 'not_qualified',
            confidence: result?.confidence || 'low',
            reasoning: result?.reasoning || 'No result returned',
          });
        });

        const newQualified = batchResults.filter((r: QualificationResult) => r?.qualification === 'qualified').length;
        setCompletedBatches(i + 1);
        setProcessedSoFar(prev => prev + batch.length);
        setQualifiedSoFar(prev => prev + newQualified);
      } catch (err) {
        console.error(`Batch ${i + 1} failed:`, err);
        // Mark failed batch connections as low-confidence not_qualified
        batch.forEach(conn => {
          allResults.push({
            ...conn,
            qualification: 'not_qualified',
            confidence: 'low',
            reasoning: 'Batch processing failed — retry recommended',
          });
        });
        setCompletedBatches(i + 1);
        setProcessedSoFar(prev => prev + batch.length);
      }
    }

    setResults(allResults);
    setStep('results');
  }, [criteria, filteredConnections]);

  const handleStartOver = useCallback(() => {
    setStep('upload');
    setConnections([]);
    setFilteredConnections([]);
    setCriteria(null);
    setResults([]);
    setError(null);
    setCompletedBatches(0);
    setTotalBatches(0);
    setQualifiedSoFar(0);
    setProcessedSoFar(0);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Connection Qualifier</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Upload your LinkedIn connections and find the ones worth reaching out to.
        </p>
      </div>

      {step === 'upload' && <CsvUploader onParsed={handleParsed} />}

      {step === 'criteria' && (
        <QualificationCriteria
          savedIcp={savedIcp}
          onSubmit={handleCriteriaSubmit}
          onBack={() => setStep('upload')}
        />
      )}

      {step === 'preview' && criteria && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Pre-filter Summary</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Review the numbers before running AI qualification.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{connections.length.toLocaleString()}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Connections</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-2xl font-bold text-red-500">{(connections.length - filteredConnections.length).toLocaleString()}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Pre-filtered Out</p>
            </div>
            <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-900/10">
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{filteredConnections.length.toLocaleString()}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Sending to AI</p>
            </div>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {Math.ceil(filteredConnections.length / BATCH_SIZE)} batches will be processed.
          </p>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('criteria')}
              className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleRunQualification}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Run Qualification
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <ProcessingProgress
          completedBatches={completedBatches}
          totalBatches={totalBatches}
          qualifiedSoFar={qualifiedSoFar}
          processedSoFar={processedSoFar}
        />
      )}

      {step === 'results' && (
        <QualificationResults
          totalParsed={connections.length}
          preFiltered={filteredConnections.length}
          results={results}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/bootcamp/connection-qualifier/ConnectionQualifier.tsx
git commit -m "feat: add connection qualifier orchestrator with batch processing"
```

---

### Task 11: Wire into BootcampApp and Sidebar

**Files:**
- Modify: `pages/bootcamp/BootcampApp.tsx` (add lazy import + virtual lesson rendering)
- Modify: `components/bootcamp/Sidebar.tsx` (add sidebar button next to TAM Builder)

**Step 1: Add lazy import to BootcampApp.tsx**

At line 41 (after the TamBuilder lazy import), add:

```typescript
const ConnectionQualifier = lazy(() => import('../../components/bootcamp/connection-qualifier/ConnectionQualifier'));
```

**Step 2: Add virtual lesson rendering in BootcampApp.tsx**

At line 545, the current chain is:
```
virtual:tam-builder → virtual:my-posts → LessonView
```

Change to:
```
virtual:tam-builder → virtual:connection-qualifier → virtual:my-posts → LessonView
```

After line 554 (closing `</Suspense>`), before the `virtual:my-posts` check, add:

```typescript
) : currentLesson.id === 'virtual:connection-qualifier' ? (
  <Suspense
    fallback={
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }
  >
    <ConnectionQualifier userId={bootcampStudent?.id || ''} />
  </Suspense>
```

**Step 3: Add sidebar button in Sidebar.tsx**

After the TAM Builder button (after line 345, before the closing `</div>` of the GPTs group), add a Connection Qualifier button following the exact same pattern:

```typescript
<button
  onClick={() => {
    onSelectLesson({
      id: 'virtual:connection-qualifier',
      title: 'Connection Qualifier',
      embedUrl: 'virtual:connection-qualifier',
    });
    onCloseMobile();
  }}
  className={`flex items-center w-full py-1.5 px-3 rounded-lg text-[11px] transition-all ${
    currentLessonId === 'virtual:connection-qualifier'
      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium'
      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
  }`}
>
  <span
    className={`mr-2.5 shrink-0 ${
      currentLessonId === 'virtual:connection-qualifier'
        ? 'text-violet-500'
        : 'text-zinc-400 dark:text-zinc-600'
    }`}
  >
    <Users size={14} />
  </span>
  <span className="truncate">Connection Qualifier</span>
</button>
```

Note: `Users` icon is already imported in `Sidebar.tsx` (from the Explore agent findings, it's in the imports). If not, add it to the lucide-react import.

**Step 4: Verify the app builds**

Run: `npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add pages/bootcamp/BootcampApp.tsx components/bootcamp/Sidebar.tsx
git commit -m "feat: wire connection qualifier into bootcamp sidebar and routing"
```

---

### Task 12: Manual smoke test

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test the full flow**

1. Log in as a bootcamp student
2. Click "Connection Qualifier" in the sidebar
3. Upload the sample CSV at `/Users/timlife/Downloads/Untitled spreadsheet - Connections.csv`
4. Verify it parses and shows the criteria form
5. Add some target titles (e.g. "CEO", "Founder")
6. Continue to preview — verify pre-filter stats
7. Run qualification — verify progress bar works
8. Download the qualified CSV — verify it has the extra columns

**Step 3: Final commit if any fixes needed**
