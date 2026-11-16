## Write a multi-stage Dockerfile for a Spring Boot app.
~~~dockerfile
# ---- build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

# ---- runtime stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd -r -u 1001 spring
COPY --from=build /src/target/*.jar app.jar
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
~~~
Points: dependency layer cached separately, JRE-only runtime, non-root user, container-aware memory flag.
## Write a docker-compose.yml for API + PostgreSQL + Redis.
~~~yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: pksf
      POSTGRES_USER: pksf
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pksf"]
      interval: 5s
  redis:
    image: redis:7
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/pksf
      SPRING_DATASOURCE_USERNAME: pksf
      SPRING_DATASOURCE_PASSWORD: secret
      SPRING_DATA_REDIS_HOST: redis
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
volumes:
  pgdata:
~~~
Services reach each other by service name (db, redis) on the compose network.
## Write a Kubernetes Deployment and Service for the API.
~~~yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: po-api
spec:
  replicas: 3
  selector:
    matchLabels: { app: po-api }
  template:
    metadata:
      labels: { app: po-api }
    spec:
      containers:
        - name: po-api
          image: registry.pksf.local/po-api:1.4.2
          ports: [{ containerPort: 8080 }]
          envFrom:
            - configMapRef: { name: po-api-config }
            - secretRef: { name: po-api-secrets }
          resources:
            requests: { cpu: 250m, memory: 512Mi }
            limits: { memory: 1Gi }
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8080 }
          livenessProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
---
apiVersion: v1
kind: Service
metadata:
  name: po-api
spec:
  selector: { app: po-api }
  ports: [{ port: 80, targetPort: 8080 }]
~~~
Expose externally with an Ingress (host/path routing, TLS).
## Describe a CI/CD pipeline for a full-stack app.
1. **Trigger** on push/merge request.
2. **Build**: mvn package / npm ci && npm run build.
3. **Test**: unit + integration (Testcontainers), frontend tests; publish JaCoCo coverage.
4. **Quality and security**: SonarQube, dependency scan, image scan (Trivy).
5. **Package**: build Docker image tagged with git SHA/version, push to registry.
6. **Deploy to staging**: kubectl/Helm/Argo CD; run DB migrations (Flyway); smoke tests.
7. **Approve and deploy to production**: rolling/blue-green; automatic rollback on failed health checks.
8. **Secrets** from the CI secret store, never in the repo.
~~~yaml
# .github/workflows/ci.yml (sketch)
name: ci
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: "17", cache: maven }
      - run: mvn -B verify
      - run: docker build -t po-api:latest .
~~~


## Write a GitHub Actions workflow that tests, builds and pushes a Docker image.
~~~yaml
name: ci
on: { push: { branches: [main] }, pull_request: {} }
jobs:
  build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '21', cache: maven }
      - run: mvn -B verify            # unit + integration tests, JaCoCo
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm, cache-dependency-path: web/package-lock.json }
      - run: cd web && npm ci && npm test -- --watch=false && npm run build
      - if: github.ref == 'refs/heads/main'
        uses: docker/login-action@v3
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }
      - if: github.ref == 'refs/heads/main'
        run: docker build -t ghcr.io/pksf/api:${{ github.sha }} . && docker push ghcr.io/pksf/api:${{ github.sha }}
~~~
- In GitLab CI the same stages (test → build → deploy) go in .gitlab-ci.yml; in Jenkins they go in a declarative Jenkinsfile.
