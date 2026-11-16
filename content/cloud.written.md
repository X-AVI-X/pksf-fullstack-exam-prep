## Design a high-level architecture for a PO financial reporting system.
- **Clients**: React/Angular web app (Material UI) for PKSF staff and PO users; responsive for field use.
- **Edge**: NGINX/Ingress with TLS, API gateway (rate limit, routing), Keycloak for SSO.
- **Services** (Spring Boot): Identity/PO management, Report submission, Validation & processing (Spring Batch workers via RabbitMQ), Notifications, Reporting/analytics.
- **Data**: PostgreSQL (transactional, partitioned by period), Redis (cache, sessions), object storage for files, read replica or warehouse for analytics.
- **Ops**: Docker images, Kubernetes, GitLab CI/GitHub Actions, Flyway migrations, Prometheus + Grafana, ELK, backups with PITR.
- **Security**: RBAC + PO-level data isolation, encryption in transit and at rest, audit trail of who changed what.
+ 2 | Clients and edge (Ingress/TLS, gateway, Keycloak) | gateway, Keycloak
+ 2 | Services split by responsibility | service
+ 2 | Data stores and async processing | PostgreSQL, Redis
+ 2 | Security: RBAC + PO-level isolation, encryption, audit | RBAC
+ 2 | Ops: containers, CI/CD, monitoring | Kubernetes, Prometheus

## How do you make a service stateless and horizontally scalable?
@concept 6
- No in-memory sessions (JWT or Spring Session in Redis).
- Files in object storage, not local disk.
- Scheduled jobs guarded by a distributed lock (ShedLock/Redis) so only one replica runs them.
- Idempotent handlers; externalised config; health probes; graceful shutdown.
+ 2 | Sessions out of memory (JWT/Redis) | Redis/JWT
+ 1.5 | Files to object storage | object storage
+ 1.5 | Distributed lock for scheduled jobs | lock
+ 1 | Idempotency, external config, probes, graceful shutdown | idempot

## Draw and explain the architecture of a PKSF loan platform (React/Angular + Spring Boot microservices) with SSO.
@arch 10
~~~
 PO users (browser / mobile)
        │ HTTPS
   ┌────▼─────┐   OIDC login (Auth Code + PKCE)   ┌──────────┐
   │ SPA (CDN)│ ───────────────────────────────►  │ Keycloak │
   └────┬─────┘                                   └────▲─────┘
        │ Bearer JWT                                   │ JWKS
   ┌────▼──────────┐  (TLS, rate limit, routing)       │
   │  API Gateway  │───────────────────────────────────┘
   └─┬─────┬─────┬─┘
     │     │     │
 ┌───▼─┐ ┌─▼───┐ ┌▼────────┐      ┌───────────┐
 │ PO  │ │Loan │ │Reporting│◄────►│  Redis    │ cache, sessions, rate limits
 │ svc │ │ svc │ │  svc    │      └───────────┘
 └──┬──┘ └─┬───┘ └──┬──────┘
    │      │ events │ (RabbitMQ / Kafka: LoanDisbursed → reports, SMS)
 ┌──▼──────▼──┐  ┌──▼─────────┐
 │ PostgreSQL │  │ MongoDB /  │      Logs → ELK · Metrics → Prometheus/Grafana · Traces → OpenTelemetry
 │ (per svc)  │  │ file store │      Deploy: Docker → Kubernetes via GitLab CI/GitHub Actions
 └────────────┘  └────────────┘
~~~
- **Flow:** the user logs in at Keycloak and the SPA gets a JWT. Each call goes through the gateway, and each service validates the JWT (signature via JWKS, roles for RBAC).
- **Data:** a database per service; cross-service updates use events or the outbox pattern (eventual consistency) rather than distributed transactions.
- **Scaling and resilience:** stateless pods with an HPA, Redis for cache and sessions, circuit breakers and timeouts between services, async Spring Batch jobs for bulk uploads.
- **Security:** TLS everywhere, secrets in K8s Secrets or Vault, encryption at rest, audit logs, least-privilege DB users.
+ 2.5 | Correct components: SPA, gateway, services, DBs, cache, queue, IdP | gateway, keycloak, redis
+ 2 | Request/auth flow explained (OIDC/JWT/JWKS) | JWT
+ 2 | Security measures (TLS, RBAC, secrets, encryption) | TLS/RBAC
+ 2 | Scalability and resilience (stateless, HPA, circuit breaker, async) | stateless/HPA/circuit
+ 1.5 | Observability and CI/CD | prometheus/ELK, CI


## Design an SMS notification system that texts members when a loan is disbursed, without slowing the loan API.
@arch 8
~~~
Loan svc ──(same DB tx: loan row + outbox row)──► outbox table
                                                     │ relay (poller / Debezium)
                                                     ▼
                                       RabbitMQ: loan.disbursed ──► Notification svc ──► SMS gateway
                                                     │ retries with backoff        │
                                                     └──► DLQ (after N failures)   └─ notification_log (idempotency key)
~~~
- The API commits the loan and an **outbox** event in one transaction (no lost or phantom messages) and returns immediately.
- The notification service consumes **asynchronously**, sends SMS, and records it by event id, so redelivery doesn't send twice (**idempotent consumer**).
- Retries with exponential backoff, then a **dead-letter queue** plus an alert. Rate-limit calls to the SMS provider and put a circuit breaker around it.
- Templates are stored in Bangla and English; monitor queue depth and failure rate in Grafana.
+ 2 | Asynchronous messaging decouples API from SMS | queue/async
+ 2 | Reliable publishing (outbox or transactional publish) | outbox
+ 2 | Idempotency and retry/DLQ handling | idempot, DLQ/dead
+ 2 | Failure isolation and monitoring (circuit breaker, rate limit, metrics) | circuit/monitor
