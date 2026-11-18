## What is a trigger in a DBMS? Write a trigger that records every change to an account's balance in an audit table, and explain why triggers are needed and when they should be avoided.
@descriptive 10 verified
A **trigger** is a stored program that the DBMS runs **automatically** when a specified event (INSERT, UPDATE or DELETE) happens on a table. It can fire **BEFORE** or **AFTER** the event, either **FOR EACH ROW** or once per statement. Unlike a stored procedure, a trigger can't be called directly.

~~~sql
CREATE TABLE account_audit (
  id          BIGSERIAL PRIMARY KEY,
  account_id  INT,
  old_balance NUMERIC(14,2),
  new_balance NUMERIC(14,2),
  changed_by  TEXT        DEFAULT current_user,
  changed_at  TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION log_balance_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.balance <> OLD.balance THEN
    INSERT INTO account_audit (account_id, old_balance, new_balance)
    VALUES (OLD.id, OLD.balance, NEW.balance);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_account_balance
AFTER UPDATE OF balance ON account
FOR EACH ROW EXECUTE FUNCTION log_balance_change();
~~~
Verified on PostgreSQL 16: a withdrawal (5000 → 3500) wrote one audit row; changing only the holder's name wrote none. In Oracle the body goes directly inside {{CREATE TRIGGER … BEGIN … END;}} and uses {{:NEW}} and {{:OLD}}.

**Why triggers are needed:**
- **Auditing:** who changed what, and when. This matters for PKSF's financial records.
- **Rules that must hold for every application**, even ones that bypass the backend.
- **Derived data:** keep a summary table or an {{updated_at}} column in sync.

**When to avoid them:** they are hidden logic (hard to see and debug), they slow down every write, and they can chain into other triggers. Keep business logic in the service layer, and reserve triggers for auditing and integrity.
+ 2 | Definition: automatic, event-driven (INSERT/UPDATE/DELETE), BEFORE/AFTER, row/statement | automatic, event
+ 3 | Correct trigger code with audit insert | create trigger
+ 1 | Uses OLD/NEW values | old, new
+ 2 | Why needed: auditing, integrity, derived data | audit
+ 2 | Drawbacks: hidden logic, write overhead, cascading | hidden/overhead

## Explain the ACID properties of a transaction with the example of transferring 10,000 taka from account A to account B.
@descriptive 10
A **transaction** is a sequence of operations that the DBMS treats as one logical unit of work.
~~~sql
BEGIN;
UPDATE account SET balance = balance - 10000 WHERE id = 'A';
UPDATE account SET balance = balance + 10000 WHERE id = 'B';
COMMIT;      -- or ROLLBACK if anything fails
~~~
| Property | Meaning | In the transfer | Mechanism |
|---|---|---|---|
| **Atomicity** | all or nothing | if the credit to B fails, the debit from A is undone | undo log, rollback |
| **Consistency** | moves the database from one valid state to another; every constraint holds | total money is unchanged; {{CHECK (balance >= 0)}} is never violated | constraints, triggers, application rules |
| **Isolation** | concurrent transactions don't see each other's half-done work | a report running during the transfer never sees 10,000 missing from both accounts | locks, MVCC, isolation levels |
| **Durability** | once committed, the change survives a crash | after COMMIT returns, a power cut can't lose the transfer | write-ahead log (WAL) flushed to disk |

**Isolation levels:** Read Uncommitted, Read Committed (the PostgreSQL default), Repeatable Read and Serializable. Each step up prevents more anomalies (dirty read, non-repeatable read, phantom read) at the cost of concurrency.

**In Spring:** {{@Transactional}} on the service method gives you atomicity. A {{RuntimeException}} rolls the transaction back.
+ 1 | Defines a transaction as a single unit of work | unit
+ 2 | Atomicity with the transfer example | atomicity
+ 2 | Consistency: constraints hold, total unchanged | consistency
+ 2 | Isolation: no partial view; mentions levels or locking/MVCC | isolation
+ 2 | Durability: survives crash via log | durability, log
+ 1 | BEGIN/COMMIT/ROLLBACK or @Transactional shown | commit/rollback

## Define the integrity rules of a relational database (entity, referential and domain integrity) and show how each is enforced in SQL.
@descriptive 10 verified
**Integrity rules** are constraints that keep the data accurate and consistent. The DBMS enforces them, so no application can break them.

| Rule | Statement | Enforced with |
|---|---|---|
| **Entity integrity** | every row is uniquely identifiable; the primary key is never NULL | {{PRIMARY KEY}} (= UNIQUE + NOT NULL) |
| **Referential integrity** | a foreign key must match an existing primary key in the parent table, or be NULL | {{FOREIGN KEY … REFERENCES}} with {{ON DELETE}} rules |
| **Domain integrity** | each value comes from its column's allowed domain (type, range, format) | data types, {{NOT NULL}}, {{CHECK}}, {{DEFAULT}} |
| **User-defined / business** | organisation-specific rules | {{CHECK}}, {{UNIQUE}}, triggers |

~~~sql
CREATE TABLE partner_org (
  id   BIGINT PRIMARY KEY,                                  -- entity integrity
  code VARCHAR(10) NOT NULL UNIQUE
);
CREATE TABLE loan (
  id         BIGINT PRIMARY KEY,
  po_id      BIGINT NOT NULL REFERENCES partner_org(id)     -- referential integrity
               ON DELETE RESTRICT,
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),     -- domain integrity
  status     VARCHAR(10) NOT NULL DEFAULT 'ACTIVE'
               CHECK (status IN ('ACTIVE','CLOSED','DEFAULTED')),
  disbursed_on DATE NOT NULL
);
~~~
**ON DELETE options:** {{RESTRICT}}/{{NO ACTION}} (block the delete), {{CASCADE}} (delete the children too), {{SET NULL}}. For financial records, use {{RESTRICT}}: you never want deleting a partner organisation to silently delete its loans.
+ 2 | Entity integrity: PK unique and not null | entity, primary key
+ 3 | Referential integrity: FK matches parent PK, ON DELETE options | referential, foreign key
+ 2 | Domain integrity: types, CHECK, NOT NULL | domain, check
+ 2 | SQL DDL showing the constraints | references
+ 1 | Mentions business rules or chooses RESTRICT for financial data | restrict

## The table LoanRecord(loan_id, member_id, member_name, po_id, po_name, amount, installment_no, installment_paid) has the key (loan_id, installment_no). List the functional dependencies and normalise it to 3NF.
@schema 10
**Functional dependencies:**
- {{loan_id → member_id, amount}}
- {{member_id → member_name, po_id}}
- {{po_id → po_name}}
- {{(loan_id, installment_no) → installment_paid}}

**1NF:** all values are atomic, so the table is already in 1NF.

**2NF (remove partial dependencies):** {{member_id}}, {{amount}} and everything that follows from them depend only on {{loan_id}}, which is **part** of the key. Split:
- {{Loan(loan_id PK, member_id, member_name, po_id, po_name, amount)}}
- {{Installment(loan_id FK, installment_no, installment_paid, PK(loan_id, installment_no))}}

**3NF (remove transitive dependencies):** inside Loan, {{loan_id → member_id → member_name, po_id}} and {{po_id → po_name}}. Split:
- {{PartnerOrg(po_id PK, po_name)}}
- {{Member(member_id PK, member_name, po_id FK → PartnerOrg)}}
- {{Loan(loan_id PK, member_id FK → Member, amount)}}
- {{Installment(loan_id FK → Loan, installment_no, installment_paid, PK(loan_id, installment_no))}}

**Result:** every non-key attribute depends on "the key, the whole key and nothing but the key". Each of these tables is also in BCNF, because every determinant is a key.

**What this fixes:**
- **Update anomaly:** renaming a PO touches one row, not thousands.
- **Insert anomaly:** a new PO can exist before it has any member.
- **Delete anomaly:** deleting a member's last loan no longer loses the member.

For reporting, a DSS may **denormalise on purpose** (a star schema), but the transactional system stays in 3NF.
+ 2 | Correct functional dependencies | →
+ 2 | 2NF: removes the partial dependency on loan_id (Installment split) | 2nf, partial
+ 3 | 3NF: removes the transitive dependencies (Member, PartnerOrg split) | 3nf, transitive
+ 2 | Final tables with PK/FK | pk, fk
+ 1 | Names the anomalies fixed | anomal

## Draw an ER diagram and the resulting tables for this description: PKSF works with partner organisations (POs). Each PO has many branches. A member belongs to exactly one branch. A member can take many loans, and each loan has many installments. A loan officer can supervise several branches, and a branch can have several officers.
@schema 10
**Entities:** PartnerOrg, Branch, Member, Loan, Installment, Officer.

**Relationships and cardinality:**
- PartnerOrg **1 : N** Branch (has)
- Branch **1 : N** Member (enrols)
- Member **1 : N** Loan (takes)
- Loan **1 : N** Installment (repaid in); an installment is a **weak entity**, identified by loan + number
- Officer **M : N** Branch (supervises), which becomes the junction table **officer_branch**
~~~
PartnerOrg 1───N Branch 1───N Member 1───N Loan 1───N Installment
                    N
                    │ supervises (M:N)
                    M
                 Officer
~~~
**Tables:**
~~~sql
partner_org (id PK, name, registration_no UNIQUE)
branch      (id PK, po_id FK → partner_org, name, district)
member      (id PK, branch_id FK → branch, name, nid UNIQUE, phone)
loan        (id PK, member_id FK → member, programme, amount, disbursed_on, status)
installment (loan_id FK → loan, installment_no, due_date, amount_due, paid_on, amount_paid,
             PRIMARY KEY (loan_id, installment_no))
officer     (id PK, name, email UNIQUE)
officer_branch (officer_id FK → officer, branch_id FK → branch,
                PRIMARY KEY (officer_id, branch_id))
~~~
**Indexes** on every FK column ({{branch.po_id}}, {{member.branch_id}}, {{loan.member_id}}), because joins and "all loans of a member" lookups use them.
+ 2 | All six entities identified | entities
+ 3 | Correct cardinalities, including Officer–Branch as M:N | 1:n, m:n
+ 2 | Junction table officer_branch with composite PK | junction, officer_branch
+ 2 | Tables with PK/FK; Installment keyed by (loan_id, installment_no) | pk, fk
+ 1 | Diagram notation clear; FK indexes or a weak entity noted | weak/index

## What is a database index? Explain how a B-tree index speeds up a query, when an index is not used, and the cost of having too many indexes.
@concept 10
An **index** is a separate data structure that maps column values to row locations, so the DBMS can find rows **without scanning the whole table**, just as a book's index lets you skip straight to a page.

**B-tree (the default in PostgreSQL, MySQL and Oracle):** a balanced tree with sorted keys. A lookup walks from the root to a leaf in **O(log n)** steps (about 3 or 4 levels even for millions of rows). The leaves are linked, so ranges ({{BETWEEN}}, {{<}}, {{ORDER BY}}) are also fast.
~~~sql
CREATE INDEX idx_loan_member ON loan (member_id);                 -- FK lookups and joins
CREATE INDEX idx_disb_po_date ON loan_disbursement (po_id, disbursed_on);  -- composite
EXPLAIN ANALYZE SELECT * FROM loan WHERE member_id = 42;           -- check: Index Scan vs Seq Scan
~~~
**When the index is NOT used:**
- A function on the column: {{WHERE UPPER(name) = 'RAHIM'}}. Fix it with an expression index.
- A leading wildcard: {{LIKE '%rahim'}}.
- A composite index {{(po_id, disbursed_on)}} queried only on {{disbursed_on}}. This is the leftmost-prefix rule.
- Low selectivity: when a query returns a large share of the table, a sequential scan is cheaper.
- A type mismatch or implicit cast.

**Costs:** every INSERT, UPDATE and DELETE has to update every index, so writes get slower. Indexes also use disk and memory, and an unused index is pure overhead.

**Rule of thumb:** index the primary key (automatic), foreign keys, and the columns that frequent WHERE, JOIN and ORDER BY clauses use. Verify with {{EXPLAIN ANALYZE}}.
+ 2 | Definition: separate structure that avoids a full scan | full scan/scan
+ 2 | B-tree: balanced, sorted, O(log n), supports ranges | b-tree, log
+ 3 | At least three cases where the index is not used | leftmost/wildcard/function
+ 2 | Write and storage cost | write
+ 1 | Practical advice: FKs, EXPLAIN ANALYZE | explain
