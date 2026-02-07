import React from 'react';
import { Download } from 'lucide-react';
import type { BootcampContact, EmailTemplate } from '../../../../types/cold-email-recipe-types';
import { interpolate, buildContactFields } from '../utils';

interface Props {
  contacts: BootcampContact[];
  template: EmailTemplate;
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function ExportButton({ contacts, template }: Props) {
  const enriched = contacts.filter((c) => c.enrichmentStatus === 'done');

  const handleExport = () => {
    const headers = ['first_name', 'last_name', 'email', 'company', 'title', 'subject', 'body'];
    const rows = enriched.map((c) => {
      const fields = buildContactFields(c);
      const subject = interpolate(template.subject, fields);
      const body = interpolate(template.body, fields);
      return [c.firstName, c.lastName, c.email, c.company, c.title, subject, body].map(escapeCsv);
    });

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cold-emails-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={enriched.length === 0}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Download size={14} />
      Export CSV ({enriched.length})
    </button>
  );
}
