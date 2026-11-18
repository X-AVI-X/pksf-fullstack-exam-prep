## Compare Waterfall and Agile (Scrum). Which suits PKSF's ITDSD, and why?
@compare 6
| | Waterfall | Agile / Scrum |
|---|---|---|
| Flow | sequential phases | iterative 1–4 week sprints |
| Requirements | fixed up front | evolve; backlog re-prioritised |
| Delivery | once at the end | working increment every sprint |
| Customer | involved at start and end | continuous feedback (sprint review) |
| Change cost | high | low |
| Documentation | heavy | just enough |

PKSF's ITDSD serves 200+ Partner Organisations whose needs change (new loan products, reports). **Agile** gives frequent feedback from PO users and lower risk; the ToR explicitly mentions sprint goals. Waterfall still fits fixed-scope regulatory work.
+ 2 | Correct description of both models | sequential, iterative
+ 2 | At least four differences | requirement/feedback/change
+ 2 | Justified choice for the PKSF context | sprint/PO


## Explain the SOLID principles with a one-line example each.
@concept 5
- **S**ingle Responsibility: {{LoanService}} handles loan rules; PDF rendering lives in {{ReportRenderer}}.
- **O**pen/Closed: add a new {{InterestStrategy}} implementation instead of editing a switch.
- **L**iskov Substitution: any {{Account}} subtype works where an Account is expected without surprises.
- **I**nterface Segregation: split a fat {{Repository}} into {{Reader}} and {{Writer}}, so clients depend only on what they use.
- **D**ependency Inversion: services depend on {{PaymentGateway}} (an interface) that Spring injects, not on a concrete class.
+ 1 | Single Responsibility | single responsibility
+ 1 | Open/Closed | open
+ 1 | Liskov Substitution | liskov/substitut
+ 1 | Interface Segregation | segregation
+ 1 | Dependency Inversion | inversion

## Explain the phases of the Software Development Life Cycle (SDLC) and the output of each.
@concept 6
1. **Planning / feasibility:** scope, cost, schedule, risks → project plan.
2. **Requirements analysis:** gather functional and non-functional requirements from stakeholders → SRS, user stories with acceptance criteria.
3. **Design:** architecture, data model, API contracts, UI → design documents, ERD, OpenAPI spec, wireframes.
4. **Implementation:** coding to standards with code review and version control → working, unit-tested code.
5. **Testing:** integration, system, performance, security and user acceptance testing → test reports, fixed defects.
6. **Deployment:** release through CI/CD to staging and production → running system, release notes.
7. **Maintenance:** monitoring, bug fixes, enhancements, refactoring → new versions.

- **Models** arrange these phases differently: Waterfall runs them once in sequence; Agile repeats all of them every sprint; the V-model pairs each development phase with a test phase; DevOps automates build, test and deploy so the loop is continuous.
+ 2 | Lists the phases in a sensible order (at least six) | requirement, design, test, maintenance
+ 2 | States the activity or output of each phase | SRS/user stor/ERD
+ 1 | Includes deployment and maintenance, not just build and test | deploy, maintenance
+ 1 | Relates the phases to a model (Waterfall, Agile, V-model) | Waterfall/Agile

## Compare the levels of testing (unit, integration, system, acceptance) and black-box vs white-box testing.
@compare 6
| Level | What is tested | Who / tools | Example |
|---|---|---|---|
| Unit | one class or function in isolation, dependencies mocked | developer; JUnit 5, Mockito, Jest | {{InterestCalculator.monthly()}} |
| Integration | several components together: API + database, service + queue | developer; @SpringBootTest, Testcontainers, MockMvc | repository query against real PostgreSQL |
| System (end to end) | the whole deployed application against requirements | QA; Cypress, Playwright, Selenium | PO user submits a report in the browser |
| Acceptance (UAT) | whether it meets the business need | users/client | PKSF officers approve the release |

- **Black-box:** test from the specification without seeing the code (equivalence partitioning, boundary values). **White-box:** test with knowledge of the code (statement, branch and path coverage).
- **Test pyramid:** many fast unit tests, fewer integration tests, few slow end-to-end tests.
- Also: **regression** testing re-runs existing tests after a change; **smoke** testing is a quick check that a build is worth testing further; performance and security testing are **non-functional**.
+ 2 | Unit vs integration, correctly distinguished | unit, integration
+ 1.5 | System and acceptance testing, and who performs them | system, acceptance/UAT
+ 1.5 | Black-box vs white-box with a technique for each | black-box, white-box/boundary/coverage
+ 1 | Test pyramid, regression or smoke testing | pyramid/regression/smoke

## Explain four design patterns (Singleton, Factory, Strategy, Observer) and where Spring uses each.
@concept 8
- **Singleton** (creational): one instance, shared. Spring beans are singleton-scoped by default (one per ApplicationContext).
- **Factory Method** (creational): creation is delegated to a method, so callers depend on an interface and not on a concrete class. {{BeanFactory.getBean()}}, {{@Bean}} methods, {{LoggerFactory.getLogger()}}.
- **Strategy** (behavioural): interchangeable algorithms behind one interface, chosen at runtime. Injecting a {{PasswordEncoder}} or one of several {{PaymentGateway}} implementations; {{Comparator}}.
- **Observer** (behavioural): subjects notify subscribed listeners of events without knowing them. {{ApplicationEventPublisher}} with {{@EventListener}}; RxJS Observables in Angular; message consumers.

~~~java
interface InterestStrategy { BigDecimal interest(Loan loan); }            // Strategy
@Component("flat")      class FlatRate implements InterestStrategy { /* ... */ }
@Component("declining") class DecliningBalance implements InterestStrategy { /* ... */ }

@Service class LoanService {
  private final Map<String, InterestStrategy> strategies;                 // Spring injects every implementation by bean name
  LoanService(Map<String, InterestStrategy> strategies) { this.strategies = strategies; }
  BigDecimal interest(Loan l) { return strategies.get(l.getProduct().getMethod()).interest(l); }
}
~~~
- Other patterns in Spring: **Proxy** (AOP, @Transactional), **Template Method** (JdbcTemplate), **Builder**, **Adapter**, **Decorator**. Patterns give a shared vocabulary; overusing them adds needless indirection.
+ 2 | Singleton and Factory explained | single instance/one instance, factory
+ 2 | Strategy explained with interchangeable implementations | strategy, interface
+ 1.5 | Observer explained with events/listeners | event/listener/subscribe
+ 1.5 | A Spring (or JDK) usage for each | bean, EventListener/ApplicationEvent
+ 1 | A code example, or other patterns such as Proxy/Template Method | proxy/template

## Explain a Git branching workflow for a team, including pull requests, merge vs rebase, and how you resolve a conflict.
@concept 6
1. **Branch:** {{git switch -c feature/po-report-upload}} from an up-to-date {{main}}. Keep branches short-lived.
2. **Commit** small, logical changes with clear messages; push the branch.
3. **Pull/merge request:** CI runs the build, tests and static analysis; at least one reviewer checks correctness, tests, security and readability.
4. **Merge** into main when approved and green; main is protected (no direct pushes) and always deployable. Tag releases ({{v1.4.0}}).

- **Merge vs rebase:** {{git merge}} keeps both histories and adds a merge commit, so history is true but branching. {{git rebase main}} replays your commits on top of main, giving a linear history but **rewriting commit hashes**: never rebase commits that others have already pulled. Squash-merge puts one commit per feature on main.
- **Conflict:** Git marks the file with {{<<<<<<<}}, {{=======}} and {{>>>>>>>}}. Edit it to the correct combined result, run the tests, {{git add}} the file, then {{git commit}} (or {{git rebase --continue}}).
- **Workflows:** **trunk-based** or GitHub Flow (main plus short feature branches) suits CI/CD; **Git Flow** adds develop, release and hotfix branches for scheduled releases.
- Useful: {{git revert}} safely undoes a pushed commit; {{git stash}} shelves work; {{git cherry-pick}} copies one commit, for example to a hotfix branch.
+ 1.5 | Feature branch from main, small commits | branch
+ 1.5 | Pull request with CI and code review; protected main | pull request/merge request, review
+ 1.5 | Merge vs rebase, with the shared-history warning | rebase, merge
+ 1.5 | Conflict resolution steps, or names a workflow (trunk-based/Git Flow) | conflict/trunk/Git Flow

## Distinguish functional and non-functional requirements, with examples for a PO report-submission system.
@compare 6
| | Functional | Non-functional |
|---|---|---|
| Describes | **what** the system does: features and behaviour | **how well** it does it: quality attributes and constraints |
| Written as | user stories, use cases | measurable targets |
| Verified by | functional and acceptance tests | load, security and usability tests; monitoring |

**Functional examples**
- A PO user can upload the monthly financial report as an Excel file.
- The system validates each row and lists the errors.
- A PKSF officer can approve or reject a report with a comment; the PO is notified.

**Non-functional examples**
- **Performance:** a 50,000-row file is processed within 5 minutes; pages respond in under 2 seconds at the 95th percentile.
- **Security:** SSO through Keycloak, role-based access, data encrypted in transit and at rest, full audit trail.
- **Availability:** 99.5% uptime; daily backups with a recovery point of at most 24 hours.
- **Usability/accessibility:** works on a field officer's phone; Bangla and English.
- **Maintainability:** 80% unit-test coverage; documented APIs.

- A good requirement is specific, **measurable** and testable: "fast" is not a requirement, "under 2 seconds for 95% of requests" is.
+ 1.5 | Correct definition of each (what vs how well) | what, how well/quality
+ 1.5 | Three functional examples for the system | upload, approve
+ 2 | Non-functional examples in at least three categories | performance, security, availab
+ 1 | Requirements must be measurable and testable | measurable/testable
