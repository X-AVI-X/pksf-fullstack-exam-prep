## How SQL questions are asked
Almost every government IT written paper has one SQL question, sometimes two. The examiner gives two to five tables with their columns and asks for two to four queries in parts (a), (b), (c).

Real examples from recent papers:
- **ICB Assistant Programmer 2026:** Student(sid, name, dept) and Course(sid, cid, cname, marks). List name, dept, course and marks above 80; then a dept- and course-wise list of those who passed (marks ≥ 30).
- **Combined Bank SO-IT 2025:** Sales(sales_id, salesman, region, sale_amount, sale_date). Region, average sale and count, only for regions averaging over 50,000 with at least 5 sales.
- **6 Banks AP 2021:** the textbook employee / works / company / manages schema.
- **SO-IT 2022:** the difference between COUNT(*), COUNT(col) and COUNT(DISTINCT col) when there are NULLs.

The answer structure that earns full marks:
1. Restate the schema in one line if you assume anything.
2. One query per part, labelled (a), (b), (c). One clause per line.
3. Use table aliases (s, c) and qualify every column.
4. One line on edge cases: ties, NULLs, duplicates.
5. If there is room, a sample output table with 2–3 rows.

@check
Q: Which clause filters individual rows, before any grouping, in "list the students whose marks are above 80"?
- HAVING
* WHERE
- ORDER BY
- GROUP BY
E: WHERE filters rows before grouping. HAVING filters groups after aggregation, so it is for conditions on COUNT, AVG and similar.

## Filtering and grouping: WHERE versus HAVING
The five patterns behind almost every question:

| Pattern | Clue in the question | Tool |
|---|---|---|
| Filter after joining | "list … where marks > 80" | JOIN … ON plus WHERE |
| Group summary | "dept-wise", "region-wise", "for each" | GROUP BY every non-aggregated column |
| Filter on a summary | "only regions whose average is above…" | HAVING, never WHERE |
| Compare with a set | "more than every / any employee of X" | > ALL, > ANY, or a MAX/MIN subquery |
| Both of two values | "romance and comedy" | GROUP BY id HAVING COUNT(DISTINCT x) = 2 |

Worked example (ICB 2026 style):

~~~sql
-- (a) students who scored above 80
SELECT s.name, s.dept, c.cname, c.marks
FROM student s JOIN course c ON c.sid = s.sid
WHERE c.marks > 80
ORDER BY c.marks DESC;

-- (b) dept- and course-wise count and average of those who passed
SELECT s.dept, c.cname, COUNT(*) AS passed, ROUND(AVG(c.marks), 1) AS avg_marks
FROM student s JOIN course c ON c.sid = s.sid
WHERE c.marks >= 30
GROUP BY s.dept, c.cname
ORDER BY s.dept, c.cname;
~~~

Part (b) filters rows before grouping, so WHERE is correct. If it said "only courses whose average is above 60", that condition would go in HAVING.

@check
Q: The question says "only regions whose average sale is above 50,000". Where does that condition go?
- In WHERE, as WHERE AVG(sale_amount) > 50000
* In HAVING, as HAVING AVG(sale_amount) > 50000
- In the JOIN condition
- In ORDER BY
E: The average exists only after grouping, so it is a condition on a group. HAVING is the clause for that. WHERE cannot contain an aggregate.

## Comparing with a set, and "both of two values"
Two patterns trip up most candidates.

**Compare with a set.** "Employees who earn more than every employee of X" becomes WHERE salary > ALL (SELECT salary FROM employee WHERE company = 'X'). "More than any" uses ANY. A MAX or MIN subquery works too and is easier to read.

**Both of two values.** A row holds one value in each column, so WHERE genre = 'Romance' AND genre = 'Comedy' always returns nothing. Count the distinct genres per movie instead:

~~~sql
SELECT m.title
FROM movie m JOIN movie_genre g ON g.movie_id = m.id
WHERE g.genre IN ('Romance', 'Comedy')
GROUP BY m.id, m.title
HAVING COUNT(DISTINCT g.genre) = 2;
~~~

INTERSECT of two queries gives the same answer and is also accepted.

@check
Q: Which query correctly returns movies that are both Romance and Comedy?
- WHERE genre = 'Romance' AND genre = 'Comedy'
* GROUP BY movie HAVING COUNT(DISTINCT genre) = 2 (after filtering the two genres)
- WHERE genre = 'Romance' OR genre = 'Comedy'
- SELECT DISTINCT movie with no filter
E: A single row has one genre value, so the AND on the same column matches nothing. Grouping and counting the distinct genres asks whether both are present.

## Traps examiners set
- **WHERE AVG(x) > …** is a syntax error. Aggregates belong in HAVING.
- **NOT IN with a NULL in the subquery** returns no rows at all. Use NOT EXISTS.
- **> ALL over an empty subquery** is true for every row.
- **COUNT(col) skips NULLs**; COUNT(*) counts every row. AVG divides by the non-NULL count.
- **Second-highest salary with LIMIT 1 OFFSET 1** returns the top salary again when the top value is tied, unless you use DISTINCT.

@check
Q: A Salary table has values 90, 90, 70 with no NULLs. What does SELECT DISTINCT salary ORDER BY salary DESC LIMIT 1 OFFSET 1 return, and why does the version without DISTINCT fail?
- 90 with or without DISTINCT, so both are fine
* 70 with DISTINCT; without it you get 90, the top salary repeated
- 70 without DISTINCT, because OFFSET skips duplicates
- NULL, because there is a tie
E: Without DISTINCT the list is 90, 90, 70, so OFFSET 1 gives the second 90. DISTINCT first removes the duplicate, leaving 90, 70, and OFFSET 1 gives 70.
