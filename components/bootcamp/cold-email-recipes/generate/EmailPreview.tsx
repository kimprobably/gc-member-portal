import React, { useState } from 'react';
import { Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import type { EmailTemplate, BootcampContact } from '../../../../types/cold-email-recipe-types';
import { interpolate, buildContactFields } from '../utils';

interface Props {
  contacts: BootcampContact[];
  template: EmailTemplate;
}

export default function EmailPreview({ contacts, template }: Props) {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const enriched = contacts.filter((c) => c.enrichmentStatus === 'done');
  if (enriched.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-zinc-400 dark:text-zinc-500">
        No enriched contacts to preview.
      </div>
    );
  }

  const contact = enriched[index];
  const fields = buildContactFields(contact);
  const subject = interpolate(template.subject, fields, true);
  const body = interpolate(template.body, fields, true);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {enriched.length} enriched email{enriched.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {index + 1} / {enriched.length}
          </span>
          <button
            onClick={() => setIndex(Math.min(enriched.length - 1, index + 1))}
            disabled={index >= enriched.length - 1}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Contact info */}
      <div className="text-xs text-zinc-400 dark:text-zinc-500">
        To: {contact.firstName} {contact.lastName} &lt;{contact.email}&gt; — {contact.company}
      </div>

      {/* Email preview */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">{subject}</p>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-zinc-400 hover:text-violet-500 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>
        <div className="p-4 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {body}
        </div>
      </div>

      {/* Step outputs for debugging */}
      {Object.keys(contact.stepOutputs).length > 0 && (
        <details className="text-xs">
          <summary className="text-zinc-400 dark:text-zinc-500 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300">
            Step outputs
          </summary>
          <pre className="mt-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 overflow-auto max-h-40">
            {JSON.stringify(contact.stepOutputs, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
