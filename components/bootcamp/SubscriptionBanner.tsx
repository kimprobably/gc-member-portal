import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SubscriptionBannerProps {
  daysRemaining: number;
  onSubscribe: () => void;
  onDismiss: () => void;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  daysRemaining,
  onSubscribe,
  onDismiss,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg mb-4 ${
        isDarkMode
          ? 'bg-amber-900/30 border border-amber-700'
          : 'bg-amber-50 border border-amber-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
        <p className={`text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
          Your AI tools access expires in{' '}
          <strong>
            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
          </strong>
          . Subscribe to keep access + get weekly coaching.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSubscribe}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700"
        >
          Subscribe
        </button>
        <button
          onClick={onDismiss}
          className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-amber-800' : 'hover:bg-amber-100'}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
