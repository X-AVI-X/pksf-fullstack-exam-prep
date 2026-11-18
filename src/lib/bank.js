import meta from '../../content/topics.json';
import { parseMCQ, parseW, parseCheat, parseLectures } from './parse.js';
export { md, inl } from './parse.js';
const raw = import.meta.glob('../../content/*.{txt,md}', { query: '?raw', import: 'default', eager: true });
const f = (id, n) => raw[`../../content/${id}.${n}`] || '';
// Topics marked "hidden" (outside the ToR) stay in content/ and keep their saved progress, but are left out of the app.
export const TOPICS = meta.filter(t => !t.hidden).map(t => ({ ...t, qs: parseMCQ(t.id, f(t.id, 'mcq.txt')), ws: parseW(t.id, f(t.id, 'written.md')), cs: parseCheat(f(t.id, 'cheat.md')), lec: parseLectures(t.id, f(t.id, 'lectures.md')) }));
export const TM = Object.fromEntries(TOPICS.map(t => [t.id, t]));
export const ALLQ = TOPICS.flatMap(t => t.qs), ALLW = TOPICS.flatMap(t => t.ws);
export const QM = Object.fromEntries(ALLQ.map(q => [q.id, q]));
export const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
export const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
export const WM = Object.fromEntries(ALLW.map(w => [w.id, w]));
export const GROUPS = { tor: 'ToR topics (confirmed in the Terms of Reference)', gov: 'Government-exam patterns (how Bangladeshi IT recruitment papers ask ToR topics)' };
export const GTAG = { tor: 'ToR topic', gov: 'Government-exam pattern' };
