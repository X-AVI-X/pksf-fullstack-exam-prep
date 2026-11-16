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
+ 2 | Explains 1 + N queries with a concrete example | N+1/lazy
+ 1.5 | Fetch join | join fetch
+ 1.5 | @EntityGraph | EntityGraph
+ 1 | Batch fetching or DTO projection | batch

## Optimistic vs pessimistic locking: when to use each?
- **Optimistic** ({{@Version}}): no DB lock; the update checks the version and fails if it changed. Best for low-conflict, user-facing edits (two officers editing the same PO profile). Handle {{OptimisticLockException}} by showing "data changed, reload".
- **Pessimistic** ({{@Lock(PESSIMISTIC_WRITE)}} = SELECT FOR UPDATE): locks the row until commit. Best for short, high-conflict operations like decrementing a fund balance. Risk: deadlocks and waiting; keep transactions short and lock rows in a consistent order.
+ 2 | Optimistic: @Version check, failure on conflict, retry | @Version
+ 2 | Pessimistic: SELECT FOR UPDATE locks the row | FOR UPDATE/PESSIMISTIC
+ 2 | When to use each (low vs high contention, balances) | contention

## How do you make bulk inserts fast with JPA?
@descriptive 6
- Use SEQUENCE ids with {{allocationSize}} (not IDENTITY).
- {{spring.jpa.properties.hibernate.jdbc.batch_size=500}}, {{order_inserts=true}}, {{order_updates=true}}.
- Flush and clear the EntityManager every N records to keep memory flat.
- For very large loads use JdbcTemplate {{batchUpdate}} or PostgreSQL {{COPY}}.
- Add {{reWriteBatchedInserts=true}} to the PostgreSQL JDBC URL.
+ 1.5 | SEQUENCE ids with allocationSize, not IDENTITY | SEQUENCE
+ 1.5 | hibernate.jdbc.batch_size and order_inserts | batch_size
+ 1.5 | Flush and clear periodically | clear
+ 1.5 | JdbcTemplate batchUpdate / COPY / reWriteBatchedInserts for very large loads | batchUpdate/COPY

## Entity vs DTO: why not return entities from controllers?
- Entities expose internal structure and sensitive fields, cause lazy-loading exceptions or N+1 during JSON serialisation, and couple the API to the DB schema.
- DTOs (Java records) give a stable API contract, validation per use case, and allow projections ({{select new com.x.PoSummary(p.id, p.name) from PartnerOrg p}}).
- Mapping by hand or with MapStruct.
+ 2 | Problems with returning entities (exposure, lazy loading, recursion, coupling) | lazy
+ 2 | DTO benefits: stable contract, validation, versioning | contract
+ 2 | Mapping approach (records, MapStruct) | MapStruct/record

## Find the error: LazyInitializationException in a REST endpoint.
@bug 6
~~~java
@GetMapping("/pos/{id}")
public Po get(@PathVariable Long id) {
  return poRepository.findById(id).orElseThrow();   // Po has @OneToMany(fetch = LAZY) List<Member> members
}
~~~
**Bug:** the entity is returned outside the transaction and persistence context. When Jackson serialises {{members}}, Hibernate tries to load the lazy collection with **no open session**: {{LazyInitializationException: could not initialize proxy - no Session}}. (With open-in-view enabled it "works" but runs N+1 queries from the view layer.) Returning entities also exposes internal fields and risks infinite recursion with bidirectional relations.

**Fix:**
~~~java
@Query("select p from Po p left join fetch p.members where p.id = :id")
Optional<Po> findWithMembers(Long id);

@Transactional(readOnly = true)
public PoDto get(Long id) { return mapper.toDto(repo.findWithMembers(id).orElseThrow()); }
~~~
Return a **DTO**, load what's needed with {{JOIN FETCH}} or {{@EntityGraph}}, and set {{spring.jpa.open-in-view=false}}.
+ 2 | Identifies lazy loading outside session/transaction | LazyInitializationException/session
+ 1 | Mentions open-in-view or the N+1 side effect | open-in-view/N+1
+ 2 | Fix: JOIN FETCH or EntityGraph inside a transactional service | join fetch/EntityGraph
+ 1 | Return DTO, not entity | DTO


## State the N+1 problem in one or two sentences.
@short 2
Loading N parents with one query and then lazily loading each parent's association fires **N extra queries** (1 + N). Fix it with {{JOIN FETCH}}, {{@EntityGraph}} or batch fetching.
+ 1 | Describes 1 + N queries from lazy loading | N
+ 1 | Names a fix | JOIN FETCH/EntityGraph
