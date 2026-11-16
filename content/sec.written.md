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
## Explain OAuth2 roles and the Authorization Code + PKCE flow.
- **Resource owner**: the user. **Client**: the app (React SPA). **Authorization server**: Keycloak. **Resource server**: the Spring Boot API.
- Flow: client makes a random {{code_verifier}} and sends its SHA-256 {{code_challenge}} with the redirect to {{/authorize}}; user logs in; Keycloak redirects back with a one-time **code**; client exchanges code + code_verifier at {{/token}}; receives access, refresh and ID tokens.
- PKCE stops an attacker who intercepts the code from redeeming it.
## How would you integrate Keycloak SSO across several PKSF apps?
- One realm (e.g. {{pksf}}); a client per app: public clients for SPAs (PKCE), confidential clients for backends, service accounts for machine-to-machine.
- Realm roles (e.g. {{ADMIN}}, {{PO_USER}}) and client roles; groups per partner organisation; map roles into tokens.
- Spring Boot: {{spring-boot-starter-oauth2-resource-server}} with {{issuer-uri}}; a {{JwtAuthenticationConverter}} that reads {{realm_access.roles}} and adds the {{ROLE_}} prefix.
- React: keycloak-js or oidc-client-ts; Angular: angular-oauth2-oidc. Silent token refresh.
- Benefits: single login across apps, central password policy, MFA, LDAP/AD federation, central user deprovisioning.
## Design an RBAC data model.
~~~sql
users(id, username, password_hash, enabled, partner_org_id)
roles(id, name)                 -- ADMIN, PO_MANAGER, FIELD_OFFICER
permissions(id, code)           -- LOAN_READ, LOAN_APPROVE, REPORT_SUBMIT
user_roles(user_id, role_id)
role_permissions(role_id, permission_id)
~~~
Load permissions as authorities at login; protect endpoints with {{hasAuthority('LOAN_APPROVE')}}. Add **data-level** checks too (a PO user may only see their own PO's rows), e.g. filter queries by {{partner_org_id}} taken from the token, never from the request body.
## Hashing vs encryption vs encoding?
- **Encoding** (Base64, URL encoding): reversible format change, no key, no security.
- **Encryption** (AES, RSA): reversible with a key; protects confidentiality (data at rest, TLS in transit).
- **Hashing** (SHA-256; BCrypt/Argon2 for passwords): one-way, fixed length; used for integrity and password storage. Salt prevents rainbow-table attacks.
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


## Configure a Spring Boot API as an OAuth2 resource server validating Keycloak JWTs with role-based access.
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
