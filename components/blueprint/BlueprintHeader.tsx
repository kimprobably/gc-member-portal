import React, { useState } from 'react';
import { Prospect, getProspectDisplayName } from '../../types/blueprint-types';

// ============================================
// Types
// ============================================

interface BlueprintHeaderProps {
  prospect: Prospect;
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
      <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center">
        <span className="text-2xl font-bold text-violet-400">{initial}</span>
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
// BlueprintHeader Component
// ============================================

const BlueprintHeader: React.FC<BlueprintHeaderProps> = ({ prospect }) => {
  const displayName = getProspectDisplayName(prospect);
  const authorityScore = prospect.authorityScore ?? 0;
  const scoreSummary = prospect.scoreSummary;
  const companyAndTitle = [prospect.company, prospect.jobTitle].filter(Boolean).join(' | ');

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          <Avatar src={prospect.profilePhoto} name={displayName} />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            GTM BLUEPRINT FOR <span className="text-violet-400">{displayName.toUpperCase()}</span>
          </h1>

          {/* Company + Job Title */}
          {companyAndTitle && (
            <p className="mt-1 text-zinc-400 text-sm sm:text-base truncate">{companyAndTitle}</p>
          )}
        </div>

        {/* Authority Score */}
        <div className="flex-shrink-0 text-center sm:text-right">
          <div className="text-5xl sm:text-6xl font-bold text-violet-500 leading-none">
            {authorityScore}
          </div>
          <div className="mt-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Authority Score
          </div>
        </div>
      </div>

      {/* Score Summary */}
      {scoreSummary && (
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <p className="text-zinc-400 text-sm leading-relaxed">{scoreSummary}</p>
        </div>
      )}
    </div>
  );
};

export default BlueprintHeader;
