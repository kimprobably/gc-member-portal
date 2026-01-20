import React from 'react';
import { MessageSquare, Check, ExternalLink } from 'lucide-react';

interface OnboardingSlackProps {
  slackUrl?: string;
  onContinue: () => void;
  onBack?: () => void;
  onMarkJoined?: () => void;
}

const OnboardingSlack: React.FC<OnboardingSlackProps> = ({
  slackUrl = 'https://slack.com',
  onContinue,
  onBack,
  onMarkJoined,
}) => {
  const handleJoinClick = () => {
    window.open(slackUrl, '_blank');
  };

  const handleMarkJoined = () => {
    onMarkJoined?.();
    onContinue();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-medium mb-2">
          <MessageSquare className="w-4 h-4" />
          <span>Community</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
          Join Our Slack Community
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Connect with fellow bootcamp members, get support, and share wins.
        </p>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <div className="max-w-md mx-auto text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>

          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">Why join?</h2>
          <ul className="text-left space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">
                Get answers to your questions from instructors and peers
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">
                Share your wins and get feedback on your outreach
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">
                Network with other founders and sales professionals
              </span>
            </li>
          </ul>

          <button
            onClick={handleJoinClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors mb-4"
          >
            Open Slack Invite
            <ExternalLink className="w-4 h-4" />
          </button>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            After joining, click "I've Joined" below
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
            onClick={handleMarkJoined}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
          >
            I've Joined Slack
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlack;
