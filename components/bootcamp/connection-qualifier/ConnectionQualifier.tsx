import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { fetchMemberICP } from '../../../services/supabase';
import CsvUploader from './CsvUploader';
import QualificationCriteria from './QualificationCriteria';
import ProcessingProgress from './ProcessingProgress';
import QualificationResults from './QualificationResults';
import { preFilterConnections } from './preFilter';
import type {
  LinkedInConnection,
  QualificationCriteria as CriteriaType,
  QualifiedConnection,
  QualifierStep,
  QualificationResult,
} from '../../../types/connection-qualifier-types';
import type { MemberICP } from '../../../types/gc-types';
import { Filter } from 'lucide-react';

const BATCH_SIZE = 50;

interface ConnectionQualifierProps {
  userId: string;
}

export default function ConnectionQualifier({ userId }: ConnectionQualifierProps) {
  const [step, setStep] = useState<QualifierStep>('upload');
  const [connections, setConnections] = useState<LinkedInConnection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<LinkedInConnection[]>([]);
  const [criteria, setCriteria] = useState<CriteriaType | null>(null);
  const [savedIcp, setSavedIcp] = useState<MemberICP | null>(null);
  const [results, setResults] = useState<QualifiedConnection[]>([]);

  // Progress tracking
  const [completedBatches, setCompletedBatches] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [qualifiedSoFar, setQualifiedSoFar] = useState(0);
  const [processedSoFar, setProcessedSoFar] = useState(0);

  // Load saved ICP on mount
  useEffect(() => {
    if (userId) {
      fetchMemberICP(userId).then((icp) => {
        if (icp) setSavedIcp(icp);
      });
    }
  }, [userId]);

  const handleParsed = useCallback((parsed: LinkedInConnection[]) => {
    setConnections(parsed);
    setStep('criteria');
  }, []);

  const handleCriteriaSubmit = useCallback(
    (c: CriteriaType) => {
      setCriteria(c);
      const filtered = preFilterConnections(connections, c);
      setFilteredConnections(filtered);
      setStep('preview');
    },
    [connections]
  );

  const handleRunQualification = useCallback(async () => {
    if (!criteria || filteredConnections.length === 0) return;

    setStep('processing');

    const batches: LinkedInConnection[][] = [];
    for (let i = 0; i < filteredConnections.length; i += BATCH_SIZE) {
      batches.push(filteredConnections.slice(i, i + BATCH_SIZE));
    }

    setTotalBatches(batches.length);
    setCompletedBatches(0);
    setQualifiedSoFar(0);
    setProcessedSoFar(0);

    const allResults: QualifiedConnection[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        const { data, error: fnError } = await supabase.functions.invoke('qualify-connections', {
          body: {
            connections: batch.map((c) => ({
              firstName: c.firstName,
              lastName: c.lastName,
              company: c.company,
              position: c.position,
            })),
            criteria: {
              targetTitles: criteria.targetTitles,
              targetIndustries: criteria.targetIndustries,
              freeTextDescription: criteria.freeTextDescription,
            },
          },
        });

        if (fnError) throw fnError;

        const batchResults: QualificationResult[] = data.results || [];

        batch.forEach((conn, idx) => {
          const result = batchResults[idx];
          allResults.push({
            ...conn,
            qualification: result?.qualification || 'not_qualified',
            confidence: result?.confidence || 'low',
            reasoning: result?.reasoning || 'No result returned',
          });
        });

        const newQualified = batchResults.filter(
          (r: QualificationResult) => r?.qualification === 'qualified'
        ).length;
        setCompletedBatches(i + 1);
        setProcessedSoFar((prev) => prev + batch.length);
        setQualifiedSoFar((prev) => prev + newQualified);
      } catch (err) {
        console.error(`Batch ${i + 1} failed:`, err);
        batch.forEach((conn) => {
          allResults.push({
            ...conn,
            qualification: 'not_qualified',
            confidence: 'low',
            reasoning: 'Batch processing failed — retry recommended',
          });
        });
        setCompletedBatches(i + 1);
        setProcessedSoFar((prev) => prev + batch.length);
      }
    }

    setResults(allResults);
    setStep('results');
  }, [criteria, filteredConnections]);

  const handleStartOver = useCallback(() => {
    setStep('upload');
    setConnections([]);
    setFilteredConnections([]);
    setCriteria(null);
    setResults([]);
    setCompletedBatches(0);
    setTotalBatches(0);
    setQualifiedSoFar(0);
    setProcessedSoFar(0);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Connection Qualifier</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Upload your LinkedIn connections and find the ones worth reaching out to.
        </p>
      </div>

      {step === 'upload' && <CsvUploader onParsed={handleParsed} />}

      {step === 'criteria' && (
        <QualificationCriteria
          savedIcp={savedIcp}
          onSubmit={handleCriteriaSubmit}
          onBack={() => setStep('upload')}
        />
      )}

      {step === 'preview' && criteria && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Pre-filter Summary
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Review the numbers before running AI qualification.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {connections.length.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Connections</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-2xl font-bold text-red-500">
                {(connections.length - filteredConnections.length).toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Pre-filtered Out</p>
            </div>
            <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-900/10">
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {filteredConnections.length.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Sending to AI</p>
            </div>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {Math.ceil(filteredConnections.length / BATCH_SIZE)} batches will be processed.
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('criteria')}
              className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleRunQualification}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Run Qualification
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <ProcessingProgress
          completedBatches={completedBatches}
          totalBatches={totalBatches}
          qualifiedSoFar={qualifiedSoFar}
          processedSoFar={processedSoFar}
        />
      )}

      {step === 'results' && (
        <QualificationResults
          totalParsed={connections.length}
          preFiltered={filteredConnections.length}
          results={results}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}
