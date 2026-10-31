import { BenchmarkProblem } from '../types';

export const BENCHMARK_SUITE: BenchmarkProblem[] = [
  {
    id: 'bench-async-batch',
    title: 'ConcurrentBatchProcessor - Race Condition & Async Ordering',
    category: 'concurrency',
    difficulty: 'Hard',
    description: 'A batch processor that executes async worker tasks concurrently with rate limiting, but fails to maintain strict input sequencing and returns premature empty results because of unawaited forEach.',
    requiredSkill: 'concurrency-race-guard',
    vulnerabilityHint: 'Async callback inside Array.prototype.forEach is not awaited, and uncoordinated push operations cause race conditions.',
    faultyCode: `function processBatch(items, workerFn) {
  const results = [];
  // BUG: forEach does not await async worker promises!
  // Results array is returned before any tasks complete.
  items.forEach(async (item, index) => {
    const res = await workerFn(item);
    results.push(res);
  });
  return results;
}`,
    referenceSolution: `async function processBatch(items, workerFn) {
  // FIXED: Promise.all preserves deterministic ordering and awaits all worker tasks
  const results = await Promise.all(
    items.map(async (item, index) => {
      try {
        return await workerFn(item, index);
      } catch (err) {
        return { error: err.message, item };
      }
    })
  );
  return results;
}`,
    tests: [
      {
        id: 't-async-1',
        name: 'Deterministic Ordering with Variable Async Latencies',
        testCode: `(async () => {
  const items = [100, 20, 50, 10];
  // Worker has random delay inversely proportional to value
  const worker = async (x) => {
    await new Promise(r => setTimeout(r, (150 - x)));
    return x * 2;
  };
  const res = await processBatch(items, worker);
  const expected = [200, 40, 100, 20];
  if (!Array.isArray(res) || res.length !== 4) {
    throw new Error('Expected 4 results, got ' + (res ? res.length : 0));
  }
  for (let i = 0; i < expected.length; i++) {
    if (res[i] !== expected[i]) {
      throw new Error('Order mismatch at index ' + i + ': expected ' + expected[i] + ' but got ' + res[i]);
    }
  }
  return true;
})()`,
        expected: 'All 4 items returned in exact sequence [200, 40, 100, 20]'
      },
      {
        id: 't-async-2',
        name: 'Awaits Full Completion Before Returning',
        testCode: `(async () => {
  let completedCount = 0;
  const items = [1, 2, 3];
  const worker = async (x) => {
    await new Promise(r => setTimeout(r, 40));
    completedCount++;
    return 'ok_' + x;
  };
  const res = await processBatch(items, worker);
  if (completedCount !== 3) {
    throw new Error('Function returned prematurely before workers finished. Completed: ' + completedCount);
  }
  if (res.length !== 3) throw new Error('Result length invalid');
  return true;
})()`,
        expected: 'Waited for all tasks to resolve'
      },
      {
        id: 't-async-3',
        name: 'Empty Input Collection Safe Return',
        testCode: `(async () => {
  const res = await processBatch([], async () => 1);
  if (!Array.isArray(res) || res.length !== 0) throw new Error('Expected empty array');
  return true;
})()`,
        expected: 'Returns [] on empty input'
      }
    ]
  },
  {
    id: 'bench-boundary-window',
    title: 'SlidingWindowMedian - Off-by-One & Boundary Slicing',
    category: 'boundary',
    difficulty: 'Medium',
    description: 'Computes median values for every sliding window of size k across an integer array. Contains off-by-one terminating loop boundary and incorrect median calculation for even k.',
    requiredSkill: 'edge-case-boundary-heuristics',
    vulnerabilityHint: 'Loop termination condition (i < nums.length - k) skips the final window, and even window sizes do not average the two median elements.',
    faultyCode: `function slidingWindowMedian(nums, k) {
  if (!nums || nums.length === 0 || k <= 0) return [];
  const medians = [];
  // BUG: nums.length - k skips the last window (should be <=)
  for (let i = 0; i < nums.length - k; i++) {
    const window = nums.slice(i, i + k).sort((a, b) => a - b);
    const mid = Math.floor(k / 2);
    // BUG: for even k, it just picks mid instead of averaging mid-1 and mid
    medians.push(window[mid]);
  }
  return medians;
}`,
    referenceSolution: `function slidingWindowMedian(nums, k) {
  if (!nums || nums.length === 0 || k <= 0 || k > nums.length) return [];
  const medians = [];
  for (let i = 0; i <= nums.length - k; i++) {
    const window = nums.slice(i, i + k).sort((a, b) => a - b);
    let median;
    if (k % 2 === 1) {
      median = window[Math.floor(k / 2)];
    } else {
      const mid2 = k / 2;
      const mid1 = mid2 - 1;
      median = (window[mid1] + window[mid2]) / 2;
    }
    medians.push(median);
  }
  return medians;
}`,
    tests: [
      {
        id: 't-bound-1',
        name: 'Odd Window Size - Captures All Sliding Windows',
        testCode: `(() => {
  const nums = [1, 3, -1, -3, 5, 3, 6, 7];
  const k = 3;
  const res = slidingWindowMedian(nums, k);
  // Expected length = nums.length - k + 1 = 8 - 3 + 1 = 6
  const expected = [1, -1, -1, 3, 5, 6];
  if (!Array.isArray(res)) throw new Error('Expected array return');
  if (res.length !== expected.length) {
    throw new Error('Off-by-one window count: got ' + res.length + ', expected ' + expected.length);
  }
  for (let i = 0; i < expected.length; i++) {
    if (res[i] !== expected[i]) {
      throw new Error('Mismatch at window ' + i + ': expected ' + expected[i] + ' got ' + res[i]);
    }
  }
  return true;
})()`,
        expected: 'Returns 6 medians [1, -1, -1, 3, 5, 6]'
      },
      {
        id: 't-bound-2',
        name: 'Even Window Size - Averages Two Central Values',
        testCode: `(() => {
  const nums = [1, 2, 3, 4];
  const k = 2;
  const res = slidingWindowMedian(nums, k);
  // windows: [1,2]->1.5, [2,3]->2.5, [3,4]->3.5
  const expected = [1.5, 2.5, 3.5];
  if (res.length !== 3) throw new Error('Expected 3 windows, got ' + res.length);
  for (let i = 0; i < expected.length; i++) {
    if (Math.abs(res[i] - expected[i]) > 0.001) {
      throw new Error('Even median mismatch at ' + i + ': expected ' + expected[i] + ' got ' + res[i]);
    }
  }
  return true;
})()`,
        expected: '[1.5, 2.5, 3.5]'
      },
      {
        id: 't-bound-3',
        name: 'k Equals Array Length Single Window',
        testCode: `(() => {
  const res = slidingWindowMedian([5, 1, 9], 3);
  if (res.length !== 1 || res[0] !== 5) {
    throw new Error('Expected single window [5], got ' + JSON.stringify(res));
  }
  return true;
})()`,
        expected: '[5]'
      }
    ]
  },
  {
    id: 'bench-nested-schema',
    title: 'DeepConfigResolver - Nullish Safety & Schema Guard',
    category: 'types',
    difficulty: 'Easy',
    description: 'Extracts deeply nested settings from configuration objects using dot-notation path strings, but crashes with TypeError on missing subtrees and overrides boolean false or numeric 0 with defaults.',
    requiredSkill: 'type-contract-validation',
    vulnerabilityHint: 'No optional chaining or nullish verification when traversing object keys, and uses falsy check || instead of nullish coalescing ??.',
    faultyCode: `function resolveConfig(obj, path, fallback) {
  const keys = path.split('.');
  let current = obj;
  for (let key of keys) {
    // BUG: If current is null or undefined, current[key] throws TypeError!
    current = current[key];
  }
  // BUG: || fallback overrides legitimate boolean false or integer 0
  return current || fallback;
}`,
    referenceSolution: `function resolveConfig(obj, path, fallback = undefined) {
  if (!obj || typeof obj !== 'object' || !path) return fallback;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return fallback;
    }
    current = current[key];
  }
  return current !== undefined ? current : fallback;
}`,
    tests: [
      {
        id: 't-schema-1',
        name: 'Gracefully Traverses Missing Intermediate Keys Without TypeError',
        testCode: `(() => {
  const cfg = { app: { name: 'CodeFix' } };
  // path reaches into missing db.auth.token
  const val = resolveConfig(cfg, 'app.db.auth.token', 'default_token');
  if (val !== 'default_token') {
    throw new Error('Expected fallback default_token, got ' + val);
  }
  return true;
})()`,
        expected: 'Safely returns fallback without throwing'
      },
      {
        id: 't-schema-2',
        name: 'Preserves Legitimate Boolean False Values',
        testCode: `(() => {
  const cfg = { features: { enableTelemetry: false } };
  const val = resolveConfig(cfg, 'features.enableTelemetry', true);
  if (val !== false) {
    throw new Error('Boolean false was mistakenly overwritten with true default: ' + val);
  }
  return true;
})()`,
        expected: 'Returns false'
      },
      {
        id: 't-schema-3',
        name: 'Preserves Numeric Zero Values',
        testCode: `(() => {
  const cfg = { limits: { retryCount: 0 } };
  const val = resolveConfig(cfg, 'limits.retryCount', 5);
  if (val !== 0) {
    throw new Error('Numeric 0 was mistakenly overridden by fallback: ' + val);
  }
  return true;
})()`,
        expected: 'Returns 0'
      }
    ]
  },
  {
    id: 'bench-recursion-stack',
    title: 'DeepTreeFlattener - Call Stack Overflow & Memory Guard',
    category: 'memory',
    difficulty: 'Hard',
    description: 'Flattens nested hierarchical category nodes into an id list. Uses recursive call stack traversal that exceeds maximum call stack size on deep trees and creates redundant array clones.',
    requiredSkill: 'memory-leak-cleanup',
    vulnerabilityHint: 'Direct recursive invocation fails with Maximum call stack size exceeded on deep trees; requires iterative stack traversal with cycle detection.',
    faultyCode: `function flattenTree(root) {
  if (!root) return [];
  // BUG: Naive recursion with array spread causes O(N^2) allocations
  // and crashes with CallStackExceeded on deep linear trees
  let list = [root.id];
  if (root.children && Array.isArray(root.children)) {
    for (let child of root.children) {
      list = list.concat(flattenTree(child));
    }
  }
  return list;
}`,
    referenceSolution: `function flattenTree(root) {
  if (!root) return [];
  const result = [];
  const stack = [root];
  const visited = new Set();
  
  // FIXED: Iterative traversal protects call stack from blowing up
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    
    if (current.id !== undefined) {
      result.push(current.id);
    }
    
    if (Array.isArray(current.children)) {
      // Push children in reverse order so leftmost child is processed first
      for (let i = current.children.length - 1; i >= 0; i--) {
        stack.push(current.children[i]);
      }
    }
  }
  return result;
}`,
    tests: [
      {
        id: 't-rec-1',
        name: 'Handles Deep Linear Tree (3,000 Depth) Without Stack Overflow',
        testCode: `(() => {
  // Construct a deep linear chain of 3,000 nodes
  let root = { id: 0, children: [] };
  let curr = root;
  for (let i = 1; i < 3000; i++) {
    const next = { id: i, children: [] };
    curr.children = [next];
    curr = next;
  }
  const result = flattenTree(root);
  if (!Array.isArray(result) || result.length !== 3000) {
    throw new Error('Expected 3000 nodes flattened, got ' + (result ? result.length : 0));
  }
  if (result[0] !== 0 || result[2999] !== 2999) {
    throw new Error('Order verification failed at boundary elements');
  }
  return true;
})()`,
        expected: 'Flattens 3,000 deep chain smoothly'
      },
      {
        id: 't-rec-2',
        name: 'Handles Branching Tree Hierarchy',
        testCode: `(() => {
  const tree = {
    id: 1,
    children: [
      { id: 2, children: [{ id: 4, children: [] }, { id: 5, children: [] }] },
      { id: 3, children: [{ id: 6, children: [] }] }
    ]
  };
  const res = flattenTree(tree);
  if (res.length !== 6) throw new Error('Expected 6 nodes, got ' + res.length);
  if (!res.includes(1) || !res.includes(6)) throw new Error('Missing elements');
  return true;
})()`,
        expected: 'Extracts all 6 category IDs'
      },
      {
        id: 't-rec-3',
        name: 'Prevents Infinite Loops on Cyclical References',
        testCode: `(() => {
  const nodeA = { id: 'A', children: [] };
  const nodeB = { id: 'B', children: [nodeA] };
  nodeA.children = [nodeB]; // cycle!
  const res = flattenTree(nodeA);
  if (!res.includes('A') || !res.includes('B') || res.length > 2) {
    throw new Error('Cycle handling failed: got ' + JSON.stringify(res));
  }
  return true;
})()`,
        expected: 'Cycle protected, terminates with [A, B]'
      }
    ]
  },
  {
    id: 'bench-table-sorter',
    title: 'MultiKeyTableSorter - String Collator & Nullish Tiebreaker',
    category: 'types',
    difficulty: 'Medium',
    description: 'Sorts tabular rows by multiple column specifications with mixed types (string, number, date, null). Fails when subtracting string values resulting in NaN and misplaces null entries.',
    requiredSkill: 'type-contract-validation',
    vulnerabilityHint: 'Using subtraction (a[k] - b[k]) produces NaN when comparing strings, which corrupts sort stability.',
    faultyCode: `function multiSort(rows, sortKeys) {
  // sortKeys is array of { key: string, order: 'asc'|'desc' }
  const sorted = [...rows];
  sorted.sort((a, b) => {
    for (let spec of sortKeys) {
      const valA = a[spec.key];
      const valB = b[spec.key];
      // BUG: Subtraction produces NaN for string values, breaking sort!
      const diff = valA - valB;
      if (diff !== 0) {
        return spec.order === 'desc' ? -diff : diff;
      }
    }
    return 0;
  });
  return sorted;
}`,
    referenceSolution: `function multiSort(rows, sortKeys) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  if (!Array.isArray(sortKeys) || sortKeys.length === 0) return [...rows];
  
  const sorted = [...rows];
  sorted.sort((a, b) => {
    for (const spec of sortKeys) {
      const valA = a ? a[spec.key] : undefined;
      const valB = b ? b[spec.key] : undefined;
      
      // Handle null/undefined values: send to end
      if (valA === valB) continue;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      
      let cmp = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        cmp = valA.localeCompare(valB);
      } else {
        cmp = valA < valB ? -1 : (valA > valB ? 1 : 0);
      }
      
      if (cmp !== 0) {
        return spec.order === 'desc' ? -cmp : cmp;
      }
    }
    return 0;
  });
  return sorted;
}`,
    tests: [
      {
        id: 't-sort-1',
        name: 'Sorts String Columns Alphabetically',
        testCode: `(() => {
  const data = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
  const res = multiSort(data, [{ key: 'name', order: 'asc' }]);
  if (res[0].name !== 'Alice' || res[1].name !== 'Bob' || res[2].name !== 'Charlie') {
    throw new Error('Alphabetical sort failed: got ' + res.map(r=>r.name).join(','));
  }
  return true;
})()`,
        expected: 'Alice, Bob, Charlie'
      },
      {
        id: 't-sort-2',
        name: 'Secondary Tiebreaker on Numerical Column',
        testCode: `(() => {
  const data = [
    { dept: 'Eng', salary: 120 },
    { dept: 'Sales', salary: 90 },
    { dept: 'Eng', salary: 150 }
  ];
  const res = multiSort(data, [
    { key: 'dept', order: 'asc' },
    { key: 'salary', order: 'desc' }
  ]);
  if (res[0].salary !== 150 || res[1].salary !== 120 || res[2].dept !== 'Sales') {
    throw new Error('Tiebreaker sort failed: got ' + JSON.stringify(res));
  }
  return true;
})()`,
        expected: 'Eng(150), Eng(120), Sales(90)'
      },
      {
        id: 't-sort-3',
        name: 'Null Values Pushed Safely to Tail',
        testCode: `(() => {
  const data = [{ score: 80 }, { score: null }, { score: 95 }];
  const res = multiSort(data, [{ key: 'score', order: 'asc' }]);
  if (res[2].score !== null || res[0].score !== 80 || res[1].score !== 95) {
    throw new Error('Null positioning failed: ' + JSON.stringify(res));
  }
  return true;
})()`,
        expected: '80, 95, null'
      }
    ]
  }
];
