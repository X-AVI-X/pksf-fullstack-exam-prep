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
