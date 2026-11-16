<script>
  import { TOPICS, TM, ALLW, md, inl } from '../lib/bank.js';
  import { S, ui, save, newDeck } from '../lib/state.svelte.js';
  import Resume from './Resume.svelte';
  if (!ui.deck) newDeck();
  const d = $derived(ui.deck), c = $derived(d.list[d.i]), known = $derived(ALLW.filter(w => S.f[w.id] === 1).length);
  const adv = () => { d.i++; d.shown = false };
  const mark = v => { S.f[c.id] = v; if (!v) d.list.push(c); save(); adv(); scrollTo(0, 0) };
</script>

<section class="band green"><div class="wrap"><Resume /><h1>Flashcards</h1><p class="mute">Written, coding and viva questions. Answer aloud or on paper, then reveal the model answer. {known} of {ALLW.length} marked as known.</p>
  <div class="row" style="margin-top:14px"><select aria-label="Deck topic" value={d.t} onchange={e => newDeck(e.target.value, d.unk)}><option value="all">All topics</option>{#each TOPICS as t}<option value={t.id}>{t.name}</option>{/each}</select>
    <label class="row" style="gap:8px;min-height:44px"><input type="checkbox" checked={d.unk} onchange={e => newDeck(d.t, e.target.checked)} style="width:18px;height:18px" />Only cards not yet known</label></div></div></section>
<section class="band"><div class="qwrap">
  {#if c}
    <div class="qhead"><span class="chip">{d.i + 1} / {d.list.length}</span><span class="chip mute">{TM[c.topic].name}</span></div>
    <div class="fc"><div class="q">{@html inl(c.q)}</div>
      {#if d.shown}<div class="ans">{@html md(c.a)}</div><div class="row" style="margin-top:auto"><button class="btn dark" onclick={() => mark(1)}>I knew it</button><button class="btn" onclick={() => mark(0)}>Review again</button></div>
      {:else}<div class="row" style="margin-top:auto"><button class="btn dark" onclick={() => (d.shown = true)}>Show answer</button><button class="btn" onclick={adv}>Skip</button></div>{/if}</div>
  {:else}<div class="empty"><h3>Deck finished</h3><p class="mute">Shuffle again or pick another topic.</p><button class="btn dark" onclick={() => newDeck(d.t, d.unk)}>Shuffle again</button></div>{/if}
</div></section>
