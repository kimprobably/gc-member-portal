import React from 'react';
import { ArrowRight, CheckCircle2, PartyPopper, Rocket, BookOpen, Users } from 'lucide-react';

interface OnboardingCompleteProps {
  studentName?: string;
  onEnterCurriculum: () => void;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({
  studentName,
  onEnterCurriculum,
}) => {
  const nextSteps = [
    {
      icon: BookOpen,
      title: 'Start Module 1',
      description: 'Begin with the foundations of LinkedIn outreach',
    },
    {
      icon: Users,
      title: 'Join the Community',
      description: 'Connect with fellow bootcamp members on Slack',
    },
    {
      icon: Rocket,
      title: 'Take Action',
      description: 'Apply what you learn with weekly action items',
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 md:p-10 text-white text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur mb-5">
          <PartyPopper className="w-7 h-7" />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">You're All Set!</h1>
        <p className="text-base text-green-100 max-w-md mx-auto">
          {studentName ? `Congratulations, ${studentName}!` : 'Congratulations!'} Your onboarding is
          complete. You're ready to start your LinkedIn mastery journey.
        </p>
      </div>

      {/* Success Indicator */}
      <div className="flex items-center justify-center -mt-5 relative z-10">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Setup Complete
        </div>
      </div>

      {/* What's Next */}
      <div className="p-6 md:p-8">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 text-center">
          What's Next?
        </h2>
        <div className="space-y-3">
          {nextSteps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                <step.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="font-medium text-zinc-900 dark:text-white">{step.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Motivation */}
        <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-lg">
          <p className="text-sm text-violet-800 dark:text-violet-200 text-center italic">
            "The journey of a thousand leads begins with a single message."
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 md:p-8 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onEnterCurriculum}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
        >
          Enter the Curriculum
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-xs text-zinc-500 text-center mt-3">
          You can always access settings and support from the sidebar
        </p>
      </div>
    </div>
  );
};

export default OnboardingComplete;
