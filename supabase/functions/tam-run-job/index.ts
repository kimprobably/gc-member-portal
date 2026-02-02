/* eslint-disable no-undef */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// ============================================
// BlitzAPI helpers (direct API — https://docs.blitz-api.ai)
// ============================================

const BLITZAPI_BASE = 'https://api.blitz-api.ai/v2';

function blitzApiHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };
}

// ============================================
// Serper Company Sourcing
// ============================================

function buildSerperQuery(icpProfile: any): string {
  const parts: string[] = [];

  // Add industry context
  if (icpProfile.industryKeywords?.length) {
    parts.push(`(${icpProfile.industryKeywords.join(' OR ')})`);
  }

  // Add business model context
  const modelHints: Record<string, string> = {
    b2b_saas: 'SaaS software company',
    ecommerce_dtc: 'ecommerce store DTC brand',
    amazon_sellers: 'Amazon seller FBA brand',
    local_service: 'local business service provider',
    agencies: 'agency consulting firm',
  };
  if (icpProfile.businessModel && modelHints[icpProfile.businessModel]) {
    parts.push(modelHints[icpProfile.businessModel]);
  } else if (icpProfile.businessModel === 'other' && icpProfile.businessModelOther) {
    parts.push(icpProfile.businessModelOther);
  }

  // Add employee size hints
  if (icpProfile.employeeSizeRanges?.length) {
    const sizes = icpProfile.employeeSizeRanges as string[];
    if (sizes.includes('1-10') || sizes.includes('11-50')) {
      parts.push('startup OR "small business"');
    }
    if (sizes.includes('201-1000')) {
      parts.push('mid-market OR "mid-size"');
    }
    if (sizes.includes('1000+')) {
      parts.push('enterprise');
    }
  }

  // Add geography constraints
  if (icpProfile.geography === 'us_only') {
    parts.push('USA');
  } else if (
    icpProfile.geography === 'specific_countries' &&
    icpProfile.specificCountries?.length
  ) {
    parts.push(icpProfile.specificCountries.join(' OR '));
  }

  return parts.join(' ') || 'companies';
}

// Handler function for sourcing companies
async function handleSourceCompanies(supabase: any, job: any, project: any) {
  const config = job.config || {};
  const source = config.source || 'serper';
  const icpProfile = project?.icp_profile || {};

  let companies: any[] = [];

  if (source === 'serper') {
    const serperKey = Deno.env.get('SERPER_API_KEY');
    if (!serperKey) throw new Error('SERPER_API_KEY not configured');

    const searchQuery = buildSerperQuery(icpProfile);

    // Run multiple pages for better coverage
    const pages = [0, 100];
    for (const start of pages) {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: searchQuery,
          num: 100,
          ...(start > 0 ? { page: Math.floor(start / 100) + 1 } : {}),
        }),
      });

      const data = await response.json();
      const pageCompanies = (data.organic || []).map((result: any) => {
        let domain: string | null = null;
        try {
          domain = new URL(result.link).hostname;
        } catch {
          // skip invalid URLs
        }
        return {
          name: result.title,
          domain,
          description: result.snippet,
          source: 'serper',
        };
      });
      companies.push(...pageCompanies);
    }

    // Deduplicate by domain
    const seen = new Set<string>();
    companies = companies.filter((c: any) => {
      if (!c.domain || seen.has(c.domain)) return false;
      seen.add(c.domain);
      return true;
    });
  } else if (source === 'storeleads') {
    const storeleadsKey = Deno.env.get('STORELEADS_API_KEY');
    if (!storeleadsKey) throw new Error('STORELEADS_API_KEY not configured');

    // TODO: Implement Storeleads API call
    companies = [];
  } else if (source === 'blitzapi') {
    const blitzApiKey = Deno.env.get('BLITZ_API_KEY');
    if (!blitzApiKey) throw new Error('BLITZ_API_KEY not configured');

    // TODO: Implement BlitzAPI company search
    companies = [];
  }

  // Insert companies into database
  if (companies.length > 0) {
    const insertData = companies.map((c: any) => ({
      project_id: job.project_id,
      name: c.name,
      domain: c.domain || null,
      linkedin_url: c.linkedin_url || null,
      source: c.source,
      industry: c.industry || null,
      employee_count: c.employee_count || null,
      location: c.location || null,
      description: c.description || null,
      qualification_status: 'pending',
      raw_data: c,
    }));

    const batchSize = 100;
    for (let i = 0; i < insertData.length; i += batchSize) {
      const batch = insertData.slice(i, i + batchSize);
      await supabase.from('tam_companies').insert(batch);

      const progress = Math.round(((i + batch.length) / insertData.length) * 100);
      await supabase.from('tam_job_queue').update({ progress }).eq('id', job.id);
    }
  }

  // Update project status to sourcing
  await supabase.from('tam_projects').update({ status: 'sourcing' }).eq('id', job.project_id);

  return { companiesFound: companies.length, source };
}

// ============================================
// Qualification
// ============================================

async function handleQualify(supabase: any, job: any, project: any) {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const icpProfile = project?.icp_profile || {};

  const { data: companies } = await supabase
    .from('tam_companies')
    .select('*')
    .eq('project_id', job.project_id)
    .eq('qualification_status', 'pending');

  if (!companies || companies.length === 0) {
    return { qualified: 0, disqualified: 0, total: 0 };
  }

  let qualified = 0;
  let disqualified = 0;
  const batchSize = 10;

  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);

    for (const company of batch) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 256,
            messages: [
              {
                role: 'user',
                content: `Evaluate if this company matches our ICP. Respond with JSON: {"qualified": true/false, "reason": "brief reason"}

Company: ${company.name}
Domain: ${company.domain || 'unknown'}
Description: ${company.description || 'none'}
Industry: ${company.industry || 'unknown'}

ICP Criteria:
- Business model target: ${icpProfile.businessModel || 'any'}
- Industries: ${icpProfile.industryKeywords?.join(', ') || 'any'}
- Employee size: ${icpProfile.employeeSizeRanges?.join(', ') || 'any'}
- Geography: ${icpProfile.geography || 'any'}
- Special: ${icpProfile.specialCriteria || 'none'}`,
              },
            ],
          }),
        });

        const result = await response.json();
        const content = result.content?.[0]?.text || '';

        try {
          const parsed = JSON.parse(content);
          const status = parsed.qualified ? 'qualified' : 'disqualified';

          await supabase
            .from('tam_companies')
            .update({
              qualification_status: status,
              qualification_reason: parsed.reason,
            })
            .eq('id', company.id);

          if (parsed.qualified) qualified++;
          else disqualified++;
        } catch {
          // Fail-closed: mark for manual review instead of auto-qualifying
          await supabase
            .from('tam_companies')
            .update({
              qualification_status: 'pending',
              qualification_reason: 'Needs review (AI response parse error)',
            })
            .eq('id', company.id);
        }
      } catch {
        // Skip on error, leave as pending
      }
    }

    const progress = Math.round(((i + batch.length) / companies.length) * 100);
    await supabase.from('tam_job_queue').update({ progress }).eq('id', job.id);
  }

  // Update project status to enriching
  await supabase.from('tam_projects').update({ status: 'enriching' }).eq('id', job.project_id);

  return { qualified, disqualified, total: companies.length };
}

// ============================================
// Domain → LinkedIn URL Enrichment
// ============================================

async function enrichCompanyLinkedInUrls(supabase: any, job: any) {
  const blitzApiKey = Deno.env.get('BLITZ_API_KEY');
  if (!blitzApiKey) return { enriched: 0, failed: 0 };

  const { data: companies } = await supabase
    .from('tam_companies')
    .select('id, domain')
    .eq('project_id', job.project_id)
    .eq('qualification_status', 'qualified')
    .is('linkedin_url', null)
    .not('domain', 'is', null);

  if (!companies || companies.length === 0) return { enriched: 0, failed: 0 };

  let enriched = 0;
  let failed = 0;

  for (const company of companies) {
    try {
      const response = await fetch(`${BLITZAPI_BASE}/enrichment/domain-to-linkedin`, {
        method: 'POST',
        headers: blitzApiHeaders(blitzApiKey),
        body: JSON.stringify({ domain: company.domain }),
      });

      const data = await response.json();
      if (data.found && data.company_linkedin_url) {
        await supabase
          .from('tam_companies')
          .update({ linkedin_url: data.company_linkedin_url })
          .eq('id', company.id);
        enriched++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }

    // Rate limit: 200ms between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  return { enriched, failed };
}

// ============================================
// Contact Finding (Waterfall ICP Search)
// ============================================

function buildCascade(icpProfile: any): any[] {
  const targetTitles = icpProfile.targetTitles || ['CEO', 'Founder'];
  const seniorityPref = icpProfile.seniorityPreference || [];

  let location: string[] = ['WORLD'];
  if (icpProfile.geography === 'us_only') {
    location = ['US'];
  } else if (
    icpProfile.geography === 'specific_countries' &&
    icpProfile.specificCountries?.length
  ) {
    location = icpProfile.specificCountries;
  }

  const cascade: any[] = [];

  // Level 1: Exact target titles from wizard
  cascade.push({
    include_title: targetTitles,
    location,
    include_headline_search: false,
  });

  // Level 2: Broader seniority titles as fallback
  const broaderTitles: string[] = [];
  if (seniorityPref.includes('C-Suite') || seniorityPref.length === 0) {
    broaderTitles.push('CEO', 'CTO', 'CFO', 'COO', 'CMO');
  }
  if (seniorityPref.includes('VP')) {
    broaderTitles.push('VP', 'Vice President');
  }
  if (seniorityPref.includes('Director')) {
    broaderTitles.push('Director', 'Head of');
  }
  if (seniorityPref.includes('Manager')) {
    broaderTitles.push('Manager', 'Lead');
  }

  const additionalTitles = broaderTitles.filter(
    (t) => !targetTitles.some((tt: string) => tt.toLowerCase() === t.toLowerCase())
  );

  if (additionalTitles.length > 0) {
    cascade.push({
      include_title: additionalTitles,
      location: ['WORLD'],
      include_headline_search: true,
    });
  }

  return cascade;
}

async function handleFindContacts(supabase: any, job: any, project: any) {
  const blitzApiKey = Deno.env.get('BLITZ_API_KEY');
  if (!blitzApiKey) throw new Error('BLITZ_API_KEY not configured');

  const icpProfile = project?.icp_profile || {};

  // Step 1: Enrich company LinkedIn URLs
  const enrichResult = await enrichCompanyLinkedInUrls(supabase, job);

  // Get qualified companies
  const { data: companies } = await supabase
    .from('tam_companies')
    .select('*')
    .eq('project_id', job.project_id)
    .eq('qualification_status', 'qualified');

  if (!companies || companies.length === 0) {
    return { contactsFound: 0, emailsFound: 0, total: 0, enrichment: enrichResult };
  }

  let contactsFound = 0;
  let emailsFound = 0;
  const maxResults = icpProfile.contactsPerCompany || 1;
  const cascade = buildCascade(icpProfile);

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];

    try {
      let contacts: any[] = [];

      if (company.linkedin_url) {
        // Waterfall ICP search for companies with LinkedIn URLs
        const response = await fetch(`${BLITZAPI_BASE}/search/waterfall-icp-keyword`, {
          method: 'POST',
          headers: blitzApiHeaders(blitzApiKey),
          body: JSON.stringify({
            company_linkedin_url: company.linkedin_url,
            cascade,
            max_results: maxResults,
          }),
        });

        const data = await response.json();
        contacts = (data.results || []).map((r: any) => ({
          firstName: r.person?.first_name || r.person?.firstName || null,
          lastName: r.person?.last_name || r.person?.lastName || null,
          title: r.person?.title || r.person?.position || null,
          linkedinUrl: r.person?.linkedin_url || r.person?.linkedinUrl || null,
          email: r.person?.email || null,
          phone: r.person?.phone || null,
          icpLevel: r.icp,
          ranking: r.ranking,
          whatMatched: r.what_matched,
        }));
      } else if (company.domain) {
        // Fallback: Employee Finder for companies without LinkedIn URLs
        const response = await fetch(`${BLITZAPI_BASE}/search/employee-finder`, {
          method: 'POST',
          headers: blitzApiHeaders(blitzApiKey),
          body: JSON.stringify({
            company_linkedin_url: `https://linkedin.com/company/${company.domain.replace(/\.[^.]+$/, '').replace(/\.[^.]+$/, '')}`,
            job_level: icpProfile.seniorityPreference?.length
              ? icpProfile.seniorityPreference.map((s: string) => {
                  if (s === 'C-Suite') return 'C-Team';
                  return s;
                })
              : ['C-Team', 'VP', 'Director'],
            max_results: maxResults,
          }),
        });

        const data = await response.json();
        contacts = (Array.isArray(data) ? data : data.results || []).map((c: any) => ({
          firstName: c.first_name || c.firstName || null,
          lastName: c.last_name || c.lastName || null,
          title: c.title || c.position || null,
          linkedinUrl: c.linkedin_url || c.linkedinUrl || null,
          email: c.email || null,
          phone: c.phone || null,
        }));
      }

      for (const contact of contacts.slice(0, maxResults)) {
        await supabase.from('tam_contacts').insert({
          company_id: company.id,
          project_id: job.project_id,
          first_name: contact.firstName || null,
          last_name: contact.lastName || null,
          title: contact.title || null,
          linkedin_url: contact.linkedinUrl || null,
          email: contact.email || null,
          email_status: contact.email ? 'found' : 'not_found',
          phone: contact.phone || null,
          source: 'blitzapi',
          raw_data: contact,
        });

        contactsFound++;
        if (contact.email) emailsFound++;
      }
    } catch {
      // Skip company on error
    }

    // Rate limit: 200ms between requests
    await new Promise((r) => setTimeout(r, 200));

    const progress = Math.round(((i + 1) / companies.length) * 100);
    await supabase.from('tam_job_queue').update({ progress }).eq('id', job.id);
  }

  // Update project status to complete
  await supabase.from('tam_projects').update({ status: 'complete' }).eq('id', job.project_id);

  return { contactsFound, emailsFound, totalCompanies: companies.length, enrichment: enrichResult };
}

// ============================================
// LinkedIn Activity Check
// ============================================

async function handleCheckLinkedin(supabase: any, job: any, _project: any) {
  const brightDataKey = Deno.env.get('BRIGHT_DATA_API_KEY');
  if (!brightDataKey) throw new Error('BRIGHT_DATA_API_KEY not configured');

  const { data: contacts } = await supabase
    .from('tam_contacts')
    .select('*')
    .eq('project_id', job.project_id)
    .not('linkedin_url', 'is', null);

  if (!contacts || contacts.length === 0) {
    return { active: 0, inactive: 0, total: 0 };
  }

  let active = 0;
  let inactive = 0;

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];

    try {
      const response = await fetch('https://api.brightdata.com/datasets/v3/trigger', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${brightDataKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: contact.linkedin_url,
          type: 'linkedin_posts',
        }),
      });

      const data = await response.json();
      const lastPostDate = data.lastPostDate || data.last_post_date || null;

      let isActive = false;
      if (lastPostDate) {
        const postDate = new Date(lastPostDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        isActive = postDate > thirtyDaysAgo;
      }

      await supabase
        .from('tam_contacts')
        .update({
          linkedin_last_post_date: lastPostDate,
          linkedin_active: isActive,
        })
        .eq('id', contact.id);

      if (isActive) active++;
      else inactive++;
    } catch {
      await supabase.from('tam_contacts').update({ linkedin_active: false }).eq('id', contact.id);
      inactive++;
    }

    const progress = Math.round(((i + 1) / contacts.length) * 100);
    await supabase.from('tam_job_queue').update({ progress }).eq('id', job.id);
  }

  return { active, inactive, total: contacts.length };
}

// ============================================
// Main serve function
// ============================================

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(JSON.stringify({ error: 'jobId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load job
    const { data: job, error: jobError } = await supabase
      .from('tam_job_queue')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Set status to running
    await supabase.from('tam_job_queue').update({ status: 'running', progress: 0 }).eq('id', jobId);

    // Load project for ICP context
    const { data: project } = await supabase
      .from('tam_projects')
      .select('*')
      .eq('id', job.project_id)
      .single();

    let resultSummary: Record<string, unknown> = {};

    try {
      switch (job.job_type) {
        case 'source_companies':
          resultSummary = await handleSourceCompanies(supabase, job, project);
          break;
        case 'qualify':
          resultSummary = await handleQualify(supabase, job, project);
          break;
        case 'find_contacts':
          resultSummary = await handleFindContacts(supabase, job, project);
          break;
        case 'check_linkedin':
          resultSummary = await handleCheckLinkedin(supabase, job, project);
          break;
        default:
          throw new Error(`Unknown job type: ${job.job_type}`);
      }

      // Mark completed
      await supabase
        .from('tam_job_queue')
        .update({
          status: 'completed',
          progress: 100,
          result_summary: resultSummary,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    } catch (handlerError) {
      // Mark failed
      await supabase
        .from('tam_job_queue')
        .update({
          status: 'failed',
          result_summary: { error: handlerError.message },
        })
        .eq('id', jobId);

      throw handlerError;
    }

    return new Response(JSON.stringify({ success: true, resultSummary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
