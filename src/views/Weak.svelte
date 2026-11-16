<script>
  import { TM, ALLQ, ALLW, shuffle, inl } from '../lib/bank.js';
  import { F } from '../lib/formats.js';
  import { S, ui, save, start, wrongs, ask } from '../lib/state.svelte.js';
  import Resume from './Resume.svelte';
  const w = $derived(wrongs()), untried = $derived(ALLQ.filter(q => !(q.id in S.q)));
  const by = $derived(w.reduce((m, q) => ((m[q.topic] ??= []).push(q), m), {}));
  const lowW = $derived(ALLW.filter(x => S.w[x.id] && S.w[x.id].s < S.w[x.id].m * 0.6));
  const reset = () => ask('Erase all saved progress?', () => { Object.assign(S, { q: {}, f: {}, mocks: [], w: {}, wd: {}, wx: null, wxh: [] }); ui.deck = null; save() });
</script>

<section class="band green"><div class="wrap"><Resume /><h1>Weak spots</h1><p class="mute">Every question you got wrong last time lands here until you answer it correctly.</p>
  <div class="row" style="margin-top:14px"><button class="btn pri" disabled={!w.length} onclick={() => start(shuffle(w), 'practice', 'Weak spots', 0)}>Practise all {w.length}</button>{#if untried.length}<button class="btn ghost" onclick={() => start(shuffle(untried), 'practice', 'Never-tried questions', 0)}>Practise {untried.length} never-tried</button>{/if}</div></div></section>
<section class="band"><div class="wrap">
  {#if w.length}<div class="grid">{#each Object.entries(by) as [k, qs]}<div class="card"><h3>{TM[k].name}</h3><div class="meta mute"><span>{qs.length} wrong</span></div><button class="btn dark" onclick={() => start(shuffle(qs), 'practice', TM[k].name + ' weak spots', 0)}>Practise these</button></div>{/each}</div>
  {:else}<p class="empty mute">No weak spots recorded yet. Take a quiz or a mock exam and any misses will show up here.</p>{/if}
  {#if lowW.length}<h2 class="sec">Written answers below 60% ({lowW.length})</h2>{#each lowW as x}<a class="rv wl no" href="#w-{x.id}"><span class="row small"><span class="tag">{F[x.type].n}</span><b>Last: {S.w[x.id].s}/{S.w[x.id].m}</b><span class="mute">{TM[x.topic].name}</span></span><span class="qt">{@html inl(x.q)}</span></a>{/each}{/if}
  <div class="sec"><h3>Reset</h3><p class="mute">Clear all saved progress in this browser.</p><button class="btn" onclick={reset}>Reset progress</button></div>
</div></section>
