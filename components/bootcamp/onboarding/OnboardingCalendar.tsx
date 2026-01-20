import React from 'react';
import { Calendar, Check, ExternalLink } from 'lucide-react';

interface OnboardingCalendarProps {
  calendarUrl?: string;
  onContinue: () => void;
  onBack?: () => void;
  onMarkAdded?: () => void;
}

const OnboardingCalendar: React.FC<OnboardingCalendarProps> = ({
  calendarUrl,
  onContinue,
  onBack,
  onMarkAdded,
}) => {
  const handleAddClick = () => {
    if (calendarUrl) {
      window.open(calendarUrl, '_blank');
    }
  };

  const handleMarkAdded = () => {
    onMarkAdded?.();
    onContinue();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-medium mb-2">
          <Calendar className="w-4 h-4" />
          <span>Schedule</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
          Add Sessions to Your Calendar
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Never miss a live session or Q&A call by adding them to your calendar.
        </p>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <div className="max-w-md mx-auto text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>

          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">
            What you'll get
          </h2>
          <ul className="text-left space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">
                Live training sessions with your cohort
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">
                Q&A calls to get your questions answered
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">
                Automatic reminders so you never miss a session
              </span>
            </li>
          </ul>

          {calendarUrl ? (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors mb-4"
            >
              Add to Calendar
              <ExternalLink className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Calendar invites will be sent to your email shortly.
              </p>
            </div>
          )}

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {calendarUrl
              ? 'After adding, click "Done" below'
              : 'Click "Done" once you\'ve received the invite'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 md:p-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleMarkAdded}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
          >
            Done
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCalendar;
