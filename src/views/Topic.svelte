<script>
  import { TM, GTAG, pct, md, inl, shuffle } from '../lib/bank.js';
  import { F } from '../lib/formats.js';
  import { S, ui, mastered, start, go } from '../lib/state.svelte.js';
  import Resume from './Resume.svelte';
  let { id } = $props();
  const t = TM[id]; if (!t) go('home');
  const m = $derived(t ? mastered(t) : 0), un = $derived(t ? t.qs.filter(q => S.q[q.id] !== 1) : []);
  const st = q => S.q[q.id] === 1 ? ['ok', 'Mastered'] : S.q[q.id] === 0 ? ['no', 'Answered wrong last time'] : ['', 'Not attempted'];
</script>

{#if t}
<section class="band green"><div class="wrap"><Resume /><a href={t.group === 'gov' ? '#gov' : '#home'} class="mute" style="text-decoration:none">← {t.group === 'gov' ? 'All exam patterns' : 'All topics'}</a>
  <h1 style="margin-top:10px">{t.name}</h1><p class="mute">{t.blurb} · <span class="tag">{GTAG[t.group]}</span></p>
  <div class="row" style="max-width:520px"><div class="bar" style="flex:1"><i style="width:{pct(m, t.qs.length)}%"></i></div><b>{m} / {t.qs.length}</b></div>
  <div class="tabs" role="tablist">{#each [...(t.tut ? [['tut', 'Tutorial']] : []), ['quiz', `Quiz (${t.qs.length})`], ['written', `Written (${t.ws.length})`], ['cheat', 'Cheat sheet']] as [k, l]}<button role="tab" aria-selected={ui.tab === k} class:on={ui.tab === k} onclick={() => (ui.tab = k)}>{l}</button>{/each}</div>
</div></section>
<section class="band"><div class="wrap">
  {#if ui.tab === 'tut' && t.tut}
    <div class="ans tut">{@html md(t.tut)}</div>
    <div class="row sec"><button class="btn dark" onclick={() => (ui.tab = 'written')}>Practise the written questions ({t.ws.length})</button><button class="btn" onclick={() => (ui.tab = 'quiz')}>Take the quiz ({t.qs.length})</button></div>
  {:else if ui.tab === 'quiz' || ui.tab === 'tut'}
    <h2>Practice quiz</h2><p class="mute">Instant feedback and an explanation after every answer. Options are shuffled each time.</p>
    <div class="row" style="margin-top:14px"><button class="btn dark" onclick={() => start(shuffle(t.qs), 'practice', t.name + ' practice', 0)}>All {t.qs.length} questions</button><button class="btn" disabled={!un.length} onclick={() => start(shuffle(un), 'practice', t.name + ' practice', 0)}>Only not-yet-mastered ({un.length})</button></div>
    <div class="sec"><h3>Question list</h3>{#each t.qs as q, i}{@const [c, l] = st(q)}<div class="rv {c}"><div class="qt">{@html md(i + 1 + '. ' + q.q)}</div><div class="l mute">{l}</div></div>{/each}</div>
  {:else if ui.tab === 'written'}
    <h2>Written questions</h2><p class="mute">Write each answer yourself first: open it in the editor and mark it with the rubric. Use the expander only for quick revision.</p>
    {#each t.ws as w}{@const r = S.w[w.id]}<details class="w"><summary><span><span class="tag">{F[w.type].n}</span> <span class="mute small">{w.marks} marks{r ? ` · last ${r.s}/${r.m}` : ''}</span><br>{@html inl(w.q)}</span></summary><div class="ans"><p><a class="btn dark" href="#w-{w.id}">Write the answer in the editor</a></p>{@html md(w.a)}</div></details>{/each}
  {:else}
    <h2>Cheat sheet</h2><p class="mute">Read this the night before.</p><ul class="cheat ans" style="margin-top:16px">{#each t.cs as c}<li>{@html inl(c)}</li>{/each}</ul>
  {/if}
</div></section>
{/if}
