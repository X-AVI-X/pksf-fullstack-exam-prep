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
## Find duplicate records and delete them, keeping one.
~~~sql
-- find
SELECT nid, COUNT(*) FROM member GROUP BY nid HAVING COUNT(*) > 1;

-- delete all but the lowest id (PostgreSQL)
DELETE FROM member m
USING member d
WHERE m.nid = d.nid AND m.id > d.id;
~~~
Then add {{UNIQUE (nid)}} so it can't happen again.
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
## Explain normalisation (1NF to BCNF) with an example.
Unnormalised: {{loan(loan_id, member_name, member_phone, po_name, po_district, installments "1,2,3")}}.
- **1NF**: atomic values, no repeating groups: move installments to their own rows.
- **2NF**: (with composite keys) no column depends on only part of the key.
- **3NF**: no transitive dependency: {{po_district}} depends on {{po_name}}, not on {{loan_id}}, so split into {{partner_org(id, name, district)}}, {{member(id, name, phone)}}, {{loan(id, member_id, po_id)}}.
- **BCNF**: every determinant is a candidate key.
Denormalise deliberately for reporting (materialised views, summary tables).
## A report query has become slow. How do you tune it?
1. Reproduce and measure: {{EXPLAIN (ANALYZE, BUFFERS)}}; check {{pg_stat_statements}} for top queries.
2. Look for sequential scans on large tables, wrong row estimates (run {{ANALYZE}}), nested loops over large sets, sorts spilling to disk.
3. Add the right index (composite, matching WHERE then ORDER BY; partial index; covering index with INCLUDE).
4. Rewrite: avoid functions on indexed columns, SELECT only needed columns, replace correlated subqueries with joins, use keyset pagination instead of large OFFSET.
5. For reporting: materialised views refreshed on schedule, partition big tables by date.
6. Check the app side: N+1 from ORM, pool size, missing JDBC batching; cache hot results in Redis.
7. Verify with before/after timings and watch Grafana latency panels.
