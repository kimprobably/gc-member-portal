import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

// ============================================
// Types
// ============================================

interface CTAButtonProps {
  text: string;
  onClick?: () => void;
  /** When provided, renders an anchor that opens in a new tab instead of a button. */
  href?: string;
  className?: string;
  icon?: 'calendar' | 'arrow' | 'none';
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'large';
  subtext?: string;
  /** When true, primary variant uses CSS custom property --brand-primary instead of violet */
  useBrandColors?: boolean;
}

// ============================================
// CTAButton Component
// ============================================

/**
 * Contextual CTA button with violet styling
 * Can scroll to Cal embed section or open external link
 */
const CTAButton: React.FC<CTAButtonProps> = ({
  text,
  onClick,
  href,
  className = '',
  icon = 'calendar',
  variant = 'primary',
  size = 'default',
  subtext,
  useBrandColors = false,
}) => {
  const baseStyles =
    'inline-flex flex-col items-center justify-center gap-0 font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950';

  const sizeStyles = size === 'large' ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base';

  // When useBrandColors is true for primary variant, we apply inline styles instead of Tailwind classes
  const useBrandPrimary = useBrandColors && variant === 'primary';

  const variantStyles = useBrandPrimary
    ? 'text-white shadow-lg'
    : variant === 'primary'
      ? 'bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 focus:ring-violet-500'
      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 hover:border-zinc-400 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-600';

  const brandStyle: React.CSSProperties | undefined = useBrandPrimary
    ? {
        backgroundColor: 'var(--brand-primary)',
        boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--brand-primary) 25%, transparent)',
      }
    : undefined;

  const IconComponent = icon === 'calendar' ? Calendar : icon === 'arrow' ? ArrowRight : null;

  const content = (
    <>
      <span className="inline-flex items-center gap-2">
        <span>{text}</span>
        {IconComponent && <IconComponent className="w-4 h-4" />}
      </span>
      {subtext && <span className="block text-sm font-normal opacity-80 mt-1">{subtext}</span>}
    </>
  );

  // Render as an anchor when href is provided (opens in new tab)
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className} no-underline`}
        style={brandStyle}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      style={brandStyle}
    >
      {content}
    </button>
  );
};

export default CTAButton;
