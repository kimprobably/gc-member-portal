import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { BootcampStudent, BootcampStudentStatus } from '../../../../types/bootcamp-types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<BootcampStudent>) => Promise<void>;
  initialData?: BootcampStudent | null;
  isLoading?: boolean;
}

const STATUS_OPTIONS: BootcampStudentStatus[] = [
  'Onboarding',
  'Active',
  'Completed',
  'Paused',
  'Churned',
];

const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<Partial<BootcampStudent>>({
    email: '',
    name: '',
    company: '',
    cohort: 'Global',
    status: 'Onboarding',
    accessLevel: 'Full Access',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email,
        name: initialData.name || '',
        company: initialData.company || '',
        cohort: initialData.cohort,
        status: initialData.status,
        accessLevel: initialData.accessLevel,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        email: '',
        name: '',
        company: '',
        cohort: 'Global',
        status: 'Onboarding',
        accessLevel: 'Full Access',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-xl ${
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <h2 className="text-lg font-semibold">
            {initialData ? 'Edit Student' : 'Add New Student'}
          </h2>
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
            <label className="block text-sm font-medium mb-1.5">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!initialData}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white disabled:bg-slate-800/50'
                  : 'bg-white border-slate-300 text-slate-900 disabled:bg-slate-50'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Cohort</label>
              <input
                type="text"
                value={formData.cohort}
                onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as BootcampStudentStatus })
                }
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Access Level</label>
            <select
              value={formData.accessLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  accessLevel: e.target.value as 'Full Access' | 'Curriculum Only',
                })
              }
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="Full Access">Full Access</option>
              <option value="Curriculum Only">Curriculum Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-lg border resize-none ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium ${
                isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
