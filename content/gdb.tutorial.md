### How it is asked
These are theory questions with a small piece of SQL or a diagram, usually for 10 marks:

- **ICB AMCL AP 2024:** what is a trigger? Give an example and say why it is needed.
- **Combined Bank SO-IT 2025:** explain the ACID properties of a transaction.
- **Bangladesh Bank AP 2016:** define the integrity rules of a database system.
- **SO-IT 2022:** draw an ER diagram from a description.
- **SO-IT 2024 MCQs:** functional dependencies, BCNF, DDL, metadata, primary-key properties.

### The answer structure that earns full marks
1. **A one-line definition** in textbook words ("A trigger is a stored program the DBMS runs automatically when…").
2. **How it works:** the parts, types or steps, as a short list or a table.
3. **A concrete example from a finance setting:** a balance audit trigger, a fund transfer for ACID, a loan schema for normalisation. Examiners give more marks for an example than for a longer definition.
4. **Why or when it is needed, and one drawback.** This separates a 7 from a 10.

### ER diagram questions: a reliable method
1. Underline the **nouns**: those are entities. Underline the **verbs**: those are relationships.
2. For each relationship, ask "one X has how many Y?" in **both directions**: 1:1, 1:N or M:N.
3. Mark the **primary key** of each entity, and turn every **M:N** relationship into a junction table.
4. Draw the boxes with crow's-foot or 1/N labels, then list the tables with their PK and FK columns underneath. Examiners mark the table list as well as the picture.

### Normalisation in one table
| Form | Rule | Typical violation |
|---|---|---|
| 1NF | atomic values, no repeating groups | {{phones = "017…, 018…"}} |
| 2NF | 1NF, and no partial dependency on part of a composite key | {{(loan_id, installment_no) → member_name}} |
| 3NF | 2NF, and no transitive dependency | {{member_id → po_id → po_name}} |
| BCNF | every determinant is a candidate key | {{officer → branch}} where officer is not a key |

### Traps
- **A primary key** is unique **and** NOT NULL; there is only one per table. A unique key allows NULLs (one NULL in some databases, several in PostgreSQL).
- **A trigger is not a stored procedure.** You can't call a trigger; it fires on an event.
- **Consistency in ACID** means the database's rules hold. It is not the "C" of the CAP theorem.
- **An index speeds up reads but slows writes.** Always mention the cost.
