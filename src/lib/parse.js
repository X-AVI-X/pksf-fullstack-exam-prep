import { F, infer } from './formats.js';
// Stable ids: hash of the question text (FNV-1a), so reordering or moving a question between topics keeps saved progress.
export const hid = (p, s) => p + [...s.replace(/\s+/g, ' ').trim()].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(36);
// Pure parsers shared by the app and scripts/check-bank.js.
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export function inl(s) {
  s = String(s).replace(/\\\{/g, '\u0001').replace(/\\\}/g, '\u0002');
  s = esc(s).replace(/\{\{(.+?)\}\}/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  return s.replace(/\u0001/g, '{').replace(/\u0002/g, '}');
}
export function md(s) {
  const L = String(s).replace(/^\n+|\n+$/g, '').split('\n'); let h = '', i = 0;
  const isLi = l => /^\s*- /.test(l), isOl = l => /^\d+\. /.test(l), isT = l => l.startsWith('|');
  while (i < L.length) {
    const l = L[i];
    if (l.startsWith('~~~')) { const b = []; i++; while (i < L.length && !L[i].startsWith('~~~')) b.push(L[i++]); i++; h += '<pre><code>' + esc(b.join('\n')) + '</code></pre>'; continue }
    if (l.startsWith('|')) { const rows = []; while (i < L.length && L[i].startsWith('|')) { if (!/^\|[\s:|-]+\|$/.test(L[i])) rows.push(L[i].replace(/^\||\|$/g, '').split('|').map(c => inl(c.trim()))); i++ }
      h += '<div class="tbl"><table><thead><tr>' + rows[0].map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' + rows.slice(1).map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>'; continue }
    if (isLi(l)) { h += '<ul>'; while (i < L.length && isLi(L[i])) h += '<li>' + inl(L[i++].replace(/^\s*- /, '')) + '</li>'; h += '</ul>'; continue }
    if (isOl(l)) { h += '<ol>'; while (i < L.length && isOl(L[i])) h += '<li>' + inl(L[i++].replace(/^\d+\. /, '')) + '</li>'; h += '</ol>'; continue }
    if (/^#{3,4} /.test(l)) { const n = l.startsWith('####') ? 4 : 3; h += `<h${n}>` + inl(l.replace(/^#+ /, '')) + `</h${n}>`; i++; continue }
    if (!l.trim()) { i++; continue }
    const b = []; while (i < L.length && L[i].trim() && !L[i].startsWith('~~~') && !isLi(L[i]) && !isOl(L[i]) && !isT(L[i]) && !/^#{3,4} /.test(L[i])) b.push(L[i++]);
    h += '<p>' + inl(b.join(' ')) + '</p>';
  }
  return h;
}
// MCQ format: "Q: text" (optional ~~~ code), "- wrong", "* right", "E: explanation"
export function parseMCQ(id, txt) {
  const out = []; let cur = null, mode = null, inCode = false;
  for (const raw of txt.split('\n')) {
    const l = raw.replace(/\s+$/, '');
    if (!inCode && l.startsWith('Q: ')) { if (cur) out.push(cur); cur = { q: l.slice(3), o: [], a: -1, e: '' }; mode = 'q'; continue }
    if (!cur) continue;
    if (mode === 'q' && l.startsWith('~~~')) { inCode = !inCode; cur.q += '\n' + l; continue }
    if (inCode) { cur.q += '\n' + raw; continue }
    if (/^[-*] /.test(l) && mode !== 'e') { if (l[0] === '*') cur.a = cur.o.length; cur.o.push(l.slice(2)); mode = 'o'; continue }
    if (l.startsWith('E: ')) { cur.e = l.slice(3); mode = 'e'; continue }
    if (!l.trim()) continue;
    if (mode === 'q') cur.q += '\n' + l; else if (mode === 'e') cur.e += ' ' + l;
  }
  if (cur) out.push(cur);
  return out.map(x => Object.assign(x, { id: hid('q', x.q), topic: id }));
}
// Written format: "## Question", optional first line "@type marks [verified]", markdown answer,
// optional rubric lines outside code fences: "+ marks | criterion | keyword, alt/alt"
const META = /^@(\w+)(?: (\d+(?:\.5)?))?( verified)?$/, RUB = /^\+ (\d+(?:\.5)?) \| ([^|]+?)(?: \| (.+))?$/;
export const parseW = (id, txt) => txt.split(/\n(?=## )/).map(b => b.trim()).filter(b => b.startsWith('## ')).map((b, i) => {
  const L = b.split('\n'), q = L[0].slice(3).trim(), body = [], rubric = []; let type, marks, verified = false, fence = false;
  L.slice(1).forEach((l, j) => {
    let m;
    if (j === 0 && (m = l.match(META))) { type = m[1]; marks = m[2] && +m[2]; verified = !!m[3]; return }
    if (l.startsWith('~~~')) fence = !fence;
    if (!fence && (m = l.match(RUB))) { rubric.push({ m: +m[1], t: m[2].trim(), kw: m[3] ? m[3].split(',').map(s => s.trim()).filter(Boolean) : [] }); return }
    body.push(l);
  });
  const a = body.join('\n').trim(); type ||= infer(q, a);
  return { id: hid('w', q), topic: id, q, a, type, rubric, verified, marks: marks || rubric.reduce((s, p) => s + p.m, 0) || F[type]?.m || 5 };
});
export const parseCheat = txt => txt.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2));
