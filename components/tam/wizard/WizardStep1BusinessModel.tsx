import React from 'react';
import { ChevronRight, X } from 'lucide-react';
import { IcpProfile, BusinessModelType } from '../../../types/tam-types';

const BUSINESS_MODEL_LABELS: Record<BusinessModelType, string> = {
  b2b_saas: 'B2B SaaS / Software',
  ecommerce_dtc: 'E-commerce / DTC',
  amazon_sellers: 'Amazon Sellers',
  local_service: 'Local / Service Businesses',
  agencies: 'Agencies',
  other: 'Other',
};

interface WizardStep1Props {
  formData: Partial<IcpProfile>;
  setFormData: (data: Partial<IcpProfile>) => void;
  seedDomainInput: string;
  setSeedDomainInput: (v: string) => void;
  onNext: () => void;
  isValid: boolean;
}

const WizardStep1BusinessModel: React.FC<WizardStep1Props> = ({
  formData,
  setFormData,
  seedDomainInput,
  setSeedDomainInput,
  onNext,
  isValid,
}) => {
  const addSeedDomain = () => {
    const raw = seedDomainInput.trim().toLowerCase();
    if (!raw) return;
    const domain = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const current = formData.seedCompanyDomains || [];
    if (current.length >= 10) return;
    if (!current.includes(domain)) {
      setFormData({ ...formData, seedCompanyDomains: [...current, domain] });
    }
    setSeedDomainInput('');
  };

  const removeSeedDomain = (domain: string) => {
    const current = formData.seedCompanyDomains || [];
    setFormData({ ...formData, seedCompanyDomains: current.filter((d) => d !== domain) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Business Model</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Tell us about your business so we can find the right customers
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            What type of business do you run?
          </label>
          <div className="space-y-2">
            {(Object.keys(BUSINESS_MODEL_LABELS) as BusinessModelType[]).map((model) => (
              <label
                key={model}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.businessModel === model
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <input
                  type="radio"
                  name="businessModel"
                  value={model}
                  checked={formData.businessModel === model}
                  onChange={(e) =>
                    setFormData({ ...formData, businessModel: e.target.value as BusinessModelType })
                  }
                  className="w-5 h-5 text-violet-500"
                />
                <span className="text-zinc-900 dark:text-white font-medium">
                  {BUSINESS_MODEL_LABELS[model]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {formData.businessModel === 'other' && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Please specify your business model
            </label>
            <input
              type="text"
              value={formData.businessModelOther || ''}
              onChange={(e) => setFormData({ ...formData, businessModelOther: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., Marketplace platform"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            What do YOU sell them?
          </label>
          <input
            type="text"
            value={formData.whatYouSell || ''}
            onChange={(e) => setFormData({ ...formData, whatYouSell: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="e.g., Marketing automation software"
          />
        </div>

        {/* Seed Company Domains */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Enter your best current clients or ideal companies
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            Optional — add up to 10 domains and we'll find lookalike companies using AI similarity
            matching
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={seedDomainInput}
              onChange={(e) => setSeedDomainInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSeedDomain();
                }
              }}
              className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., stripe.com"
              disabled={(formData.seedCompanyDomains || []).length >= 10}
            />
            <button
              type="button"
              onClick={addSeedDomain}
              disabled={(formData.seedCompanyDomains || []).length >= 10}
              className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          {formData.seedCompanyDomains && formData.seedCompanyDomains.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.seedCompanyDomains.map((domain) => (
                <div
                  key={domain}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-500"
                >
                  <span>{domain}</span>
                  <button
                    onClick={() => removeSeedDomain(domain)}
                    className="hover:text-violet-900 dark:hover:text-violet-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <span className="text-xs text-zinc-400 self-center">
                {formData.seedCompanyDomains.length}/10
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
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

export default WizardStep1BusinessModel;
