// Validates every question file: run `npm run check` after editing content/.
import fs from 'node:fs';
import { parseMCQ, parseW, parseCheat } from '../src/lib/parse.js';
const dir = new URL('../content/', import.meta.url), rd = f => fs.existsSync(new URL(f, dir)) ? fs.readFileSync(new URL(f, dir), 'utf8') : '';
let bad = 0, nq = 0, nw = 0;
for (const { id, name } of JSON.parse(rd('topics.json'))) {
  const qs = parseMCQ(id, rd(`${id}.mcq.txt`)), ws = parseW(id, rd(`${id}.written.md`)), cs = parseCheat(rd(`${id}.cheat.md`));
  qs.forEach((q, i) => { const e = q.a < 0 ? 'no * answer' : q.o.length < 2 ? '<2 options' : !q.e ? 'no explanation' : new Set(q.o).size < q.o.length ? 'duplicate option' : '';
    if (e) { bad++; console.log(`${id} #${i + 1} ${e}: ${q.q.slice(0, 60)}`) } });
  nq += qs.length; nw += ws.length;
  console.log(`${name.padEnd(28)} ${String(qs.length).padStart(3)} MCQ ${String(ws.length).padStart(3)} written ${String(cs.length).padStart(3)} cheat`);
}
console.log(`Total ${nq} MCQ, ${nw} written. ${bad ? bad + ' problem(s)' : 'All valid.'}`); process.exit(bad ? 1 : 0);
