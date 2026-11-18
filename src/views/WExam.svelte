<script>
  // Timed written exam: configure → write (autosaved, resumable, auto-submitted) → rubric marking → report.
  import { TOPICS, TM, ALLQ, ALLW, QM, WM, GROUPS, pct, shuffle, md, inl } from '../lib/bank.js';
  import { S, ui, save, saveSoon, ask, fmt, submitWx } from '../lib/state.svelte.js';
  import { F, score, rubricOf } from '../lib/formats.js';
  import Editor from './Editor.svelte'; import Marker from './Marker.svelte'; import Lines from './Lines.svelte';
  const types = Object.keys(F).filter(k => k !== 'mcq');
  const base = () => ({ min: 120, mcq: 20, wn: 8, grp: 'all', f: [...types], paper: false, neg: false, ...S.wcfg, bp: null, name: null });
  let cfg = $state(base()), err = $state('');
  const X = $derived(S.wx), it = $derived(X?.items[X.i]);
  const qOf = x => x.k === 'm' ? QM[x.id] : WM[x.id];
  const mk = x => x.k === 'm' ? 1 : WM[x.id].marks;
  const total = $derived(X ? X.items.reduce((s, x) => s + mk(x), 0) : 0);
  const done = x => x.k === 'm' ? X.ans[x.id] != null : X.paper ? !!X.seen?.[x.id] : !!X.ans[x.id]?.trim();
  const pace = x => Math.max(1, Math.round(mk(x) * (X.min ?? 120) / total)); // minutes, proportional to marks

  // cfg.bp (a preset blueprint) picks a fixed number of written questions per topic, e.g. { gsql: 2, gjava: 1 }.
  function begin() {
    const ok = id => cfg.grp === 'all' || TM[id].group === cfg.grp;
    let w = [];
    if (cfg.bp) w = Object.entries(cfg.bp).flatMap(([t, n]) => shuffle(ALLW.filter(x => x.topic === t)).slice(0, n));
    else {
      const buckets = cfg.f.map(t => shuffle(ALLW.filter(x => x.type === t && ok(x.topic)))).filter(b => b.length);
      while (w.length < cfg.wn && buckets.some(b => b.length)) for (const b of buckets) if (b.length && w.length < cfg.wn) w.push(b.pop());
    }
    const m = shuffle(ALLQ.filter(q => ok(q.topic))).slice(0, cfg.mcq);
    if (!w.length && !m.length) return (err = 'No questions match. Pick more formats or topics.');
    const { bp, name, ...keep } = $state.snapshot(cfg); if (!bp) S.wcfg = keep; // presets don't overwrite your own settings
    S.wx = { phase: 'run', paper: cfg.paper, min: cfg.min, neg: cfg.neg ? 0.25 : 0, name: cfg.name, i: 0, t0: Date.now(), end: Date.now() + cfg.min * 60000, ans: {}, marks: {},
      items: [...m.map(q => ({ k: 'm', id: q.id, o: shuffle(q.o.map((_, i) => i)) })), ...w.map(q => ({ k: 'w', id: q.id }))] };
    cfg = base(); save(); scrollTo(0, 0);
  }
  const submit = () => { const u = X.items.filter(x => !done(x)).length; ask(u ? `Submit with ${u} unanswered?` : 'Submit your exam now?', submitWx) };
  // results
  const res = $derived.by(() => {
    if (!X || X.phase === 'run') return null;
    const rows = X.items.map(x => { const q = qOf(x);
      if (x.k === 'm') return { x, q, f: 'mcq', got: X.ans[x.id] == null ? 0 : X.ans[x.id] === q.a ? 1 : -(X.neg || 0), max: 1 };
      const s = score(q, X.marks[x.id] || []); return { x, q, f: q.type, ...s } });
    const by = k => Object.entries(Object.groupBy ? Object.groupBy(rows, k) : rows.reduce((m, r) => ((m[k(r)] ??= []).push(r), m), {}))
      .map(([n, rs]) => { const g = rs.reduce((s, r) => s + r.got, 0), m = rs.reduce((s, r) => s + r.max, 0); return [n, pct(g, m), `${g}/${m}`] });
    const got = rows.reduce((s, r) => s + r.got, 0), max = rows.reduce((s, r) => s + r.max, 0);
    const miss = rows.filter(r => r.x.k === 'w').flatMap(r => rubricOf(r.q).filter((_, i) => (X.marks[r.x.id]?.[i] ?? 0) < 1).map(p => [r.q.q, p.t]));
    return { rows, got, max, byF: by(r => F[r.f].n), byT: by(r => TM[r.q.topic].name), miss, unmarked: rows.filter(r => r.x.k === 'w' && (X.marks[r.x.id] || []).some(v => v == null) || r.x.k === 'w' && !X.marks[r.x.id]).length };
  });
  function finishMarking() {
    for (const r of res.rows) { // record every result, so the paper counts towards weak spots and readiness
      if (r.x.k === 'm') { if (X.ans[r.x.id] != null) S.q[r.x.id] = r.got > 0 ? 1 : 0 } // blanks aren't weak spots
      else if ((X.marks[r.x.id] || []).some(v => v != null)) S.w[r.x.id] = { s: r.got, m: r.max, d: Date.now() };
    }
    S.wx.phase = 'done'; S.wxh = [...S.wxh, { d: Date.now(), got: res.got, max: res.max, name: X.name }].slice(-20); save(); scrollTo(0, 0);
  }
  if (ui.preset && !S.wx) { cfg = { ...cfg, ...ui.preset }; ui.preset = null; begin() } else ui.preset = null;
  const wIdx = $derived(X ? X.items.map((x, i) => [x, i]).filter(([x]) => x.k === 'w').map(([, i]) => i) : []);
  $effect(() => { if (X?.phase === 'mark' && !wIdx.length) finishMarking() });
</script>

{#if !X}
<section class="band green"><div class="wrap"><h1>Timed written exam</h1>
  <p class="mute">A mixed-format paper under time pressure: answers autosave, so you can close the tab and resume, and the paper submits itself when time runs out. Afterwards, mark each written answer with its rubric. The official duration and mark split are unknown, so set them here.</p></div></section>
<section class="band"><div class="qwrap">
  <div class="cfg">
    <label>Duration (minutes)<input type="number" min="5" max="300" bind:value={cfg.min} /></label>
    <label>MCQs (1 mark each)<input type="number" min="0" max="100" bind:value={cfg.mcq} /></label>
    <label>Written questions<input type="number" min="0" max="40" bind:value={cfg.wn} /></label>
    <label class="chk"><input type="checkbox" bind:checked={cfg.paper} />Paper mode: write answers by hand, print the paper, then mark your sheet</label>
    <label class="chk"><input type="checkbox" bind:checked={cfg.neg} />Negative marking: −0.25 for each wrong MCQ (blank scores 0)</label>
    <label>Curriculum<select bind:value={cfg.grp}><option value="all">All topics</option>{#each Object.entries(GROUPS) as [k, l]}<option value={k}>{l.split(' (')[0]}</option>{/each}</select></label>
  </div>
  <h3 class="sec">Written formats</h3><div class="row" style="margin:10px 0"><button class="btn" onclick={() => (cfg.f = [...types])}>Select all</button><button class="btn" onclick={() => (cfg.f = [])}>Clear</button></div>
  <div class="opts-set">{#each types as t}<label><input type="checkbox" bind:group={cfg.f} value={t} />{F[t].n} ({F[t].m}+ marks)</label>{/each}</div>
  <div class="row sec"><button class="btn dark" onclick={begin}>Start written exam</button><span class="mute">{err}</span></div>
  {#if S.wxh.length}<div class="sec"><h3>Past written exams</h3><Lines rows={S.wxh.slice(-8).reverse().map(h => [new Date(h.d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ` · ${h.got}/${h.max}`, pct(h.got, h.max), pct(h.got, h.max) + '%'])} /></div>{/if}
</div></section>

{:else if X.phase === 'run'}
<section class="band"><div class="qwrap">
  <div class="qhead"><b>{X.name || 'Written exam'} · {total} marks{X.paper ? ' · paper mode' : ''}{X.neg ? ' · −0.25 per wrong MCQ' : ''}</b><span class="row"><button class="btn" onclick={() => print()}>Print paper</button><span class="chip">≈ {pace(it)} min</span><span class="chip" class:warn={X.end - ui.now < 300000}>{fmt(X.end - ui.now)} left</span><span class="chip">{X.i + 1} / {X.items.length}</span></span></div>
  <div class="prog"><i style="width:{pct(X.items.filter(done).length, X.items.length)}%"></i></div>
  {#key X.i}
    {#if it.k === 'm'}{@const q = QM[it.id]}
      <div class="qhead"><span class="row"><span class="tag">Multiple choice</span><span class="chip">1 mark</span></span><span class="chip mute">{TM[q.topic].name}</span></div>
      <div class="qtext">{@html md(q.q)}</div>
      <div class="opts">{#each it.o as oi, k}<button class="opt" class:sel={X.ans[it.id] === oi} onclick={() => { X.ans[it.id] = oi; save() }}><span class="k">{'ABCDEF'[k]}</span><span>{@html inl(q.o[oi])}</span><span></span></button>{/each}</div>
    {:else}
      {#if X.paper}{@const q = WM[it.id]}
        <div class="qhead"><span class="row"><span class="tag">{F[q.type].n}</span><span class="chip">{q.marks} marks</span></span><span class="chip mute">{TM[q.topic].name}</span></div>
        <div class="qtext">{@html md(q.q)}</div><p class="tip">{F[q.type].tip}</p>
        <div class="fb"><b class="v">Write this answer on paper, labelled Q{X.i + 1}.</b><p><label class="row" style="gap:8px"><input type="checkbox" checked={!!X.seen?.[it.id]} onchange={e => { (X.seen ??= {})[it.id] = e.target.checked; save() }} style="width:18px;height:18px" />I have answered this on paper</label></p></div>
      {:else}<Editor q={WM[it.id]} bind:value={() => X.ans[it.id] ?? '', v => (X.ans[it.id] = v)} oninput={saveSoon} />{/if}
    {/if}
  {/key}
  <div class="qnav"><button class="btn" disabled={!X.i} onclick={() => X.i--}>← Previous</button>
    {#if X.i < X.items.length - 1}<button class="btn dark" onclick={() => { X.i++; scrollTo(0, 0) }}>Next →</button>{:else}<button class="btn dark" onclick={submit}>Submit exam</button>{/if}</div>
  <div class="pal" aria-label="Question palette">{#each X.items as x, i}<button class:a={done(x)} class:c={i === X.i} class:w={x.k === 'w'} aria-label="Question {i + 1}" onclick={() => (X.i = i)}>{i + 1}</button>{/each}</div>
  <div class="row" style="margin-top:16px;justify-content:space-between"><span class="mute">{X.items.filter(done).length} of {X.items.length} answered · autosaved</span><button class="btn" onclick={submit}>Submit exam</button></div>
</div></section>

{/if}
{#if X?.phase === 'run'}
<div class="print-paper">
  <h1>PKSF written exam practice</h1><p>Full marks: {total} · Time: {X.min ?? ''} minutes · Answer all questions. Marks are shown in brackets.</p>
  {#each X.items as x, i}{@const q = qOf(x)}
    <div class="pq"><p><b>Q{i + 1}.</b> <i>[{mk(x)} mark{mk(x) > 1 ? 's' : ''} · {x.k === 'm' ? 'MCQ' : F[q.type].n}]</i></p>{@html md(q.q)}
      {#if x.k === 'm'}<ol type="A">{#each x.o as oi}<li>{@html inl(q.o[oi])}</li>{/each}</ol>{/if}</div>
  {/each}
</div>
{/if}
{#if !X}{:else if X.phase === 'run'}{:else if X.phase === 'mark'}
<section class="band green"><div class="wrap"><h1>Mark your paper</h1><p class="mute">MCQs are marked automatically. For each written answer, award every rubric point against the answer key. Be as strict as an examiner would be.</p></div></section>
<section class="band"><div class="qwrap">
  {#if it?.k === 'w'}{@const q = WM[it.id]}
    <div class="qhead"><span class="row"><span class="tag">{F[q.type].n}</span><span class="chip">Written {wIdx.indexOf(X.i) + 1} / {wIdx.length}</span></span><span class="chip mute">{TM[q.topic].name}</span></div>
    <div class="qtext">{@html md(q.q)}</div>
    {#key X.i}<Marker {q} paper={X.paper} answer={X.ans[it.id] ?? ''} bind:marks={() => X.marks[it.id], v => (X.marks[it.id] = v)} onchange={save} />{/key}
  {/if}
  <div class="qnav">{#each [[-1, '← Previous'], [1, 'Next →']] as [d, l]}{@const j = wIdx[wIdx.indexOf(X.i) + d]}<button class="btn" disabled={j == null} onclick={() => { X.i = j; scrollTo(0, 0) }}>{l}</button>{/each}</div>
  <div class="row sec" style="justify-content:space-between"><span class="mute">{res?.unmarked ? `${res.unmarked} answer(s) not fully marked; unmarked points score 0` : 'All answers marked'}</span><button class="btn dark" onclick={finishMarking}>Finish marking and see report</button></div>
</div></section>

{:else}
<section class="band green"><div class="wrap score"><div class="big">{pct(res.got, res.max)}%</div><div><h2>{res.got} of {res.max} marks</h2>
  <p class="mute">{X.name ? X.name + ' · ' : ''}{X.items.length} questions in {Math.round(((X.submitted || X.end) - X.t0) / 60000)} minutes.{X.neg ? ` Negative marking: ${res.rows.filter(r => r.got < 0).length} wrong MCQs cost ${res.rows.filter(r => r.got < 0).length * X.neg} marks.` : ''} Self-marked against answer keys; no AI marking is used.</p>
  <div class="row"><button class="btn pri" onclick={() => { S.wx = null; save() }}>New written exam</button><a class="btn ghost" href="#write">Written practice</a></div></div></div>
  <div class="wrap" style="margin-top:22px"><h3>By format</h3><Lines rows={res.byF} /><h3 class="sec">By topic</h3><Lines rows={res.byT} /></div></section>
<section class="band"><div class="qwrap">
  {#if res.miss.length}<h2>Concepts to fix ({res.miss.length})</h2><ul class="cheat ans">{#each res.miss as [q, t]}<li><b>{t}</b> <span class="mute">({@html inl(q)})</span></li>{/each}</ul>{/if}
  <h2 class="sec">Review</h2>
  {#each res.rows as r, i}
    <details class="w"><summary>{i + 1}. {@html inl(r.x.k === 'm' ? r.q.q.split('\n')[0] : r.q.q)} · {r.got}/{r.max}</summary><div class="ans">
      {#if r.x.k === 'm'}<p><b>Your answer:</b> {#if X.ans[r.x.id] == null}<i>skipped</i>{:else}{@html inl(r.q.o[X.ans[r.x.id]])}{/if}</p><p><b>Correct:</b> {@html inl(r.q.o[r.q.a])}</p><p class="mute">{@html inl(r.q.e)}</p>
      {:else}<pre class="mine">{X.ans[r.x.id]?.trim() || '(blank)'}</pre><h4>Model answer</h4>{@html md(r.q.a)}<p><a href="#w-{r.q.id}">Practise this question again</a></p>{/if}
    </div></details>
  {/each}
</div></section>
{/if}
