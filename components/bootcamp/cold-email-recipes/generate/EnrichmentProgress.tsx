import React from 'react';

interface Props {
  completed: number;
  total: number;
  failed: number;
}

export default function EnrichmentProgress({ completed, total, failed }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">Processing contacts...</span>
        <span className="font-medium text-zinc-900 dark:text-white">
          {completed} / {total}
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
        <span>{pct}% complete</span>
        {failed > 0 && <span className="text-red-500">{failed} failed</span>}
      </div>
    </div>
  );
}
