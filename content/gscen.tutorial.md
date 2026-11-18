### How it is asked
Recent papers have started adding open "what would you do" questions, a sign examiners want engineers, not memorisers:

- **ICB AP 2026:** a system with 10,000 active users expects 80,000 concurrent users, and management rejects cloud migration for budget and data-sovereignty reasons. What do you propose, and why?
- **ICB AP 2026:** a server with a fast CPU and plenty of RAM shows low utilisation but high latency. What should be upgraded, and how?

The ToR points the same way: "troubleshoot application performance and database latency issues" with ELK, Prometheus and Grafana; bulk file uploads and report generation for POs; secure integration.

### The answer structure that earns full marks
1. **Restate the constraints** in one line: no cloud, 8× load, a financial system. Answers that ignore a constraint lose marks.
2. **Measure before changing:** name the metrics and tools (p95 latency, CPU, I/O wait, DB slow-query log, connection-pool usage) in Prometheus/Grafana and ELK.
3. **Find the bottleneck,** then apply fixes **in order of cost:** code and query fixes, then caching, then configuration (pools, JVM), then horizontal scaling, then hardware.
4. **Draw a small architecture** if the question is about scale: load balancer → stateless app nodes → cache → database primary plus replicas → queue for heavy work.
5. **Risks and verification:** a load test (JMeter/Gatling) proves the target; there's a rollback plan; and monitoring with alerts.

### A useful mental checklist (the "four resources")
| Symptom | Likely bottleneck | Evidence | Fix |
|---|---|---|---|
| CPU high | computation, GC | CPU %, GC pauses | optimise code, tune the heap, scale out |
| CPU low, latency high | **waiting**: I/O, DB, locks, network, pool exhaustion | iowait, slow-query log, pool wait time, thread dumps | indexes, caching, a bigger pool, async work, SSD/NVMe |
| Memory climbing | leak, oversized cache | heap after GC, OOMKilled | fix the leak, bound the cache |
| Errors under load | limits | 503s, connection refused, timeouts | rate limiting, queues, scale out |

### Traps
- **"Buy a bigger server"** as the first answer. When the CPU is low, a faster CPU changes nothing.
- **Scaling app servers that hold sessions in memory.** Make them stateless first (Redis sessions or JWT).
- **No numbers.** Put a target and an estimate in the answer: "80k concurrent ≈ 4,000 req/s; at 500 req/s per node, that's 8–10 nodes plus headroom".
