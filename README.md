# PKSF Full-stack Exam Prep

Study app for the PKSF **Software Engineer (Full-stack)** written exam. The syllabus is the ToR plus core subject matter, so the bank covers every technology in [ToR.pdf](ToR.pdf) and CS fundamentals.

**300 MCQs** with explanations · **75 written/coding answers** · a cheat sheet per topic · timed mock exams · flashcards · weak-spot tracking · search.

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
  <id>.written.md     ## question, then a markdown answer
  <id>.cheat.md       - one bullet per fact
src/lib/            parse.js (format parsers + mini markdown), bank.js, state.svelte.js
src/views/          Home, Topic, Quiz (+results), Mock, Cards, Weak
scripts/check-bank.js
```
To add a question, edit the topic's `.mcq.txt` and run `npm run check`.

> Practice material written from the public ToR. It is not an official PKSF exam paper.
