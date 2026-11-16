## Design bulk upload and asynchronous processing of monthly financial reports from Partner Organisations.
1. **Upload**: React/Angular uploads the file (multipart, or a pre-signed URL to object storage); show progress.
2. **API** validates type/size, stores the file (MinIO/S3/disk), inserts an {{upload_job}} row (PENDING), publishes a message to RabbitMQ (or launches a Spring Batch job), returns **202** + job id.
3. **Worker**: Spring Batch chunk step reads rows (streaming), validates (mandatory fields, totals, PO ownership), writes with JDBC batching; invalid rows go to an error table.
4. **Status**: job row updated (RUNNING, COMPLETED, FAILED; counts); UI polls {{GET /jobs/{id}}} or receives a WebSocket/STOMP push; a downloadable error report.
5. **Reliability**: idempotency (file checksum, unique per PO + month), retries, DLQ, restartable jobs.
6. **Security**: PO users may only upload for their own PO; audit log; virus scan.
7. **Observability**: metrics on job duration and failures, alerts in Grafana.
+ 2 | Upload API validates and stores the file, returns 202 + job id | 202/job
+ 2 | Async worker (Spring Batch) with chunk validation | Batch, chunk
+ 2 | Status tracking and error report for the user | status, error
+ 2 | Idempotency, retries and security (own PO only) | idempot
+ 2 | Observability and alerts | metric/alert

## Production DB latency is spiking. How do you troubleshoot it?
1. **Confirm** in Grafana: which endpoints are slow (p95/p99), since when, correlated with deploys or traffic.
2. **Trace** a slow request (trace ID) to see time spent in DB vs app vs external calls.
3. **DB side**: pg_stat_statements top queries, {{pg_stat_activity}} for locks/long transactions, EXPLAIN ANALYZE, missing indexes, bloat/vacuum, CPU/IO of the DB host.
4. **App side**: HikariCP metrics (active, pending connections, acquire time), N+1 queries, transactions held open during remote calls.
5. **Logs** in Kibana filtered by correlation ID and error level.
6. **Fix and verify**: index/query fix, pool sizing, caching, then watch the dashboard return to baseline; add an alert so it's caught earlier next time.
+ 1.5 | Confirm scope in Grafana (endpoints, p95, timing) | p95
+ 1.5 | Trace a slow request (DB vs app) | trace
+ 2 | DB-side checks: pg_stat_statements, locks, EXPLAIN | pg_stat
+ 1.5 | App-side: HikariCP pool, N+1 | Hikari
+ 1.5 | Fix and verify; prevent recurrence | verify

## Set up monitoring for a Spring Boot microservice.
- Add {{spring-boot-starter-actuator}} and {{micrometer-registry-prometheus}}; expose {{health,info,prometheus}}.
- Prometheus scrape config (or a ServiceMonitor in Kubernetes) for {{/actuator/prometheus}}.
- Grafana dashboards: JVM (heap, GC), HTTP (rate, errors, duration: RED method), HikariCP, custom business metrics ({{Counter}} for reports submitted).
- Logs: JSON logs to stdout, Filebeat/Fluent Bit to Logstash/Elasticsearch, Kibana searches.
- Traces: Micrometer Tracing + OpenTelemetry exporter to Zipkin/Jaeger/Tempo.
- Alerts: error rate > 5%, p95 > 1s, pod restarts, DB connections exhausted.
+ 2 | Actuator + Micrometer Prometheus endpoint | actuator, prometheus
+ 2 | Prometheus scrape and Grafana dashboards (RED, JVM, pool) | Grafana
+ 2 | Centralised JSON logs to ELK | ELK/Logstash
+ 2 | Distributed tracing | trac
+ 2 | Alerts with sensible thresholds | alert

## Design tables to track bulk file uploads from POs and their row-level validation errors.
@schema 8
~~~sql
CREATE TABLE upload_job (
  id           BIGSERIAL PRIMARY KEY,
  po_id        BIGINT NOT NULL REFERENCES po,
  file_name    TEXT NOT NULL,
  file_sha256  CHAR(64) NOT NULL,
  status       VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','PROCESSING','DONE','FAILED')),
  total_rows   INT, ok_rows INT, error_rows INT,
  uploaded_by  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at  TIMESTAMPTZ,
  UNIQUE (po_id, file_sha256)                       -- reject duplicate uploads
);
CREATE TABLE upload_error (
  id        BIGSERIAL PRIMARY KEY,
  job_id    BIGINT NOT NULL REFERENCES upload_job ON DELETE CASCADE,
  row_no    INT NOT NULL,
  field     TEXT,
  message   TEXT NOT NULL
);
CREATE INDEX ON upload_job (po_id, created_at DESC);
CREATE INDEX ON upload_error (job_id, row_no);
~~~
- job 1─N error. The status drives the UI progress bar (polled via {{GET /uploads/{id}}}). The file hash prevents re-processing. The Spring Batch JobRepository tables can hold step metadata, while these tables are the business view.
+ 2 | upload_job with status, counts, uploader, timestamps | status
+ 2 | upload_error with job FK and row number/message | row
+ 2 | Duplicate detection (hash/unique) and status CHECK | unique/hash
+ 2 | Indexes and relationship cardinality explained | index
