## Authentication and authorisation
Authentication answers "who are you?" and is checked by a password, a token or a certificate. Authorisation answers "what may you do?" and is checked against roles or permissions after authentication. A failed authentication returns 401; a failed authorisation returns 403.

Spring Security applies both. A filter chain authenticates the request, and rules such as @PreAuthorize or URL matchers decide access.

@check
Q: A logged-in user requests an endpoint restricted to the ADMIN role and is refused. Which status code and concept apply?
- 401, because the user is not logged in
* 403, because the user is known but lacks the role
- 500, because the server failed
- 200, because the user is logged in
E: The identity is established, so this is an authorisation failure. 403 Forbidden is the correct response.

## OAuth2, OpenID Connect and SSO
OAuth2 is a delegation framework: it lets an application get limited access to a user's resources through an access token. OpenID Connect adds an ID token that proves who the user is, so it is the layer used for login. Single sign-on means one login through an identity provider, such as Keycloak, serves several applications.

The common flow for a web app is the authorisation code flow with PKCE. The user is redirected to the identity provider, returns with a code, and the app exchanges the code for tokens on the server.

@check
Q: Which component proves who the user is in an OpenID Connect login?
- The access token only
* The ID token
- The refresh token
- The client secret
E: The ID token is the OpenID Connect artefact that identifies the user. The access token authorises API calls, and the refresh token obtains new tokens.

## JWT: structure and the things it does not do
A JSON Web Token has three parts separated by dots: a header, a payload with claims such as subject, roles and expiry, and a signature. The signature lets the server check that the token has not been changed. It does not hide the payload; anyone can read it, so do not put secrets in it.

Keep access tokens short-lived, and check the signature, issuer, audience and expiry on every request.

@check
Q: Which statement about a JWT payload is correct?
- It is encrypted, so nobody can read it
* It is signed, not encrypted, so anyone can read it but cannot change it undetected
- It never expires
- It must be stored in a database
E: A standard JWT is signed (JWS) to show integrity. The payload is only base64-encoded, so secrets must not be placed in it.

## Securing an API: the OWASP essentials
The OWASP Top 10 lists the common risks. For an API, the most important controls are: check authorisation on every endpoint, not only in the user interface; validate and encode input; use parameterised queries; enforce HTTPS with HSTS; rate-limit login attempts; and never log secrets.

Broken access control, where an endpoint returns another user's data when given a different ID, is one of the most common real failures.

@check
Q: A user changes an order ID in the URL and sees another customer's order. Which risk is this?
- SQL injection
- Cross-site scripting
* Broken access control, an insecure direct object reference
- Denial of service
E: The server did not check that the requested order belongs to the logged-in user. Checking ownership on every request fixes it.
