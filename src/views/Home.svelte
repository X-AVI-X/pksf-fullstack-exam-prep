<script>
  import { TOPICS, ALLQ, ALLW, TM, GROUPS, pct, md, inl } from '../lib/bank.js';
  import { S, ui, mastered, wrongs } from '../lib/state.svelte.js';
  import Resume from './Resume.svelte'; import Lines from './Lines.svelte';
  const tot = ALLQ.length, ok = $derived(ALLQ.filter(q => S.q[q.id] === 1).length);
  const w = $derived(wrongs().length), last = $derived(S.mocks.at(-1));
  // Readiness: the exam is written, so MCQ mastery and written marks earned count equally.
  const wTot = ALLW.reduce((s, x) => s + x.marks, 0), wDone = $derived(ALLW.filter(x => S.w[x.id]));
  const wp = $derived(pct(wDone.reduce((s, x) => s + x.marks * S.w[x.id].s / (S.w[x.id].m || 1), 0), wTot)), p = $derived(Math.round((pct(ok, tot) + wp) / 2));
  const r = 52, c = 2 * Math.PI * r;
  let term = $state(ui.search), to;
  const s = $derived(term.trim().toLowerCase());
  const mq = $derived(s.length < 2 ? [] : ALLQ.filter(q => (q.q + ' ' + q.o.join(' ') + ' ' + q.e).toLowerCase().includes(s)).slice(0, 25));
  const mw = $derived(s.length < 2 ? [] : ALLW.filter(w => (w.q + ' ' + w.a).toLowerCase().includes(s)).slice(0, 15));
</script>

<section class="band green"><div class="wrap"><Resume /><div class="hero">
  <div><h1>Prepare to write full-mark answers in the PKSF exam</h1>
    <p class="mute">{tot} exam-style MCQs with explanations, {ALLW.length} written questions across 11 formats (SQL, output prediction, bug-finding, design, scenarios…) with model answers and marking rubrics, plus a cheat sheet per topic.</p>
    <div class="row" style="margin-top:18px"><a class="btn pri" href="#guide">Start here: study plan</a><a class="btn ghost" href="#wexam">Timed written exam</a><a class="btn ghost" href="#write">Written practice</a><a class="btn ghost" href="#mock">MCQ mock</a><a class="btn ghost" href="#cards">Flashcards</a>{#if w}<a class="btn ghost" href="#weak">Fix {w} weak spots</a>{/if}</div></div>
  <div class="dial">
    <svg viewBox="0 0 130 130" role="img" aria-label="Readiness {p}%: average of MCQ mastery and written marks earned"><title>Average of MCQ mastery and written marks earned</title><circle cx="65" cy="65" {r} fill="none" stroke="#ffffff22" stroke-width="12" /><circle cx="65" cy="65" {r} fill="none" stroke="#e6f5c8" stroke-width="12" stroke-linecap={p ? 'round' : 'butt'} stroke-dasharray="{c * p / 100} {c}" transform="rotate(-90 65 65)" /><text x="65" y="66" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="Inter Tight, Inter, sans-serif" font-weight="800" font-size="30">{p}%</text><text x="65" y="92" text-anchor="middle" fill="#b9d6cc" font-family="Inter, sans-serif" font-size="11">ready</text></svg>
    <div>
      <div class="stat"><span>MCQs mastered</span><b>{ok} / {tot}</b></div>
      <div class="stat"><span>Written answered</span><b>{wDone.length} / {ALLW.length}{wDone.length ? ` (${wp}% of all marks)` : ''}</b></div>
      <div class="stat"><span>Currently wrong</span><b>{w}</b></div>
      <div class="stat"><span>Last mock</span><b>{last ? `${last.s} / ${last.n} (${pct(last.s, last.n)}%)` : 'not taken'}</b></div>
    </div></div></div>
  <Lines rows={TOPICS.map(t => { const m = pct(mastered(t), t.qs.length); return [t.name, m, m + '%'] })} />
</div></section>
<section class="band"><div class="wrap">{#each Object.entries(GROUPS) as [g, label]}<h2 class:sec={g !== 'tor'}>{label}</h2>
  <div class="grid">{#each TOPICS.filter(t => t.group === g) as t}{@const m = mastered(t)}<a class="card tcard" href="#t-{t.id}"><h3>{t.name}</h3><span class="mute" style="font-size:14px">{t.blurb}</span><div class="bar"><i style="width:{pct(m, t.qs.length)}%"></i></div><div class="meta mute"><span>{m} / {t.qs.length} mastered</span><span>{t.ws.length} written</span></div></a>{/each}</div>{/each}
  <div class="sec"><h2>Search everything</h2><p class="mute">Look up any term, e.g. "N+1", "PKCE", "StatefulSet".</p>
    <input type="search" placeholder="Search questions and answers" aria-label="Search questions and answers" value={term} oninput={e => { clearTimeout(to); to = setTimeout(() => (term = ui.search = e.target.value), 180) }} />
    {#if s.length >= 2}
      {#if !mq.length && !mw.length}<p class="empty mute">No matches.</p>{:else}<p class="mute">{mq.length} questions, {mw.length} written answers</p>{/if}
      {#each mq as q}<div class="rv"><div class="qt">{@html md(q.q)}</div><div class="l"><b>Answer:</b> {@html inl(q.o[q.a])}</div><div class="l mute">{@html inl(q.e)}</div><div class="l mute">{TM[q.topic].name}</div></div>{/each}
      {#each mw as w}<details class="w"><summary>{@html inl(w.q)}</summary><div class="ans">{@html md(w.a)}</div></details>{/each}
    {/if}</div>
</div></section>
