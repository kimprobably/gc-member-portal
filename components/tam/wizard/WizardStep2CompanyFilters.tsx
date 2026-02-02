import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IcpProfile } from '../../../types/tam-types';

const EMPLOYEE_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];

interface WizardStep2Props {
  formData: Partial<IcpProfile>;
  setFormData: (data: Partial<IcpProfile>) => void;
  industryInput: string;
  setIndustryInput: (v: string) => void;
  countriesInput: string;
  setCountriesInput: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const WizardStep2CompanyFilters: React.FC<WizardStep2Props> = ({
  formData,
  setFormData,
  industryInput,
  setIndustryInput,
  countriesInput,
  setCountriesInput,
  onNext,
  onBack,
  isValid,
}) => {
  const toggleEmployeeSize = (size: string) => {
    const current = formData.employeeSizeRanges || [];
    if (current.includes(size)) {
      setFormData({ ...formData, employeeSizeRanges: current.filter((s) => s !== size) });
    } else {
      setFormData({ ...formData, employeeSizeRanges: [...current, size] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Company Filters</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Define the characteristics of your ideal customer companies
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Employee Size (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {EMPLOYEE_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleEmployeeSize(size)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.employeeSizeRanges?.includes(size)
                    ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-2 border-violet-500'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Geography
          </label>
          <div className="space-y-2">
            {['us_only', 'specific_countries', 'global'].map((geo) => (
              <label
                key={geo}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.geography === geo
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <input
                  type="radio"
                  name="geography"
                  value={geo}
                  checked={formData.geography === geo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      geography: e.target.value as 'us_only' | 'specific_countries' | 'global',
                    })
                  }
                  className="w-5 h-5 text-violet-500"
                />
                <span className="text-zinc-900 dark:text-white font-medium">
                  {geo === 'us_only'
                    ? 'US Only'
                    : geo === 'specific_countries'
                      ? 'Specific Countries'
                      : 'Global'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {formData.geography === 'specific_countries' && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Country names (comma-separated)
            </label>
            <input
              type="text"
              value={countriesInput}
              onChange={(e) => setCountriesInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., United States, Canada, United Kingdom"
            />
          </div>
        )}

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.usEmployeeFilter || false}
              onChange={(e) => setFormData({ ...formData, usEmployeeFilter: e.target.checked })}
              className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-600 text-violet-500 focus:ring-violet-500"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Filter for US-based employees (75%+ in US)
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Industry keywords (comma-separated)
          </label>
          <input
            type="text"
            value={industryInput}
            onChange={(e) => setIndustryInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="e.g., SaaS, Technology, Marketing"
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
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WizardStep2CompanyFilters;
