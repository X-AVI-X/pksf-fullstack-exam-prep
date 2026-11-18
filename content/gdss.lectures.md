## Why this pattern exists
The vacancy notice for these posts says what you would build. It describes "a next-generation Decision Support System (DSS) that turns nationwide operations into real-time, actionable insight", with cloud-native architecture, AI-assisted development, complex systems integration and large-scale data. Twenty-seven posts were advertised, including 16 Software Engineers (Full-stack).

Expect at least one question about reporting data: aggregate SQL, a reporting schema, a data pipeline, or making dashboards fast. All of it sits inside the ToR (SQL, data workflows, Spring Batch, Redis, report generation, PostgreSQL).

@check
Q: Which description best fits a Decision Support System?
- A system that stores only a single transaction at a time
* A system that turns operational data into information for managers to decide
- A web browser extension
- A programming language for data entry
E: A DSS combines data, models and dashboards or reports so that managers can act on information. Transactional storage alone does not do that.

## Core vocabulary
| Term | One-line meaning |
|---|---|
| DSS | a system that turns operational data into information for decisions: data, models and dashboards or reports |
| OLTP and OLAP | many small transactions (entering a loan) versus large analytical queries (disbursement trends) |
| Star schema | a central fact table (measures such as amount and count) with dimension tables (PO, date, programme, region) |
| ETL and ELT | extract from sources, transform (clean, validate, conform), load into the warehouse |
| Incremental load | load only new or changed rows, tracked by a watermark such as updated_at, or change data capture |
| Materialised view | a stored query result, refreshed on a schedule, for fast dashboards |
| KPI | the indicator a manager acts on, such as portfolio at risk or repayment rate |

@check
Q: In a star schema, where do numeric measures such as disbursed amount live?
- In a dimension table
* In the fact table
- In the date dimension only
- In a lookup view
E: Facts hold the measures and foreign keys to the dimensions. Dimensions hold descriptive attributes used for filtering and grouping.

## OLTP and OLAP: keep them apart
OLTP runs the business with normalised tables and many small writes. OLAP analyses it with denormalised star schemas, aggregates and partitions. Running heavy reports on the transactional primary slows loan entry, so reports come from a replica or the warehouse.

Pipeline to remember: ingest raw data, validate (quarantine rejects), transform, load incrementally with MERGE, refresh aggregates, cache, then serve through the API.

@check
Q: Which workload describes OLAP?
- Many short inserts and updates
* Large read-only aggregations over historical data
- Real-time payment authorisation
- Storing user sessions
E: OLAP reads large volumes of history to aggregate and analyse. OLTP is the short transactional workload.

## Reporting SQL: rollups and window functions
GROUP BY ROLLUP (division, programme) gives detail rows, division subtotals and a grand total: the grouping sets (division, programme), (division) and (). CUBE adds every combination, including (programme) alone.

For trends, build a monthly CTE, then use SUM() OVER (ORDER BY month) for a running total and LAG(total) OVER (ORDER BY month) for the change from the previous month. For the top PO per division, use RANK() OVER (PARTITION BY division ORDER BY SUM(amount) DESC) in a CTE and filter in an outer query.

@check
Q: Which function returns the previous month's value for a month-over-month change?
- LEAD
* LAG
- FIRST_VALUE
- NTILE
E: LAG reads a previous row and LEAD reads the next one. LAG(total) OVER (ORDER BY month) gives last month's total.

## Ranking and ties
ROW_NUMBER gives 1, 2, 3 and arbitrarily drops ties. RANK gives tied rows the same rank and leaves gaps. DENSE_RANK gives tied rows the same rank without gaps. When picking the top PO per division, ties should both count, so use RANK or DENSE_RANK.

@check
Q: Two POs tie for first place in a division. Which function gives both of them rank 1?
- ROW_NUMBER
* RANK
- NTILE
- LAG
E: RANK assigns the same rank to tied rows. ROW_NUMBER would number them 1 and 2 arbitrarily, so one tied PO would be dropped.

## Keeping dashboards fast
Materialised views need REFRESH MATERIALIZED VIEW CONCURRENTLY, which requires a unique index, so readers are not blocked during the refresh. Other tools are Redis with a TTL for hot results, monthly partitions so old months are not scanned, and a read replica.

@check
Q: What does REFRESH MATERIALIZED VIEW CONCURRENTLY require in PostgreSQL?
- No indexes on the view
* A unique index on the materialised view
- An exclusive table lock
- That the view has no joins
E: CONCURRENTLY compares old and new results by a unique key so readers keep working during the refresh. It needs that unique index.

## Incremental loads and surrogate keys
An incremental (delta) load copies only rows that are new or changed since the last run. It scales with change volume rather than history. Make it idempotent with MERGE or ON CONFLICT, so a rerun does not duplicate rows.

Dimension tables use surrogate keys, which isolate the warehouse from source-code changes and allow history. With SCD type 2, a PO who moves district gets a new dimension row, so old facts keep their original context.

@check
Q: A PO moves from one district to another. With SCD type 2, what happens in the dimension table?
- The old row is deleted and the facts are lost
* A new row with a new surrogate key is added, so older facts keep the old district
- The district is overwritten in place
- The PO is stored in a separate fact table
E: Type 2 keeps history by adding a row. Facts linked to the old surrogate key still show the old district.
