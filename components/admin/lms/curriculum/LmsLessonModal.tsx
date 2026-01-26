import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { LmsLesson, LmsLessonFormData } from '../../../../types/lms-types';
import { X } from 'lucide-react';

interface LmsLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LmsLessonFormData) => Promise<void>;
  initialData?: LmsLesson | null;
  isLoading: boolean;
}

const LmsLessonModal: React.FC<LmsLessonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<Partial<LmsLessonFormData>>({
    title: '',
    description: '',
    isVisible: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        isVisible: initialData.isVisible,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        isVisible: true,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData as LmsLessonFormData);
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
            {initialData ? 'Edit Lesson' : 'Add New Lesson'}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Lesson Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to AI Prospecting"
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
              placeholder="Brief description of what this lesson covers..."
              rows={3}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none`}
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="lessonVisible"
              checked={formData.isVisible}
              onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
              className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
            />
            <label
              htmlFor="lessonVisible"
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
              disabled={isLoading || !formData.title?.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : initialData ? 'Update Lesson' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LmsLessonModal;
