import React from 'react';
import { Filter } from 'lucide-react';

export interface Filters {
  qualificationStatus: string;
  emailStatus: string;
  linkedinStatus: string;
  source: string;
}

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sources: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange, sources }) => {
  return (
    <div className="flex flex-wrap gap-3 items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <Filter className="w-4 h-4 text-zinc-400" />

      <select
        value={filters.qualificationStatus}
        onChange={(e) => onFiltersChange({ ...filters, qualificationStatus: e.target.value })}
        className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
      >
        <option value="all">All Statuses</option>
        <option value="qualified">Qualified</option>
        <option value="disqualified">Disqualified</option>
        <option value="pending">Pending</option>
      </select>

      <select
        value={filters.emailStatus}
        onChange={(e) => onFiltersChange({ ...filters, emailStatus: e.target.value })}
        className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
      >
        <option value="all">All Email Statuses</option>
        <option value="verified">Verified</option>
        <option value="catch_all">Catch-all</option>
        <option value="not_found">Not Found</option>
        <option value="invalid">Invalid</option>
      </select>

      <select
        value={filters.linkedinStatus}
        onChange={(e) => onFiltersChange({ ...filters, linkedinStatus: e.target.value })}
        className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
      >
        <option value="all">All LinkedIn</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <select
        value={filters.source}
        onChange={(e) => onFiltersChange({ ...filters, source: e.target.value })}
        className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
      >
        <option value="all">All Sources</option>
        {sources.map((source) => (
          <option key={source} value={source}>
            {source}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
