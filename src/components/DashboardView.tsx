import React from 'react';
import {
  Sparkles,
  Zap,
  Cpu,
  Bot,
  Play,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { TrueForgeSkill, BenchmarkProblem, BenchmarkRunResult } from '../types';
import { TabType } from './Navbar';

interface DashboardViewProps {
  skills: TrueForgeSkill[];
  benchmarks: BenchmarkProblem[];
  benchmarkHistory: BenchmarkRunResult[];
  onNavigate: (tab: TabType) => void;
  onSelectProblem: (problem: BenchmarkProblem, action: 'analyze' | 'fix') => void;
  onRunBenchmark: () => void;
  isRunningBenchmark: boolean;
  onTriggerSelfImprovement: (skillId: string, problemId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  skills,
  benchmarks,
  benchmarkHistory,
  onNavigate,
  onSelectProblem,
  onRunBenchmark,
  isRunningBenchmark,
}) => {
  const latestRun = benchmarkHistory[0];
  const previousRun = benchmarkHistory[1];

  const evolvedSkillsCount = skills.filter(
    (s) => s.version.startsWith('v2') || s.version.startsWith('v3')
  ).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              TrueForge Self-Improvement Engine Active
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Autonomous Self-Improving AI Test-Fixing Agent
            </h1>
            <p className="text-sm text-neutral-600 leading-relaxed">
              CodeFix AI detects elusive bugs, validates fixes in an isolated sandbox, and{' '}
              <strong className="text-neutral-900 font-semibold">rewrites its own TrueForge skills</strong>{' '}
              after failures. Subsequent runs on the same benchmark achieve higher pass rates through autonomous reflection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRunBenchmark}
              disabled={isRunningBenchmark}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Play className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>{isRunningBenchmark ? 'Running Benchmark...' : 'Run Benchmark Suite'}</span>
            </button>
            <button
              onClick={() => onNavigate('self-improvement')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Inspect Evolved Skills ({evolvedSkillsCount})</span>
            </button>
          </div>
        </div>

        {/* Subtle orange accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">TrueForge Skills</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">{skills.length}</span>
              <span className="text-xs text-neutral-500">Skills Active</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-orange-700">
              <span className="font-semibold">{evolvedSkillsCount} evolved to v2.0+</span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-500">{skills.length - evolvedSkillsCount} baseline</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Benchmark Pass Rate</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">
                {latestRun ? `${latestRun.passRate}%` : 'Not run'}
              </span>
              {previousRun && latestRun && (
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    latestRun.passRate >= previousRun.passRate
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {latestRun.passRate >= previousRun.passRate ? '+' : ''}
                  {latestRun.passRate - previousRun.passRate}% vs prior
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {latestRun
                ? `${latestRun.passedTests} passed / ${latestRun.totalTests} total tests in sandbox`
                : 'Run benchmark to record baseline score'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Subagents Fleet</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-neutral-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">4 Subagents</span>
              <span className="text-xs text-neutral-500">+ Meta-Learner</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Triager, MCP-Inspector, Fixer & Verifier
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Execution Sandbox</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-neutral-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">Node-VM</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                Secure
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              2,500ms timeout limit • Isolated context
            </p>
          </div>
        </div>
      </div>

      {/* TrueForge Multi-Subagent Pipeline Visualizer */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              TrueForge Multi-Subagent Architecture & Feedback Loop
            </h2>
            <p className="text-xs text-neutral-500">
              Continuous self-improving loop: Triager → MCP Tools → Sandbox Fixer → Verifier → Meta-Learner Skill Rewriting
            </p>
          </div>
          <span className="text-xs text-neutral-500 font-mono">1 MCP Server Integration Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Subagent 1 */}
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">1. Triager Agent</span>
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            </div>
            <p className="text-xs text-neutral-600">
              Scans AST, locates failing assertion lines, and categorizes vulnerability signature.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 bg-white px-2 py-1 rounded border border-neutral-200">
              Fault Localization
            </div>
          </div>

          {/* Subagent 2 */}
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">2. MCP Inspector</span>
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            </div>
            <p className="text-xs text-neutral-600">
              Invokes Model Context Protocol endpoint <code className="text-[11px] text-orange-700">mcp://trueforge/ast_query</code> for token telemetry.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 bg-white px-2 py-1 rounded border border-neutral-200">
              MCP Tools Protocol
            </div>
          </div>

          {/* Subagent 3 */}
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">3. Sandbox Fixer</span>
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            </div>
            <p className="text-xs text-neutral-600">
              Synthesizes surgical patch guided by active TrueForge Skill rules & learned anti-patterns.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 bg-white px-2 py-1 rounded border border-neutral-200">
              Guided by TrueForge Skills
            </div>
          </div>

          {/* Subagent 4 */}
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">4. Verifier Agent</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-neutral-600">
              Executes patched code in isolated Node VM context and asserts invariant satisfaction.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 bg-white px-2 py-1 rounded border border-neutral-200">
              Sandbox Test Runner
            </div>
          </div>

          {/* Subagent 5: Meta-Learner */}
          <div className="p-3.5 rounded-lg border border-orange-200 bg-orange-50/50 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-950">5. Meta-Learner</span>
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            </div>
            <p className="text-xs text-orange-900">
              On failure, analyzes stack traces and rewrites TrueForge skills (<code className="text-[11px] font-bold">v1.0 → v2.0</code>).
            </p>
            <div className="text-[11px] font-mono text-orange-800 bg-orange-100/80 px-2 py-1 rounded border border-orange-300">
              Self-Improvement Engine
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Suite Problem Launcher */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Standardized TrueForge Benchmark Test Problems
            </h2>
            <p className="text-xs text-neutral-500">
              Challenging bug patterns designed to benchmark autonomous agents before and after self-improvement.
            </p>
          </div>
          <button
            onClick={() => onNavigate('fixer')}
            className="text-xs text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1"
          >
            Open Interactive Bug Fixer <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-neutral-100">
          {benchmarks.map((problem) => {
            const skill = skills.find((s) => s.id === problem.requiredSkill);
            const isEvolved = skill && !skill.version.startsWith('v1.0');
            const problemRunResult = latestRun?.results.find((r) => r.problemId === problem.id);

            return (
              <div
                key={problem.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/50 px-2 rounded-lg transition-colors"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-neutral-900">
                      {problem.title}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        problem.difficulty === 'Hard'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : problem.difficulty === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    {problemRunResult && (
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          problemRunResult.passed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {problemRunResult.passed ? '✓ Passing in Sandbox' : '✗ Failing Benchmark'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 line-clamp-1">{problem.description}</p>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 pt-1">
                    <span>
                      Required Skill:{' '}
                      <strong className="text-neutral-800 font-medium">
                        {skill?.name || problem.requiredSkill}
                      </strong>
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-mono text-[11px] ${
                        isEvolved
                          ? 'bg-orange-100 text-orange-800 font-semibold border border-orange-300'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {skill?.version || 'v1.0'}
                    </span>
                    <span>• {problem.tests.length} assertions</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <button
                    onClick={() => onSelectProblem(problem, 'analyze')}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Code2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Analyze</span>
                  </button>
                  <button
                    onClick={() => onSelectProblem(problem, 'fix')}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Fix with TrueForge</span>
                    <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benchmark History Card */}
      {benchmarkHistory.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">
              Benchmark Iteration History & Self-Improvement Progression
            </h2>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1"
            >
              Detailed Analytics <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benchmarkHistory.slice(0, 3).map((run) => (
              <div
                key={run.runId}
                className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    Run #{run.runNumber}
                  </span>
                  <span className="text-[11px] text-neutral-500">{run.timestamp}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-neutral-900">
                      {run.passRate}%
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">Pass Rate</span>
                  </div>
                  <span className="text-xs font-medium text-neutral-600">
                    {run.passedTests} / {run.totalTests} tests
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${run.passRate}%` }}
                  />
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Avg Latency: {run.avgDurationMs}ms</span>
                  <span className="text-orange-700 font-medium">
                    {Object.values(run.activeSkillVersions).some((v) => !v.startsWith('v1.0'))
                      ? 'Evolved Skills'
                      : 'Baseline Skills'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
