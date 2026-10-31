import React from 'react';
import {
  LayoutDashboard,
  SearchCode,
  Wrench,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Play,
  Flame,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'analyzer'
  | 'fixer'
  | 'tests'
  | 'self-improvement'
  | 'analytics';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onRunBenchmark: () => void;
  isRunningBenchmark: boolean;
  benchmarkRunsCount: number;
  latestPassRate: number | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onRunBenchmark,
  isRunningBenchmark,
  benchmarkRunsCount,
  latestPassRate,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer' as TabType, label: 'Code Analyzer', icon: SearchCode },
    { id: 'fixer' as TabType, label: 'Bug Fixer', icon: Wrench },
    { id: 'tests' as TabType, label: 'Test Results', icon: CheckCircle2 },
    { id: 'self-improvement' as TabType, label: 'Self-Improvement', icon: Sparkles },
    { id: 'analytics' as TabType, label: 'Performance Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center border border-neutral-800 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/30 to-transparent pointer-events-none" />
              <Flame className="w-5 h-5 text-orange-500 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 tracking-tight text-base">CodeFix AI</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-orange-50 text-orange-700 border border-orange-200/80">
                  TrueForge Core
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-normal">Autonomous Test-Fixing Agent</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-orange-400' : 'text-neutral-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                  {tab.id === 'self-improvement' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-3">
            {latestPassRate !== null && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-50 border border-neutral-200 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-500">Benchmark:</span>
                <span className="font-semibold text-neutral-900">{latestPassRate}%</span>
                <span className="text-[10px] text-neutral-400">({benchmarkRunsCount} runs)</span>
              </div>
            )}

            <button
              onClick={onRunBenchmark}
              disabled={isRunningBenchmark}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              title="Runs all benchmark test suites against active TrueForge skills in secure sandbox"
            >
              {isRunningBenchmark ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Benchmark...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Benchmark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between border-t border-neutral-100 py-2 overflow-x-auto gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
