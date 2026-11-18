## Why security is a regular question
Every recent paper has one security question. The ToR asks for robust API security, encryption mechanisms and RBAC, so this pattern is squarely in scope. Seen in papers:
- **Bangladesh Bank AP 2023:** a man-in-the-middle attack on Diffie-Hellman, and how confidentiality, integrity and availability relate to falsification, interception, masquerade and denial of service.
- **ICB AMCL AP 2024:** write the RSA algorithm; types of information security against cyber threats.
- **SPCBL 2022:** what SQL injection is and how to prevent it; what XSS is and how to fix it.
- **ICB AP 2026:** a zero-day attack during a patch window on a financial system.

@check
Q: In a login form, which input is the classic SQL injection pattern?
- A password with 12 characters
* ' OR '1'='1
- A username with a dot in it
- An email with a plus sign
E: The quote closes the string in the SQL and OR '1'='1' is always true, which can bypass the login check. Parameterised queries stop this.

## The answer structure for "attack" questions
1. What it is, in one line.
2. How it works: a three-step attack flow, ideally with the malicious input written out, such as ' OR '1'='1 or a script tag.
3. Impact in the PKSF setting: stolen member data, altered loan amounts, a regulator incident.
4. Prevention in layers: code (parameterised queries, output encoding), framework (Spring Security, React escaping), infrastructure (WAF, TLS), and process (code review, scanning).

@check
Q: Which is the primary fix for SQL injection?
- Escaping quotes in the input string by hand
* Parameterised (prepared) queries, so the input is never parsed as SQL
- Hiding the database port
- Encrypting the whole database
E: Parameterised queries keep data separate from the SQL text, so input cannot change the query. Manual escaping is fragile and is only a backup.

## Algorithm questions: RSA and Diffie-Hellman
Write the steps numbered, then work a small example with real numbers, and finish with what makes it secure. Examiners award most marks for the worked example.

RSA with p = 5, q = 11: n = 55, φ = 40, e = 3, d = 27. Encrypting m = 9 gives c = 9³ mod 55 = 14, and decrypting gives 14²⁷ mod 55 = 9. Security rests on factoring n being hard.

Diffie-Hellman with p = 23, g = 5: Alice picks a = 6 and sends A = 8; Bob picks b = 15 and sends B = 19. The shared key is 19⁶ mod 23 = 8¹⁵ mod 23 = 2. Security rests on the discrete logarithm being hard.

@check
Q: In the RSA example with p = 5, q = 11, e = 3, d = 27, what is the ciphertext of m = 9?
- 27
* 14
- 9
- 55
E: c = m^e mod n = 9³ mod 55 = 729 mod 55 = 14. Decrypting 14²⁷ mod 55 returns 9.

## Diffie-Hellman's weakness
Diffie-Hellman exchanges a key; it does not encrypt. It has no authentication, so an attacker in the middle can run one exchange with Alice and another with Bob, and read or change everything. The fix is authentication, with certificates or signatures, as TLS does.

@check
Q: Why is plain Diffie-Hellman vulnerable to a man-in-the-middle attack?
- Its keys are too short to store
* It does not authenticate the parties, so an attacker can run separate exchanges with each side
- It encrypts too slowly
- It sends the secret key in plain text
E: The secret is never sent, but the parties cannot verify who they are talking to. Certificates or signatures fix that by proving identity.

## Mapping the CIA triad to attacks
| Property | Meaning | Example attack |
|---|---|---|
| Confidentiality | only authorised parties read data | interception, session hijacking |
| Integrity | data is not changed without detection | falsification, tampering with loan amounts |
| Availability | the service stays up | denial of service |

Masquerade means pretending to be someone else; it attacks authentication.

@check
Q: An attacker floods the loan portal with requests so real users cannot log in. Which CIA property is attacked?
- Confidentiality
- Integrity
* Availability
- Non-repudiation
E: Denial of service attacks availability. The data is not read or changed; the service is made unusable.

## Traps
- **Hashing is not encryption.** Passwords are hashed with bcrypt or Argon2, never encrypted, and never with plain MD5 or SHA.
- **Escaping input instead of parameterising it** is not the primary SQL injection fix.
- **The CIA triad** is Confidentiality, Integrity, Availability. It is not an agency.

@check
Q: Which is the correct way to store user passwords?
- Encrypted with a reversible key so they can be recovered
- Stored as plain text in a protected table
* Hashed with a slow, salted algorithm such as bcrypt or Argon2
- Hashed with MD5 for speed
E: Passwords should not be recoverable, so they are hashed with a slow, salted function. MD5 is too fast for that purpose, and plain text or reversible encryption exposes users when the data leaks.
