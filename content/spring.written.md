## How does Spring Boot auto-configuration work?
- {{@EnableAutoConfiguration}} loads candidate configuration classes listed in {{META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports}} (spring.factories in Boot 2).
- Each class is guarded by conditions: {{@ConditionalOnClass}} (library on classpath), {{@ConditionalOnMissingBean}} (you haven't defined your own), {{@ConditionalOnProperty}}.
- Example: H2 or PostgreSQL driver on the classpath plus {{spring.datasource.url}} = a HikariCP DataSource is created for you.
- Your own beans win because of @ConditionalOnMissingBean. Debug with {{--debug}} or the {{/actuator/conditions}} endpoint.
## Design a layered CRUD REST API in Spring Boot (show code).
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
## How does @Transactional work and what are its pitfalls?
- Spring wraps the bean in a proxy (JDK dynamic or CGLIB). The proxy opens a transaction through the PlatformTransactionManager, calls the method, then commits or rolls back.
- Pitfalls: self-invocation bypasses the proxy; it only applies to public methods (Spring 6 also supports protected/package-private with CGLIB, but stay public); checked exceptions don't roll back by default; catching an exception inside the method hides it from the proxy; long transactions holding DB locks; calling a remote API inside a transaction.
- Use {{readOnly = true}} for queries (Hibernate skips dirty checking), {{REQUIRES_NEW}} for audit logs that must persist even when the main transaction fails.
## Describe the Spring bean lifecycle.
1. Instantiate (constructor) and inject dependencies.
2. Aware callbacks ({{BeanNameAware}}, {{ApplicationContextAware}}).
3. {{BeanPostProcessor.postProcessBeforeInitialization}}.
4. Init: {{@PostConstruct}}, then {{InitializingBean.afterPropertiesSet()}}, then custom init-method.
5. {{postProcessAfterInitialization}} (proxies for @Transactional/@Async are created here).
6. Bean in use.
7. On shutdown: {{@PreDestroy}}, {{DisposableBean.destroy()}}, custom destroy-method. (Prototype beans are not destroyed by the container.)
## Explain how you'd use Spring Batch to process a bulk CSV upload of loan records.
- **Job** made of **Steps**. A chunk-oriented step: {{ItemReader}} (FlatFileItemReader for CSV) to {{ItemProcessor}} (validate, map, enrich) to {{ItemWriter}} (JdbcBatchItemWriter / JpaItemWriter).
- {{chunk(500)}}: reads and processes 500 items, then writes and commits them in one transaction.
- {{JobRepository}} stores execution metadata (status, read/write/skip counts), so a failed job can **restart** from the last committed chunk.
- Fault tolerance: {{.faultTolerant().skip(ValidationException.class).skipLimit(100).retry(DeadlockLoserDataAccessException.class)}}; write skipped rows to an error report.
- Trigger asynchronously: the upload API saves the file, launches the job with a TaskExecutor-backed JobLauncher, returns 202 Accepted + a job id; the UI polls status.
- Scale with partitioning (split the file by ranges) or multi-threaded steps.
