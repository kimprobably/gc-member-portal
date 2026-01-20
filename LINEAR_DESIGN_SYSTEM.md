# Linear-Style Design System

A clean, minimalist design system inspired by Linear's aesthetic. Copy these patterns to achieve a consistent, professional look.

---

## Tailwind Config

Add this to your `tailwind.config.js` or inline config:

```js
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',  // Primary violet
          600: '#7c3aed',  // Hover state
          700: '#6d28d9',
          900: '#4c1d95',
        }
      }
    },
  },
}
```

**Required font:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## Color Palette

### Dark Mode (Primary)
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Background | `#09090B` | `zinc-950` | Page background |
| Surface | `#18181B` | `zinc-900` | Cards, sidebar, modals |
| Surface Hover | `#27272A` | `zinc-800` | Hover states |
| Border | `#27272A` | `zinc-800` | Dividers, card borders |
| Text Primary | `#FAFAFA` | `zinc-50` | Headings, important text |
| Text Secondary | `#A1A1AA` | `zinc-400` | Body text |
| Text Muted | `#71717A` | `zinc-500` | Captions, placeholders |

### Light Mode
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Background | `#FFFFFF` | `white` | Page background |
| Surface | `#FAFAFA` | `zinc-50` | Cards, sidebar |
| Surface Hover | `#F4F4F5` | `zinc-100` | Hover states |
| Border | `#E4E4E7` | `zinc-200` | Dividers, card borders |
| Text Primary | `#18181B` | `zinc-900` | Headings |
| Text Secondary | `#52525B` | `zinc-600` | Body text |
| Text Muted | `#A1A1AA` | `zinc-400` | Captions |

### Accent (Violet)
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Primary | `#8B5CF6` | `violet-500` | Buttons, links, active states |
| Hover | `#7C3AED` | `violet-600` | Button hover |
| Background | `rgba(139,92,246,0.1)` | `violet-500/10` | Active item backgrounds |

---

## Typography

### Principles
- Use `font-medium` (500) and `font-semibold` (600) instead of `font-bold`/`font-black`
- Avoid uppercase text except for very small labels
- Minimal letter-spacing (remove `tracking-widest`)
- Keep text sizes readable

### Scale
```css
/* Headings */
.h1 { @apply text-2xl font-semibold text-zinc-900 dark:text-white; }
.h2 { @apply text-xl font-semibold text-zinc-900 dark:text-white; }
.h3 { @apply text-lg font-semibold text-zinc-900 dark:text-white; }
.h4 { @apply text-base font-medium text-zinc-900 dark:text-white; }

/* Body */
.body { @apply text-sm text-zinc-600 dark:text-zinc-400; }
.body-small { @apply text-xs text-zinc-500 dark:text-zinc-400; }

/* Labels */
.label { @apply text-xs font-medium text-zinc-500 dark:text-zinc-400; }
.caption { @apply text-xs text-zinc-400 dark:text-zinc-500; }
```

---

## Components

### Page Background
```html
<body class="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100">
```

### Card
```html
<div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
  <!-- content -->
</div>
```

### Card with Hover
```html
<div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800
            hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
  <!-- content -->
</div>
```

### Primary Button
```html
<button class="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors">
  Button Text
</button>
```

### Secondary Button
```html
<button class="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700
               text-zinc-900 dark:text-zinc-100 font-medium rounded-lg transition-colors">
  Button Text
</button>
```

### Ghost Button
```html
<button class="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white
               hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium rounded-lg transition-colors">
  Button Text
</button>
```

### Text Input
```html
<input
  type="text"
  class="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800
         rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500
         focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
  placeholder="Enter text..."
/>
```

### Textarea
```html
<textarea
  class="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800
         rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500
         focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors resize-none"
  rows="4"
></textarea>
```

### Select
```html
<select class="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800
               rounded-lg text-zinc-900 dark:text-white outline-none cursor-pointer
               focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors">
  <option>Option 1</option>
</select>
```

### Badge / Tag
```html
<span class="px-2 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
  Label
</span>
```

### Accent Badge
```html
<span class="px-2 py-1 text-xs font-medium rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
  Active
</span>
```

---

## Navigation Patterns

### Sidebar Container
```html
<aside class="w-64 h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
  <!-- content -->
</aside>
```

### Nav Item (Default)
```html
<button class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
               text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
  <Icon class="w-4 h-4" />
  <span>Nav Item</span>
</button>
```

### Nav Item (Active)
```html
<button class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
               bg-violet-500/10 text-violet-600 dark:text-violet-400">
  <Icon class="w-4 h-4" />
  <span>Active Item</span>
</button>
```

### Section Header
```html
<div class="px-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
  Section Title
</div>
```

---

## Layout Patterns

### Page Container
```html
<div class="min-h-screen bg-white dark:bg-zinc-950">
  <!-- content -->
</div>
```

### Content Area
```html
<main class="flex-1 p-6 md:p-8 lg:p-10">
  <div class="max-w-5xl mx-auto">
    <!-- content -->
  </div>
</main>
```

### Header Bar
```html
<header class="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800
               flex items-center justify-between px-4">
  <!-- content -->
</header>
```

---

## Progress Bar
```html
<div class="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
  <div class="h-full bg-violet-500 rounded-full transition-all duration-500" style="width: 60%"></div>
</div>
```

---

## Modal / Dialog
```html
<!-- Backdrop -->
<div class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40"></div>

<!-- Modal -->
<div class="fixed inset-0 flex items-center justify-center z-50 p-4">
  <div class="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xl">
    <div class="p-6">
      <!-- content -->
    </div>
  </div>
</div>
```

---

## Alert / Info Box
```html
<!-- Info -->
<div class="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
  <p class="text-sm text-violet-800 dark:text-violet-200">Info message here.</p>
</div>

<!-- Warning -->
<div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
  <p class="text-sm text-amber-800 dark:text-amber-200">Warning message here.</p>
</div>

<!-- Success -->
<div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
  <p class="text-sm text-green-800 dark:text-green-200">Success message here.</p>
</div>
```

---

## Dark Mode Toggle (JS)
```js
// Check for saved preference or system preference
const isDark = localStorage.getItem('theme') === 'dark' ||
  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

// Apply theme
document.documentElement.classList.toggle('dark', isDark);

// Toggle function
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
```

---

## Key Principles

1. **Subtle borders** - Use `border-zinc-200 dark:border-zinc-800`, never heavy borders
2. **Minimal shadows** - Avoid `shadow-xl`/`shadow-2xl`, use `shadow-sm` or `shadow-md` sparingly
3. **Rounded corners** - Use `rounded-lg` (8px) consistently, not `rounded-2xl`/`rounded-3xl`
4. **Consistent spacing** - Use Tailwind's spacing scale (p-4, p-6, gap-3, etc.)
5. **Smooth transitions** - Add `transition-colors` or `transition-all` to interactive elements
6. **Readable fonts** - Prefer `font-medium` over `font-bold`, avoid excessive uppercase

---

## Quick Reference: Before → After

| Old Pattern | New Pattern |
|-------------|-------------|
| `bg-slate-*` | `bg-zinc-*` |
| `text-slate-*` | `text-zinc-*` |
| `border-slate-*` | `border-zinc-*` |
| `bg-blue-500` | `bg-violet-500` |
| `rounded-2xl` / `rounded-3xl` | `rounded-lg` |
| `shadow-xl` / `shadow-2xl` | `shadow-md` or none |
| `font-bold` / `font-black` | `font-medium` / `font-semibold` |
| `text-[9px] uppercase tracking-widest` | `text-xs font-medium` |
| `tracking-widest` / `tracking-[0.2em]` | Remove (default tracking) |
