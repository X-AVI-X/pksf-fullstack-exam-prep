## Service models: IaaS, PaaS and SaaS
Cloud services are grouped by how much you manage. With IaaS (EC2, Azure VM, Compute Engine) you manage the operating system and up. With PaaS (Elastic Beanstalk, App Service, App Engine) you deploy code and the platform runs it. With SaaS you just use the finished product.

@check
Q: A team deploys its Spring Boot jar, and the provider manages the servers and runtime. Which model is this?
- IaaS
* PaaS
- SaaS
- On-premise
E: The team owns the application, and the provider runs the platform. That is PaaS.

## Scaling: vertical and horizontal
Vertical scaling adds more CPU or RAM to one machine. It is simple but has a ceiling and usually needs downtime. Horizontal scaling adds more machines behind a load balancer. It scales further, but only if the service is stateless: any node must handle any request.

@check
Q: Why do stateless services scale out more easily than stateful ones?
- Stateless services need no network
* Any node can handle any request, so new nodes can be added without moving session data
- Stateful services cannot run on a server
- Stateless services never fail
E: Without per-user state on one node, a load balancer can send requests anywhere. Stateful services need sticky routing or shared state.

## Load balancing and caching at the edge
A load balancer spreads requests across nodes. Common algorithms are round robin, least connections and IP hash, which keeps one client on one node. A CDN caches static assets at locations near users, which cuts latency and load on the origin.

@check
Q: Which algorithm sends each new request to the node with the fewest active connections?
- Round robin
- IP hash
* Least connections
- Random without health checks
E: Least connections balances by current load, which suits requests of uneven duration.

## Disaster recovery and the twelve-factor app
Two numbers define disaster recovery. RPO is the maximum data loss you accept, measured in time. RTO is the maximum downtime you accept. Backups, replicas and point-in-time recovery meet these targets. The twelve-factor method asks for configuration in environment variables, logs written to stdout, disposable processes and parity between development and production.

@check
Q: A system may lose at most 15 minutes of data after a failure. Which number is this?
- RTO of 15 minutes
* RPO of 15 minutes
- Latency of 15 milliseconds
- Throughput of 15 requests per second
E: Recovery point objective is the data-loss limit, so 15 minutes of loss means an RPO of 15 minutes. Recovery time objective is the downtime limit.
