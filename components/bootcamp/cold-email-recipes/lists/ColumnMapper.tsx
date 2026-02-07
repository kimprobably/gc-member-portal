import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { STANDARD_FIELDS } from '../../../../types/cold-email-recipe-types';
import type { CsvParseResult } from '../../../../types/cold-email-recipe-types';

interface Props {
  csvResult: CsvParseResult;
  onConfirm: (mapping: Record<string, string>, listName: string) => void;
  onBack: () => void;
}

// Auto-guess mapping based on header names
function guessMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const normalizedMap: Record<string, string> = {
    'first name': 'first_name',
    firstname: 'first_name',
    first_name: 'first_name',
    'last name': 'last_name',
    lastname: 'last_name',
    last_name: 'last_name',
    email: 'email',
    'email address': 'email',
    company: 'company',
    'company name': 'company',
    organization: 'company',
    title: 'title',
    'job title': 'title',
    position: 'title',
    linkedin: 'linkedin_url',
    'linkedin url': 'linkedin_url',
    linkedin_url: 'linkedin_url',
    'profile url': 'linkedin_url',
  };

  for (const header of headers) {
    const normalized = header.toLowerCase().trim();
    if (normalizedMap[normalized]) {
      mapping[header] = normalizedMap[normalized];
    }
  }

  return mapping;
}

export default function ColumnMapper({ csvResult, onConfirm, onBack }: Props) {
  const [mapping, setMapping] = useState<Record<string, string>>(() =>
    guessMapping(csvResult.headers)
  );
  const [listName, setListName] = useState('');

  const unmappedHeaders = csvResult.headers.filter((h) => !mapping[h]);
  const mappedStandard = new Set(Object.values(mapping));

  const handleMappingChange = (header: string, value: string) => {
    if (value === '') {
      const { [header]: _, ...rest } = mapping;
      setMapping(rest);
    } else {
      setMapping({ ...mapping, [header]: value });
    }
  };

  const previewRows = csvResult.rows.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Map Columns</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Map your CSV columns to standard contact fields. Unmapped columns will be saved as custom
          fields.
        </p>
      </div>

      {/* List name */}
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          List name
        </label>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="e.g. Agency owners - Jan batch"
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
        />
      </div>

      {/* Mapping table */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50">
              <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                CSV Column
              </th>
              <th className="px-2 py-2 w-8"></th>
              <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Maps to
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Sample
              </th>
            </tr>
          </thead>
          <tbody>
            {csvResult.headers.map((header) => (
              <tr key={header} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {header}
                </td>
                <td className="px-2 py-2 text-zinc-300 dark:text-zinc-600">
                  <ArrowRight size={12} />
                </td>
                <td className="px-4 py-2">
                  <select
                    value={mapping[header] || ''}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="">Custom field</option>
                    {STANDARD_FIELDS.map((field) => (
                      <option
                        key={field}
                        value={field}
                        disabled={mappedStandard.has(field) && mapping[header] !== field}
                      >
                        {field}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]">
                  {previewRows[0]?.[header] || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            {csvResult.rows.length.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Contacts</p>
        </div>
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
            {Object.keys(mapping).length}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Mapped</p>
        </div>
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            {unmappedHeaders.length}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Custom fields</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => onConfirm(mapping, listName || 'Untitled list')}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          <Check size={14} />
          Import {csvResult.rows.length.toLocaleString()} contacts
        </button>
      </div>
    </div>
  );
}
