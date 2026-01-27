import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { LmsActionItem, LmsActionItemFormData } from '../../../../types/lms-types';
import { X, AlertCircle } from 'lucide-react';

interface LmsActionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LmsActionItemFormData) => Promise<void>;
  initialData?: LmsActionItem | null;
  isLoading: boolean;
}

const LmsActionItemModal: React.FC<LmsActionItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<Partial<LmsActionItemFormData>>({
    text: '',
    description: '',
    assignedToEmail: '',
    isVisible: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        text: initialData.text,
        description: initialData.description || '',
        assignedToEmail: initialData.assignedToEmail || '',
        isVisible: initialData.isVisible,
      });
    } else {
      setFormData({
        text: '',
        description: '',
        assignedToEmail: '',
        isVisible: true,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData as LmsActionItemFormData);
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
            {initialData ? 'Edit Action Item' : 'Add Action Item'}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Task Text */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Task *
            </label>
            <input
              type="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="e.g., Complete the LinkedIn profile optimization"
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
              Description / Instructions
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details or instructions for completing this task..."
              rows={3}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none`}
            />
          </div>

          {/* Assigned To Email */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Assign to Specific Student (Optional)
            </label>
            <input
              type="email"
              value={formData.assignedToEmail}
              onChange={(e) => setFormData({ ...formData, assignedToEmail: e.target.value })}
              placeholder="student@example.com"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
            />
            <div
              className={`flex items-start gap-2 mt-2 p-2 rounded text-xs ${
                isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Leave empty to show this action item to all students. If an email is specified, only
                that student will see this task.
              </span>
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="actionVisible"
              checked={formData.isVisible}
              onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
              className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
            />
            <label
              htmlFor="actionVisible"
              className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
            >
              Visible to students
            </label>
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
              disabled={isLoading || !formData.text?.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : initialData ? 'Update Action' : 'Add Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LmsActionItemModal;
