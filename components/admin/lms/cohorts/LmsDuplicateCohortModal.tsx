import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { LmsCohort } from '../../../../types/lms-types';
import { X, Copy, AlertCircle } from 'lucide-react';

interface LmsDuplicateCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newName: string, newDescription?: string) => Promise<void>;
  sourceCohort: LmsCohort | null;
  isLoading: boolean;
}

const LmsDuplicateCohortModal: React.FC<LmsDuplicateCohortModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sourceCohort,
  isLoading,
}) => {
  const { isDarkMode } = useTheme();
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    if (sourceCohort && isOpen) {
      setNewName(`${sourceCohort.name} (Copy)`);
      setNewDescription(sourceCohort.description || '');
    }
  }, [sourceCohort, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newName, newDescription || undefined);
  };

  if (!isOpen || !sourceCohort) return null;

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
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-violet-500" />
            <h3 className="text-lg font-semibold">Duplicate Cohort</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info Box */}
          <div
            className={`p-4 rounded-lg flex gap-3 ${
              isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'
            }`}
          >
            <AlertCircle className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
            <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <p className="font-medium mb-1">This will create a complete copy of:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>All weeks and their settings</li>
                <li>All lessons and their configurations</li>
                <li>All content items (videos, slides, guides, etc.)</li>
                <li>All action items and assignments</li>
              </ul>
              <p className="mt-2 text-xs opacity-75">
                The new cohort will be completely independent - changes to one will not affect the
                other.
              </p>
            </div>
          </div>

          {/* Source Cohort */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Source Cohort
            </label>
            <div
              className={`px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800/50 border-slate-700 text-slate-400'
                  : 'bg-slate-50 border-slate-300 text-slate-500'
              }`}
            >
              {sourceCohort.name}
            </div>
          </div>

          {/* New Name */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              New Cohort Name *
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Cohort 9"
              required
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
            />
          </div>

          {/* New Description */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Description
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Optional description for the new cohort..."
              rows={2}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none`}
            />
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
              disabled={isLoading || !newName.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              {isLoading ? 'Duplicating...' : 'Duplicate Cohort'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LmsDuplicateCohortModal;
