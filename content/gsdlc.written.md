## What is SDLC? Describe its phases with the main activity and deliverable of each, using a PKSF report-submission module as the example.
@descriptive 10
The **Software Development Life Cycle (SDLC)** is a structured process for planning, building, testing, deploying and maintaining software, so it is delivered on time, within budget and meeting its requirements.

| # | Phase | Main activity | Deliverable (report-submission module) |
|---|---|---|---|
| 1 | **Planning / feasibility** | scope, cost, schedule, risks; technical, economic and operational feasibility | project charter: "POs submit monthly financial reports online" |
| 2 | **Requirements analysis** | gather functional and non-functional needs from PKSF officers and PO users | **SRS**: upload Excel/CSV, validation rules, deadline reminders; 2,000 POs submitting on the same day; Bangla support |
| 3 | **Design** | architecture, database, API and UI design | architecture diagram, **ERD**, **OpenAPI spec**, Material Design mock-ups |
| 4 | **Implementation (coding)** | write code to standards, with code review | Spring Boot services, React/Angular screens, Spring Batch import job, in Git |
| 5 | **Testing** | unit, integration, system, UAT, performance, security | test cases, JUnit/Mockito reports, UAT sign-off by PO users |
| 6 | **Deployment** | release to production | Docker images, Kubernetes manifests, CI/CD pipeline, release notes |
| 7 | **Maintenance** | fix bugs, adapt to new rules, improve performance | patches, new versions, updated documentation |

**SDLC models** arrange these phases differently:
- **Waterfall:** sequential, one pass.
- **V-model:** a test level for each phase.
- **Iterative / spiral:** repeated, risk-driven cycles.
- **Agile/Scrum:** every phase runs in short sprints of 1–4 weeks.

The PKSF ToR describes Agile (sprint goals, collaboration with QA, UI/UX and DevOps).
+ 2 | Definition and purpose of SDLC | life cycle
+ 4 | All phases in order with activities | requirement, design, testing, deployment, maintenance
+ 2 | Deliverables named (SRS, ERD/design, test reports) | srs
+ 1 | Applied to the example module | upload/report
+ 1 | Mentions SDLC models / Agile | waterfall/agile

## Compare the Waterfall and Agile (Scrum) models. Which suits PKSF's DSS project and why? Name the main Scrum roles, events and artefacts.
@compare 10
**Waterfall** is a linear, plan-driven model: each phase finishes before the next starts. **Agile** is iterative and incremental: working software is delivered in short iterations, and the plan adapts to feedback. **Scrum** is the most widely used Agile framework.

| | Waterfall | Agile / Scrum |
|---|---|---|
| Flow | sequential phases | repeated sprints (1–4 weeks) |
| Requirements | fixed up front | evolve; the product backlog is reprioritised |
| Delivery | one release at the end | a working increment every sprint |
| Customer involvement | at the start and end | continuous (sprint review) |
| Testing | a phase near the end | continuous, automated, within the sprint |
| Change cost | high late in the project | low |
| Documentation | heavy | "just enough" |
| Best for | stable, well-understood, regulated, fixed-price work | evolving requirements, user-facing products |

**Scrum:**
- **Roles:** Product Owner (owns and prioritises the backlog), Scrum Master (removes impediments, coaches the process), Developers.
- **Events:** Sprint, Sprint Planning, Daily Scrum (15 minutes), Sprint Review, Sprint Retrospective.
- **Artefacts:** Product Backlog, Sprint Backlog, Increment (meeting the Definition of Done).

**For PKSF's DSS:** **Agile/Scrum**. Dashboard and report requirements become clear only once officers see real data, the ToR asks for collaboration toward "sprint goals", and early increments (one programme's dashboard first) deliver value sooner. Some Waterfall discipline still applies to fixed regulatory reports and data-migration plans.
+ 2 | Correct definitions of both | sequential, iterative
+ 3 | At least five accurate differences | requirement, sprint
+ 2 | Scrum roles, events and artefacts | product owner, retrospective, backlog
+ 2 | Justified recommendation for PKSF DSS | dss
+ 1 | Table layout

## Define cohesion and coupling. Why should a module have high cohesion and low coupling? Show a Java example of reducing coupling.
@concept 10
- **Cohesion:** how closely the responsibilities **inside** one module (class or service) belong together. **High** is good: one clear purpose.
- **Coupling:** how much one module **depends on** another's internals. **Low** is good: modules interact through small, stable interfaces.

**Why:** high cohesion and low coupling make code easier to understand, test (mock a dependency), change (a change stays local), reuse, and deploy independently (microservices).

**Levels, from best to worst:**
- **Cohesion:** functional > sequential > communicational > procedural > temporal > logical > **coincidental** (worst: unrelated things lumped together).
- **Coupling:** data (best) > stamp > control > external > common (global data) > **content** (worst: reaching into another module's internals).

**Example: tight coupling to a concrete class**
~~~java
class LoanService {
    private final SmsGatewayClient sms = new SmsGatewayClient("api-key");  // concrete class, created inside
    void approve(Loan loan) { /* ... */ sms.sendSms(loan.phone(), "Approved"); }
}
~~~
**Low coupling: depend on an abstraction, injected by Spring**
~~~java
interface Notifier { void send(String to, String msg); }

@Service
class LoanService {
    private final Notifier notifier;                       // interface, not implementation
    LoanService(Notifier notifier) { this.notifier = notifier; }   // constructor injection
    void approve(Loan loan) { /* ... */ notifier.send(loan.phone(), "Approved"); }
}
~~~
Now SMS can be swapped for email or a mock in tests without changing {{LoanService}}. This is the dependency-inversion principle (the D in SOLID). **Cohesion example:** a {{LoanService}} that also generates PDFs and sends email has low cohesion. Move those jobs to {{ReportService}} and {{Notifier}}.
+ 2 | Correct definitions of cohesion and coupling | cohesion, coupling
+ 2 | High cohesion + low coupling with reasons (test, change, reuse) | low coupling
+ 2 | Levels named (functional/coincidental; data/content) | functional, content
+ 3 | Code example: depend on an interface, injected | interface, inject
+ 1 | Links to DI/SOLID or a cohesion example | solid/dependency inversion

## A loan application accepts amounts from 5,000 to 5,00,000 taka (inclusive). Using boundary value analysis and equivalence partitioning, derive test cases with expected results, and explain both techniques.
@descriptive 10
Both are **black-box** techniques: tests are derived from the specification, not the code.

**Equivalence partitioning (EP):** divide the inputs into classes the system should treat the same way, then test **one representative per class**.

| Class | Range | Representative | Expected |
|---|---|---|---|
| E1 invalid: too low | < 5,000 | 1,000 | rejected: "minimum 5,000" |
| E2 valid | 5,000 – 5,00,000 | 2,50,000 | accepted |
| E3 invalid: too high | > 5,00,000 | 7,00,000 | rejected: "maximum 5,00,000" |
| E4 invalid: not a number | "abc", empty, negative | "abc" | rejected: validation error |

**Boundary value analysis (BVA):** defects cluster at the edges (off-by-one errors, {{<}} written instead of {{<=}}), so test each boundary and its neighbours.

| Test | Amount | Expected |
|---|---|---|
| min − 1 | 4,999 | rejected |
| min | 5,000 | accepted |
| min + 1 | 5,001 | accepted |
| nominal | 2,50,000 | accepted |
| max − 1 | 4,99,999 | accepted |
| max | 5,00,000 | accepted |
| max + 1 | 5,00,001 | rejected |

**Automated in JUnit 5:**
~~~java
@ParameterizedTest
@CsvSource({"4999,false", "5000,true", "5001,true", "250000,true", "499999,true", "500000,true", "500001,false"})
void validatesLoanAmount(long amount, boolean valid) {
    assertEquals(valid, validator.isValid(BigDecimal.valueOf(amount)));
}
~~~
EP keeps the number of tests small; BVA targets where bugs actually occur. Together, 7 BVA cases plus the non-numeric class give strong coverage of this rule with about 8 tests.
+ 2 | Explains EP (classes, one representative each) | equivalence
+ 2 | Explains BVA (edges and neighbours, why) | boundary
+ 2 | Correct EP classes, including invalid non-numeric | invalid
+ 3 | Correct BVA values 4,999 / 5,000 / 5,001 / 4,99,999 / 5,00,000 / 5,00,001 with expected results | 4999, 500001
+ 1 | Black-box noted or JUnit parameterised test | black-box/parameterized

## Calculate the cyclomatic complexity of the method below, explain what the number means, and list a minimum set of test cases that covers every independent path.
@descriptive 10
~~~java
static String grade(int marks) {
    if (marks < 0 || marks > 100)
        throw new IllegalArgumentException("marks must be 0-100");
    if (marks >= 80) return "A+";
    else if (marks >= 60) return "A";
    else if (marks >= 40) return "B";
    return "F";
}
~~~
**Cyclomatic complexity (McCabe)** measures the number of **linearly independent paths** through code: **V(G) = decision points + 1** (equivalently E − N + 2P on the control-flow graph).

**Decision points:**
| Construct | Count |
|---|---|
| {{if (marks < 0 …}} | 1 |
| {{marks > 100}}, the second operand of the OR (short-circuit, a separate branch) | 1 |
| {{if (marks >= 80)}} | 1 |
| {{else if (marks >= 60)}} | 1 |
| {{else if (marks >= 40)}} | 1 |
| **Total** | **5** |

**V(G) = 5 + 1 = 6.**

**Meaning:** at least **6 test cases** are needed to execute every independent path (basis-path testing). Higher values mean code that is harder to understand and test. Common thresholds: 1–10 simple; 11–20 moderate; above 20, refactor. SonarQube flags methods by cognitive complexity.

**Basis test set:**
| # | marks | Path | Expected |
|---|---|---|---|
| 1 | −1 | first condition true | IllegalArgumentException |
| 2 | 101 | second condition true | IllegalArgumentException |
| 3 | 85 | ≥ 80 | "A+" |
| 4 | 70 | 60–79 | "A" |
| 5 | 50 | 40–59 | "B" |
| 6 | 20 | below 40 | "F" |

Add the boundary values 0, 39, 40, 59, 60, 79, 80 and 100 for a stronger suite.
+ 2 | States the formula V(G) = decisions + 1 (or E − N + 2P) | +1/e - n
+ 3 | Counts 5 decisions, including the OR operator | or, 5
+ 2 | V(G) = 6 | 6
+ 2 | Six test cases covering each path with expected results | -1, 101
+ 1 | Explains meaning (min tests; maintainability thresholds) | independent paths

## Explain the levels of software testing (unit, integration, system, acceptance) and the difference between verification and validation. For each level, name the tool you would use in a Spring Boot + React project.
@descriptive 10
| Level | What is tested | Who | Tools in PKSF's stack |
|---|---|---|---|
| **Unit** | one class or function in isolation; dependencies mocked | developers | **JUnit 5 + Mockito** (Java); **Jest/Vitest + React Testing Library** (frontend) |
| **Integration** | modules working together through their real interfaces: DB, REST, queue | developers | **@SpringBootTest / @DataJpaTest / @WebMvcTest**, **Testcontainers** (real PostgreSQL), **MockMvc**, WireMock |
| **System** | the whole deployed application against the SRS: functional and non-functional | QA team | Selenium/**Playwright/Cypress** end-to-end; **JMeter/Gatling** for load; OWASP ZAP for security |
| **Acceptance (UAT)** | does it meet business needs? | PKSF officers and PO users | UAT scripts, staging environment; sign-off |

Other types that cut across the levels:
- **Regression testing:** automated in the **CI pipeline** on every merge.
- **Smoke testing:** run after each deployment.
- **Performance testing.**
- **Security testing.**

**The test pyramid:** many fast unit tests, fewer integration tests, and a few slow end-to-end tests.

**Verification vs validation:**
| | Verification | Validation |
|---|---|---|
| Question | "Are we building the product **right**?" | "Are we building the **right** product?" |
| Checks against | specification and design | the user's real needs |
| How | reviews, walkthroughs, inspections, static analysis (SonarQube) | executing the software: testing, UAT |
| When | throughout, often before the code runs | on working software |
+ 4 | All four levels correctly explained | unit, integration, system, acceptance
+ 3 | Appropriate tools per level (JUnit/Mockito, Testcontainers, Cypress/Playwright, UAT) | junit, mockito, testcontainers
+ 2 | Verification vs validation correct | verification, validation
+ 1 | Test pyramid or regression in CI | pyramid/regression
