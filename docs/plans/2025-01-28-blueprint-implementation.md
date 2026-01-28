# Blueprint Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Blueprint lead magnet frontend within GTM OS

**Design Doc:** `docs/plans/2025-01-28-blueprint-feature-design.md`

**Tech Stack:** React, TypeScript, Tailwind, Supabase, Recharts (radar chart), Cal.com embed

---

## Phase 1: Foundation (Types + Service + Routes)

### Task 1.1: Create Blueprint Types

**Files:**
- Create: `types/blueprint-types.ts`

Define types for: `Prospect`, `ProspectPost`, `BlueprintSettings`, `BlueprintContentBlock`, `RecommendedOffer`

Reference the SUPABASE_FIELDS.md doc at `/Users/timlife/linkedin-leadmagnet-backend/docs/SUPABASE_FIELDS.md` for field mappings.

---

### Task 1.2: Create Blueprint Service

**Files:**
- Create: `services/blueprint-supabase.ts`

Functions needed:
- `getProspectBySlug(slug)` - fetch prospect + handle 404
- `getProspectPosts(prospectId)` - fetch from posts table
- `getBlueprintSettings()` - fetch global settings
- `getContentBlock(key)` / `getAllContentBlocks()`
- `updateProspectOffer(id, {unlocked, recommended, note})`
- `listProspects(filters)` - for admin
- `generateSlug(fullName)` - create name-slug-xxxx format

Follow patterns in `services/bootcamp-supabase.ts`.

---

### Task 1.3: Add Query Keys

**Files:**
- Modify: `lib/queryClient.ts`

Add blueprint query keys:
```typescript
// Blueprint
blueprintProspect: (slug: string) => ['blueprint', 'prospect', slug],
blueprintPosts: (prospectId: string) => ['blueprint', 'posts', prospectId],
blueprintSettings: () => ['blueprint', 'settings'],
blueprintContentBlocks: () => ['blueprint', 'contentBlocks'],
blueprintAdminProspects: () => ['blueprint', 'admin', 'prospects'],
```

---

### Task 1.4: Add Routes

**Files:**
- Modify: `App.tsx`

Add routes:
```tsx
<Route path="/blueprint/:slug" element={<BlueprintPage />} />
<Route path="/blueprint/:slug/offer" element={<OfferPage />} />
// Admin route under existing admin layout
<Route path="blueprints" element={<AdminBlueprintsPage />} />
```

---

## Phase 2: Blueprint Page Components

### Task 2.1: Blueprint Page Shell

**Files:**
- Create: `components/blueprint/BlueprintPage.tsx`

Fetch prospect by slug, handle loading/error/404 states. Render sections in order.

---

### Task 2.2: Blueprint Header

**Files:**
- Create: `components/blueprint/BlueprintHeader.tsx`

Display: profile_photo, full_name, company, job_title, authority_score (large), score_summary.

---

### Task 2.3: Score Radar Chart

**Files:**
- Create: `components/blueprint/ScoreRadar.tsx`

Use Recharts RadarChart with 5 axes. Data from `score_profile_optimization`, `score_content_presence`, `score_outbound_systems`, `score_inbound_infrastructure`, `score_social_proof`.

---

### Task 2.4: Analysis Section

**Files:**
- Create: `components/blueprint/AnalysisSection.tsx`

Three sub-sections:
- What's Working (3 green cards from `whats_working_1/2/3`)
- Revenue Leaks (3 red cards from `revenue_leaks_1/2/3`)
- Bottom Line (callout box from `bottom_line`)

---

### Task 2.5: Profile Rewrite

**Files:**
- Create: `components/blueprint/ProfileRewrite.tsx`

Before/after comparison for headline and bio. Tabs for headline variants (outcome, authority, hybrid).

---

### Task 2.6: Lead Magnets

**Files:**
- Create: `components/blueprint/LeadMagnets.tsx`

3 expandable cards from `lm_card_1/2/3`. Show content_type badge, headline, subheadline, match, est_hours. Expand to show `lead_mag_*` description and `lm_post_*`.

---

### Task 2.7: Content Roadmap

**Files:**
- Create: `components/blueprint/ContentRoadmap.tsx`

Grid of posts from `posts` table. Each card: name, first_sentence preview, copy button, expandable full content.

---

### Task 2.8: Marketing Block Component

**Files:**
- Create: `components/blueprint/MarketingBlock.tsx`

Renders content from `blueprint_content_blocks` by key. Supports markdown rendering.

---

### Task 2.9: CTA Components

**Files:**
- Create: `components/blueprint/CTAButton.tsx`
- Create: `components/blueprint/StickyCTA.tsx`
- Create: `components/blueprint/CalEmbed.tsx`

CTAButton: contextual CTA with customizable copy.
StickyCTA: fixed bottom bar, hides when Cal embed in view.
CalEmbed: Cal.com inline embed.

---

## Phase 3: Offer Page

### Task 3.1: Offer Page

**Files:**
- Create: `components/blueprint/OfferPage.tsx`
- Create: `components/blueprint/OfferCard.tsx`

Check `offer_unlocked` - show "not available" if false.
Display recommended offer prominently, other offer collapsed.
Include seller's personalized note.

---

## Phase 4: Admin Dashboard

### Task 4.1: Admin Blueprints Page

**Files:**
- Create: `components/admin/blueprints/AdminBlueprintsPage.tsx`
- Create: `components/admin/blueprints/BlueprintTable.tsx`

List prospects with search/filter. Columns: name, score, status, offer status, actions.

---

### Task 4.2: Blueprint Detail Panel

**Files:**
- Create: `components/admin/blueprints/BlueprintDetailPanel.tsx`

Slide-out panel with:
- Blueprint URL + copy button
- Offer unlock toggle
- Recommended offer dropdown
- Personal note field
- Quick stats

---

### Task 4.3: Blueprint Settings Modal

**Files:**
- Create: `components/admin/blueprints/BlueprintSettingsModal.tsx`

Global settings: sticky CTA toggle, payment links.

---

### Task 4.4: Content Editor

**Files:**
- Create: `components/admin/blueprints/ContentEditor.tsx`

Edit marketing blocks: Allbound System, Bootcamp Pitch, FAQs, CTA copy.

---

## Phase 5: Account Linking

### Task 5.1: Auto-link on Registration

**Files:**
- Modify: `services/bootcamp-supabase.ts` (registerBootcampStudent function)

After creating student, check if email matches any prospect. If yes, set `students.prospect_id`.

---

### Task 5.2: Manual Claim in LMS Settings

**Files:**
- Create: `components/bootcamp/settings/BlueprintConnect.tsx`

If linked: show connected Blueprint info.
If not: input to enter Blueprint URL/code and connect.

---

## Phase 6: Database Migrations

### Task 6.1: Add Fields to Existing Tables

SQL migrations needed:
- Add to `prospects`: `slug`, `offer_unlocked`, `recommended_offer`, `offer_note`
- Add to `bootcamp_students`: `prospect_id` (FK)

---

### Task 6.2: Create New Tables

- `blueprint_settings` (id, key, value, updated_at)
- `blueprint_content_blocks` (id, block_key, content, updated_at)

---

## Execution Order

1. Phase 6 (DB migrations) - run these first
2. Phase 1 (Foundation) - types, service, routes
3. Phase 2 (Blueprint Page) - all components
4. Phase 3 (Offer Page)
5. Phase 4 (Admin)
6. Phase 5 (Account Linking)

---

## Testing Checklist

- [ ] Blueprint page loads with valid slug
- [ ] 404 for invalid slug
- [ ] All sections render with real data
- [ ] Copy buttons work
- [ ] Cal.com embed loads
- [ ] Sticky CTA shows/hides correctly
- [ ] Offer page blocked when not unlocked
- [ ] Admin can toggle offer unlock
- [ ] Admin can edit marketing content
- [ ] Auto-linking works on registration
- [ ] Manual claim works
