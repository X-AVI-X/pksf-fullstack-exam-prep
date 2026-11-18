## Entities and mapping
JPA maps Java classes to tables. An entity class is annotated with @Entity and has an @Id field. Columns map from fields, and relationships use @OneToMany, @ManyToOne, @OneToOne and @ManyToMany. Hibernate is the most common implementation.

A persistent entity is managed by the EntityManager, which tracks changes and writes them at flush or commit. Changes to a managed entity are saved without an explicit update call.

@check
Q: A managed entity's field is changed inside a transaction, with no save call. What happens?
- Nothing is saved, ever
* The change is written at flush or commit, because the entity is managed
- The application throws an exception
- The change is saved only if the field is public
E: Managed entities are dirty-checked. Hibernate detects the change and writes the update when the transaction flushes or commits.

## Fetch types and the N+1 problem
Lazy fetching loads a relationship only when it is accessed. Eager fetching loads it immediately. The N+1 problem happens when loading N parents runs one extra query per parent to fetch a child collection: 1 query plus N queries.

Fix N+1 with a JOIN FETCH in the query, an entity graph, or batch fetching. Make most relationships LAZY and fetch what each use case needs.

@check
Q: Loading 50 orders and then reading each order's items causes 51 queries. What is this problem called?
- Deadlock
* The N+1 select problem
- Cache miss storm
- Optimistic locking failure
E: One query fetches the 50 orders, then one query per order fetches its items: 1 + 50. JOIN FETCH or an entity graph fixes it.

## Transactions and persistence context
A persistence context is a cache of entities for one unit of work. Within it, the same row is the same object, so you can read a value twice without another query. The context ends with the transaction or the request, so detached entities no longer track changes.

Keep transactions short and do not leave them open while waiting for a user or a remote call.

@check
Q: Why is it risky to keep a transaction open while waiting for an external API response?
- It has no effect on performance
* It holds database locks and connections for the whole wait, reducing throughput
- Transactions cannot wait for anything
- The external API cannot accept requests during a transaction
E: Open transactions keep locks and connections busy. Long waits reduce the number of requests the system can serve.

## Locking: optimistic and pessimistic
Optimistic locking adds a @Version column. An update succeeds only if the version is unchanged, and otherwise an OptimisticLockException reports the conflict. Pessimistic locking takes a database lock, such as SELECT ... FOR UPDATE, so other transactions wait.

Use optimistic locking for most web updates where conflicts are rare, and pessimistic locking when a conflict must be prevented, such as reserving the last seat.

@check
Q: Two users edit the same loan record. Optimistic locking is used. What prevents a silent overwrite?
- The database deletes one of the rows
* The @Version column, which rejects an update whose version no longer matches
- The browser cache
- Using an interface for the entity
E: The version check turns a lost update into a detectable conflict, so the second save fails and can be retried or reported.
