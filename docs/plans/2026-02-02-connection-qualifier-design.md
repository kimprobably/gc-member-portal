# LinkedIn Connection Qualifier — V1 Design

## Purpose

Bootcamp tool that lets students upload their LinkedIn connections export CSV and get back a qualified list of people worth reaching out to, based on their ICP criteria. Hybrid approach: cheap pre-filters strip obvious junk, then Claude Haiku AI-qualifies the rest in batches.

## User Flow

1. Navigate to `/bootcamp/ai-tools/connection-qualifier`
2. **Upload** — Drop or select LinkedIn CSV. Parser auto-detects header row (skips LinkedIn's preamble junk rows).
3. **Define criteria** — Pre-filled from saved ICP if one exists. Form includes:
   - Target titles (tag input)
   - Target industries/company types (tag input)
   - Exclude titles (tag input, defaults: Student, Intern, Retired, Unemployed, Seeking)
   - Exclude companies (tag input)
   - Date range filter (optional — connected after X date)
   - Free-text description (optional)
4. **Pre-filter summary** — Shows stats: total parsed, removed by filters, remaining for AI. "Run Qualification" button.
5. **Processing** — Progress bar as batches complete.
6. **Results** — Summary stats + download CSV button.

Output CSV keeps original columns and adds: `Qualification`, `Confidence`, `Reasoning`.

## Architecture

### No database tables. Stateless: upload → process → download.

### Components

```
src/components/bootcamp/connection-qualifier/
├── ConnectionQualifier.tsx    — Step orchestrator
├── CsvUploader.tsx            — Drag/drop + CSV parsing (Papa Parse)
├── QualificationCriteria.tsx  — ICP criteria form
├── ProcessingProgress.tsx     — Batch progress display
└── QualificationResults.tsx   — Stats + download
```

### Processing Flow

```
CSV file (client-side)
  → Papa Parse: skip preamble, extract rows
  → Pre-filter: excluded titles, companies, date range, empty rows
  → Batch remaining into chunks of 50
  → Each batch → Supabase edge function → Claude Haiku
  → Collect results, merge with original data
  → Generate output CSV in browser → download
```

### Edge Function: `qualify-connections`

**Input:**
```json
{
  "connections": [
    { "firstName": "Kenny", "lastName": "Damian", "company": "ColdIQ", "position": "GTM Engineer" }
  ],
  "criteria": {
    "targetTitles": ["CEO", "Founder"],
    "targetIndustries": ["SaaS"],
    "freeTextDescription": "B2B SaaS founders scaling past $1M ARR"
  }
}
```

**Output:**
```json
{
  "results": [
    { "index": 0, "qualification": "qualified", "confidence": "high", "reasoning": "GTM Engineer at ColdIQ, a known B2B sales tech company" }
  ]
}
```

**Model:** claude-haiku-3-5-20241022

**Cost:** ~$0.10-0.30 for 20k connections after pre-filtering.

## CSV Parsing

LinkedIn exports have 3 junk rows before headers. Parser scans for the row containing `First Name,Last Name,URL,Email Address,Company,Position,Connected On` and treats everything after as data.

Uses Papa Parse (client-side).

## Pre-filter Rules (case-insensitive, partial match)

- **Exclude titles:** Position contains any excluded term
- **Exclude companies:** Company contains any excluded term
- **Date range:** Connected On after selected date
- **Empty rows:** No Position AND no Company → skip

## Route & Access

- Route: `/bootcamp/ai-tools/connection-qualifier`
- Added to AI tools grid in OnboardingAITools.tsx
- Lazy-loaded from BootcampApp.tsx
- Requires bootcamp student auth (existing route guards)
- No subscription gating for V1
- Loads saved ICP from member_icps if available

## Dependencies

- `papaparse` — CSV parsing

## Out of Scope (V2)

- Web enrichment (Google search / LinkedIn scrape per connection)
- In-app results table with filtering
- Persistence / history of past qualification runs
- Deep enrich for medium/low confidence results
- Integration with leadmagnet-backend enrichment pipeline
