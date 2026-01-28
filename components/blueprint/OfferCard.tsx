import React from 'react';
import { Check } from 'lucide-react';

// ============================================
// Types
// ============================================

export interface OfferCardProps {
  offerType: 'foundations' | 'engineering';
  isRecommended: boolean;
  paymentUrl?: string;
}

// ============================================
// Offer Data
// ============================================

interface OfferData {
  name: string;
  price: string;
  paymentPlan: string;
  description: string;
  bullets: string[];
  idealFor: string;
}

const OFFER_DATA: Record<'foundations' | 'engineering', OfferData> = {
  foundations: {
    name: 'GTM Foundations',
    price: '$997',
    paymentPlan: 'Or 3 payments of $367',
    description:
      'The complete system to build your LinkedIn authority and generate consistent inbound leads.',
    bullets: [
      'Profile optimization framework',
      'Content strategy & templates',
      '30-day posting calendar',
      'Lead magnet creation guide',
      'DM scripts & outreach templates',
      'Weekly group coaching calls',
      '90-day implementation roadmap',
    ],
    idealFor: 'Solopreneurs getting started with LinkedIn lead generation',
  },
  engineering: {
    name: 'GTM Engineering',
    price: '$3,500',
    paymentPlan: 'Or 4 payments of $1,000',
    description:
      'Advanced systems and 1:1 support to scale your LinkedIn presence and automate lead generation.',
    bullets: [
      'Everything in GTM Foundations',
      '1:1 strategy sessions (4 calls)',
      'Custom automation setup',
      'Advanced analytics dashboard',
      'Done-with-you content calendar',
      'Priority support & Slack access',
      'Quarterly business reviews',
      'Lifetime community access',
    ],
    idealFor: 'Businesses earning $10k+/mo ready to scale their lead generation',
  },
};

// ============================================
// OfferCard Component
// ============================================

const OfferCard: React.FC<OfferCardProps> = ({ offerType, isRecommended, paymentUrl }) => {
  const offer = OFFER_DATA[offerType];

  const cardClasses = isRecommended
    ? 'bg-zinc-900 border-2 border-violet-500 rounded-xl p-6 relative'
    : 'bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 relative';

  return (
    <div className={cardClasses}>
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-violet-500 text-white text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wide">
            Recommended for You
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <h3 className="text-2xl font-bold text-zinc-100 mb-2">{offer.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-zinc-100">{offer.price}</span>
        </div>
        <p className="text-zinc-400 text-sm mt-1">{offer.paymentPlan}</p>
      </div>

      {/* Description */}
      <p className={`text-center mb-6 ${isRecommended ? 'text-zinc-300' : 'text-zinc-400'}`}>
        {offer.description}
      </p>

      {/* Ideal For */}
      <div className="bg-zinc-800/50 rounded-lg px-4 py-3 mb-6">
        <p className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">Ideal for:</span> {offer.idealFor}
        </p>
      </div>

      {/* Bullets */}
      <ul className="space-y-3 mb-8">
        {offer.bullets.map((bullet, index) => (
          <li key={index} className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                isRecommended ? 'bg-violet-500/20' : 'bg-zinc-700/50'
              }`}
            >
              <Check className={`w-3 h-3 ${isRecommended ? 'text-violet-400' : 'text-zinc-400'}`} />
            </div>
            <span className={isRecommended ? 'text-zinc-200' : 'text-zinc-400'}>{bullet}</span>
          </li>
        ))}
      </ul>

      {/* Enroll Button */}
      {paymentUrl ? (
        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full py-4 px-6 rounded-lg font-semibold text-center transition-colors ${
            isRecommended
              ? 'bg-violet-500 hover:bg-violet-600 text-white'
              : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100'
          }`}
        >
          Enroll Now
        </a>
      ) : (
        <button
          disabled
          className="block w-full py-4 px-6 rounded-lg font-semibold text-center bg-zinc-800 text-zinc-500 cursor-not-allowed"
        >
          Coming Soon
        </button>
      )}

      {/* Payment Plan Note */}
      <p className="text-center text-zinc-400 text-sm mt-3">
        {paymentUrl ? offer.paymentPlan : 'Payment plans available'}
      </p>
    </div>
  );
};

export default OfferCard;
