## What is a Decision Support System (DSS)? Describe its components and explain the difference between OLTP and OLAP systems, using PKSF's planned nationwide DSS as the example.
@descriptive 10
A **Decision Support System** is an information system that collects, integrates and analyses data so that managers can make better decisions. It answers questions like "which POs' repayment rates are falling?" and "where should next quarter's funds go?", rather than recording individual transactions.

**Components:**
1. **Data management:** sources (PO reports via API, the loan MIS, ERP finance, field surveys), plus ETL into a **data warehouse**.
2. **Model management:** calculations and analytics: KPIs, trends, forecasts, risk scores, what-if analysis (an AI/ML model may sit here).
3. **User interface:** dashboards, drill-down reports, maps, alerts, exports (React/Angular with Material Design charts).
4. **Knowledge and rules (optional):** thresholds and business rules, such as "flag a PO when PAR > 5%".

| | OLTP (operational) | OLAP (analytical, the DSS) |
|---|---|---|
| Purpose | run the business: record loans and installments | analyse the business: trends, comparisons |
| Typical query | insert or update one loan; short | aggregate millions of rows by PO, month, region |
| Schema | normalised (3NF) | **denormalised star/snowflake** schema |
| Data | current, detailed | historical, summarised and detailed |
| Users | many clerks and PO staff | fewer analysts and managers |
| Optimised for | write speed, integrity (ACID) | read speed: indexes, partitions, pre-aggregates |
| Example in PKSF | loan entry system, OLRS submission | nationwide disbursement and repayment dashboard |

**Why separate them:** heavy analytical queries would slow down the transactional system, and the two need different schemas. Data flows OLTP → ETL → warehouse → DSS.
+ 2 | Definition of DSS (supports decisions with integrated, analysed data) | decision
+ 3 | Components: data, model, UI (and rules) | data, model, dashboard
+ 3 | OLTP vs OLAP with at least four differences | oltp, olap
+ 2 | PKSF-relevant example and why they are separated | po

## Design a star schema for analysing loan disbursements across partner organisations, programmes and time. Show the fact and dimension tables, and write one query that uses it.
@schema 10 verified
**Grain:** one row per **PO × programme × day**, recording disbursements. (Choose the grain first; every measure must match it.)
~~~sql
CREATE TABLE dim_po (
  po_key   SERIAL PRIMARY KEY,          -- surrogate key
  po_code  TEXT UNIQUE,                 -- natural/business key from the source
  po_name  TEXT,
  division TEXT,
  district TEXT
);
CREATE TABLE dim_date (
  date_key  INT PRIMARY KEY,            -- 20260115
  full_date DATE UNIQUE,
  month INT, quarter INT, year INT,
  fiscal_year TEXT                       -- '2025-26' (July–June)
);
CREATE TABLE dim_programme (
  programme_key SERIAL PRIMARY KEY,
  name TEXT                              -- Jagoron, Agrosor, Buniad, Sufolon
);
CREATE TABLE fact_disbursement (
  po_key        INT REFERENCES dim_po,
  date_key      INT REFERENCES dim_date,
  programme_key INT REFERENCES dim_programme,
  loans         INT,                    -- additive measure
  amount        NUMERIC(14,2)           -- additive measure
);
~~~
**Query: total disbursement by division and quarter**
~~~sql
SELECT p.division, d.year, d.quarter, SUM(f.amount) AS total, SUM(f.loans) AS loans
FROM fact_disbursement f
JOIN dim_po   p ON p.po_key   = f.po_key
JOIN dim_date d ON d.date_key = f.date_key
GROUP BY p.division, d.year, d.quarter
ORDER BY p.division, d.year, d.quarter;
~~~
The schema and queries were run on PostgreSQL 16.

**Design notes:**
- **Facts** hold numeric, additive measures; **dimensions** hold descriptive attributes used to filter and group.
- **Surrogate keys** in the dimensions isolate the warehouse from changes to source codes, and allow history (**slowly changing dimension type 2**: a new row when a PO moves district).
- **Denormalised dimensions** (division and district in {{dim_po}}) mean fewer joins and simpler reports.
- **Indexing and partitioning:** partition {{fact_disbursement}} by {{date_key}} range (monthly); index the foreign keys, or use BRIN indexes on the date.
+ 2 | States the grain | grain
+ 3 | Fact table with FKs and additive measures | fact, measure
+ 3 | At least three dimensions (PO, date, programme) with attributes and surrogate keys | dimension, surrogate
+ 1 | Correct aggregation query joining fact and dimensions | sum, group by
+ 1 | Notes SCD, partitioning or why denormalised | scd/partition

## Using fact_disbursement(po_key, date_key, programme, loans, amount) and dim_po(po_key, po_name, division), write a single query that shows total disbursement by division and programme, with a subtotal for each division and a grand total.
@sql 10 verified
~~~sql
SELECT COALESCE(p.division, 'ALL')       AS division,
       COALESCE(f.programme, 'Subtotal') AS programme,
       SUM(f.amount)                     AS total
FROM fact_disbursement f
JOIN dim_po p ON p.po_key = f.po_key
GROUP BY ROLLUP (p.division, f.programme)
ORDER BY p.division NULLS LAST, f.programme NULLS LAST;
~~~
Result on PostgreSQL 16 with 8 disbursements:

| division | programme | total |
|---|---|---|
| Dhaka | Agrosor | 2,000,000 |
| Dhaka | Jagoron | 1,550,000 |
| Dhaka | Subtotal | 3,550,000 |
| Rajshahi | Agrosor | 300,000 |
| Rajshahi | Jagoron | 950,000 |
| Rajshahi | Subtotal | 1,250,000 |
| ALL | Subtotal | 4,800,000 |

**How it works:** {{ROLLUP (a, b)}} produces the grouping sets {{(a, b)}}, {{(a)}} and {{()}}, which give the detail rows, the per-division subtotals and the grand total in **one scan**. The rolled-up columns come back as NULL, so {{COALESCE}} labels them.
- If the data itself can contain NULLs, use {{GROUPING(p.division)}} to tell a subtotal row from a real NULL.
- {{CUBE (a, b)}} would also add the per-programme totals across all divisions.
- {{GROUPING SETS}} lets you list exactly the combinations you want.

The alternative, three queries joined with {{UNION ALL}}, scans the table three times.
+ 3 | Joins fact to dim_po and sums the amount | join, sum
+ 4 | GROUP BY ROLLUP (division, programme) | rollup
+ 1 | Labels subtotal/grand-total rows (COALESCE or GROUPING) | coalesce/grouping
+ 2 | Explains grouping sets produced; mentions CUBE/GROUPING SETS or UNION ALL alternative | cube/grouping sets

## Write a query that shows total disbursement per month together with a running (cumulative) total and the change from the previous month, in amount and percentage.
@sql 10 verified
~~~sql
WITH monthly AS (
  SELECT d.year, d.month, SUM(f.amount) AS total
  FROM fact_disbursement f
  JOIN dim_date d ON d.date_key = f.date_key
  GROUP BY d.year, d.month
)
SELECT year, month, total,
       SUM(total) OVER (ORDER BY year, month)          AS running_total,
       total - LAG(total) OVER (ORDER BY year, month)  AS change_vs_prev,
       ROUND(100.0 * (total - LAG(total) OVER (ORDER BY year, month))
             / LAG(total) OVER (ORDER BY year, month), 1) AS pct_change
FROM monthly
ORDER BY year, month;
~~~
Result on PostgreSQL 16:

| year | month | total | running_total | change_vs_prev | pct_change |
|---|---|---|---|---|---|
| 2026 | 1 | 1,700,000 | 1,700,000 | NULL | NULL |
| 2026 | 2 | 900,000 | 2,600,000 | −800,000 | −47.1 |
| 2026 | 3 | 2,200,000 | 4,800,000 | 1,300,000 | 144.4 |

- **The CTE** aggregates to one row per month first; window functions then run over those rows.
- **{{SUM() OVER (ORDER BY …)}}** gives the cumulative total (the default frame runs from the first row to the current one).
- **{{LAG()}}** reads the previous row. It is NULL for the first month, so the change is NULL there, which is correct.
- **Division by zero:** wrap the denominator in {{NULLIF(LAG(total) OVER (…), 0)}} if a month could total zero.
- **Gaps:** a month with no disbursements produces no row. Generate the months with {{generate_series}} and LEFT JOIN to show zeros.
- **Per PO:** add {{PARTITION BY po_key}} inside each {{OVER}} clause.
+ 2 | Monthly aggregation (CTE or subquery) | group by, month
+ 3 | Running total with SUM() OVER (ORDER BY) | sum(, over
+ 3 | LAG for previous month; amount and percentage | lag
+ 1 | Handles first month NULL / division by zero (NULLIF) | nullif/null
+ 1 | Mentions gaps (generate_series) or PARTITION BY per PO | partition by/generate_series

## Design the data pipeline that brings data from 200+ partner organisations' systems into PKSF's DSS every day. Cover ingestion, validation, transformation, loading and failure handling.
@arch 10
**Pipeline (ELT on PostgreSQL, orchestrated by Spring Batch or Airflow):**
~~~
Sources: PO REST API pushes · OLRS uploads (Excel/CSV) · loan MIS DB · ERP finance
   │  1. Ingest (raw, append-only, with batch_id, source, received_at, checksum)
   ▼
Landing / raw zone ── 2. Validate (schema, types, ranges, referential, duplicates)
   │                        └─ rejects → error table + report back to the PO
   ▼
Staging (cleaned, typed) ── 3. Transform (conform codes, map PO ids → po_key, derive KPIs, SCD type 2)
   ▼
Warehouse: star schema (fact_disbursement, fact_repayment, dims) ── 4. Load (incremental MERGE)
   ▼
Aggregates: materialised views / summary tables ── 5. Refresh → Redis cache → DSS API → dashboards
~~~
**Key decisions:**
1. **Incremental loads:** a watermark ({{updated_at > last_run}}) or change data capture (Debezium on the MIS). Never reload everything daily.
2. **Idempotency:** each batch has an id plus checksum; {{INSERT … ON CONFLICT DO UPDATE}} (MERGE) means re-running a failed day doesn't duplicate rows.
3. **Data quality gates:** row counts reconcile against the PO's control totals, sums of amounts match, and no orphan keys exist. Failing batches are **quarantined**, not loaded. A data-quality dashboard per PO.
4. **Orchestration:** a dependency-aware schedule (extract → validate → transform → load → refresh), with **retries with backoff**, a **restartable** step from the point of failure (Spring Batch's JobRepository), and alerts on failure or a late source.
5. **Scale:** process POs in parallel (partitioned steps), bulk COPY/batch inserts, partitioned fact tables by month, heavy transforms off the OLTP primary.
6. **Security and governance:** least-privilege service accounts, encryption in transit, PII (NID, phone) masked or hashed in analytics, lineage (which source and batch produced each row), audit logs.
7. **Freshness:** a daily batch for most KPIs; near-real-time streaming (Kafka) only for the few KPIs that need it, such as same-day disbursement monitoring.
+ 2 | Stages: ingest → validate → transform → load → serve | staging, warehouse
+ 2 | Incremental load (watermark/CDC) | incremental, cdc/watermark
+ 2 | Validation and quality gates, rejects reported | validat, reconcil
+ 2 | Idempotency/restartability and orchestration with retries/alerts | idempoten, retry
+ 1 | Scale: parallel/partitioned, bulk load | partition
+ 1 | Security/PII and lineage | pii/mask

## A DSS dashboard showing nationwide disbursement KPIs takes 20 seconds to load because it aggregates millions of rows on every request. How would you make it fast? Include SQL for one technique.
@scenario 10 verified
**Diagnose first:** {{EXPLAIN ANALYZE}} the dashboard queries and check {{pg_stat_statements}}. Usually the problem is full scans plus aggregation of raw facts on every request, often against the OLTP primary.

**Techniques, roughly in order:**
1. **Pre-aggregate with a materialised view** (or a summary table maintained by the ETL):
~~~sql
CREATE MATERIALIZED VIEW mv_monthly_po AS
SELECT f.po_key, d.year, d.month, SUM(f.amount) AS total, SUM(f.loans) AS loans
FROM fact_disbursement f
JOIN dim_date d ON d.date_key = f.date_key
GROUP BY f.po_key, d.year, d.month;

CREATE UNIQUE INDEX ON mv_monthly_po (po_key, year, month);   -- required for CONCURRENTLY
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_po;          -- readers aren't blocked
~~~
   Verified on PostgreSQL 16. Refresh after each ETL load (scheduled). The dashboard then reads thousands of rows instead of millions.
2. **Cache the API response in Redis** with a key per filter ({{dss:kpi:division=Dhaka:fy=2025-26}}) and a TTL matched to data freshness. Evict when the ETL finishes. Spring's {{@Cacheable}} makes this a one-liner.
3. **Indexes and partitioning:** partition facts by month so a "this fiscal year" query scans 12 partitions, not all history; use BRIN indexes on dates; composite indexes on the common filters.
4. **Run against the right database:** a read replica or the warehouse, never the OLTP primary.
5. **Frontend and API:** load KPI cards in parallel, paginate detail tables, fetch drill-down data only when needed, compress responses, and show cached data with a "last updated" time.
6. **Columnar engine** for very large data (TimescaleDB/Citus, ClickHouse), a Data Architect decision.

**Measure the result:** a p95 load-time target (e.g. < 2 s) on a Grafana panel, with an alert on regression.
+ 2 | Diagnoses with EXPLAIN ANALYZE / identifies aggregation on every request | explain
+ 3 | Materialised view or summary table with correct SQL and refresh (CONCURRENTLY + unique index) | materialized view, refresh
+ 2 | Redis caching with TTL/eviction tied to ETL | redis, ttl
+ 2 | Partitioning/indexes and replica/warehouse separation | partition, replica
+ 1 | Frontend/API measures or measurable target | p95/paginat

## Write a query that finds, for each division, the partner organisation with the highest total disbursement, keeping ties. Explain your choice of window function.
@sql 10 verified
~~~sql
SELECT division, po_name, total
FROM (
  SELECT p.division, p.po_name,
         SUM(f.amount) AS total,
         RANK() OVER (PARTITION BY p.division ORDER BY SUM(f.amount) DESC) AS rnk
  FROM fact_disbursement f
  JOIN dim_po p ON p.po_key = f.po_key
  GROUP BY p.division, p.po_name
) t
WHERE rnk = 1
ORDER BY division;
~~~
Result on PostgreSQL 16: **Dhaka → Ashroy (2,000,000)**, **Rajshahi → Uddipan (1,250,000)**.

- **Aggregate, then rank:** window functions run after {{GROUP BY}}, so {{SUM(f.amount)}} can be used inside {{ORDER BY}} of the {{OVER}} clause.
- **{{PARTITION BY division}}** restarts the ranking for each division.
- **The filter must go in an outer query:** {{WHERE rnk = 1}} can't be in the same SELECT, because WHERE runs before window functions.
- **Choice of function:**
  - {{RANK()}} keeps **ties**: two POs with equal top totals both get 1.
  - {{DENSE_RANK()}} also keeps ties, without gaps afterwards.
  - {{ROW_NUMBER()}} picks exactly one row, arbitrarily, among ties.
- **For "top 3 per division"**, use {{rnk <= 3}}.
+ 3 | Aggregates per division and PO | sum, group by
+ 3 | RANK/DENSE_RANK with PARTITION BY division ORDER BY total DESC | partition by, rank
+ 2 | Filters rank = 1 in an outer query and explains why | outer/subquery
+ 2 | Explains RANK vs DENSE_RANK vs ROW_NUMBER for ties | row_number, dense_rank
