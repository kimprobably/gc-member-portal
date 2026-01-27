import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import {
  LmsWeekWithLessons,
  LmsLessonWithContent,
  LmsContentItem,
  LmsActionItem,
  LMS_CONTENT_TYPE_LABELS,
} from '../../../../types/lms-types';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  EyeOff,
  GripVertical,
  BookOpen,
  Video,
  FileText,
  Link,
  Key,
  Bot,
  Table,
  Presentation,
  ListChecks,
} from 'lucide-react';

interface WeekEditorProps {
  week: LmsWeekWithLessons;
  weekNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: LmsLessonWithContent) => void;
  onDeleteLesson: (lesson: LmsLessonWithContent) => void;
  onAddContent: (lessonId: string) => void;
  onEditContent: (content: LmsContentItem, lessonId: string) => void;
  onDeleteContent: (content: LmsContentItem, lessonId: string) => void;
  onAddAction: () => void;
  onEditAction: (action: LmsActionItem) => void;
  onDeleteAction: (action: LmsActionItem) => void;
}

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="w-3.5 h-3.5" />;
    case 'slide_deck':
      return <Presentation className="w-3.5 h-3.5" />;
    case 'guide':
      return <BookOpen className="w-3.5 h-3.5" />;
    case 'clay_table':
      return <Table className="w-3.5 h-3.5" />;
    case 'ai_tool':
      return <Bot className="w-3.5 h-3.5" />;
    case 'text':
      return <FileText className="w-3.5 h-3.5" />;
    case 'external_link':
      return <Link className="w-3.5 h-3.5" />;
    case 'credentials':
      return <Key className="w-3.5 h-3.5" />;
    default:
      return <FileText className="w-3.5 h-3.5" />;
  }
};

const WeekEditor: React.FC<WeekEditorProps> = ({
  week,
  weekNumber,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddContent,
  onEditContent,
  onDeleteContent,
  onAddAction,
  onEditAction,
  onDeleteAction,
}) => {
  const { isDarkMode } = useTheme();

  const lessonCount = week.lessons.length;
  const contentCount = week.lessons.reduce((sum, l) => sum + l.contentItems.length, 0);
  const actionCount = week.actionItems.length;

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Week Header */}
      <div
        className={`flex items-center gap-3 p-4 cursor-pointer ${
          isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
        }`}
        onClick={onToggle}
      >
        <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
        <button className="p-1">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                isDarkMode ? 'bg-violet-900/30 text-violet-400' : 'bg-violet-100 text-violet-700'
              }`}
            >
              Week {weekNumber}
            </span>
            <h3 className="font-medium truncate">{week.title}</h3>
            {!week.isVisible && (
              <span title="Hidden from students">
                <EyeOff className="w-4 h-4 text-slate-400" />
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {lessonCount} lesson{lessonCount !== 1 ? 's' : ''} • {contentCount} content item
            {contentCount !== 1 ? 's' : ''} • {actionCount} action{actionCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            title="Edit Week"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className={`p-2 rounded-lg text-red-500 ${
              isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
            title="Delete Week"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Content */}
      {isExpanded && (
        <div className={`border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          {/* Lessons Section */}
          <div className={`p-4 ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <h4
                className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
              >
                Lessons
              </h4>
              <button
                onClick={onAddLesson}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Lesson
              </button>
            </div>

            {week.lessons.length === 0 ? (
              <p
                className={`text-xs text-center py-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
              >
                No lessons yet. Add your first lesson to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {week.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className={`rounded-lg border ${
                      isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Lesson Header */}
                    <div className="flex items-center gap-2 p-3">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 cursor-grab" />
                      <span
                        className={`text-xs font-medium ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {lessonIndex + 1}.
                      </span>
                      <BookOpen className="w-4 h-4 text-violet-500" />
                      <span className="flex-1 text-sm font-medium truncate">{lesson.title}</span>
                      {!lesson.isVisible && (
                        <span title="Hidden">
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      )}
                      <span
                        className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                      >
                        {lesson.contentItems.length} item
                        {lesson.contentItems.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => onEditLesson(lesson)}
                        className={`p-1.5 rounded ${
                          isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLesson(lesson)}
                        className={`p-1.5 rounded text-red-500 ${
                          isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content Items */}
                    <div
                      className={`px-3 pb-3 pt-0 border-t ${
                        isDarkMode ? 'border-slate-700' : 'border-slate-100'
                      }`}
                    >
                      {lesson.contentItems.length === 0 ? (
                        <p
                          className={`text-xs text-center py-2 ${
                            isDarkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          No content items
                        </p>
                      ) : (
                        <div className="space-y-1 mt-2">
                          {lesson.contentItems.map((content, contentIndex) => (
                            <div
                              key={content.id}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                                isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <GripVertical className="w-3 h-3 text-slate-400 cursor-grab" />
                              <span
                                className={`w-4 text-center text-xs ${
                                  isDarkMode ? 'text-slate-600' : 'text-slate-400'
                                }`}
                              >
                                {contentIndex + 1}
                              </span>
                              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                                {getContentTypeIcon(content.contentType)}
                              </span>
                              <span className="flex-1 text-xs truncate">{content.title}</span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  isDarkMode
                                    ? 'bg-slate-700 text-slate-400'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {LMS_CONTENT_TYPE_LABELS[content.contentType]}
                              </span>
                              {!content.isVisible && <EyeOff className="w-3 h-3 text-slate-400" />}
                              <button
                                onClick={() => onEditContent(content, lesson.id)}
                                className={`p-1 rounded ${
                                  isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
                                }`}
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteContent(content, lesson.id)}
                                className={`p-1 rounded text-red-500 ${
                                  isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
                                }`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => onAddContent(lesson.id)}
                        className={`mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs ${
                          isDarkMode
                            ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        Add Content
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Items Section */}
          <div
            className={`p-4 border-t ${
              isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4
                className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
              >
                <ListChecks className="w-4 h-4" />
                Action Items
              </h4>
              <button
                onClick={onAddAction}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Action
              </button>
            </div>

            {week.actionItems.length === 0 ? (
              <p
                className={`text-xs text-center py-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
              >
                No action items yet. Add tasks for students to complete.
              </p>
            ) : (
              <div className="space-y-1">
                {week.actionItems.map((action, index) => (
                  <div
                    key={action.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isDarkMode ? 'bg-slate-800/50' : 'bg-white border border-slate-200'
                    }`}
                  >
                    <GripVertical className="w-3.5 h-3.5 text-slate-400 cursor-grab" />
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded text-xs font-medium ${
                        isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm truncate">{action.text}</span>
                    {action.assignedToEmail && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {action.assignedToEmail}
                      </span>
                    )}
                    {!action.isVisible && <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    <button
                      onClick={() => onEditAction(action)}
                      className={`p-1.5 rounded ${
                        isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAction(action)}
                      className={`p-1.5 rounded text-red-500 ${
                        isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekEditor;
