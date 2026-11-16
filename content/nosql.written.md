## When would you choose MongoDB over PostgreSQL?
- **PostgreSQL**: relational data with strong integrity (loans, repayments, accounts), multi-row ACID transactions, complex joins and reporting. Financial records belong here.
- **MongoDB**: flexible or evolving schemas (survey forms with varying fields, field-collected data, activity logs, content), large write volumes, natural document aggregates read together, easy horizontal scaling.
- PostgreSQL JSONB often covers the flexible-field case without a second database.
## Explain caching strategies and invalidation.
- **Cache-aside** (lazy loading): most common; @Cacheable.
- **Read-through / write-through**: the cache layer loads from and writes to the DB itself.
- **Write-behind**: write to cache, flush to DB asynchronously (risk of loss).
- Invalidation: TTLs, explicit eviction on update (@CacheEvict), versioned keys, events (publish change messages).
- Pitfalls: stale data, stampede, caching per-user data under a shared key, unbounded memory. Never cache sensitive data without thinking about who can read it.
~~~java
@Cacheable(cacheNames = "po", key = "#id")
public PartnerOrgDto get(Long id) { ... }

@CacheEvict(cacheNames = "po", key = "#dto.id")
public PartnerOrgDto update(PartnerOrgDto dto) { ... }
~~~
## Redis use cases in a Spring Boot system.
- Cache for reference data and expensive report results.
- Distributed session store (Spring Session).
- Rate limiting (INCR + EXPIRE per user/IP).
- Distributed locks (Redisson, SET key value NX PX) so only one instance runs a scheduled job.
- Token blacklist for revoked JWTs until their exp.
- Pub/Sub or Streams for lightweight messaging.


## Write a MongoDB aggregation: total disbursed amount per PO for 2026, top 5.
~~~js
db.loans.aggregate([
  { $match: { disbursedAt: { $gte: ISODate("2026-01-01"), $lt: ISODate("2027-01-01") } } },
  { $group: { _id: "$poId", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 5 },
  { $lookup: { from: "pos", localField: "_id", foreignField: "_id", as: "po" } },
  { $project: { _id: 0, poName: { $first: "$po.name" }, total: 1, count: 1 } }
])
~~~
- Put $match first so it can use an index on {disbursedAt: 1}. The SQL equivalent is WHERE … GROUP BY po_id ORDER BY total DESC LIMIT 5.
