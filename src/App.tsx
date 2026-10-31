import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CodeAnalyzerView } from './components/CodeAnalyzerView';
import { BugFixerView } from './components/BugFixerView';
import { TestResultsView } from './components/TestResultsView';
import { SelfImprovementView } from './components/SelfImprovementView';
import { PerformanceAnalyticsView } from './components/PerformanceAnalyticsView';
import { TrueForgeSkill, BenchmarkProblem, BenchmarkRunResult, SandboxExecutionResult } from './types';
import { INITIAL_SKILLS } from './data/defaultSkills';
import { BENCHMARK_SUITE } from './data/benchmarks';
import { api } from './api';
import { Flame, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [skills, setSkills] = useState<TrueForgeSkill[]>(INITIAL_SKILLS);
  const [benchmarks, setBenchmarks] = useState<BenchmarkProblem[]>(BENCHMARK_SUITE);
  const [benchmarkHistory, setBenchmarkHistory] = useState<BenchmarkRunResult[]>([]);
  const [activeProblem, setActiveProblem] = useState<BenchmarkProblem>(BENCHMARK_SUITE[0]);
  const [analyzerCode, setAnalyzerCode] = useState<string>(BENCHMARK_SUITE[0].faultyCode);
  const [lastSandboxResult, setLastSandboxResult] = useState<SandboxExecutionResult | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState<boolean>(false);
  const [globalNotice, setGlobalNotice] = useState<string | null>(null);

  // Load initial backend state
  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedSkills, fetchedBenchmarks, fetchedHistory] = await Promise.all([
          api.getSkills().catch(() => INITIAL_SKILLS),
          api.getBenchmarks().catch(() => BENCHMARK_SUITE),
          api.getBenchmarkHistory().catch(() => []),
        ]);
        if (fetchedSkills && fetchedSkills.length > 0) setSkills(fetchedSkills);
        if (fetchedBenchmarks && fetchedBenchmarks.length > 0) {
          setBenchmarks(fetchedBenchmarks);
          setActiveProblem(fetchedBenchmarks[0]);
          setAnalyzerCode(fetchedBenchmarks[0].faultyCode);
        }
        if (fetchedHistory) setBenchmarkHistory(fetchedHistory);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }
    loadData();
  }, []);

  // Global benchmark runner
  const handleRunBenchmark = async () => {
    setIsRunningBenchmark(true);
    setGlobalNotice('Running TrueForge benchmark suite in secure sandbox...');
    try {
      const res = await api.runBenchmarkSuite();
      if (res.runResult) {
        setBenchmarkHistory(res.allRuns);
        setGlobalNotice(
          `Benchmark Run #${res.runResult.runNumber} completed! Pass Rate: ${res.runResult.passRate}% (${res.runResult.passedTests}/${res.runResult.totalTests} tests).`
        );
      }
    } catch (err: any) {
      console.error('Benchmark execution error:', err);
      setGlobalNotice('Benchmark run failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsRunningBenchmark(false);
      setTimeout(() => setGlobalNotice(null), 6000);
    }
  };

  // Quick problem select from Dashboard / Analyzer
  const handleSelectProblemFromDashboard = (
    problem: BenchmarkProblem,
    action: 'analyze' | 'fix'
  ) => {
    setActiveProblem(problem);
    if (action === 'analyze') {
      setAnalyzerCode(problem.faultyCode);
      setCurrentTab('analyzer');
    } else {
      setCurrentTab('fixer');
    }
  };

  // Send from Analyzer to Fixer
  const handleSendToFixer = (code: string, problem: BenchmarkProblem) => {
    setActiveProblem({
      ...problem,
      faultyCode: code,
    });
    setCurrentTab('fixer');
  };

  // Trigger skill evolution from BugFixer or Dashboard
  const handleTriggerSelfImprovement = async (skillId: string, problemId: string) => {
    setCurrentTab('self-improvement');
    setGlobalNotice('Navigating to Self-Improvement center to evolve skill...');
    try {
      const res = await api.rewriteSkill(skillId, problemId);
      if (res.success && res.skill) {
        setSkills((prev) => prev.map((s) => (s.id === res.skill.id ? res.skill : s)));
        setGlobalNotice(
          `Skill "${res.skill.name}" evolved to ${res.newVersion}! Subsequent benchmark runs will use updated heuristics.`
        );
      }
    } catch (err: any) {
      console.error('Evolution error:', err);
    }
  };

  const latestPassRate = benchmarkHistory[0]?.passRate ?? null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onRunBenchmark={handleRunBenchmark}
        isRunningBenchmark={isRunningBenchmark}
        benchmarkRunsCount={benchmarkHistory.length}
        latestPassRate={latestPassRate}
      />

      {/* Global Notification Banner */}
      {globalNotice && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 text-xs text-orange-900 flex items-center justify-between transition-all">
          <div className="max-w-7xl mx-auto flex items-center gap-2 w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>{globalNotice}</span>
            </div>
            <button
              onClick={() => setGlobalNotice(null)}
              className="text-orange-700 hover:text-orange-950 text-[11px] font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            skills={skills}
            benchmarks={benchmarks}
            benchmarkHistory={benchmarkHistory}
            onNavigate={setCurrentTab}
            onSelectProblem={handleSelectProblemFromDashboard}
            onRunBenchmark={handleRunBenchmark}
            isRunningBenchmark={isRunningBenchmark}
            onTriggerSelfImprovement={handleTriggerSelfImprovement}
          />
        )}

        {currentTab === 'analyzer' && (
          <CodeAnalyzerView
            benchmarks={benchmarks}
            initialCode={analyzerCode}
            initialProblemId={activeProblem.id}
            onSendToFixer={handleSendToFixer}
          />
        )}

        {currentTab === 'fixer' && (
          <BugFixerView
            benchmarks={benchmarks}
            skills={skills}
            activeProblem={activeProblem}
            onSelectProblem={setActiveProblem}
            onTriggerSelfImprovement={handleTriggerSelfImprovement}
            onViewTestResults={() => setCurrentTab('tests')}
          />
        )}

        {currentTab === 'tests' && (
          <TestResultsView
            benchmarks={benchmarks}
            lastSandboxResult={lastSandboxResult}
            activeProblem={activeProblem}
            onSelectProblem={setActiveProblem}
          />
        )}

        {currentTab === 'self-improvement' && (
          <SelfImprovementView
            skills={skills}
            benchmarks={benchmarks}
            onSkillsUpdated={setSkills}
            onRunBenchmark={handleRunBenchmark}
          />
        )}

        {currentTab === 'analytics' && (
          <PerformanceAnalyticsView
            benchmarkHistory={benchmarkHistory}
            benchmarks={benchmarks}
            skills={skills}
            onRunBenchmark={handleRunBenchmark}
            isRunningBenchmark={isRunningBenchmark}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-neutral-800">CodeFix AI</span>
            <span>• TrueForge Autonomous Agent Ecosystem</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Isolated Sandbox VM</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono text-neutral-600">
              <Cpu className="w-3.5 h-3.5 text-neutral-400" />
              <span>MCP: mcp://trueforge/*</span>
            </span>
            <span>•</span>
            <span className="text-orange-700 font-medium">
              Meta-Learning Evolution Engine
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
