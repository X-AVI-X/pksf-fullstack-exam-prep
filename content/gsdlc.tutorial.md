### How it is asked
Section D of the ToR (testing, maintenance, agile collaboration) maps onto classic software-engineering questions:

- **ICB AMCL AP 2024:** what is SDLC, and what are its phases?
- **Combined Bank SO-IT 2024 MCQs:** SRS verifiability, cohesion, boundary value analysis, integration testing, cyclomatic complexity.
- Typical written variants: waterfall vs agile; derive test cases with boundary value analysis; compute the cyclomatic complexity of a code fragment.

### The answer structure
- **"Phases" questions:** a numbered list, where each phase has **activity → deliverable**. Requirements produce an **SRS**; design produces an **architecture/ERD/API spec**; and so on. Deliverables are what examiners look for.
- **"Technique" questions (BVA, cyclomatic complexity):** state the rule, then **apply it to the given input in a table**, then give the final number or test list.
- **Compare questions (waterfall vs agile):** a table, then which suits PKSF and why. The DSS project, with evolving requirements and sprint goals in the ToR, suits Agile/Scrum.

### Cyclomatic complexity in 20 seconds
**V(G) = number of decision points + 1.** Count every {{if}}, {{else if}}, {{while}}, {{for}}, {{case}}, {{catch}}, {{?:}}, and every {{&&}} and {{||}} inside a condition. The result is the **minimum number of test cases** needed to cover every independent path. The equivalent graph formula is V(G) = E − N + 2P.

### Boundary value analysis in 20 seconds
For a valid range [min, max], test **min − 1, min, min + 1, a nominal value, max − 1, max, max + 1**. Combine it with **equivalence partitioning**: one test per class (below the range, valid, above the range, wrong type or empty).

### Traps
- **Verification vs validation:** verification asks "are we building the product right?" (reviews, checks against the spec). Validation asks "are we building the right product?" (testing with users).
- **High cohesion and LOW coupling** is the goal. Students often write "high coupling".
- **Integration testing** checks the interfaces between modules; it is not "testing everything together at the end".
