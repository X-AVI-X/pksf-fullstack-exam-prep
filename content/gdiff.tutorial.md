### How it is asked
"Write the difference between X and Y" is the most common short written question in Bangladeshi recruitment papers. It is also the easiest one to score fully, if you use a table. Seen in papers:

- **Combined Bank SO-IT 2025:** what are SOAP and REST, and what is their main difference in data exchange?
- **ICB AMCL AP 2024:** compiler vs interpreter; while vs do-while.
- **Bangladesh Bank AP 2016:** method overloading vs method overriding.
- **SPCBL 2022:** exception vs error; data vs information; LIFO vs FIFO; blacklist vs whitelist.

### The answer structure that earns full marks
1. **One-line definition of each side**, before the table.
2. **A table with 5–6 rows.** Each row is a **dimension** (purpose, format, performance, state, security, example), and both columns answer that same dimension.
3. **A small example or code line** for each side.
4. **"When to use which"** in one or two sentences. This line is what separates an 8 from a 10.

### Choosing the dimensions
| Topic type | Dimensions that always work |
|---|---|
| Two technologies (SOAP/REST, SQL/NoSQL) | data format, protocol, schema/contract, performance, scalability, security, typical use |
| Two language features (interface/abstract, ==/equals) | what it is, members allowed, inheritance rules, when resolved, example |
| Two SQL commands (DELETE/TRUNCATE/DROP) | what is removed, WHERE allowed, rollback, triggers fire, speed, identity reset |
| Two security ideas (authentication/authorisation) | question answered, order, mechanism, failure code, example |

### Worked example: authentication vs authorisation
| | Authentication | Authorisation |
|---|---|---|
| Question | **Who** are you? | **What** may you do? |
| Order | first | after authentication |
| Mechanism | password, OTP, Keycloak login, JWT signature check | roles and permissions (RBAC), {{@PreAuthorize}} |
| Failure | **401** Unauthorized | **403** Forbidden |
| Example | a PO user logs in via Keycloak SSO | only PKSF officers can approve a report |

### Traps
- **Rows that describe only one side** ("REST is fast") don't earn the mark. Both columns must answer the same dimension.
- **Mixing a definition into the table** wastes rows. Define each side above the table.
- **Absolute claims:** say "REST **usually** uses JSON". REST can use XML; SOAP is XML only.
