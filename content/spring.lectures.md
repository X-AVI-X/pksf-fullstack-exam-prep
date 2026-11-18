## Inversion of control and dependency injection
In plain Java you create the objects a class needs. In Spring, the container creates them and gives them to the classes that use them. This is inversion of control. Dependency injection is the mechanism: the class declares what it needs, usually through its constructor, and Spring supplies it.

Constructor injection is the preferred style. The dependency is final, the class is easy to test with a fake, and missing dependencies fail at startup rather than at run time.

@check
Q: Which is the preferred way for Spring to inject a service into a controller?
- Creating it with new inside the controller
- Making it a public static field
* Declaring it as a final field and receiving it through the constructor
- Reading it from a global variable
E: Constructor injection with final fields keeps the dependency explicit, immutable and easy to test with a substitute.

## Beans and component scanning
A bean is an object the Spring container manages. You mark classes with @Component, @Service, @Repository or @Controller, and component scanning finds them under the main application's package. @Configuration classes with @Bean methods declare beans by hand, which is useful for third-party classes you do not own.

By default a bean is a singleton: one instance per container. Keep singleton beans stateless, because one instance serves every request.

@check
Q: Why should a singleton service bean avoid storing per-user data in its fields?
- Singletons cannot have fields
* One instance serves all requests, so data in a field would be shared between users
- Fields are not allowed in Spring
- Singletons are always recreated per request
E: A singleton is shared across threads and requests. Per-user data in a field leaks between users, so keep such state in method parameters or a store.

## Auto-configuration and properties
Spring Boot inspects the classpath and configures sensible defaults, such as an embedded server or a DataSource when a database driver is present. Override defaults through application.yml or environment variables, and bind groups of settings with @ConfigurationProperties.

Keep secrets out of the repository: read them from environment variables or a secret store.

@check
Q: Where should a database password go in a production Spring Boot app?
- Hard-coded in a Java class
- Committed in application.yml
* In an environment variable or secret store, read by the configuration
- In a comment in the README
E: Secrets in source control leak. Environment variables and secret stores keep them out of the code and let each environment differ.

## REST controllers and validation
@RestController returns objects as JSON. Map endpoints with @GetMapping, @PostMapping and so on, and bind request bodies with @RequestBody. Validate input with @Valid and constraint annotations such as @NotBlank and @Min, and return a 400 response with the details when validation fails.

@check
Q: Which annotation makes Spring check a request body against its constraint annotations?
- @Autowired
* @Valid
- @Transactional
- @Scheduled
E: @Valid triggers bean validation on the annotated parameter. A failure produces a client error, usually 400.

## Transactions, and the proxy trap
@Transactional wraps a method in a transaction: commit on success and rollback on a runtime exception. Spring applies it through a proxy, so a call from one method to another method in the same class bypasses the proxy and the transaction does not start. Call the transactional method through another bean instead.

@check
Q: A @Transactional method is called from another method in the same class and no rollback happens. What is the likely cause?
- The method is private, so it cannot have a transaction
* The call bypasses the Spring proxy because it is an internal call
- Transactions are not supported in Spring
- The database is read-only
E: Spring's transactional behaviour comes from a proxy around the bean. Internal calls skip the proxy, so the annotation has no effect for them.
