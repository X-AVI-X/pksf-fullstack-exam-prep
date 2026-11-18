## The three pillars of observability
Observability means you can ask new questions about a running system from its outputs. Its three pillars are logs (timestamped events), metrics (numbers over time, such as request rate and p95 latency) and traces (the path of one request across services). Each answers a different question: logs say what happened, metrics say how much and how often, and traces say where time went.

@check
Q: Which pillar best shows the time spent in each service for one slow checkout request?
- Metrics
- Logs only
* Distributed traces
- A dashboard screenshot
E: A trace follows one request across services and records the time in each span, which pinpoints the slow step.

## Prometheus and Grafana
Prometheus scrapes numeric metrics from services at intervals and stores them as time series. Each service exposes a /metrics endpoint. Grafana draws dashboards from Prometheus and other data sources. Use counters for totals that only rise, gauges for values that go up and down, and histograms for latency distributions.

@check
Q: Which metric type is right for the total number of requests served since start?
- Gauge
* Counter
- Histogram of memory
- Label only
E: A counter only increases (it resets on restart), which suits request totals. Use rate() on it to get requests per second.

## ELK: centralised logs
The ELK stack collects logs from many servers: Elasticsearch stores and indexes them, Logstash or Beats ship and parse them, and Kibana searches and visualises them. Structured logs in JSON with a request ID make cross-service searches practical. Never log passwords, tokens or personal data.

@check
Q: What makes a log line easy to search across many services?
- Free text with no fields
* Structured JSON fields with a shared request or correlation ID
- Printing only the word error
- Deleting logs each night
E: Structured fields can be filtered precisely, and a shared correlation ID links lines from different services that handled the same request.

## Alerts and the four golden signals
Alert on symptoms that users feel, not on every internal fluctuation. The four golden signals are latency, traffic, errors and saturation. An alert should say what is wrong, how urgent it is, and what to check first. Too many alerts train people to ignore them.

@check
Q: Which signal best describes how full a resource is, such as CPU or connection pool usage?
- Latency
- Traffic
- Errors
* Saturation
E: Saturation measures how close a resource is to its limit. Latency is response time, traffic is demand, and errors are failed requests.
