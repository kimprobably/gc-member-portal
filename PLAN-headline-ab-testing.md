# Autonomous Headline A/B Testing System

## Overview

Self-running system that tests two headlines at a time, picks the winner via statistical significance, then generates a new AI challenger. Runs indefinitely with zero manual intervention.

## Flow

```
Page load → fetch active test → assign variant (cookie-sticky) → track impression
  → user completes questionnaire → track conversion
  → every 6hrs: cron checks significance → if winner found:
      promote winner → AI generates new challenger → start new test
```

## Database (copy-of-gtm-os Supabase)

**New migration: `supabase/migrations/20260202000000_headline_ab_testing.sql`**

3 tables:

- `headline_tests` — id, status (active/completed/archived), champion_variant_id, min_sample_size (default 50), confidence_level, started_at, completed_at, winner_variant_id
- `headline_variants` — id, test_id (FK), headline_text, subtitle_text, status (active/champion/challenger/retired), impressions, conversions, conversion_rate (generated), source (manual/ai_generated/seed), generation_prompt, created_by
- `headline_events` — id, variant_id (FK), event_type (impression/conversion), session_id, metadata (JSONB), created_at

RLS: public SELECT on tests/variants, public INSERT on events. Seed current headline as first champion + create initial test.

## Frontend Changes (copy-of-gtm-os)

### New file: `services/headline-ab-test.ts`

- `getActiveTest()` — fetch active test with its 2 variants from Supabase
- `assignVariant(test)` — check cookie `blueprint_ab_variant`; if set and matches test, reuse; otherwise random 50/50 assignment, set cookie (30-day expiry)
- `trackImpression(variantId, sessionId)` — INSERT into headline_events
- `trackConversion(variantId, sessionId, metadata)` — INSERT into headline_events

Uses `document.cookie` directly (no library needed for one cookie).

### Modified: `components/blueprint/BlueprintLandingPage.tsx`

1. **Hero component** — accept optional `headline`/`subtitle` props; if provided, render those instead of static text
2. **BlueprintLandingPage** — add state for variant; on mount fetch active test, assign variant, track impression; pass headline to Hero
3. **handleQuestionnaireComplete** — after successful webhook POST, call `trackConversion()`
4. **Fallback** — if no active test or fetch fails, show current static headline (zero risk)

## Backend Changes (gtm-system)

### New file: `src/lib/integrations/headline-generator.ts`

Uses existing Anthropic SDK pattern (singleton client). Prompt gives Claude the champion headline + its conversion rate, asks for one new challenger. Uses `claude-haiku-4-20250414` (fast + cheap, copywriting doesn't need Opus).

### New file: `src/lib/experiments/significance.ts`

Chi-squared test implementation. Pure math, no dependencies needed — the formula is simple enough to implement directly (~20 lines). Returns `{ isSignificant, pValue, winner }`.

### New file: `src/trigger/check-headline-test.ts`

Trigger.dev scheduled task (every 6 hours):
1. Fetch active tests with variants
2. Skip if either variant below min_sample_size
3. Run chi-squared test
4. If significant: mark test complete, promote winner, retire loser
5. Generate new challenger headline via AI
6. Create new test with winner (champion) + new headline (challenger)
7. Log everything

No separate generate task needed — the cron does it all inline since headline generation is fast (~1 second).

### Modified: `src/app/api/webhooks/blueprint-form/route.ts`

No changes needed. The frontend tracks conversions directly to Supabase, not through the webhook. This keeps the systems decoupled.

## Implementation Order

1. **Migration** — create tables, seed current headline
2. **`services/headline-ab-test.ts`** — frontend service layer
3. **`BlueprintLandingPage.tsx`** — integrate dynamic headline + tracking
4. **`src/lib/experiments/significance.ts`** — chi-squared test
5. **`src/lib/integrations/headline-generator.ts`** — AI generation
6. **`src/trigger/check-headline-test.ts`** — autonomous cron
7. **Deploy Trigger.dev task** — `npx trigger.dev@4.3.3 deploy`

## Verification

1. Load `/blueprint` — should see current headline (fetched from DB, not hardcoded)
2. Open incognito — may see different variant if test has two active variants
3. Check `blueprint_ab_variant` cookie exists with variant_id
4. Complete questionnaire — check `headline_events` table has impression + conversion rows
5. Manually set variant impressions/conversions in DB to trigger significance → run cron → verify new test created with AI-generated challenger
6. Test fallback: delete all tests from DB → page still loads with static fallback headline
