import React, { useState } from 'react';
import {
  SearchCode,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Wrench,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { BenchmarkProblem, BugAnalysisResult } from '../types';
import { api } from '../api';

interface CodeAnalyzerViewProps {
  benchmarks: BenchmarkProblem[];
  initialCode?: string;
  initialProblemId?: string;
  onSendToFixer: (code: string, problem: BenchmarkProblem) => void;
}

export const CodeAnalyzerView: React.FC<CodeAnalyzerViewProps> = ({
  benchmarks,
  initialCode,
  initialProblemId,
  onSendToFixer,
}) => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    initialProblemId || benchmarks[0]?.id || ''
  );
  const [code, setCode] = useState<string>(
    initialCode || benchmarks[0]?.faultyCode || ''
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<BugAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentProblem = benchmarks.find((b) => b.id === selectedProblemId) || benchmarks[0];

  const handleSelectProblem = (id: string) => {
    setSelectedProblemId(id);
    const p = benchmarks.find((b) => b.id === id);
    if (p) {
      setCode(p.faultyCode);
      setAnalysisResult(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await api.analyzeCode(code, currentProblem?.title);
      setAnalysisResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze code');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            Code Analyzer & Static Vulnerability Scanner
          </h1>
          <p className="text-xs text-neutral-500">
            Powered by TrueForge Triager Subagent & AST symbol telemetry.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600 whitespace-nowrap">
            Load Benchmark:
          </label>
          <select
            value={selectedProblemId}
            onChange={(e) => handleSelectProblem(e.target.value)}
            className="text-xs font-medium bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {benchmarks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title.split(' - ')[0]} ({b.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor & Analysis Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Input & AST Info */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span className="text-xs font-semibold text-neutral-800">
                  Target Source Code ({currentProblem?.title.split(' - ')[0] || 'Custom'})
                </span>
              </div>
              <button
                onClick={() => {
                  if (currentProblem) setCode(currentProblem.faultyCode);
                }}
                className="text-[11px] text-neutral-500 hover:text-neutral-800 inline-flex items-center gap-1"
                title="Reset to problem default code"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="p-3">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                className="w-full font-mono text-xs text-neutral-900 bg-neutral-900/5 p-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-y leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div className="px-4 py-3 bg-neutral-50/70 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                <span>Lines: {code.split('\n').length}</span>
                <span>•</span>
                <span>Chars: {code.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  <SearchCode className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isAnalyzing ? 'Triager Scanning...' : 'Run Triager Subagent'}</span>
                </button>
                {currentProblem && (
                  <button
                    onClick={() => onSendToFixer(code, currentProblem)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Send to Fixer →</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Problem Overview Card */}
          {currentProblem && (
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-2">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                Problem Requirements & Hint
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {currentProblem.description}
              </p>
              <div className="p-2.5 rounded bg-orange-50/80 border border-orange-200 text-xs text-orange-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Root Cause Vulnerability:</strong> {currentProblem.vulnerabilityHint}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Triager Results Panel */}
        <div className="lg:col-span-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          {!analysisResult && !isAnalyzing && (
            <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100">
                <SearchCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Ready for Triager Subagent Inspection
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Click &quot;Run Triager Subagent&quot; to perform AST tokenization, defect localization, and risk categorization.
              </p>
              <button
                onClick={handleRunAnalysis}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Scan Current Code
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-medium text-neutral-800">
                TrueForge Triager Subagent Analyzing AST...
              </p>
              <p className="text-[11px] text-neutral-500">
                Querying Model Context Protocol AST tool & inspecting code patterns.
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
              {/* Verdict Card */}
              <div
                className={`p-4 rounded-xl border shadow-xs ${
                  analysisResult.bugFound
                    ? 'bg-orange-50/50 border-orange-200'
                    : 'bg-emerald-50/50 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {analysisResult.bugFound ? (
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <span className="text-xs font-bold text-neutral-900">
                      {analysisResult.bugFound ? 'Defects Localized' : 'Clean AST'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      analysisResult.riskLevel === 'Critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : analysisResult.riskLevel === 'High'
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    Risk Level: {analysisResult.riskLevel}
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-700 leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>

              {/* AST Metrics */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-3">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Static Code Metrics
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                    <span className="text-neutral-500 block text-[11px]">Cyclomatic Complexity</span>
                    <span className="text-base font-bold text-neutral-900">
                      {analysisResult.cyclomaticComplexity}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                    <span className="text-neutral-500 block text-[11px]">Vulnerabilities Found</span>
                    <span className="text-base font-bold text-neutral-900">
                      {analysisResult.vulnerabilities.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vulnerabilities Breakdown */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-3">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Identified Structural Flaws ({analysisResult.vulnerabilities.length})
                </span>

                <div className="space-y-2.5">
                  {analysisResult.vulnerabilities.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-900">
                          {v.type}
                        </span>
                        {v.line && (
                          <span className="font-mono text-[10px] bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-700">
                            Line {v.line}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600">{v.message}</p>
                      <div className="pt-1 text-[11px] text-orange-800 font-medium">
                        <strong>Recommendation:</strong> {v.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              {currentProblem && (
                <button
                  onClick={() => onSendToFixer(code, currentProblem)}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-orange-400" />
                  <span>Launch Autonomous Fixer in Sandbox</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
