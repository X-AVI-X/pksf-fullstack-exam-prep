# Written exam mode: review of the mentor's spec

## Verdict

The mentor is right about the main point. A written exam rewards **reproducing** answers, not recognising them. The current app has 300 MCQs but only 75 written answers, and those are reveal-and-self-mark flashcards. That is the real gap.

About 70% of the spec is worth building. The rest is either impossible on this setup without a server, or would cost study time for little gain.

## Point by point

| Mentor's ask | Judgment | Why |
|---|---|---|
| 12 question formats | **Yes, as tags, not 12 features** | Most are the same mechanic (prompt → write → compare). Only two editors are needed: prose and code (monospace, keeps indentation). Tag each question with its format so you can drill one, such as "SQL writing". |
| Model answer, rubric, partial credit, missing concepts | **Yes, the most valuable part** | Each question gets 3–6 rubric points with marks. After writing, you rate each point full, half or none against the model answer. Points you miss become weak spots. This is how a human examiner marks. |
| "Not solely keyword matching" | **Agree** | Keyword detection is only a hint ("you mentioned: idempotent, 201, Location"). The score comes from the rubric. |
| AI-generated feedback, clearly separated from verified keys | **Defer, decide consciously** | The site is static on GitHub Pages. Calling Claude from it would expose an API key publicly. It works only locally (`npm run dev` with your own key in `.env` and a small proxy), with per-use API cost. Self-marking against a rubric is also better practice for the real exam, where no AI helps you. |
| Improved model answers, structure recommendations | **Yes, cheaply** | The model answer is the improved answer. Structure tips go per format, for example compare → table of 4–5 dimensions + when to use each; concept → define, how it works, example, trade-off. |
| Timed written exam simulator | **Yes** | Reuses the existing mock engine: configurable minutes and marks, mixed formats, navigation, autosave/resume (localStorage), countdown, auto-submit, then rubric marking. Duration and marks stay configurable because the official ones are unknown. |
| "Draw system architecture" | **Practise on paper** | A drawing canvas is a lot of work for little gain. The app gives the prompt, a reference diagram (ASCII) and a rubric (components, data flow, security, scaling); you draw on paper and self-mark. |
| Separate foundational CS curriculum, labelled as not ToR-confirmed | **Yes, and honest** | Split into DSA, OOP, OS, Networking, DBMS, SE, Testing and Security under a "Foundational (core subject matter)" heading, distinct from the "ToR" topics. |

## The real bottleneck is content, not features

Features take about one session to build. The work is writing accurate rubric questions. Minimum useful set:

| Format | Count | Example |
|---|---|---|
| SQL writing | 12 | Nth highest salary, running totals, PO-wise disbursement report, delete duplicates |
| Java output prediction | 12 | String pool, integer cache (127 vs 128), static/instance init order, try-finally return, overloading with null |
| Find and fix the bug | 8 | Missing @Transactional proxy call, N+1, ConcurrentModificationException, React stale state |
| Short programs (Java/JS) | 10 | Most already exist; add rubrics |
| Schema design | 4 | PO → Members → Loans → Repayments with ERD, keys and indexes |
| Architecture | 4 | Bulk report upload, SSO across apps, a microservice with caching |
| Troubleshooting scenarios | 6 | Slow API, pod crash loop, memory leak, 401 after Keycloak upgrade |
| Compare / explain / descriptive | convert the existing 75 | Add rubrics to each |

That is about 130 questions with rubrics. They must be accurate, because wrong model answers are worse than none.

## Advice outside the app

- **Handwrite.** The real exam is very likely pen and paper. Typing speed is not handwriting speed. Do at least 3 full timed papers by hand, then self-mark them with the app's rubrics.
- **Find out the format.** If seniors or other applicants know past PKSF or similar papers (marks split, MCQ share, duration), set the simulator to match.
- **Use time well.** If the exam is within about a week, build the written mode quickly and spend most of the time writing answers, not polishing the tool.

## Proposed build order

1. Rubric data format plus a written practice mode (editor → model answer → rubric self-mark → weak spots).
2. Content: SQL, output prediction and bug-finding first (highest yield and easiest to mark objectively), then schema, architecture and scenarios.
3. Timed written exam simulator.
4. Split and label the foundational CS curriculum.
5. Optional: local-only AI feedback, labelled "AI feedback (unverified)", never mixed with the answer key.
