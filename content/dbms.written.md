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
