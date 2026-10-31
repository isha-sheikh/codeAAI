import { TrueForgeSkill } from '../types';

export const INITIAL_SKILLS: TrueForgeSkill[] = [
  {
    id: 'concurrency-race-guard',
    name: 'Concurrency & Async Race Guard',
    version: 'v1.0',
    category: 'concurrency',
    description: 'Diagnoses and fixes non-deterministic asynchronous race conditions, shared mutable state, unhandled Promise rejections, and out-of-order event resolutions.',
    systemPromptRules: [
      'Identify shared state accessed concurrently across asynchronous turns.',
      'Ensure Promise.allSettled or mutex locks are applied when mutations must be atomic.',
      'Never rely on setTimeout(..., 0) for synchronization ordering.',
      'Verify async error boundaries and propagate rejections cleanly.'
    ],
    learnedPatterns: [
      {
        id: 'pat-conc-1',
        description: 'Array pushing inside parallel async map calls causes race-induced order corruption.',
        triggerTestCase: 'ConcurrentBatchProcessor - preserves insertion sequence',
        antiPattern: 'items.map(async item => { const res = await fetch(item); results.push(res); })',
        correctiveAction: 'const results = await Promise.all(items.map(async item => await fetch(item)))',
        addedInVersion: 'v1.0'
      }
    ],
    revisionHistory: [
      {
        version: 'v1.0',
        timestamp: '2026-10-28 14:00:00',
        reason: 'Initial baseline TrueForge concurrency skill bootstrap.',
        improvedBenchmarkCases: ['Basic Promise Resolver'],
        diffSummary: 'Initial heuristics for async task synchronization.'
      }
    ],
    effectivenessScore: 68,
    status: 'active'
  },
  {
    id: 'edge-case-boundary-heuristics',
    name: 'Edge-Case Boundary Heuristics',
    version: 'v1.0',
    category: 'boundary',
    description: 'Detects off-by-one index loops, empty collections, single-item edge cases, numeric overflow/underflow, zero divisions, and boundary limits.',
    systemPromptRules: [
      'Validate index pointers against array bounds (0 <= i < length).',
      'Handle empty lists ([]), nullish arguments, and single-element inputs as base cases.',
      'Check loop terminal conditions: replace < with <= or vice versa when slicing/indexing ranges.',
      'Guard arithmetic divisions with explicit non-zero assertions.'
    ],
    learnedPatterns: [
      {
        id: 'pat-bound-1',
        description: 'Binary search loop condition (left < right) misses single-element matches.',
        triggerTestCase: 'BinarySearchRange - finds exact boundary in 1-element slice',
        antiPattern: 'while (left < right) { mid = Math.floor((left+right)/2); ... }',
        correctiveAction: 'while (left <= right) with explicit return on match, or mid calculation avoiding integer overflow',
        addedInVersion: 'v1.0'
      }
    ],
    revisionHistory: [
      {
        version: 'v1.0',
        timestamp: '2026-10-28 14:05:00',
        reason: 'Initial baseline TrueForge boundary heuristics.',
        improvedBenchmarkCases: ['Zero Element Guard'],
        diffSummary: 'Standard boundary checking patterns for indexing.'
      }
    ],
    effectivenessScore: 64,
    status: 'active'
  },
  {
    id: 'type-contract-validation',
    name: 'Type Contract & Schema Validator',
    version: 'v1.0',
    category: 'types',
    description: 'Enforces robust runtime type checking, defensive optional chaining, null-coalescing, schema parsing, and type coercion defense.',
    systemPromptRules: [
      'Guard nested object property traversal with optional chaining (?.) or nullish coalescing (??).',
      'Verify primitive types using typeof or custom typeguards prior to invoking prototype methods.',
      'Avoid loose equality (==) comparisons where falsy values like 0 or "" cause unintended coercion.',
      'Provide fallback default records for missing dictionary entries.'
    ],
    learnedPatterns: [
      {
        id: 'pat-type-1',
        description: 'Uncaught TypeError when accessing properties on undefined optional configuration values.',
        triggerTestCase: 'DeepConfigResolver - safely retrieves nested fallback',
        antiPattern: 'return config.database.connection.host;',
        correctiveAction: 'return config?.database?.connection?.host ?? defaultHost;',
        addedInVersion: 'v1.0'
      }
    ],
    revisionHistory: [
      {
        version: 'v1.0',
        timestamp: '2026-10-28 14:10:00',
        reason: 'Initial baseline TrueForge type guard skill.',
        improvedBenchmarkCases: ['Undefined Property Check'],
        diffSummary: 'Basic optional chaining assertions.'
      }
    ],
    effectivenessScore: 72,
    status: 'active'
  },
  {
    id: 'memory-leak-cleanup',
    name: 'Memory Leak & Resource Lifecycle Guard',
    version: 'v1.0',
    category: 'memory',
    description: 'Diagnoses runaway memory expansion, uncleaned event listeners, recursion depth limits, unclosed file descriptors, and cyclical object references.',
    systemPromptRules: [
      'Ensure every register/subscribe has a symmetric unregister/unsubscribe method.',
      'Convert unbound unbounded recursive functions to iterative accumulators or tail-call safe loops.',
      'Clear active setInterval/setTimeout handles when operations complete or abort.',
      'Avoid caching objects in global Maps without weak reference (WeakMap) or LRU eviction.'
    ],
    learnedPatterns: [
      {
        id: 'pat-mem-1',
        description: 'Recursive tree flattener hits maximum call stack size on deep linked lists (>10,000 nodes).',
        triggerTestCase: 'NestedTreeFlattener - handles 20k depth without CallStackExceeded',
        antiPattern: 'function flatten(node) { return [node.val, ...flatten(node.next)]; }',
        correctiveAction: 'Iterative stack loop with while (stack.length) to prevent call stack overflow',
        addedInVersion: 'v1.0'
      }
    ],
    revisionHistory: [
      {
        version: 'v1.0',
        timestamp: '2026-10-28 14:15:00',
        reason: 'Initial baseline TrueForge resource lifecycle skill.',
        improvedBenchmarkCases: ['Timer Cleanup Verification'],
        diffSummary: 'Initial heuristics for interval clearing.'
      }
    ],
    effectivenessScore: 60,
    status: 'active'
  },
  {
    id: 'ast-syntax-repair',
    name: 'AST Syntax & Token Repair Engine',
    version: 'v1.0',
    category: 'ast',
    description: 'Performs token balancing, delimiter repair, unclosed strings/template literals, malformed arrow function syntax, and missing exports.',
    systemPromptRules: [
      'Balance opening and closing braces, parentheses, and brackets.',
      'Ensure all exported functions and classes match their expected interface signatures.',
      'Detect misplaced semicolons terminating loop headers prematurely.',
      'Ensure proper async keyword presence on functions using await.'
    ],
    learnedPatterns: [
      {
        id: 'pat-ast-1',
        description: 'Misplaced semicolon after while/for loop statement renders loop body unreachable.',
        triggerTestCase: 'SyntaxFilter - loops without empty statement execution',
        antiPattern: 'while (i < n); { process(i); i++; }',
        correctiveAction: 'Remove accidental trailing semicolon from loop header',
        addedInVersion: 'v1.0'
      }
    ],
    revisionHistory: [
      {
        version: 'v1.0',
        timestamp: '2026-10-28 14:20:00',
        reason: 'Initial baseline AST syntax engine.',
        improvedBenchmarkCases: ['Missing Brace Fix'],
        diffSummary: 'Baseline token balancing.'
      }
    ],
    effectivenessScore: 78,
    status: 'active'
  }
];
