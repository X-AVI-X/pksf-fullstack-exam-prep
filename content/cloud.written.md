## Design a high-level architecture for a PO financial reporting system.
- **Clients**: React/Angular web app (Material UI) for PKSF staff and PO users; responsive for field use.
- **Edge**: NGINX/Ingress with TLS, API gateway (rate limit, routing), Keycloak for SSO.
- **Services** (Spring Boot): Identity/PO management, Report submission, Validation & processing (Spring Batch workers via RabbitMQ), Notifications, Reporting/analytics.
- **Data**: PostgreSQL (transactional, partitioned by period), Redis (cache, sessions), object storage for files, read replica or warehouse for analytics.
- **Ops**: Docker images, Kubernetes, GitLab CI/GitHub Actions, Flyway migrations, Prometheus + Grafana, ELK, backups with PITR.
- **Security**: RBAC + PO-level data isolation, encryption in transit and at rest, audit trail of who changed what.
## How do you make a service stateless and horizontally scalable?
- No in-memory sessions (JWT or Spring Session in Redis).
- Files in object storage, not local disk.
- Scheduled jobs guarded by a distributed lock (ShedLock/Redis) so only one replica runs them.
- Idempotent handlers; externalised config; health probes; graceful shutdown.
