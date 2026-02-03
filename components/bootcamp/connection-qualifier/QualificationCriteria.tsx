import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import type { QualificationCriteria as CriteriaType } from '../../../types/connection-qualifier-types';
import { DEFAULT_EXCLUDE_TITLES } from '../../../types/connection-qualifier-types';
import type { MemberICP } from '../../../types/gc-types';

interface QualificationCriteriaProps {
  savedIcp: MemberICP | null;
  onSubmit: (criteria: CriteriaType) => void;
  onBack: () => void;
}

function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = input.trim().replace(/,$/, '');
      if (trimmed && !tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
        onAdd(trimmed);
      }
      setInput('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs rounded-full"
          >
            {tag}
            <button
              onClick={() => onRemove(i)}
              className="hover:text-violet-900 dark:hover:text-violet-200"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={() => {
            const trimmed = input.trim();
            if (trimmed && !tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
              onAdd(trimmed);
            }
            setInput('');
          }}
          className="px-3 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function QualificationCriteria({
  savedIcp,
  onSubmit,
  onBack,
}: QualificationCriteriaProps) {
  const [targetTitles, setTargetTitles] = useState<string[]>([]);
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);
  const [excludeTitles, setExcludeTitles] = useState<string[]>([...DEFAULT_EXCLUDE_TITLES]);
  const [excludeCompanies, setExcludeCompanies] = useState<string[]>([]);
  const [connectedAfter, setConnectedAfter] = useState<string>('');
  const [freeTextDescription, setFreeTextDescription] = useState('');

  useEffect(() => {
    if (savedIcp) {
      if (savedIcp.jobTitles) {
        setTargetTitles(
          savedIcp.jobTitles
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        );
      }
      if (savedIcp.verticals) {
        setTargetIndustries(
          savedIcp.verticals
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        );
      }
      if (savedIcp.targetDescription) {
        setFreeTextDescription(savedIcp.targetDescription);
      }
    }
  }, [savedIcp]);

  const isValid =
    targetTitles.length > 0 || targetIndustries.length > 0 || freeTextDescription.trim().length > 0;

  const handleSubmit = () => {
    onSubmit({
      targetTitles,
      targetIndustries,
      excludeTitles,
      excludeCompanies,
      connectedAfter: connectedAfter || null,
      freeTextDescription,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Define Your Qualification Criteria
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Tell us who you're looking for. We'll filter out the noise and AI-qualify the rest.
          {savedIcp && (
            <span className="text-violet-600 dark:text-violet-400">
              {' '}
              Pre-filled from your saved ICP.
            </span>
          )}
        </p>
      </div>

      <div className="space-y-5">
        <TagInput
          label="Target Job Titles"
          tags={targetTitles}
          onAdd={(t) => setTargetTitles([...targetTitles, t])}
          onRemove={(i) => setTargetTitles(targetTitles.filter((_, idx) => idx !== i))}
          placeholder="e.g. CEO, Founder, VP Sales — press Enter to add"
        />

        <TagInput
          label="Target Industries / Company Types"
          tags={targetIndustries}
          onAdd={(t) => setTargetIndustries([...targetIndustries, t])}
          onRemove={(i) => setTargetIndustries(targetIndustries.filter((_, idx) => idx !== i))}
          placeholder="e.g. SaaS, Marketing Agency — press Enter to add"
        />

        <TagInput
          label="Exclude Job Titles"
          tags={excludeTitles}
          onAdd={(t) => setExcludeTitles([...excludeTitles, t])}
          onRemove={(i) => setExcludeTitles(excludeTitles.filter((_, idx) => idx !== i))}
          placeholder="e.g. Recruiter, HR — press Enter to add"
        />

        <TagInput
          label="Exclude Companies"
          tags={excludeCompanies}
          onAdd={(t) => setExcludeCompanies([...excludeCompanies, t])}
          onRemove={(i) => setExcludeCompanies(excludeCompanies.filter((_, idx) => idx !== i))}
          placeholder="e.g. Self-employed, Freelance — press Enter to add"
        />

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Connected After (optional)
          </label>
          <input
            type="date"
            value={connectedAfter}
            onChange={(e) => setConnectedAfter(e.target.value)}
            className="px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Additional Context (optional)
          </label>
          <textarea
            value={freeTextDescription}
            onChange={(e) => setFreeTextDescription(e.target.value)}
            rows={3}
            placeholder="e.g. I'm looking for B2B SaaS founders scaling past $1M ARR who might need help with outbound sales"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="px-6 py-2.5 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
