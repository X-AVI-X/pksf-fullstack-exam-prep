### Why this pattern exists
The **vacancy notice** for these posts says what you would actually build: *"a next-generation **Decision Support System (DSS)** that turns nationwide operations into real-time, actionable insight"*, with *"cloud-native architecture, AI-assisted development, complex systems integration, and large-scale data"*. Twenty-seven posts were advertised, including 16 Software Engineers (Full-stack), 4 Senior Software Engineers, a Data Architect and an ERP finance specialist.

The examiners are likely to be the engineers building the DSS. Expect at least one question that touches **reporting data**: aggregate SQL, a reporting schema, a data pipeline, or how to make dashboards fast. All of it sits inside the ToR (SQL, data workflows, Spring Batch, Redis, report generation, PostgreSQL).

### Core vocabulary
| Term | One-line meaning |
|---|---|
| **DSS** | a system that turns operational data into information for decisions: data + models + dashboards/reports |
| **OLTP vs OLAP** | many small transactions (loan entry) vs large analytical queries (disbursement trends) |
| **Star schema** | a central **fact** table (measures: amount, count) with **dimension** tables (PO, date, programme, region) |
| **ETL / ELT** | extract from sources, transform (clean, validate, conform) and load into the warehouse |
| **Incremental load** | load only new or changed rows, tracked by a watermark ({{updated_at}}) or change data capture |
| **Materialised view** | a stored query result, refreshed on a schedule. Fast dashboards. |
| **KPI** | the key indicator a manager acts on: portfolio at risk, repayment rate, disbursement growth |

### The answer structure
- **Design questions:** sources → ingestion → staging → warehouse (star schema) → aggregates/cache → API → dashboard. Then data quality, security (RBAC by PO and region) and freshness (real-time vs daily).
- **SQL questions:** the reporting toolkit is {{GROUP BY ROLLUP}} for subtotals, window functions ({{SUM() OVER}}, {{LAG}}, {{RANK}}), CTEs, and date bucketing ({{date_trunc}}).

### Traps
- **Running analytics on the OLTP primary.** Use a replica or the warehouse.
- **Normalising the warehouse like the transactional database.** A star schema is denormalised on purpose so reports need fewer joins.
- **"Real-time" for everything.** Say which KPIs truly need minutes of freshness and which can be refreshed nightly.
