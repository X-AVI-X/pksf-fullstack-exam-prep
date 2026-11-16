## Design bulk upload and asynchronous processing of monthly financial reports from Partner Organisations.
1. **Upload**: React/Angular uploads the file (multipart, or a pre-signed URL to object storage); show progress.
2. **API** validates type/size, stores the file (MinIO/S3/disk), inserts an {{upload_job}} row (PENDING), publishes a message to RabbitMQ (or launches a Spring Batch job), returns **202** + job id.
3. **Worker**: Spring Batch chunk step reads rows (streaming), validates (mandatory fields, totals, PO ownership), writes with JDBC batching; invalid rows go to an error table.
4. **Status**: job row updated (RUNNING, COMPLETED, FAILED; counts); UI polls {{GET /jobs/{id}}} or receives a WebSocket/STOMP push; a downloadable error report.
5. **Reliability**: idempotency (file checksum, unique per PO + month), retries, DLQ, restartable jobs.
6. **Security**: PO users may only upload for their own PO; audit log; virus scan.
7. **Observability**: metrics on job duration and failures, alerts in Grafana.
## Production DB latency is spiking. How do you troubleshoot it?
1. **Confirm** in Grafana: which endpoints are slow (p95/p99), since when, correlated with deploys or traffic.
2. **Trace** a slow request (trace ID) to see time spent in DB vs app vs external calls.
3. **DB side**: pg_stat_statements top queries, {{pg_stat_activity}} for locks/long transactions, EXPLAIN ANALYZE, missing indexes, bloat/vacuum, CPU/IO of the DB host.
4. **App side**: HikariCP metrics (active, pending connections, acquire time), N+1 queries, transactions held open during remote calls.
5. **Logs** in Kibana filtered by correlation ID and error level.
6. **Fix and verify**: index/query fix, pool sizing, caching, then watch the dashboard return to baseline; add an alert so it's caught earlier next time.
## Set up monitoring for a Spring Boot microservice.
- Add {{spring-boot-starter-actuator}} and {{micrometer-registry-prometheus}}; expose {{health,info,prometheus}}.
- Prometheus scrape config (or a ServiceMonitor in Kubernetes) for {{/actuator/prometheus}}.
- Grafana dashboards: JVM (heap, GC), HTTP (rate, errors, duration: RED method), HikariCP, custom business metrics ({{Counter}} for reports submitted).
- Logs: JSON logs to stdout, Filebeat/Fluent Bit to Logstash/Elasticsearch, Kibana searches.
- Traces: Micrometer Tracing + OpenTelemetry exporter to Zipkin/Jaeger/Tempo.
- Alerts: error rate > 5%, p95 > 1s, pod restarts, DB connections exhausted.
