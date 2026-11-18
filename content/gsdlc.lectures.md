## Why testing and SDLC questions appear
Section D of the ToR (testing, maintenance, agile collaboration) maps onto classic software-engineering questions:
- **ICB AMCL AP 2024:** what is the SDLC, and what are its phases?
- **Combined Bank SO-IT 2024 MCQs:** SRS verifiability, cohesion, boundary value analysis, integration testing, cyclomatic complexity.
- Typical written variants: waterfall versus agile, derive test cases with boundary value analysis, compute the cyclomatic complexity of a fragment.

The answer structure for "phases" questions: a numbered list where each phase has activity, then deliverable. Requirements produce an SRS; design produces an architecture, ERD or API specification. Examiners look for the deliverables.

@check
Q: In the SDLC, which is the main deliverable of the requirements phase?
- Source code
- Test results
* Software Requirements Specification (SRS)
- Deployment scripts
E: The requirements phase captures what the system must do, and the SRS records it. Code, tests and deployment come later.

## Cyclomatic complexity in 20 seconds
V(G) = number of decision points + 1. Count every if, else if, while, for, case, catch and ?:, and every && and || inside a condition. The result is the minimum number of test cases needed to cover every independent path.

Example: a method with one if, one else if and one && inside the first condition has decision points 1 + 1 + 1 = 3, so V(G) = 4.

@check
Q: A method has if (a > 0 && b > 0), followed by else if (c > 0), and a while loop. What is its cyclomatic complexity?
- 3
* 5
- 4
- 6
E: Decision points: the if (1), the && (1), the else if (1) and the while (1) make 4. V(G) = 4 + 1 = 5.

## Boundary value analysis in 20 seconds
For a valid range [min, max], test min − 1, min, min + 1, a nominal value, max − 1, max and max + 1. Combine it with equivalence partitioning: one test per class, below the range, valid, above the range, and wrong type or empty.

@check
Q: A loan amount must be between 1,000 and 50,000. Which set of boundary tests is most complete?
- 1,000 and 50,000 only
* 999, 1,000, 1,001, 49,999, 50,000, 50,001
- 0 and 100,000
- Any random amount
E: Boundary value analysis tests just outside, on, and just inside each limit, because off-by-one errors cluster at the edges.

## Verification versus validation
Verification asks "are we building the product right?" and checks the work against the specification, through reviews and inspections. Validation asks "are we building the right product?" and checks that it meets the user's need, through testing with users.

@check
Q: Which activity is validation rather than verification?
- A code review against the coding standard
- Checking that the SRS is complete
* Testing with real PO users to confirm the system meets their need
- Reviewing the database schema for normalisation
E: Validation confirms the product fits the user's need, which needs real users or their scenarios. The others check the work against a specification.

## Cohesion, coupling and integration testing
The goal is high cohesion and low coupling: each module does one related job and depends little on others. Integration testing checks the interfaces between modules, done step by step as modules join. It is not testing everything together at the end.

@check
Q: Which design goal is correct?
- High coupling and low cohesion
* High cohesion and low coupling
- High cohesion and high coupling
- Low cohesion and low coupling
E: Modules should be focused (cohesive) and depend little on each other (loosely coupled). This makes changes and testing easier.
