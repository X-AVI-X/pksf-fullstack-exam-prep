# PKSF Full-stack Exam Prep

Study app for the PKSF **Software Engineer (Full-stack)** written exam. The syllabus is the ToR plus core subject matter, so the bank covers every technology in [ToR.pdf](ToR.pdf) and CS fundamentals.

Built for a **written** exam: the goal is to reproduce accurate answers, not just recognise them.

- **Written practice:** 179 questions in 11 written formats (short answer, descriptive, explain-the-concept, compare & contrast, write SQL, predict Java/JS output, find the error, write a program, schema design, system architecture, troubleshooting scenario). Answer in an exam-style editor, then mark yourself against the answer key with a question-specific rubric: full, half or no marks per criterion, a list of missing concepts, and structure tips per format.
- **Timed written exam:** configurable duration, MCQ count, written count, formats and curriculum. Navigation palette, autosave and resume, countdown, automatic submission, rubric marking, then a report by format and topic. **Paper mode** prints the question paper and lets you mark a handwritten answer sheet, with a suggested time per question based on its marks.
- **353 MCQs** with explanations, a cheat sheet per topic, MCQ mock exams, flashcards, weak spots and search.
- **Government-exam patterns (menu "Govt-exam patterns"):** 9 patterns taken from about 200 questions in Bangladeshi IT recruitment papers (2021–2026) and filtered to the ToR: SQL on a given schema, Java OOP class design, classic programs in Java, database theory, "difference between", security, SDLC & testing, scenario & scalability, and DSS & reporting data (from the 2026 vacancy notice). Each pattern has a tutorial tab (how examiners ask it, the answer structure, traps), written questions with rubrics, MCQs and a cheat sheet. Two preset papers: a 10 × 10-mark written paper (3 hours) and a 50-question MCQ screening with −0.25 negative marking. See [GOVT_IT_EXAM_ANALYSIS.md](GOVT_IT_EXAM_ANALYSIS.md).
- **ToR only:** topics outside the ToR (DSA theory, operating systems, networking) are marked `"hidden": true` in `content/topics.json`. Their files and your saved progress stay, but the app leaves them out. Remove the flag to bring a topic back.

**Marking is honest about its sources.** Every model answer is an answer key written for this app; SQL, Java and JavaScript answers marked "executed and verified" were run (PostgreSQL 15, Java 21, Node 22). All 148 written questions have a question-specific rubric; a labelled generic rubric for the format is only a fallback for newly added questions without one. Keyword detection is shown only as a hint and never sets marks. No AI marking is used.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run check    # validate the question bank
```
Pushing to `main` deploys to GitHub Pages (Settings → Pages → Source: GitHub Actions).

## Stack
Vite + Svelte 5. No backend; progress lives in localStorage (`pksf-prep-v1`).

```
content/            question bank as plain text, one set of files per topic
  topics.json         topic id, name, blurb (order = display order)
  <id>.mcq.txt        Q: question / - wrong / * right / E: explanation  (~~~ for code)
  <id>.written.md     ## question, optional "@format marks [verified]", markdown answer,
                      optional rubric lines "+ marks | criterion | hint, terms" 
  <id>.cheat.md       - one bullet per fact
  <id>.tutorial.md    optional tutorial tab (markdown; required for "gov" pattern topics)
src/lib/            parse.js (format parsers + mini markdown), bank.js, state.svelte.js
src/lib/formats.js  the 12 formats: default marks, structure tips, generic rubrics
src/views/          Home, Gov, Topic, Quiz, Mock, Cards, Weak, WriteHub, Write, Editor, Marker, WExam
scripts/check-bank.js
```
To add a question, edit the topic's file and run `npm run check`. Question ids are a hash of the question text, so reordering or moving questions keeps saved progress; editing a question's text resets progress for that question only. `scripts/legacy-ids.js` produced the one-time map from the old position-based ids.

> Practice material written from the public ToR. It is not an official PKSF exam paper.
