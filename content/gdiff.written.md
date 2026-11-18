## What are SOAP and REST? Write the main differences between them, especially in how they exchange data, and say when PKSF would still use SOAP.
@compare 10
**SOAP** (Simple Object Access Protocol) is a **protocol** with a strict XML message format (Envelope, Header, Body), described by a **WSDL** contract. **REST** (Representational State Transfer) is an **architectural style**: resources identified by URLs and manipulated with the standard HTTP methods.

| Dimension | SOAP | REST |
|---|---|---|
| Type | protocol with a formal specification | architectural style (constraints) |
| Data format | **XML only**, wrapped in a SOAP envelope | usually **JSON**; also XML, CSV or binary |
| Contract | **WSDL** (strict, can generate code) | optional (OpenAPI/Swagger) |
| Transport | usually HTTP; also SMTP or JMS | HTTP |
| Operations | named operations ({{getLoanStatus}}), usually all POST | HTTP verbs on resources ({{GET /loans/42}}) |
| Errors | {{<soap:Fault>}} element | HTTP status codes (400, 404, 500) |
| Security | **WS-Security** (message-level signing and encryption) | HTTPS (TLS) plus OAuth2/JWT |
| Caching | hard (POST) | easy: GET is cacheable |
| Payload / speed | heavier, slower to parse | lightweight, faster |

**Data exchange difference in one line:** SOAP sends a self-describing XML envelope to a single endpoint, governed by a WSDL. REST sends a lightweight representation (usually JSON) of a resource to the resource's own URL, and HTTP itself carries the meaning (verb and status).

**When to use which:** use REST for new web, mobile and microservice APIs (the PKSF frontends and PO reporting APIs). Use SOAP when integrating with **legacy banking or government systems** that only offer a WSDL, or when you need message-level security or formal contracts. The ToR names both ("RESTful and SOAP web services"). In Spring, a REST controller and a Spring-WS SOAP endpoint can coexist in one application.
+ 2 | Correct definition of each (protocol + WSDL vs architectural style) | protocol, wsdl
+ 2 | Data exchange: XML envelope vs JSON resource representation | xml, json
+ 3 | At least four further accurate differences (verbs, errors, security, caching, speed) | ws-security, cache
+ 2 | When to use each, with a PKSF/legacy example | legacy
+ 1 | Table layout

## Write the differences between an interface and an abstract class in Java (Java 8 and later). When would you choose each?
@compare 10
An **interface** declares a **capability** (a contract) that unrelated classes can implement. An **abstract class** is a **partially built base class** that shares state and code with closely related subclasses.

| Dimension | Interface | Abstract class |
|---|---|---|
| Keyword | {{implements}} (a class can implement **many**) | {{extends}} (a class extends **only one**) |
| State | only {{public static final}} constants | instance fields of any access level |
| Methods | abstract, {{default}} and {{static}} (Java 8), {{private}} (Java 9) | abstract and concrete, any access level |
| Constructor | none | yes (runs via {{super(...)}}) |
| Relationship | "can do" (Comparable, Notifier) | "is a" (SavingsAccount is an Account) |
| Use with Spring | the preferred injection type (mockable, swappable) | a template for shared logic |

~~~java
interface Notifier { void send(String to, String msg); }            // capability
abstract class Account {                                            // shared state + template
    protected BigDecimal balance;
    public final void withdraw(BigDecimal a) { if (!canWithdraw(a)) throw new IllegalStateException(); balance = balance.subtract(a); }
    protected abstract boolean canWithdraw(BigDecimal a);
}
~~~
**Choose an interface** for a role many unrelated types can play, or a type Spring should inject (so it can be mocked and swapped). **Choose an abstract class** when subclasses share fields or a fixed algorithm (the template method pattern). The two are often combined: {{interface PaymentGateway}} plus {{abstract class AbstractPaymentGateway implements PaymentGateway}}.
+ 2 | Definitions: contract/capability vs partial base class | contract
+ 3 | Multiple implements vs single extends; state; constructors | multiple, constructor
+ 2 | Java 8+ default/static (and private) methods noted | default
+ 2 | When to choose each, with example | is-a/can-do
+ 1 | Clear table

## What is the difference between == and equals() in Java? Show with String and Integer examples, and explain why equals() and hashCode() must be overridden together.
@compare 10 verified
**{{==}}** compares **references** for objects (are these the same object in memory?) and **values** for primitives. **{{equals()}}** compares **logical content**, as defined by the class. {{Object.equals}} defaults to {{==}}.
~~~java
String s1 = "PKSF", s2 = "PKSF", s3 = new String("PKSF");
System.out.println(s1 == s2);        // true  (both literals come from the string pool)
System.out.println(s1 == s3);        // false (new String creates a new object)
System.out.println(s1.equals(s3));   // true  (same characters)

Integer a = 127, b = 127, c = 128, d = 128;
System.out.println(a == b);          // true  (Integer cache covers -128..127)
System.out.println(c == d);          // false (two different Integer objects)
System.out.println(c.equals(d));     // true
~~~
Output verified on Java 21.

| | {{==}} | {{equals()}} |
|---|---|---|
| Compares | identity (reference) | content (logical equality) |
| Applies to | primitives and references | objects only |
| Overridable | no (it's an operator) | yes |
| With null | {{null == x}} is safe | {{x.equals(...)}} throws NPE if x is null; use {{Objects.equals(x, y)}} |

**equals and hashCode contract:** equal objects **must** have equal hash codes. {{HashMap}} and {{HashSet}} use {{hashCode()}} to find the bucket, then {{equals()}} inside it. If you override only {{equals}}, two equal members land in different buckets, a {{HashSet}} keeps duplicates, and {{map.get(key)}} returns null. Use the same fields in both methods, or a Java {{record}}, which generates both.
+ 3 | == compares references (values for primitives); equals compares content | reference, content
+ 2 | String pool example with correct results | pool
+ 2 | Integer cache trap (127 vs 128) | 127, 128
+ 2 | equals/hashCode contract and the HashMap/HashSet consequence | hashcode, hashmap
+ 1 | Null-safety: Objects.equals | objects.equals

## Write the differences between a primary key, a unique key, a candidate key and a foreign key, with an example table.
@compare 10 verified
- A **candidate key** is any minimal set of columns that uniquely identifies a row. A table can have several.
- The **primary key** is the candidate key **chosen** as the main identifier.
- A **unique key** enforces uniqueness on another candidate key.
- A **foreign key** links a row to the primary (or unique) key of another table.

| | Primary key | Unique key | Foreign key |
|---|---|---|---|
| Purpose | identify each row | prevent duplicate values in another column | reference a row in another table |
| NULL allowed | **never** | yes (PostgreSQL allows many NULLs; SQL Server allows one) | yes, unless declared NOT NULL |
| Per table | exactly one | many | many |
| Duplicates | no | no (except NULLs) | yes: many loans may reference the same member |
| Index | created automatically | created automatically | **not** automatic in PostgreSQL; add one |
| Integrity rule | entity integrity | — | referential integrity |

~~~sql
CREATE TABLE member (
  id    BIGINT PRIMARY KEY,               -- primary key (a surrogate)
  nid   VARCHAR(17) NOT NULL UNIQUE,      -- candidate key enforced as a unique key
  phone VARCHAR(14) UNIQUE,               -- another unique key, may be NULL
  branch_id BIGINT NOT NULL REFERENCES branch(id)   -- foreign key
);
~~~
Here {{id}} and {{nid}} are both **candidate keys**; {{id}} was chosen as the primary key. **Super key:** any set of columns that contains a candidate key, such as {{(id, phone)}}. **Composite key:** a key made of more than one column, such as {{(loan_id, installment_no)}}.
+ 2 | Candidate key and primary key (chosen candidate) defined | candidate
+ 3 | PK vs unique: NULLs, count per table, auto index | null, unique
+ 3 | FK: references a parent key, duplicates allowed, referential integrity | references, referential
+ 2 | Example DDL showing all of them | create table

## Write the differences between DELETE, TRUNCATE and DROP in SQL.
@compare 10 verified
| | DELETE | TRUNCATE | DROP |
|---|---|---|---|
| Type | DML | DDL | DDL |
| Removes | chosen rows (or all) | **all** rows | the **whole table**: data, structure, indexes, constraints |
| WHERE allowed | yes | no | no |
| Row triggers fire | yes | no ({{ON TRUNCATE}} statement triggers only) | no |
| Speed on a big table | slow: logs every row | fast: deallocates whole data pages | fast |
| Identity / sequence | keeps counting | can reset ({{RESTART IDENTITY}} in PostgreSQL) | gone with the table |
| Rollback | yes, inside a transaction | **PostgreSQL: yes**; Oracle and MySQL: implicit commit, so no | PostgreSQL: yes; Oracle and MySQL: no (Oracle has a recycle bin) |
| Blocked by FKs | only rows still referenced | yes, unless {{CASCADE}} | yes, unless {{CASCADE}} |

~~~sql
DELETE FROM loan WHERE status = 'CLOSED' AND closed_on < DATE '2020-01-01';
TRUNCATE TABLE staging_upload RESTART IDENTITY;    -- clear a bulk-upload staging table
DROP TABLE IF EXISTS temp_report;
~~~
Verified on PostgreSQL 16: {{TRUNCATE}} inside {{BEGIN … ROLLBACK}} restored the rows.

**When to use which:** use DELETE for business data (it can be audited, triggers fire, it supports WHERE). Use TRUNCATE to empty staging or temporary tables between batch runs. Use DROP when the table itself is obsolete, through a migration (Flyway or Liquibase), never by hand in production.
+ 3 | What each removes; WHERE only with DELETE | where
+ 2 | DML vs DDL; triggers; speed/logging | ddl, dml
+ 3 | Rollback behaviour, with the dialect difference | rollback
+ 1 | Identity reset or FK behaviour | identity/cascade
+ 1 | When to use each | staging

## Write the differences between a compiler and an interpreter. Where does Java fit, and what is the role of the JIT compiler?
@compare 10
A **compiler** translates the whole program into another (usually machine) language **before** it runs. An **interpreter** reads and executes the program **statement by statement at run time**.

| | Compiler | Interpreter |
|---|---|---|
| Translation | whole program, ahead of time | line by line, while running |
| Output | an executable or object file | no separate file |
| Errors | reported together, before running | reported when that line is reached |
| Execution speed | fast | slower (translation on every run) |
| Start / edit-run cycle | slower: a build step | immediate |
| Examples | C, C++, Go | classic BASIC, Python (CPython bytecode VM), shell |

**Java uses both:**
1. {{javac}} **compiles** {{.java}} source into platform-independent **bytecode** ({{.class}} files).
2. The **JVM** loads the bytecode and starts by **interpreting** it.
3. The **JIT (just-in-time) compiler** (HotSpot) detects "hot" methods that run often and compiles them into **native machine code** at run time, with optimisations based on real behaviour (inlining, removing unused branches).

That is why Java is "write once, run anywhere" (bytecode runs on any JVM) and still fast after warm-up. It is also why benchmarks need a warm-up period, and why a Spring Boot service's first requests are slower. **GraalVM native image** compiles ahead of time instead, for fast start-up in containers.
+ 2 | Correct definitions of compiler and interpreter | compiler, interpreter
+ 3 | At least four differences (timing, output, errors, speed) | errors, speed
+ 3 | Java pipeline: javac → bytecode → JVM interprets → JIT | bytecode, jvm, jit
+ 2 | Explains why (portability + performance, warm-up) | portab/warm

## Write the differences between SQL (relational) and NoSQL databases, using PostgreSQL and MongoDB, and say which PKSF data belongs in each.
@compare 10
A **relational (SQL) database** stores data in tables with a fixed schema, linked by keys, and queried with SQL (PostgreSQL, Oracle, MySQL). A **NoSQL** database uses another model (document, key-value, column or graph) with a flexible schema. MongoDB stores **JSON-like (BSON) documents**.

| Dimension | PostgreSQL (SQL) | MongoDB (NoSQL, document) |
|---|---|---|
| Data model | tables, rows, columns | collections of documents (nested objects and arrays) |
| Schema | fixed, enforced (DDL, constraints) | flexible; optional JSON-schema validation |
| Relationships | foreign keys, joins | embedding, or references plus {{$lookup}} |
| Transactions | full ACID, multi-table | ACID within one document; multi-document since 4.0 (costlier) |
| Query language | SQL | MQL ({{find}}, aggregation pipeline) |
| Scaling | vertical first; read replicas, partitioning | horizontal sharding built in |
| Best for | money, records with integrity and reporting | varied or evolving structures, high write volume, logs |

**For PKSF:**
- **PostgreSQL:** loans, installments, disbursements, POs and members. This is financial data that needs ACID, constraints and SQL reporting.
- **MongoDB:** varied PO survey forms or uploaded-file metadata whose fields differ by programme, activity logs, and denormalised read models.
- **Redis** (key-value) for caching and sessions.

PostgreSQL's {{JSONB}} column type also covers many "flexible field" needs without a second database.
+ 2 | Correct definition of each model | document, table
+ 3 | At least four accurate differences (schema, joins, transactions, scaling) | schema, acid, shard
+ 3 | Sensible PKSF data placement with reasons | loan
+ 2 | Nuance: JSONB, multi-document transactions, Redis | jsonb
