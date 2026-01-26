# AI Tools Access & Subscription System Design

## Overview

Students get 8 weeks of AI tools access (4 weeks during bootcamp + 4 weeks after). After that, tools become read-only unless they subscribe to the $300/month membership which includes AI tools, group coaching, and community access.

## Access Model

### Timeline

```
Cohort Start                    Cohort End        Access Expires
    |-------- 4 weeks -------------|---- 4 weeks ----|
    |        FULL ACCESS           |   FULL ACCESS   |  READ-ONLY
    |                              |   (warnings in  |  (unless subscribed)
    |                              |    final week)  |
```

### Access States

| State | Condition | Behavior |
|-------|-----------|----------|
| `active` | Within 8-week window OR subscribed | Full AI tools access |
| `expiring` | Final 7 days of 8-week window | Full access + warning banners |
| `expired` | Past 8 weeks, no subscription | Read-only (view history, can't send messages) |
| `subscribed` | Has active subscription | Full access, ignores expiration date |

### Calculation

```
accessExpiresAt = cohort.endDate + 4 weeks
isExpiring = now > (accessExpiresAt - 7 days) AND now < accessExpiresAt
isExpired = now > accessExpiresAt AND subscriptionStatus != 'active'
```

## Data Model

### Student Table Additions

```sql
ALTER TABLE bootcamp_students ADD COLUMN
  subscription_status TEXT DEFAULT 'none'
    CHECK (subscription_status IN ('none', 'active', 'canceled', 'past_due')),
  subscription_id TEXT,
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT;
```

### Multi-Cohort Junction Table

```sql
CREATE TABLE student_cohorts (
  student_id UUID REFERENCES bootcamp_students(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES lms_cohorts(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, cohort_id)
);
```

### Subscription Events (Audit Log)

```sql
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES bootcamp_students(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'paid', 'canceled', 'payment_failed')),
  stripe_event_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Cohort Structure

| Cohort | Type | Who Sees It | Contains |
|--------|------|-------------|----------|
| Resources | Global | All students | AI tools, Clay tables, access links |
| January 2026, etc. | Bootcamp | Assigned students | Weekly curriculum |
| Members | Subscription | Subscribed students | Coaching calls, member resources |

Every student is automatically added to:
- "Resources" cohort (always)
- Their bootcamp cohort (on enrollment)
- "Members" cohort (on subscription)

## Stripe Integration

### Setup

- Product: "GTM OS Membership"
- Price: $300/month recurring
- Use Stripe Checkout (hosted) for payment

### Payment Flow

```
Student clicks "Subscribe"
    ↓
POST /api/create-checkout-session
    ↓
Create Stripe Checkout Session with:
  - customer_email: student.email
  - price: membership price ID
  - success_url: /subscription/success
  - cancel_url: /subscription/cancel
  - metadata: { student_id }
    ↓
Redirect to Stripe Checkout
    ↓
Payment succeeds → Stripe fires webhook
    ↓
POST /api/webhooks/stripe handles:
  1. Update student.subscription_status → 'active'
  2. Store stripe_customer_id, subscription_id
  3. Add student to "Members" cohort
    ↓
Redirect to portal with success message
```

### Webhook Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Set status='active', store IDs, add to Members cohort |
| `invoice.paid` | Log event, ensure status='active' |
| `invoice.payment_failed` | Set status='past_due', send warning |
| `customer.subscription.deleted` | Set status='canceled', set subscription_ends_at |

## Student-Facing UI

### Warning Banner (Final 7 Days)

- Amber banner at top of AI tools section
- Text: "Your AI tools access expires in X days. Subscribe to keep access + get coaching."
- Dismissable per session
- "Subscribe" button

### Expired State (Read-Only)

- Past conversations visible but grayed out
- Input disabled with overlay
- Modal on interaction attempt:
  - "Your free access has ended"
  - Value prop: AI tools + weekly coaching + community
  - Buttons: "Subscribe Now" / "Maybe Later"

### Subscribed State

- Green "Member" badge in sidebar/header
- Full access to AI tools
- "Members" section visible in sidebar
- No warnings

### Billing Management

- "Manage Subscription" link in account dropdown
- Links to Stripe Customer Portal
- Handles card updates, cancellation, invoices

## Sidebar Structure

```
Sidebar
├── Resources (global - all students)
│   ├── AI Tools
│   ├── Clay Tables
│   └── Access & Links
│
├── Curriculum: [Bootcamp Cohort Name]
│   ├── Week 1
│   ├── Week 2
│   └── ...
│
└── Members Only (subscribed only)
    ├── Coaching Calls
    ├── Member Resources
    └── ...
```

## Migration Plan

1. Create "Resources" cohort
2. Create "Members" cohort
3. Move existing AI tools/Clay/access content to Resources cohort
4. Create `student_cohorts` junction table
5. Populate junction table from existing student.cohort field
6. Add all students to Resources cohort
7. Add subscription fields to students table
8. Deploy Stripe webhook endpoint
9. Build checkout flow
10. Add warning/expired UI components

## Files to Create/Modify

### New Files

- `api/create-checkout-session.ts` - Stripe checkout session creation
- `api/webhooks/stripe.ts` - Stripe webhook handler
- `components/bootcamp/SubscriptionBanner.tsx` - Warning banner
- `components/bootcamp/SubscriptionModal.tsx` - Expired state modal
- `components/bootcamp/MemberBadge.tsx` - Subscribed indicator
- `supabase/migrations/XXXXX_subscription_tables.sql` - DB changes
- `services/subscription-supabase.ts` - Subscription queries
- `hooks/useSubscription.ts` - Access state hook

### Modified Files

- `types/bootcamp-types.ts` - Add subscription fields to student type
- `components/bootcamp/Sidebar.tsx` - Multi-cohort rendering
- `components/bootcamp/ChatInterface.tsx` - Read-only mode
- `services/lms-supabase.ts` - Multi-cohort fetching
- `pages/bootcamp/BootcampApp.tsx` - Access state logic
