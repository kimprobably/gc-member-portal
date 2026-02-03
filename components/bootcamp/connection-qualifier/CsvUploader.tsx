/* global File, FileReader */
import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { parseLinkedInCsv } from './parseCsv';
import type { LinkedInConnection } from '../../../types/connection-qualifier-types';

interface CsvUploaderProps {
  onParsed: (connections: LinkedInConnection[]) => void;
}

export default function CsvUploader({ onParsed }: CsvUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const connections = parseLinkedInCsv(text);

        if (connections.length === 0) {
          setError('No valid connections found. Make sure this is a LinkedIn connections export.');
          return;
        }

        setFileName(file.name);
        onParsed(connections);
      };
      reader.onerror = () => setError('Failed to read file.');
      reader.readAsText(file);
    },
    [onParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Upload LinkedIn Connections
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Export your connections from{' '}
          <a
            href="https://www.linkedin.com/mypreferences/d/download-my-data"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 dark:text-violet-400 underline"
          >
            LinkedIn Data Export
          </a>{' '}
          and upload the Connections CSV file here.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-600'
        }`}
        onClick={() => document.getElementById('csv-file-input')?.click()}
      >
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        {fileName ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-10 h-10 text-violet-500" />
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{fileName}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-600" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Drag & drop your CSV here, or click to browse
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
