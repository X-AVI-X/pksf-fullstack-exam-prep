## The relational model
A relation is a table. Each row is a tuple, each column an attribute, and every attribute has a domain of allowed values. A relational database stores data in such tables and links them by keys. The model's strength is that queries can combine tables without the application knowing how the data is stored.

@check
Q: In the relational model, what is a tuple?
- A column
* A row in a table
- A data type
- A database user
E: A tuple is one row. Attributes are columns, and the domain is the set of allowed values for an attribute.

## Keys
A superkey is any set of attributes that uniquely identifies a row. A candidate key is a minimal superkey. The primary key is the candidate key chosen to identify rows; it must be unique and NOT NULL. A foreign key references the primary key of another table, which enforces referential integrity.

@check
Q: Which statement about primary keys is correct?
- A primary key may contain NULLs
* A primary key is unique and not NULL, and a table has only one
- A table can have many primary keys
- A primary key is never indexed
E: The primary key must identify each row, so it cannot be NULL. A table has one primary key, though it may have several candidate keys and unique constraints.

## Functional dependencies and normal forms
A functional dependency X → Y means that rows with the same X always have the same Y. Normalisation removes redundancy by splitting tables so that every dependency comes from a key. 2NF removes partial dependencies on part of a composite key. 3NF removes transitive dependencies. BCNF requires every determinant to be a candidate key.

@check
Q: In a table where student_id → dept and dept → dept_head, what is wrong?
- Nothing, the table is in BCNF
* A transitive dependency, so the table is not in 3NF
- A partial dependency on a composite key
- It is not in 1NF because it has many columns
E: dept_head depends on student_id only through dept, which is transitive. Splitting out a department table fixes it.

## Transactions and ACID
A transaction is a unit of work that either commits in full or rolls back. Atomicity: all or nothing. Consistency: the rules hold after commit. Isolation: concurrent transactions do not see each other's partial work. Durability: committed data survives a crash, usually through a write-ahead log.

@check
Q: A power failure happens after a commit returns to the application. Which ACID property keeps the committed data?
- Atomicity
- Isolation
- Consistency
* Durability
E: Durability guarantees that committed changes persist, usually by writing the log to disk before the commit is acknowledged.
