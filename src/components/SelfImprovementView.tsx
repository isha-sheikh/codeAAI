import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  History,
  ArrowRight,
  Code2,
  FileCode,
  Shield,
  Layers,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { TrueForgeSkill, BenchmarkProblem } from '../types';
import { api } from '../api';

interface SelfImprovementViewProps {
  skills: TrueForgeSkill[];
  benchmarks: BenchmarkProblem[];
  onSkillsUpdated: (updatedSkills: TrueForgeSkill[]) => void;
  onRunBenchmark: () => void;
}

export const SelfImprovementView: React.FC<SelfImprovementViewProps> = ({
  skills,
  benchmarks,
  onSkillsUpdated,
  onRunBenchmark,
}) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || '');
  const [targetBenchmarkId, setTargetBenchmarkId] = useState<string>(benchmarks[0]?.id || '');
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [rewriteNotification, setRewriteNotification] = useState<{
    skillName: string;
    prevVersion: string;
    newVersion: string;
    rule: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  const handleTriggerRewrite = async () => {
    setIsRewriting(true);
    setErrorMsg(null);
    try {
      const res = await api.rewriteSkill(selectedSkillId, targetBenchmarkId);
      if (res.success && res.skill) {
        // Update local skills list
        const updated = skills.map((s) => (s.id === res.skill.id ? res.skill : s));
        onSkillsUpdated(updated);
        setRewriteNotification({
          skillName: res.skill.name,
          prevVersion: res.previousVersion,
          newVersion: res.newVersion,
          rule: res.evolvedRule,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to rewrite skill');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleResetBaseline = async () => {
    try {
      const res = await api.resetSkills();
      if (res.success) {
        onSkillsUpdated(res.skills);
        setRewriteNotification(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset skills');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
              TrueForge Self-Improvement & Meta-Learning Engine
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
              Autonomous Skill Rewriting
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Agents analyze test failures, reflect on missing heuristics, and autonomously synthesize updated skill documents.
          </p>
        </div>

        <button
          onClick={handleResetBaseline}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-300 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          title="Reset all skills back to v1.0 baseline to re-evaluate learning progression"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Skills to Baseline (v1.0)</span>
        </button>
      </div>

      {/* Success Notification Banner after rewrite */}
      {rewriteNotification && (
        <div className="p-4 rounded-xl bg-orange-50/80 border border-orange-200 text-orange-950 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold">
                Skill Successfully Rewritten by Meta-Learner: {rewriteNotification.skillName} (
                {rewriteNotification.prevVersion} → {rewriteNotification.newVersion})
              </span>
            </div>
            <button
              onClick={onRunBenchmark}
              className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs"
            >
              Re-run Benchmark with Evolved Skill →
            </button>
          </div>
          <div className="text-xs text-orange-900 pl-6">
            <strong>Synthesized Rule:</strong> &quot;{rewriteNotification.rule}&quot;
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Trigger Skill Evolution Controls Box */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
            Trigger Autonomous Skill Evolution
          </h2>
        </div>
        <p className="text-xs text-neutral-600">
          Select a TrueForge skill and target failing benchmark problem. The Meta-Learner Subagent will reflect on the failure trace and generate an updated revision with new heuristics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-1">
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-medium text-neutral-700">Target TrueForge Skill:</label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full text-xs font-medium bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.version})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-medium text-neutral-700">Failed Benchmark Trace:</label>
            <select
              value={targetBenchmarkId}
              onChange={(e) => setTargetBenchmarkId(e.target.value)}
              className="w-full text-xs font-medium bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {benchmarks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleTriggerRewrite}
              disabled={isRewriting}
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isRewriting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Evolve Skill</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Skills Registry & Selected Skill Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5 TrueForge Skills List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide block">
            TrueForge Skill Registry ({skills.length})
          </span>

          <div className="space-y-2">
            {skills.map((skill) => {
              const isSelected = skill.id === selectedSkillId;
              const isEvolved = !skill.version.startsWith('v1.0');

              return (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-800 shadow-sm'
                      : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      {skill.name}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                        isEvolved
                          ? 'bg-orange-500 text-white'
                          : isSelected
                          ? 'bg-neutral-800 text-neutral-300'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {skill.version}
                    </span>
                  </div>

                  <p
                    className={`mt-1.5 text-xs line-clamp-2 ${
                      isSelected ? 'text-neutral-300' : 'text-neutral-600'
                    }`}
                  >
                    {skill.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span
                      className={`capitalize ${
                        isSelected ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      Category: {skill.category}
                    </span>
                    <span
                      className={`font-semibold ${
                        isSelected ? 'text-orange-400' : 'text-orange-600'
                      }`}
                    >
                      Score: {skill.effectivenessScore}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Skill Inspector, Rules & Revision History */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-5">
            {/* Skill Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">
                    {selectedSkill.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-orange-100 text-orange-800 border border-orange-300">
                    {selectedSkill.version}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">{selectedSkill.description}</p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px]">Effectiveness</span>
                  <span className="font-bold text-neutral-900 text-sm">
                    {selectedSkill.effectivenessScore}%
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px]">Revisions</span>
                  <span className="font-bold text-neutral-900 text-sm">
                    {selectedSkill.revisionHistory.length}
                  </span>
                </div>
              </div>
            </div>

            {/* System Prompt Rules */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Active Subagent Invariant Rules ({selectedSkill.systemPromptRules.length})
                </span>
                <span className="text-[11px] text-neutral-500">
                  Passed to Sandbox Fixer subagent
                </span>
              </div>

              <div className="space-y-1.5">
                {selectedSkill.systemPromptRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learned Failure Patterns */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                Synthesized Failure Patterns ({selectedSkill.learnedPatterns.length})
              </span>

              <div className="space-y-2">
                {selectedSkill.learnedPatterns.map((pat) => (
                  <div
                    key={pat.id}
                    className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-neutral-900 font-semibold">{pat.description}</span>
                      <span className="text-[10px] font-mono bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                        Added in {pat.addedInVersion}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-900">
                        <span className="font-bold block text-rose-700 mb-0.5 font-sans">
                          Anti-Pattern to Avoid:
                        </span>
                        <code>{pat.antiPattern}</code>
                      </div>
                      <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                        <span className="font-bold block text-emerald-700 mb-0.5 font-sans">
                          Corrective Action Recipe:
                        </span>
                        <code>{pat.correctiveAction}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revision Changelog */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                Skill Revision History & Changelog
              </span>

              <div className="space-y-2">
                {selectedSkill.revisionHistory.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-neutral-200 bg-white space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-orange-600" />
                        <span className="font-bold text-neutral-900 font-mono">
                          Revision {rev.version}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500">{rev.timestamp}</span>
                    </div>
                    <p className="text-neutral-700 text-xs">{rev.reason}</p>
                    <p className="text-[11px] text-neutral-500 font-mono">{rev.diffSummary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
