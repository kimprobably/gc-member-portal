import React, { forwardRef } from 'react';

// ============================================
// Types
// ============================================

interface CalEmbedProps {
  calLink: string; // e.g., "timkeen/30min"
  className?: string;
}

// ============================================
// CalEmbed Component
// ============================================

/**
 * Cal.com inline embed component
 * Uses iframe to embed the Cal.com booking page
 * Accepts a ref for IntersectionObserver (used by StickyCTA)
 */
const CalEmbed = forwardRef<HTMLDivElement, CalEmbedProps>(({ calLink, className = '' }, ref) => {
  // Construct the Cal.com embed URL
  // Format: https://cal.com/{calLink}?embed=true&theme=dark
  const isDark =
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const redirectUrl = `${window.location.origin}/blueprint/call-booked`;
  const calUrl = `https://cal.com/${calLink}?embed=true&theme=${isDark ? 'dark' : 'light'}&layout=month_view&redirectUrl=${encodeURIComponent(redirectUrl)}`;

  return (
    <div
      ref={ref}
      className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none overflow-hidden ${className}`}
      data-section="CalEmbed"
      style={{ scrollMarginTop: '16px' }}
    >
      {/* Cal.com Iframe */}
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
});

CalEmbed.displayName = 'CalEmbed';

export default CalEmbed;
