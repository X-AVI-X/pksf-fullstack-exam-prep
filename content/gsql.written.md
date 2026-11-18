## Given Student(sid, name, dept) and Course(sid, cid, cname, marks): (a) list each student's name, dept, course name and marks where marks are above 80; (b) show, for each department and course, how many students passed (marks ≥ 30) and their average marks.
@sql 10 verified
~~~sql
-- (a)
SELECT s.name, s.dept, c.cname, c.marks
FROM student s
JOIN course c ON c.sid = s.sid
WHERE c.marks > 80
ORDER BY c.marks DESC;

-- (b)
SELECT s.dept, c.cname,
       COUNT(*)               AS passed,
       ROUND(AVG(c.marks), 1) AS avg_marks
FROM student s
JOIN course c ON c.sid = s.sid
WHERE c.marks >= 30
GROUP BY s.dept, c.cname
ORDER BY s.dept, c.cname;
~~~
Sample result of (b), run on PostgreSQL 16 with 4 students and 7 enrolments:

| dept | cname | passed | avg_marks |
|---|---|---|---|
| CSE | Databases | 2 | 88.0 |
| CSE | Java | 1 | 72.0 |
| EEE | Circuits | 2 | 76.0 |

The pass filter applies to individual rows, so it belongs in {{WHERE}} (before grouping). Every non-aggregated column in the {{SELECT}} ({{dept}}, {{cname}}) must appear in {{GROUP BY}}.
+ 3 | (a) correct join on sid and the marks > 80 filter | join, > 80
+ 3 | (b) groups by both dept and course name | group by
+ 2 | (b) filters passes with WHERE before grouping; COUNT and AVG correct | where, count, avg
+ 1 | Table aliases, qualified columns, one clause per line | alias
+ 1 | Sorts or explains the result (sample rows or ORDER BY) | order by

## A table loan_disbursement(id, po_id, region, amount, disbursed_on) holds every loan paid out. Write a query that shows each region's average disbursement and number of disbursements, but only for regions whose average is above 50,000 and that have at least 5 disbursements, highest average first.
@sql 10 verified
~~~sql
SELECT region,
       ROUND(AVG(amount), 2) AS avg_amount,
       COUNT(*)              AS disbursements
FROM loan_disbursement
GROUP BY region
HAVING AVG(amount) > 50000
   AND COUNT(*) >= 5
ORDER BY avg_amount DESC;
~~~
Verified on PostgreSQL 16. In the test data, Sylhet averaged 90,030 but had only 1 disbursement, so the {{COUNT(*) >= 5}} condition removed it. Rajshahi had 6 disbursements but averaged 40,110, so the average condition removed it.

Why {{HAVING}}: both conditions are about the **group**, not a single row, so they can only be checked after {{GROUP BY}}. Writing {{WHERE AVG(amount) > 50000}} is a syntax error. To limit the period (say, this financial year), add {{WHERE disbursed_on >= DATE '2026-07-01'}}; that filter is on rows, so it goes in {{WHERE}}.
+ 3 | GROUP BY region with AVG and COUNT | group by, avg, count
+ 3 | Both conditions in HAVING, joined with AND | having
+ 2 | Correct thresholds (> 50000 and >= 5) | 50000, >= 5
+ 1 | ORDER BY average descending | order by, desc
+ 1 | Explains why HAVING, not WHERE | where

## Write three different queries to find the second-highest salary from an employee table. What does each return when two employees tie for the highest salary, and when there is only one distinct salary?
@sql 10 verified
~~~sql
-- 1. Subquery: the highest salary below the maximum
SELECT MAX(salary) AS second_highest
FROM emp
WHERE salary < (SELECT MAX(salary) FROM emp);

-- 2. DISTINCT + OFFSET
SELECT DISTINCT salary
FROM emp
WHERE salary IS NOT NULL
ORDER BY salary DESC
OFFSET 1 LIMIT 1;

-- 3. Window function: generalises to the Nth highest
SELECT DISTINCT salary
FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM emp
  WHERE salary IS NOT NULL
) t
WHERE rnk = 2;
~~~
Verified on PostgreSQL 16 with salaries 90,000, 70,000, 70,000, 50,000, 40,000 and one NULL: all three return **70,000**.

- **Tie at the top** (two people on 90,000): all three still return the next **distinct** value. Without {{DISTINCT}}, query 2 would return 90,000 again.
- **Only one distinct salary:** query 1 returns one row containing NULL (an aggregate always returns a row). Queries 2 and 3 return no rows.
- **Who earns it:** select {{name}} in query 3's inner query instead of {{DISTINCT salary}}. That returns both people on 70,000.
- **NULL salaries** are ignored by {{MAX}}. Queries 2 and 3 filter them, because PostgreSQL sorts NULLs first in descending order.
+ 3 | Subquery method with MAX(...) WHERE salary < MAX | max, <
+ 2 | OFFSET/LIMIT method with DISTINCT | distinct, offset/limit
+ 2 | DENSE_RANK (or equivalent) method, mentions Nth highest | dense_rank
+ 2 | Correct behaviour for ties and for a single distinct salary | tie, null
+ 1 | Handles NULL salaries | null

## A table emp(id, name, salary, bonus) has 6 rows. Salary is NULL for one employee; bonus is NULL for three. The non-NULL bonuses are 5000, 2000 and 2000. What do COUNT(*), COUNT(bonus), COUNT(DISTINCT bonus), SUM(bonus) and AVG(bonus) return, and why?
@sql 10 verified
~~~sql
SELECT COUNT(*)              AS all_rows,        -- 6
       COUNT(bonus)          AS with_bonus,      -- 3
       COUNT(DISTINCT bonus) AS distinct_bonus,  -- 2  (5000, 2000)
       SUM(bonus)            AS sum_bonus,       -- 9000
       AVG(bonus)            AS avg_bonus        -- 3000
FROM emp;
~~~
Output verified on PostgreSQL 16.

| Expression | Counts | Result |
|---|---|---|
| {{COUNT(*)}} | every row, NULLs included | 6 |
| {{COUNT(bonus)}} | rows where bonus is not NULL | 3 |
| {{COUNT(DISTINCT bonus)}} | distinct non-NULL values | 2 |
| {{SUM(bonus)}} | ignores NULLs | 9000 |
| {{AVG(bonus)}} | {{SUM / COUNT(bonus)}} = 9000 / 3 | 3000, **not** 9000 / 6 = 1500 |

**Why it matters:** if the business means "average bonus across all staff, treating no bonus as 0", write {{AVG(COALESCE(bonus, 0))}}, which gives 1500. All aggregates except {{COUNT(*)}} skip NULLs.
+ 2 | COUNT(*) = 6 with reason | 6
+ 2 | COUNT(bonus) = 3 and COUNT(DISTINCT bonus) = 2 | 3, 2
+ 2 | SUM = 9000, AVG = 3000 | 9000, 3000
+ 3 | Explains aggregates skip NULLs; AVG divides by the non-NULL count | null
+ 1 | Shows COALESCE to treat NULL as 0 | coalesce

## Given employee(person_name, street, city), works(person_name, company_name, salary), company(company_name, city) and manages(person_name, manager_name), write SQL to: (a) find the names and cities of everyone who works for "First Bank" and earns more than 30,000; (b) find employees who live in the same city as the company they work for; (c) give everyone at "First Bank" a 10% raise; (d) find companies whose total payroll is under 100,000; (e) find employees who earn more than every employee of "Small Bank".
@sql 10 verified
~~~sql
-- (a)
SELECT e.person_name, e.city
FROM employee e
JOIN works w ON w.person_name = e.person_name
WHERE w.company_name = 'First Bank'
  AND w.salary > 30000;

-- (b)
SELECT e.person_name
FROM employee e
JOIN works   w ON w.person_name  = e.person_name
JOIN company c ON c.company_name = w.company_name
WHERE e.city = c.city;

-- (c)
UPDATE works
SET salary = salary * 1.10
WHERE company_name = 'First Bank';

-- (d)
SELECT company_name, SUM(salary) AS payroll
FROM works
GROUP BY company_name
HAVING SUM(salary) < 100000;

-- (e)
SELECT w.person_name
FROM works w
WHERE w.salary > ALL (SELECT salary FROM works
                      WHERE company_name = 'Small Bank'
                        AND salary IS NOT NULL);
~~~
All five were run on PostgreSQL 16.

- **(b)** needs **both** joins: the employee's city is in {{employee}}, and the company's city is in {{company}}.
- **(c)** Run it inside a transaction ({{BEGIN; … COMMIT;}}) so it can be checked and rolled back.
- **(e)** Without the {{IS NOT NULL}} filter, a single NULL salary at Small Bank makes {{> ALL}} unknown for everyone, so it returns no rows. An equivalent is {{w.salary > (SELECT MAX(salary) …)}}.
+ 2 | (a) join employee-works with both filters | first bank, 30000
+ 2 | (b) joins all three tables and compares e.city = c.city | city
+ 2 | (c) UPDATE … SET salary = salary * 1.10 with the right WHERE | update, 1.1
+ 2 | (d) GROUP BY company with HAVING SUM < 100000 | having, sum
+ 2 | (e) > ALL subquery (or > MAX) and notes the NULL trap | all, max

## Tables: movie(mid, title, year), genre(gid, name) and has_genre(mid, gid). A movie can have several genres. Write a query that counts the movies that are both "Romance" and "Comedy". Explain why the obvious query with WHERE name = 'Romance' AND name = 'Comedy' is wrong.
@sql 10 verified
~~~sql
SELECT COUNT(*) AS romantic_comedies
FROM (
  SELECT hg.mid
  FROM has_genre hg
  JOIN genre g ON g.gid = hg.gid
  WHERE g.name IN ('Romance', 'Comedy')
  GROUP BY hg.mid
  HAVING COUNT(DISTINCT g.name) = 2
) t;

-- Alternative with INTERSECT
SELECT COUNT(*) FROM (
  SELECT hg.mid FROM has_genre hg JOIN genre g ON g.gid = hg.gid WHERE g.name = 'Romance'
  INTERSECT
  SELECT hg.mid FROM has_genre hg JOIN genre g ON g.gid = hg.gid WHERE g.name = 'Comedy'
) t;
~~~
Verified on PostgreSQL 16 with 5 films, 2 of which have both genres: both queries return **2**.

**Why the obvious query is wrong:** {{WHERE g.name = 'Romance' AND g.name = 'Comedy'}} tests each joined row on its own, and one row holds a single genre name, so it returns **0**. Switching to {{IN ('Romance', 'Comedy')}} with {{COUNT(DISTINCT mid)}} returns **3**, because it counts movies with **either** genre. The fix is to group per movie and require both names in the group.
+ 3 | Joins has_genre to genre and filters the two names | join, in
+ 3 | GROUP BY movie with HAVING COUNT(DISTINCT name) = 2 (or INTERSECT) | having, intersect
+ 1 | Counts the movies in an outer query | count
+ 3 | Explains why AND on the same column returns 0 and why IN alone over-counts | and, either

## Table emp(id, name, dept_id, manager_id, salary), where manager_id refers to another row of emp. Write queries to (a) list every employee with their manager's name, including the top boss who has no manager; (b) list employees who earn more than the average salary of their own department; (c) list employees who manage nobody.
@sql 10 verified
~~~sql
-- (a) self-join; LEFT JOIN keeps the employee with no manager
SELECT e.name AS employee, m.name AS manager
FROM emp e
LEFT JOIN emp m ON m.id = e.manager_id
ORDER BY e.id;

-- (b) correlated subquery: recomputed for each outer row's department
SELECT e.name, e.dept_id, e.salary
FROM emp e
WHERE e.salary > (SELECT AVG(x.salary)
                  FROM emp x
                  WHERE x.dept_id = e.dept_id);

-- (c) NOT EXISTS, safe with NULLs
SELECT e.name
FROM emp e
WHERE NOT EXISTS (SELECT 1 FROM emp x WHERE x.manager_id = e.id);
~~~
All three verified on PostgreSQL 16.

- **(a)** An inner join would drop the top boss, whose {{manager_id}} is NULL.
- **(b)** A window-function alternative: {{AVG(salary) OVER (PARTITION BY dept_id)}} in a subquery, then filter in the outer query.
- **(c)** The tempting {{WHERE id NOT IN (SELECT manager_id FROM emp)}} returned **0 rows** in the test, because the boss's {{manager_id}} is NULL, and {{x NOT IN (…, NULL)}} is never true.
+ 3 | (a) self-join with LEFT JOIN so the top boss is kept | left join
+ 3 | (b) correlated subquery (or window AVG) per department | avg, dept
+ 3 | (c) NOT EXISTS (or NOT IN with a NULL filter) | not exists
+ 1 | Explains the NOT IN + NULL trap | null

## Write SQL to (a) find duplicate national IDs in a member table; (b) increase by 5% the salary of every employee whose department is located in Dhaka, using the dept table; (c) delete the members who have no loan in the loan table.
@sql 10 verified
~~~sql
-- (a) duplicates
SELECT nid, COUNT(*) AS copies
FROM member
GROUP BY nid
HAVING COUNT(*) > 1;

-- (b) UPDATE driven by another table
UPDATE emp e
SET salary = salary * 1.05
FROM dept d
WHERE d.id = e.dept_id
  AND d.city = 'Dhaka';
-- portable form (Oracle, MySQL, PostgreSQL):
-- UPDATE emp SET salary = salary * 1.05
-- WHERE dept_id IN (SELECT id FROM dept WHERE city = 'Dhaka');

-- (c) delete rows with no match
DELETE FROM member m
WHERE NOT EXISTS (SELECT 1 FROM loan l WHERE l.member_id = m.id);
~~~
- **(a)** {{HAVING COUNT(*) > 1}} is the standard duplicate check. Prevent new duplicates with {{ALTER TABLE member ADD CONSTRAINT uq_member_nid UNIQUE (nid)}}.
- **(b)** {{UPDATE … FROM}} is PostgreSQL syntax; the {{IN (subquery)}} form works everywhere. Before changing data, run the same {{WHERE}} as a {{SELECT}} to see which rows it hits.
- **(c)** {{NOT EXISTS}} avoids the {{NOT IN}} + NULL trap. Run it in a transaction, and expect a foreign-key error if other tables still reference those members.
+ 3 | (a) GROUP BY nid HAVING COUNT(*) > 1 | having
+ 3 | (b) UPDATE restricted through the dept table (FROM or IN subquery) | update, dhaka
+ 3 | (c) DELETE with NOT EXISTS (or LEFT JOIN … IS NULL) | not exists, delete
+ 1 | Safety: transaction, check with SELECT first, or UNIQUE constraint | transaction/unique
