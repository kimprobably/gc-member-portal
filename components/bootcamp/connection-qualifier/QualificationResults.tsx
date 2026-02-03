/* global Blob */
import React, { useCallback } from 'react';
import { Download, CheckCircle2, RotateCcw } from 'lucide-react';
import type { QualifiedConnection } from '../../../types/connection-qualifier-types';

interface QualificationResultsProps {
  totalParsed: number;
  preFiltered: number;
  results: QualifiedConnection[];
  onStartOver: () => void;
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function generateOutputCsv(connections: QualifiedConnection[]): string {
  const headers = [
    'First Name',
    'Last Name',
    'URL',
    'Email Address',
    'Company',
    'Position',
    'Connected On',
    'Qualification',
    'Confidence',
    'Reasoning',
  ];
  const rows = connections.map((c) =>
    [
      escapeCsvField(c.firstName),
      escapeCsvField(c.lastName),
      escapeCsvField(c.url),
      escapeCsvField(c.emailAddress),
      escapeCsvField(c.company),
      escapeCsvField(c.position),
      escapeCsvField(c.connectedOn),
      escapeCsvField(c.qualification),
      escapeCsvField(c.confidence),
      escapeCsvField(c.reasoning),
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: 'green' | 'violet';
}) {
  const valueClass =
    color === 'green'
      ? 'text-green-600 dark:text-green-400'
      : color === 'violet'
        ? 'text-violet-600 dark:text-violet-400'
        : 'text-zinc-900 dark:text-white';

  return (
    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
      <p className={`text-2xl font-bold ${valueClass}`}>{value.toLocaleString()}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

export default function QualificationResults({
  totalParsed,
  preFiltered,
  results,
  onStartOver,
}: QualificationResultsProps) {
  const qualified = results.filter((r) => r.qualification === 'qualified');
  const highConfidence = qualified.filter((r) => r.confidence === 'high');

  const handleDownloadAll = useCallback(() => {
    const csv = generateOutputCsv(results);
    downloadCsv(csv, 'qualified-connections-all.csv');
  }, [results]);

  const handleDownloadQualified = useCallback(() => {
    const csv = generateOutputCsv(qualified);
    downloadCsv(csv, 'qualified-connections.csv');
  }, [qualified]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Qualification Complete
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Connections" value={totalParsed} />
        <StatCard label="Pre-filtered Out" value={totalParsed - preFiltered} />
        <StatCard label="Qualified" value={qualified.length} color="green" />
        <StatCard label="High Confidence" value={highConfidence.length} color="violet" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadQualified}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Qualified ({qualified.length})
        </button>
        <button
          onClick={handleDownloadAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download All with Scores ({results.length})
        </button>
        <button
          onClick={onStartOver}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </div>
  );
}
