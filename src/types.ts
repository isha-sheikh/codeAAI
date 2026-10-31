/**
 * Core types for CodeFix AI – TrueForge Autonomous Self-Improving Agent
 */

export interface TrueForgeSkill {
  id: string;
  name: string;
  version: string; // e.g. "v1.0", "v2.0"
  category: 'ast' | 'concurrency' | 'boundary' | 'types' | 'memory';
  description: string;
  systemPromptRules: string[];
  learnedPatterns: {
    id: string;
    description: string;
    triggerTestCase: string;
    antiPattern: string;
    correctiveAction: string;
    addedInVersion: string;
  }[];
  revisionHistory: {
    version: string;
    timestamp: string;
    reason: string;
    improvedBenchmarkCases: string[];
    diffSummary: string;
  }[];
  effectivenessScore: number; // percentage
  status: 'active' | 'evaluating' | 'deprecated';
}

export interface SubagentTrace {
  id: string;
  agent: 'Triager' | 'MCP-Inspector' | 'Sandbox-Fixer' | 'Verifier' | 'Meta-Learner';
  role: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'failed';
  action: string;
  details: string;
  timestamp: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface TestCase {
  id: string;
  name: string;
  testCode: string;
  expected: string;
  passed?: boolean;
  actual?: string;
  error?: string;
  durationMs?: number;
}

export interface BenchmarkProblem {
  id: string;
  title: string;
  category: 'ast' | 'concurrency' | 'boundary' | 'types' | 'memory';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  faultyCode: string;
  referenceSolution?: string;
  tests: TestCase[];
  vulnerabilityHint: string;
  requiredSkill: string;
}

export interface BenchmarkRunResult {
  runId: string;
  runNumber: number;
  timestamp: string;
  activeSkillVersions: Record<string, string>;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  avgDurationMs: number;
  results: {
    problemId: string;
    problemTitle: string;
    passed: boolean;
    passedTestCount: number;
    totalTestCount: number;
    errorSummary?: string;
    fixedCode?: string;
    subagentTraces?: SubagentTrace[];
    testResults?: TestCase[];
  }[];
}

export interface SandboxExecutionResult {
  success: boolean;
  passCount: number;
  failCount: number;
  totalCount: number;
  testDetails: TestCase[];
  consoleOutput: string[];
  executionTimeMs: number;
  memoryUsageMb: number;
  error?: string;
}

export interface MCPToolCallRequest {
  tool: 'ast_query' | 'sandbox_eval' | 'symbol_lookup' | 'skill_registry' | 'benchmark_suite';
  parameters: Record<string, any>;
}

export interface MCPToolCallResponse {
  tool: string;
  timestamp: string;
  result: any;
  status: 'success' | 'error';
  executionTimeMs: number;
}

export interface BugAnalysisResult {
  summary: string;
  bugFound: boolean;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  vulnerabilities: {
    type: string;
    line?: number;
    message: string;
    recommendation: string;
    applicableSkillId: string;
  }[];
  cyclomaticComplexity: number;
  suggestedTests: TestCase[];
}

export interface FixCycleResult {
  originalCode: string;
  fixedCode: string;
  summary: string;
  appliedSkills: string[];
  mcpToolCalls: MCPToolCallResponse[];
  subagentTraces: SubagentTrace[];
  sandboxResult: SandboxExecutionResult;
  passedAllTests: boolean;
  selfImprovementTriggered: boolean;
  improvementReport?: {
    skillId: string;
    previousVersion: string;
    newVersion: string;
    learnedRule: string;
  };
}
