### How it is asked
Every recent paper has one security question. The ToR asks for "robust API security, encryption mechanisms and RBAC", so this pattern is squarely in scope. Seen in papers:

- **Bangladesh Bank AP 2023:** a man-in-the-middle attack on Diffie-Hellman where the attacker generates two key pairs; how confidentiality, integrity and availability relate to falsification, interception, masquerade and denial of service.
- **ICB AMCL AP 2024:** write the RSA algorithm; types of information security against cyber threats.
- **SPCBL 2022:** what SQL injection is and how to prevent it; what XSS is and how to fix it.
- **Combined Bank SO-IT 2022:** session hijacking and SQL injection: problems and solutions.
- **ICB AP 2026:** a zero-day attack during a patch window on a financial system. What may happen?

### The answer structure for "attack" questions
1. **What it is** in one line.
2. **How it works:** a 3-step attack flow, ideally with the malicious input written out ({{' OR '1'='1}}, {{<script>…}}).
3. **Impact** in the PKSF setting: stolen member data, altered loan amounts, a regulator incident.
4. **Prevention, in layers:** code (parameterised queries, output encoding), framework (Spring Security, React escaping), infrastructure (WAF, TLS) and process (code review, scanning).

### The answer structure for "algorithm" questions (RSA, Diffie-Hellman)
Write the steps numbered, then **work a small example with real numbers**, and finish with what makes it secure. Examiners award most of the marks for the worked example.

| | RSA (p = 5, q = 11) | Diffie-Hellman (p = 23, g = 5) |
|---|---|---|
| Setup | n = 55, φ = 40, e = 3, d = 27 | Alice a = 6 → A = 8; Bob b = 15 → B = 19 |
| Result | m = 9 → c = 9³ mod 55 = **14** → 14²⁷ mod 55 = **9** | shared key = 19⁶ mod 23 = 8¹⁵ mod 23 = **2** |
| Security rests on | factoring n is hard | discrete logarithm is hard |
| Weakness | small e without padding; use OAEP | **no authentication**, so man-in-the-middle is possible |

### Traps
- **Hashing is not encryption.** Passwords are **hashed** with bcrypt or Argon2, never encrypted, and never with plain MD5 or SHA.
- **Escaping input instead of parameterising it** is not the primary SQL injection fix.
- **Diffie-Hellman exchanges a key; it does not encrypt.** The fix for man-in-the-middle is **authentication** (certificates or signatures), as TLS does.
- **The CIA triad** is Confidentiality, Integrity, Availability, not the agency.
