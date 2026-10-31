import {
  TrueForgeSkill,
  BenchmarkProblem,
  BenchmarkRunResult,
  SandboxExecutionResult,
  BugAnalysisResult,
  FixCycleResult,
  MCPToolCallResponse,
} from './types';

export const api = {
  async getSkills(): Promise<TrueForgeSkill[]> {
    const res = await fetch('/api/skills');
    if (!res.ok) throw new Error('Failed to fetch skills');
    const data = await res.json();
    return data.skills;
  },

  async getBenchmarks(): Promise<BenchmarkProblem[]> {
    const res = await fetch('/api/benchmarks');
    if (!res.ok) throw new Error('Failed to fetch benchmarks');
    const data = await res.json();
    return data.benchmarks;
  },

  async getBenchmarkHistory(): Promise<BenchmarkRunResult[]> {
    const res = await fetch('/api/benchmark/history');
    if (!res.ok) throw new Error('Failed to fetch history');
    const data = await res.json();
    return data.history;
  },

  async executeSandbox(code: string, tests: any[]): Promise<SandboxExecutionResult> {
    const res = await fetch('/api/sandbox/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, tests }),
    });
    if (!res.ok) throw new Error('Failed to execute sandbox');
    return res.json();
  },

  async analyzeCode(code: string, problemTitle?: string): Promise<BugAnalysisResult> {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, problemTitle }),
    });
    if (!res.ok) throw new Error('Failed to analyze code');
    return res.json();
  },

  async fixCode(
    code: string,
    tests: any[],
    problemId?: string,
    skillId?: string
  ): Promise<FixCycleResult> {
    const res = await fetch('/api/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, tests, problemId, skillId }),
    });
    if (!res.ok) throw new Error('Failed to run fix cycle');
    return res.json();
  },

  async runBenchmarkSuite(): Promise<{ runResult: BenchmarkRunResult; allRuns: BenchmarkRunResult[] }> {
    const res = await fetch('/api/benchmark/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to run benchmark suite');
    return res.json();
  },

  async rewriteSkill(skillId: string, failedBenchmarkId?: string): Promise<any> {
    const res = await fetch('/api/skills/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId, failedBenchmarkId }),
    });
    if (!res.ok) throw new Error('Failed to rewrite skill');
    return res.json();
  },

  async resetSkills(): Promise<{ success: boolean; skills: TrueForgeSkill[] }> {
    const res = await fetch('/api/skills/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to reset skills');
    return res.json();
  },

  async callMCPTool(tool: string, parameters: Record<string, any>): Promise<MCPToolCallResponse> {
    const res = await fetch('/api/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, parameters }),
    });
    if (!res.ok) throw new Error('Failed to call MCP tool');
    return res.json();
  },
};
