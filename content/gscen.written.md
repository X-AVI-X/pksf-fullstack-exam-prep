## PKSF's portal has 10,000 active users today and must support 80,000 concurrent users next year. Management rejects cloud migration for budget and data-sovereignty reasons. What would you propose, and why?
@arch 10
**Constraints:** 8× growth, **on-premises only** (PKSF's own data centre or the government's national data centre), financial data, a limited budget. So: **scale horizontally on owned hardware, and cut the load per request.**

**1. Measure and size first.** Load-test today's system (JMeter/Gatling) to find the throughput per node and the bottleneck. Estimate the target: if 80,000 concurrent users each make a request every ~20 s, that's ≈ **4,000 requests/s at peak**. At ~500 req/s per app node, you need **8–10 nodes** plus 30% headroom.

**2. Architecture:**
~~~
Users → [L4/L7 load balancer pair: HAProxy/Nginx + keepalived]
      → [Nginx: TLS, static/CDN-like caching, rate limiting]
      → [Stateless Spring Boot nodes ×N on on-prem Kubernetes (or VMs), HPA]
      → [Redis cluster: sessions + hot data cache]
      → [PostgreSQL primary + 2 streaming read replicas, PgBouncer]
      → [RabbitMQ/Kafka + workers: reports, bulk uploads, notifications]
~~~
**3. Key measures:**
- **Stateless app tier:** move sessions to Redis (Spring Session) or JWT, so any node can serve any user and nodes can be added freely.
- **Caching:** dashboards and reference data (PO lists, programme master data) in Redis with a TTL; HTTP caching and compressed static assets in Nginx; serve the frontend as static files.
- **Database:**
  - fix slow queries and add indexes (pg_stat_statements);
  - use **PgBouncer** connection pooling;
  - send reads and reports to **read replicas**;
  - **partition** large tables by month;
  - use materialised views for aggregates.
- **Async work:** report generation and bulk uploads go to a **queue with workers** (Spring Batch), so user requests return quickly.
- **Protect the system:** rate limiting, timeouts, circuit breakers (Resilience4j), graceful degradation (serve a cached dashboard if the database is slow).
- **Hardware:** commodity servers for the app tier; NVMe SSDs and more RAM for the database server, where vertical scaling still pays off.
- **Operations:** Prometheus/Grafana and ELK dashboards and alerts; CI/CD with rolling deployments; DR backups to a second on-prem site.

**4. Why this works without the cloud:** horizontal scaling plus caching plus async processing multiplies capacity on commodity servers. The data never leaves Bangladesh-controlled infrastructure, and the cost grows step by step instead of needing one huge server.

**5. Verify:** run a load test at 1.3× the target before go-live; plan capacity every quarter.
+ 1 | Acknowledges constraints (no cloud, sovereignty, budget) | on-prem
+ 1 | Sizing/measurement with numbers or load test | load test, req/s
+ 2 | Stateless app nodes behind a load balancer (horizontal scaling) | load balancer, stateless
+ 2 | Caching (Redis/Nginx) and DB scaling (pooling, replicas, indexes, partitioning) | redis, replica
+ 2 | Async processing with queues for heavy work | queue
+ 1 | Resilience: rate limiting, circuit breakers, degradation | rate limit/circuit
+ 1 | Monitoring and verification | prometheus/grafana

## A server with a fast CPU and plenty of RAM shows low CPU utilisation, but API responses are slow (high latency). What could cause this, how would you find the cause, and what would you upgrade or change?
@scenario 10
**Interpretation:** low CPU plus high latency means requests are **waiting, not computing**. Buying a faster CPU would not help. The bottleneck is I/O, a dependency, contention or a configuration limit.

**Likely causes:**
1. **Slow database queries:** a missing index, N+1 queries from JPA, lock waits.
2. **An exhausted connection pool** (HikariCP's default is 10): threads queue for a connection.
3. **Disk I/O:** HDD or slow storage, heavy logging, swap. Look for high **iowait**.
4. **Network or downstream latency:** a slow external API (SMS gateway, SOAP service), DNS, no timeouts.
5. **Thread-pool limits:** Tomcat's max threads reached, or blocking calls on few threads.
6. **Lock contention or synchronisation** in the application; **GC pauses** (would show in GC logs).

**How to diagnose (measure, don't guess):**
| Step | Tool | Look for |
|---|---|---|
| End-to-end latency by endpoint | Grafana (Micrometer → Prometheus), p95/p99 | which endpoints are slow |
| Where time goes in a request | distributed tracing (OpenTelemetry/Zipkin), APM | DB vs external call vs app code |
| Database | {{pg_stat_statements}}, slow-query log, {{EXPLAIN ANALYZE}}, {{pg_stat_activity}} (wait events) | slow plans, lock waits |
| Connection pool | Hikari metrics: active, pending, timeouts | pending > 0 |
| OS | {{iostat}}, {{vmstat}}, {{top}} (wa%) | iowait, swap |
| JVM threads | thread dump ({{jstack}}), GC logs | threads BLOCKED/WAITING on the same lock or on socket reads |

**Fixes, matched to the cause:**
- **DB:** add indexes, fix N+1 with fetch joins or entity graphs, rewrite queries, add read replicas for reports.
- **Pool:** size HikariCP to the database's capacity, roughly (cores × 2) + effective spindles per instance; shorten transactions.
- **Disk:** **upgrade HDD → NVMe SSD**; send logs asynchronously or ship them to ELK; remove swapping.
- **Network/downstream:** set connect and read timeouts, retries with backoff, circuit breakers; cache responses; make the calls asynchronous through a queue.
- **Concurrency:** remove coarse {{synchronized}} blocks; use non-blocking I/O or virtual threads (Java 21) for I/O-heavy endpoints.
- **Caching:** Redis for repeated reads.

**Verify:** compare p95 latency before and after, under the same load test.
+ 2 | Recognises waiting (I/O/DB/network) not CPU-bound | i/o, wait
+ 2 | At least four plausible causes (DB, pool, disk, downstream, threads) | pool, index
+ 3 | Systematic diagnosis with named tools/metrics | pg_stat_statements/explain, thread dump, prometheus
+ 2 | Fixes matched to cause, including SSD upgrade and timeouts/caching | ssd, timeout
+ 1 | Verify with before/after measurement | p95

## At month-end, 2,000 partner organisations upload large Excel files of loan data at the same time, and the upload API times out while report generation slows the whole system. Redesign the flow.
@arch 10
**Problem:** heavy work (parsing, validation, inserting millions of rows, generating reports) runs **inside the HTTP request**. Requests time out, threads and database connections are held for minutes, and the peak brings everything down.

**Redesign: accept quickly, process asynchronously.**
~~~
PO → POST /uploads (multipart, size-limited) → store file in object storage (MinIO/NFS)
   → insert upload record (status=RECEIVED) → publish message to queue → return 202 Accepted + uploadId
Queue (RabbitMQ/Kafka) → worker pool (Spring Batch jobs, N workers, autoscaled)
   → read in chunks (e.g. 1,000 rows) → validate → write to staging table → merge to main tables
   → status=COMPLETED / FAILED with an error file (row, column, reason)
PO polls GET /uploads/{id} or gets a WebSocket/email notification
Reports: generated by scheduled/queued jobs from read replicas or materialised views → stored files
~~~
**Key design points:**
1. **202 Accepted plus a status resource**, instead of keeping the request open. Return an {{uploadId}}.
2. **Spring Batch chunk processing:** {{ItemReader}} (stream the Excel with Apache POI's streaming {{SXSSF}}/{{XSSFReader}}, not loading the whole file), {{ItemProcessor}} (validate), {{ItemWriter}} (JDBC batch insert). The job can be **restarted** from the last committed chunk after a failure, and bad rows are skipped and logged (skip policy).
3. **Idempotency:** a file checksum plus {{(po_id, period)}} uniqueness, so a re-upload doesn't double-count.
4. **Back-pressure:** the queue absorbs the peak, and the number of workers sets how hard the database is hit. Prioritise by deadline.
5. **Database:** bulk inserts into a **staging table**, then a set-based {{INSERT … SELECT}} merge; partition by period; heavy reports run against **replicas** or **materialised views**.
6. **Limits and security:** a maximum file size, type checks (real content type, not just the extension), virus scanning, per-PO rate limits, and the uploader authorised for their own PO only.
7. **Observability:** a queue-depth dashboard, job duration and failure alerts in Grafana; the progress percentage is shown to the PO.
8. **Spread the peak:** staggered deadlines per division, and early-submission reminders.
+ 2 | Identifies the root problem: heavy synchronous work in the request | synchronous, timeout
+ 2 | Async design: store file, queue, 202 + status endpoint | 202, queue
+ 2 | Spring Batch chunk processing, streaming read, restart/skip | chunk, spring batch
+ 1 | Idempotency/duplicate protection | idempoten
+ 2 | DB strategy (staging + bulk insert; reports from replicas/MVs) | staging, replica
+ 1 | Security limits or observability | virus/size, monitor

## Design a secure API through which partner organisations' own software sends PKSF their monthly loan data automatically (system-to-system integration).
@arch 10
**Context:** around 200+ POs, each with its own MIS, push monthly data to PKSF (like the "Amader PKSF" API reporting). No human is involved, so authentication is **machine-to-machine**.

**Design:**
~~~
PO system ──HTTPS (TLS 1.2+, optionally mTLS)──▶ API gateway (rate limit, size limit, WAF)
   │ 1. POST /oauth/token (client_credentials)  ◀── Keycloak issues JWT (scope=report:submit, po_id claim)
   │ 2. POST /api/v1/reports  Authorization: Bearer <JWT>, Idempotency-Key: <uuid>
   ▼
Report service (Spring Boot): validate JWT (signature, expiry, audience) → check po_id claim == payload PO
   → validate schema (OpenAPI/JSON Schema) → enqueue for processing → 202 Accepted + reportId
   → audit log (who, when, checksum)
~~~
**Security controls:**
1. **Authentication:** an OAuth2 **client-credentials** grant. Each PO is a Keycloak client with its own secret or, better, **private_key_jwt or mutual TLS** (a client certificate). Short-lived access tokens of 5–15 minutes.
2. **Authorisation:** scopes ({{report:submit}}) plus a **PO-ownership check**: a PO can only submit or read its own data. Enforce it in the service, not just the gateway.
3. **Transport:** HTTPS only, HSTS, TLS 1.2+. With mTLS, the network itself authenticates the PO.
4. **Integrity and non-repudiation:** a SHA-256 checksum of the payload, or a **JWS-signed** payload, so PKSF can prove what the PO sent.
5. **Input validation:** a strict schema, size limits, rejection of unknown fields; parameterised persistence.
6. **Abuse protection:** per-client rate limits, WAF rules, an **Idempotency-Key** so retries don't create duplicates.
7. **Versioning and contract:** {{/api/v1}}, a published **OpenAPI** spec, a sandbox environment for PO developers, and deprecation notices before breaking changes.
8. **Auditing and monitoring:** an immutable audit log, ELK dashboards, alerts on authentication failures and unusual volume, and secret rotation.
9. **Legacy POs:** offer a **SOAP/WSDL** endpoint or secure file upload (SFTP) as a fallback, mapped into the same processing pipeline.
+ 2 | Machine-to-machine auth: OAuth2 client credentials / mTLS via Keycloak | client credentials, mtls
+ 2 | Authorisation: scopes + PO ownership check | scope, ownership/po_id
+ 2 | Transport and integrity: TLS, checksum/signature | tls, signature/checksum
+ 2 | Validation, rate limiting, idempotency | rate limit, idempoten
+ 1 | Versioning/OpenAPI contract | openapi
+ 1 | Audit logging and monitoring | audit

## A Spring Boot service was deployed to Kubernetes and now restarts every few minutes (CrashLoopBackOff), and some requests fail with 502 during restarts. How do you troubleshoot and fix it?
@scenario 10
**Step 1: gather evidence.**
~~~bash
kubectl get pods -n dss                       # STATUS, RESTARTS
kubectl describe pod <pod> -n dss             # Events: OOMKilled? Liveness probe failed? Image pull?
kubectl logs <pod> -n dss --previous          # logs of the crashed container
kubectl top pod <pod> -n dss                  # memory/CPU vs limits
~~~
**Step 2: match the evidence to the cause.**
| Evidence | Cause | Fix |
|---|---|---|
| {{Last State: OOMKilled}}, exit code 137 | memory limit too low, or heap not sized to the container | set {{-XX:MaxRAMPercentage=75}}; raise {{resources.limits.memory}}; find leaks with a heap dump |
| "Liveness probe failed" while the app is still starting | the probe fires before Spring Boot is up | add a **startupProbe**, or raise {{initialDelaySeconds}}/{{failureThreshold}}; use {{/actuator/health/liveness}} |
| Exception in the logs: cannot connect to the DB or Keycloak | wrong config or secret, dependency not ready | fix the ConfigMap/Secret; retries with backoff; check the network policy |
| {{ErrImagePull}} | wrong image tag or registry credentials | fix the tag; set imagePullSecrets |
| Exit code 1 right after start | bad config, missing environment variable, failed migration | read the log; validate config in CI |

**Why the 502s:** traffic reaches pods that aren't ready, or that are being killed. Fixes:
- a **readinessProbe** on {{/actuator/health/readiness}}, so only ready pods receive traffic;
- **graceful shutdown** ({{server.shutdown=graceful}}, a {{preStop}} sleep, {{terminationGracePeriodSeconds}});
- **at least 2 replicas** plus a rolling update with {{maxUnavailable: 0}} and a PodDisruptionBudget.

**Step 3: prevent it recurring.** Alert on restarts in Prometheus/Grafana ({{kube_pod_container_status_restarts_total}}), load-test in staging with the production limits, and keep a quick rollback ({{kubectl rollout undo}}).
+ 2 | Uses kubectl describe/logs --previous/top to gather evidence | describe, --previous
+ 3 | Identifies likely causes: OOMKilled, liveness before startup, config/dependency | oomkilled, liveness
+ 2 | Correct fixes: memory/heap sizing, startupProbe, config | startupprobe, maxrampercentage
+ 2 | Explains and fixes 502s: readiness probe, graceful shutdown, replicas/rolling update | readiness, graceful
+ 1 | Prevention: alerts, staging tests, rollback | alert, rollback
