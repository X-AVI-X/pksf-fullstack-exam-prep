// Validates every question file: run `npm run check` after editing content/.
import fs from 'node:fs';
import { parseMCQ, parseW, parseCheat } from '../src/lib/parse.js';
import { F } from '../src/lib/formats.js';
const dir = new URL('../content/', import.meta.url), rd = f => fs.existsSync(new URL(f, dir)) ? fs.readFileSync(new URL(f, dir), 'utf8') : '';
let bad = 0, nq = 0, nw = 0, rub = 0; const byF = {}, ids = new Map();
const uniq = (x, where) => { if (ids.has(x.id)) { bad++; console.log(`duplicate question text (id ${x.id}) in ${where} and ${ids.get(x.id)}: ${x.q.slice(0, 60)}`) } else ids.set(x.id, where) };
for (const { id, name, group, hidden } of JSON.parse(rd('topics.json'))) {
  if (group === 'gov' && !rd(`${id}.tutorial.md`).trim()) { bad++; console.log(`${id}: pattern topic has no tutorial`) }
  const qs = parseMCQ(id, rd(`${id}.mcq.txt`)), ws = parseW(id, rd(`${id}.written.md`)), cs = parseCheat(rd(`${id}.cheat.md`));
  qs.forEach((q, i) => { const e = q.a < 0 ? 'no * answer' : q.o.length < 2 ? '<2 options' : !q.e ? 'no explanation' : new Set(q.o).size < q.o.length ? 'duplicate option' : '';
    if (e) { bad++; console.log(`${id} #${i + 1} ${e}: ${q.q.slice(0, 60)}`) } });
  ws.forEach((w, i) => { const r = w.rubric.reduce((s, p) => s + p.m, 0), e = !F[w.type] || w.type === 'mcq' ? 'unknown format ' + w.type : w.rubric.length && r !== w.marks ? `rubric sums to ${r}, marks ${w.marks}` : !w.a ? 'no model answer' : '';
    if (e) { bad++; console.log(`${id} written #${i + 1} ${e}: ${w.q.slice(0, 60)}`) } });
  qs.forEach(q => uniq(q, id)); ws.forEach(w => uniq(w, id));
  nq += qs.length; nw += ws.length; ws.forEach(w => { byF[w.type] = (byF[w.type] || 0) + 1; if (w.rubric.length) rub++ });
  console.log(`${(name + (hidden ? ' (hidden)' : '')).padEnd(32)} ${String(qs.length).padStart(3)} MCQ ${String(ws.length).padStart(3)} written ${String(cs.length).padStart(3)} cheat`);
}
const all = Object.values(byF); console.log('Formats: ' + Object.entries(byF).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(`Total ${nq} MCQ, ${nw} written (${rub} with specific rubrics). ${bad ? bad + ' problem(s)' : 'All valid.'}`); process.exit(bad ? 1 : 0);
