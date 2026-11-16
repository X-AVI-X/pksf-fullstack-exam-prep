<script>
  // Transparent rubric marking: you award each point full/half/none against the answer key.
  // Detected terms are hints only and never set marks.
  import { md } from '../lib/bank.js';
  import { F, rubricOf, terms, has, score } from '../lib/formats.js';
  let { q, answer = '', marks = $bindable(), onchange = () => {}, paper = false } = $props();
  const R = rubricOf(q), T = terms(q.a);
  if (!marks || marks.length !== R.length) marks = R.map(() => null);
  const sc = $derived(score(q, marks)), done = $derived(marks.every(x => x !== null));
  const miss = $derived(R.filter((_, i) => marks[i] !== null && marks[i] < 1));
  const set = (i, v) => { marks[i] = v; onchange() };
</script>
<div class="cols">
  <div><h3>Your answer</h3>{#if paper}<p class="fb">Answered on paper. Put your sheet next to the model answer and mark each point below.</p>{:else}<pre class="mine">{answer.trim() || '(blank)'}</pre>{/if}</div>
  <div><h3>Model answer <span class="tag ok">Answer key{q.verified ? ' · executed and verified' : ''}</span></h3><div class="ans">{@html md(q.a)}</div></div>
</div>
<h3 class="sec">Rubric <span class="tag">{q.rubric.length ? 'Question-specific rubric' : `Generic rubric · ${F[q.type].n}`}</span></h3>
{#if !q.rubric.length}<p class="mute small">This question has no specific rubric yet. Judge each criterion against the model answer above.</p>{/if}
<div class="rub">
  {#each R as p, i}
    <div class="rp" class:full={marks[i] === 1} class:part={marks[i] === 0.5} class:none={marks[i] === 0}>
      <div><b>{p.t}</b>{#if p.kw.length}<div class="small">{#each p.kw as k}<span class="kw" class:hit={has(answer, k)}>{k}</span>{/each}</div>{/if}</div>
      <div class="seg" role="group" aria-label="Marks for: {p.t}">
        {#each [[1, `Full ${p.m}`], [0.5, 'Half'], [0, 'None']] as [v, l]}<button class:on={marks[i] === v} onclick={() => set(i, v)}>{l}</button>{/each}
      </div>
    </div>
  {/each}
</div>
{#if T.length}<p class="small">Key terms in the model answer: {#each T as t}<span class="kw" class:hit={has(answer, t)}>{t}</span>{/each}</p>{/if}
{#if !paper}<p class="mute small">Highlighted terms appear in your answer. This is a hint only: an answer can name every term and still be wrong, so mark it on meaning.</p>{/if}
<div class="fb" class:no={done && sc.got < sc.max * 0.6}><b class="v">{sc.got} / {sc.max} marks{done ? '' : ' so far: mark every point'}</b>
  {#if done && miss.length}<p>Missing or partial concepts:</p><ul>{#each miss as p}<li>{p.t}</li>{/each}</ul>{/if}</div>
