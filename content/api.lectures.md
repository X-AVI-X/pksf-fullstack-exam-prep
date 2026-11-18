## HTTP semantics: methods, status codes and idempotency
REST uses HTTP as it was designed. GET reads, POST creates, PUT replaces, PATCH changes part of a resource, and DELETE removes. GET, PUT and DELETE are idempotent: repeating them gives the same result. POST is not, so retrying a POST can create a duplicate.

Status codes carry meaning: 200 for success, 201 when something was created, 400 for a bad request, 401 for unauthenticated, 403 for forbidden, 404 for not found, 409 for a conflict and 500 for a server error.

@check
Q: A client retries a POST after a timeout and the server creates two orders. Why?
- POST is idempotent by design
* POST is not idempotent, so each request creates a new resource unless an idempotency key is used
- The server cannot store orders
- Timeouts cause GET requests
E: POST is not idempotent. Retrying it repeats the action. An idempotency key or a PUT to a known ID avoids the duplicate.

## SOAP versus REST
SOAP is a protocol with a formal XML message envelope, a WSDL contract and built-in standards such as WS-Security. REST is an architectural style that uses URLs and HTTP verbs and usually exchanges JSON. SOAP suits strict enterprise contracts; REST suits lightweight web and mobile APIs.

@check
Q: Which is the most accurate difference between SOAP and REST?
- SOAP uses HTTP and REST does not
* SOAP is a protocol with an XML envelope and a WSDL contract; REST is a style that usually uses JSON over HTTP
- REST cannot be secured
- SOAP cannot carry files
E: SOAP defines its own XML message format and contract. REST relies on HTTP methods and resource URLs, usually with JSON.

## Microservices and their communication
A microservice owns one business capability and its data. Services talk over HTTP for requests that need an answer right away, and over a message broker such as Kafka or RabbitMQ for events that can be handled later. A service should never reach into another service's database.

@check
Q: Order service must tell the billing and shipping services that an order was placed, and they can process it later. What fits best?
- A synchronous call that waits for both replies
* Publish an event to a message broker that both services consume
- Writing into the billing database directly
- Sharing one database between all services
E: An event on a broker decouples the services in time and ownership. Direct database access breaks service boundaries.

## Resilience: timeouts, retries and circuit breakers
Every remote call needs a timeout. Retries with exponential backoff and jitter help with transient failures, but only for idempotent operations. A circuit breaker stops calling a failing service for a while, so failures do not pile up and spread.

@check
Q: A downstream service is failing, and every request waits 30 seconds before timing out. What pattern limits the damage?
- Infinite retries
* A circuit breaker with a short timeout, which fails fast when the service is down
- Removing all timeouts
- Sending more requests in parallel
E: A circuit breaker opens after repeated failures and returns quickly, which protects the caller's threads and the failing service.
