import React from 'react';
import { TamContact, TamEmailStatus } from '../../../types/tam-types';

interface ContactRowProps {
  contact: TamContact;
  isSelected: boolean;
  onToggle: (contactId: string) => void;
}

function getEmailStatusDot(status: TamEmailStatus | null): string {
  switch (status) {
    case 'verified':
    case 'found':
      return 'bg-green-500';
    case 'catch_all':
      return 'bg-yellow-500';
    case 'invalid':
    case 'not_found':
      return 'bg-red-500';
    default:
      return 'bg-zinc-300 dark:bg-zinc-600';
  }
}

function getLinkedInActivityDot(
  linkedinActive: boolean | null,
  lastPostDate: string | null
): { color: string; label: string } {
  if (!linkedinActive && linkedinActive !== false) {
    return { color: 'bg-zinc-300 dark:bg-zinc-600', label: 'Unknown' };
  }
  if (!lastPostDate) {
    return { color: 'bg-zinc-300 dark:bg-zinc-600', label: 'No activity' };
  }

  const daysSincePost = Math.floor(
    (Date.now() - new Date(lastPostDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSincePost < 30) {
    return { color: 'bg-green-500', label: `${daysSincePost}d ago` };
  } else if (daysSincePost < 90) {
    return { color: 'bg-yellow-500', label: `${daysSincePost}d ago` };
  } else {
    return { color: 'bg-zinc-400 dark:bg-zinc-600', label: `${daysSincePost}d ago` };
  }
}

const ContactRow: React.FC<ContactRowProps> = ({ contact, isSelected, onToggle }) => {
  const linkedinActivity = getLinkedInActivityDot(
    contact.linkedinActive,
    contact.linkedinLastPostDate
  );

  return (
    <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-zinc-100 dark:hover:bg-zinc-800/40">
      <td className="px-4 py-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(contact.id)}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
      </td>
      <td className="px-4 py-2"></td>
      <td className="px-4 py-2" colSpan={2}>
        <div className="pl-8">
          <div className="text-sm font-medium text-zinc-900 dark:text-white">
            {contact.firstName} {contact.lastName}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {contact.title || 'No title'}
          </div>
        </div>
      </td>
      <td className="px-4 py-2" colSpan={2}>
        {contact.email ? (
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${getEmailStatusDot(contact.emailStatus)}`}
            ></span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{contact.email}</span>
          </div>
        ) : (
          <span className="text-sm text-zinc-400 dark:text-zinc-500">No email</span>
        )}
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          <span className={`w-2 h-2 rounded-full ${linkedinActivity.color}`}></span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{linkedinActivity.label}</span>
        </div>
      </td>
      <td className="px-4 py-2">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{contact.phone || '-'}</span>
      </td>
    </tr>
  );
};

export default ContactRow;
