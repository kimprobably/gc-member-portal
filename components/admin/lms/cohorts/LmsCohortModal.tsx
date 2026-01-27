import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { LmsCohort, LmsCohortFormData, LmsCohortStatus } from '../../../../types/lms-types';
import { X } from 'lucide-react';

interface LmsCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LmsCohortFormData) => Promise<void>;
  initialData: LmsCohort | null;
  isLoading: boolean;
}

const LmsCohortModal: React.FC<LmsCohortModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<LmsCohortFormData>({
    name: '',
    description: '',
    status: 'Active',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        status: initialData.status,
        startDate: initialData.startDate?.toISOString().split('T')[0] || '',
        endDate: initialData.endDate?.toISOString().split('T')[0] || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Active',
        startDate: '',
        endDate: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-lg rounded-xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'} shadow-xl`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <h3 className="text-lg font-semibold">
            {initialData ? 'Edit Cohort' : 'Create New Cohort'}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Cohort Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Cohort 8, Winter 2024"
              required
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description for this cohort..."
              rows={3}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none`}
            />
          </div>

          {/* Status */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as LmsCohortStatus })
              }
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
            >
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
              />
            </div>
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
              disabled={isLoading || !formData.name.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : initialData ? 'Update Cohort' : 'Create Cohort'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LmsCohortModal;
