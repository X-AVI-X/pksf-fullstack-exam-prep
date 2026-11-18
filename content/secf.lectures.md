## The CIA triad
Information security rests on three properties. Confidentiality: only authorised parties can read the data. Integrity: the data cannot be changed without detection. Availability: authorised users can reach the system when they need it. Attacks map onto these: interception breaks confidentiality, falsification breaks integrity, and denial of service breaks availability.

@check
Q: An attacker changes a loan amount in transit without anyone noticing. Which property is attacked?
- Confidentiality
* Integrity
- Availability
- Non-repudiation only
E: Undetected change is an integrity failure. The attacker may not have read the data at all.

## Symmetric and asymmetric encryption
Symmetric encryption uses one shared key (AES) and is fast, suited to bulk data. Asymmetric encryption uses a public and a private key (RSA, elliptic curves). It solves key exchange and supports signatures, but it is much slower. In practice, TLS uses asymmetric cryptography to agree a key, then symmetric encryption for the data.

@check
Q: Why do systems usually combine asymmetric and symmetric encryption?
- Asymmetric encryption is faster for bulk data
* Asymmetric solves the key exchange, and symmetric encrypts the bulk data quickly
- Symmetric encryption cannot use keys
- Neither is ever used together
E: Asymmetric cryptography is slow but solves sharing a secret safely. Symmetric cryptography is fast for the data itself.

## Hashing and digital signatures
A hash function turns data into a fixed-size digest, and it is one-way. A good hash changes completely when the input changes by one bit. A digital signature hashes the message and encrypts the hash with the sender's private key. Anyone with the public key can verify it, which proves integrity and origin.

@check
Q: Which key does the sender use to create a digital signature?
- The receiver's public key
* The sender's private key
- The sender's public key
- A shared symmetric key
E: The signature is created with the sender's private key, and anyone can verify it with the matching public key.

## Authentication factors and common attacks
Authentication factors are something you know (password), something you have (OTP device) and something you are (biometric). Multi-factor authentication combines at least two. Common attacks include SQL injection, cross-site scripting, session hijacking and phishing. Each has a standard defence: parameterised queries, output encoding, secure cookies and TLS, and user awareness plus MFA.

@check
Q: Which combination is multi-factor authentication?
- Two passwords
* A password and a one-time code from a phone
- Two usernames
- A password and the same password saved twice
E: MFA needs factors from different categories. Two passwords are both something you know.

## Cross-site scripting in one example
Cross-site scripting injects script into a page that other users view. A comment field that stores <script>...</script> and renders it unescaped runs the script in every visitor's browser. The fix is to encode output for the context, let the template engine escape it by default, and add a Content Security Policy.

@check
Q: What is the most direct fix for a stored XSS bug in a comment field?
- Make the comment field longer
* Encode the output so the browser displays the text instead of running it
- Turn off JavaScript for the whole company
- Store comments in a text file
E: Output encoding turns the characters into harmless text in the browser. Length limits and file storage do not stop script execution.
