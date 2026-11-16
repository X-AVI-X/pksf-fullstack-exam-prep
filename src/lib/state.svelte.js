import { ALLQ, ALLW, QM, WM, shuffle } from './bank.js';
import LEGACY from './legacy-ids.json';
const K = 'pksf-prep-v1';
const init = { q: {}, f: {}, mocks: [], w: {}, wd: {}, wx: null, wxh: [] }; // w: written scores, wd: drafts, wx: written exam in progress, wxh: exam history
try { Object.assign(init, JSON.parse(localStorage.getItem(K) || '{}')) } catch {}
// v1 stored progress under positional ids ("cs-4"); v2 uses stable text-hash ids. Migrate once, keeping every answer that still exists.
if ((init.v ?? 1) < 2) {
  const mv = o => Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [LEGACY[k] ?? k, v]).filter(([k]) => QM[k] || WM[k]));
  Object.assign(init, { q: mv(init.q), f: mv(init.f), w: mv(init.w), wd: mv(init.wd), wx: null, v: 2 });
}
if (init.wx && !init.wx.items?.every(x => QM[x.id] || WM[x.id])) init.wx = null; // a paper whose questions were since edited can't be resumed
export const S = $state(init); // q: {id: 1 right | 0 wrong}, f: {flashcard id: 1 known}, mocks: [{s,n,d}]
export const save = () => { try { localStorage.setItem(K, JSON.stringify($state.snapshot(S))) } catch {} };
save(); // persist the migrated/initialised state
export const ui = $state({ sess: null, deck: null, tab: 'quiz', search: '', confirm: null, now: Date.now() });
export const go = h => { location.hash = h };
export const mastered = t => t.qs.filter(q => S.q[q.id] === 1).length;
export const wrongs = () => ALLQ.filter(q => S.q[q.id] === 0);
export const ask = (msg, yes) => { ui.confirm = { msg, yes } };

export function start(qs, mode, title, mins) {
  ui.sess = { mode, title, i: 0, done: false, score: 0, end: mins ? Date.now() + mins * 60000 : 0,
    qs: qs.map(q => ({ ...q, order: shuffle(q.o.map((_, i) => i)) })), ans: qs.map(() => null) };
  go('quiz');
}
export function finish() {
  const s = ui.sess; if (!s || s.done) return;
  s.done = true; s.score = s.qs.filter((q, i) => s.ans[i] === q.a).length;
  if (s.mode === 'exam') { s.qs.forEach((q, i) => S.q[q.id] = s.ans[i] === q.a ? 1 : 0); S.mocks = [...S.mocks, { s: s.score, n: s.qs.length, d: Date.now() }].slice(-20) }
  save(); go('quiz');
}
setInterval(() => {
  ui.now = Date.now(); const s = ui.sess; if (s && !s.done && s.end && ui.now >= s.end) finish();
  if (S.wx?.phase === 'run' && ui.now >= S.wx.end) submitWx(); // automatic submission when time is up
}, 1000);
export function submitWx() { S.wx.phase = 'mark'; S.wx.i = S.wx.items.findIndex(x => x.k === 'w'); S.wx.submitted = Date.now(); save(); go('wexam') }
let st; export const saveSoon = () => { clearTimeout(st); st = setTimeout(save, 400) };

export function newDeck(t = 'all', unk = false) {
  let l = ALLW.filter(w => t === 'all' || w.topic === t); if (unk) l = l.filter(w => S.f[w.id] !== 1);
  ui.deck = { t, unk, list: shuffle(l), i: 0, shown: false };
}
export const fmt = ms => { const s = Math.round(Math.max(0, ms) / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') };
