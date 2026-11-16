## Explain the JWT authentication flow in a Spring Boot + React app.
1. User submits credentials (or is redirected to Keycloak for SSO).
2. The auth server validates them and issues a short-lived **access token** (JWT, signed RS256) and a **refresh token**.
3. React keeps the access token in memory (not localStorage, to limit XSS theft); refresh token in an HttpOnly, Secure, SameSite cookie.
4. Each API call sends {{Authorization: Bearer <token>}}.
5. Spring Security's {{BearerTokenAuthenticationFilter}} validates signature (public key from JWKS), {{exp}}, {{iss}}, {{aud}}, then builds an Authentication with authorities from the roles claim.
6. {{@PreAuthorize}} / {{requestMatchers().hasRole()}} enforce RBAC.
7. On 401 the client calls the refresh endpoint, gets a new access token, retries.
8. Logout: revoke the refresh token / end the Keycloak session.
~~~java
@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
  return http
    .csrf(csrf -> csrf.disable())
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .authorizeHttpRequests(a -> a
        .requestMatchers("/actuator/health", "/api/public/**").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/v1/loans/**").hasRole("LOAN_OFFICER")
        .anyRequest().authenticated())
    .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
    .build();
}
~~~
+ 1.5 | Login at auth server/Keycloak issues access (+ refresh) token | access token, refresh
+ 1.5 | Client sends Bearer header; token kept in memory not localStorage | Bearer
+ 1.5 | Server validates signature (JWKS), exp, iss; builds authorities | signature, exp
+ 1.5 | RBAC enforcement and refresh/logout handling | hasRole/PreAuthorize, refresh

## Explain OAuth2 roles and the Authorization Code + PKCE flow.
- **Resource owner**: the user. **Client**: the app (React SPA). **Authorization server**: Keycloak. **Resource server**: the Spring Boot API.
- Flow: client makes a random {{code_verifier}} and sends its SHA-256 {{code_challenge}} with the redirect to {{/authorize}}; user logs in; Keycloak redirects back with a one-time **code**; client exchanges code + code_verifier at {{/token}}; receives access, refresh and ID tokens.
- PKCE stops an attacker who intercepts the code from redeeming it.
+ 2 | Four roles: resource owner, client, authorization server, resource server | resource server, authorization server
+ 2.5 | Code flow: redirect, code, exchange with code_verifier for tokens | code_verifier, code_challenge
+ 1.5 | Why PKCE: stops intercepted-code replay for public clients | intercept

## How would you integrate Keycloak SSO across several PKSF apps?
@arch 8
- One realm (e.g. {{pksf}}); a client per app: public clients for SPAs (PKCE), confidential clients for backends, service accounts for machine-to-machine.
- Realm roles (e.g. {{ADMIN}}, {{PO_USER}}) and client roles; groups per partner organisation; map roles into tokens.
- Spring Boot: {{spring-boot-starter-oauth2-resource-server}} with {{issuer-uri}}; a {{JwtAuthenticationConverter}} that reads {{realm_access.roles}} and adds the {{ROLE_}} prefix.
- React: keycloak-js or oidc-client-ts; Angular: angular-oauth2-oidc. Silent token refresh.
- Benefits: single login across apps, central password policy, MFA, LDAP/AD federation, central user deprovisioning.
+ 2 | Realm and one client per app (public PKCE for SPAs, confidential for services) | realm, client
+ 2 | Realm/client roles and groups for RBAC | role, group
+ 2 | Spring resource server issuer-uri; SPA OIDC library and silent refresh | issuer-uri
+ 2 | Benefits/ops: single login, MFA, federation, logout, theming | MFA/LDAP

## Design an RBAC data model.
~~~sql
users(id, username, password_hash, enabled, partner_org_id)
roles(id, name)                 -- ADMIN, PO_MANAGER, FIELD_OFFICER
permissions(id, code)           -- LOAN_READ, LOAN_APPROVE, REPORT_SUBMIT
user_roles(user_id, role_id)
role_permissions(role_id, permission_id)
~~~
Load permissions as authorities at login; protect endpoints with {{hasAuthority('LOAN_APPROVE')}}. Add **data-level** checks too (a PO user may only see their own PO's rows), e.g. filter queries by {{partner_org_id}} taken from the token, never from the request body.
+ 2.5 | users, roles, permissions tables | role, permission
+ 2.5 | Junction tables user_role and role_permission (M:N) | user_role, role_permission
+ 2 | Keys, unique constraints, indexes | unique/primary key
+ 1 | Data-level scope (e.g. PO id) and how the app checks it | po/scope

## Hashing vs encryption vs encoding?
- **Encoding** (Base64, URL encoding): reversible format change, no key, no security.
- **Encryption** (AES, RSA): reversible with a key; protects confidentiality (data at rest, TLS in transit).
- **Hashing** (SHA-256; BCrypt/Argon2 for passwords): one-way, fixed length; used for integrity and password storage. Salt prevents rainbow-table attacks.
+ 2 | Encoding: reversible format change, no key, no security | Base64
+ 2 | Encryption: reversible with key, confidentiality (AES/RSA) | AES
+ 2 | Hashing: one-way, integrity/passwords with salt (BCrypt) | BCrypt/one-way

## Name OWASP Top 10 risks and how you mitigate them in a Spring/React stack.
- **Broken access control**: deny by default, method security, object-level ownership checks.
- **Cryptographic failures**: TLS everywhere, BCrypt, encrypt sensitive columns, keys in a vault/K8s secrets.
- **Injection**: parameterised queries/JPA, validation.
- **Insecure design**: threat modelling, rate limits.
- **Security misconfiguration**: lock down Actuator, no default creds, security headers.
- **Vulnerable components**: dependency scanning (OWASP Dependency-Check, Dependabot, Trivy for images).
- **Identification and authentication failures**: Keycloak, MFA, short token lifetimes.
- **Software and data integrity failures**: signed artifacts, protected CI/CD.
- **Logging and monitoring failures**: audit logs to ELK, alerts.
- **SSRF**: allow-list outbound URLs.
+ 2 | Broken access control and its mitigation | access control
+ 2 | Injection and cryptographic failures with fixes | injection, TLS/BCrypt
+ 2 | Misconfiguration and vulnerable components | misconfiguration, dependency
+ 2 | Authentication failures and logging/monitoring | MFA/Keycloak, logging
+ 2 | Mitigations concrete to Spring/React (e.g. CSP, method security) | CSP/PreAuthorize

## Configure a Spring Boot API as an OAuth2 resource server validating Keycloak JWTs with role-based access.
@code 8
~~~java
@Configuration @EnableMethodSecurity
class SecurityConfig {
  @Bean SecurityFilterChain api(HttpSecurity http) throws Exception {
    return http
      .csrf(c -> c.disable())                       // stateless API using bearer tokens
      .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(a -> a
        .requestMatchers("/actuator/health", "/v3/api-docs/**").permitAll()
        .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
        .anyRequest().authenticated())
      .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(keycloakRoles())))
      .build();
  }
  Converter<Jwt, AbstractAuthenticationToken> keycloakRoles() {
    return jwt -> {
      Map<String, Object> realm = jwt.getClaim("realm_access");
      Collection<String> roles = realm == null ? List.of() : (Collection<String>) realm.get("roles");
      var auth = roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();
      return new JwtAuthenticationToken(jwt, auth);
    };
  }
}
~~~
~~~yaml
spring.security.oauth2.resourceserver.jwt.issuer-uri: https://sso.pksf.org.bd/realms/pksf
~~~
- The API fetches Keycloak's public keys (JWKS) from the issuer and verifies signature, expiry and issuer on every request.
+ 2 | SecurityFilterChain with oauth2ResourceServer().jwt() | oauth2ResourceServer
+ 2 | Stateless session, CSRF reasoning, public vs protected paths | STATELESS
+ 2 | Map Keycloak realm_access roles to ROLE_ authorities | realm_access, ROLE_
+ 1 | issuer-uri configuration | issuer-uri
+ 1 | Method security (@EnableMethodSecurity / hasRole) | hasRole

## Find the error: a search endpoint.
@bug 6
~~~java
String sql = "SELECT * FROM member WHERE name LIKE '%" + q + "%'";
return jdbcTemplate.queryForList(sql);
~~~
**Bug:** **SQL injection.** Input such as {{' OR '1'='1}} or {{'; DROP TABLE member; --}} becomes part of the SQL text. An attacker can read or alter any data.

**Fix:** use parameters, so input is sent as a value and never parsed as SQL:
~~~java
return jdbcTemplate.queryForList(
  "SELECT id, name, phone FROM member WHERE name ILIKE ?", "%" + q + "%");
// JPA: @Query("select m from Member m where lower(m.name) like lower(concat('%', :q, '%'))")
~~~
Also validate input length, select only the columns you need, use a least-privilege DB user, and paginate.
+ 2 | Identifies SQL injection with an example payload | injection
+ 1 | Explains how concatenation lets input change the query | concatenat
+ 2 | Parameterised query / prepared statement / JPA parameter fix | ?/parameter/prepared
+ 1 | Defence in depth: validation, least privilege, select columns | least privilege/validat


## What are the three parts of a JWT?
@short 2
{{header.payload.signature}}, each Base64URL-encoded: the header (alg such as RS256, kid), the payload (claims: sub, exp, iss, roles) and the signature over header + payload. It is **signed, not encrypted**: anyone can read the payload.
+ 1 | Names header, payload, signature | header, payload, signature
+ 1 | Notes signed not encrypted / claims | signed/claims


## What is CORS?
@short 2
Cross-Origin Resource Sharing: a browser mechanism where the **server** declares which other origins may call it ({{Access-Control-Allow-Origin}}), with a preflight OPTIONS request for non-simple calls. In Spring, configure allowed origins explicitly; never use "*" together with credentials.
+ 1 | Browser policy for cross-origin requests set by server headers | origin
+ 1 | Mentions preflight or Spring configuration / no wildcard with credentials | preflight/OPTIONS
