# Growth Collective Member Portal + Bootcamp LMS

A React-based web application that serves two purposes:
1. **GC Member Portal** - Dashboard for Growth Collective agency members
2. **Bootcamp LMS** - Learning management system for LinkedIn bootcamp students

## Live Demo

**Production:** https://copy-of-gtm-os.vercel.app

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Backend:** Airtable (REST API)
- **AI:** Google Gemini (for ICP generation)
- **Testing:** Vitest + React Testing Library + Playwright
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions

## Project Structure

```
├── components/
│   ├── gc/                    # GC Member Portal components
│   │   ├── GCLogin.tsx        # Login page
│   │   ├── GCDashboard.tsx    # Main dashboard
│   │   ├── campaigns/         # Campaign management
│   │   ├── onboarding/        # Onboarding checklist
│   │   ├── resources/         # Resources & tools
│   │   └── settings/          # Member settings & ICP
│   ├── bootcamp/              # Bootcamp LMS components
│   │   ├── BootcampLogin.tsx
│   │   ├── Dashboard.tsx
│   │   ├── modules/
│   │   └── settings/
│   └── shared/                # Shared UI components
│       ├── LoadingSpinner.tsx
│       ├── ProgressBar.tsx
│       └── StatusBadge.tsx
├── context/
│   ├── AuthContext.tsx        # Authentication state
│   └── ThemeContext.tsx       # Dark/light mode
├── services/
│   ├── airtable.ts            # Bootcamp Airtable API
│   └── gc-airtable.ts         # GC Portal Airtable API
├── types/
│   ├── types.ts               # Bootcamp types
│   └── gc-types.ts            # GC Portal types
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # End-to-end tests
└── .github/workflows/
    └── ci.yml                 # GitHub Actions CI/CD
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/kimprobably/gc-member-portal.git
cd gc-member-portal

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your API keys to .env.local
```

### Environment Variables

Create a `.env.local` file with:

```bash
VITE_AIRTABLE_API_KEY=your_airtable_personal_access_token
VITE_AIRTABLE_BASE_ID=your_airtable_base_id
VITE_GEMINI_API_KEY=your_gemini_api_key  # Optional, for ICP generation
```

### Running Locally

```bash
# Development server (http://localhost:3000)
npm run dev

# Type checking
npm run typecheck

# Run tests
npm run test:unit
npm run test:integration
npm run test:e2e

# Production build
npm run build
```

## Airtable Schema

### GC Portal Tables

| Table | Purpose |
|-------|---------|
| GC Members | Member profiles and authentication |
| Tool Access | Tools available to each member |
| Onboarding Checklist | Onboarding tasks and items |
| Member Progress | Progress tracking for onboarding |
| Member ICP | Ideal Customer Profile data |
| Campaigns | Outreach campaign tracking |
| Resources | Learning resources and links |

### Bootcamp Tables

| Table | Purpose |
|-------|---------|
| Users | Student profiles |
| Modules | Course modules |
| Lessons | Individual lessons |
| Progress | Student progress tracking |
| Resources | Course resources |

## Testing

### Unit Tests (29 tests)

```bash
npm run test:unit
```

Tests the Airtable service functions:
- `verifyGCMember` - Member authentication
- `fetchMemberTools` - Tool access retrieval
- `fetchOnboardingWithProgress` - Onboarding data
- `fetchMemberCampaigns` - Campaign data
- `updateMemberProgress` - Progress updates
- And more...

### Integration Tests

```bash
npm run test:integration
```

Tests component interactions:
- GC Login flow
- Onboarding checkbox toggle

### E2E Tests

```bash
npm run test:e2e
```

Full user journey tests with Playwright.

## CI/CD Pipeline

GitHub Actions runs on every push/PR to main:

1. **Type Check** - TypeScript compilation
2. **Unit Tests** - Vitest unit tests
3. **Integration Tests** - Component tests
4. **Build** - Production build verification

## Deployment

The app auto-deploys to Vercel on push to main.

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Features

### GC Member Portal

- **Dashboard** - Overview of member status, campaigns, onboarding progress
- **Onboarding** - Interactive checklist with progress tracking
- **Campaigns** - Track outreach campaigns with metrics
- **Resources** - Access to tools and learning materials
- **Settings** - ICP builder with AI assistance

### Bootcamp LMS

- **Module System** - Structured course content
- **Progress Tracking** - Lesson completion tracking
- **Resources** - Course materials and downloads

## API Reference

### GC Airtable Service (`services/gc-airtable.ts`)

```typescript
// Verify member by email
verifyGCMember(email: string): Promise<GCMember | null>

// Fetch member's tools
fetchMemberTools(memberId: string): Promise<ToolAccess[]>

// Fetch onboarding with progress
fetchOnboardingWithProgress(memberId: string, plan: MemberPlan): Promise<OnboardingData>

// Update progress
updateMemberProgress(progressId: string | undefined, memberId: string, checklistItemId: string, status: ProgressStatus): Promise<MemberProgress>

// Fetch campaigns
fetchMemberCampaigns(memberId: string): Promise<Campaign[]>

// Update campaign metrics
updateCampaignMetrics(campaignId: string, metrics: Partial<CampaignMetrics>): Promise<Campaign>

// Fetch/save ICP
fetchMemberICP(memberId: string): Promise<MemberICP | null>
saveMemberICP(memberId: string, icp: Partial<MemberICP>): Promise<MemberICP>
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `npm run test:unit && npm run test:integration`
4. Push and create PR
5. CI will run automatically

## License

Private - Growth Collective
