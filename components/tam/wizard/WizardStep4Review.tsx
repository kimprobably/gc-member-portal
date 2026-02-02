import React from 'react';
import { ChevronLeft, Check, Loader2 } from 'lucide-react';
import { IcpProfile, BusinessModelType } from '../../../types/tam-types';

const BUSINESS_MODEL_LABELS: Record<BusinessModelType, string> = {
  b2b_saas: 'B2B SaaS / Software',
  ecommerce_dtc: 'E-commerce / DTC',
  amazon_sellers: 'Amazon Sellers',
  local_service: 'Local / Service Businesses',
  agencies: 'Agencies',
  other: 'Other',
};

interface WizardStep4Props {
  formData: Partial<IcpProfile>;
  setFormData: (data: Partial<IcpProfile>) => void;
  industryInput: string;
  countriesInput: string;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const WizardStep4Review: React.FC<WizardStep4Props> = ({
  formData,
  setFormData,
  industryInput,
  countriesInput,
  onSubmit,
  onBack,
  isSubmitting,
  error,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Review & Launch</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Review your ideal customer profile before we start building your list
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Model Summary */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Business Model</h3>
          <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <span className="font-medium">Type:</span>{' '}
              {formData.businessModel ? BUSINESS_MODEL_LABELS[formData.businessModel] : ''}
              {formData.businessModelOther && ` (${formData.businessModelOther})`}
            </p>
            <p>
              <span className="font-medium">Product/Service:</span> {formData.whatYouSell}
            </p>
            {formData.seedCompanyDomains && formData.seedCompanyDomains.length > 0 && (
              <p>
                <span className="font-medium">Seed Companies:</span>{' '}
                {formData.seedCompanyDomains.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Company Filters Summary */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Company Filters</h3>
          <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <span className="font-medium">Employee Size:</span>{' '}
              {formData.employeeSizeRanges?.join(', ') || 'Not specified'}
            </p>
            <p>
              <span className="font-medium">Geography:</span>{' '}
              {formData.geography === 'us_only'
                ? 'US Only'
                : formData.geography === 'specific_countries'
                  ? `Specific Countries (${countriesInput})`
                  : 'Global'}
            </p>
            {formData.usEmployeeFilter && (
              <p>
                <span className="font-medium">US Employee Filter:</span> 75%+ US-based
              </p>
            )}
            {industryInput && (
              <p>
                <span className="font-medium">Industries:</span> {industryInput}
              </p>
            )}
          </div>
        </div>

        {/* Contact Targeting Summary */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Contact Targeting</h3>
          <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <span className="font-medium">Target Titles:</span>{' '}
              {formData.targetTitles && formData.targetTitles.length > 0
                ? formData.targetTitles.join(', ')
                : 'Not specified'}
            </p>
            <p>
              <span className="font-medium">Seniority:</span>{' '}
              {formData.seniorityPreference && formData.seniorityPreference.length > 0
                ? formData.seniorityPreference.join(', ')
                : 'Not specified'}
            </p>
            <p>
              <span className="font-medium">Contacts per company:</span>{' '}
              {formData.contactsPerCompany}
            </p>
          </div>
        </div>

        {/* Special Criteria */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Anything else the AI should know about your ideal customer?
          </label>
          <textarea
            value={formData.specialCriteria || ''}
            onChange={(e) => setFormData({ ...formData, specialCriteria: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            placeholder="Any additional criteria, requirements, or notes..."
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Start Building
              <Check className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WizardStep4Review;
