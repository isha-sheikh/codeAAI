import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Terminal,
  Cpu,
  Clock,
  Play,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BenchmarkProblem, SandboxExecutionResult } from '../types';
import { api } from '../api';

interface TestResultsViewProps {
  benchmarks: BenchmarkProblem[];
  lastSandboxResult: SandboxExecutionResult | null;
  activeProblem: BenchmarkProblem | null;
  onSelectProblem: (problem: BenchmarkProblem) => void;
}

export const TestResultsView: React.FC<TestResultsViewProps> = ({
  benchmarks,
  lastSandboxResult,
  activeProblem,
  onSelectProblem,
}) => {
  const currentProblem = activeProblem || benchmarks[0];
  const [customCode, setCustomCode] = useState<string>(
    currentProblem.referenceSolution || currentProblem.faultyCode
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<SandboxExecutionResult | null>(
    lastSandboxResult
  );
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const handleRunCustomSandbox = async () => {
    setIsRunning(true);
    try {
      const res = await api.executeSandbox(customCode, currentProblem.tests);
      setExecutionResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const currentResult = executionResult || lastSandboxResult;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            Sandbox Test Suite & Invariant Verification
          </h1>
          <p className="text-xs text-neutral-500">
            Node-VM execution with isolated timeout boundaries and memory monitoring
          </p>
        </div>

        {/* Problem selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600">Test Suite:</label>
          <select
            value={currentProblem.id}
            onChange={(e) => {
              const p = benchmarks.find((b) => b.id === e.target.value);
              if (p) {
                onSelectProblem(p);
                setCustomCode(p.referenceSolution || p.faultyCode);
                setExecutionResult(null);
              }
            }}
            className="text-xs font-medium bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {benchmarks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title.split(' - ')[0]} ({b.tests.length} tests)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Test Pass Status
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              {currentResult ? `${currentResult.passCount} / ${currentResult.totalCount}` : '0 / 0'}
            </span>
            <span className="text-xs text-neutral-500">Passed</span>
          </div>
          <div className="mt-1">
            <span
              className={`text-xs font-semibold ${
                currentResult?.success ? 'text-emerald-700' : 'text-neutral-500'
              }`}
            >
              {currentResult?.success
                ? '100% Invariants Satisfied'
                : currentResult
                ? `${currentResult.failCount} Tests Failing`
                : 'Awaiting Run'}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Execution Latency
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              {currentResult ? `${currentResult.executionTimeMs}ms` : '--'}
            </span>
            <span className="text-xs text-neutral-500">Total</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">Timeout limit: 2,500ms</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Memory Delta
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              {currentResult ? `${currentResult.memoryUsageMb} MB` : '--'}
            </span>
            <span className="text-xs text-neutral-500">Heap</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">Zero global leak boundary</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Sandbox Isolation
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">Active</span>
            <span className="text-xs text-emerald-700 font-medium">100% Isolated</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">Protected node:vm context</p>
        </div>
      </div>

      {/* Test Cases List */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
            Test Case Invariant Assertions ({currentProblem.tests.length})
          </span>
          <span className="text-xs text-neutral-500">
            Click any test to inspect assertion code and outputs
          </span>
        </div>

        <div className="divide-y divide-neutral-100">
          {currentProblem.tests.map((test, index) => {
            const resultDetail = currentResult?.testDetails.find((t) => t.id === test.id);
            const isPassed = resultDetail ? resultDetail.passed : undefined;
            const isExpanded = expandedTestId === test.id;

            return (
              <div key={test.id} className="p-4 hover:bg-neutral-50/50 transition-colors">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-neutral-400 w-5">
                      #{index + 1}
                    </span>
                    {isPassed === true && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {isPassed === false && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    {isPassed === undefined && (
                      <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
                    )}

                    <div>
                      <h4 className="text-xs font-semibold text-neutral-900">{test.name}</h4>
                      <p className="text-[11px] text-neutral-500">Expected: {test.expected}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {resultDetail?.durationMs !== undefined && (
                      <span className="text-[11px] font-mono text-neutral-400">
                        {resultDetail.durationMs}ms
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isPassed === true
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isPassed === false
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {isPassed === true ? 'PASSED' : isPassed === false ? 'FAILED' : 'QUEUED'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-neutral-700 block mb-1">
                        Test Assertion Script:
                      </span>
                      <pre className="p-2.5 rounded bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto">
                        {test.testCode}
                      </pre>
                    </div>

                    {resultDetail && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div className="p-2 rounded bg-neutral-50 border border-neutral-200">
                          <span className="text-neutral-500 block">Actual Outcome:</span>
                          <span className={isPassed ? 'text-emerald-700' : 'text-rose-700'}>
                            {resultDetail.actual || (isPassed ? 'Assertion verified' : 'Failed')}
                          </span>
                        </div>
                        {resultDetail.error && (
                          <div className="p-2 rounded bg-rose-50 border border-rose-200">
                            <span className="text-rose-600 block">Error Trace:</span>
                            <span className="text-rose-800 break-all">{resultDetail.error}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Sandbox Execution Console */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-orange-600" />
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
              Live Sandbox Test Runner
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCustomCode(currentProblem.referenceSolution || '')}
              className="text-[11px] px-2 py-1 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            >
              Load Verified Solution
            </button>
            <button
              onClick={() => setCustomCode(currentProblem.faultyCode)}
              className="text-[11px] px-2 py-1 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            >
              Load Faulty Code
            </button>
            <button
              onClick={handleRunCustomSandbox}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs cursor-pointer disabled:opacity-60"
            >
              <Play className="w-3.5 h-3.5 text-orange-400" />
              <span>{isRunning ? 'Running VM...' : 'Execute in Sandbox'}</span>
            </button>
          </div>
        </div>

        <textarea
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          rows={8}
          className="w-full font-mono text-xs text-neutral-900 bg-neutral-900/5 p-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />

        {/* Console Outputs */}
        {currentResult?.consoleOutput && currentResult.consoleOutput.length > 0 && (
          <div className="p-3 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-xs space-y-1">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-800">
              Captured Sandbox Console Output:
            </div>
            {currentResult.consoleOutput.map((line, idx) => (
              <div key={idx} className="text-neutral-300">
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
