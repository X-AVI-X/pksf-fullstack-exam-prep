### How it is asked
Almost every government IT written paper has one SQL question, sometimes two. The examiner gives two to five tables with their columns and asks for two to four queries in parts (a), (b), (c). Real examples:

- **ICB Assistant Programmer 2026:** {{Student(sid, name, dept)}}, {{Course(sid, cid, cname, marks)}}. List name, dept, course and marks above 80; then a dept- and course-wise list of those who passed (marks ≥ 30).
- **Combined Bank SO-IT 2025:** {{Sales(sales_id, salesman, region, sale_amount, sale_date)}}. Region, average sale and count, only for regions averaging over 50,000 with at least 5 sales.
- **6 Banks AP 2021:** the textbook {{employee / works / company / manages}} schema: who earns over 30,000 at a named company, who lives in the same city as their company, give everyone at a company a 10% raise, companies with payroll under 100,000.
- **Bangladesh Bank AP 2016 and 2023:** second-highest salary; count the movies that are both romance and comedy across five tables.
- **SO-IT 2022:** what is the difference between {{COUNT(*)}}, {{COUNT(col)}} and {{COUNT(DISTINCT col)}} when there are NULLs.

### The answer structure that earns full marks
1. **Restate the schema** in one line if you assume anything (key columns, which table holds what).
2. **One query per part**, labelled (a), (b), (c). One clause per line: {{SELECT}}, {{FROM}}, each {{JOIN … ON}}, {{WHERE}}, {{GROUP BY}}, {{HAVING}}, {{ORDER BY}}.
3. **Use table aliases** ({{s}}, {{c}}) and qualify every column. Examiners mark down ambiguous columns.
4. **One line on edge cases:** ties, NULLs, duplicates, or "returns NULL when there is no second salary".
5. If there is room, **a sample output table** with 2–3 rows. It proves you understood the question.

### The five patterns behind almost every question
| Pattern | Clue in the question | Tool |
|---|---|---|
| Filter after joining | "list … where marks > 80" | {{JOIN … ON}} + {{WHERE}} |
| Group summary | "dept-wise", "region-wise", "for each" | {{GROUP BY}} every non-aggregated column |
| Filter on a summary | "only regions whose average…" | {{HAVING}}, never {{WHERE}} |
| Compare with a set | "more than every / any employee of X" | {{> ALL}}, {{> ANY}}, or {{MAX}}/{{MIN}} subquery |
| Both of two values | "romance **and** comedy" | {{GROUP BY id HAVING COUNT(DISTINCT x) = 2}} or {{INTERSECT}} |

### Worked example (ICB 2026 style)
~~~sql
-- (a) students who scored above 80
SELECT s.name, s.dept, c.cname, c.marks
FROM student s
JOIN course c ON c.sid = s.sid
WHERE c.marks > 80
ORDER BY c.marks DESC;

-- (b) dept- and course-wise count and average of those who passed
SELECT s.dept, c.cname, COUNT(*) AS passed, ROUND(AVG(c.marks), 1) AS avg_marks
FROM student s
JOIN course c ON c.sid = s.sid
WHERE c.marks >= 30
GROUP BY s.dept, c.cname
ORDER BY s.dept, c.cname;
~~~
Part (b) filters rows **before** grouping, so {{WHERE}} is correct. If the question had said "only courses whose average is above 60", that filter would go in {{HAVING}}.

### Traps examiners set
- **{{WHERE AVG(x) > …}}** is a syntax error. Aggregates belong in {{HAVING}}.
- **{{WHERE genre = 'Romance' AND genre = 'Comedy'}}** returns nothing. One row can't hold two values at once.
- **{{NOT IN}} with a NULL** in the subquery returns no rows. Use {{NOT EXISTS}}.
- **{{> ALL}} over an empty subquery** is true for every row, even a row whose value is NULL.
- **{{COUNT(col)}} skips NULLs**; {{COUNT(*)}} doesn't. {{AVG}} divides by the non-NULL count.
- **Second highest with {{LIMIT 1 OFFSET 1}}** without {{DISTINCT}} returns the top salary again when there is a tie at the top.
