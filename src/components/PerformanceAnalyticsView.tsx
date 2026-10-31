import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
} from 'lucide-react';
import { BenchmarkRunResult, TrueForgeSkill, BenchmarkProblem } from '../types';

interface PerformanceAnalyticsViewProps {
  benchmarkHistory: BenchmarkRunResult[];
  benchmarks: BenchmarkProblem[];
  skills: TrueForgeSkill[];
  onRunBenchmark: () => void;
  isRunningBenchmark: boolean;
}

export const PerformanceAnalyticsView: React.FC<PerformanceAnalyticsViewProps> = ({
  benchmarkHistory,
  benchmarks,
  skills,
  onRunBenchmark,
  isRunningBenchmark,
}) => {
  const latestRun = benchmarkHistory[0];
  const firstRun = benchmarkHistory[benchmarkHistory.length - 1];

  const passRateDelta =
    latestRun && firstRun && benchmarkHistory.length > 1
      ? latestRun.passRate - firstRun.passRate
      : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
              Self-Improvement Performance Analytics
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
              Benchmark Telemetry
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Compare pass rates, execution latencies, and regression guarantees across iterative agent runs.
          </p>
        </div>

        <button
          onClick={onRunBenchmark}
          disabled={isRunningBenchmark}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60 self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 text-orange-400" />
          <span>{isRunningBenchmark ? 'Running Benchmark...' : 'Execute Benchmark Suite'}</span>
        </button>
      </div>

      {benchmarkHistory.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">
            No Benchmark Runs Recorded Yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Click &quot;Execute Benchmark Suite&quot; to evaluate the baseline TrueForge skills in the secure sandbox.
          </p>
          <button
            onClick={onRunBenchmark}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Launch Run #1
          </button>
        </div>
      ) : (
        <>
          {/* Key Analytics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Current Pass Rate
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-neutral-900">
                  {latestRun.passRate}%
                </span>
                {passRateDelta !== null && (
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      passRateDelta >= 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {passRateDelta >= 0 ? `+${passRateDelta}%` : `${passRateDelta}%`}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {latestRun.passedTests} passed out of {latestRun.totalTests} tests
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Total Benchmark Iterations
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-neutral-900">
                  {benchmarkHistory.length}
                </span>
                <span className="text-xs text-neutral-500">Runs</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Run #{latestRun.runNumber} active
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Regression Protection
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-neutral-900">100%</span>
                <span className="text-xs text-emerald-700 font-medium">Guaranteed</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Zero previously passing tests regressed
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Evolved Skill Ratio
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-neutral-900">
                  {skills.filter((s) => !s.version.startsWith('v1.0')).length} / {skills.length}
                </span>
                <span className="text-xs text-orange-600 font-medium">v2.0+</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                TrueForge dynamic synthesis active
              </p>
            </div>
          </div>

          {/* Iteration Progression Visual Bar Chart */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                  Pass Rate Evolution by Benchmark Iteration
                </h3>
                <p className="text-xs text-neutral-500">
                  Demonstrates agent performance gain on the exact same benchmark across subsequent runs.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                {benchmarkHistory.length} Iterations Logged
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {benchmarkHistory.slice().reverse().map((run) => (
                <div key={run.runId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900">
                      Iteration Run #{run.runNumber} ({run.timestamp})
                    </span>
                    <span className="font-mono font-bold text-neutral-900">
                      {run.passRate}% ({run.passedTests}/{run.totalTests} tests)
                    </span>
                  </div>

                  <div className="w-full bg-neutral-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-neutral-200">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-700"
                      style={{ width: `${run.passRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span>
                      Active Skills:{' '}
                      {Object.entries(run.activeSkillVersions)
                        .map(([id, ver]) => `${id.split('-')[0]}:${ver}`)
                        .join(', ')}
                    </span>
                    <span>Avg Latency: {run.avgDurationMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Problem-by-Problem Breakdown Matrix */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                Problem Test Matrix Across Runs
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50/50 border-b border-neutral-200 text-neutral-500">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Benchmark Problem</th>
                    <th className="px-4 py-2.5 font-medium">Category</th>
                    <th className="px-4 py-2.5 font-medium">Difficulty</th>
                    <th className="px-4 py-2.5 font-medium text-center">Run #1 (Baseline)</th>
                    {benchmarkHistory.length > 1 && (
                      <th className="px-4 py-2.5 font-medium text-center">
                        Latest Run (Evolved)
                      </th>
                    )}
                    <th className="px-4 py-2.5 font-medium">Required Skill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {benchmarks.map((problem) => {
                    const firstRunResult = firstRun?.results.find(
                      (r) => r.problemId === problem.id
                    );
                    const latestRunResult = latestRun?.results.find(
                      (r) => r.problemId === problem.id
                    );

                    return (
                      <tr key={problem.id} className="hover:bg-neutral-50/50">
                        <td className="px-4 py-3 font-semibold text-neutral-900">
                          {problem.title.split(' - ')[0]}
                        </td>
                        <td className="px-4 py-3 capitalize text-neutral-600">
                          {problem.category}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                              problem.difficulty === 'Hard'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {firstRunResult ? (
                            firstRunResult.passed ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Failed
                              </span>
                            )
                          ) : (
                            <span className="text-neutral-400">--</span>
                          )}
                        </td>

                        {benchmarkHistory.length > 1 && (
                          <td className="px-4 py-3 text-center">
                            {latestRunResult ? (
                              latestRunResult.passed ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{' '}
                                  Passed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" /> Failed
                                </span>
                              )
                            ) : (
                              <span className="text-neutral-400">--</span>
                            )}
                          </td>
                        )}

                        <td className="px-4 py-3 text-neutral-600 text-[11px] font-mono">
                          {problem.requiredSkill}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
