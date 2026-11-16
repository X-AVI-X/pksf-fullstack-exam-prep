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
+ 3 | Build stage with JDK/Maven, runtime stage with JRE only | AS build, COPY --from
+ 2 | Dependency layer caching | dependency/go-offline
+ 2 | Non-root user and EXPOSE/ENTRYPOINT | USER, ENTRYPOINT
+ 1 | JVM container memory options | MaxRAMPercentage

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
+ 3 | Three services with correct images and ports | postgres, redis
+ 2 | Environment config wiring API to DB/Redis by service name | SPRING_DATASOURCE
+ 2 | Named volume for DB data and healthcheck/depends_on | volume, depends_on
+ 1 | Secrets not hard-coded (env file) | env

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
+ 2 | Deployment with replicas, selector, labels, image | Deployment, replicas
+ 2 | Resource requests/limits | resources
+ 2 | Readiness and liveness probes | readinessProbe
+ 1 | Config/Secret references | secretKeyRef/configMap
+ 1 | Service selecting the pods | Service

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
+ 1.5 | Trigger, build and test stages | test
+ 1.5 | Quality/security scans | scan/Sonar
+ 1.5 | Docker image tagged by SHA pushed to registry | image, registry
+ 1.5 | Staged deploy with migrations, smoke tests, rollback | rollback
+ 2 | Secrets handling and approvals | secret

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
+ 2 | Triggers on push/PR | on:
+ 2 | Backend and frontend test/build steps with caching | setup-java, npm
+ 2 | Docker login/build/push only on main | docker
+ 1 | Secrets from GitHub secrets | secrets
+ 1 | Equivalent in GitLab CI/Jenkins | gitlab

## After a new release, the API pods are in CrashLoopBackOff. How do you troubleshoot?
@scenario 8
1. {{kubectl get pods}} shows the status and restart count. {{kubectl describe pod <p>}} shows events: OOMKilled, failed probes, image pull errors, missing ConfigMap or Secret.
2. {{kubectl logs <p> --previous}} gives the **crashed** container's logs: the Spring Boot startup exception (bad DB URL or password, missing env var, Flyway migration failure, port conflict).
3. Check what changed: the image tag, {{kubectl rollout history}}, config and Secret diffs.
4. Common causes and fixes:
   - **OOMKilled:** raise memory limits or set {{-XX:MaxRAMPercentage}}.
   - **Liveness probe kills a slow-starting JVM:** add a startupProbe or a longer initialDelay.
   - **Bad config:** fix the Secret or ConfigMap.
   - **DB unreachable:** check NetworkPolicy or credentials.
5. Mitigate first with {{kubectl rollout undo deployment/api}}, then fix forward.
6. Prevent recurrence: readiness gates, staging smoke tests in CI, config validation at startup, alerts on restart counts.
+ 2 | describe and events to find the reason (OOMKilled, probe, image) | describe
+ 2 | logs --previous for the crashed container | --previous/logs
+ 2 | Correct root causes and fixes (memory, probes, config, DB) | OOM/probe
+ 1 | Rollback to restore service | rollout undo/rollback
+ 1 | Prevention | alert/smoke


## Users suddenly get 401 on every API call though login at Keycloak succeeds. Troubleshoot.
@scenario 8
1. Reproduce and read the API logs. Spring Security's resource server logs why the JWT was rejected: signature, {{iss}}, {{aud}} or expiry.
2. Decode the token (jwt.io offline or base64) and compare its {{iss}} with {{spring.security.oauth2.resourceserver.jwt.issuer-uri}}. A Keycloak hostname or realm change, or http vs https behind a proxy, alters the issuer.
3. **Key rotation:** a new signing key that isn't in the cached JWKS. Make sure the service fetches JWKS from the issuer (it refreshes on an unknown kid).
4. **Clock skew** between servers makes tokens look expired or not yet valid; sync with NTP.
5. **Audience/client mapping changed**, or the gateway strips the Authorization header.
6. Fix the configuration, add an integration test with a real Keycloak (Testcontainers), and alert on spikes in the 401 rate.
+ 2 | Uses logs and decodes the token | decode/log
+ 2 | Checks issuer/audience mismatch | iss/issuer
+ 2 | Considers key rotation/JWKS and clock skew | JWKS/kid, clock
+ 1 | Considers gateway/header issues | header
+ 1 | Fix and prevention (tests, alerts) | test/alert


## Users double-click "Submit repayment" and two repayments get recorded. How do you prevent duplicates end to end?
@scenario 8
- **UI:** disable the button while the request is pending and show progress. This helps UX but is never enough on its own.
- **API idempotency:** the client sends an {{Idempotency-Key}} header (a UUID per form submission). The server stores key → response (Redis with TTL, or a table) and returns the stored response on a retry.
- **DB:** a unique constraint on a natural key ({{repayment.txn_ref}}), which catches races between concurrent requests. Map the violation to 409 Conflict.
- **Concurrency:** use optimistic locking ({{@Version}}) on the loan balance so two updates can't both apply.
- **Messaging:** consumers dedupe by event id.
- **Test:** fire concurrent requests in an integration test.
+ 1 | Client-side disable (noted as insufficient alone) | disable
+ 3 | Idempotency key stored server-side | idempotency
+ 2 | Unique constraint as final guard, mapped to 409 | unique, 409
+ 1 | Optimistic locking or concurrency handling | @Version/optimistic
+ 1 | Tested under concurrency | concurrent


## Docker image vs container?
@short 2
An **image** is a read-only, layered template (app + JRE + config) built from a Dockerfile and stored in a registry. A **container** is a running, isolated instance of an image with its own writable layer; many containers can run from one image.
+ 1 | Image = immutable template/layers | template/layer
+ 1 | Container = running instance | instance/running


## What is a Kubernetes Pod?
@short 2
The smallest deployable unit in Kubernetes: one or more containers that **share a network namespace (one IP) and volumes**, scheduled together on a node. Pods are ephemeral, so you manage them through Deployments and reach them through Services.
+ 1 | Smallest unit, one or more containers | smallest
+ 1 | Shared network/IP and managed by Deployment/Service | IP/Deployment


## Write a declarative Jenkinsfile that tests, builds and deploys the Spring Boot API.
@code 8
~~~groovy
pipeline {
  agent any
  environment { IMAGE = "registry.pksf.local/api:${env.GIT_COMMIT.take(7)}" }
  stages {
    stage('Test')  { steps { sh 'mvn -B verify' } }                // unit + integration, JaCoCo
    stage('Build image') { steps { sh 'docker build -t $IMAGE .' } }
    stage('Push') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'registry', usernameVariable: 'U', passwordVariable: 'P')]) {
          sh 'echo $P | docker login registry.pksf.local -u $U --password-stdin && docker push $IMAGE'
        }
      }
    }
    stage('Deploy to staging') {
      when { branch 'main' }
      steps { sh 'kubectl -n staging set image deployment/api api=$IMAGE && kubectl -n staging rollout status deployment/api' }
    }
  }
  post {
    always  { junit 'target/surefire-reports/*.xml' }
    failure { echo 'Notify the team (mail/Slack step here)' }
  }
}
~~~
+ 2 | Declarative structure: pipeline, agent, stages, steps | pipeline, stages
+ 2 | Test then build/push image tagged by commit | mvn, docker
+ 2 | Credentials via withCredentials (no secrets in file) | withCredentials
+ 1 | Branch condition and deploy with rollout check | when, rollout
+ 1 | post block: test reports and failure notification | post
