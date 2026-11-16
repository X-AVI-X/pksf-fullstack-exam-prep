## Explain the N+1 problem with an example and three solutions.
~~~java
List<PartnerOrg> pos = repo.findAll();          // 1 query
for (PartnerOrg po : pos) po.getBranches().size(); // N more queries, one per PO
~~~
Solutions:
- **Fetch join**: {{@Query("select p from PartnerOrg p left join fetch p.branches")}} (watch out: fetch-joining a collection breaks DB-side pagination).
- **@EntityGraph(attributePaths = "branches")** on the repository method.
- **Batch fetching**: {{hibernate.default_batch_fetch_size=50}} loads children with IN (...) in a few queries.
- **DTO projection**: select only the columns you need.
Detect it with SQL logging ({{spring.jpa.show-sql}}, or better {{logging.level.org.hibernate.SQL=debug}}) or Hibernate statistics.
## Optimistic vs pessimistic locking: when to use each?
- **Optimistic** ({{@Version}}): no DB lock; the update checks the version and fails if it changed. Best for low-conflict, user-facing edits (two officers editing the same PO profile). Handle {{OptimisticLockException}} by showing "data changed, reload".
- **Pessimistic** ({{@Lock(PESSIMISTIC_WRITE)}} = SELECT FOR UPDATE): locks the row until commit. Best for short, high-conflict operations like decrementing a fund balance. Risk: deadlocks and waiting; keep transactions short and lock rows in a consistent order.
## How do you make bulk inserts fast with JPA?
- Use SEQUENCE ids with {{allocationSize}} (not IDENTITY).
- {{spring.jpa.properties.hibernate.jdbc.batch_size=500}}, {{order_inserts=true}}, {{order_updates=true}}.
- Flush and clear the EntityManager every N records to keep memory flat.
- For very large loads use JdbcTemplate {{batchUpdate}} or PostgreSQL {{COPY}}.
- Add {{reWriteBatchedInserts=true}} to the PostgreSQL JDBC URL.
## Entity vs DTO: why not return entities from controllers?
- Entities expose internal structure and sensitive fields, cause lazy-loading exceptions or N+1 during JSON serialisation, and couple the API to the DB schema.
- DTOs (Java records) give a stable API contract, validation per use case, and allow projections ({{select new com.x.PoSummary(p.id, p.name) from PartnerOrg p}}).
- Mapping by hand or with MapStruct.
