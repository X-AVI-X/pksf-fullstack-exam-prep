<script>
  // A topic's lectures, read in order. Each lecture ends with a check; Next opens only after it is answered.
  import { md, inl, pct } from '../lib/bank.js';
  import { S, save, ui } from '../lib/state.svelte.js';
  let { t } = $props();
  const L = t.lec, n = L.length;
  const cur = $derived(S.lec[t.id] ?? { i: 0, a: {}, done: false });
  const i = $derived(Math.min(cur.i, n - 1));
  const lec = $derived(L[i]);
  const chosen = $derived(cur.a[lec.id]);
  const answered = $derived(L.filter(l => cur.a[l.id] != null).length);
  const right = $derived(L.filter(l => cur.a[l.id] != null && cur.a[l.id] === l.check?.a).length);
  const ensure = () => (S.lec[t.id] ??= { i: 0, a: {}, done: false });
  function pick(k) {
    if (chosen != null) return;
    ensure(); S.lec[t.id].a[lec.id] = k; save();
  }
  function move(d) {
    ensure(); S.lec[t.id].i = Math.max(0, Math.min(n - 1, i + d)); save(); scrollTo(0, 0);
  }
  function finish() { ensure(); S.lec[t.id].done = true; save(); scrollTo(0, 0) }
  function again() { S.lec[t.id] = { i: 0, a: {}, done: false }; save(); scrollTo(0, 0) }
</script>

<div class="lec">
  <div class="row" style="justify-content:space-between"><span class="mute small">Lecture {i + 1} of {n}</span><span class="small mute">{answered} of {n} checks answered · {right} right</span></div>
  <div class="bar" style="margin:8px 0 22px"><i style="width:{pct(cur.done ? n : i + (chosen != null ? 1 : 0), n)}%"></i></div>

  {#if cur.done}
    <div class="ans">
      <h2>Topic finished</h2>
      <p>You went through all {n} lectures and answered {right} of {n} checks correctly. Re-check any you got wrong before you move on.</p>
      <ul>{#each L as l, k}<li>{k + 1}. {l.title} · {cur.a[l.id] === l.check.a ? 'right' : 'wrong or skipped'}</li>{/each}</ul>
    </div>
    <div class="row sec">
      <button class="btn dark" onclick={() => (ui.tab = 'quiz')}>Take the quiz ({t.qs.length})</button>
      <button class="btn" onclick={() => (ui.tab = 'written')}>Written practice ({t.ws.length})</button>
      <button class="btn" onclick={again}>Start the lectures again</button>
    </div>
  {:else}
    <h2>{lec.title}</h2>
    <div class="ans lecbody">{@html md(lec.body)}</div>

    <div class="check sec">
      <h3>Check</h3>
      <div class="qt">{@html md(lec.check.q)}</div>
      <div class="opts">{#each lec.check.o as o, k}{@const c = chosen == null ? '' : k === lec.check.a ? 'right' : k === chosen ? 'wrong' : ''}
        <button class="opt {c}" class:sel={chosen === k && c === ''} disabled={chosen != null} onclick={() => pick(k)}><span class="k">{'ABCDEF'[k]}</span><span>{@html inl(o)}</span><span aria-hidden="true">{c === 'right' ? '✓' : c === 'wrong' ? '✗' : ''}</span></button>
      {/each}</div>
      {#if chosen != null}
        <div class="fb" class:no={chosen !== lec.check.a} style="margin-top:14px"><b>{chosen === lec.check.a ? 'Correct.' : 'Not quite.'}</b> {lec.check.e}</div>
      {/if}
    </div>

    <div class="row sec" style="justify-content:space-between">
      <button class="btn" disabled={i === 0} onclick={() => move(-1)}>← Previous</button>
      {#if i < n - 1}
        <button class="btn dark" disabled={chosen == null} onclick={() => move(1)}>{chosen == null ? 'Answer the check to continue' : 'Next lecture →'}</button>
      {:else}
        <button class="btn dark" disabled={chosen == null} onclick={finish}>{chosen == null ? 'Answer the check to finish' : 'Finish the topic'}</button>
      {/if}
    </div>
    <p class="mute small" style="margin-top:14px">Lecture list: {#each L as l, k}<button class="linkish" class:cur={k === i} onclick={() => { ensure(); S.lec[t.id].i = k; save(); scrollTo(0, 0) }}>{k + 1}</button>{' '}{/each}· you can revisit any lecture.</p>
  {/if}
</div>

<style>
  .check{border-top:1.5px solid var(--line);padding-top:18px}
  .qt :global(p){margin:0 0 12px}
  .linkish{border:1.5px solid var(--line);background:var(--bg);border-radius:8px;min-width:32px;min-height:32px;cursor:pointer;font:inherit;padding:0 8px}
  .linkish.cur{border-color:var(--g2);font-weight:700}
</style>
