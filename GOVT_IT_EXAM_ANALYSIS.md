# Government IT exam analysis, filtered to the PKSF ToR

Researched 2026-11-18. Goal: predict what the PKSF Software Engineer (Full-stack) written exam will ask, using the papers Bangladeshi government and state bodies set for Assistant Programmer, Software Engineer and Senior Officer (IT) posts.

## 1. What exists for PKSF itself

**No PKSF IT, programmer or software engineer paper has been published anywhere.** The only PKSF papers online are for Assistant Manager (2016/2019, 2023). They are pure MCQ, cover Bangla, English, Math and GK, and include 4 basic ICT items (QR code, ChatGPT, telemedicine, ATM). Who sets the paper, the marks and the time for the SE post are not public.

This is a new contract post, with an unusually detailed, stack-specific ToR and pay of BDT 1,20,000. That makes a ToR-driven practical paper more likely than the generic bank-style paper. This is an inference, not a fact.

## 2. Papers analysed (other bodies)

About 200 technical items from 11 papers, 2021–2026. About 65 were read verbatim; the rest come from page summaries.

| Paper | Year | Type |
|---|---|---|
| ICB, Assistant Programmer | 2026 | Written |
| ICB Asset Management, Assistant Programmer | 2024 | Written |
| Combined Bank, Assistant Programmer | 2024 | MCQ |
| Bangladesh Bank, Assistant Programmer | 2023/24 | Written + MCQ |
| Combined Bank, Senior Officer (IT) | 2022, 2024, 2025, 2026 | Written + MCQ |
| Security Printing Corp., Sub Assistant Programmer | 2022 | Written |
| 6 Banks & FIs, Assistant Programmer | 2021 | Written |
| Bangladesh Bank, Assistant Programmer | 2016 | Written |

Topic share across all items: DSA 20%, programming/output 14%, architecture/fundamentals 11%, networks 9%, OOP 6%, DBMS 6%, security 6%, OS 4%, SE 4%, AI/ML 4%, SQL 3.5%, digital logic 3%, TOC 2.5%, other 7%.

## 3. Filter: in the ToR vs not

### Keep (in or directly implied by the ToR), with real examples

| ToR area | What these exams actually asked |
|---|---|
| **SQL** (B.1) | Join two tables and filter by marks; GROUP BY + HAVING (avg > X and count ≥ 5); second-highest salary; COUNT vs COUNT DISTINCT with NULLs; `> ALL` subquery; multi-table Employee/Works/Company/Manages queries including UPDATE (+10% raise); multi-join count across 5 tables |
| **DBMS / schema** (B.1–2, D.2 ERDs) | Trigger with example and why; ACID; primary-key properties; integrity rules; ER diagram from a description; FDs, normalisation, BCNF |
| **Core Java / OOP** (A.1, mandatory Java) | BankAccount class (private fields, deposit, withdraw with balance check); Savings/Current account hierarchy; overloading vs overriding vs **hiding** in a listing; predict output (null reference, zero-length array); what interfaces are for; exception vs error, exception handling |
| **Classic programs, answered in Java** (D.1 clean code) | Prime, LCM/GCD, Fibonacci, binary search returning −1, sum of evens to n, recursive palindrome, balanced parentheses, letter-shift cipher (z→a) |
| **API / integration** (C.1) | SOAP vs REST and their data-exchange difference; HTTP request flow; web caching |
| **Security** (C.1 "encryption mechanisms") | SQL injection and XSS (cause, fix); session hijacking; RSA steps; Diffie-Hellman MITM; CIA triad mapped to attacks; zero-day during a patch window; whitelist vs blacklist |
| **SDLC / testing** (D) | SDLC phases; cohesion and coupling; boundary-value analysis; integration testing; cyclomatic complexity |
| **Scenario / scalability** (A.1, C.2–3) | 10k → 80k concurrent users, no cloud allowed: what to propose; fast CPU but high latency: what to upgrade |

### Cut (not in the ToR)

C storage classes and C-specific traps, digital logic (K-map, gates, flip-flops, MUX), computer architecture (8086 addressing modes, RAID, cache, pipelining), OS scheduling, paging and thrashing, theory of computation (DFA, regex, PDA), subnetting and link calculations (Shannon, stop-and-wait, propagation delay), graph isomorphism, probability, AI/ML.

### Grey zone (decision needed)

**DSA** is the single largest share (20%) in other bodies' papers, but the ToR does not name it. The classic-program row above already covers the DSA that shows up as "write a program", in Java.

## 4. Gap against the current bank

| Covered well | Missing or thin |
|---|---|
| ACID, XSS, SQL injection, RSA, SDLC, BCNF, ER diagrams, HAVING, SOAP, overriding | Second-highest salary, COUNT DISTINCT with NULLs, `> ALL`, UPDATE-with-join; BankAccount / account hierarchy; **method hiding**; LCM/GCD, balanced parentheses, letter shift; Diffie-Hellman MITM; zero-day; cyclomatic complexity; on-prem scale-up scenario |

Also, several ToR-relevant topics currently sit in the "foundational (not ToR)" group: DBMS, OOP, Security Fundamentals and SE & Testing. They should be relabelled, not cut.

## 5. Predicted paper shape

- **Most likely:** a written paper of 8–12 questions × 10 marks. Each paper has one SQL-on-schema question, one Java OOP class to write, one "difference between" question, one security question, one scenario/architecture question, plus ToR stack questions (Spring Boot, React/Angular, Docker/K8s, Redis).
- **Possible:** an MCQ screening paper (about 1 hour, possibly −0.25 negative marking) mixing definitions and output prediction.
- **Viva:** ToR plus PKSF facts (see PKSF_FACTS.md).

## Sources

- [IT Job QnS: Bank Assistant Programmer papers 2021–2026](https://it.jobqns.com/previous2021-2026-bank-assistant-programmer-qns/)
- [IT Job QnS: Combined Bank Senior Officer (IT) papers](https://it.jobqns.com/previous2021-2026-combined-bank-senior-officer-it-qns/)
- [Jobs Test BD: PKSF exam 2019](https://jobstestbd.com/palli-karma-sahayak-foundation-pksf-exam-question-solution-2019/) · [PKSF previous exam](https://jobstestbd.com/palli-karma-sahayak-foundation-pksf-previous-exam-question-solution/)
- [SATT Academy: PKSF question bank](https://sattacademy.com/question-bank/%E0%A6%AA%E0%A6%BF%E0%A6%95%E0%A7%87%E0%A6%8F%E0%A6%B8%E0%A6%8F%E0%A6%AB/mcq)
- [Bangladesh Bank AP 2016 (csejobhelper)](http://csejobhelper.blogspot.com/2018/04/bangladesh-bank-assistant-programmer.html)
- Not readable: radhiositsolution.com and onlineicttutor.com (DNS failure); locked papers on it.jobqns.com.

Third-party coaching sites; question wording is paraphrased and dates are not verified.
