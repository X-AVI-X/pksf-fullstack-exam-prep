## Explain ACID properties with a fund-transfer example.
@concept 6
Transfer 10,000 BDT from PO account A to B:
~~~sql
BEGIN;
UPDATE account SET balance = balance - 10000 WHERE id = 'A' AND balance >= 10000;
UPDATE account SET balance = balance + 10000 WHERE id = 'B';
COMMIT;   -- or ROLLBACK on any error
~~~
- **Atomicity:** both updates happen or neither does; a crash between them rolls back.
- **Consistency:** constraints (for example {{CHECK (balance >= 0)}}, foreign keys) hold before and after.
- **Isolation:** another transaction never sees A debited but B not yet credited; this is controlled by the isolation level and locks/MVCC.
- **Durability:** once COMMIT returns, the change survives a crash because of the write-ahead log (WAL, or the redo log in Oracle).
+ 1.5 | Atomicity: all or nothing, with rollback | rollback/all or nothing
+ 1.5 | Consistency: constraints and invariants preserved | constraint
+ 1.5 | Isolation: concurrent transactions, isolation levels | isolation
+ 1.5 | Durability: commit survives crash, WAL/log | WAL/log


## Normalise this table to 3NF: loan_report(loan_id, member_id, member_name, member_phone, po_id, po_name, amount, disbursed_on).
@schema 8
**Dependencies:** loan_id → member_id, po_id, amount, disbursed_on; member_id → member_name, member_phone; po_id → po_name. These are transitive dependencies through member_id and po_id, so the table is not in 3NF.
~~~sql
CREATE TABLE po     (po_id     BIGINT PRIMARY KEY, po_name TEXT NOT NULL);
CREATE TABLE member (member_id BIGINT PRIMARY KEY, member_name TEXT NOT NULL, member_phone VARCHAR(15),
                     po_id BIGINT NOT NULL REFERENCES po);
CREATE TABLE loan   (loan_id   BIGINT PRIMARY KEY,
                     member_id BIGINT NOT NULL REFERENCES member,
                     amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
                     disbursed_on DATE NOT NULL);
CREATE INDEX ON loan(member_id);
~~~
- Whether po_id belongs on member or on loan depends on the business rule. If a member belongs to one PO, putting it on member avoids redundancy.
- The result is in 3NF (and BCNF): every non-key attribute depends on the key, the whole key, and nothing but the key.
+ 2 | Lists the functional dependencies and names the transitive ones | transitive/depend
+ 3 | Splits into po, member, loan tables with correct PKs | primary key
+ 2 | Foreign keys linking the tables | references/foreign key
+ 1 | Constraints or indexes (NOT NULL, CHECK, FK index) | check/index


## Draw an ERD (crow's foot) for: a PO has many branches; a branch has many members; a member can take many loans; each loan has many installments; a loan product applies to many loans.
@schema 8
~~~
PO ||──o{ BRANCH ||──o{ MEMBER ||──o{ LOAN }o──|| LOAN_PRODUCT
                                       ||
                                       └──|{ INSTALLMENT   (weak entity: PK = loan_id + seq)

PO(po_id PK, code UK, name)          BRANCH(branch_id PK, po_id FK, name)
MEMBER(member_id PK, branch_id FK, nid UK, name)
LOAN(loan_id PK, member_id FK, product_id FK, principal, disbursed_on, status)
LOAN_PRODUCT(product_id PK, name, rate)   INSTALLMENT(loan_id FK, seq, due_date, amount)  PK(loan_id, seq)
~~~
- {{||──o{}} reads "exactly one … zero or many": a PO may have no branches yet. LOAN to INSTALLMENT is {{||──|{}} (a disbursed loan has at least one installment).
- Mark PK/FK/UK and use singular entity names. In the physical model every FK gets an index.
+ 2 | All five entities plus installment present with keys | PK
+ 3 | Correct cardinalities and optionality in crow's-foot notation | o{, ||
+ 2 | Weak entity/composite key for installment | weak/seq
+ 1 | Legible notation and FK placement on the many side | FK

## Explain the transaction isolation levels and the read anomalies each one prevents.
@concept 6
**Anomalies**
- **Dirty read:** reading another transaction's uncommitted change.
- **Non-repeatable read:** the same row read twice gives different values, because another transaction committed an update in between.
- **Phantom read:** the same query run twice returns a different set of rows, because another transaction inserted or deleted matching rows.

| Level | Dirty read | Non-repeatable read | Phantom |
|---|---|---|---|
| Read Uncommitted | possible | possible | possible |
| Read Committed | prevented | possible | possible |
| Repeatable Read | prevented | prevented | possible (in the SQL standard) |
| Serializable | prevented | prevented | prevented |

- Higher isolation gives fewer anomalies but more locking or more aborted transactions (serialization failures that must be retried).
- Defaults: **Read Committed** in PostgreSQL and Oracle; **Repeatable Read** in MySQL InnoDB. PostgreSQL uses **MVCC**, so readers never block writers; its Repeatable Read also prevents phantoms.
- In Spring: {{@Transactional(isolation = Isolation.SERIALIZABLE)}}.
+ 1.5 | Defines dirty, non-repeatable and phantom reads | dirty, phantom
+ 2.5 | Four levels in order with what each prevents | Read Committed, Repeatable Read, Serializable
+ 1 | Trade-off: isolation vs concurrency/retries | concurren/lock/retry
+ 1 | Database defaults or MVCC | MVCC/default

## Explain database indexes: how a B-tree index works, clustered vs non-clustered, and when an index hurts.
@concept 6
- An **index** is a separate sorted structure that lets the database find rows without scanning the whole table, like the index of a book.
- **B-tree** (B+tree): a balanced tree whose leaves hold keys in sorted order with pointers to rows. Lookup, insert and delete are O(log n); it supports {{=}}, range ({{<}}, {{BETWEEN}}), {{ORDER BY}} and prefix {{LIKE 'abc%'}}.
- **Clustered index:** the table rows themselves are stored in index order, so there is only one per table (the primary key in MySQL InnoDB and SQL Server). **Non-clustered (secondary):** a separate structure pointing to the rows; many per table. PostgreSQL tables are heaps, so all its indexes are secondary.
- **Composite index** (a, b): usable for a filter on a, or on a and b, but not on b alone (leftmost-prefix rule). A **covering** index contains every column the query needs (index-only scan).
- **When an index hurts or is ignored:** every INSERT/UPDATE/DELETE must maintain it; it uses disk and memory; low-selectivity columns (for example a boolean) and small tables are scanned anyway; wrapping the column in a function ({{WHERE LOWER(email) = ?}}) or a leading wildcard ({{LIKE '%x'}}) prevents its use.
- Index foreign keys and the columns used in WHERE, JOIN and ORDER BY; confirm with {{EXPLAIN}}.
+ 1.5 | What an index is and why it speeds reads | scan
+ 1.5 | B-tree: balanced, sorted, O(log n), supports ranges | B-tree, log n
+ 1.5 | Clustered vs non-clustered (or composite/leftmost prefix) | clustered/composite
+ 1.5 | Costs: slower writes, storage, cases where it is not used | write/selectiv

## Compare DELETE, TRUNCATE and DROP.
@compare 6
| | DELETE | TRUNCATE | DROP |
|---|---|---|---|
| Type | DML | DDL | DDL |
| Removes | chosen rows (WHERE) or all rows | all rows | the whole table: rows, structure, indexes, constraints |
| WHERE clause | yes | no | no |
| Speed and logging | row by row, fully logged; slow on big tables | deallocates data pages; very fast | fast |
| Triggers | fires row triggers | does not fire row triggers | none |
| Identity/sequence | not reset | reset in SQL Server and MySQL (PostgreSQL: {{RESTART IDENTITY}}) | gone |
| Rollback | yes | Oracle and MySQL: no (implicit commit); PostgreSQL and SQL Server: yes inside a transaction | Oracle and MySQL: no; PostgreSQL: yes inside a transaction |

- Use **DELETE** for selected rows, **TRUNCATE** to empty a staging table quickly, **DROP** to remove the table itself. TRUNCATE fails if another table references it by a foreign key (unless {{CASCADE}} in PostgreSQL).
+ 1.5 | DML vs DDL classification | DML, DDL
+ 2 | What each removes; WHERE only with DELETE | WHERE, structure
+ 1.5 | Rollback/logging/speed differences | rollback/log
+ 1 | Triggers, identity reset, or a when-to-use note | trigger/identity/staging

## Explain the types of keys in a relational database with an example table.
@concept 5
Example: {{member(member_id, nid, phone, name, branch_id)}}
- **Super key:** any set of columns that uniquely identifies a row, for example {member_id}, {nid} or {member_id, name}.
- **Candidate key:** a minimal super key (no column can be removed): {member_id} and {nid}.
- **Primary key:** the candidate key chosen to identify rows; unique and NOT NULL: member_id.
- **Alternate (unique) key:** the candidate keys that were not chosen: nid, enforced with a UNIQUE constraint.
- **Foreign key:** a column that references a key in another table and enforces referential integrity: branch_id → branch(branch_id).
- **Composite key:** a key made of more than one column, for example installment(loan_id, seq).
- **Surrogate vs natural key:** member_id is a generated surrogate with no business meaning; nid is a natural key. Surrogates stay stable when business data changes.
+ 1.5 | Super key vs candidate key (minimality) | super, candidate
+ 1.5 | Primary key (unique, not null) and alternate/unique key | primary, unique
+ 1 | Foreign key and referential integrity | foreign
+ 1 | Composite key, or surrogate vs natural | composite/surrogate
