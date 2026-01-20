import React from 'react';
import { ArrowRight, Sparkles, Users, Video, Wrench } from 'lucide-react';

interface OnboardingWelcomeProps {
  studentName?: string;
  welcomeMessage?: string;
  onContinue: () => void;
}

const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  studentName,
  welcomeMessage,
  onContinue,
}) => {
  const features = [
    {
      icon: Video,
      title: 'Video Lessons',
      description: 'Step-by-step training on LinkedIn outreach',
    },
    {
      icon: Wrench,
      title: 'AI-Powered Tools',
      description: 'Access to automation and personalization tools',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with fellow bootcamp members',
    },
    {
      icon: Sparkles,
      title: 'Live Support',
      description: 'Weekly calls and direct Slack access',
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-700 p-8 md:p-10 text-white">
        <div className="flex items-center gap-2 text-violet-200 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Welcome to the Bootcamp</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">
          {studentName ? `Hey ${studentName}!` : 'Welcome!'}
        </h1>
        <p className="text-base text-violet-100 max-w-lg">
          {welcomeMessage ||
            "You're about to master LinkedIn outreach and start generating quality leads for your business. Let's get you set up."}
        </p>
      </div>

      {/* Features Grid */}
      <div className="p-6 md:p-8">
        <h2 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
          What's Included
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Setup Info */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Quick setup:</strong> We'll guide you through a few simple steps to personalize
            your experience and get you access to everything you need.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
        >
          Let's Get Started
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingWelcome;
