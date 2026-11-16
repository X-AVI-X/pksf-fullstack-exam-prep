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
