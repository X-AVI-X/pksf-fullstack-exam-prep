## Write a query for the highest-paid employee in each department.
~~~sql
SELECT dept_id, emp_id, name, salary
FROM (
  SELECT e.*, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk
  FROM employee e
) t
WHERE rnk = 1;

-- PostgreSQL-only shortcut (one row per dept):
SELECT DISTINCT ON (dept_id) dept_id, emp_id, name, salary
FROM employee ORDER BY dept_id, salary DESC;
~~~
DENSE_RANK keeps ties; use ROW_NUMBER if you need exactly one row.
+ 2 | Window function partitioned by dept ordered by salary desc | partition by
+ 1.5 | Filters rank = 1 in outer query | rnk/rank
+ 1.5 | Handles ties (DENSE_RANK/RANK) | dense_rank
+ 1 | Alternative (DISTINCT ON or join to MAX) | distinct on

## Find duplicate records and delete them, keeping one.
@sql 6
~~~sql
-- find
SELECT nid, COUNT(*) FROM member GROUP BY nid HAVING COUNT(*) > 1;

-- delete all but the lowest id (PostgreSQL)
DELETE FROM member m
USING member d
WHERE m.nid = d.nid AND m.id > d.id;
~~~
Then add {{UNIQUE (nid)}} so it can't happen again.
+ 2 | Finds duplicates with GROUP BY ... HAVING COUNT(*) > 1 | having
+ 2 | Deletes all but one (self-join USING or ROW_NUMBER) | delete
+ 1 | Keeps the lowest/earliest id deterministically | id
+ 1 | Adds a UNIQUE constraint to prevent recurrence | unique

## Write a PL/pgSQL function: total loan disbursed by a partner organisation within a date range.
~~~sql
CREATE OR REPLACE FUNCTION total_disbursed(p_po_id BIGINT, p_from DATE, p_to DATE)
RETURNS NUMERIC
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_total NUMERIC := 0;
BEGIN
  IF p_from > p_to THEN
    RAISE EXCEPTION 'from date % is after to date %', p_from, p_to;
  END IF;
  SELECT COALESCE(SUM(amount), 0) INTO v_total
  FROM loan_disbursement
  WHERE partner_org_id = p_po_id
    AND disbursed_on BETWEEN p_from AND p_to;
  RETURN v_total;
END;
$$;

SELECT total_disbursed(101, '2026-01-01', '2026-06-30');
~~~
Index to support it: {{CREATE INDEX ON loan_disbursement (partner_org_id, disbursed_on);}}
+ 1.5 | CREATE FUNCTION with typed parameters and RETURNS | returns
+ 2 | Correct SUM with joins and half-open date range | sum
+ 1 | COALESCE to return 0 instead of NULL | coalesce
+ 1.5 | LANGUAGE plpgsql/sql and how to call it | language

## Write the Oracle PL/SQL equivalent with exception handling.
~~~sql
CREATE OR REPLACE FUNCTION get_po_name(p_id IN NUMBER) RETURN VARCHAR2 IS
  v_name partner_org.name%TYPE;
BEGIN
  SELECT name INTO v_name FROM partner_org WHERE id = p_id;
  RETURN v_name;
EXCEPTION
  WHEN NO_DATA_FOUND THEN RETURN NULL;
  WHEN TOO_MANY_ROWS THEN RAISE_APPLICATION_ERROR(-20001, 'Duplicate PO id ' || p_id);
END;
/
~~~
+ 2 | CREATE OR REPLACE FUNCTION with IN params and RETURN type | return
+ 2 | SELECT ... INTO with NVL | into, NVL
+ 2 | EXCEPTION block (NO_DATA_FOUND / OTHERS) | exception

## Explain normalisation (1NF to BCNF) with an example.
Unnormalised: {{loan(loan_id, member_name, member_phone, po_name, po_district, installments "1,2,3")}}.
- **1NF**: atomic values, no repeating groups: move installments to their own rows.
- **2NF**: (with composite keys) no column depends on only part of the key.
- **3NF**: no transitive dependency: {{po_district}} depends on {{po_name}}, not on {{loan_id}}, so split into {{partner_org(id, name, district)}}, {{member(id, name, phone)}}, {{loan(id, member_id, po_id)}}.
- **BCNF**: every determinant is a candidate key.
Denormalise deliberately for reporting (materialised views, summary tables).
+ 1.5 | 1NF atomic values | atomic
+ 1.5 | 2NF no partial dependency | partial
+ 1.5 | 3NF no transitive dependency | transitive
+ 1.5 | BCNF every determinant is a candidate key, with an example | determinant

## A report query has become slow. How do you tune it?
1. Reproduce and measure: {{EXPLAIN (ANALYZE, BUFFERS)}}; check {{pg_stat_statements}} for top queries.
2. Look for sequential scans on large tables, wrong row estimates (run {{ANALYZE}}), nested loops over large sets, sorts spilling to disk.
3. Add the right index (composite, matching WHERE then ORDER BY; partial index; covering index with INCLUDE).
4. Rewrite: avoid functions on indexed columns, SELECT only needed columns, replace correlated subqueries with joins, use keyset pagination instead of large OFFSET.
5. For reporting: materialised views refreshed on schedule, partition big tables by date.
6. Check the app side: N+1 from ORM, pool size, missing JDBC batching; cache hot results in Redis.
7. Verify with before/after timings and watch Grafana latency panels.
+ 2 | Measure with EXPLAIN (ANALYZE) / pg_stat_statements | EXPLAIN
+ 2 | Index fixes matching WHERE/ORDER BY; statistics | index
+ 1.5 | Query rewrite (sargable, select columns, set-based) | rewrite/sargable
+ 1.5 | Reporting options (materialised view, partitioning, cache) and app-side N+1/pool | materialized/partition
+ 1 | Verify before/after | verify/before

## Find the second-highest distinct salary from employee(id, name, dept_id, salary, manager_id).
@sql 4 verified
~~~sql
-- Portable
SELECT MAX(salary) AS second_highest
FROM employee
WHERE salary < (SELECT MAX(salary) FROM employee);

-- Window function (generalises to Nth: rnk = N)
SELECT DISTINCT salary
FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM employee) t
WHERE rnk = 2;
~~~
- With salaries 150k, 120k, 120k, 90k… the result is **120000**. {{DENSE_RANK}} handles ties; {{ROW_NUMBER}} would not. Oracle 12c+/PostgreSQL alternative: {{ORDER BY salary DESC OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY}} on {{SELECT DISTINCT salary}}.
+ 2 | Correct logic: MAX below MAX, or DENSE_RANK = 2 | max/dense_rank
+ 1 | Handles duplicate salaries (DISTINCT / DENSE_RANK, not ROW_NUMBER) | distinct/dense_rank
+ 1 | Valid syntax, and mentions how to generalise to N | rank/offset


## List employees who earn more than the average salary of their own department.
@sql 5 verified
~~~sql
SELECT e.name, e.dept_id, e.salary
FROM employee e
WHERE e.salary > (SELECT AVG(x.salary)
                  FROM employee x
                  WHERE x.dept_id = e.dept_id)      -- correlated subquery
ORDER BY e.dept_id, e.salary DESC;

-- Window alternative (one scan)
SELECT name, dept_id, salary
FROM (SELECT e.*, AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg FROM employee e) t
WHERE salary > dept_avg;
~~~
- A correlated subquery runs per outer row, so index {{employee(dept_id)}}. The window version computes each department's average once.
+ 2 | Compares with the employee's own department average (correlation or PARTITION BY) | dept_id, avg
+ 2 | Correct syntax for the subquery or window | partition by/where
+ 1 | Notes performance (index, or window = one pass) | index/window


## Tables: po(id, name, district), member(id, po_id, name, phone, joined_on), loan(id, member_id, amount, disbursed_on, status). Show total amount disbursed in 2026 per PO, including POs with no loans (show 0), highest first.
@sql 6 verified
~~~sql
SELECT p.name                    AS po_name,
       COALESCE(SUM(l.amount), 0) AS total_disbursed,
       COUNT(l.id)               AS loans
FROM po p
LEFT JOIN member m ON m.po_id = p.id
LEFT JOIN loan   l ON l.member_id = m.id
                  AND l.disbursed_on >= DATE '2026-01-01'
                  AND l.disbursed_on <  DATE '2027-01-01'
GROUP BY p.id, p.name
ORDER BY total_disbursed DESC, p.name;
~~~
- The **date filter sits in the ON clause**. In WHERE it would remove the NULL rows and turn the LEFT JOIN into an inner join, losing zero-loan POs.
- {{COUNT(l.id)}} (not {{COUNT(*)}}) gives 0 for POs without loans. A half-open date range keeps an index on {{disbursed_on}} usable; {{EXTRACT(YEAR …)}} would not.
+ 2 | LEFT JOINs po → member → loan | left join
+ 2 | Date condition placed in ON (not WHERE) so zero-loan POs remain | on
+ 1 | COALESCE / COUNT(l.id) to show zeros | coalesce
+ 1 | GROUP BY and ORDER BY correct | group by, order by


## Tables: loan(id, member_id, amount, status), repayment(id, loan_id, paid_on, amount). Show outstanding balance per ACTIVE loan, only where something is still due.
@sql 6 verified
~~~sql
SELECT l.id                                   AS loan_id,
       l.amount,
       COALESCE(SUM(r.amount), 0)             AS repaid,
       l.amount - COALESCE(SUM(r.amount), 0)  AS outstanding
FROM loan l
LEFT JOIN repayment r ON r.loan_id = l.id
WHERE l.status = 'ACTIVE'
GROUP BY l.id, l.amount
HAVING l.amount - COALESCE(SUM(r.amount), 0) > 0
ORDER BY outstanding DESC;
~~~
- LEFT JOIN keeps loans with no repayments yet; without {{COALESCE}}, {{amount - NULL}} is NULL. The filter on an aggregate belongs in {{HAVING}}, not WHERE.
+ 2 | LEFT JOIN plus SUM grouped per loan | left join, sum
+ 2 | COALESCE so unpaid loans show the full amount | coalesce
+ 2 | HAVING on the aggregate; WHERE on status | having


## Show each repayment with a running total per loan, in date order.
@sql 4 verified
~~~sql
SELECT loan_id, paid_on, amount,
       SUM(amount) OVER (PARTITION BY loan_id ORDER BY paid_on) AS running_total
FROM repayment
ORDER BY loan_id, paid_on;
~~~
- Loan 1 paying 5,000 monthly gives 5000, 10000, 15000. Window functions keep every row, unlike GROUP BY. Add {{ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW}} to avoid ties on the same date being summed together (the default frame is RANGE).
+ 2 | SUM() OVER with PARTITION BY loan_id | over, partition by
+ 1 | ORDER BY paid_on inside the window | order by
+ 1 | Explains why a window function, not GROUP BY | window


## Find members who have never taken a loan (two ways).
@sql 4 verified
~~~sql
SELECT m.id, m.name
FROM member m
WHERE NOT EXISTS (SELECT 1 FROM loan l WHERE l.member_id = m.id);

SELECT m.id, m.name
FROM member m
LEFT JOIN loan l ON l.member_id = m.id
WHERE l.id IS NULL;
~~~
- Avoid {{NOT IN (SELECT member_id FROM loan)}}: if the subquery returns any NULL, NOT IN returns no rows.
+ 2 | NOT EXISTS anti-join correct | not exists
+ 1 | LEFT JOIN … IS NULL correct | is null
+ 1 | Mentions the NOT IN / NULL pitfall | not in/null


## Month-wise number and total of loans disbursed in 2026 (give PostgreSQL and Oracle versions).
@sql 5 verified
~~~sql
-- PostgreSQL
SELECT to_char(date_trunc('month', disbursed_on), 'YYYY-MM') AS month,
       COUNT(*) AS loans, SUM(amount) AS total
FROM loan
WHERE disbursed_on >= DATE '2026-01-01' AND disbursed_on < DATE '2027-01-01'
GROUP BY date_trunc('month', disbursed_on)
ORDER BY 1;

-- Oracle
SELECT TO_CHAR(TRUNC(disbursed_on, 'MM'), 'YYYY-MM') AS month,
       COUNT(*) AS loans, SUM(amount) AS total
FROM loan
WHERE disbursed_on >= DATE '2026-01-01' AND disbursed_on < DATE '2027-01-01'
GROUP BY TRUNC(disbursed_on, 'MM')
ORDER BY 1;
~~~
- MySQL: {{DATE_FORMAT(disbursed_on, '%Y-%m')}}.
+ 2 | Truncates the date to month and groups by it | date_trunc/trunc
+ 1 | COUNT and SUM | count, sum
+ 1 | Sargable date range for 2026 | 2027
+ 1 | Correct dialect differences | oracle


## List every employee with their manager's name; employees without a manager show "(none)".
@sql 4 verified
~~~sql
SELECT e.name                      AS employee,
       COALESCE(m.name, '(none)')  AS manager
FROM employee e
LEFT JOIN employee m ON m.id = e.manager_id
ORDER BY e.id;
~~~
- This is a **self-join**: the same table under two aliases. LEFT JOIN keeps the top manager, whose manager_id is NULL. For the whole chain upwards, use {{WITH RECURSIVE}}.
+ 2 | Self-join with two aliases on manager_id = id | self/alias
+ 1 | LEFT JOIN keeps employees without a manager | left join
+ 1 | COALESCE for "(none)" | coalesce


## Show the top 2 POs by total disbursed amount in each district.
@sql 6 verified
~~~sql
SELECT district, po_name, total
FROM (
  SELECT p.district, p.name AS po_name, SUM(l.amount) AS total,
         ROW_NUMBER() OVER (PARTITION BY p.district ORDER BY SUM(l.amount) DESC) AS rn
  FROM po p
  JOIN member m ON m.po_id = p.id
  JOIN loan   l ON l.member_id = m.id
  GROUP BY p.district, p.id, p.name
) t
WHERE rn <= 2
ORDER BY district, total DESC;
~~~
- "Top N per group" is the classic window question. The window runs **after** GROUP BY, so it can order by the aggregate. A window alias can't be used in WHERE at the same level, hence the subquery. Use {{RANK}} if ties should both appear.
+ 2 | Aggregates per PO with joins | sum, group by
+ 2 | ROW_NUMBER/RANK partitioned by district | partition by
+ 1 | Filters rn <= 2 in an outer query | rn
+ 1 | Mentions ties (RANK vs ROW_NUMBER) | rank


## Mark loans as CLOSED when total repayments cover the loan amount (one statement).
@sql 5 verified
~~~sql
UPDATE loan l
SET status = 'CLOSED'
WHERE l.status = 'ACTIVE'
  AND l.amount <= (SELECT COALESCE(SUM(r.amount), 0)
                   FROM repayment r
                   WHERE r.loan_id = l.id);
~~~
- Run it in a transaction and check the row count before COMMIT. On large tables, run it in batches or as a Spring Batch step, and index {{repayment(loan_id)}}.
+ 2 | UPDATE with a correlated subquery summing repayments | update, sum
+ 1 | Only ACTIVE loans | active
+ 1 | COALESCE / correct comparison | coalesce
+ 1 | Safety: transaction, row-count check, index | transaction/index


## Find phone numbers shared by more than one member, listing the names.
@sql 4 verified
~~~sql
SELECT phone, COUNT(*) AS members,
       string_agg(name, ', ' ORDER BY name) AS names      -- Oracle: LISTAGG(name, ', ') WITHIN GROUP (ORDER BY name)
FROM member
WHERE phone IS NOT NULL
GROUP BY phone
HAVING COUNT(*) > 1;
~~~
+ 2 | GROUP BY phone with HAVING COUNT(*) > 1 | having
+ 1 | Excludes NULL phones | is not null
+ 1 | Aggregates the names (string_agg / LISTAGG) | string_agg/listagg


## Find and fix the error: {{SELECT dept_id, name, MAX(salary) FROM employee GROUP BY dept_id;}} (goal: highest-paid employee per department)
@bug 5 verified
PostgreSQL rejects it: **column "employee.name" must appear in the GROUP BY clause or be used in an aggregate function**. Oracle gives ORA-00979. Older MySQL without {{ONLY_FULL_GROUP_BY}} silently returns an **arbitrary** name, which is wrong data.

A non-aggregated column in SELECT must be in GROUP BY. Grouping by name too would return every employee, so use a window function:
~~~sql
SELECT dept_id, name, salary
FROM (SELECT e.*, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk
      FROM employee e) t
WHERE rnk = 1;           -- RANK keeps ties
~~~
+ 1 | Identifies the error: name is neither grouped nor aggregated | group by
+ 1.5 | Explains the rule, and the MySQL arbitrary-value danger | aggregate
+ 2 | Correct fix (window function or join to a MAX subquery) | rank/partition
+ 0.5 | Handles ties | tie/rank


## Design a database schema for PKSF microcredit: POs, branches, members, loan products, loans, repayment schedule and repayments.
@schema 10
~~~
po (id PK, code UNIQUE, name, district)
branch (id PK, po_id FK→po, name)                         po 1─N branch
member (id PK, branch_id FK→branch, name, nid UNIQUE, phone, joined_on)
loan_product (id PK, name, interest_rate NUMERIC(5,2), max_tenure_months)
loan (id PK, member_id FK→member, product_id FK→loan_product,
      principal NUMERIC(14,2) CHECK > 0, disbursed_on, status, version)    member 1─N loan
installment (id PK, loan_id FK→loan, seq, due_date, due_amount,
      UNIQUE(loan_id, seq))                                 loan 1─N installment
repayment (id PK, loan_id FK→loan, paid_on, amount, txn_ref UNIQUE)        loan 1─N repayment
~~~
- **Keys:** surrogate BIGINT PKs, natural unique keys (po.code, member.nid, repayment.txn_ref, which also makes posting idempotent).
- **Indexes:** every FK column (member.branch_id, loan.member_id, installment(loan_id, due_date), repayment(loan_id, paid_on)) and loan(status) for dashboards.
- **Integrity:** NUMERIC money, CHECK constraints, ON DELETE RESTRICT (financial history is never cascaded away), a {{version}} column for optimistic locking, created_at/created_by audit columns.
- In 3NF: PO and product details are not repeated on each loan. Reporting can use materialised views.
+ 2 | All required entities with key attributes | po, member, loan, installment/schedule
+ 3 | Correct PK/FK relationships and cardinality | FK/references, 1─N/one-to-many
+ 2 | Indexes on FKs and query columns | index
+ 2 | Integrity: NUMERIC money, CHECK, UNIQUE, RESTRICT, audit/version | numeric/check/unique
+ 1 | Normalisation or ERD notation | 3NF/ERD


## What does EXPLAIN ANALYZE show?
@short 2
It **executes** the query and shows the actual plan: scan types (Seq Scan vs Index Scan), join methods, estimated vs **actual** rows and timing per node. Use it to find missing indexes or bad estimates. Wrap DML in BEGIN … ROLLBACK, because it really runs.
+ 1 | Shows the plan with actual rows/time | actual/plan
+ 1 | Used to find seq scans/missing indexes; executes for real | index/seq scan
