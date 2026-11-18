# Is practising the question bank enough?

**No.** Practising questions is necessary but not sufficient. Here is why, and what to add.

## Why the bank alone falls short

1. **It is a sample, not the paper.** I wrote the questions from the ToR. The real examiners will phrase things differently and go deeper or sideways inside a topic. If you have memorised answers, a reworded question breaks them; if you understand the topic, it doesn't.
2. **Recognition is not production.** Even the written mode can turn into "I've seen this answer before". The exam rewards explaining and coding something you have **never seen in that exact form**.
3. **Some answer keys are unverified.** SQL, Java and JS output answers were executed. Spring, JPA, React and architecture answers were written carefully but not run. Cross-check anything that surprises you against the official documentation.
4. **Hands-on skill shows.** Examiners can tell an answer from someone who has built Spring Boot + PostgreSQL apps from one who has memorised notes. The ToR also *prefers* candidates with a working GitHub portfolio.
5. **The written exam is only the first stage.** If you pass, a viva or interview usually follows. There you must talk through your own projects and reason live, which a question bank doesn't train.

## What to add (scale it to the days you have left)

| Activity | Why | How much |
|---|---|---|
| **Understand, then practise** | Survives reworded questions | Per topic: cheat sheet → the matching section of the official docs → then the questions |
| **Run everything you write** | Turns recall into skill | Every SQL answer in your local PostgreSQL; every Java output question in `jshell`; break the code on purpose and predict the error |
| **Build one small end-to-end project** | Covers most of the ToR in one go, becomes your GitHub portfolio and your viva story | Spring Boot + JPA + PostgreSQL + Keycloak login + React or Angular page + tests + Dockerfile and docker-compose + README. Even a 3–5 day minimal version counts. |
| **Explain aloud** | Fixes vague understanding; trains the viva | Each day, explain 2 concepts out loud in 2 minutes each without notes (Feynman technique). Where you stumble is what you don't know yet. |
| **Handwrite under time** | The real exam is pen and paper | At least 3 full papers in paper mode; timed; neat SQL and code; diagrams |
| **Spaced repetition** | You forget most of what you study within days unless you review | Weak spots and flashcards daily; re-attempt written questions after 3 and 7 days |
| **Similar papers** | Exposes question styles the bank lacks | Ask people who sat IT-post written exams at Bangladeshi public bodies and banks; practise their questions with the same rubric method |
| **Logistics and health** | Easy marks lost otherwise | Read the admit card instructions; know the centre and timing; sleep 7+ hours before the exam; no new material in the last 2 days |

## Official sources worth reading (one section per topic, not cover to cover)

- Java: *Effective Java* (Bloch); the Java tutorials on dev.java
- Spring: the Spring Boot, Spring Data JPA and Spring Security reference docs on spring.io
- SQL: the PostgreSQL documentation, especially the tutorial, window functions, indexes and `EXPLAIN`
- React: react.dev (Learn section). Angular: angular.dev (tutorials and guides)
- OAuth2/Keycloak: keycloak.org getting-started guide; oauth.net/2
- Docker and Kubernetes: docs.docker.com get-started; kubernetes.io concepts (Pods, Deployments, Services, ConfigMaps/Secrets)
- Security: the OWASP Top 10 and the OWASP Cheat Sheet Series

## Suggested split of daily time

- **50%** written practice and full papers (the app)
- **25%** hands-on: running queries and code, building the mini project
- **15%** reading official docs for the topics you got wrong
- **10%** explaining aloud and reviewing flashcards and weak spots

## Honest bottom line

The app gives you structure, coverage and a way to measure yourself. Understanding, hands-on practice and timed handwriting are what make you able to answer questions it never asked. Nobody can guarantee full marks; this combination gives you the best realistic chance.
