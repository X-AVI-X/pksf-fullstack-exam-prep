## Write a unit test for a service using JUnit 5 and Mockito.
~~~java
@ExtendWith(MockitoExtension.class)
class PartnerOrgServiceTest {

  @Mock PartnerOrgRepository repo;
  @InjectMocks PartnerOrgService service;

  @Test
  void create_savesNewPartnerOrg() {
    var dto = new PartnerOrgDto(null, "PO-101", "Shakti Foundation");
    when(repo.existsByCode("PO-101")).thenReturn(false);
    when(repo.save(any())).thenAnswer(inv -> { PartnerOrg p = inv.getArgument(0); p.id = 1L; return p; });

    var saved = service.create(dto);

    assertEquals(1L, saved.id());
    verify(repo).save(argThat(p -> p.code.equals("PO-101")));
  }

  @Test
  void create_rejectsDuplicateCode() {
    when(repo.existsByCode("PO-101")).thenReturn(true);
    assertThrows(DuplicateException.class,
        () -> service.create(new PartnerOrgDto(null, "PO-101", "X")));
    verify(repo, never()).save(any());
  }
}
~~~
Arrange-Act-Assert; test the happy path and the failure path; name tests by behaviour.
+ 2 | @ExtendWith(MockitoExtension) with @Mock and @InjectMocks | @Mock, @InjectMocks
+ 2 | Arrange with when(...).thenReturn(...) | when
+ 2 | Assertions on result and exception (assertThrows) | assert
+ 2 | verify() interactions | verify

## Write a controller test with MockMvc.
~~~java
@WebMvcTest(PartnerOrgController.class)
class PartnerOrgControllerTest {
  @Autowired MockMvc mvc;
  @MockitoBean PartnerOrgService service;

  @Test
  void invalidBody_returns400() throws Exception {
    mvc.perform(post("/api/v1/partner-orgs")
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"code\":\"\",\"name\":\"\"}"))
       .andExpect(status().isBadRequest());
  }
}
~~~
(If security is on the classpath, add {{@WithMockUser}} or import the security config.)
+ 2 | @WebMvcTest slice with mocked service | @WebMvcTest
+ 2 | perform(get/post) with JSON content | perform
+ 2 | andExpect status and jsonPath | jsonPath
+ 2 | Validation/error case tested | 400

## Explain Scrum events and how a sprint runs.
- **Sprint** (1 to 4 weeks) contains everything.
- **Sprint Planning**: pick backlog items, set a sprint goal, break into tasks.
- **Daily Scrum** (15 min): progress toward the goal, impediments.
- **Sprint Review**: demo the increment to stakeholders, adapt the backlog.
- **Retrospective**: improve how the team works.
- Artifacts: Product Backlog (Product Goal), Sprint Backlog (Sprint Goal), Increment (Definition of Done).
+ 1 | Sprint timebox contains the events | sprint
+ 1 | Planning with sprint goal | planning
+ 1 | Daily Scrum | daily
+ 1 | Review vs Retrospective distinguished | review, retrospective
+ 1 | Artifacts and roles | backlog

## What is technical debt and how do you manage it?
Shortcuts that make future change slower (duplicated code, missing tests, outdated libraries). Manage it by making it visible in the backlog, refactoring in small steps covered by tests, the "boy scout rule", code reviews, static analysis (SonarQube), and reserving sprint capacity for it. Preserve backward compatibility while refactoring APIs (deprecate first, then remove in a new major version).
+ 1.5 | Definition with examples (shortcuts that slow future change) | shortcut
+ 1.5 | Make it visible in the backlog and reserve capacity | backlog
+ 1 | Refactor safely with tests, boy scout rule, reviews | refactor
+ 1 | Backward compatibility when changing APIs (deprecate first) | deprecat


## Write a frontend unit test: React component that loads POs and shows an error on failure (React Testing Library).
@code 8
~~~jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, expect } from 'vitest';
import PoList from './PoList';

test('shows POs from the API', async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 1, name: 'Shakti' }] });
  render(<PoList />);
  expect(await screen.findByRole('cell', { name: 'Shakti' })).toBeInTheDocument();   // waits for async render
  expect(fetch).toHaveBeenCalledWith('/api/v1/pos', expect.anything());
});

test('shows an error and can retry', async () => {
  global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 })
                        .mockResolvedValueOnce({ ok: true, json: async () => [] });
  render(<PoList />);
  expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
  await userEvent.click(screen.getByRole('button', { name: /retry/i }));
  expect(fetch).toHaveBeenCalledTimes(2);
});
~~~
- Prefer MSW (Mock Service Worker) for realistic HTTP mocking in larger suites. The Angular equivalent uses TestBed plus HttpTestingController.
+ 2 | Renders and queries by role/text (user-centric) | getByRole/findByRole
+ 2 | Mocks the HTTP layer (vi.fn/jest.fn/MSW) | mock
+ 2 | Awaits async UI with findBy* | findBy
+ 1 | Tests the failure path and the user interaction | alert, userEvent
+ 1 | Clear assertions on calls and output | toHaveBeenCalled

## Write an Angular test for a service that fetches Partner Organisations.
@code 6
~~~ts
describe('PoService', () => {
  let svc: PoService, http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    svc = TestBed.inject(PoService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());                       // no unexpected requests

  it('GETs /api/v1/pos', () => {
    let result: Po[] = [];
    svc.list().subscribe(r => (result = r));
    const req = http.expectOne('/api/v1/pos');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Shakti' }]);
    expect(result.length).toBe(1);
  });
});
~~~
+ 2 | TestBed with provideHttpClientTesting | TestBed, provideHttpClientTesting
+ 2 | expectOne + flush mock data | expectOne, flush
+ 1 | Asserts method and result | toBe
+ 1 | verify() in afterEach | verify

## How do you work with UI/UX designers, QA and DevOps during a sprint?
@descriptive 6
- **Refinement and planning:** review designs (Figma) and acceptance criteria with UX and QA *before* the sprint, and agree on a **Definition of Ready** (designs, API contract, test cases).
- **API contract first:** publish the OpenAPI spec early so frontend and backend work in parallel against a mock.
- **UX:** build to the design system, raise feasibility or accessibility concerns early, and demo work in progress.
- **QA:** share test data and environments, automate regression tests in CI, and fix bugs inside the sprint. **Definition of Done** = code reviewed, tests green, deployed to staging, QA passed, docs updated.
- **DevOps:** agree on environment configuration and secrets, add health checks and metrics, and pair on the pipeline and deployments.
- **Communication:** daily scrum, small PRs with clear descriptions, code reviews within a day, and feedback in the retrospective.
+ 1.5 | Early alignment: refinement, Definition of Ready, acceptance criteria | acceptance/Ready
+ 1.5 | Works with UX via design system and early feedback | design
+ 1.5 | QA: automation, test data, Definition of Done | Definition of Done
+ 1.5 | DevOps and communication practices (PR reviews, config, health checks) | review/pipeline
