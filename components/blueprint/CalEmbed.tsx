import React, { forwardRef, useEffect } from 'react';

// ============================================
// Types
// ============================================

export interface CalProspectInfo {
  name?: string;
  email?: string;
  company?: string;
  authorityScore?: number;
}

interface CalEmbedProps {
  calLink: string; // e.g., "vlad-timinski-pqqica/30min"
  className?: string;
  prospectInfo?: CalProspectInfo;
}

// ============================================
// Helpers
// ============================================

/**
 * Build a Cal.com booking URL with pre-filled prospect information.
 * Supports both embed (iframe) and standalone (new tab) modes.
 *
 * Query params used:
 *  - name: prospect full name
 *  - email: prospect email
 *  - a1: company name (Cal.com custom field)
 *  - a2: authority score (Cal.com custom field)
 */
export function buildCalBookingUrl(
  calLink: string,
  options?: {
    embed?: boolean;
    theme?: 'light' | 'dark';
    prospectInfo?: CalProspectInfo;
  }
): string {
  // Allow an env var override for the base Cal.com URL
  const baseUrl = import.meta.env.VITE_CALCOM_BOOKING_URL
    ? import.meta.env.VITE_CALCOM_BOOKING_URL.replace(/\/+$/, '')
    : `https://cal.com/${calLink}`;

  const params = new URLSearchParams();

  if (options?.embed) {
    params.set('embed', 'true');
    params.set('layout', 'month_view');
  }

  if (options?.theme) {
    params.set('theme', options.theme);
  }

  const info = options?.prospectInfo;
  if (info?.name) params.set('name', info.name);
  if (info?.email) params.set('email', info.email);
  if (info?.company) params.set('a1', info.company);
  if (info?.authorityScore != null) params.set('a2', String(info.authorityScore));

  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

// ============================================
// CalEmbed Component
// ============================================

/**
 * Cal.com inline embed via iframe.
 * Listens for postMessage from the Cal.com iframe to detect booking
 * completion and redirect to the call-booked thank-you page.
 */
const CalEmbed = forwardRef<HTMLDivElement, CalEmbedProps>(
  ({ calLink, className = '', prospectInfo }, ref) => {
    const isDark =
      typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
    const calUrl = buildCalBookingUrl(calLink, {
      embed: true,
      theme: isDark ? 'dark' : 'light',
      prospectInfo,
    });
    const redirectUrl = `${window.location.origin}/blueprint/call-booked`;

    useEffect(() => {
      const handleMessage = (event: { origin: string; data: unknown }) => {
        // Cal.com embeds post messages from these origins
        if (!event.origin.includes('cal.com') && !event.origin.includes('app.cal.com')) {
          return;
        }

        try {
          const raw = event.data;
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

          // Cal.com uses different event formats — check for all known booking signals
          if (
            data?.action === 'bookingSuccessful' ||
            data?.type === 'booking_successful' ||
            data?.data?.type === 'booking_successful' ||
            (data?.type === '__routeChanged' &&
              typeof data?.data === 'string' &&
              data.data.includes('booking'))
          ) {
            window.location.href = redirectUrl;
          }
        } catch {
          // Not a message we care about
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [redirectUrl]);

    return (
      <div
        ref={ref}
        className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none overflow-hidden ${className}`}
        data-section="CalEmbed"
        style={{ scrollMarginTop: '16px' }}
      >
        <div className="relative w-full" style={{ minHeight: '650px' }}>
          <iframe
            src={calUrl}
            title="Book a call"
            className="w-full h-full absolute inset-0 border-0"
            style={{ minHeight: '650px' }}
            allow="payment"
          />
        </div>
      </div>
    );
  }
);

CalEmbed.displayName = 'CalEmbed';

export default CalEmbed;
