<script>
  import { TOPICS, ALLQ, pct, shuffle } from '../lib/bank.js';
  import { S, start } from '../lib/state.svelte.js';
  import Resume from './Resume.svelte'; import Lines from './Lines.svelte';
  const max = ALLQ.length, sizes = [...new Set([25, 50, 100, max])].filter(v => v <= max);
  let cnt = $state(sizes[1] ?? max), per = $state('1'), tps = $state(TOPICS.map(t => t.id)), info = $state('');
  function go() {
    if (!tps.length) return (info = 'Pick at least one topic.');
    const pool = ALLQ.filter(q => tps.includes(q.topic)), c = Math.min(cnt, pool.length);
    const buckets = tps.map(id => shuffle(pool.filter(q => q.topic === id))), pick = [];
    while (pick.length < c) for (const b of buckets) if (b.length && pick.length < c) pick.push(b.pop()); // round-robin across topics
    start(shuffle(pick), 'exam', `Mock exam · ${c} questions`, +per ? Math.ceil(c * per) : 0);
  }
</script>

<section class="band green"><div class="wrap"><Resume /><h1>Mock exam</h1><p class="mute">Random questions across the topics you pick, one minute per question, no feedback until you submit, like the real written test.</p></div></section>
<section class="band"><div class="qwrap">
  <h3>Number of questions</h3><div class="opts-set" style="margin-top:10px">{#each sizes as v}<label><input type="radio" bind:group={cnt} value={v} />{v === max ? 'All ' + v : v}</label>{/each}</div>
  <h3 class="sec">Topics</h3><div class="row" style="margin:10px 0"><button class="btn" onclick={() => (tps = TOPICS.map(t => t.id))}>Select all</button><button class="btn" onclick={() => (tps = [])}>Clear</button></div>
  <div class="opts-set">{#each TOPICS as t}<label><input type="checkbox" bind:group={tps} value={t.id} />{t.name}</label>{/each}</div>
  <h3 class="sec">Timer</h3><div class="opts-set" style="margin-top:10px">{#each [['1', '1 min per question'], ['0.6', 'Hard: 36 s per question'], ['0', 'No timer']] as [v, l]}<label><input type="radio" bind:group={per} value={v} />{l}</label>{/each}</div>
  <div class="row sec"><button class="btn dark" onclick={go}>Start mock exam</button><span class="mute">{info}</span></div>
  {#if S.mocks.length}<div class="sec"><h3>Past mocks</h3><Lines rows={S.mocks.slice(-8).reverse().map(m => [new Date(m.d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ` · ${m.s}/${m.n}`, pct(m.s, m.n), pct(m.s, m.n) + '%'])} /></div>{/if}
</div></section>
