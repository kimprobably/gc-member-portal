import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchLmsCurriculumByCohort, fetchAllLmsCohorts } from '../../../../services/lms-supabase';
import { queryKeys } from '../../../../lib/queryClient';
import { useTheme } from '../../../../context/ThemeContext';
import {
  useCreateLmsWeekMutation,
  useUpdateLmsWeekMutation,
  useDeleteLmsWeekMutation,
  useReorderLmsWeeksMutation,
  useCreateLmsLessonMutation,
  useUpdateLmsLessonMutation,
  useDeleteLmsLessonMutation,
  useReorderLmsLessonsMutation,
  useCreateLmsContentItemMutation,
  useUpdateLmsContentItemMutation,
  useDeleteLmsContentItemMutation,
  useReorderLmsContentItemsMutation,
  useCreateLmsActionItemMutation,
  useUpdateLmsActionItemMutation,
  useDeleteLmsActionItemMutation,
  useReorderLmsActionItemsMutation,
} from '../../../../hooks/useLmsMutations';
import {
  LmsCohort,
  LmsWeekWithLessons,
  LmsLessonWithContent,
  LmsContentItem,
  LmsActionItem,
  LmsWeekFormData,
  LmsLessonFormData,
  LmsContentItemFormData,
  LmsActionItemFormData,
} from '../../../../types/lms-types';
import WeekEditor from './WeekEditor';
import LmsWeekModal from './LmsWeekModal';
import LmsLessonModal from './LmsLessonModal';
import LmsContentItemModal from './LmsContentItemModal';
import LmsActionItemModal from './LmsActionItemModal';
import { ArrowLeft, Plus, RefreshCw, ChevronDown, AlertCircle } from 'lucide-react';

type ModalState =
  | { type: 'none' }
  | { type: 'week'; data?: LmsWeekWithLessons }
  | { type: 'lesson'; weekId: string; data?: LmsLessonWithContent }
  | { type: 'content'; lessonId: string; weekId: string; data?: LmsContentItem }
  | { type: 'action'; weekId: string; data?: LmsActionItem };

const AdminLmsCurriculumPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { cohortId } = useParams<{ cohortId: string }>();
  const navigate = useNavigate();

  // State
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [deletingItem, setDeletingItem] = useState<{
    type: 'week' | 'lesson' | 'content' | 'action';
    item: any;
    weekId?: string;
    lessonId?: string;
  } | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  // Queries
  const { data: cohorts } = useQuery({
    queryKey: queryKeys.lmsCohorts(),
    queryFn: fetchAllLmsCohorts,
  });

  const {
    data: curriculum,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.lmsCurriculum(cohortId || ''),
    queryFn: () => fetchLmsCurriculumByCohort(cohortId || '', false),
    enabled: !!cohortId,
  });

  // Mutations
  const createWeekMutation = useCreateLmsWeekMutation();
  const updateWeekMutation = useUpdateLmsWeekMutation();
  const deleteWeekMutation = useDeleteLmsWeekMutation();
  const reorderWeeksMutation = useReorderLmsWeeksMutation();

  const createLessonMutation = useCreateLmsLessonMutation();
  const updateLessonMutation = useUpdateLmsLessonMutation();
  const deleteLessonMutation = useDeleteLmsLessonMutation();
  const reorderLessonsMutation = useReorderLmsLessonsMutation();

  const createContentMutation = useCreateLmsContentItemMutation();
  const updateContentMutation = useUpdateLmsContentItemMutation();
  const deleteContentMutation = useDeleteLmsContentItemMutation();
  const reorderContentMutation = useReorderLmsContentItemsMutation();

  const createActionMutation = useCreateLmsActionItemMutation();
  const updateActionMutation = useUpdateLmsActionItemMutation();
  const deleteActionMutation = useDeleteLmsActionItemMutation();
  const reorderActionMutation = useReorderLmsActionItemsMutation();

  // Cohort selection
  const selectedCohort = cohorts?.find((c) => c.id === cohortId);

  const handleCohortChange = (newCohortId: string) => {
    navigate(`/admin/lms/curriculum/${newCohortId}`);
  };

  // Week handlers
  const handleAddWeek = () => {
    setModalState({ type: 'week' });
  };

  const handleEditWeek = (week: LmsWeekWithLessons) => {
    setModalState({ type: 'week', data: week });
  };

  const handleSaveWeek = async (data: LmsWeekFormData) => {
    if (!cohortId) return;

    if (modalState.type === 'week' && modalState.data) {
      await updateWeekMutation.mutateAsync({
        weekId: modalState.data.id,
        cohortId,
        updates: data,
      });
    } else {
      const newSortOrder = curriculum?.weeks?.length || 0;
      await createWeekMutation.mutateAsync({
        ...data,
        cohortId,
        sortOrder: newSortOrder,
      });
    }
    setModalState({ type: 'none' });
  };

  const handleDeleteWeek = async () => {
    if (!deletingItem || deletingItem.type !== 'week' || !cohortId) return;
    await deleteWeekMutation.mutateAsync({ weekId: deletingItem.item.id, cohortId });
    setDeletingItem(null);
  };

  // Lesson handlers
  const handleAddLesson = (weekId: string) => {
    setModalState({ type: 'lesson', weekId });
  };

  const handleEditLesson = (lesson: LmsLessonWithContent, weekId: string) => {
    setModalState({ type: 'lesson', weekId, data: lesson });
  };

  const handleSaveLesson = async (data: LmsLessonFormData) => {
    if (!cohortId || modalState.type !== 'lesson') return;

    if (modalState.data) {
      await updateLessonMutation.mutateAsync({
        lessonId: modalState.data.id,
        weekId: modalState.weekId,
        cohortId,
        updates: data,
      });
    } else {
      const week = curriculum?.weeks.find((w) => w.id === modalState.weekId);
      const newSortOrder = week?.lessons?.length || 0;
      await createLessonMutation.mutateAsync({
        lesson: {
          ...data,
          weekId: modalState.weekId,
          sortOrder: newSortOrder,
        },
        cohortId,
      });
    }
    setModalState({ type: 'none' });
  };

  const handleDeleteLesson = async () => {
    if (!deletingItem || deletingItem.type !== 'lesson' || !cohortId || !deletingItem.weekId)
      return;
    await deleteLessonMutation.mutateAsync({
      lessonId: deletingItem.item.id,
      weekId: deletingItem.weekId,
      cohortId,
    });
    setDeletingItem(null);
  };

  // Content item handlers
  const handleAddContent = (lessonId: string, weekId: string) => {
    setModalState({ type: 'content', lessonId, weekId });
  };

  const handleEditContent = (content: LmsContentItem, lessonId: string, weekId: string) => {
    setModalState({ type: 'content', lessonId, weekId, data: content });
  };

  const handleSaveContent = async (data: LmsContentItemFormData) => {
    if (!cohortId || modalState.type !== 'content') return;

    if (modalState.data) {
      await updateContentMutation.mutateAsync({
        itemId: modalState.data.id,
        lessonId: modalState.lessonId,
        cohortId,
        updates: data,
      });
    } else {
      const week = curriculum?.weeks.find((w) => w.id === modalState.weekId);
      const lesson = week?.lessons.find((l) => l.id === modalState.lessonId);
      const newSortOrder = lesson?.contentItems?.length || 0;
      await createContentMutation.mutateAsync({
        item: {
          ...data,
          lessonId: modalState.lessonId,
          sortOrder: newSortOrder,
        },
        cohortId,
      });
    }
    setModalState({ type: 'none' });
  };

  const handleDeleteContent = async () => {
    if (!deletingItem || deletingItem.type !== 'content' || !cohortId || !deletingItem.lessonId)
      return;
    await deleteContentMutation.mutateAsync({
      itemId: deletingItem.item.id,
      lessonId: deletingItem.lessonId,
      cohortId,
    });
    setDeletingItem(null);
  };

  // Action item handlers
  const handleAddAction = (weekId: string) => {
    setModalState({ type: 'action', weekId });
  };

  const handleEditAction = (action: LmsActionItem, weekId: string) => {
    setModalState({ type: 'action', weekId, data: action });
  };

  const handleSaveAction = async (data: LmsActionItemFormData) => {
    if (!cohortId || modalState.type !== 'action') return;

    if (modalState.data) {
      await updateActionMutation.mutateAsync({
        itemId: modalState.data.id,
        weekId: modalState.weekId,
        cohortId,
        updates: data,
      });
    } else {
      const week = curriculum?.weeks.find((w) => w.id === modalState.weekId);
      const newSortOrder = week?.actionItems?.length || 0;
      await createActionMutation.mutateAsync({
        item: {
          ...data,
          weekId: modalState.weekId,
          sortOrder: newSortOrder,
        },
        cohortId,
      });
    }
    setModalState({ type: 'none' });
  };

  const handleDeleteAction = async () => {
    if (!deletingItem || deletingItem.type !== 'action' || !cohortId || !deletingItem.weekId)
      return;
    await deleteActionMutation.mutateAsync({
      itemId: deletingItem.item.id,
      weekId: deletingItem.weekId,
      cohortId,
    });
    setDeletingItem(null);
  };

  // Toggle week expansion
  const toggleWeekExpansion = (weekId: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekId)) {
        next.delete(weekId);
      } else {
        next.add(weekId);
      }
      return next;
    });
  };

  const expandAllWeeks = () => {
    if (curriculum?.weeks) {
      setExpandedWeeks(new Set(curriculum.weeks.map((w) => w.id)));
    }
  };

  const collapseAllWeeks = () => {
    setExpandedWeeks(new Set());
  };

  // No cohort selected - show selector
  if (!cohortId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Curriculum Editor</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Select a cohort to manage its curriculum
          </p>
        </div>

        <div
          className={`p-8 rounded-xl border text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Cohort Selected</h3>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Please select a cohort from the dropdown below to manage its curriculum.
          </p>

          {cohorts && cohorts.length > 0 ? (
            <select
              onChange={(e) => handleCohortChange(e.target.value)}
              className={`px-4 py-2.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
            >
              <option value="">Select a cohort...</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name} {cohort.status === 'Archived' ? '(Archived)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => navigate('/admin/lms/cohorts')}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700"
            >
              Create Your First Cohort
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/lms/cohorts')}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Curriculum Editor</h2>
              {/* Cohort Selector */}
              <div className="relative">
                <select
                  value={cohortId}
                  onChange={(e) => handleCohortChange(e.target.value)}
                  className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-sm ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                >
                  {cohorts?.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {selectedCohort?.description || 'Manage weeks, lessons, and content'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={expandAllWeeks}
            className={`px-3 py-1.5 rounded-lg text-xs ${
              isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            Expand All
          </button>
          <button
            onClick={collapseAllWeeks}
            className={`px-3 py-1.5 rounded-lg text-xs ${
              isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            Collapse All
          </button>
          <button
            onClick={handleAddWeek}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700"
          >
            <Plus className="w-4 h-4" />
            Add Week
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div
          className={`p-8 rounded-xl border text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-6 h-6 border-2 border-slate-300 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Loading curriculum...
          </p>
        </div>
      ) : !curriculum || curriculum.weeks.length === 0 ? (
        <div
          className={`p-8 rounded-xl border text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Content Yet</h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Start building your curriculum by adding the first week.
          </p>
          <button
            onClick={handleAddWeek}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700"
          >
            <Plus className="w-4 h-4" />
            Add First Week
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {curriculum.weeks.map((week, index) => (
            <WeekEditor
              key={week.id}
              week={week}
              weekNumber={index + 1}
              isExpanded={expandedWeeks.has(week.id)}
              onToggle={() => toggleWeekExpansion(week.id)}
              onEdit={() => handleEditWeek(week)}
              onDelete={() => setDeletingItem({ type: 'week', item: week })}
              onAddLesson={() => handleAddLesson(week.id)}
              onEditLesson={(lesson) => handleEditLesson(lesson, week.id)}
              onDeleteLesson={(lesson) =>
                setDeletingItem({ type: 'lesson', item: lesson, weekId: week.id })
              }
              onAddContent={(lessonId) => handleAddContent(lessonId, week.id)}
              onEditContent={(content, lessonId) => handleEditContent(content, lessonId, week.id)}
              onDeleteContent={(content, lessonId) =>
                setDeletingItem({ type: 'content', item: content, lessonId, weekId: week.id })
              }
              onAddAction={() => handleAddAction(week.id)}
              onEditAction={(action) => handleEditAction(action, week.id)}
              onDeleteAction={(action) =>
                setDeletingItem({ type: 'action', item: action, weekId: week.id })
              }
            />
          ))}
        </div>
      )}

      {/* Week Modal */}
      {modalState.type === 'week' && (
        <LmsWeekModal
          isOpen={true}
          onClose={() => setModalState({ type: 'none' })}
          onSubmit={handleSaveWeek}
          initialData={modalState.data}
          isLoading={createWeekMutation.isPending || updateWeekMutation.isPending}
        />
      )}

      {/* Lesson Modal */}
      {modalState.type === 'lesson' && (
        <LmsLessonModal
          isOpen={true}
          onClose={() => setModalState({ type: 'none' })}
          onSubmit={handleSaveLesson}
          initialData={modalState.data}
          isLoading={createLessonMutation.isPending || updateLessonMutation.isPending}
        />
      )}

      {/* Content Item Modal */}
      {modalState.type === 'content' && (
        <LmsContentItemModal
          isOpen={true}
          onClose={() => setModalState({ type: 'none' })}
          onSubmit={handleSaveContent}
          initialData={modalState.data}
          isLoading={createContentMutation.isPending || updateContentMutation.isPending}
        />
      )}

      {/* Action Item Modal */}
      {modalState.type === 'action' && (
        <LmsActionItemModal
          isOpen={true}
          onClose={() => setModalState({ type: 'none' })}
          onSubmit={handleSaveAction}
          initialData={modalState.data}
          isLoading={createActionMutation.isPending || updateActionMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md p-6 rounded-xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
          >
            <h3 className="text-lg font-semibold mb-2">
              Delete{' '}
              {deletingItem.type === 'week'
                ? 'Week'
                : deletingItem.type === 'lesson'
                  ? 'Lesson'
                  : deletingItem.type === 'content'
                    ? 'Content Item'
                    : 'Action Item'}
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Are you sure you want to delete "{deletingItem.item.title || deletingItem.item.text}"?
              {deletingItem.type === 'week' &&
                ' This will also delete all lessons, content items, and action items in this week.'}
              {deletingItem.type === 'lesson' &&
                ' This will also delete all content items in this lesson.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingItem(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletingItem.type === 'week') handleDeleteWeek();
                  else if (deletingItem.type === 'lesson') handleDeleteLesson();
                  else if (deletingItem.type === 'content') handleDeleteContent();
                  else handleDeleteAction();
                }}
                disabled={
                  deleteWeekMutation.isPending ||
                  deleteLessonMutation.isPending ||
                  deleteContentMutation.isPending ||
                  deleteActionMutation.isPending
                }
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteWeekMutation.isPending ||
                deleteLessonMutation.isPending ||
                deleteContentMutation.isPending ||
                deleteActionMutation.isPending
                  ? 'Deleting...'
                  : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLmsCurriculumPage;
