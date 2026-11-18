## Containers and images
A container packages an application with its libraries and runs it in an isolated process. An image is the read-only template; a container is a running instance of it. A Dockerfile describes how to build the image, in layers. Order the Dockerfile so the rarely-changing steps come first, which keeps the cache useful.

@check
Q: In a Dockerfile, the dependency install step is placed after the copy of all source code. What is the cost?
- None, the build is always the same speed
* Any source change invalidates the cache and reinstalls every dependency
- The image cannot run
- The container loses its data
E: Docker caches each layer. Copying all source before installing dependencies makes every code change rebuild the install layer. Copy the dependency manifest first.

## Kubernetes: the core objects
A Pod is the smallest deployable unit and runs one or more containers. A Deployment manages replicas of pods and rolling updates. A Service gives a stable address to a set of pods. ConfigMaps and Secrets hold configuration. A Liveness probe restarts a stuck container; a Readiness probe removes a pod from traffic until it is ready.

@check
Q: A new pod starts but is not ready to serve. Which probe keeps traffic away from it until it is ready?
- Liveness probe
* Readiness probe
- Startup secret
- Horizontal pod autoscaler
E: A readiness probe controls whether the pod receives traffic from its Service. A liveness probe decides whether to restart it.

## CI/CD pipelines
Continuous integration builds and tests every change automatically. Continuous delivery keeps the software ready to deploy at any time, and continuous deployment releases each passing change. A typical pipeline runs: build, unit tests, static analysis and security scan, build the image, deploy to staging, run integration tests, then deploy to production with an approval gate.

@check
Q: Which stage should catch a broken unit test before code reaches staging?
- Production monitoring
* The CI build and test stage
- A user report
- The database backup
E: CI runs the tests on every change. Failing early stops the broken code from moving down the pipeline.

## Git: branches, merges and rebase
Git records snapshots as commits. A branch is a movable pointer to a commit. Merge joins two histories and keeps both sides. Rebase replays your commits on top of another branch, giving a straight history, but it rewrites commits, so do not rebase shared branches.

@check
Q: Which is the safe rule when using rebase?
- Rebase every branch, including shared ones, to keep history neat
* Do not rebase commits that others have already pulled from a shared branch
- Rebase only on Friday
- Rebase deletes the repository
E: Rebase creates new commit IDs for the rewritten commits. Others who built on the old ones get conflicts, so rewrite only private work.
