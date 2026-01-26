# Inline Curriculum Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace modal-based curriculum editing with fast inline editing and drag-and-drop reordering.

**Architecture:** Create reusable InlineInput and SmartUrlInput components, then rebuild WeekEditor to use inline editing throughout. Use @dnd-kit for drag-and-drop. Keep modals only for credentials/AI tool content types.

**Tech Stack:** React, TypeScript, @dnd-kit/core, @dnd-kit/sortable, TanStack Query (existing)

---

## Task 1: Install drag-and-drop library

**Files:**
- Modify: `package.json`

**Step 1: Install @dnd-kit**

Run:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Step 2: Verify installation**

Run: `npm ls @dnd-kit/core`
Expected: Shows installed version

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @dnd-kit for drag-and-drop"
```

---

## Task 2: Create InlineInput component

**Files:**
- Create: `components/admin/lms/curriculum/InlineInput.tsx`

**Step 1: Create the component**

```tsx
import React, { useState, useRef, useEffect } from 'react';

interface InlineInputProps {
  value: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  isEditing?: boolean;
  onEditStart?: () => void;
  autoFocus?: boolean;
}

const InlineInput: React.FC<InlineInputProps> = ({
  value,
  onSave,
  onCancel,
  placeholder = 'Enter text...',
  className = '',
  inputClassName = '',
  isEditing: controlledIsEditing,
  onEditStart,
  autoFocus = false,
}) => {
  const [internalIsEditing, setInternalIsEditing] = useState(autoFocus);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditing = controlledIsEditing ?? internalIsEditing;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleClick = () => {
    if (!isEditing) {
      setInternalIsEditing(true);
      onEditStart?.();
    }
  };

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSave(trimmed);
    }
    setInternalIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setInternalIsEditing(false);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Small delay to allow click events to fire first
    setTimeout(() => {
      if (inputValue.trim()) {
        handleSave();
      } else {
        handleCancel();
      }
    }, 150);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`bg-transparent border-b border-blue-500 outline-none px-1 ${inputClassName}`}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 px-1 rounded ${className}`}
    >
      {value || <span className="text-zinc-400">{placeholder}</span>}
    </span>
  );
};

export default InlineInput;
```

**Step 2: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/admin/lms/curriculum/InlineInput.tsx
git commit -m "feat: add InlineInput component for inline editing"
```

---

## Task 3: Create InlineAddInput component

**Files:**
- Create: `components/admin/lms/curriculum/InlineAddInput.tsx`

**Step 1: Create the component**

This is for "+ Add item..." inputs that start hidden.

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface InlineAddInputProps {
  onAdd: (value: string) => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

const InlineAddInput: React.FC<InlineAddInputProps> = ({
  onAdd,
  placeholder = 'Enter text...',
  buttonText = 'Add item',
  className = '',
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setValue('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (value.trim()) {
        handleSave();
      } else {
        handleCancel();
      }
    }, 150);
  };

  if (isAdding) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-b border-blue-500 outline-none px-1 py-1 text-sm"
        />
        <span className="text-xs text-zinc-400">Enter to save, Esc to cancel</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className={`flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 ${className}`}
    >
      <Plus className="w-4 h-4" />
      {buttonText}
    </button>
  );
};

export default InlineAddInput;
```

**Step 2: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/admin/lms/curriculum/InlineAddInput.tsx
git commit -m "feat: add InlineAddInput component for adding new items"
```

---

## Task 4: Create SmartUrlInput component

**Files:**
- Create: `components/admin/lms/curriculum/SmartUrlInput.tsx`

**Step 1: Create the component**

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { LmsContentType, detectContentType } from '../../../../types/lms-types';

interface SmartUrlInputProps {
  onAdd: (data: { title: string; contentType: LmsContentType; embedUrl?: string; contentText?: string }) => void;
  placeholder?: string;
  className?: string;
}

const SmartUrlInput: React.FC<SmartUrlInputProps> = ({
  onAdd,
  placeholder = 'Paste URL or type title...',
  className = '',
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const extractTitle = (url: string, type: LmsContentType): string => {
    // Try to extract a meaningful title from the URL
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Remove common prefixes and file extensions
      let title = pathname
        .split('/')
        .filter(Boolean)
        .pop() || '';

      // Clean up the title
      title = title
        .replace(/[-_]/g, ' ')
        .replace(/\.[^.]+$/, '')
        .trim();

      if (title) {
        return title.charAt(0).toUpperCase() + title.slice(1);
      }
    } catch {
      // Not a valid URL
    }

    // Fallback titles by type
    const fallbacks: Record<LmsContentType, string> = {
      video: 'Video',
      slide_deck: 'Slides',
      guide: 'Guide',
      clay_table: 'Clay Table',
      ai_tool: 'AI Tool',
      text: 'Text',
      external_link: 'Link',
      credentials: 'Credentials',
    };

    return fallbacks[type] || 'Content';
  };

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setIsAdding(false);
      return;
    }

    // Check if it's a URL
    const isUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://');

    if (isUrl) {
      const contentType = detectContentType(trimmed);
      const title = extractTitle(trimmed, contentType);
      onAdd({
        title,
        contentType,
        embedUrl: trimmed,
      });
    } else {
      // Plain text - treat as text content
      onAdd({
        title: trimmed.slice(0, 50) + (trimmed.length > 50 ? '...' : ''),
        contentType: 'text',
        contentText: trimmed,
      });
    }

    setValue('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setValue('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (value.trim()) {
        handleSave();
      } else {
        handleCancel();
      }
    }, 150);
  };

  if (isAdding) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-b border-blue-500 outline-none px-1 py-1 text-sm"
        />
        <span className="text-xs text-zinc-400">Enter to save</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className={`flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 ${className}`}
    >
      <Plus className="w-4 h-4" />
      Add content
    </button>
  );
};

export default SmartUrlInput;
```

**Step 2: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/admin/lms/curriculum/SmartUrlInput.tsx
git commit -m "feat: add SmartUrlInput with auto content type detection"
```

---

## Task 5: Rewrite WeekEditor with inline editing

**Files:**
- Modify: `components/admin/lms/curriculum/WeekEditor.tsx`

**Step 1: Rewrite the component**

```tsx
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '../../../../context/ThemeContext';
import {
  LmsWeekWithLessons,
  LmsLessonWithContent,
  LmsContentItem,
  LmsActionItem,
  LmsContentType,
} from '../../../../types/lms-types';
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  GripVertical,
  Video,
  FileText,
  Link,
  Key,
  Bot,
  Table,
  Presentation,
  BookOpen,
  EyeOff,
} from 'lucide-react';
import InlineInput from './InlineInput';
import InlineAddInput from './InlineAddInput';
import SmartUrlInput from './SmartUrlInput';

interface WeekEditorProps {
  week: LmsWeekWithLessons;
  weekNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateWeek: (title: string) => void;
  onDeleteWeek: () => void;
  onAddLesson: (title: string) => void;
  onUpdateLesson: (lessonId: string, title: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onAddContent: (lessonId: string, data: { title: string; contentType: LmsContentType; embedUrl?: string; contentText?: string }) => void;
  onUpdateContent: (contentId: string, data: { title?: string; embedUrl?: string }) => void;
  onDeleteContent: (contentId: string) => void;
  onAddAction: (text: string) => void;
  onUpdateAction: (actionId: string, text: string) => void;
  onDeleteAction: (actionId: string) => void;
  onOpenContentModal: (lessonId: string, contentType: 'credentials' | 'ai_tool') => void;
}

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="w-3.5 h-3.5" />;
    case 'slide_deck': return <Presentation className="w-3.5 h-3.5" />;
    case 'guide': return <BookOpen className="w-3.5 h-3.5" />;
    case 'clay_table': return <Table className="w-3.5 h-3.5" />;
    case 'ai_tool': return <Bot className="w-3.5 h-3.5" />;
    case 'text': return <FileText className="w-3.5 h-3.5" />;
    case 'external_link': return <Link className="w-3.5 h-3.5" />;
    case 'credentials': return <Key className="w-3.5 h-3.5" />;
    default: return <FileText className="w-3.5 h-3.5" />;
  }
};

const WeekEditor: React.FC<WeekEditorProps> = ({
  week,
  weekNumber,
  isExpanded,
  onToggle,
  onUpdateWeek,
  onDeleteWeek,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onAddContent,
  onUpdateContent,
  onDeleteContent,
  onAddAction,
  onUpdateAction,
  onDeleteAction,
  onOpenContentModal,
}) => {
  const { isDarkMode } = useTheme();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: week.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
      }`}
    >
      {/* Week Header */}
      <div
        className={`flex items-center gap-2 p-4 cursor-pointer ${
          isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'
        }`}
        onMouseEnter={() => setHoveredItem('week')}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <button onClick={onToggle} className="p-1">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Week {weekNumber}:
        </span>

        <InlineInput
          value={week.title}
          onSave={onUpdateWeek}
          className="font-semibold flex-1"
        />

        {!week.isVisible && (
          <EyeOff className="w-4 h-4 text-zinc-400" />
        )}

        {hoveredItem === 'week' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteWeek();
            }}
            className="p-1 text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          {/* Lessons */}
          <div className="p-4 space-y-3">
            {week.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`rounded-lg border ${
                  isDarkMode ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-200 bg-zinc-50'
                }`}
                onMouseEnter={() => setHoveredItem(`lesson-${lesson.id}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Lesson Header */}
                <div className="flex items-center gap-2 p-3">
                  <GripVertical className="w-3.5 h-3.5 text-zinc-400 cursor-grab" />
                  <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                  <InlineInput
                    value={lesson.title}
                    onSave={(title) => onUpdateLesson(lesson.id, title)}
                    className="font-medium text-sm flex-1"
                  />
                  {hoveredItem === `lesson-${lesson.id}` && (
                    <button
                      onClick={() => onDeleteLesson(lesson.id)}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Content Items */}
                <div className={`px-3 pb-3 space-y-1 ${lesson.contentItems.length > 0 ? 'pt-0' : ''}`}>
                  {lesson.contentItems.map((content) => (
                    <div
                      key={content.id}
                      className={`flex items-center gap-2 py-1.5 px-2 rounded text-sm ${
                        isDarkMode ? 'hover:bg-zinc-700/50' : 'hover:bg-zinc-100'
                      }`}
                      onMouseEnter={() => setHoveredItem(`content-${content.id}`)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <GripVertical className="w-3 h-3 text-zinc-400 cursor-grab" />
                      <span className="text-zinc-400">{getContentTypeIcon(content.contentType)}</span>
                      <InlineInput
                        value={content.title}
                        onSave={(title) => onUpdateContent(content.id, { title })}
                        className="flex-1"
                      />
                      {content.embedUrl && (
                        <InlineInput
                          value={content.embedUrl}
                          onSave={(embedUrl) => onUpdateContent(content.id, { embedUrl })}
                          className="text-xs text-zinc-400 max-w-[200px] truncate"
                        />
                      )}
                      {hoveredItem === `content-${content.id}` && (
                        <button
                          onClick={() => onDeleteContent(content.id)}
                          className="p-0.5 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-1">
                    <SmartUrlInput
                      onAdd={(data) => onAddContent(lesson.id, data)}
                      className="flex-1"
                    />
                    <button
                      onClick={() => onOpenContentModal(lesson.id, 'credentials')}
                      className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                      + Credentials
                    </button>
                    <button
                      onClick={() => onOpenContentModal(lesson.id, 'ai_tool')}
                      className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                      + AI Tool
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <InlineAddInput
              onAdd={onAddLesson}
              buttonText="Add lesson"
              placeholder="Lesson title..."
            />
          </div>

          {/* Action Items */}
          <div className={`p-4 border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              Action Items
            </h4>
            <div className="space-y-1">
              {week.actionItems.map((action) => (
                <div
                  key={action.id}
                  className={`flex items-center gap-2 py-1.5 px-2 rounded text-sm ${
                    isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50'
                  }`}
                  onMouseEnter={() => setHoveredItem(`action-${action.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <GripVertical className="w-3 h-3 text-zinc-400 cursor-grab" />
                  <span className="text-zinc-400">☐</span>
                  <InlineInput
                    value={action.text}
                    onSave={(text) => onUpdateAction(action.id, text)}
                    className="flex-1"
                  />
                  {hoveredItem === `action-${action.id}` && (
                    <button
                      onClick={() => onDeleteAction(action.id)}
                      className="p-0.5 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              <InlineAddInput
                onAdd={onAddAction}
                buttonText="Add action item"
                placeholder="Action item text..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekEditor;
```

**Step 2: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/admin/lms/curriculum/WeekEditor.tsx
git commit -m "feat: rewrite WeekEditor with inline editing"
```

---

## Task 6: Update AdminLmsCurriculumPage for inline editing

**Files:**
- Modify: `components/admin/lms/curriculum/AdminLmsCurriculumPage.tsx`

**Step 1: Update the page component**

Replace the modal-heavy approach with inline handlers. This is a significant refactor - the key changes are:

1. Remove modal state for week/lesson/action (keep only for credentials/AI tool)
2. Add inline handlers that call mutations directly
3. Wrap weeks in DndContext for drag-and-drop
4. Simplify the component significantly

```tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  useCreateLmsContentItemMutation,
  useUpdateLmsContentItemMutation,
  useDeleteLmsContentItemMutation,
  useCreateLmsActionItemMutation,
  useUpdateLmsActionItemMutation,
  useDeleteLmsActionItemMutation,
} from '../../../../hooks/useLmsMutations';
import { LmsContentType } from '../../../../types/lms-types';
import WeekEditor from './WeekEditor';
import LmsContentItemModal from './LmsContentItemModal';
import InlineAddInput from './InlineAddInput';
import { ArrowLeft, ChevronDown, AlertCircle } from 'lucide-react';

const AdminLmsCurriculumPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { cohortId } = useParams<{ cohortId: string }>();
  const navigate = useNavigate();

  // State
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [contentModal, setContentModal] = useState<{
    lessonId: string;
    weekId: string;
    contentType: 'credentials' | 'ai_tool';
  } | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Queries
  const { data: cohorts } = useQuery({
    queryKey: queryKeys.lmsCohorts(),
    queryFn: fetchAllLmsCohorts,
  });

  const { data: curriculum, isLoading } = useQuery({
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
  const createContentMutation = useCreateLmsContentItemMutation();
  const updateContentMutation = useUpdateLmsContentItemMutation();
  const deleteContentMutation = useDeleteLmsContentItemMutation();
  const createActionMutation = useCreateLmsActionItemMutation();
  const updateActionMutation = useUpdateLmsActionItemMutation();
  const deleteActionMutation = useDeleteLmsActionItemMutation();

  const selectedCohort = cohorts?.find((c) => c.id === cohortId);

  // Handlers
  const handleAddWeek = (title: string) => {
    if (!cohortId) return;
    createWeekMutation.mutate({
      cohortId,
      title,
      sortOrder: curriculum?.weeks.length || 0,
      isVisible: true,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !cohortId || !curriculum) return;

    const oldIndex = curriculum.weeks.findIndex((w) => w.id === active.id);
    const newIndex = curriculum.weeks.findIndex((w) => w.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = [...curriculum.weeks];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);
      reorderWeeksMutation.mutate({
        weekIds: newOrder.map((w) => w.id),
        cohortId,
      });
    }
  };

  // Cohort selector
  if (!cohortId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Curriculum Editor</h1>
        <p className="text-zinc-500 mb-4">Select a cohort to edit its curriculum:</p>
        <div className="grid gap-3 max-w-md">
          {cohorts?.map((cohort) => (
            <button
              key={cohort.id}
              onClick={() => navigate(`/admin/lms/curriculum/${cohort.id}`)}
              className={`p-4 rounded-lg border text-left ${
                isDarkMode
                  ? 'border-zinc-700 hover:bg-zinc-800'
                  : 'border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <div className="font-medium">{cohort.name}</div>
              {cohort.description && (
                <div className="text-sm text-zinc-500">{cohort.description}</div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="w-5 h-5" />
          <span>Cohort not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/lms/cohorts')}
          className={`p-2 rounded-lg ${
            isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{selectedCohort?.name || 'Curriculum'}</h1>
          <p className="text-sm text-zinc-500">
            {curriculum.weeks.length} weeks •{' '}
            {curriculum.weeks.reduce((acc, w) => acc + w.lessons.length, 0)} lessons
          </p>
        </div>
      </div>

      {/* Weeks */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={curriculum.weeks.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {curriculum.weeks.map((week, index) => (
              <WeekEditor
                key={week.id}
                week={week}
                weekNumber={index + 1}
                isExpanded={expandedWeeks.has(week.id)}
                onToggle={() => {
                  const newExpanded = new Set(expandedWeeks);
                  if (newExpanded.has(week.id)) {
                    newExpanded.delete(week.id);
                  } else {
                    newExpanded.add(week.id);
                  }
                  setExpandedWeeks(newExpanded);
                }}
                onUpdateWeek={(title) =>
                  updateWeekMutation.mutate({ weekId: week.id, updates: { title } })
                }
                onDeleteWeek={() => {
                  if (confirm(`Delete "${week.title}" and all its content?`)) {
                    deleteWeekMutation.mutate(week.id);
                  }
                }}
                onAddLesson={(title) =>
                  createLessonMutation.mutate({
                    weekId: week.id,
                    title,
                    sortOrder: week.lessons.length,
                    isVisible: true,
                  })
                }
                onUpdateLesson={(lessonId, title) =>
                  updateLessonMutation.mutate({ lessonId, updates: { title } })
                }
                onDeleteLesson={(lessonId) => {
                  if (confirm('Delete this lesson and all its content?')) {
                    deleteLessonMutation.mutate(lessonId);
                  }
                }}
                onAddContent={(lessonId, data) =>
                  createContentMutation.mutate({
                    lessonId,
                    title: data.title,
                    contentType: data.contentType,
                    embedUrl: data.embedUrl,
                    contentText: data.contentText,
                    sortOrder: 0,
                    isVisible: true,
                  })
                }
                onUpdateContent={(contentId, data) =>
                  updateContentMutation.mutate({ contentItemId: contentId, updates: data })
                }
                onDeleteContent={(contentId) => deleteContentMutation.mutate(contentId)}
                onAddAction={(text) =>
                  createActionMutation.mutate({
                    weekId: week.id,
                    text,
                    sortOrder: week.actionItems.length,
                    isVisible: true,
                  })
                }
                onUpdateAction={(actionId, text) =>
                  updateActionMutation.mutate({ actionItemId: actionId, updates: { text } })
                }
                onDeleteAction={(actionId) => deleteActionMutation.mutate(actionId)}
                onOpenContentModal={(lessonId, contentType) =>
                  setContentModal({ lessonId, weekId: week.id, contentType })
                }
              />
            ))}

            <InlineAddInput
              onAdd={handleAddWeek}
              buttonText="Add week"
              placeholder="Week title..."
              className="p-4"
            />
          </div>
        </SortableContext>
      </DndContext>

      {/* Content Modal for credentials/AI tool */}
      {contentModal && (
        <LmsContentItemModal
          isOpen={true}
          onClose={() => setContentModal(null)}
          onSubmit={async (data) => {
            await createContentMutation.mutateAsync({
              ...data,
              lessonId: contentModal.lessonId,
            });
            setContentModal(null);
          }}
          lessonId={contentModal.lessonId}
          initialContentType={contentModal.contentType}
        />
      )}
    </div>
  );
};

export default AdminLmsCurriculumPage;
```

**Step 2: Verify TypeScript compiles**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: No errors (may need minor type fixes)

**Step 3: Commit**

```bash
git add components/admin/lms/curriculum/AdminLmsCurriculumPage.tsx
git commit -m "feat: update curriculum page for inline editing with drag-and-drop"
```

---

## Task 7: Test and fix

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test the curriculum editor**

1. Navigate to `/admin/lms/curriculum`
2. Select a cohort
3. Test: Add a week by typing and pressing Enter
4. Test: Edit a week title by clicking it
5. Test: Drag to reorder weeks
6. Test: Expand a week, add a lesson
7. Test: Paste a URL to add content
8. Test: Add an action item

**Step 3: Fix any issues found**

Address TypeScript errors, runtime errors, or UX issues.

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: address inline editor issues from testing"
```

---

## Task 8: Delete unused modal components

**Files:**
- Delete: `components/admin/lms/curriculum/LmsWeekModal.tsx`
- Delete: `components/admin/lms/curriculum/LmsLessonModal.tsx`
- Delete: `components/admin/lms/curriculum/LmsActionItemModal.tsx`

**Step 1: Remove the files**

```bash
rm components/admin/lms/curriculum/LmsWeekModal.tsx
rm components/admin/lms/curriculum/LmsLessonModal.tsx
rm components/admin/lms/curriculum/LmsActionItemModal.tsx
```

**Step 2: Verify build still works**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove unused modal components"
```
