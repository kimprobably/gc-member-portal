import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingProgressProps {
  completedBatches: number;
  totalBatches: number;
  qualifiedSoFar: number;
  processedSoFar: number;
}

export default function ProcessingProgress({
  completedBatches,
  totalBatches,
  qualifiedSoFar,
  processedSoFar,
}: ProcessingProgressProps) {
  const progress = totalBatches > 0 ? Math.round((completedBatches / totalBatches) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Qualifying Connections...
        </h2>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          <span>
            Batch {completedBatches} of {totalBatches}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {processedSoFar.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Processed</p>
        </div>
        <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-900/10">
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
            {qualifiedSoFar.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Qualified so far</p>
        </div>
      </div>
    </div>
  );
}
