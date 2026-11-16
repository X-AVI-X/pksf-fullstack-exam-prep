<script>
  // Exam-style answer editor: prompt, format and marks, structure tip, and a textarea that keeps indentation.
  import { TM, md } from '../lib/bank.js';
  import { F, CODEY } from '../lib/formats.js';
  let { q, value = $bindable(''), oninput = () => {}, n = '' } = $props();
  const words = $derived((value.trim().match(/\S+/g) || []).length);
  function key(e) {
    if (e.key !== 'Tab') return; e.preventDefault();
    const t = e.target, s = t.selectionStart; value = value.slice(0, s) + '  ' + value.slice(t.selectionEnd);
    requestAnimationFrame(() => t.selectionStart = t.selectionEnd = s + 2); oninput();
  }
</script>
<div class="qhead"><span class="row"><span class="tag">{F[q.type].n}</span><span class="chip">{q.marks} marks</span>{#if n}<span class="chip">{n}</span>{/if}</span><span class="chip mute">{TM[q.topic].name}</span></div>
<div class="qtext">{@html md(q.q)}</div>
<details class="tip"><summary>How to structure this answer</summary><p>{F[q.type].tip}</p></details>
<textarea class="ed" class:code={CODEY.has(q.type)} bind:value oninput={() => oninput()} onkeydown={key} spellcheck={!CODEY.has(q.type)} aria-label="Your answer" placeholder="Write your answer as you would on the exam paper…"></textarea>
<p class="mute small">{words} words · Tab inserts two spaces</p>
