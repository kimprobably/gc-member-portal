# Cohort Curriculum Setup - In Progress

## Status: Code Complete, Airtable Table Needed

## What's Done ✅

### Code Changes in `/services/airtable.ts`
- Added `CohortCurriculumFields` interface (lines 20-25)
- Added `COHORT_CURRICULUM_TABLE` constant (line 39)
- Added `fetchCohortCurriculum()` function (lines 100-142)
- Modified `fetchCourseData()` to use cohort-aware sorting (lines 224-243)

### MCP Setup
- Airtable MCP server configured and connected

## What's Needed 📋

### Create Airtable Table: `Cohort Curriculum`

**Fields to create:**
| Field Name | Type | Notes |
|------------|------|-------|
| Cohort | Single line text | e.g., "Global", "January" |
| Week | Single line text | Must match Week field in Lessons table |
| Sort Order | Number | Display order (1, 2, 3...) |
| Is Visible | Checkbox | Default checked |

### Add Initial Data

**Global configuration (default for all cohorts):**
Add one row per week with default ordering. Example:

| Cohort | Week | Sort Order | Is Visible |
|--------|------|------------|------------|
| Global | Welcome & Setup | 1 | ✓ |
| Global | Week 1 | 2 | ✓ |
| Global | Week 2 | 3 | ✓ |
| Global | Week 3 | 4 | ✓ |

**Cohort-specific (optional):**
Only add rows for cohorts that need different ordering.

## Resume Instructions

When Claude Code restarts, say:

> "Create the Cohort Curriculum table in Airtable using MCP. Base ID: appxQJMeJCq5tqgjW"

Or manually create the table in Airtable UI following the schema above.

## How It Works

1. If cohort has entries in `Cohort Curriculum` → use that cohort's order/visibility
2. If cohort has no entries → fall back to "Global" configuration
3. If no Global entries → fall back to alphabetical (original behavior)
