## Compare Waterfall and Agile (Scrum). Which suits PKSF's ITSD, and why?
@compare 6
| | Waterfall | Agile / Scrum |
|---|---|---|
| Flow | sequential phases | iterative 1–4 week sprints |
| Requirements | fixed up front | evolve; backlog re-prioritised |
| Delivery | once at the end | working increment every sprint |
| Customer | involved at start and end | continuous feedback (sprint review) |
| Change cost | high | low |
| Documentation | heavy | just enough |

PKSF's ITSD serves 200+ Partner Organisations whose needs change (new loan products, reports). **Agile** gives frequent feedback from PO users and lower risk; the ToR explicitly mentions sprint goals. Waterfall still fits fixed-scope regulatory work.
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
