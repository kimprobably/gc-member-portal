import React from 'react';
import { Download } from 'lucide-react';
import { TamContact, TamCompany } from '../../../types/tam-types';

interface BulkActionsProps {
  selectedContactIds: Set<string>;
  allFilteredContacts: TamContact[];
  companies: TamCompany[];
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedContactIds,
  allFilteredContacts,
  companies,
}) => {
  const exportToCsv = () => {
    const contactsToExport =
      selectedContactIds.size > 0
        ? allFilteredContacts.filter((c) => selectedContactIds.has(c.id))
        : allFilteredContacts;

    const companyMap = new Map(companies.map((c) => [c.id, c]));
    const headers =
      'first_name,last_name,email,company_name,title,linkedin_url,phone,email_status,linkedin_active';
    const rows = contactsToExport.map((c) => {
      const company = companyMap.get(c.companyId);
      return [
        c.firstName || '',
        c.lastName || '',
        c.email || '',
        company?.name || '',
        c.title || '',
        c.linkedinUrl || '',
        c.phone || '',
        c.emailStatus || '',
        c.linkedinActive ? 'true' : 'false',
      ]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(',');
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new globalThis.Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tam-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`${selectedContactIds.size > 0 ? 'fixed bottom-20 left-1/2 transform -translate-x-1/2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg px-6 py-3' : 'flex justify-end'}`}
    >
      <div className="flex items-center gap-4">
        {selectedContactIds.size > 0 && (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {selectedContactIds.size} contact{selectedContactIds.size !== 1 ? 's' : ''} selected
          </span>
        )}
        <button
          onClick={exportToCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white hover:bg-violet-600 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          {selectedContactIds.size > 0 ? 'Export Selected' : 'Export All'}
        </button>
      </div>
    </div>
  );
};

export default BulkActions;
