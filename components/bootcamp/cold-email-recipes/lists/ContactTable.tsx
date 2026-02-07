import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useContacts } from '../../../../hooks/useColdEmailRecipes';

interface Props {
  listId: string;
}

const PAGE_SIZE = 25;

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-zinc-400',
  processing: 'text-amber-500',
  done: 'text-emerald-500',
  failed: 'text-red-500',
};

export default function ContactTable({ listId }: Props) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useContacts(listId, PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const contacts = data?.contacts || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-zinc-400 dark:text-zinc-500">
        No contacts in this list.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50">
              <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Name
              </th>
              <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </th>
              <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Company
              </th>
              <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Title
              </th>
              <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr
                key={c.id}
                className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
              >
                <td className="px-3 py-2 text-zinc-900 dark:text-white whitespace-nowrap">
                  {c.firstName} {c.lastName}
                </td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400 font-mono">{c.email}</td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{c.company}</td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{c.title}</td>
                <td className={`px-3 py-2 ${STATUS_COLORS[c.enrichmentStatus] || ''}`}>
                  {c.enrichmentStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
