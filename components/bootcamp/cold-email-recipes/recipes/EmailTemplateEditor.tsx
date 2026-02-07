import React, { useMemo } from 'react';
import type { EmailTemplate } from '../../../../types/cold-email-recipe-types';

interface Props {
  template: EmailTemplate;
  onChange: (template: EmailTemplate) => void;
  availableFields: string[];
}

// Highlight {{variables}} in the text
function HighlightedPreview({ text, fields }: { text: string; fields: string[] }) {
  if (!text) return <span className="text-zinc-400 italic">Empty</span>;

  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{\{([^}]+)\}\}$/);
        if (match) {
          const fieldName = match[1].trim();
          const exists = fields.includes(fieldName);
          return (
            <span
              key={i}
              className={`px-1 rounded text-xs font-mono ${
                exists
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function EmailTemplateEditor({ template, onChange, availableFields }: Props) {
  // Extract all {{variables}} used in template
  const usedVars = useMemo(() => {
    const all = `${template.subject} ${template.body}`;
    const matches = all.match(/\{\{([^}]+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '').trim()))];
  }, [template.subject, template.body]);

  const unknownVars = usedVars.filter((v) => !availableFields.includes(v));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Email Template</h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3">
          Use{' '}
          <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
            {'{{field_name}}'}
          </code>{' '}
          to insert contact data or step outputs.
        </p>
      </div>

      {/* Available fields */}
      {availableFields.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {availableFields.map((field) => (
            <span
              key={field}
              className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono"
            >
              {`{{${field}}}`}
            </span>
          ))}
        </div>
      )}

      {/* Subject */}
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Subject line
        </label>
        <input
          type="text"
          value={template.subject}
          onChange={(e) => onChange({ ...template, subject: e.target.value })}
          placeholder="Hey {{first_name}}, quick question about {{company}}"
          className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Email body
        </label>
        <textarea
          value={template.body}
          onChange={(e) => onChange({ ...template, body: e.target.value })}
          rows={8}
          placeholder={`Hi {{first_name}},\n\n{{custom_opener}}\n\nI'd love to chat about how we can help {{company}} with...\n\nBest,\n[Your name]`}
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 font-mono"
        />
      </div>

      {/* Warnings */}
      {unknownVars.length > 0 && (
        <div className="text-xs text-amber-600 dark:text-amber-400">
          Unknown variables: {unknownVars.map((v) => `{{${v}}}`).join(', ')}. These won't be
          resolved unless they match a contact field or step output.
        </div>
      )}

      {/* Live Preview */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Preview
        </p>
        <div className="text-sm font-medium text-zinc-900 dark:text-white">
          <HighlightedPreview text={template.subject} fields={availableFields} />
        </div>
        <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
          <HighlightedPreview text={template.body} fields={availableFields} />
        </div>
      </div>
    </div>
  );
}
