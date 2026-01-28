/**
 * StudentSettingsModal Component
 * Modal for student settings including Blueprint connection.
 */

import React from 'react';
import { X, Settings } from 'lucide-react';
import { BootcampStudent } from '../../../types/bootcamp-types';
import BlueprintConnect from './BlueprintConnect';

interface StudentSettingsModalProps {
  student: BootcampStudent;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const StudentSettingsModal: React.FC<StudentSettingsModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Blueprint Connection Section */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">LinkedIn Authority Blueprint</h3>
            <BlueprintConnect student={student} onUpdate={onUpdate} />
          </div>

          {/* Future settings sections can be added here */}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSettingsModal;
