<script>
  import { TM, QM, pct, md, inl, shuffle } from '../lib/bank.js';
  import { S, ui, save, start, finish, go, ask, fmt } from '../lib/state.svelte.js';
  import Lines from './Lines.svelte';
  if (!ui.sess) go('home');
  const s = $derived(ui.sess), ex = $derived(s?.mode === 'exam'), n = $derived(s?.qs.length ?? 0);
  const q = $derived(s?.qs[s.i]), a = $derived(s?.ans[s.i]), locked = $derived(!ex && a !== null), last = $derived(s?.i === n - 1);
  const answered = $derived(s ? s.ans.filter(x => x !== null).length : 0), left = $derived(s ? s.end - ui.now : 0);
  let nxt = $state();
  $effect(() => { if (locked && nxt) nxt.focus({ preventScroll: true }) });

  function pick(oi) { if (locked) return; s.ans[s.i] = oi; if (!ex) { S.q[q.id] = oi === q.a ? 1 : 0; save() } }
  function next() { if (s.i < n - 1) { s.i++; scrollTo(0, 0) } else finish() }
  const submit = () => { const u = n - answered; ask(u ? `Submit with ${u} unanswered?` : 'Submit your exam now?', finish) };
  const quit = () => { if (!answered) { ui.sess = null; history.back() } else finish() };
  function key(e) {
    if (!s || s.done || ui.confirm || e.target.matches('input,select,textarea')) return;
    const k = e.key.toLowerCase(); let i = '1234'.indexOf(k); if (i < 0) i = 'abcd'.indexOf(k);
    if (i >= 0 && i < q.order.length) return pick(q.order[i]);
    if ((k === 'enter' || k === 'arrowright') && (ex || locked)) { e.preventDefault(); ex && last ? submit() : next() }
    if (k === 'arrowleft' && ex && s.i > 0) s.i--;
  }
  const cls = oi => locked ? (oi === q.a ? 'right' : oi === a ? 'wrong' : '') : a === oi ? 'sel' : '';
  // results
  const p = $derived(s?.done ? pct(s.score, n) : 0);
  const wrongIdx = $derived(s?.done ? s.qs.map((_, i) => i).filter(i => s.ans[i] !== s.qs[i].a) : []);
  const byTopic = $derived.by(() => { const b = {}; s?.done && s.qs.forEach((q, i) => { const x = b[q.topic] ??= { n: 0, s: 0 }; x.n++; if (s.ans[i] === q.a) x.s++ }); return Object.entries(b).map(([k, x]) => [TM[k].name, pct(x.s, x.n), `${x.s}/${x.n}`]) });
  const verdict = $derived(p === 100 ? 'Perfect score. Keep it that way with another mock tomorrow.' : p >= 85 ? 'Very strong. Clear the few misses below and you are there.' : p >= 65 ? 'Good base. Review the wrong answers and retake the weak topics.' : 'Keep going: read the cheat sheets for the weak topics, then practise them one by one.');
</script>

<svelte:window onkeydown={key} />
{#if s?.done}
<section class="band green"><div class="wrap score"><div class="big">{p}%</div><div><h2>{s.score} of {n} correct</h2><p class="mute">{s.title}. {verdict}</p>
  <div class="row"><button class="btn pri" disabled={!wrongIdx.length} onclick={() => start(shuffle(wrongIdx.map(i => QM[s.qs[i].id])), 'practice', 'Retry missed questions', 0)}>Retry the {wrongIdx.length} missed</button><a class="btn ghost" href="#mock">New mock</a><a class="btn ghost" href="#home">Topics</a></div></div></div>
  <div class="wrap" style="margin-top:22px"><Lines rows={byTopic} /></div></section>
<section class="band"><div class="qwrap"><h2>Review</h2><p class="mute">{wrongIdx.length ? 'Missed questions first, then the rest.' : 'Every answer was right.'}</p>
  {#each [...wrongIdx, ...s.qs.map((_, i) => i).filter(i => !wrongIdx.includes(i))] as i}{@const q = s.qs[i]}{@const a = s.ans[i]}{@const ok = a === q.a}
    <div class="rv {ok ? 'ok' : 'no'}"><div class="qt">{@html md(i + 1 + '. ' + q.q)}</div>{#if !ok}<div class="l"><b>Your answer:</b> {#if a === null}<i>skipped</i>{:else}{@html inl(q.o[a])}{/if}</div>{/if}<div class="l"><b>Correct:</b> {@html inl(q.o[q.a])}</div><div class="l mute">{@html inl(q.e)}</div></div>
  {/each}</div></section>
{:else if s}
<section class="band"><div class="qwrap">
  <div class="qhead"><b>{s.title}</b><span class="row">{#if ex && s.end}<span class="chip" class:warn={left < 120000}>{fmt(left)} left</span>{/if}<span class="chip">{s.i + 1} / {n}</span><span class="chip mute">{TM[q.topic].name}</span></span></div>
  <div class="prog"><i style="width:{pct(ex ? answered : s.i + (locked ? 1 : 0), n)}%"></i></div>
  <div class="qtext">{@html md(q.q)}</div>
  <div class="opts">{#each q.order as oi, k}{@const c = cls(oi)}<button class="opt {c}" disabled={locked} onclick={() => pick(oi)}><span class="k">{'ABCDEF'[k]}</span><span>{@html inl(q.o[oi])}</span><span aria-hidden="true">{c === 'right' ? '✓' : c === 'wrong' ? '✗' : ''}</span></button>{/each}</div>
  {#if locked}<div class="fb" class:no={a !== q.a} role="status"><b class="v">{#if a === q.a}Correct.{:else}Not quite. Correct answer: {@html inl(q.o[q.a])}{/if}</b><p>{@html inl(q.e)}</p></div>{/if}
  <div class="qnav">
    {#if ex}<button class="btn" disabled={!s.i} onclick={() => s.i--}>← Previous</button>{:else}<button class="btn" onclick={quit}>End session</button>{/if}
    {#if ex}{#if last}<button class="btn dark" onclick={submit}>Submit exam</button>{:else}<button class="btn dark" onclick={next}>Next →</button>{/if}
    {:else if locked}<button class="btn dark" bind:this={nxt} onclick={next}>{last ? 'See results' : 'Next →'}</button>
    {:else}<span class="mute kbd" style="align-self:center">Press 1–4 or A–D to answer</span>{/if}
  </div>
  {#if ex}
    <div class="pal" aria-label="Question palette">{#each s.qs as _, i}<button class:a={s.ans[i] !== null} class:c={i === s.i} aria-label="Question {i + 1}" onclick={() => (s.i = i)}>{i + 1}</button>{/each}</div>
    <div class="row" style="margin-top:16px;justify-content:space-between"><span class="mute">{answered} of {n} answered</span><button class="btn" onclick={submit}>Submit exam</button></div>
  {/if}
</div></section>
{/if}
