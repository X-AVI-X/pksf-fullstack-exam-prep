## How database theory questions are asked
These are theory questions with a small piece of SQL or a diagram, usually for 10 marks:
- **ICB AMCL AP 2024:** what is a trigger? Give an example and say why it is needed.
- **Combined Bank SO-IT 2025:** explain the ACID properties of a transaction.
- **Bangladesh Bank AP 2016:** define the integrity rules of a database system.
- **SO-IT 2022:** draw an ER diagram from a description.

The answer structure that earns full marks:
1. A one-line definition in textbook words.
2. How it works: the parts, types or steps, as a short list or table.
3. A concrete example from a finance setting. Examiners give more marks for an example than for a longer definition.
4. Why or when it is needed, and one drawback. This separates a 7 from a 10.

@check
Q: What is the best first sentence for a "what is a trigger" answer?
- A trigger is a type of index.
* A trigger is a stored routine the database runs automatically when a specified event such as INSERT, UPDATE or DELETE occurs.
- A trigger is a SQL query you call from the application.
- A trigger is a backup of a table.
E: A trigger fires on an event and is not called explicitly. The strong opening states the event-driven behaviour in one line.

## ACID, explained with one transfer
Take a transfer of 5,000 from account A to account B. ACID says:
- **Atomicity:** both updates happen, or neither does. A failure after the debit must roll back the debit.
- **Consistency:** the database's rules still hold after the transaction. For example, the total money stays the same and no balance goes below its limit.
- **Isolation:** another transaction reading the balances mid-transfer does not see a half-finished state.
- **Durability:** once committed, the transfer survives a crash.

Note that Consistency in ACID is about the database rules. It is not the C of the CAP theorem.

@check
Q: A transfer debits account A and then crashes before crediting account B. Which ACID property ensures the debit is undone?
- Durability
- Isolation
* Atomicity
- Consistency
E: Atomicity means a transaction is all or nothing. A partial transfer is rolled back so neither account changes.

## ER diagrams: a reliable method
1. Underline the nouns. Those are entities. Underline the verbs. Those are relationships.
2. For each relationship, ask "one X has how many Y?" in both directions. The answer is 1:1, 1:N or M:N.
3. Mark the primary key of each entity. Turn every M:N relationship into a junction table.
4. Draw the boxes with crow's-foot or 1/N labels, then list the tables with their PK and FK columns. Examiners mark the table list as well as the picture.

@check
Q: A loan officer can handle many loans, and each loan has exactly one officer. What is the relationship, and what must the loan table hold?
- Many-to-many, so a junction table is needed
- One-to-one, so both tables share a key
* One-to-many from officer to loan, so the loan table holds an officer_id foreign key
- Many-to-one from loan to officer, with no key needed
E: One officer has many loans, so the many side (loan) carries the foreign key officer_id. Stating the direction in both ways avoids the common mistake.

## Normalisation in one table
| Form | Rule | Typical violation |
|---|---|---|
| 1NF | atomic values, no repeating groups | phones = "017…, 018…" |
| 2NF | 1NF, and no partial dependency on part of a composite key | (loan_id, installment_no) determines member_name |
| 3NF | 2NF, and no transitive dependency | member_id determines po_id, which determines po_name |
| BCNF | every determinant is a candidate key | officer determines branch, where officer is not a key |

@check
Q: A table has (member_id, po_id, po_name), where member_id determines po_id and po_id determines po_name. Which normal form does this break?
- 1NF only
* 3NF, because po_name depends on the key through another non-key column
- 2NF, because the key is composite
- It breaks none
E: po_name depends on member_id only through po_id, which is a transitive dependency. That violates 3NF. Splitting out a PO table fixes it.

## Traps
- **A primary key** is unique and NOT NULL, and there is only one per table. A unique key allows NULLs.
- **A trigger is not a stored procedure.** You can't call a trigger; it fires on an event.
- **An index speeds up reads but slows writes.** Always mention the cost.

@check
Q: Which statement about indexes is most accurate?
- Indexes make every query faster and cost nothing
* Indexes speed up reads on the indexed columns but add cost to inserts, updates and deletes
- Indexes replace primary keys
- Indexes are needed for every foreign key by law
E: Each index must be kept up to date on every write, so a good answer names both the read benefit and the write cost.
