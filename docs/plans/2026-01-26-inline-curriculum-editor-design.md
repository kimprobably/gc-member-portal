# Inline Curriculum Editor Design

## Problem

The current curriculum editor is modal-heavy. Every add/edit operation requires:
1. Click button → Modal opens
2. Fill fields
3. Save → Modal closes

This creates friction when the typical workflow is:
1. Duplicate a cohort
2. Reorder weeks
3. Modify content (swap URLs, update titles)

## Solution

Replace modals with inline editing for all simple operations.

## Interactions

### Week Level

| Action | Interaction |
|--------|-------------|
| Add week | Click "+ Add week..." → inline input appears → Enter to save |
| Edit title | Click title → becomes input → Enter to save, Escape to cancel |
| Reorder | Drag handle (≡) |
| Delete | Hover → trash icon → click → confirm |

### Lesson Level

| Action | Interaction |
|--------|-------------|
| Add lesson | Click "+ Add lesson..." → inline input → Enter to save |
| Edit title | Click title → inline edit |
| Reorder | Drag handle |
| Delete | Hover → trash → confirm |

### Content Items

| Action | Interaction |
|--------|-------------|
| Add content | Click "+ Add content..." → smart paste input |
| Edit URL/title | Click to edit inline |
| Reorder | Drag handle |
| Delete | Hover → trash |

**Smart paste behavior:**
- YouTube/Loom/Vimeo URL → auto-detect as Video
- Gamma URL → auto-detect as Slide Deck
- Guidde URL → auto-detect as Guide
- Clay URL → auto-detect as Clay Table
- Other URL → default to External Link
- Plain text → prompt for type or default to Text

### Action Items

| Action | Interaction |
|--------|-------------|
| Add | Click "+ Add action item..." → inline input → Enter |
| Edit | Click text → inline edit |
| Reorder | Drag handle |
| Delete | Hover → trash |

### Exceptions (Keep Modal)

- **Credentials**: Requires multiple fields (URL, username, password, notes)
- **AI Tool**: Requires selecting from tool list

## Visual Structure

```
┌─────────────────────────────────────────────────────┐
│ ▼ Week 1: Foundations                      [drag] ≡ │
│                                                     │
│   ┌─ Lesson: Getting Started ─────────────[drag] ≡ │
│   │  📹 Intro Video          https://loom.com/...  │
│   │  📊 Slides               https://gamma.app/... │
│   │  [+ Add content...]                            │
│   └────────────────────────────────────────────────│
│                                                     │
│   [+ Add lesson...]                                │
│                                                     │
│   ─── Action Items ───────────────────────────────│
│   ☐ Set up your LinkedIn profile                   │
│   ☐ Complete the ICP worksheet                     │
│   [+ Add action item...]                           │
└─────────────────────────────────────────────────────┘
```

## Components

### New Components

1. **InlineInput.tsx** - Reusable click-to-edit component
   - Props: value, onSave, onCancel, placeholder
   - Shows text normally, input on click
   - Enter to save, Escape to cancel

2. **SmartUrlInput.tsx** - Content type auto-detection
   - Props: onSave, placeholder
   - Detects URL type, creates content item with correct type
   - Falls back to type selector for ambiguous input

3. **DraggableList.tsx** - Generic drag-and-drop wrapper
   - Uses @dnd-kit or react-beautiful-dnd
   - Props: items, onReorder, renderItem

### Modified Components

1. **WeekEditor.tsx** - Complete rewrite
   - Inline editing for all fields
   - Drag handles
   - Expandable sections

2. **AdminLmsCurriculumPage.tsx** - Simplify
   - Remove modal state management
   - Keep only credentials/AI tool modals

### Deleted Components

- LmsWeekModal.tsx
- LmsLessonModal.tsx
- LmsActionItemModal.tsx

### Kept Components

- LmsContentItemModal.tsx (for credentials/AI tool only)

## Implementation Order

1. Create InlineInput component
2. Create SmartUrlInput component
3. Rewrite WeekEditor with inline editing
4. Add drag-and-drop for weeks
5. Add drag-and-drop for lessons/content/actions
6. Update AdminLmsCurriculumPage to remove unused modals
7. Delete unused modal components
8. Test full workflow
