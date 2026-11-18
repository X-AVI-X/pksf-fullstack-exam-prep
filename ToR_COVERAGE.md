# ToR coverage audit

Every item named in the PKSF Software Engineer (Full-stack) ToR, with how many questions in the bank cover it (keyword match over question, options, explanation and model answer). Audited 2026-11-16 after filling the gaps.

**Verdict:** every ToR item has dedicated questions; none is below 3 combined MCQ + written. Domain modelling had **zero** before this audit; data workflows, Jenkins, frontend tests, refactoring/upgrades, ERDs, component specs and collaboration were thin and were filled (18 MCQs, 11 written questions, 9 cheat-sheet lines).


## 3.0 A. Feature development

| ToR item | MCQ | Written | Cheat lines |
|---|---:|---:|---:|
| Spring Boot | 20 | 18 | 2 |
| RESTful API | 10 | 5 | 1 |
| Microservices | 6 | 4 | 1 |
| React | 25 | 19 | 8 |
| Angular | 20 | 13 | 5 |
| Domain modelling | 5 | 1 | 1 |
| Data workflows | 2 | 3 | 2 |
| Secure endpoints | 3 | 4 | 0 |
| Reusable components / design system | 3 | 4 | 0 |
| Material Design | 6 | 7 | 2 |
| Accessibility | 16 | 7 | 3 |
| Responsive | 4 | 3 | 2 |
| Spring Batch | 5 | 7 | 2 |
| Task queues | 15 | 11 | 7 |
| Bulk file upload | 3 | 6 | 0 |
| Report generation | 2 | 4 | 1 |

## 3.0 B. Database

| ToR item | MCQ | Written | Cheat lines |
|---|---:|---:|---:|
| SQL queries | 11 | 19 | 2 |
| Stored procedures | 14 | 8 | 1 |
| SQL functions | 2 | 2 | 0 |
| JPA/Hibernate tuning | 9 | 9 | 2 |
| PostgreSQL | 25 | 16 | 3 |
| Oracle | 12 | 7 | 4 |
| MySQL | 7 | 2 | 3 |
| MongoDB | 7 | 3 | 3 |
| Schema standards | 4 | 3 | 1 |
| Indexes | 15 | 14 | 4 |
| Connection pooling | 4 | 3 | 1 |
| Redis caching | 7 | 8 | 1 |
| Redis sessions | 5 | 4 | 1 |

## 3.0 C. Security, integration & DevOps

| ToR item | MCQ | Written | Cheat lines |
|---|---:|---:|---:|
| Encryption | 20 | 12 | 3 |
| RBAC | 7 | 7 | 1 |
| OAuth2 | 6 | 6 | 3 |
| JWT | 11 | 10 | 3 |
| Keycloak SSO | 10 | 14 | 4 |
| SOAP | 6 | 2 | 2 |
| Docker | 14 | 13 | 4 |
| Kubernetes | 23 | 11 | 3 |
| Environment config | 6 | 4 | 3 |
| Secrets | 11 | 10 | 3 |
| GitLab CI | 6 | 3 | 2 |
| GitHub Actions | 3 | 3 | 1 |
| Jenkins | 4 | 2 | 2 |
| ELK | 5 | 7 | 2 |
| Prometheus | 6 | 5 | 4 |
| Grafana | 6 | 10 | 2 |
| App performance troubleshooting | 16 | 10 | 1 |
| DB latency | 8 | 21 | 0 |

## 3.0 D. QA, testing & SDLC

| ToR item | MCQ | Written | Cheat lines |
|---|---:|---:|---:|
| Backend unit/integration tests | 8 | 5 | 4 |
| Frontend tests | 5 | 2 | 3 |
| Refactoring / upgrades | 3 | 2 | 1 |
| Backward compatibility | 11 | 4 | 2 |
| API specs (OpenAPI) | 4 | 5 | 1 |
| ERDs | 3 | 2 | 1 |
| Component specifications | 1 | 2 | 1 |
| Agile / sprints | 10 | 5 | 2 |
| Collaboration (UI/UX, QA, DevOps) | 1 | 4 | 1 |

## 5.0 Preferred qualifications

| ToR item | MCQ | Written | Cheat lines |
|---|---:|---:|---:|
| Git / portfolio / README | 10 | 7 | 3 |
| docker-compose | 4 | 1 | 2 |
| JSON / XML formats | 12 | 8 | 4 |
| PL/SQL | 3 | 1 | 1 |
| Cloud (AWS/GCP/Azure) | 8 | 1 | 2 |

## 1.0/2.0 Background

| ToR item | MCQ | Written | Cheat lines |
|---|---:|---:|---:|
| PKSF background & role facts | 5 | 26 | 2 |

## Limits of this audit

- Counts come from keyword matching, so they show *presence*, not depth. A count of 3 for a narrow item (component specifications) is adequate; a count of 3 for a broad one would not be.
- The ToR names technologies, not exam questions. The real paper may ask about something inside a topic that no question here covers. The foundational curriculum (DSA, OOP, OS, networking, DBMS, SE & testing, security) covers the "core subject matter" the PKSF email mentions.
- General sections common in Bangladeshi recruitment exams (English, mathematics, general knowledge) are not in the ToR and are not covered. If the admit card or past candidates mention them, prepare them separately.
