// One-off: map the old positional ids ("<topic>-<n>", "<topic>-w<n>") used up to commit 60389aa to the new stable ids.
// Usage: node scripts/legacy-ids.js <commit>  > src/lib/legacy-ids.json
import { execSync } from 'node:child_process';
import { parseMCQ, parseW } from '../src/lib/parse.js';
const rev = process.argv[2], git = f => { try { return execSync(`git show ${rev}:content/${f}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) } catch { return '' } };
const map = {};
for (const { id } of JSON.parse(git('topics.json'))) {
  parseMCQ(id, git(`${id}.mcq.txt`)).forEach((q, i) => map[`${id}-${i}`] = q.id);
  parseW(id, git(`${id}.written.md`)).forEach((w, i) => map[`${id}-w${i}`] = w.id);
}
console.log(JSON.stringify(map));
