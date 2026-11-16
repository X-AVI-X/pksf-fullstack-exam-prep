<script>
  import { WM, ALLW } from '../lib/bank.js';
  import { S, save, saveSoon, go } from '../lib/state.svelte.js';
  import { score } from '../lib/formats.js';
  import Editor from './Editor.svelte'; import Marker from './Marker.svelte';
  let { id } = $props();
  const q = WM[id]; // component is keyed by id in App
  if (!q) go('write');
  let ans = $state(S.wd[id] ?? ''), phase = $state('write'), marks = $state(null);
  const sc = $derived(q ? score(q, marks || []) : { got: 0, max: 0 });
  const last = S.w[id];
  function record() { S.w[id] = { s: sc.got, m: sc.max, d: Date.now() }; delete S.wd[id]; save(); phase = 'done' }
  function nextSame() { const p = ALLW.filter(w => w.type === q.type && w.id !== id); go('w-' + p[Math.floor(Math.random() * p.length)].id) }
</script>
{#if q}
<section class="band"><div class="qwrap">
  <a href="#write" class="mute" style="text-decoration:none">← Written practice</a>
  {#if last}<p class="mute small">Last attempt: {last.s} / {last.m}</p>{/if}
  {#if phase === 'write'}
    <Editor {q} bind:value={ans} oninput={() => { S.wd[id] = ans; saveSoon() }} />
    <div class="qnav"><button class="btn" onclick={() => history.back()}>Back</button><button class="btn dark" onclick={() => (phase = 'mark')}>Submit and mark</button></div>
  {:else}
    <div class="qhead"><b>{q.q}</b></div>
    <Marker {q} answer={ans} bind:marks />
    <div class="qnav"><button class="btn" onclick={() => (phase = 'write')}>Edit answer</button>
      {#if phase === 'done'}<button class="btn dark" onclick={nextSame}>Another question of this format →</button>
      {:else}<button class="btn dark" disabled={marks?.some(x => x === null)} onclick={record}>Save score</button>{/if}</div>
  {/if}
</div></section>
{/if}
