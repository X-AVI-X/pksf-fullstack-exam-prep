## Why NoSQL exists, and what it trades away
Relational databases give strong consistency and joins across normalised tables. NoSQL stores trade some of that for flexible schemas, horizontal scaling and fast access by key. The right choice depends on the access pattern, not on fashion. Ask first how the data is read and written.

@check
Q: Which workload suits a document store such as MongoDB most naturally?
- Multi-table financial transfers that need joins across many tables
* Product or profile documents read and written together as one unit, with a flexible structure
- Ad-hoc reporting over many normalised tables
- Storing a single counter with strict ordering
E: Document stores keep related data together in one document, so reading the whole unit needs one lookup. Heavy multi-table joins suit a relational database.

## MongoDB: documents, embedding and references
A MongoDB document is a JSON-like record in a collection. Embed data that is read together and belongs to one parent, such as an address inside a customer. Reference data that is shared or grows without limit, such as orders, by storing the ID. Index the fields you query on, and use the aggregation pipeline for grouping.

@check
Q: An order list can grow to thousands of items per customer. Should the items be embedded inside the customer document?
- Yes, always, because embedding is always faster
* No, a growing array can exceed the document size limit, so reference or store the items separately
- Yes, because MongoDB has no size limit
- It does not matter
E: MongoDB documents have a size limit of 16 MB, and unbounded arrays grow the document on every write. Referencing items in their own collection avoids that.

## Redis: a fast store for caching and sessions
Redis keeps data in memory and serves it in microseconds. Typical uses are a cache of expensive query results with a TTL, session storage, rate-limit counters with INCR, and a queue with lists. The data lives in RAM, so plan for persistence and memory limits, and treat the cache as disposable.

@check
Q: What is the main purpose of a TTL on a Redis cache entry?
- To make the entry permanent
* To expire stale data automatically after a set time
- To encrypt the value
- To rename the key
E: A time-to-live removes entries after a period, so the cache does not serve old data forever. Choose the TTL based on how stale the data may be.

## Cache-aside and its risks
In the cache-aside pattern, the application reads the cache first, and on a miss it reads the database and stores the result in the cache. On a write, it updates the database and then deletes the cache entry, so the next read refreshes it.

Risks to name in an answer: stale data between a write and the expiry, and a stampede when a hot key expires and many requests hit the database at once.

@check
Q: A product price changes in the database. Which cache-aside step prevents stale prices being served?
- Never update the cache
* Delete or refresh the cached entry after the database write
- Store the price in a cookie
- Increase the TTL to one year
E: Invalidating the entry on write makes the next read reload the new value. A long TTL makes staleness worse.

## CAP and consistency choices
The CAP theorem says that during a network partition a distributed system must choose between consistency and availability. Many NoSQL systems favour availability and accept eventual consistency, where replicas converge after a delay. For money movement, prefer strong consistency; for a product catalogue or a view counter, eventual consistency is often acceptable.

@check
Q: Which data should use strong consistency rather than eventual consistency?
- A product's description text
- A view counter on a blog
* A bank account balance used to approve a withdrawal
- A cached list of recent news headlines
E: A wrong balance can allow an overdraft, so the read must reflect the latest committed value. Stale display data is a smaller harm.
