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
// Prospeo API helpers (https://prospeo.io/api-docs)
// ============================================

const PROSPEO_BASE = 'https://api.prospeo.io';

function prospeoHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'X-KEY': apiKey,
  };
}

// ============================================
// BlitzAPI helpers (direct API — https://docs.blitz-api.ai)
// Kept for future use when BLITZ_API_KEY is available
// ============================================

const BLITZAPI_BASE = 'https://api.blitz-api.ai/v2';

function blitzApiHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };
}

// ============================================
// Build Prospeo filters from ICP profile
// ============================================

function buildProspeoCompanyFilters(icpProfile: any): Record<string, any> {
  const filters: Record<string, any> = {};

  // Industry filter
  if (icpProfile.industryKeywords?.length) {
    filters.company_industry = {
      include: icpProfile.industryKeywords,
    };
  }

  // Employee size filter — map wizard ranges to Prospeo ranges
  if (icpProfile.employeeSizeRanges?.length) {
    const sizeMap: Record<string, string> = {
      '1-10': '1-10',
      '11-50': '11-50',
      '51-200': '51-200',
      '201-1000': '201-1000',
      '1000+': '1001-5000',
    };
    const prospeoSizes = icpProfile.employeeSizeRanges
      .map((s: string) => sizeMap[s])
      .filter(Boolean);
    if (prospeoSizes.length > 0) {
      filters.company_size = { include: prospeoSizes };
    }
  }

  // Location filter
  if (icpProfile.geography === 'us_only') {
    filters.company_location = { include: ['United States'] };
  } else if (
    icpProfile.geography === 'specific_countries' &&
    icpProfile.specificCountries?.length
  ) {
    filters.company_location = { include: icpProfile.specificCountries };
  }

  // Seed company domains — search by website
  if (icpProfile.seedCompanyDomains?.length) {
    filters.company = {
      websites: { include: icpProfile.seedCompanyDomains },
    };
  }

  return filters;
}

function buildProspeoPersonFilters(icpProfile: any, companyDomains: string[]): Record<string, any> {
  const filters: Record<string, any> = {};

  // Target companies by domain
  if (companyDomains.length > 0) {
    filters.company = {
      websites: { include: companyDomains.slice(0, 500) },
    };
  }

  // Seniority filter
  const seniorityMap: Record<string, string> = {
    'C-Suite': 'C-Level',
    VP: 'VP',
    Director: 'Director',
    Manager: 'Manager',
    Founder: 'Founder/Owner',
  };
  if (icpProfile.seniorityPreference?.length) {
    const mapped = icpProfile.seniorityPreference
      .map((s: string) => seniorityMap[s])
      .filter(Boolean);
    if (mapped.length > 0) {
      filters.person_seniority = { include: mapped };
    }
  }

  // Location filter
  if (icpProfile.geography === 'us_only') {
    filters.person_location = { include: ['United States'] };
  } else if (
    icpProfile.geography === 'specific_countries' &&
    icpProfile.specificCountries?.length
  ) {
    filters.person_location = { include: icpProfile.specificCountries };
  }

  return filters;
}

// ============================================
// Source Companies (Prospeo search-company)
// ============================================

async function handleSourceCompanies(supabase: any, job: any, project: any) {
  const prospeoKey = Deno.env.get('PROSPEO_API_KEY');
  if (!prospeoKey) throw new Error('PROSPEO_API_KEY not configured');

  const icpProfile = project?.icp_profile || {};
  const filters = buildProspeoCompanyFilters(icpProfile);

  // Need at least one include filter for Prospeo
  if (Object.keys(filters).length === 0) {
    // Default: search by business model keyword as industry
    const modelKeywords: Record<string, string[]> = {
      b2b_saas: ['Software', 'Information Technology'],
      ecommerce_dtc: ['Retail', 'E-commerce'],
      amazon_sellers: ['Retail', 'E-commerce'],
      local_service: ['Professional Services'],
      agencies: ['Marketing & Advertising', 'Professional Services'],
    };
    const keywords = modelKeywords[icpProfile.businessModel] || ['Software'];
    filters.company_industry = { include: keywords };
  }

  let companies: any[] = [];
  const maxPages = 4; // Up to 100 companies (25 per page)

  for (let page = 1; page <= maxPages; page++) {
    try {
      const response = await fetch(`${PROSPEO_BASE}/search-company`, {
        method: 'POST',
        headers: prospeoHeaders(prospeoKey),
        body: JSON.stringify({ filters, page }),
      });

      const data = await response.json();

      if (data.error) {
        if (data.error_code === 'NO_RESULTS') break;
        if (data.error_code === 'RATE_LIMITED') {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        throw new Error(`Prospeo error: ${data.error_code} — ${data.filter_error || ''}`);
      }

      const pageCompanies = (data.results || []).map((r: any) => ({
        name: r.company?.name || null,
        domain: r.company?.domain || r.company?.website || null,
        linkedin_url: r.company?.linkedin_url || null,
        industry: r.company?.industry || null,
        employee_count: r.company?.employee_count || null,
        location:
          [r.company?.location?.city, r.company?.location?.state, r.company?.location?.country]
            .filter(Boolean)
            .join(', ') || null,
        description: r.company?.description || r.company?.description_seo || null,
        raw: r.company,
      }));

      companies.push(...pageCompanies);

      // Stop if we got fewer than a full page
      const totalPages = data.pagination?.total_page || 1;
      if (page >= totalPages) break;

      // Rate limit between pages
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      if (page === 1) throw err; // Fail on first page error
      break; // Stop paginating on subsequent errors
    }

    const progress = Math.round((page / maxPages) * 50);
    await supabase.from('tam_job_queue').update({ progress }).eq('id', job.id);
  }

  // Deduplicate by domain
  const seen = new Set<string>();
  companies = companies.filter((c: any) => {
    if (!c.name) return false;
    if (c.domain && seen.has(c.domain)) return false;
    if (c.domain) seen.add(c.domain);
    return true;
  });

  // Insert companies into database
  if (companies.length > 0) {
    const insertData = companies.map((c: any) => ({
      project_id: job.project_id,
      name: c.name,
      domain: c.domain || null,
      linkedin_url: c.linkedin_url || null,
      source: 'prospeo',
      industry: c.industry || null,
      employee_count: c.employee_count || null,
      location: c.location || null,
      description: c.description || null,
      qualification_status: 'pending',
      raw_data: c.raw || c,
    }));

    const batchSize = 100;
    for (let i = 0; i < insertData.length; i += batchSize) {
      const batch = insertData.slice(i, i + batchSize);
      await supabase.from('tam_companies').insert(batch);

      const progress = 50 + Math.round(((i + batch.length) / insertData.length) * 50);
      await supabase.from('tam_job_queue').update({ progress }).eq('id', job.id);
    }
  }

  // Update project status
  await supabase.from('tam_projects').update({ status: 'sourcing' }).eq('id', job.project_id);

  return { companiesFound: companies.length, source: 'prospeo' };
}

// ============================================
// Qualification (Claude AI)
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
                content: `Evaluate if this company matches our ICP. Respond with JSON only: {"qualified": true/false, "reason": "brief reason"}

Company: ${company.name}
Domain: ${company.domain || 'unknown'}
Description: ${company.description || 'none'}
Industry: ${company.industry || 'unknown'}
Employee count: ${company.employee_count || 'unknown'}
Location: ${company.location || 'unknown'}

ICP Criteria:
- Business model: ${icpProfile.businessModel || 'any'}
- What they sell: ${icpProfile.whatYouSell || 'not specified'}
- Target industries: ${icpProfile.industryKeywords?.join(', ') || 'any'}
- Employee size: ${icpProfile.employeeSizeRanges?.join(', ') || 'any'}
- Geography: ${icpProfile.geography || 'any'}
- Special criteria: ${icpProfile.specialCriteria || 'none'}`,
              },
            ],
          }),
        });

        const result = await response.json();
        const content = result.content?.[0]?.text || '';

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
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
        } else {
          // Can't parse — leave as pending for review
          await supabase
            .from('tam_companies')
            .update({
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

  // Update project status
  await supabase.from('tam_projects').update({ status: 'enriching' }).eq('id', job.project_id);

  return { qualified, disqualified, total: companies.length };
}

// ============================================
// Find Contacts (Prospeo search-person + enrich-person)
// ============================================

async function handleFindContacts(supabase: any, job: any, project: any) {
  const prospeoKey = Deno.env.get('PROSPEO_API_KEY');
  if (!prospeoKey) throw new Error('PROSPEO_API_KEY not configured');

  const icpProfile = project?.icp_profile || {};

  // Get qualified companies with domains
  const { data: companies } = await supabase
    .from('tam_companies')
    .select('*')
    .eq('project_id', job.project_id)
    .eq('qualification_status', 'qualified')
    .not('domain', 'is', null);

  if (!companies || companies.length === 0) {
    // Update project status even if no companies
    await supabase.from('tam_projects').update({ status: 'complete' }).eq('id', job.project_id);
    return { contactsFound: 0, emailsFound: 0, totalCompanies: 0 };
  }

  let contactsFound = 0;
  let emailsFound = 0;
  const maxContactsPerCompany = icpProfile.contactsPerCompany || 1;

  // Batch companies into groups of up to 500 domains (Prospeo limit)
  const batchSize = Math.min(companies.length, 500);
  const companyBatches: any[][] = [];
  for (let i = 0; i < companies.length; i += batchSize) {
    companyBatches.push(companies.slice(i, i + batchSize));
  }

  for (let batchIdx = 0; batchIdx < companyBatches.length; batchIdx++) {
    const batch = companyBatches[batchIdx];
    const domains = batch.map((c: any) => c.domain).filter(Boolean);
    const domainToCompany = new Map(batch.map((c: any) => [c.domain, c]));

    // Search for people at these companies
    const personFilters = buildProspeoPersonFilters(icpProfile, domains);
    const companyContactCounts = new Map<string, number>();

    // Paginate through results
    const maxPages = Math.ceil((domains.length * maxContactsPerCompany) / 25);
    const pageLimit = Math.min(maxPages, 20); // Cap at 20 pages (500 results)

    for (let page = 1; page <= pageLimit; page++) {
      try {
        const response = await fetch(`${PROSPEO_BASE}/search-person`, {
          method: 'POST',
          headers: prospeoHeaders(prospeoKey),
          body: JSON.stringify({ filters: personFilters, page }),
        });

        const data = await response.json();

        if (data.error) {
          if (data.error_code === 'NO_RESULTS') break;
          if (data.error_code === 'RATE_LIMITED') {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          break;
        }

        for (const result of data.results || []) {
          const person = result.person || {};
          const company = result.company || {};
          const companyDomain = company.domain || company.website || null;

          // Match to our company record
          const matchedCompany = companyDomain ? domainToCompany.get(companyDomain) : null;
          if (!matchedCompany) continue;

          // Check per-company limit
          const currentCount = companyContactCounts.get(matchedCompany.id) || 0;
          if (currentCount >= maxContactsPerCompany) continue;
          companyContactCounts.set(matchedCompany.id, currentCount + 1);

          // Enrich person to get email
          let email: string | null = null;
          let emailStatus = 'not_found';
          let phone: string | null = null;

          if (person.person_id) {
            try {
              const enrichResponse = await fetch(`${PROSPEO_BASE}/enrich-person`, {
                method: 'POST',
                headers: prospeoHeaders(prospeoKey),
                body: JSON.stringify({
                  data: { person_id: person.person_id },
                  only_verified_email: false,
                }),
              });

              const enrichData = await enrichResponse.json();
              if (!enrichData.error && enrichData.person) {
                if (enrichData.person.email?.email) {
                  email = enrichData.person.email.email;
                  emailStatus =
                    enrichData.person.email.status === 'verified' ? 'verified' : 'found';
                }
                if (enrichData.person.mobile?.mobile) {
                  phone = enrichData.person.mobile.mobile;
                }
              }
            } catch {
              // Continue without enrichment
            }

            // Rate limit enrichment calls
            await new Promise((r) => setTimeout(r, 200));
          }

          // Insert contact
          await supabase.from('tam_contacts').insert({
            company_id: matchedCompany.id,
            project_id: job.project_id,
            first_name: person.first_name || null,
            last_name: person.last_name || null,
            title: person.current_job_title || null,
            linkedin_url: person.linkedin_url || null,
            email: email,
            email_status: emailStatus,
            phone: phone,
            source: 'prospeo',
            raw_data: { person, company },
          });

          contactsFound++;
          if (email) emailsFound++;
        }

        // Stop if we got fewer than a full page
        const totalPages = data.pagination?.total_page || 1;
        if (page >= totalPages) break;

        // Rate limit between pages
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        break;
      }
    }

    // Update progress per batch
    const progress = Math.round(((batchIdx + 1) / companyBatches.length) * 100);
    await supabase.from('tam_job_queue').update({ progress }).eq('id', job.id);
  }

  // Update project status to complete
  await supabase.from('tam_projects').update({ status: 'complete' }).eq('id', job.project_id);

  return { contactsFound, emailsFound, totalCompanies: companies.length };
}

// ============================================
// LinkedIn Activity Check (Bright Data)
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
