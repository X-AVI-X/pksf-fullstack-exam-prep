## Monolith vs microservices: trade-offs, and which would you choose for PKSF?
- **Monolith**: simple to build, test, deploy and debug; one database and ACID transactions; scales as a whole. Risk: tight coupling as it grows.
- **Microservices**: independent deploys and scaling, team autonomy, fault isolation, tech flexibility. Cost: network calls, distributed transactions, observability, DevOps maturity.
- A sensible answer: start with a **modular monolith** with clear boundaries (members, loans, reporting, identity), extract services where scaling or team needs justify it (e.g. report generation, notifications), with Keycloak, a gateway and centralised logging in place first.
+ 2 | Monolith trade-offs | monolith
+ 2 | Microservices trade-offs | microservice
+ 2 | Recommendation for PKSF (modular monolith first) with justification | modular

## List REST API design best practices.
- Nouns and plural resources: {{GET /api/v1/partner-orgs/{id}/branches}}.
- Correct methods and status codes (201 + Location, 204, 400, 401, 403, 404, 409, 422, 429).
- Pagination, filtering, sorting: {{?page=0&size=20&sort=name,asc&district=Dhaka}}.
- Consistent error body (ProblemDetail: type, title, status, detail, errors).
- Versioning; backward compatibility; idempotency keys for POST payments.
- Security: HTTPS, OAuth2/JWT, input validation, rate limiting, no sensitive data in URLs.
- Documentation with OpenAPI; ETags for caching/concurrency.
+ 2 | Resource naming and HTTP verbs | noun/plural
+ 2 | Status codes and consistent error body | status, ProblemDetail
+ 2 | Pagination/filtering/sorting | page
+ 2 | Versioning, idempotency, OpenAPI docs | version, OpenAPI
+ 2 | Security: HTTPS, auth, validation, rate limiting | rate limit

## How do you keep data consistent across services (distributed transaction)?
- Avoid 2PC; use a **saga**. Example: Disbursement service reserves funds > Loan service creates the loan > Notification service sends SMS. If the loan step fails, a compensating action releases the funds.
- **Choreography**: services react to each other's events. **Orchestration**: one orchestrator tells each step what to do (easier to follow).
- **Transactional outbox**: write the business row and an outbox event in the same local transaction; a relay publishes the outbox to RabbitMQ/Kafka. Consumers must be **idempotent** (dedupe by event id).
+ 2 | Rejects 2PC and explains saga with compensation | saga, compensat
+ 2 | Choreography vs orchestration | choreography, orchestration
+ 2 | Transactional outbox for reliable events | outbox
+ 2 | Idempotent consumers / eventual consistency | idempot

## REST vs SOAP?
- **REST**: architectural style over HTTP, resources and verbs, usually JSON, lightweight, cacheable, OpenAPI docs.
- **SOAP**: protocol, XML envelope, WSDL contract, WS-Security / WS-ReliableMessaging, works over HTTP/SMTP; common in banking and government integrations.
- Choose SOAP when integrating with systems that require it (e.g. some bank or government gateways); REST for new web/mobile APIs.
+ 2 | REST: style, resources, JSON, lightweight | JSON
+ 2 | SOAP: protocol, XML envelope, WSDL, WS-Security | WSDL
+ 2 | When to choose SOAP (legacy bank/government integration) | bank/legacy

## What is idempotency? Give an HTTP example.
@short 2
An operation is **idempotent** if repeating it gives the same server state as doing it once. {{PUT /pos/7}} with the same body and {{DELETE /pos/7}} are idempotent; {{POST /loans}} is not (each call creates a loan) unless you use an Idempotency-Key.
+ 1 | Correct definition (same effect when repeated) | same/repeat
+ 1 | Correct example (PUT/DELETE vs POST) | PUT/DELETE
