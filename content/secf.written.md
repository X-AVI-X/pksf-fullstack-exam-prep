## Compare hashing, encryption and encoding with examples.
@compare 6
| | Hashing | Encryption | Encoding |
|---|---|---|---|
| Reversible? | no (one-way) | yes, with the key | yes, no key needed |
| Purpose | integrity, password storage | confidentiality | data format/transport |
| Examples | SHA-256, BCrypt, Argon2 | AES-256-GCM, RSA | Base64, URL encoding, UTF-8 |
| Key | none (a salt for passwords) | symmetric or key pair | none |

- Passwords → **BCrypt** (salted, slow). Sensitive PO data at rest → **AES**. Binary in JSON → **Base64**. Base64 is not security.
+ 2 | Correct reversibility for each | one-way/irreversible
+ 2 | Correct purpose of each | integrity, confidentiality
+ 1 | Correct examples for each | SHA/BCrypt, AES, Base64
+ 1 | Notes that encoding is not security, or the password-hashing choice | salt/not secure


## How does HTTPS (TLS) protect data between a PO user's browser and the PKSF server?
@concept 6
1. The client connects and the server sends its **certificate** (its public key, signed by a CA).
2. The browser **verifies** the certificate chain against trusted CAs and the domain name, which authenticates the server.
3. Client and server run an **(EC)DHE key exchange** (TLS 1.3) to derive a shared **session key**; this gives forward secrecy.
4. All data is then encrypted with **symmetric** AES-GCM or ChaCha20, which gives confidentiality plus integrity.
- This protects against eavesdropping and man-in-the-middle tampering. Add {{HSTS}}, disable TLS < 1.2, and renew certificates automatically.
+ 1.5 | Certificate and CA verification authenticates the server | certificate, CA
+ 1.5 | Key exchange producing a session key | key exchange/session key
+ 1.5 | Symmetric encryption of data afterwards | symmetric/AES
+ 1.5 | What it protects against (MITM, eavesdropping), plus hardening | man-in-the-middle/MITM/HSTS

## Compare symmetric and asymmetric encryption, and explain how a digital signature works.
@compare 6
| | Symmetric | Asymmetric |
|---|---|---|
| Keys | one shared secret key encrypts and decrypts | a key pair: the public key encrypts, the private key decrypts |
| Speed | fast; suited to bulk data | slow (roughly a thousand times slower); small data only |
| Problem | distributing the key securely | none for distribution, but it is slow, and public keys must be authenticated (certificates) |
| Algorithms | AES-256-GCM, ChaCha20 | RSA, ECC (ECDSA, ECDH) |
| Uses | database and disk encryption, the data phase of TLS | key exchange, digital signatures, certificates, JWT RS256 |

- **Hybrid in practice (TLS):** asymmetric cryptography authenticates the server and agrees a session key; symmetric AES then encrypts the data.
- **Digital signature:** the sender hashes the message (SHA-256) and encrypts the hash with their **private key**. The receiver recomputes the hash and checks it against the signature using the sender's **public key**. A match proves **integrity** (not altered), **authenticity** (who sent it) and **non-repudiation**. It does not hide the message.
- Example: Keycloak signs a JWT with its private key (RS256), and the Spring Boot API verifies it with the public key from the JWKS endpoint.
+ 1.5 | One shared key vs public/private key pair | shared, public, private
+ 1 | Speed difference and the key-distribution problem | fast/slow/distribut
+ 1 | Correct algorithms and uses for each | AES, RSA
+ 2 | Signature: hash signed with the private key, verified with the public key | private key, hash
+ 0.5 | Signature gives integrity/authenticity/non-repudiation, not confidentiality | integrity/non-repudiation

## Compare XSS and CSRF: how each attack works and how to prevent it.
@compare 6
| | XSS (cross-site scripting) | CSRF (cross-site request forgery) |
|---|---|---|
| What happens | the attacker's **script runs in the victim's browser** inside your site | another site makes the victim's browser send an **unwanted request** to your site |
| Exploits | the user's trust in the site: user input is rendered without encoding | the site's trust in the browser: cookies are attached automatically |
| Attacker gains | can read the page, steal tokens, act as the user | can trigger a state change (transfer, password change) but cannot read the response |
| Types | stored, reflected, DOM-based | forged form post, image or link |

**Prevent XSS:** context-aware output encoding (React and Angular escape by default; avoid {{dangerouslySetInnerHTML}} and {{innerHTML}}), sanitise rich text (DOMPurify), a Content-Security-Policy header, HttpOnly cookies so scripts cannot read them, and input validation.

**Prevent CSRF:** anti-CSRF tokens (synchronizer token; Spring Security enables this by default for session logins), {{SameSite=Lax/Strict}} cookies, checking the Origin header, and re-authentication for sensitive actions. An API that authenticates only with a bearer token in the Authorization header is not exposed to CSRF, because the browser does not attach that header automatically.

- XSS defeats CSRF defences (the injected script can read the CSRF token), so fix XSS first.
+ 1.5 | XSS: injected script runs in the victim's browser | script
+ 1.5 | CSRF: forged request riding on automatically sent cookies | cookie, request
+ 1.5 | XSS prevention: output encoding, CSP, sanitising | encod/escap, CSP
+ 1.5 | CSRF prevention: CSRF token, SameSite cookies | token, SameSite

## Explain the CIA triad with one threat and one control for each part.
@concept 5
- **Confidentiality:** only authorised people can read the data. *Threat:* a stolen database dump, eavesdropping. *Controls:* TLS, encryption at rest (AES), access control (RBAC, least privilege), MFA.
- **Integrity:** data is accurate and is changed only by authorised actions. *Threat:* a tampered loan amount, SQL injection. *Controls:* hashing and digital signatures, database constraints and transactions, input validation, audit logs.
- **Availability:** the system and data are there when users need them. *Threat:* DDoS, a ransomware attack, a failed disk. *Controls:* redundancy and load balancing, tested backups, rate limiting, monitoring and failover.

- The three pull against each other (more controls can reduce availability), so the balance follows the data's sensitivity. Related principles: **authentication** (who you are), **authorisation** (what you may do), **accountability/non-repudiation** (audit trail), defence in depth.
+ 1.5 | Confidentiality with a threat and a control | confidentiality, encrypt/access
+ 1.5 | Integrity with a threat and a control | integrity, hash/signature/audit
+ 1.5 | Availability with a threat and a control | availability, backup/redundan
+ 0.5 | Trade-offs or related principles (AAA, defence in depth) | authenticat/defence in depth/trade

## What is the difference between authentication and authorisation?
@short 2
**Authentication** verifies **who you are** (password, OTP/MFA, certificate, a Keycloak login); failure gives HTTP **401**. **Authorisation** decides **what you may do** once identified (roles and permissions, for example only a PKSF_OFFICER may approve a report); failure gives HTTP **403**. Authentication always comes first.
+ 1 | Authentication = identity; authorisation = permissions | who, what/permission
+ 1 | An example or the 401 vs 403 mapping | 401/403/role
