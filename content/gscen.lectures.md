## Why scenario questions appear
Recent papers have started adding open "what would you do" questions. Examiners want engineers, not memorisers:
- **ICB AP 2026:** a system with 10,000 active users expects 80,000 concurrent users, and management rejects cloud migration for budget and data-sovereignty reasons. What do you propose, and why?
- **ICB AP 2026:** a server with a fast CPU and plenty of RAM shows low utilisation but high latency. What should be upgraded, and how?

The ToR points the same way: troubleshoot application performance and database latency with ELK, Prometheus and Grafana; bulk uploads and report generation for POs; secure integration.

@check
Q: In the 10,000-to-80,000 scenario, which constraint must the answer respect?
- Use auto-scaling in the cloud
- Ignore the budget, because performance matters most
* No cloud migration, because of budget and data-sovereignty limits
- Replace the database with a spreadsheet
E: The question states that management rejects cloud migration for budget and data-sovereignty reasons. A good answer works within that constraint.

## The answer structure that earns full marks
1. Restate the constraints in one line: no cloud, 8× load, a financial system. Answers that ignore a constraint lose marks.
2. Measure before changing: name the metrics and tools, such as p95 latency, CPU, I/O wait, the database slow-query log and connection-pool usage.
3. Find the bottleneck, then apply fixes in order of cost: code and queries, then caching, then configuration, then horizontal scaling, then hardware.
4. Draw a small architecture: load balancer, stateless app nodes, cache, database primary with replicas, queue for heavy work.
5. Risks and verification: a load test proves the target, there is a rollback plan, and monitoring has alerts.

@check
Q: Which is the best first step when latency is high but CPU use is low?
- Buy a faster CPU
- Add more RAM
* Measure where requests wait, such as the database, I/O, locks or the connection pool
- Reboot the server
E: Low CPU with high latency means requests are waiting, not computing. Measuring the wait points tells you where to fix it.

## Reading the symptoms
| Symptom | Likely bottleneck | Evidence | Fix |
|---|---|---|---|
| CPU high | computation or garbage collection | CPU %, GC pauses | optimise code, tune the heap, scale out |
| CPU low, latency high | waiting: I/O, database, locks, network, pool exhaustion | iowait, slow-query log, pool wait time, thread dumps | indexes, caching, a bigger pool, async work, faster storage |
| Memory climbing | a leak, or an oversized cache | heap after GC, OOMKilled | fix the leak, bound the cache |
| Errors under load | limits | 503s, timeouts, refused connections | rate limiting, queues, scale out |

@check
Q: Memory grows steadily until the container is killed as OOMKilled. What is the most likely cause?
- The database is too slow
* A memory leak or an unbounded cache
- The network is saturated
- The CPU is too fast
E: Steady growth that ends in OOMKilled points to something that is never released, such as a leak or a cache with no size limit.

## Scaling the 10,000-to-80,000 case
Put numbers in the answer. For example: 80,000 concurrent users at about one request every 20 seconds is about 4,000 requests per second. If one node handles 500 requests per second, you need about 8 nodes, plus headroom, so 10 or more. Then state the constraints: keep the nodes stateless (sessions in Redis or JWT), put a load balancer in front, and use on-premise hardware or a private data centre.

@check
Q: Application servers keep user sessions in their own memory. Why is this a problem for scaling out?
- Memory is always too small
* A user's next request may reach a different node that does not have the session
- Sessions cannot be stored at all
- Load balancers do not support HTTP
E: With sessions in local memory, a user needs sticky routing or the session is lost on another node. Stateless nodes with Redis or JWT sessions avoid this.

## Traps
- **"Buy a bigger server"** as the first answer. When CPU is low, a faster CPU changes nothing.
- **Scaling nodes that hold state**, as described above.
- **No numbers.** Give a target and an estimate.

@check
Q: Which answer is weakest for a scenario question?
- Restates the constraint that cloud is not allowed
- Names the metrics to measure first
* Says "buy better hardware" with no measurement or bottleneck analysis
- Gives a rough capacity estimate
E: Hardware is the most expensive fix and should come last, after measuring and fixing the bottleneck. Examiners mark the reasoning, not just the answer.
