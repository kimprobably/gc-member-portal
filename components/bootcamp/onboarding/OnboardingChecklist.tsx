import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ListChecks,
  ExternalLink,
  Play,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import {
  BootcampOnboardingCategoryGroup,
  BootcampOnboardingProgressItem,
  BootcampProgressStatus,
} from '../../../types/bootcamp-types';

interface OnboardingChecklistProps {
  categories: BootcampOnboardingCategoryGroup[];
  totalProgress: number;
  onToggleItem: (item: BootcampOnboardingProgressItem, newStatus: BootcampProgressStatus) => void;
  onContinue: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

const getItemIcon = (item: BootcampOnboardingProgressItem) => {
  if (item.category === 'Community') {
    if (item.item.toLowerCase().includes('slack')) {
      return <MessageSquare className="w-4 h-4" />;
    }
    if (item.item.toLowerCase().includes('calendar')) {
      return <Calendar className="w-4 h-4" />;
    }
  }
  if (item.videoUrl) {
    return <Play className="w-4 h-4" />;
  }
  return null;
};

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  categories,
  totalProgress,
  onToggleItem,
  onContinue,
  onBack,
  isLoading,
}) => {
  const handleToggle = (item: BootcampOnboardingProgressItem) => {
    const newStatus: BootcampProgressStatus =
      item.progressStatus === 'Complete' ? 'Not Started' : 'Complete';
    onToggleItem(item, newStatus);
  };

  const allRequiredComplete = categories.every((cat) =>
    cat.items.filter((i) => i.isRequired).every((i) => i.progressStatus === 'Complete')
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium mb-2">
          <ListChecks className="w-4 h-4" />
          <span>Final Setup</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Complete Your Setup
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Just a few more steps to get you fully set up and ready to go.
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">Progress</span>
            <span className="font-medium text-slate-900 dark:text-white">{totalProgress}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="p-6 md:p-8">
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {category.name}
                </h3>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {category.completedCount}/{category.totalCount}
                </span>
              </div>

              <div className="space-y-2">
                {category.items.map((item) => {
                  const isComplete = item.progressStatus === 'Complete';
                  const itemIcon = getItemIcon(item);

                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                        isComplete
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => handleToggle(item)}
                        disabled={isLoading}
                        className={`mt-0.5 flex-shrink-0 ${
                          isComplete
                            ? 'text-green-500'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              isComplete
                                ? 'text-green-700 dark:text-green-400 line-through'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.item}
                          </span>
                          {!item.isRequired && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              Optional
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {item.description}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 mt-2">
                          {item.docLink && (
                            <a
                              href={item.docLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              {itemIcon}
                              <span>View guide</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {item.videoUrl && (
                            <a
                              href={item.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              <Play className="w-3 h-3" />
                              <span>Watch video</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 md:p-8 border-t border-slate-200 dark:border-slate-800">
        {!allRequiredComplete && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-4 text-center">
            Complete all required items to continue
          </p>
        )}
        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium rounded-xl transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={onContinue}
            disabled={!allRequiredComplete || isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Complete Setup
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingChecklist;
