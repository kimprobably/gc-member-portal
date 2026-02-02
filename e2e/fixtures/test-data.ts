// ---------------------------------------------------------------------------
// Mock data used across the E2E test suite
// ---------------------------------------------------------------------------

/* ── Blueprint / Prospect ────────────────────────────────────────────────── */

export const prospect = {
  id: 'prospect-001',
  slug: 'jane-doe',
  first_name: 'Jane',
  last_name: 'Doe',
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  linkedin_url: 'https://linkedin.com/in/janedoe',
  company: 'Acme Corp',
  title: 'VP of Marketing',
  headline: 'Helping B2B SaaS companies grow revenue',
  authority_score: 72,
  authority_score_breakdown: {
    content_quality: 18,
    engagement_rate: 15,
    network_strength: 20,
    consistency: 19,
  },
  whats_working: [
    { title: 'Strong personal brand', description: 'Consistent voice across posts.' },
    { title: 'Good engagement rate', description: 'Average 3.2% engagement.' },
    { title: 'Niche expertise', description: 'Clear positioning in B2B SaaS.' },
  ],
  revenue_leaks: [
    { title: 'No lead magnet', description: 'Missing content offer to capture leads.' },
    { title: 'Inconsistent posting', description: 'Gaps of 5+ days between posts.' },
    { title: 'Weak CTA usage', description: 'Posts rarely include a call to action.' },
  ],
  lead_magnets: [
    {
      id: 'lm-1',
      title: 'B2B SaaS Growth Playbook',
      type: 'pdf',
      description: 'A 12-page guide to scaling SaaS revenue via LinkedIn.',
    },
    {
      id: 'lm-2',
      title: 'LinkedIn Authority Scorecard',
      type: 'interactive',
      description: 'Interactive tool to benchmark your LinkedIn presence.',
    },
  ],
  profile_rewrite: {
    headline: 'I help B2B SaaS companies add $1M+ ARR via LinkedIn',
    about: 'With 10 years in growth marketing...',
  },
  status: 'completed',
  created_at: '2025-11-01T00:00:00Z',
};

export const prospectPost = {
  id: 'post-001',
  prospect_id: prospect.id,
  text: 'Just launched our new product...',
  likes: 42,
  comments: 8,
  date: '2025-10-28',
};

/* ── GC Member ───────────────────────────────────────────────────────────── */

export const gcMember = {
  id: 'gc-member-001',
  email: 'member@growthcollective.test',
  first_name: 'Alex',
  last_name: 'Smith',
  full_name: 'Alex Smith',
  company: 'GrowthCo',
  role: 'Founder',
  onboarding_completed: true,
  created_at: '2025-06-01T00:00:00Z',
};

export const gcCampaign = {
  id: 'camp-001',
  member_id: gcMember.id,
  name: 'Q1 Outreach',
  status: 'active',
  sent: 120,
  replies: 18,
  meetings: 4,
  created_at: '2025-09-15T00:00:00Z',
};

export const gcToolAccess = {
  id: 'tool-001',
  member_id: gcMember.id,
  tool_name: 'ICP Builder',
  enabled: true,
};

export const gcResource = {
  id: 'res-001',
  title: 'Cold Outreach Template Pack',
  description: 'Proven templates for LinkedIn outreach.',
  type: 'template',
  url: 'https://example.com/templates',
};

/* ── Bootcamp Student ────────────────────────────────────────────────────── */

export const bootcampStudent = {
  id: 'student-001',
  email: 'student@bootcamp.test',
  first_name: 'Sam',
  last_name: 'Lee',
  full_name: 'Sam Lee',
  status: 'active',
  cohort_id: 'cohort-001',
  onboarding_completed: true,
  subscription_status: 'active',
  created_at: '2025-08-01T00:00:00Z',
};

export const bootcampInviteCode = {
  id: 'invite-001',
  code: 'BOOT-TEST-2025',
  cohort_id: 'cohort-001',
  max_uses: 50,
  current_uses: 12,
  is_active: true,
  created_at: '2025-07-01T00:00:00Z',
};

export const bootcampSurvey = {
  id: 'survey-001',
  student_id: bootcampStudent.id,
  responses: {
    experience_level: 'intermediate',
    primary_goal: 'lead_generation',
    industry: 'SaaS',
  },
  created_at: '2025-08-02T00:00:00Z',
};

/* ── LMS Curriculum ──────────────────────────────────────────────────────── */

export const lmsCohort = {
  id: 'cohort-001',
  name: 'Q4 2025 Cohort',
  status: 'active',
  start_date: '2025-10-01',
  end_date: '2025-12-20',
  created_at: '2025-09-01T00:00:00Z',
};

export const lmsWeeks = [
  {
    id: 'week-001',
    cohort_id: lmsCohort.id,
    week_number: 1,
    title: 'Foundation: Profile & Positioning',
    description: 'Set up your LinkedIn profile for authority.',
    sort_order: 1,
  },
  {
    id: 'week-002',
    cohort_id: lmsCohort.id,
    week_number: 2,
    title: 'Content Strategy',
    description: 'Build a repeatable content engine.',
    sort_order: 2,
  },
  {
    id: 'week-003',
    cohort_id: lmsCohort.id,
    week_number: 3,
    title: 'Engagement & Growth',
    description: 'Grow your network strategically.',
    sort_order: 3,
  },
];

export const lmsLessons = [
  {
    id: 'lesson-001',
    week_id: 'week-001',
    title: 'Headline Formula',
    description: 'Craft a headline that converts visitors to followers.',
    sort_order: 1,
    content_type: 'video',
  },
  {
    id: 'lesson-002',
    week_id: 'week-001',
    title: 'About Section Blueprint',
    description: 'Write an about section that builds trust.',
    sort_order: 2,
    content_type: 'text',
  },
  {
    id: 'lesson-003',
    week_id: 'week-002',
    title: 'Content Pillars',
    description: 'Define 3-5 content pillars for consistency.',
    sort_order: 1,
    content_type: 'video',
  },
];

export const lmsContentItems = [
  {
    id: 'content-001',
    lesson_id: 'lesson-001',
    type: 'video',
    title: 'Headline Formula Walkthrough',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sort_order: 1,
  },
  {
    id: 'content-002',
    lesson_id: 'lesson-001',
    type: 'text',
    title: 'Headline Cheat Sheet',
    body: 'Use this formula: [Result] for [Audience] without [Pain].',
    sort_order: 2,
  },
];

export const lmsActionItems = [
  {
    id: 'action-001',
    week_id: 'week-001',
    title: 'Rewrite your LinkedIn headline',
    description: 'Apply the formula from Lesson 1.',
    sort_order: 1,
  },
  {
    id: 'action-002',
    week_id: 'week-001',
    title: 'Update your About section',
    description: 'Follow the blueprint from Lesson 2.',
    sort_order: 2,
  },
];

export const lmsLessonProgress = {
  id: 'progress-001',
  student_id: bootcampStudent.id,
  lesson_id: 'lesson-001',
  completed: true,
  completed_at: '2025-10-05T10:00:00Z',
};

/* ── Admin ───────────────────────────────────────────────────────────────── */

export const adminMember = {
  id: 'admin-001',
  email: 'admin@growthcollective.test',
  first_name: 'Admin',
  last_name: 'User',
  full_name: 'Admin User',
  company: 'GrowthCo',
  role: 'Admin',
  onboarding_completed: true,
  created_at: '2025-01-01T00:00:00Z',
};
