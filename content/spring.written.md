## How does Spring Boot auto-configuration work?
- {{@EnableAutoConfiguration}} loads candidate configuration classes listed in {{META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports}} (spring.factories in Boot 2).
- Each class is guarded by conditions: {{@ConditionalOnClass}} (library on classpath), {{@ConditionalOnMissingBean}} (you haven't defined your own), {{@ConditionalOnProperty}}.
- Example: H2 or PostgreSQL driver on the classpath plus {{spring.datasource.url}} = a HikariCP DataSource is created for you.
- Your own beans win because of @ConditionalOnMissingBean. Debug with {{--debug}} or the {{/actuator/conditions}} endpoint.
+ 1.5 | @EnableAutoConfiguration loads candidate configurations (AutoConfiguration.imports) | EnableAutoConfiguration, imports
+ 2 | @Conditional guards: OnClass, OnMissingBean, OnProperty | ConditionalOn
+ 1 | Concrete example (DataSource from driver + properties) | DataSource/datasource
+ 1 | Own beans win; debug with --debug / conditions report | debug

## Design a layered CRUD REST API in Spring Boot (show code).
@code 10
~~~java
@Entity
public class PartnerOrg {
  @Id @GeneratedValue(strategy = GenerationType.SEQUENCE) Long id;
  @Column(nullable = false, unique = true) String code;
  String name;
}

public record PartnerOrgDto(Long id, @NotBlank String code, @NotBlank String name) {}

public interface PartnerOrgRepository extends JpaRepository<PartnerOrg, Long> {
  boolean existsByCode(String code);
}

@Service @RequiredArgsConstructor
public class PartnerOrgService {
  private final PartnerOrgRepository repo;
  @Transactional
  public PartnerOrgDto create(PartnerOrgDto dto) {
    if (repo.existsByCode(dto.code())) throw new DuplicateException("code exists");
    PartnerOrg po = new PartnerOrg(); po.code = dto.code(); po.name = dto.name();
    po = repo.save(po);
    return new PartnerOrgDto(po.id, po.code, po.name);
  }
  @Transactional(readOnly = true)
  public Page<PartnerOrgDto> list(Pageable p) {
    return repo.findAll(p).map(x -> new PartnerOrgDto(x.id, x.code, x.name));
  }
}

@RestController @RequestMapping("/api/v1/partner-orgs") @RequiredArgsConstructor
public class PartnerOrgController {
  private final PartnerOrgService service;
  @PostMapping
  public ResponseEntity<PartnerOrgDto> create(@Valid @RequestBody PartnerOrgDto dto) {
    PartnerOrgDto saved = service.create(dto);
    return ResponseEntity.created(URI.create("/api/v1/partner-orgs/" + saved.id())).body(saved);
  }
  @GetMapping
  public Page<PartnerOrgDto> list(Pageable pageable) { return service.list(pageable); }
}

@RestControllerAdvice
class ApiErrors {
  @ExceptionHandler(DuplicateException.class)
  ProblemDetail dup(DuplicateException e) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
  }
}
~~~
Points to mention: DTOs instead of exposing entities, validation, 201 + Location header, pagination, central error handling, transactions in the service layer, versioned URL.
+ 2 | Entity + repository (JpaRepository) | JpaRepository
+ 2 | Service layer with business logic and @Transactional | @Service, @Transactional
+ 2 | Controller with correct verbs and status codes (201, 204, 404) | @RestController, 201
+ 2 | DTOs with Bean Validation (@Valid) | DTO, @Valid
+ 2 | Global error handling (@RestControllerAdvice) and pagination | ControllerAdvice/Pageable

## How does @Transactional work and what are its pitfalls?
- Spring wraps the bean in a proxy (JDK dynamic or CGLIB). The proxy opens a transaction through the PlatformTransactionManager, calls the method, then commits or rolls back.
- Pitfalls: self-invocation bypasses the proxy; it only applies to public methods (Spring 6 also supports protected/package-private with CGLIB, but stay public); checked exceptions don't roll back by default; catching an exception inside the method hides it from the proxy; long transactions holding DB locks; calling a remote API inside a transaction.
- Use {{readOnly = true}} for queries (Hibernate skips dirty checking), {{REQUIRES_NEW}} for audit logs that must persist even when the main transaction fails.
+ 2 | Proxy opens/commits/rolls back around the method | proxy
+ 2 | Pitfalls: self-invocation, public only, checked exceptions commit | self-invocation, checked
+ 2 | readOnly, propagation (REQUIRES_NEW) and isolation options | readOnly, REQUIRES_NEW

## Describe the Spring bean lifecycle.
1. Instantiate (constructor) and inject dependencies.
2. Aware callbacks ({{BeanNameAware}}, {{ApplicationContextAware}}).
3. {{BeanPostProcessor.postProcessBeforeInitialization}}.
4. Init: {{@PostConstruct}}, then {{InitializingBean.afterPropertiesSet()}}, then custom init-method.
5. {{postProcessAfterInitialization}} (proxies for @Transactional/@Async are created here).
6. Bean in use.
7. On shutdown: {{@PreDestroy}}, {{DisposableBean.destroy()}}, custom destroy-method. (Prototype beans are not destroyed by the container.)
+ 1.5 | Instantiate and inject dependencies | inject
+ 1.5 | Aware callbacks and BeanPostProcessor before/after init | BeanPostProcessor
+ 1.5 | Init: @PostConstruct / afterPropertiesSet / init-method | PostConstruct
+ 1.5 | Destroy: @PreDestroy / DisposableBean; proxies made after init | PreDestroy

## Explain how you'd use Spring Batch to process a bulk CSV upload of loan records.
- **Job** made of **Steps**. A chunk-oriented step: {{ItemReader}} (FlatFileItemReader for CSV) to {{ItemProcessor}} (validate, map, enrich) to {{ItemWriter}} (JdbcBatchItemWriter / JpaItemWriter).
- {{chunk(500)}}: reads and processes 500 items, then writes and commits them in one transaction.
- {{JobRepository}} stores execution metadata (status, read/write/skip counts), so a failed job can **restart** from the last committed chunk.
- Fault tolerance: {{.faultTolerant().skip(ValidationException.class).skipLimit(100).retry(DeadlockLoserDataAccessException.class)}}; write skipped rows to an error report.
- Trigger asynchronously: the upload API saves the file, launches the job with a TaskExecutor-backed JobLauncher, returns 202 Accepted + a job id; the UI polls status.
- Scale with partitioning (split the file by ranges) or multi-threaded steps.
+ 1.5 | Job/Step with reader, processor, writer | ItemReader, ItemWriter/writer
+ 1.5 | Chunk commit interval and why | chunk
+ 1 | JobRepository enables restart | JobRepository/restart
+ 1 | Skip/retry fault tolerance for bad rows | skip
+ 1 | Async launch, status polling, and scaling via partitioning | async/partition

## Find the error: rows are not rolled back when one record in the import fails.
@bug 6
~~~java
@Service
public class ImportService {
  public void importAll(List<Row> rows) {
    for (Row r : rows) saveOne(r);
  }
  @Transactional
  public void saveOne(Row r) { repo.save(map(r)); audit.save(log(r)); }
}
~~~
**Bug:** **self-invocation.** {{@Transactional}} works through a Spring **proxy**. {{importAll}} calls {{this.saveOne()}} directly, which bypasses the proxy, so no transaction starts. Each save auto-commits on its own, and a failure in {{audit.save}} leaves the row saved without its audit record.

**Fixes:**
- Put {{@Transactional}} on the public entry method ({{importAll}}) if the whole import should be all or nothing, or
- move {{saveOne}} to another bean (for example {{RowWriter}}) and call it through the injected proxy, for per-row transactions with {{REQUIRES_NEW}}, or
- use {{TransactionTemplate}} programmatically.

Also note that by default it rolls back only on RuntimeException, and that private methods are never proxied.
+ 2 | Identifies self-invocation bypassing the proxy | self-invocation/proxy
+ 1.5 | Explains the consequence (no transaction, partial commit) | partial/auto-commit
+ 2 | Correct fix: annotate caller, separate bean, or TransactionTemplate | separate bean/TransactionTemplate
+ 0.5 | Mentions rollback rules or private-method limitation | RuntimeException/private


## What does @SpringBootApplication combine?
@short 2
{{@SpringBootConfiguration}} (a @Configuration class), {{@EnableAutoConfiguration}} (configures beans from the classpath and properties) and {{@ComponentScan}} (scans the package and its sub-packages).
+ 1 | Names all three annotations | EnableAutoConfiguration, ComponentScan
+ 1 | States what auto-configuration/scanning does | classpath/package
