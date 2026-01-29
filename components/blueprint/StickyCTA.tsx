import React, { useState, useEffect } from 'react';
import CTAButton from './CTAButton';

// ============================================
// Types
// ============================================

interface StickyCTAProps {
  text: string;
  calEmbedRef: React.RefObject<HTMLDivElement>;
  isVisible?: boolean; // from settings - controls whether sticky CTA is enabled
  onCTAClick?: () => void;
}

// ============================================
// StickyCTA Component
// ============================================

/**
 * Fixed bottom bar with CTA button
 * Hides when Cal embed section is in viewport using IntersectionObserver
 * Semi-transparent background with backdrop blur
 */
const StickyCTA: React.FC<StickyCTAProps> = ({
  text,
  calEmbedRef,
  isVisible = true,
  onCTAClick,
}) => {
  const [isCalEmbedVisible, setIsCalEmbedVisible] = useState(false);

  // Use IntersectionObserver to detect when CalEmbed is in viewport
  useEffect(() => {
    const calEmbedElement = calEmbedRef.current;

    if (!calEmbedElement) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Entry is intersecting when CalEmbed is visible in viewport
        entries.forEach((entry) => {
          setIsCalEmbedVisible(entry.isIntersecting);
        });
      },
      {
        // Trigger when any part of the CalEmbed is visible
        threshold: 0,
        // Show sticky CTA until CalEmbed is nearly in view, hide while visible,
        // reappear when user scrolls back up past it
        rootMargin: '0px 0px -100px 0px',
      }
    );

    observer.observe(calEmbedElement);

    return () => {
      observer.disconnect();
    };
  }, [calEmbedRef]);

  // Handle CTA click - scroll to CalEmbed section
  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
      return;
    }

    // Default behavior: scroll to CalEmbed section
    const calEmbedElement = calEmbedRef.current;
    if (calEmbedElement) {
      calEmbedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Don't render if disabled via settings or CalEmbed is visible
  const shouldHide = !isVisible || isCalEmbedVisible;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm
        border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-none
        transform transition-all duration-300 ease-in-out
        ${shouldHide ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
      `}
      aria-hidden={shouldHide}
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <CTAButton text={text} onClick={handleCTAClick} icon="calendar" variant="primary" />
        </div>
      </div>
    </div>
  );
};

export default StickyCTA;
