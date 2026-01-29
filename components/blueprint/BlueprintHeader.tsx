import React, { useState } from 'react';
import { Prospect, getProspectDisplayName } from '../../types/blueprint-types';

// ============================================
// Types
// ============================================

interface BlueprintHeaderProps {
  prospect: Prospect;
  scorecardCount?: number;
}

// ============================================
// Avatar Component
// ============================================

interface AvatarProps {
  src?: string;
  name: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name }) => {
  const [imgError, setImgError] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  // Show fallback if no src or image failed to load
  if (!src || imgError) {
    return (
      <div className="w-20 h-20 rounded-full bg-violet-50 dark:bg-violet-500/20 flex items-center justify-center">
        <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{initial}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name}'s profile photo`}
      className="w-20 h-20 rounded-full object-cover"
      onError={() => setImgError(true)}
    />
  );
};

// ============================================
// Score Context Label
// ============================================

function getScoreContext(score: number): { label: string; colorClass: string } {
  if (score >= 70) {
    return { label: 'Above Average', colorClass: 'text-green-600 dark:text-green-400' };
  }
  if (score >= 40) {
    return { label: 'Average', colorClass: 'text-yellow-600 dark:text-yellow-400' };
  }
  return { label: 'Below Average', colorClass: 'text-red-600 dark:text-red-400' };
}

// ============================================
// BlueprintHeader Component
// ============================================

const BlueprintHeader: React.FC<BlueprintHeaderProps> = ({ prospect, scorecardCount }) => {
  const displayName = getProspectDisplayName(prospect);
  const authorityScore = prospect.authorityScore ?? 0;
  const scoreSummary = prospect.scoreSummary;
  const companyAndTitle = [prospect.company, prospect.jobTitle].filter(Boolean).join(' | ');
  const scoreContext = getScoreContext(authorityScore);

  return (
    <div>
      {/* Green eyebrow */}
      {scorecardCount != null && scorecardCount > 0 && (
        <div className="mb-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {scorecardCount.toLocaleString()}+ Scorecards Delivered
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            <Avatar src={prospect.profilePhoto} name={displayName} />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">
              We found 3 gaps costing you pipeline. Here&apos;s how to fix them.
            </p>
            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              GTM BLUEPRINT FOR{' '}
              <span className="text-violet-600 dark:text-violet-400">
                {displayName.toUpperCase()}
              </span>
            </h1>

            {/* Company + Job Title */}
            {companyAndTitle && (
              <p className="mt-1 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base truncate">
                {companyAndTitle}
              </p>
            )}
          </div>

          {/* Authority Score with context label */}
          <div className="flex-shrink-0 text-center sm:text-right">
            <div className="text-6xl sm:text-7xl font-bold text-violet-500 leading-none">
              {authorityScore}
            </div>
            <div className="mt-1 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Authority Score
            </div>
            <div className={`mt-1 text-xs font-semibold ${scoreContext.colorClass}`}>
              {scoreContext.label}
            </div>
          </div>
        </div>

        {/* Score Summary */}
        {scoreSummary && (
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              {scoreSummary}
            </p>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {scorecardCount ? `${scorecardCount.toLocaleString()}+` : '200+'}
            </div>
            <div className="text-xs text-zinc-500">Blueprints Delivered</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              $4.7M+
            </div>
            <div className="text-xs text-zinc-500">Pipeline Generated</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              20K+
            </div>
            <div className="text-xs text-zinc-500">Leads Created</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintHeader;
