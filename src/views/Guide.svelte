<script>
  // Start-here study guide: next step from progress, phase plan from the exam date, daily routine, priorities, technique.
  import { TOPICS, ALLQ, ALLW, TM, pct } from '../lib/bank.js';
  import { S, ui, save, go, mastered, wrongs } from '../lib/state.svelte.js';
  import { F } from '../lib/formats.js';
  const day = 86400000, today = new Date(new Date().toDateString()).getTime();
  const left = $derived(S.exam ? Math.round((new Date(S.exam).getTime() - today) / day) : null);
  const fmtD = t => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const tried = $derived(ALLQ.filter(q => q.id in S.q).length), wTried = $derived(ALLW.filter(w => S.w[w.id]).length);
  const weakT = $derived(TOPICS.filter(t => t.group === 'tor').map(t => [t, pct(mastered(t), t.qs.length)]).sort((a, b) => a[1] - b[1])[0]);
  const fmtAvg = $derived(Object.keys(F).filter(k => k !== 'mcq').map(k => { const ws = ALLW.filter(w => w.type === k && S.w[w.id]); return [k, ws.length, pct(ws.reduce((s, w) => s + S.w[w.id].s, 0), ws.reduce((s, w) => s + S.w[w.id].m, 0))] }));
  const drill = k => { ui.wf = k; ui.wg = 'all'; go('write') };
  const next = $derived.by(() => {
    if (!S.mocks.length) return ['Take a diagnostic MCQ mock', '50 questions across all topics, 1 minute each. It shows where you stand before you study anything.', () => go('mock')];
    if (!S.wxh.length) return ['Sit a short timed written exam', 'Set 60 minutes, 10 MCQs and 4 written questions, and turn on paper mode. Mark it honestly with the rubrics.', () => go('wexam')];
    const fresh = fmtAvg.find(([k, n]) => ['sql', 'output', 'bug'].includes(k) && n < 3);
    if (fresh) return [`Practise ${F[fresh[0]].n}`, 'These formats are the most likely to come up and the easiest to score fully. Do at least 3 of each.', () => drill(fresh[0])];
    if (wrongs().length >= 10) return [`Clear ${wrongs().length} weak spots`, 'Re-answer every MCQ you got wrong until the list is empty.', () => go('weak')];
    const lowF = fmtAvg.filter(([, n]) => n).sort((a, b) => a[2] - b[2])[0];
    if (lowF && lowF[2] < 70) return [`Improve ${F[lowF[0]].n} (average ${lowF[2]}%)`, 'Your weakest written format. Read two model answers, then write two fresh answers.', () => drill(lowF[0])];
    if (weakT && weakT[1] < 80) return [`Study ${weakT[0].name} (${weakT[1]}% mastered)`, 'Read the cheat sheet, then take the topic quiz until you reach 80% or more.', () => go('t-' + weakT[0].id)];
    return ['Sit a full paper on paper mode', 'You are covering the ground. Now build speed: a full timed paper by hand, then mark it.', () => go('wexam')];
  });
  const phases = $derived.by(() => {
    if (left == null || left < 1) return [];
    const d = left, p = [['Diagnose', 1], ['Build: ToR core', Math.max(1, Math.round(d * .45))], ['Practise full papers', Math.max(1, Math.round(d * .35))], ['Final revision', 0]];
    p[3][1] = Math.max(1, d - p[0][1] - p[1][1] - p[2][1]); if (d <= 4) return [['Final revision: weak spots, cheat sheets, one paper', d]];
    let t = today; return p.map(([n, len]) => { const r = [n, len, fmtD(t), fmtD(t + (len - 1) * day)]; t += len * day; return r });
  });
</script>

<section class="band green"><div class="wrap"><h1>Start here</h1>
  <p class="mute">The exam is <b>written</b>. Recognising the right option is not enough: you need to reproduce correct SQL, code and explanations from memory, under time pressure. Follow the steps below in order.</p>
  <div class="card next"><span class="tag ok">Your next step</span><h2>{next[0]}</h2><p>{next[1]}</p><button class="btn pri" onclick={next[2]}>Go</button>
    <p class="mute small">So far: {tried} of {ALLQ.length} MCQs tried, {wTried} of {ALLW.length} written questions answered, {S.wxh.length} written exams sat.</p></div>
</div></section>

<section class="band"><div class="qwrap">
  <h2>1. Set your exam date</h2>
  <div class="row" style="margin-top:10px"><input type="date" aria-label="Exam date" value={S.exam ?? ''} onchange={e => { S.exam = e.target.value || null; save() }} />
    {#if left != null}<b>{left > 0 ? `${left} days left` : left === 0 ? 'Exam is today' : 'Exam date has passed'}</b>{/if}</div>
  {#if phases.length}
    <div class="tbl"><table><thead><tr><th>Phase</th><th>Days</th><th>Dates</th></tr></thead><tbody>
      {#each phases as [n, len, a, b]}<tr><td>{n}</td><td>{len}</td><td>{a}{len > 1 ? ` – ${b}` : ''}</td></tr>{/each}</tbody></table></div>
  {:else if left == null}<p class="mute small">Your admit card has the date. The plan below sizes itself to the days left.</p>{/if}

  <h2 class="sec">2. The four phases</h2>
  <ol class="ans">
    <li><b>Diagnose (day 1).</b> One <a href="#mock">50-question MCQ mock</a> and one <a href="#wexam">60-minute written exam</a> in paper mode. Don't study first: you want an honest baseline.</li>
    <li><b>Build the ToR core.</b> Work through the ToR topics in the priority order below. For each one, read the cheat sheet, take the topic quiz, then write 2–3 of its written questions in <a href="#write">Written practice</a>.</li>
    <li><b>Practise full papers.</b> Every 2–3 days, sit a full <a href="#wexam">timed written exam</a> by hand (paper mode), mark it strictly, and re-practise every concept in the "Concepts to fix" list.</li>
    <li><b>Final revision (last 2–3 days).</b> No new material. <a href="#weak">Weak spots</a>, cheat sheets, <a href="#cards">flashcards</a>, and one last paper two days before the exam. Sleep well the night before.</li>
  </ol>

  <h2 class="sec">3. Practising questions is not enough</h2>
  <div class="fb no"><b class="v">This question bank is a sample written from the ToR, not the real paper.</b>
    <p>Examiners will word questions differently and go deeper inside a topic. Memorised answers break on a reworded question; understanding doesn't. SQL, Java and JavaScript answer keys were executed; the others were written carefully but not run, so check anything surprising against the official docs.</p></div>
  <div class="tbl"><table><thead><tr><th>Add this</th><th>Why</th><th>How</th></tr></thead><tbody>
    <tr><td><b>Understand, then practise</b></td><td>Survives reworded questions</td><td>Cheat sheet → the matching section of the official docs (below) → then the questions</td></tr>
    <tr><td><b>Run everything you write</b></td><td>Turns recall into skill</td><td>Every SQL answer in a local PostgreSQL; every Java output question in <code>jshell</code>; break code on purpose and predict the error</td></tr>
    <tr><td><b>Build one small project</b></td><td>Covers most of the ToR, becomes your GitHub portfolio (the ToR prefers one) and your viva story</td><td>Spring Boot + JPA + PostgreSQL + Keycloak login + a React or Angular page + tests + Dockerfile, docker-compose and README. Even a 3–5 day minimal version counts.</td></tr>
    <tr><td><b>Explain aloud</b></td><td>Exposes vague understanding; trains for the viva that usually follows the written exam</td><td>Two concepts a day, 2 minutes each, no notes. Where you stumble is what to study next.</td></tr>
    <tr><td><b>Handwrite under time</b></td><td>The real exam is pen and paper</td><td>At least 3 full papers in paper mode, timed, with neat SQL, code and diagrams</td></tr>
    <tr><td><b>Spaced repetition</b></td><td>Unreviewed material fades within days</td><td>Weak spots and flashcards daily; redo written questions after 3 and 7 days</td></tr>
    <tr><td><b>Similar papers</b></td><td>Shows question styles this bank lacks</td><td>Ask people who sat IT-post written exams at Bangladeshi public bodies and banks; mark yourself with the same rubric method</td></tr>
    <tr><td><b>Logistics and health</b></td><td>Easy marks are lost otherwise</td><td>Read the admit card instructions, know the centre and timing, no new material in the last 2 days, sleep 7+ hours before the exam</td></tr>
  </tbody></table></div>
  <p><b>Daily time split:</b> 50% written practice and papers in this app · 25% hands-on (running code, the mini project) · 15% official docs for what you got wrong · 10% explaining aloud and review.</p>
  <h3 class="sec">Official sources: read one section per topic, not cover to cover</h3>
  <ul class="ans">
    <li><b>Java:</b> <i>Effective Java</i> (Bloch); <a href="https://dev.java/learn/" target="_blank" rel="noopener">dev.java/learn</a></li>
    <li><b>Spring:</b> <a href="https://docs.spring.io/spring-boot/" target="_blank" rel="noopener">Spring Boot</a>, <a href="https://docs.spring.io/spring-data/jpa/reference/" target="_blank" rel="noopener">Spring Data JPA</a> and <a href="https://docs.spring.io/spring-security/reference/" target="_blank" rel="noopener">Spring Security</a> reference docs</li>
    <li><b>SQL:</b> <a href="https://www.postgresql.org/docs/current/" target="_blank" rel="noopener">PostgreSQL docs</a>: tutorial, window functions, indexes, EXPLAIN</li>
    <li><b>Frontend:</b> <a href="https://react.dev/learn" target="_blank" rel="noopener">react.dev/learn</a>, <a href="https://angular.dev/tutorials" target="_blank" rel="noopener">angular.dev</a>, <a href="https://m3.material.io/" target="_blank" rel="noopener">Material Design</a></li>
    <li><b>Auth:</b> <a href="https://www.keycloak.org/guides" target="_blank" rel="noopener">Keycloak guides</a>, <a href="https://oauth.net/2/" target="_blank" rel="noopener">oauth.net/2</a></li>
    <li><b>DevOps:</b> <a href="https://docs.docker.com/get-started/" target="_blank" rel="noopener">Docker get-started</a>, <a href="https://kubernetes.io/docs/concepts/" target="_blank" rel="noopener">Kubernetes concepts</a></li>
    <li><b>Security:</b> <a href="https://owasp.org/Top10/" target="_blank" rel="noopener">OWASP Top 10</a>, <a href="https://cheatsheetseries.owasp.org/" target="_blank" rel="noopener">OWASP Cheat Sheet Series</a></li>
  </ul>
  <p class="mute small">Bottom line: this app gives you structure, coverage and a way to measure yourself. Understanding, hands-on practice and timed handwriting let you answer the questions it never asked. Nobody can guarantee full marks; this combination is your best realistic chance.</p>

  <h2 class="sec">4. Daily routine (about 2½ hours)</h2>
  <div class="tbl"><table><thead><tr><th>Time</th><th>Task</th><th>Where</th></tr></thead><tbody>
    <tr><td>15 min</td><td>Read one topic's cheat sheet</td><td>Topic → Cheat sheet</td></tr>
    <tr><td>25 min</td><td>20 MCQs on that topic, or a 25-question mock</td><td>Topic quiz / MCQ mock</td></tr>
    <tr><td>60 min</td><td>3 written questions: 1 SQL, 1 Java output or bug, 1 rotating format. Write first, then mark.</td><td>Written practice</td></tr>
    <tr><td>30 min</td><td>One descriptive, design or architecture answer on paper, with a diagram</td><td>Written practice</td></tr>
    <tr><td>20 min</td><td>Clear today's weak spots and 10 flashcards</td><td>Weak spots, Flashcards</td></tr>
  </tbody></table></div>

  <h2 class="sec">5. Priority order</h2>
  <p class="mute small">Highest yield first: formats that appear in most software engineer written exams and that you can score fully.</p>
  <ol class="ans">
    <li><button class="lnk" onclick={() => drill('sql')}>Write SQL</button>: joins, GROUP BY/HAVING, window functions, subqueries. Expect at least one.</li>
    <li><button class="lnk" onclick={() => drill('output')}>Predict the output</button> and <button class="lnk" onclick={() => drill('bug')}>Find the error</button>: Java core traps (String pool, Integer cache, overloading, finally).</li>
    <li><button class="lnk" onclick={() => drill('code')}>Write a program</button>: short Java/JS methods; always state the complexity.</li>
    <li>ToR stack concepts: <a href="#t-spring">Spring Boot</a>, <a href="#t-jpa">JPA</a>, <a href="#t-sec">Security & SSO</a>, <a href="#t-api">REST/SOAP & microservices</a>, <a href="#t-react">React</a> / <a href="#t-ng">Angular</a>.</li>
    <li><button class="lnk" onclick={() => drill('schema')}>Schema design</button> and <button class="lnk" onclick={() => drill('arch')}>architecture</button>: practise drawing boxes and tables neatly on paper.</li>
    <li>DevOps and operations: <a href="#t-devops">Docker, K8s & CI/CD</a>, <a href="#t-obs">Observability & async</a>, <button class="lnk" onclick={() => drill('scenario')}>troubleshooting scenarios</button>.</li>
    <li><a href="#gov">Government-exam patterns</a>: one pattern a day in the build phase. Read its tutorial, then write its questions. They show how Bangladeshi IT recruitment papers ask the ToR topics.</li>
  </ol>

  <h2 class="sec">6. How each section works</h2>
  <ul class="ans">
    <li><b>Topics:</b> each has a quiz, its written questions and a one-page cheat sheet. ToR topics come first; the <a href="#gov">government-exam patterns</a> add a tutorial tab and show how recruitment papers phrase these topics. Subjects outside the ToR (OS, networking, DSA theory) are left out on purpose.</li>
    <li><b>Written practice:</b> pick a question, write your answer, press <i>Submit and mark</i>, then award each rubric point full, half or none against the model answer. Be strict; the score is only useful if it's honest.</li>
    <li><b>Written exam:</b> a timed mixed paper. Use <b>paper mode</b> to print it and write by hand, just like the real exam.</li>
    <li><b>MCQ mock, Flashcards, Weak spots:</b> fast recall drills. Anything you get wrong goes to Weak spots until you answer it correctly.</li>
  </ul>

  <h2 class="sec">7. Exam-day technique</h2>
  <ul class="ans">
    <li><b>Budget time by marks:</b> minutes per mark = total minutes ÷ total marks. Don't give a 2-mark question ten minutes.</li>
    <li><b>Answer what you know best first</b>, numbering answers exactly as on the paper.</li>
    <li><b>Structure:</b> definition → how it works → example → trade-off. For a compare question, use a table. For design questions, draw a diagram first.</li>
    <li><b>SQL and code:</b> write neatly, one clause per line, and state your assumptions. A short comment explaining the idea earns partial credit even if the syntax slips.</li>
    <li><b>Never leave a question blank:</b> key terms and a correct outline earn partial marks.</li>
  </ul>
</div></section>
