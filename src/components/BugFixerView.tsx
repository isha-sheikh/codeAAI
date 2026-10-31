import React, { useState } from 'react';
import {
  Wrench,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bot,
  Terminal,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { BenchmarkProblem, TrueForgeSkill, FixCycleResult } from '../types';
import { api } from '../api';

interface BugFixerViewProps {
  benchmarks: BenchmarkProblem[];
  skills: TrueForgeSkill[];
  activeProblem: BenchmarkProblem | null;
  onSelectProblem: (problem: BenchmarkProblem) => void;
  onTriggerSelfImprovement: (skillId: string, problemId: string) => void;
  onViewTestResults: () => void;
}

export const BugFixerView: React.FC<BugFixerViewProps> = ({
  benchmarks,
  skills,
  activeProblem,
  onSelectProblem,
  onTriggerSelfImprovement,
  onViewTestResults,
}) => {
  const currentProblem = activeProblem || benchmarks[0];
  const [selectedSkillId, setSelectedSkillId] = useState<string>(
    currentProblem.requiredSkill || skills[0]?.id || ''
  );
  const [isFixing, setIsFixing] = useState<boolean>(false);
  const [fixResult, setFixResult] = useState<FixCycleResult | null>(null);
  const [activeTab, setActiveTab] = useState<'diff' | 'fixed' | 'original' | 'traces'>('diff');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  const handleRunAutonomousFix = async () => {
    setIsFixing(true);
    setErrorMsg(null);
    try {
      const res = await api.fixCode(
        currentProblem.faultyCode,
        currentProblem.tests,
        currentProblem.id,
        selectedSkillId
      );
      setFixResult(res);
      setActiveTab('diff');
    } catch (err: any) {
      setErrorMsg(err.message || 'Fix cycle failed');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
              TrueForge Autonomous Bug Fixer
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
              Multi-Subagent Pipeline
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Triager → MCP Inspector → Sandbox Fixer → Sandbox Verifier loop
          </p>
        </div>

        {/* Problem & Skill Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs">
            <span className="text-neutral-500">Problem:</span>
            <select
              value={currentProblem.id}
              onChange={(e) => {
                const p = benchmarks.find((b) => b.id === e.target.value);
                if (p) {
                  onSelectProblem(p);
                  setSelectedSkillId(p.requiredSkill);
                  setFixResult(null);
                }
              }}
              className="bg-transparent font-medium text-neutral-900 focus:outline-none"
            >
              {benchmarks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title.split(' - ')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs">
            <span className="text-neutral-500">Skill:</span>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="bg-transparent font-medium text-neutral-900 focus:outline-none"
            >
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.version})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunAutonomousFix}
            disabled={isFixing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {isFixing ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
                <span>Fixing in Sandbox...</span>
              </>
            ) : (
              <>
                <Wrench className="w-3.5 h-3.5 text-orange-400" />
                <span>Launch Autonomous Fix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Main Grid: Code Diff & Subagents Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code View (Diff / Original / Fixed) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            {/* Header Tabs */}
            <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('diff')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'diff'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Patch Diff View
                </button>
                <button
                  onClick={() => setActiveTab('fixed')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'fixed'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Patched Code
                </button>
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'original'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Faulty Baseline
                </button>
                <button
                  onClick={() => setActiveTab('traces')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'traces'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Subagent Traces ({fixResult?.subagentTraces.length || 0})
                </button>
              </div>

              {fixResult && (
                <div className="flex items-center gap-1 text-[11px]">
                  {fixResult.passedAllTests ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> All Tests Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-semibold border border-rose-200">
                      <XCircle className="w-3 h-3 text-rose-600" /> Assertion Failed
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Code Content */}
            <div className="p-4 font-mono text-xs overflow-x-auto min-h-[380px] bg-neutral-950 text-neutral-100">
              {activeTab === 'diff' && (
                <div className="space-y-1">
                  {!fixResult ? (
                    <div className="text-neutral-400 py-12 text-center font-sans space-y-2">
                      <Wrench className="w-8 h-8 text-neutral-600 mx-auto" />
                      <p className="text-sm font-medium text-neutral-300">
                        Autonomous Repair Not Yet Executed
                      </p>
                      <p className="text-xs text-neutral-500">
                        Click &quot;Launch Autonomous Fix&quot; above to run the multi-subagent repair cycle.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-neutral-400 text-[11px] pb-2 border-b border-neutral-800 mb-2">
                        --- Original (Faulty) &nbsp;&nbsp;&nbsp; +++ Patched Solution (Guided by {selectedSkill.name})
                      </div>
                      <pre className="text-neutral-200 whitespace-pre-wrap leading-relaxed">
                        {fixResult.fixedCode}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'fixed' && (
                <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {fixResult ? fixResult.fixedCode : currentProblem.faultyCode}
                </pre>
              )}

              {activeTab === 'original' && (
                <pre className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {currentProblem.faultyCode}
                </pre>
              )}

              {activeTab === 'traces' && (
                <div className="space-y-2.5 font-sans">
                  {fixResult?.subagentTraces.map((trace) => (
                    <div
                      key={trace.id}
                      className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-orange-400">{trace.agent}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {trace.durationMs ? `${trace.durationMs}ms` : ''}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300">{trace.action}</p>
                      <p className="text-[11px] text-neutral-400">{trace.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">Active Skill:</span>
                <span className="font-semibold text-neutral-900">{selectedSkill.name}</span>
                <span className="px-1.5 py-0.2 bg-orange-100 text-orange-800 rounded font-mono text-[10px] font-bold">
                  {selectedSkill.version}
                </span>
              </div>

              {fixResult && (
                <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
                  <span>Sandbox Time: {fixResult.sandboxResult.executionTimeMs}ms</span>
                  <span>•</span>
                  <span>Memory: {fixResult.sandboxResult.memoryUsageMb} MB</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Subagent Pipeline & Sandbox Output */}
        <div className="lg:col-span-5 space-y-4">
          {/* Subagent Timeline */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
              Multi-Subagent Execution Traces
            </span>

            <div className="space-y-2">
              {/* Triager Card */}
              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Triager Subagent</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">AST & Trace Scanner</span>
                </div>
                <p className="text-xs text-neutral-600">
                  Identified defect in <code className="text-neutral-800">{currentProblem.title.split(' - ')[0]}</code>.
                </p>
              </div>

              {/* MCP Tool Call Card */}
              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>MCP Inspector</span>
                  </div>
                  <span className="font-mono text-[10px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                    mcp://trueforge/ast_query
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  {fixResult?.mcpToolCalls[0]
                    ? `Resolved AST: ${fixResult.mcpToolCalls[0].result.loc} LOC, ${fixResult.mcpToolCalls[0].result.loopCount} loops`
                    : 'Awaiting execution trigger'}
                </p>
              </div>

              {/* Fixer Subagent Card */}
              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Sandbox Fixer Subagent</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {selectedSkill.version} Rules
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  {fixResult ? fixResult.summary : 'Generates minimal surgical diff without collateral regressions.'}
                </p>
              </div>

              {/* Verifier Subagent Card */}
              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        fixResult?.passedAllTests ? 'bg-emerald-500' : 'bg-neutral-400'
                      }`}
                    />
                    <span>Verifier Subagent</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Isolated Node-VM</span>
                </div>
                <p className="text-xs text-neutral-600">
                  {fixResult
                    ? `Executed ${fixResult.sandboxResult.totalCount} tests: ${fixResult.sandboxResult.passCount} passed, ${fixResult.sandboxResult.failCount} failed.`
                    : 'Executes tests under 2,500ms safety limit.'}
                </p>
              </div>
            </div>
          </div>

          {/* Test Sandbox Live Results */}
          {fixResult && (
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Sandbox Assertions ({fixResult.sandboxResult.passCount}/{fixResult.sandboxResult.totalCount})
                </span>
                <button
                  onClick={onViewTestResults}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1"
                >
                  Full Test Logs <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {fixResult.sandboxResult.testDetails.map((test) => (
                  <div
                    key={test.id}
                    className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                      test.passed
                        ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/40 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium">
                        {test.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{test.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {test.durationMs}ms
                      </span>
                    </div>
                    {test.error && (
                      <p className="font-mono text-[11px] text-rose-800 bg-rose-100/60 p-1.5 rounded">
                        {test.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* If tests failed: Trigger Meta-Learner Evolution */}
              {!fixResult.passedAllTests && (
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-950">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>Benchmark Edge Case Failed</span>
                  </div>
                  <p className="text-xs text-orange-900">
                    The baseline skill ({selectedSkill.version}) does not have rules for this boundary condition. Trigger the Meta-Learner Subagent to rewrite the skill and achieve a 100% pass rate.
                  </p>
                  <button
                    onClick={() => onTriggerSelfImprovement(selectedSkill.id, currentProblem.id)}
                    className="w-full py-2 rounded-md text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Rewrite Skill ({selectedSkill.version} → v2.0)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
