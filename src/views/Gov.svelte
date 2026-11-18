<script>
  // Government-exam patterns: how Bangladeshi IT recruitment papers ask the ToR topics, in study order, plus two preset papers.
  import { TM, pct } from '../lib/bank.js';
  import { S, ui, mastered, go } from '../lib/state.svelte.js';
  import Resume from './Resume.svelte';
  // [topic id, how often it appears, where it was seen]
  const P = [
    ['gsql', '1–2 per written paper', 'ICB AP 2026, Combined Bank SO-IT 2025 and 2022, Bangladesh Bank AP 2023 and 2016, 6 Banks AP 2021'],
    ['gjava', '1 per paper', 'Combined Bank SO-IT 2025 (BankAccount), 6 Banks AP 2021 (account hierarchy), Bangladesh Bank AP 2023 (overloading/overriding/hiding), Combined Bank AP 2024 (output)'],
    ['gprog', '1 per paper', 'ICB AMCL AP 2024 (prime, binary search), Bangladesh Bank AP 2023 (LCM), SO-IT 2025 (sum of evens), 6 Banks AP 2021 (brackets), ICB AP 2026 (letter shift)'],
    ['gdb', '1 per paper', 'ICB AMCL AP 2024 (trigger), SO-IT 2025 (ACID), SO-IT 2022 (ER diagram), Bangladesh Bank AP 2016 (integrity rules), SO-IT 2024 (normalisation)'],
    ['gsec', '1 per paper', 'Bangladesh Bank AP 2023 (Diffie-Hellman, CIA), ICB AMCL AP 2024 (RSA), SPCBL 2022 (SQL injection, XSS), SO-IT 2022 (session hijacking), ICB AP 2026 (zero-day)'],
    ['gdiff', '1–2 per paper', 'SO-IT 2025 (SOAP vs REST), ICB AMCL AP 2024 (compiler vs interpreter), Bangladesh Bank AP 2016 (overloading vs overriding), SPCBL 2022'],
    ['gdss', 'Job-specific', 'PKSF vacancy notice: the posts build a nationwide Decision Support System on large-scale data'],
    ['gscen', '1 in recent papers', 'ICB AP 2026 (10k → 80k users without cloud; fast CPU but high latency)'],
    ['gsdlc', '1 per paper or MCQs', 'ICB AMCL AP 2024 (SDLC phases), SO-IT 2024 MCQs (cohesion, boundary values, integration testing, cyclomatic complexity)'],
  ];
  const BP = { gsql: 2, gjava: 1, gprog: 1, gdb: 1, gsec: 1, gdiff: 1, gdss: 1, gscen: 1, gsdlc: 1 };
  let paper = $state(false);
  const busy = $derived(S.wx?.phase === 'run');
  const written = () => { ui.preset = { name: 'Govt-style written paper', min: 180, mcq: 0, bp: BP, paper, neg: false }; go('wexam') };
  const screening = () => { ui.preset = { name: 'Govt-style MCQ screening', min: 50, mcq: 50, wn: 0, bp: {}, grp: 'all', paper: false, neg: true }; go('wexam') };
  const wDone = t => t.ws.filter(w => S.w[w.id]).length;
</script>

<section class="band green"><div class="wrap"><Resume /><h1>Government-exam patterns</h1>
  <p class="mute">No PKSF IT exam paper has ever been published. The closest evidence is about 200 technical questions from 11 Bangladeshi IT recruitment papers (2021–2026: ICB, Bangladesh Bank, combined bank Assistant Programmer and Senior Officer IT). This section keeps only the question patterns that fall inside the PKSF ToR, adds the DSS project from the vacancy notice, and drills each one the way those papers ask it.</p>
  <div class="row" style="margin-top:18px"><button class="btn pri" disabled={busy} onclick={written}>Sit a written paper: 10 × 10 marks, 3 hours</button><button class="btn ghost" disabled={busy} onclick={screening}>MCQ screening: 50 questions, 50 min, −0.25</button></div>
  <label class="row mute" style="margin-top:12px;gap:8px"><input type="checkbox" bind:checked={paper} style="width:18px;height:18px" />Write the written paper by hand (paper mode)</label>
  {#if busy}<p class="mute">Finish or submit the exam in progress first.</p>{/if}
</div></section>

<section class="band"><div class="wrap">
  <h2>Study in this order</h2>
  <p class="mute">For each pattern: work through its lectures (how examiners phrase it, the answer structure that earns full marks, the traps), then write its questions and mark them with the rubric. The written paper above draws 2 SQL questions and 1 from every other pattern.</p>
  <div class="grid" style="margin-top:16px">{#each P as [id, freq, seen], i}{@const t = TM[id]}{#if t}
    <a class="card tcard" href="#t-{id}"><h3>{i + 1}. {t.name}</h3><span class="mute" style="font-size:14px">{t.blurb}</span>
      <span class="small"><b>{freq}</b> · <span class="mute">Seen in: {seen}</span></span>
      <div class="bar"><i style="width:{pct(wDone(t), t.ws.length)}%"></i></div>
      <div class="meta mute"><span>{wDone(t)} / {t.ws.length} written</span><span>{mastered(t)} / {t.qs.length} MCQs</span></div></a>{/if}{/each}</div>

  <div class="sec"><h2>What was left out, and why</h2>
    <p class="mute">Those papers also ask C-language traps, digital logic, computer architecture, OS scheduling and paging, theory of computation, subnetting, discrete maths and AI/ML. None of them is in the PKSF ToR, so they are not drilled here. Data structures appear only as "write a program in Java". The vacancy notice (16 Software Engineer posts, DSS project) points to practical, stack-specific questions.</p></div>
</div></section>
