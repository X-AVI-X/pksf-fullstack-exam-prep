// The 12 written-exam formats: name, default marks, answer-structure tip, generic rubric (fraction of marks, criterion).
export const F = {
  mcq: { n: 'Multiple choice', m: 1 },
  short: { n: 'Short answer', m: 2, tip: 'One to three precise sentences. Lead with the direct answer, then one supporting fact or example.',
    g: [[.5, 'Direct, correct answer'], [.5, 'Supporting fact, reason or example']] },
  concept: { n: 'Explain the concept', m: 5, tip: 'Define it in one line → how it works → a concrete example (code or a PKSF scenario) → one trade-off or when to use it.',
    g: [[.2, 'Accurate definition'], [.3, 'Explains how it works (mechanism)'], [.2, 'Concrete example or code'], [.2, 'Trade-off, pitfall or when to use'], [.1, 'Correct terminology, clear structure']] },
  descriptive: { n: 'Descriptive', m: 10, tip: 'Define the topic → 3–6 headed points or numbered steps → an example or diagram → a one-line conclusion.',
    g: [[.15, 'Defines the topic and context'], [.4, 'Covers the main points of the model answer'], [.2, 'Example, code or diagram'], [.15, 'Practical concerns (security, performance, PKSF context)'], [.1, 'Organised structure and conclusion']] },
  compare: { n: 'Compare & contrast', m: 6, tip: 'One-line definition of each → a table of 4–6 dimensions → when to choose which, with an example.',
    g: [[.2, 'Correct definition of each side'], [.4, 'At least four accurate differences'], [.2, 'When to use each, with an example'], [.2, 'Clear table or side-by-side layout']] },
  sql: { n: 'Write SQL', m: 6, tip: 'State schema assumptions → write the query with aliases, one clause per line → mention the supporting index or a dialect difference.',
    g: [[.4, 'Returns the correct result (joins, filters, grouping)'], [.2, 'Handles ties, NULLs and duplicates correctly'], [.2, 'Valid syntax for the dialect'], [.2, 'Readable; notes index or performance']] },
  output: { n: 'Predict the output', m: 3, tip: 'Write the exact output first, then trace the key lines and name the rule (string pool, integer cache, evaluation order…).',
    g: [[.6, 'Exact output'], [.4, 'Correct reasoning that names the rule']] },
  bug: { n: 'Find the error', m: 5, tip: 'Point to the line → say how it fails (compile error, exception, wrong result) and why → corrected code → how to prevent it.',
    g: [[.3, 'Identifies the bug'], [.3, 'Explains why it fails'], [.3, 'Correct fix'], [.1, 'Prevention (test, lint, pattern)']] },
  code: { n: 'Write a program', m: 8, tip: 'Signature first → clean, compilable code → edge cases (null, empty, overflow) → time and space complexity.',
    g: [[.5, 'Correct logic that compiles'], [.2, 'Handles edge cases'], [.2, 'Good complexity, stated'], [.1, 'Readable naming and structure']] },
  schema: { n: 'Schema design', m: 10, tip: 'Entities → tables with PK/FK and typed key columns → cardinalities (M:N via junction) → constraints and indexes → small ERD sketch.',
    g: [[.25, 'Correct entities and attributes'], [.25, 'Keys and relationships with cardinality'], [.2, 'Normalised, no redundancy'], [.15, 'Constraints and indexes'], [.15, 'ERD or clear notation']] },
  arch: { n: 'System architecture', m: 10, tip: 'Draw the boxes (client, gateway, services, DB, cache, queue, IdP) → request and data flow → security, scaling, failure handling, observability.',
    g: [[.25, 'Correct components'], [.2, 'Request and data flow'], [.2, 'Security (authN/Z, encryption)'], [.2, 'Scalability and failure handling'], [.15, 'Observability and deployment']] },
  scenario: { n: 'Troubleshooting scenario', m: 8, tip: 'Clarify symptoms → hypotheses → check metrics, logs and traces in order → root cause → fix → prevent recurrence.',
    g: [[.2, 'Systematic diagnosis steps'], [.25, 'Right tools and metrics'], [.25, 'Plausible root causes'], [.2, 'Concrete fix'], [.1, 'Prevention and monitoring']] },
};
export const CODEY = new Set(['sql', 'output', 'bug', 'code', 'schema']);
export function infer(q, a) {
  if (/^write (an? )?(sql|query|pl)|^write .*query/i.test(q) || (/^write/i.test(q) && /~~~sql/.test(a))) return 'sql';
  if (/^(write|implement|reverse|check|binary search|fizz|two sum)/i.test(q)) return 'code';
  if (/ vs\.? |versus|compare|difference|differ/i.test(q)) return 'compare';
  if (/^design/i.test(q)) return /schema|data model|table/i.test(q) ? 'schema' : 'arch';
  if (/troubleshoot|slow|spiking|^how (do|would) you/i.test(q)) return 'scenario';
  if (/^(explain|what is|what are|describe|how does)/i.test(q)) return 'concept';
  return 'descriptive';
}
const half = x => Math.round(x * 2) / 2;
export function rubricOf(q) {
  if (q.rubric.length) return q.rubric;
  const R = F[q.type].g.map(([f, t]) => ({ m: half(f * q.marks), t, kw: [] }));
  R[0].m += q.marks - R.reduce((s, p) => s + p.m, 0); // rounding remainder goes to the first criterion, so the total always equals the marks
  return R;
}
export const score = (q, marks = []) => { const R = rubricOf(q); return { got: R.reduce((s, p, i) => s + (marks[i] ?? 0) * p.m, 0), max: R.reduce((s, p) => s + p.m, 0) } };
export const terms = a => [...new Set([...a.matchAll(/\{\{(.+?)\}\}|\*\*(.+?)\*\*/g)].map(m => (m[1] || m[2]).trim()))].slice(0, 14);
export const has = (ans, k) => k.split('/').some(x => (ans || '').toLowerCase().includes(x.trim().toLowerCase()));
