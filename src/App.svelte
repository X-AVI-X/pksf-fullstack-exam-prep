<script>
  import { ui, S } from './lib/state.svelte.js'; import { TM } from './lib/bank.js';
  import Home from './views/Home.svelte'; import Topic from './views/Topic.svelte'; import Quiz from './views/Quiz.svelte';
  import Mock from './views/Mock.svelte'; import Write from './views/Write.svelte'; import WriteHub from './views/WriteHub.svelte'; import WExam from './views/WExam.svelte'; import Guide from './views/Guide.svelte'; import Cards from './views/Cards.svelte'; import Weak from './views/Weak.svelte'; import Gov from './views/Gov.svelte';
  const isNew = !Object.keys(S.q).length && !S.mocks.length && !Object.keys(S.w).length;
  const cur = () => location.hash.slice(1) || (isNew ? 'guide' : 'home'); // first visit lands on the guide
  let h = $state(cur());
  addEventListener('hashchange', () => { const n = cur(); if (n.startsWith('t-') && n !== h && h !== 'quiz') ui.tab = TM[n.slice(2)]?.tut ? 'tut' : 'quiz'; h = n; if (n !== 'quiz') scrollTo(0, 0) });
  const nav = [['guide', 'Start here'], ['home', 'Topics'], ['gov', 'Govt-exam patterns'], ['write', 'Written practice'], ['wexam', 'Written exam'], ['mock', 'MCQ mock'], ['cards', 'Flashcards'], ['weak', 'Weak spots']];
  const close = yes => { const c = ui.confirm; ui.confirm = null; if (yes) c.yes() };
</script>

<header class="top"><div class="wrap">
  <a class="brand" href="#home"><i></i>PKSF Full-stack Prep</a>
  <nav class="nav">{#each nav as [v, l]}<a href="#{v}" class:on={h === v || (v === 'home' && h.startsWith('t-') && TM[h.slice(2)]?.group !== 'gov') || (v === 'gov' && h.startsWith('t-') && TM[h.slice(2)]?.group === 'gov') || (v === 'write' && h.startsWith('w-'))}>{l}</a>{/each}</nav>
</div></header>
<main>
  {#if h === 'quiz'}<Quiz />{:else if h === 'mock'}<Mock />{:else if h === 'cards'}<Cards />{:else if h === 'weak'}<Weak />{:else if h === 'write'}<WriteHub />{:else if h === 'wexam'}<WExam />{:else if h === 'guide'}<Guide />{:else if h === 'gov'}<Gov />
  {:else if h.startsWith('w-')}{#key h}<Write id={h.slice(2)} />{/key}
  {:else if h.startsWith('t-')}{#key h}<Topic id={h.slice(2)} />{/key}{:else}<Home />{/if}
</main>
<div class="foot"><div class="wrap mute">Built from the PKSF ToR for Software Engineer Full-stack. Practice material, not the actual exam paper. Progress is saved in this browser only.</div></div>

{#if ui.confirm}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="modal" onclick={e => e.target === e.currentTarget && close(false)}>
    <div role="dialog" aria-modal="true"><h3>{ui.confirm.msg}</h3>
      <div class="row" style="margin-top:18px;justify-content:flex-end">
        <button class="btn" onclick={() => close(false)}>Cancel</button>
        <!-- svelte-ignore a11y_autofocus --><button class="btn dark" autofocus onclick={() => close(true)}>Yes</button>
      </div></div></div>
{/if}
<svelte:window onkeydown={e => ui.confirm && e.key === 'Escape' && close(false)} />
