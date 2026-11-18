## Why "difference between" questions decide the score
"Write the difference between X and Y" is the most common short written question in Bangladeshi recruitment papers. It is also the easiest to score fully, if you use a table. Seen in papers:
- **Combined Bank SO-IT 2025:** what are SOAP and REST, and what is their main difference in data exchange?
- **ICB AMCL AP 2024:** compiler vs interpreter; while vs do-while.
- **Bangladesh Bank AP 2016:** method overloading vs method overriding.
- **SPCBL 2022:** exception vs error; data vs information; LIFO vs FIFO; blacklist vs whitelist.

The answer structure that earns full marks:
1. A one-line definition of each side, before the table.
2. A table with 5–6 rows. Each row is one dimension (purpose, format, performance, state, security, example), and both columns answer that same dimension.
3. A small example or code line for each side.
4. "When to use which" in one or two sentences. This line separates an 8 from a 10.

@check
Q: In an answer comparing SOAP and REST, which structure scores best?
- Two paragraphs with no comparison
* A table where each row is one dimension, such as data format or security, with both columns answering it
- A list of only the advantages of REST
- A single sentence giving the difference
E: A dimension-by-dimension table forces a direct comparison, which is what the examiner is marking.

## Choosing the dimensions
| Topic type | Dimensions that always work |
|---|---|
| Two technologies (SOAP and REST, SQL and NoSQL) | data format, protocol, contract, performance, scalability, security, typical use |
| Two language features (interface and abstract class) | what it is, members allowed, inheritance rules, example |
| Two SQL commands (DELETE and TRUNCATE) | what is removed, WHERE allowed, rollback, triggers fire, speed |
| Two security ideas (authentication and authorisation) | question answered, order, mechanism, failure code |

@check
Q: Which dimension best separates DELETE from TRUNCATE?
* Whether a WHERE clause is allowed
- Whether the table still exists afterwards
- Which language the command is written in
- Whether an index is used
E: DELETE can remove selected rows with WHERE, and TRUNCATE cannot. TRUNCATE also resets identity counters and is usually faster, which are further dimensions for the table.
## Worked example: authentication versus authorisation
| | Authentication | Authorisation |
|---|---|---|
| Question | Who are you? | What may you do? |
| Order | first | after authentication |
| Mechanism | password, OTP, Keycloak login, JWT signature check | roles and permissions (RBAC), @PreAuthorize |
| Failure | 401 Unauthorized | 403 Forbidden |
| Example | a PO user logs in through Keycloak SSO | only PKSF officers can approve a report |

@check
Q: A logged-in user requests an admin-only report and gets a 403 response. Which concept rejected the request?
- Authentication, because the user is unknown
* Authorisation, because the user is known but lacks the required role
- Encryption, because the response was encrypted
- Caching, because the response was cached
E: 403 Forbidden means the identity is known but the permission check failed. Authentication failures return 401.

## Traps
- **Rows that describe only one side** ("REST is fast") don't earn the mark. Both columns must answer the same dimension.
- **Defining inside the table** wastes rows. Define each side above the table.
- **Absolute claims:** say "REST usually uses JSON". REST can use XML; SOAP is XML only.

@check
Q: Which claim is safest to write in a SOAP versus REST table?
- REST is always faster than SOAP
* REST usually uses JSON, while SOAP messages are XML-based
- SOAP cannot be used over HTTP
- REST has no security features
E: The "usually" and "XML-based" wording is accurate. Absolute claims such as "always faster" lose marks and are often wrong.
