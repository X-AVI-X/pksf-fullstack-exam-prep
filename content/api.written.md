## Monolith vs microservices: trade-offs, and which would you choose for PKSF?
- **Monolith**: simple to build, test, deploy and debug; one database and ACID transactions; scales as a whole. Risk: tight coupling as it grows.
- **Microservices**: independent deploys and scaling, team autonomy, fault isolation, tech flexibility. Cost: network calls, distributed transactions, observability, DevOps maturity.
- A sensible answer: start with a **modular monolith** with clear boundaries (members, loans, reporting, identity), extract services where scaling or team needs justify it (e.g. report generation, notifications), with Keycloak, a gateway and centralised logging in place first.
## List REST API design best practices.
- Nouns and plural resources: {{GET /api/v1/partner-orgs/{id}/branches}}.
- Correct methods and status codes (201 + Location, 204, 400, 401, 403, 404, 409, 422, 429).
- Pagination, filtering, sorting: {{?page=0&size=20&sort=name,asc&district=Dhaka}}.
- Consistent error body (ProblemDetail: type, title, status, detail, errors).
- Versioning; backward compatibility; idempotency keys for POST payments.
- Security: HTTPS, OAuth2/JWT, input validation, rate limiting, no sensitive data in URLs.
- Documentation with OpenAPI; ETags for caching/concurrency.
## How do you keep data consistent across services (distributed transaction)?
- Avoid 2PC; use a **saga**. Example: Disbursement service reserves funds > Loan service creates the loan > Notification service sends SMS. If the loan step fails, a compensating action releases the funds.
- **Choreography**: services react to each other's events. **Orchestration**: one orchestrator tells each step what to do (easier to follow).
- **Transactional outbox**: write the business row and an outbox event in the same local transaction; a relay publishes the outbox to RabbitMQ/Kafka. Consumers must be **idempotent** (dedupe by event id).
## REST vs SOAP?
- **REST**: architectural style over HTTP, resources and verbs, usually JSON, lightweight, cacheable, OpenAPI docs.
- **SOAP**: protocol, XML envelope, WSDL contract, WS-Security / WS-ReliableMessaging, works over HTTP/SMTP; common in banking and government integrations.
- Choose SOAP when integrating with systems that require it (e.g. some bank or government gateways); REST for new web/mobile APIs.
