import React from 'react';
import { Check, Circle } from 'lucide-react';
import { OnboardingStep } from '../../../types/bootcamp-types';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  totalProgress: number;
  studentName?: string;
  onStepClick?: (step: OnboardingStep) => void;
}

const STEPS: { id: OnboardingStep; label: string }[] = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'video', label: 'Intro Video' },
  { id: 'survey', label: 'About You' },
  { id: 'ai-tools', label: 'AI Tools' },
  { id: 'slack', label: 'Join Slack' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'complete', label: 'Complete' },
];

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  completedSteps,
  totalProgress,
  studentName,
  onStepClick,
}) => {
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="h-screen bg-zinc-50 dark:bg-zinc-950 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-base font-semibold text-zinc-900 dark:text-white">
            LinkedIn Bootcamp
          </h1>
          {studentName && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Welcome, {studentName}</p>
          )}
        </div>

        {/* Progress */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-zinc-600 dark:text-zinc-400">Setup Progress</span>
            <span className="font-medium text-zinc-900 dark:text-white">{totalProgress}%</span>
          </div>
          <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = step.id === currentStep;
              const isPast = index < currentStepIndex;
              const isClickable = (isCompleted || isPast) && onStepClick && !isCurrent;

              return (
                <li key={step.id}>
                  <button
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                        : isCompleted || isPast
                          ? 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'
                          : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                            ? 'bg-violet-500 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-700'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : isCurrent ? (
                        <span className="text-xs">{index + 1}</span>
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                    </div>
                    <span>{step.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">Need help? Contact support</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-40 flex items-center justify-between px-4">
        <span className="font-semibold text-sm text-zinc-900 dark:text-white">
          LinkedIn Bootcamp
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{totalProgress}%</span>
          <div className="w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-14 lg:pt-0 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex justify-center pb-8">
            <div className="w-full max-w-2xl">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingLayout;
