# Subscription Access System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement time-limited AI tools access with Stripe subscription for continued access after 8 weeks.

**Architecture:** Add subscription fields to students, create multi-cohort junction table, integrate Stripe Checkout and webhooks via Supabase Edge Functions, and update student UI with access state awareness.

**Tech Stack:** Supabase (Postgres, Edge Functions), Stripe (Checkout, Webhooks, Customer Portal), React, TypeScript

---

## Phase 1: Database Foundation

### Task 1: Create subscription migration

**Files:**
- Create: `supabase/migrations/20260126100000_subscription_tables.sql`

**Step 1: Write the migration**

```sql
-- Add subscription fields to bootcamp_students
ALTER TABLE bootcamp_students
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none'
  CHECK (subscription_status IN ('none', 'active', 'canceled', 'past_due')),
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_students_subscription_status
ON bootcamp_students(subscription_status) WHERE subscription_status != 'none';

CREATE INDEX IF NOT EXISTS idx_students_stripe_customer
ON bootcamp_students(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Junction table for multi-cohort membership
CREATE TABLE IF NOT EXISTS student_cohorts (
  student_id UUID REFERENCES bootcamp_students(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES lms_cohorts(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'member', 'resources')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, cohort_id)
);

-- Subscription events for audit trail
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES bootcamp_students(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'paid', 'canceled', 'payment_failed', 'reactivated')),
  stripe_event_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_student
ON subscription_events(student_id, created_at DESC);

-- Enable RLS
ALTER TABLE student_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_cohorts
CREATE POLICY "Students can view their own cohort memberships"
ON student_cohorts FOR SELECT
USING (student_id IN (
  SELECT id FROM bootcamp_students WHERE email = auth.jwt() ->> 'email'
));

CREATE POLICY "Service role can manage student_cohorts"
ON student_cohorts FOR ALL
USING (auth.role() = 'service_role');

-- RLS policies for subscription_events
CREATE POLICY "Students can view their own subscription events"
ON subscription_events FOR SELECT
USING (student_id IN (
  SELECT id FROM bootcamp_students WHERE email = auth.jwt() ->> 'email'
));

CREATE POLICY "Service role can manage subscription_events"
ON subscription_events FOR ALL
USING (auth.role() = 'service_role');
```

**Step 2: Run migration locally**

Run: `supabase db push` or apply via Supabase Dashboard SQL Editor

**Step 3: Commit**

```bash
git add supabase/migrations/20260126100000_subscription_tables.sql
git commit -m "feat: add subscription and multi-cohort tables"
```

---

### Task 2: Create Resources and Members cohorts

**Files:**
- Create: `supabase/migrations/20260126100001_seed_system_cohorts.sql`

**Step 1: Write the seed migration**

```sql
-- Create system cohorts for Resources and Members
INSERT INTO lms_cohorts (id, name, description, status, start_date, end_date)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Resources', 'Shared resources available to all students', 'Active', NULL, NULL),
  ('00000000-0000-0000-0000-000000000002', 'Members', 'Exclusive content for subscribed members', 'Active', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
```

**Step 2: Run migration**

Run: Apply via Supabase Dashboard SQL Editor

**Step 3: Commit**

```bash
git add supabase/migrations/20260126100001_seed_system_cohorts.sql
git commit -m "feat: seed Resources and Members system cohorts"
```

---

### Task 3: Populate student_cohorts from existing data

**Files:**
- Create: `supabase/migrations/20260126100002_migrate_student_cohorts.sql`

**Step 1: Write the data migration**

```sql
-- Migrate existing students to student_cohorts junction table
-- Add their bootcamp cohort membership
INSERT INTO student_cohorts (student_id, cohort_id, role, joined_at)
SELECT
  s.id as student_id,
  c.id as cohort_id,
  'student' as role,
  s.created_at as joined_at
FROM bootcamp_students s
JOIN lms_cohorts c ON LOWER(c.name) = LOWER(s.cohort)
WHERE s.cohort IS NOT NULL
ON CONFLICT (student_id, cohort_id) DO NOTHING;

-- Add all students to Resources cohort
INSERT INTO student_cohorts (student_id, cohort_id, role, joined_at)
SELECT
  s.id as student_id,
  '00000000-0000-0000-0000-000000000001' as cohort_id,
  'resources' as role,
  s.created_at as joined_at
FROM bootcamp_students s
ON CONFLICT (student_id, cohort_id) DO NOTHING;
```

**Step 2: Run migration**

Run: Apply via Supabase Dashboard SQL Editor

**Step 3: Commit**

```bash
git add supabase/migrations/20260126100002_migrate_student_cohorts.sql
git commit -m "feat: migrate existing students to multi-cohort structure"
```

---

### Task 4: Add subscription types

**Files:**
- Modify: `types/bootcamp-types.ts`

**Step 1: Add subscription types**

Add after line 10 (after BootcampAccessLevel):

```typescript
export type SubscriptionStatus = 'none' | 'active' | 'canceled' | 'past_due';

export type StudentCohortRole = 'student' | 'member' | 'resources';

export interface StudentCohort {
  studentId: string;
  cohortId: string;
  role: StudentCohortRole;
  joinedAt: Date;
}

export interface SubscriptionEvent {
  id: string;
  studentId: string;
  eventType: 'created' | 'paid' | 'canceled' | 'payment_failed' | 'reactivated';
  stripeEventId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
```

**Step 2: Update BootcampStudent interface**

Add these fields to the BootcampStudent interface (after paymentId):

```typescript
  subscriptionStatus: SubscriptionStatus;
  subscriptionId?: string;
  subscriptionStartedAt?: Date;
  subscriptionEndsAt?: Date;
  stripeCustomerId?: string;
```

**Step 3: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`

**Step 4: Commit**

```bash
git add types/bootcamp-types.ts
git commit -m "feat: add subscription and multi-cohort types"
```

---

### Task 5: Add subscription service functions

**Files:**
- Create: `services/subscription-supabase.ts`

**Step 1: Create the service file**

```typescript
import { supabase } from '../lib/supabase';
import { SubscriptionStatus, StudentCohort, SubscriptionEvent } from '../types/bootcamp-types';

const MEMBERS_COHORT_ID = '00000000-0000-0000-0000-000000000002';

// Fetch student's cohort memberships
export async function fetchStudentCohorts(studentId: string): Promise<StudentCohort[]> {
  const { data, error } = await supabase
    .from('student_cohorts')
    .select('student_id, cohort_id, role, joined_at')
    .eq('student_id', studentId);

  if (error) throw error;

  return (data || []).map((row) => ({
    studentId: row.student_id,
    cohortId: row.cohort_id,
    role: row.role,
    joinedAt: new Date(row.joined_at),
  }));
}

// Add student to a cohort
export async function addStudentToCohort(
  studentId: string,
  cohortId: string,
  role: 'student' | 'member' | 'resources'
): Promise<void> {
  const { error } = await supabase
    .from('student_cohorts')
    .upsert({
      student_id: studentId,
      cohort_id: cohortId,
      role,
      joined_at: new Date().toISOString(),
    });

  if (error) throw error;
}

// Add student to Members cohort (for subscribers)
export async function addStudentToMembersCohort(studentId: string): Promise<void> {
  await addStudentToCohort(studentId, MEMBERS_COHORT_ID, 'member');
}

// Update student subscription status
export async function updateSubscriptionStatus(
  studentId: string,
  status: SubscriptionStatus,
  data?: {
    subscriptionId?: string;
    stripeCustomerId?: string;
    subscriptionStartedAt?: Date;
    subscriptionEndsAt?: Date;
  }
): Promise<void> {
  const updates: Record<string, unknown> = {
    subscription_status: status,
    updated_at: new Date().toISOString(),
  };

  if (data?.subscriptionId) updates.subscription_id = data.subscriptionId;
  if (data?.stripeCustomerId) updates.stripe_customer_id = data.stripeCustomerId;
  if (data?.subscriptionStartedAt) updates.subscription_started_at = data.subscriptionStartedAt.toISOString();
  if (data?.subscriptionEndsAt) updates.subscription_ends_at = data.subscriptionEndsAt.toISOString();

  const { error } = await supabase
    .from('bootcamp_students')
    .update(updates)
    .eq('id', studentId);

  if (error) throw error;
}

// Log subscription event
export async function logSubscriptionEvent(
  studentId: string,
  eventType: SubscriptionEvent['eventType'],
  stripeEventId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('subscription_events')
    .insert({
      student_id: studentId,
      event_type: eventType,
      stripe_event_id: stripeEventId,
      metadata: metadata || {},
    });

  if (error) throw error;
}

// Get student by Stripe customer ID
export async function getStudentByStripeCustomerId(stripeCustomerId: string): Promise<{ id: string; email: string } | null> {
  const { data, error } = await supabase
    .from('bootcamp_students')
    .select('id, email')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (error) return null;
  return data;
}

// Get student by email
export async function getStudentByEmail(email: string): Promise<{ id: string; email: string; stripeCustomerId?: string } | null> {
  const { data, error } = await supabase
    .from('bootcamp_students')
    .select('id, email, stripe_customer_id')
    .eq('email', email.toLowerCase())
    .single();

  if (error) return null;
  return {
    id: data.id,
    email: data.email,
    stripeCustomerId: data.stripe_customer_id,
  };
}
```

**Step 2: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`

**Step 3: Commit**

```bash
git add services/subscription-supabase.ts
git commit -m "feat: add subscription service functions"
```

---

## Phase 2: Stripe Integration

### Task 6: Install Stripe SDK

**Step 1: Install package**

Run: `npm install stripe @stripe/stripe-js`

**Step 2: Add environment variables**

Add to `.env`:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID=price_xxxxx
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Stripe SDK"
```

---

### Task 7: Create Stripe checkout edge function

**Files:**
- Create: `supabase/functions/create-checkout/index.ts`

**Step 1: Create the edge function**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { studentId, studentEmail, successUrl, cancelUrl } = await req.json();

    if (!studentId || !studentEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing studentId or studentEmail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const priceId = Deno.env.get('STRIPE_PRICE_ID');
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Stripe price not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: studentEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get('origin')}/subscription/success`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/subscription/cancel`,
      metadata: {
        student_id: studentId,
      },
      subscription_data: {
        metadata: {
          student_id: studentId,
        },
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Step 2: Commit**

```bash
git add supabase/functions/create-checkout/index.ts
git commit -m "feat: add Stripe checkout edge function"
```

---

### Task 8: Create Stripe webhook edge function

**Files:**
- Create: `supabase/functions/stripe-webhook/index.ts`

**Step 1: Create the webhook handler**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const MEMBERS_COHORT_ID = '00000000-0000-0000-0000-000000000002';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const studentId = session.metadata?.student_id;

        if (!studentId) {
          console.error('No student_id in session metadata');
          break;
        }

        // Update student subscription status
        await supabase
          .from('bootcamp_students')
          .update({
            subscription_status: 'active',
            subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            subscription_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', studentId);

        // Add to Members cohort
        await supabase
          .from('student_cohorts')
          .upsert({
            student_id: studentId,
            cohort_id: MEMBERS_COHORT_ID,
            role: 'member',
            joined_at: new Date().toISOString(),
          });

        // Log event
        await supabase
          .from('subscription_events')
          .insert({
            student_id: studentId,
            event_type: 'created',
            stripe_event_id: event.id,
            metadata: { session_id: session.id },
          });

        console.log(`Subscription created for student ${studentId}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: student } = await supabase
          .from('bootcamp_students')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (student) {
          await supabase
            .from('bootcamp_students')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', student.id);

          await supabase
            .from('subscription_events')
            .insert({
              student_id: student.id,
              event_type: 'paid',
              stripe_event_id: event.id,
              metadata: { invoice_id: invoice.id, amount: invoice.amount_paid },
            });

          console.log(`Payment received for student ${student.id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: student } = await supabase
          .from('bootcamp_students')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (student) {
          await supabase
            .from('bootcamp_students')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('id', student.id);

          await supabase
            .from('subscription_events')
            .insert({
              student_id: student.id,
              event_type: 'payment_failed',
              stripe_event_id: event.id,
              metadata: { invoice_id: invoice.id },
            });

          console.log(`Payment failed for student ${student.id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: student } = await supabase
          .from('bootcamp_students')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (student) {
          await supabase
            .from('bootcamp_students')
            .update({
              subscription_status: 'canceled',
              subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', student.id);

          await supabase
            .from('subscription_events')
            .insert({
              student_id: student.id,
              event_type: 'canceled',
              stripe_event_id: event.id,
              metadata: { subscription_id: subscription.id },
            });

          console.log(`Subscription canceled for student ${student.id}`);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

**Step 2: Commit**

```bash
git add supabase/functions/stripe-webhook/index.ts
git commit -m "feat: add Stripe webhook handler edge function"
```

---

### Task 9: Create useSubscription hook

**Files:**
- Create: `hooks/useSubscription.ts`

**Step 1: Create the hook**

```typescript
import { useMemo } from 'react';
import { BootcampStudent } from '../types/bootcamp-types';
import { LmsCohort } from '../types/lms-types';

export type AccessState = 'active' | 'expiring' | 'expired' | 'subscribed';

interface UseSubscriptionResult {
  accessState: AccessState;
  daysRemaining: number | null;
  canUseAiTools: boolean;
  isReadOnly: boolean;
  accessExpiresAt: Date | null;
}

export function useSubscription(
  student: BootcampStudent | null,
  cohort: LmsCohort | null
): UseSubscriptionResult {
  return useMemo(() => {
    // Default state if no student
    if (!student) {
      return {
        accessState: 'expired' as AccessState,
        daysRemaining: null,
        canUseAiTools: false,
        isReadOnly: true,
        accessExpiresAt: null,
      };
    }

    // Subscribed users always have full access
    if (student.subscriptionStatus === 'active') {
      return {
        accessState: 'subscribed' as AccessState,
        daysRemaining: null,
        canUseAiTools: true,
        isReadOnly: false,
        accessExpiresAt: null,
      };
    }

    // Calculate access expiration (cohort end + 4 weeks)
    const cohortEndDate = cohort?.endDate ? new Date(cohort.endDate) : null;

    if (!cohortEndDate) {
      // No end date means unlimited access (for now)
      return {
        accessState: 'active' as AccessState,
        daysRemaining: null,
        canUseAiTools: true,
        isReadOnly: false,
        accessExpiresAt: null,
      };
    }

    const accessExpiresAt = new Date(cohortEndDate);
    accessExpiresAt.setDate(accessExpiresAt.getDate() + 28); // +4 weeks

    const now = new Date();
    const msRemaining = accessExpiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    // Expired
    if (daysRemaining <= 0) {
      return {
        accessState: 'expired' as AccessState,
        daysRemaining: 0,
        canUseAiTools: false,
        isReadOnly: true,
        accessExpiresAt,
      };
    }

    // Expiring (final 7 days)
    if (daysRemaining <= 7) {
      return {
        accessState: 'expiring' as AccessState,
        daysRemaining,
        canUseAiTools: true,
        isReadOnly: false,
        accessExpiresAt,
      };
    }

    // Active
    return {
      accessState: 'active' as AccessState,
      daysRemaining,
      canUseAiTools: true,
      isReadOnly: false,
      accessExpiresAt,
    };
  }, [student, cohort]);
}
```

**Step 2: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`

**Step 3: Commit**

```bash
git add hooks/useSubscription.ts
git commit -m "feat: add useSubscription hook for access state"
```

---

## Phase 3: Student UI

### Task 10: Create SubscriptionBanner component

**Files:**
- Create: `components/bootcamp/SubscriptionBanner.tsx`

**Step 1: Create the component**

```typescript
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SubscriptionBannerProps {
  daysRemaining: number;
  onSubscribe: () => void;
  onDismiss: () => void;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  daysRemaining,
  onSubscribe,
  onDismiss,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg mb-4 ${
        isDarkMode ? 'bg-amber-900/30 border border-amber-700' : 'bg-amber-50 border border-amber-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
        <p className={`text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
          Your AI tools access expires in <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong>.
          Subscribe to keep access + get weekly coaching.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSubscribe}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700"
        >
          Subscribe
        </button>
        <button
          onClick={onDismiss}
          className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-amber-800' : 'hover:bg-amber-100'}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
```

**Step 2: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`

**Step 3: Commit**

```bash
git add components/bootcamp/SubscriptionBanner.tsx
git commit -m "feat: add SubscriptionBanner component"
```

---

### Task 11: Create SubscriptionModal component

**Files:**
- Create: `components/bootcamp/SubscriptionModal.tsx`

**Step 1: Create the component**

```typescript
import React, { useState } from 'react';
import { X, Sparkles, MessageSquare, Users, Bot } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentEmail: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentEmail,
}) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          studentId,
          studentEmail,
          successUrl: `${window.location.origin}/bootcamp?subscription=success`,
          cancelUrl: `${window.location.origin}/bootcamp?subscription=canceled`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-md rounded-2xl ${
          isDarkMode ? 'bg-zinc-900' : 'bg-white'
        } shadow-xl`}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-3 rounded-full ${
                isDarkMode ? 'bg-violet-900/30' : 'bg-violet-100'
              }`}
            >
              <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-bold mb-2">Your free access has ended</h2>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Continue using AI tools and get ongoing coaching with a membership.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <Bot className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
              <span className="text-sm">Full access to all AI tools</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
              <span className="text-sm">Weekly group coaching calls</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
              <span className="text-sm">Private community access</span>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg mb-6 ${
              isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'
            }`}
          >
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">$300</span>
              <span className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>/month</span>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
              Cancel anytime
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-3 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Subscribe Now'}
            </button>
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-lg text-sm font-medium ${
                isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
              }`}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
```

**Step 2: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`

**Step 3: Commit**

```bash
git add components/bootcamp/SubscriptionModal.tsx
git commit -m "feat: add SubscriptionModal for expired access"
```

---

### Task 12: Create MemberBadge component

**Files:**
- Create: `components/bootcamp/MemberBadge.tsx`

**Step 1: Create the component**

```typescript
import React from 'react';
import { Crown } from 'lucide-react';

interface MemberBadgeProps {
  className?: string;
}

const MemberBadge: React.FC<MemberBadgeProps> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ${className}`}
    >
      <Crown className="w-3 h-3" />
      Member
    </span>
  );
};

export default MemberBadge;
```

**Step 2: Commit**

```bash
git add components/bootcamp/MemberBadge.tsx
git commit -m "feat: add MemberBadge component"
```

---

### Task 13: Update ChatInterface for read-only mode

**Files:**
- Modify: `components/bootcamp/ChatInterface.tsx`

**Step 1: Add isReadOnly prop**

Find the interface definition and add:

```typescript
interface ChatInterfaceProps {
  // ... existing props
  isReadOnly?: boolean;
  onSubscribeClick?: () => void;
}
```

**Step 2: Update the input area**

Wrap the input/send area with read-only handling:

```typescript
{isReadOnly ? (
  <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
    <div
      className={`p-4 rounded-lg text-center ${
        isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'
      }`}
    >
      <p className="text-sm text-zinc-500 mb-2">
        Your AI tools access has expired
      </p>
      <button
        onClick={onSubscribeClick}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700"
      >
        Subscribe to Continue
      </button>
    </div>
  </div>
) : (
  // ... existing input area
)}
```

**Step 3: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`

**Step 4: Commit**

```bash
git add components/bootcamp/ChatInterface.tsx
git commit -m "feat: add read-only mode to ChatInterface"
```

---

### Task 14: Integrate subscription UI into BootcampApp

**Files:**
- Modify: `pages/bootcamp/BootcampApp.tsx`

**Step 1: Add imports**

```typescript
import { useSubscription } from '../../hooks/useSubscription';
import SubscriptionBanner from '../../components/bootcamp/SubscriptionBanner';
import SubscriptionModal from '../../components/bootcamp/SubscriptionModal';
import MemberBadge from '../../components/bootcamp/MemberBadge';
```

**Step 2: Add subscription state and hook**

Inside the component, add:

```typescript
const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
const [dismissedBanner, setDismissedBanner] = useState(false);

// Get the student's bootcamp cohort for access calculation
const bootcampCohort = useMemo(() => {
  // Find the cohort that matches the student's cohort name
  return null; // Will need to fetch from student_cohorts
}, []);

const { accessState, daysRemaining, isReadOnly } = useSubscription(
  activeUser,
  bootcampCohort
);
```

**Step 3: Add banner before main content**

```typescript
{accessState === 'expiring' && !dismissedBanner && (
  <SubscriptionBanner
    daysRemaining={daysRemaining || 0}
    onSubscribe={() => setShowSubscriptionModal(true)}
    onDismiss={() => setDismissedBanner(true)}
  />
)}
```

**Step 4: Add modal at end of component**

```typescript
{activeUser && (
  <SubscriptionModal
    isOpen={showSubscriptionModal || accessState === 'expired'}
    onClose={() => setShowSubscriptionModal(false)}
    studentId={activeUser.id}
    studentEmail={activeUser.email}
  />
)}
```

**Step 5: Pass isReadOnly to AI tool components**

When rendering ChatInterface for AI tools, pass:

```typescript
isReadOnly={isReadOnly}
onSubscribeClick={() => setShowSubscriptionModal(true)}
```

**Step 6: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`

**Step 7: Commit**

```bash
git add pages/bootcamp/BootcampApp.tsx
git commit -m "feat: integrate subscription UI into BootcampApp"
```

---

## Phase 4: Testing & Deployment

### Task 15: Deploy edge functions

**Step 1: Deploy create-checkout function**

Run: `supabase functions deploy create-checkout`

**Step 2: Deploy stripe-webhook function**

Run: `supabase functions deploy stripe-webhook`

**Step 3: Set environment variables in Supabase**

Go to Supabase Dashboard → Edge Functions → Secrets and add:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`

**Step 4: Configure Stripe webhook**

In Stripe Dashboard → Developers → Webhooks:
- Add endpoint: `https://[your-project].supabase.co/functions/v1/stripe-webhook`
- Select events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`
- Copy webhook signing secret to Supabase secrets

---

### Task 16: Test the flow

**Step 1: Test checkout flow**

1. Login as a test student
2. Manually set their cohort end date to past (to trigger expiring/expired state)
3. Verify warning banner appears
4. Click Subscribe
5. Complete Stripe test checkout
6. Verify student status updates to 'active'
7. Verify student added to Members cohort

**Step 2: Test webhook handling**

1. Use Stripe CLI to forward webhooks locally: `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`
2. Trigger test events: `stripe trigger invoice.paid`
3. Verify database updates correctly

---

### Task 17: Final commit and push

```bash
git add -A
git commit -m "feat: complete subscription access system

- Database: subscription fields, multi-cohort junction table
- Stripe: checkout and webhook edge functions
- UI: warning banner, subscription modal, member badge
- Access control: 8-week window with read-only expired state"

git push origin main
```
