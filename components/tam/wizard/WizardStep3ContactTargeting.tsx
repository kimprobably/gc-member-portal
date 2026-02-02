import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { IcpProfile } from '../../../types/tam-types';

const PRESET_TITLES = [
  'Founder',
  'CEO',
  'CTO',
  'VP Marketing',
  'VP Sales',
  'Head of Marketing',
  'Head of Sales',
  'Director of Marketing',
  'Director of Sales',
];

const SENIORITY_LEVELS = ['C-Suite', 'VP', 'Director', 'Manager'];

interface WizardStep3Props {
  formData: Partial<IcpProfile>;
  setFormData: (data: Partial<IcpProfile>) => void;
  customTitleInput: string;
  setCustomTitleInput: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const WizardStep3ContactTargeting: React.FC<WizardStep3Props> = ({
  formData,
  setFormData,
  customTitleInput,
  setCustomTitleInput,
  onNext,
  onBack,
}) => {
  const toggleTitle = (title: string) => {
    const current = formData.targetTitles || [];
    if (current.includes(title)) {
      setFormData({ ...formData, targetTitles: current.filter((t) => t !== title) });
    } else {
      setFormData({ ...formData, targetTitles: [...current, title] });
    }
  };

  const addCustomTitle = () => {
    if (customTitleInput.trim()) {
      const current = formData.targetTitles || [];
      if (!current.includes(customTitleInput.trim())) {
        setFormData({ ...formData, targetTitles: [...current, customTitleInput.trim()] });
      }
      setCustomTitleInput('');
    }
  };

  const removeTitle = (title: string) => {
    const current = formData.targetTitles || [];
    setFormData({ ...formData, targetTitles: current.filter((t) => t !== title) });
  };

  const toggleSeniority = (level: string) => {
    const current = formData.seniorityPreference || [];
    if (current.includes(level)) {
      setFormData({ ...formData, seniorityPreference: current.filter((s) => s !== level) });
    } else {
      setFormData({ ...formData, seniorityPreference: [...current, level] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Contact Targeting</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Specify the types of contacts you want to reach
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Target Titles (select or add custom)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_TITLES.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => toggleTitle(title)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.targetTitles?.includes(title)
                    ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-2 border-violet-500'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                {title}
              </button>
            ))}
          </div>

          {/* Custom titles display */}
          {formData.targetTitles && formData.targetTitles.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Selected titles:</p>
              <div className="flex flex-wrap gap-2">
                {formData.targetTitles
                  .filter((t) => !PRESET_TITLES.includes(t))
                  .map((title) => (
                    <div
                      key={title}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-500"
                    >
                      <span>{title}</span>
                      <button
                        onClick={() => removeTitle(title)}
                        className="hover:text-violet-900 dark:hover:text-violet-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={customTitleInput}
              onChange={(e) => setCustomTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomTitle();
                }
              }}
              className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Add custom title and press Enter"
            />
            <button
              type="button"
              onClick={addCustomTitle}
              className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Seniority Preference
          </label>
          <div className="space-y-2">
            {SENIORITY_LEVELS.map((level) => (
              <label key={level} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.seniorityPreference?.includes(level) || false}
                  onChange={() => toggleSeniority(level)}
                  className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-600 text-violet-500 focus:ring-violet-500"
                />
                <span className="text-zinc-700 dark:text-zinc-300">{level}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Contacts per company
          </label>
          <input
            type="number"
            min="1"
            max="3"
            value={formData.contactsPerCompany || 1}
            onChange={(e) =>
              setFormData({ ...formData, contactsPerCompany: parseInt(e.target.value) || 1 })
            }
            className="w-32 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WizardStep3ContactTargeting;
