// Pure parsers shared by the app and scripts/check-bank.js.
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export function inl(s) {
  s = String(s).replace(/\\\{/g, '\u0001').replace(/\\\}/g, '\u0002');
  s = esc(s).replace(/\{\{(.+?)\}\}/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  return s.replace(/\u0001/g, '{').replace(/\u0002/g, '}');
}
export function md(s) {
  const L = String(s).replace(/^\n+|\n+$/g, '').split('\n'); let h = '', i = 0;
  const isLi = l => /^\s*- /.test(l), isOl = l => /^\d+\. /.test(l);
  while (i < L.length) {
    const l = L[i];
    if (l.startsWith('~~~')) { const b = []; i++; while (i < L.length && !L[i].startsWith('~~~')) b.push(L[i++]); i++; h += '<pre><code>' + esc(b.join('\n')) + '</code></pre>'; continue }
    if (isLi(l)) { h += '<ul>'; while (i < L.length && isLi(L[i])) h += '<li>' + inl(L[i++].replace(/^\s*- /, '')) + '</li>'; h += '</ul>'; continue }
    if (isOl(l)) { h += '<ol>'; while (i < L.length && isOl(L[i])) h += '<li>' + inl(L[i++].replace(/^\d+\. /, '')) + '</li>'; h += '</ol>'; continue }
    if (!l.trim()) { i++; continue }
    const b = []; while (i < L.length && L[i].trim() && !L[i].startsWith('~~~') && !isLi(L[i]) && !isOl(L[i])) b.push(L[i++]);
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
  return out.map((x, i) => Object.assign(x, { id: id + '-' + i, topic: id }));
}
// Written format: "## Question" followed by a markdown answer
export const parseW = (id, txt) => txt.split(/\n(?=## )/).map(b => b.trim()).filter(b => b.startsWith('## ')).map((b, i) => {
  const nl = b.indexOf('\n'); return { id: id + '-w' + i, topic: id, q: b.slice(3, nl < 0 ? undefined : nl).trim(), a: nl < 0 ? '' : b.slice(nl + 1) };
});
export const parseCheat = txt => txt.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2));
