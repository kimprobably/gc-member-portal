import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import type { CsvParseResult } from '../../../../types/cold-email-recipe-types';

interface Props {
  onParsed: (result: CsvParseResult) => void;
}

// RFC 4180-compliant CSV parser that handles quoted fields with commas/newlines
function parseRow(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i += 2;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
      } else {
        current += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
        i++;
      } else {
        current += ch;
        i++;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(text: string): CsvParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseRow(lines[0]);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

export default function CsvUploader({ onParsed }: Props) {
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
        const result = parseCsv(text);

        if (result.rows.length === 0) {
          setError('No rows found in CSV. Check the file format.');
          return;
        }

        setFileName(file.name);
        onParsed(result);
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
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Upload Contacts</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Upload a CSV file with your contact list. You'll map columns in the next step.
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
        onClick={() => document.getElementById('cold-email-csv-input')?.click()}
      >
        <input
          id="cold-email-csv-input"
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
