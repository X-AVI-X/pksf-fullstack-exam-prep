## The testing pyramid
Many fast unit tests at the base, fewer integration tests in the middle, and a small number of end-to-end tests at the top. Unit tests run in milliseconds and pinpoint failures. End-to-end tests are slow and fragile, so reserve them for the critical user journeys.

@check
Q: Which layer should have the most tests in a healthy suite?
- End-to-end tests in a browser
- Manual testing
* Unit tests
- Load tests
E: Unit tests are fast, cheap and precise, so the pyramid is widest at that level.

## Unit tests and test doubles
A unit test checks one behaviour in isolation. Replace collaborators with test doubles: a stub returns fixed answers, a mock records and verifies calls, and a fake is a simple working version, such as an in-memory repository. Use Mockito in Java and Jest or Vitest in JavaScript.

@check
Q: A service test must not call the real payment gateway. Which test double is appropriate?
- A real call with a test account
* A mock or stub of the payment gateway interface
- Deleting the service
- Running the test in production
E: Substituting the gateway keeps the test fast and deterministic, and avoids real charges.

## Integration and end-to-end tests
Integration tests check that parts work together, such as a repository with a real PostgreSQL in a container. End-to-end tests drive the whole system through the user interface or API. Testcontainers starts real dependencies for integration tests, which is more reliable than an in-memory database that behaves differently.

@check
Q: Which test checks that a Spring repository's SQL works against a real PostgreSQL?
- A unit test with a mocked repository
* An integration test with a real database started for the test
- A static code analysis
- A visual regression test
E: A mocked repository never runs SQL. An integration test with a real database confirms the queries and mappings.

## Test-driven development and coverage
In test-driven development you write a failing test first, make it pass with the simplest code, then refactor while the tests stay green. Coverage shows which lines ran during tests. It finds gaps but does not prove the tests check the right things, so pair it with meaningful assertions.

@check
Q: What does a high line-coverage number NOT guarantee?
- That the code was executed by tests
* That the assertions check correct behaviour
- That the build compiles
- That the tests ran
E: Coverage measures execution, not verification. A test can run every line and assert nothing useful.
