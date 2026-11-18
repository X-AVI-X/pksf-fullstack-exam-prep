## "Tell us about yourself." (viva opener)
Structure in about 60 to 90 seconds: present role, core stack, one strong result, why this job.

Template to adapt: "I'm a full-stack software engineer with a CSE degree from AIUB, currently working at One Direction Companies Limited, where I was promoted to Senior Assistant Executive Officer. I build Spring Boot microservices with Spring Security, JPA and PostgreSQL, and React/Next.js frontends, with RabbitMQ and WebSockets for async and real-time features, deployed with Docker and Kubernetes through CI/CD. [One concrete result: what you built, for whom, measurable impact.] I'm also doing the Professional Masters in AI and Data Engineering at the University of Dhaka. PKSF's work of serving 200+ partner organisations with secure, reliable digital systems is exactly the kind of high-impact, data-sensitive engineering I want to do."
+ 1 | Present role and core stack in one breath | stack
+ 1 | One concrete, measurable result | result
+ 1 | Link to PKSF's mission and this role | PKSF
+ 1 | 60–90 seconds, structured, no life story | structure

## "Why do you want to join PKSF?"
- Mission: national-scale poverty alleviation; software here reaches POs and the people they serve.
- Engineering fit: the ToR's stack (Spring Boot, React/Angular, PostgreSQL, Redis, Keycloak, Docker/K8s, ELK/Prometheus) matches what you already use.
- Scale and sensitivity of financial and partner data: a chance to build secure, high-performance systems properly.
- Growth: ITDSD is expanding its software capacity, so you can help shape standards from the start.
+ 1.5 | Mission and social impact | mission/poverty
+ 1.5 | Fit between your skills and the ToR stack | Spring/stack
+ 1 | Scale and data sensitivity as a motivation | secure/data

## Walk us through a full-stack project you built (use STAR).
- **Situation**: the business problem and users.
- **Task**: your responsibility.
- **Action**: architecture (diagram in words), key technical decisions and why (e.g. RabbitMQ for async, Redis cache, JWT/Keycloak, Docker/K8s), a hard bug you solved.
- **Result**: numbers (response time cut from X to Y, N users, uptime, fewer manual steps).
Prepare 2 such stories; be ready to draw the architecture on paper.
+ 1 | Situation and task | situation
+ 2 | Actions: architecture and justified technical decisions | action
+ 1.5 | Measurable results | result
+ 1.5 | Lessons learned / what you would change | learn

## How would you secure sensitive financial data of Partner Organisations?
@descriptive 10
- **Identity**: Keycloak SSO, MFA for admins, short-lived tokens.
- **Authorisation**: RBAC + data-level isolation (PO users only see their PO's rows); deny by default.
- **Transport/storage**: TLS everywhere; encryption at rest; encrypt highly sensitive columns; secrets in K8s Secrets/Vault.
- **Application**: validation, parameterised queries, OWASP checks, dependency scanning.
- **Audit**: who did what and when, immutable logs shipped to ELK; alerts on anomalies.
- **Ops**: backups with point-in-time recovery, tested restores, least-privilege DB accounts, network policies.
+ 2 | Identity: SSO, MFA, short-lived tokens | MFA
+ 2 | Authorisation: RBAC plus PO-level data isolation | RBAC
+ 2 | Encryption in transit and at rest | TLS, rest
+ 2 | Application security and auditing | audit
+ 2 | Ops: backups, least privilege, monitoring | backup

## Questions you can ask the panel at the end.
- What does the current tech landscape look like: which systems are legacy (Oracle/SOAP) and which are being modernised?
- How do POs currently submit reports, and what are the biggest pain points?
- How is the ITDSD team structured, and how do you run sprints and code reviews?
- What would success look like for this role in the first 6 months?
+ 1 | About the current tech landscape and legacy systems | legacy
+ 1 | About PO users' pain points | pain
+ 1 | About team process (sprints, reviews) | sprint
+ 1 | About success criteria for the role | success

## "What do you know about PKSF?" (viva, or a short written note)
@concept 6
- **What it is:** Palli Karma-Sahayak Foundation, an **apex development organisation** set up by the Government of Bangladesh in **1990** as a not-for-profit company. Its mandate is poverty alleviation through sustainable employment.
- **How it works:** it is a **second-tier** body. It does not lend to people directly; it gives financing, skill training and technical support to more than 200 **Partner Organisations (POs)**, which serve members in the field. Most borrowers are women.
- **What it offers:** core credit programmes (**Jagoron** general microcredit, **Agrosor** micro-enterprise, **Buniad** ultra-poor, **Sufolon** seasonal/agriculture) and development projects co-funded by the World Bank, ADB and IFAD.
- **Its technology:** the Information Technology and Digital Solutions Department (**ITDSD**) builds the systems that PKSF and its POs use. POs already report digitally through APIs (the "Amader PKSF" portal and the Online Reporting System), and PKSF is moving towards more automated, data-driven and cashless services.
- **Where this role fits:** building secure, reliable full-stack systems (Spring Boot, React/Angular, PostgreSQL, Keycloak SSO, Docker/Kubernetes) for sensitive financial, project and PO data.
+ 1.5 | What PKSF is: apex body founded by the Government in 1990, poverty alleviation | 1990, apex/poverty
+ 1.5 | Second-tier model: works through 200+ Partner Organisations | Partner Organisation/PO, second-tier
+ 1 | Names programmes or the kinds of service (financing, training) | Jagoron/Agrosor/Buniad/training
+ 1 | PKSF's digital systems and the ITDSD | ITDSD/digital/API
+ 1 | Links the role to PKSF's needs (secure handling of financial data) | secure/financial
