# PKSF Full-stack Exam Prep

Study app for the PKSF **Software Engineer (Full-stack)** written exam. The syllabus is the ToR plus core subject matter, so the bank covers every technology in [ToR.pdf](ToR.pdf) and CS fundamentals.

Built for a **written** exam: the goal is to reproduce accurate answers, not just recognise them.

- **Written practice:** 179 questions in 11 written formats (short answer, descriptive, explain-the-concept, compare & contrast, write SQL, predict Java/JS output, find the error, write a program, schema design, system architecture, troubleshooting scenario). Answer in an exam-style editor, then mark yourself against the answer key with a question-specific rubric: full, half or no marks per criterion, a list of missing concepts, and structure tips per format.
- **Timed written exam:** configurable duration, MCQ count, written count, formats and curriculum. Navigation palette, autosave and resume, countdown, automatic submission, rubric marking, then a report by format and topic. **Paper mode** prints the question paper and lets you mark a handwritten answer sheet, with a suggested time per question based on its marks.
- **353 MCQs** with explanations, a cheat sheet per topic, MCQ mock exams, flashcards, weak spots and search.
- **Two curricula, clearly labelled:** ToR topics, and foundational core subjects (DSA, OOP, OS, networking, DBMS, software engineering & testing, security) that are not explicitly listed in the ToR.

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
src/lib/            parse.js (format parsers + mini markdown), bank.js, state.svelte.js
src/lib/formats.js  the 12 formats: default marks, structure tips, generic rubrics
src/views/          Home, Topic, Quiz, Mock, Cards, Weak, WriteHub, Write, Editor, Marker, WExam
scripts/check-bank.js
```
To add a question, edit the topic's file and run `npm run check`. Question ids are a hash of the question text, so reordering or moving questions keeps saved progress; editing a question's text resets progress for that question only. `scripts/legacy-ids.js` produced the one-time map from the old position-based ids.

> Practice material written from the public ToR. It is not an official PKSF exam paper.
