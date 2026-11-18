<script>
  import { ALLW, TM, GROUPS, pct, inl } from '../lib/bank.js';
  import { S, ui, go } from '../lib/state.svelte.js';
  import { F } from '../lib/formats.js';
  import Resume from './Resume.svelte';
  const types = Object.keys(F).filter(k => k !== 'mcq');
  let f = $state(ui.wf ?? 'all'), g = $state(ui.wg ?? 'all'), st = $state(ui.ws ?? 'all');
  const list = $derived(ALLW.filter(w => (f === 'all' || w.type === f) && (g === 'all' || TM[w.topic].group === g) && (st === 'all' || (st === 'new' ? !S.w[w.id] : S.w[w.id] && S.w[w.id].s < S.w[w.id].m * 0.8))));
  const done = $derived(ALLW.filter(w => S.w[w.id])), avg = $derived(pct(done.reduce((s, w) => s + S.w[w.id].s, 0), done.reduce((s, w) => s + S.w[w.id].m, 0)));
  const rnd = () => list.length && go('w-' + list[Math.floor(Math.random() * list.length)].id);
  $effect(() => { ui.wf = f; ui.wg = g; ui.ws = st });
</script>
<section class="band green"><div class="wrap"><Resume /><h1>Written practice</h1>
  <p class="mute">Write the answer yourself in an exam-style editor, then mark it against the answer key with a transparent rubric. {done.length} of {ALLW.length} attempted{done.length ? `, average ${avg}%` : ''}.</p>
  <div class="row" style="margin-top:14px">
    <select bind:value={f} aria-label="Format"><option value="all">All formats</option>{#each types as t}<option value={t}>{F[t].n} ({ALLW.filter(w => w.type === t).length})</option>{/each}</select>
    <select bind:value={g} aria-label="Curriculum"><option value="all">All topics</option>{#each Object.entries(GROUPS) as [k, l]}<option value={k}>{l.split(' (')[0]}</option>{/each}</select>
    <select bind:value={st} aria-label="Status"><option value="all">Any status</option><option value="new">Not attempted yet</option><option value="low">Scored below 80%</option></select>
    <button class="btn pri" onclick={rnd} disabled={!list.length}>Random question</button><a class="btn ghost" href="#wexam">Timed written exam</a>
  </div></div></section>
<section class="band"><div class="wrap">
  {#each list as w}{@const r = S.w[w.id]}
    <a class="rv wl" class:ok={r && r.s >= r.m * 0.8} class:no={r && r.s < r.m * 0.6} href="#w-{w.id}">
      <span class="row small"><span class="tag">{F[w.type].n}</span><span>{w.marks} marks</span><span class="mute">{TM[w.topic].name}</span>{#if w.rubric.length}<span class="tag ok">Specific rubric</span>{/if}{#if r}<b>Last: {r.s}/{r.m}</b>{/if}</span>
      <span class="qt">{@html inl(w.q)}</span></a>
  {:else}<p class="empty mute">No questions match these filters.</p>{/each}
</div></section>
