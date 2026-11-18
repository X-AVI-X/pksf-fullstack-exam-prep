## Reading a query: the logical order
SQL is written in one order but runs in another. The logical order is FROM and JOIN, then WHERE, then GROUP BY, then HAVING, then SELECT, then DISTINCT, ORDER BY and LIMIT. This explains most surprises: a SELECT alias cannot be used in WHERE, because WHERE runs first.

@check
Q: Why can't a WHERE clause use a column alias defined in SELECT?
- Aliases are not allowed in SQL
* WHERE runs before SELECT, so the alias does not exist yet
- Aliases only work in ORDER BY
- WHERE runs after LIMIT
E: The logical order places WHERE before SELECT. Repeat the expression in WHERE, or wrap the query in a subquery or CTE.

## Joins
An INNER JOIN keeps rows that match in both tables. A LEFT JOIN keeps every row from the left table and fills the right side with NULL where nothing matches, which is how you find rows without a match. Put the join condition in ON, and filters in WHERE.

@check
Q: You need every customer, including those with no orders. Which join keeps the customers without matching orders?
- INNER JOIN
* LEFT JOIN from customers to orders
- CROSS JOIN
- UNION
E: A LEFT JOIN keeps all rows from the left table. Customers with no orders get NULLs on the order side.

## Aggregates, GROUP BY and HAVING
Aggregates such as COUNT, SUM, AVG, MIN and MAX collapse many rows into one value. Every non-aggregated column in SELECT must appear in GROUP BY. HAVING filters groups after aggregation, while WHERE filters rows before it.

COUNT(*) counts all rows. COUNT(column) skips NULLs. COUNT(DISTINCT column) counts distinct non-NULL values.

@check
Q: A table has 4 rows, and one of them has a NULL in column x. What do COUNT(*) and COUNT(x) return?
- 4 and 4
* 4 and 3
- 3 and 3
- 3 and 4
E: COUNT(*) counts every row. COUNT(x) counts only non-NULL values, so the NULL row is skipped.

## Subqueries, EXISTS and NULL traps
A subquery can sit in WHERE, FROM or SELECT. Use NOT EXISTS rather than NOT IN when the subquery can return NULL, because a single NULL makes NOT IN return no rows at all. Subqueries that return one value can be compared with = or >, and > ALL means greater than every value returned.

@check
Q: Which is the safe way to find customers with no order, when the order table's customer_id may contain NULL?
- WHERE id NOT IN (SELECT customer_id FROM orders)
* WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)
- WHERE id = NULL
- WHERE id <> customer_id
E: NOT IN returns no rows if the subquery contains a NULL. NOT EXISTS is not affected by that.

## Indexes and reading the plan
An index is a sorted structure that speeds up lookups and joins on its columns, at the cost of extra work on each write. Put indexes on columns used in WHERE, JOIN and ORDER BY that filter many rows. Use EXPLAIN ANALYZE to see whether PostgreSQL uses an index or scans the whole table.

@check
Q: A query filters a 10-million-row table on customer_id and is slow. What is the first thing to check?
- Rewrite it in another language
* Run EXPLAIN ANALYZE and see whether a sequential scan happens, then consider an index on customer_id
- Increase the screen resolution
- Remove the WHERE clause
E: EXPLAIN ANALYZE shows the actual plan and timings. A sequential scan on a large table with a selective filter is the usual sign that an index is missing.
