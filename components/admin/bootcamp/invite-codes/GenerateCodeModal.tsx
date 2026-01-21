import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { BootcampCohort } from '../../../../types/bootcamp-types';

interface GenerateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (
    cohortId: string,
    count: number,
    options?: { maxUses?: number; expiresAt?: Date }
  ) => Promise<void>;
  cohorts: BootcampCohort[];
  isLoading?: boolean;
}

const GenerateCodeModal: React.FC<GenerateCodeModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  cohorts,
  isLoading,
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    cohortId: '',
    count: 1,
    maxUses: '',
    expiresAt: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cohortId) return;

    const options: { maxUses?: number; expiresAt?: Date } = {};
    if (formData.maxUses) {
      options.maxUses = parseInt(formData.maxUses, 10);
    }
    if (formData.expiresAt) {
      options.expiresAt = new Date(formData.expiresAt);
    }

    await onGenerate(formData.cohortId, formData.count, options);

    // Reset form
    setFormData({
      cohortId: '',
      count: 1,
      maxUses: '',
      expiresAt: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-md rounded-xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <h3 className="text-lg font-semibold">Generate Invite Codes</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Cohort *
            </label>
            <select
              value={formData.cohortId}
              onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
            >
              <option value="">Select a cohort</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Number of Codes *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.count}
              onChange={(e) =>
                setFormData({ ...formData, count: parseInt(e.target.value, 10) || 1 })
              }
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Generate 1-100 codes at once
            </p>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Max Uses (Optional)
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Unlimited"
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Leave empty for unlimited uses
            </p>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Leave empty for no expiration
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.cohortId}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate {formData.count} Code{formData.count > 1 ? 's' : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateCodeModal;
