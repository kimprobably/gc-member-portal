import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, ChevronDown, ChevronUp, Lock, Calendar } from 'lucide-react';
import { getProspectBySlug, getBlueprintSettings } from '../../services/blueprint-supabase';
import { Prospect, BlueprintSettings, getProspectDisplayName } from '../../types/blueprint-types';
import OfferCard from './OfferCard';

// ============================================
// Types
// ============================================

interface OfferPageData {
  prospect: Prospect;
  settings: BlueprintSettings | null;
}

// ============================================
// Loading State Component
// ============================================

const OfferLoadingState: React.FC = () => (
  <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
    <p className="mt-4 text-zinc-400 text-sm font-medium">Loading your offers...</p>
  </div>
);

// ============================================
// 404 State Component
// ============================================

const OfferNotFound: React.FC = () => (
  <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
    <div className="text-center max-w-md">
      <h1 className="text-6xl font-bold text-zinc-100 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-zinc-100 mb-2">Offer Page Not Found</h2>
      <p className="text-zinc-400 mb-8">
        We couldn't find the offer page you're looking for. Please check the URL or contact support
        if you believe this is an error.
      </p>
      <a
        href="/"
        className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
);

// ============================================
// Error State Component
// ============================================

interface OfferErrorProps {
  message?: string;
  onRetry?: () => void;
}

const OfferError: React.FC<OfferErrorProps> = ({
  message = 'Something went wrong while loading offers.',
  onRetry,
}) => (
  <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-semibold text-zinc-100 mb-2">Error Loading Offers</h2>
      <p className="text-zinc-400 mb-8">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// ============================================
// Offer Not Unlocked State
// ============================================

interface OfferLockedProps {
  prospectName: string;
}

const OfferLocked: React.FC<OfferLockedProps> = ({ prospectName }) => (
  <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
    <div className="text-center max-w-lg">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
        <Lock className="w-10 h-10 text-zinc-400" />
      </div>
      <h1 className="text-3xl font-bold text-zinc-100 mb-4">Offers Not Yet Available</h1>
      <p className="text-zinc-400 mb-8 text-lg">
        Hi {prospectName}, your personalized offers are not yet available. This page will be
        unlocked after your strategy call.
      </p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <p className="text-zinc-300 mb-4">
          Haven't scheduled your call yet? Book a time to discuss your blueprint and unlock your
          exclusive offers.
        </p>
        <a
          href="#book-call"
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
        >
          <Calendar className="w-5 h-5" />
          Book Your Strategy Call
        </a>
      </div>
    </div>
  </div>
);

// ============================================
// Testimonials Placeholder Component
// ============================================

const TestimonialsSection: React.FC = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
    <h2 className="text-2xl font-bold text-zinc-100 text-center mb-6">
      What Our Members Are Saying
    </h2>
    {/* Senja Embed Placeholder */}
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 text-center">
      <p className="text-zinc-400 text-sm">[Senja Testimonials Widget - Embed Code Goes Here]</p>
      <p className="text-zinc-500 text-xs mt-2">
        Configure Senja widget in settings to display testimonials
      </p>
    </div>
  </div>
);

// ============================================
// Book Call Section
// ============================================

const BookCallSection: React.FC = () => (
  <div className="text-center py-8 border-t border-zinc-800">
    <h3 className="text-xl font-semibold text-zinc-100 mb-3">Still Have Questions?</h3>
    <p className="text-zinc-400 mb-6 max-w-md mx-auto">
      Not sure which program is right for you? Book another call and we'll help you decide.
    </p>
    <a
      href="#book-call"
      className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-lg transition-colors border border-zinc-700"
    >
      <Calendar className="w-5 h-5" />
      Book Another Call
    </a>
  </div>
);

// ============================================
// Main OfferPage Component
// ============================================

const OfferPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [data, setData] = useState<OfferPageData | null>(null);
  const [showOtherOffer, setShowOtherOffer] = useState(false);

  // Fetch data
  const fetchOfferData = async () => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      // Fetch prospect by slug first
      const prospect = await getProspectBySlug(slug);

      if (!prospect) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch settings
      const settings = await getBlueprintSettings();

      setData({
        prospect,
        settings,
      });
    } catch (err) {
      console.error('Failed to load offer data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Handle loading state
  if (loading) {
    return <OfferLoadingState />;
  }

  // Handle 404 state
  if (notFound) {
    return <OfferNotFound />;
  }

  // Handle error state
  if (error) {
    return <OfferError message={error} onRetry={fetchOfferData} />;
  }

  // Handle no data
  if (!data) {
    return <OfferError message="No data available" onRetry={fetchOfferData} />;
  }

  const { prospect, settings } = data;

  // Check if offer is unlocked
  if (!prospect.offerUnlocked) {
    return <OfferLocked prospectName={prospect.firstName || getProspectDisplayName(prospect)} />;
  }

  // Determine recommended offer
  // Map recommendedOffer to foundations/engineering: bootcamp -> foundations, gc/dfy -> engineering
  const recommendedType: 'foundations' | 'engineering' =
    prospect.recommendedOffer === 'bootcamp' ? 'foundations' : 'engineering';
  const otherType: 'foundations' | 'engineering' =
    recommendedType === 'foundations' ? 'engineering' : 'foundations';

  // Get payment URLs from settings (if available)
  const foundationsPaymentUrl = settings?.bootcampOfferUrl || undefined;
  const engineeringPaymentUrl = settings?.gcOfferUrl || undefined;

  const getPaymentUrl = (type: 'foundations' | 'engineering') => {
    return type === 'foundations' ? foundationsPaymentUrl : engineeringPaymentUrl;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-100 mb-4">
            Your Personalized Offers, {prospect.firstName || 'Friend'}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Based on your blueprint analysis, we've selected the perfect program to help you achieve
            your LinkedIn goals.
          </p>
        </div>

        {/* Seller's Personalized Note */}
        {prospect.offerNote && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-zinc-100 mb-3">A Note For You</h2>
            <p className="text-zinc-300 whitespace-pre-wrap">{prospect.offerNote}</p>
          </div>
        )}

        {/* Recommended Offer Card */}
        <div className="mb-8">
          <OfferCard
            offerType={recommendedType}
            isRecommended={true}
            paymentUrl={getPaymentUrl(recommendedType)}
          />
        </div>

        {/* Other Offer - Expandable */}
        <div className="mb-12">
          <button
            onClick={() => setShowOtherOffer(!showOtherOffer)}
            className="w-full flex items-center justify-center gap-2 py-4 text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <span className="text-sm font-medium">
              {showOtherOffer ? 'Hide other options' : 'See other options'}
            </span>
            {showOtherOffer ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {showOtherOffer && (
            <div className="mt-4">
              <OfferCard
                offerType={otherType}
                isRecommended={false}
                paymentUrl={getPaymentUrl(otherType)}
              />
            </div>
          )}
        </div>

        {/* Testimonials Section */}
        <div className="mb-12">
          <TestimonialsSection />
        </div>

        {/* Book Another Call Section */}
        <BookCallSection />
      </div>
    </div>
  );
};

export default OfferPage;
