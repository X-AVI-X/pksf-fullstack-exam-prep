## What happens when you type a URL into the browser and press Enter?
1. Browser parses the URL; checks HSTS and caches.
2. **DNS** resolution (browser, OS, resolver, root, TLD, authoritative) gives an IP.
3. **TCP** handshake (SYN, SYN-ACK, ACK) to port 443, then **TLS** handshake (certificate verification, key exchange).
4. HTTP request sent; it may pass a CDN, load balancer, API gateway/NGINX to the app server.
5. Server runs the app (Spring Boot: filters, security, controller, service, DB) and returns a response.
6. Browser parses HTML, fetches CSS/JS, builds DOM and CSSOM, lays out and paints; JS (React) hydrates/renders.
+ 2 | DNS resolution | DNS
+ 2 | TCP and TLS handshakes | TCP, TLS
+ 2 | HTTP request through LB/gateway to the app and back | request
+ 2 | Server processing (filters, controller, DB) | controller
+ 2 | Browser rendering (DOM, CSSOM, layout, paint) | DOM

## Explain the OSI model and where HTTP, TCP, IP and Ethernet sit.
1. Physical: cables and signals
2. Data Link: Ethernet, MAC addresses, switches
3. Network: IP, routing, routers
4. Transport: TCP/UDP, ports
5. Session
6. Presentation: encoding, TLS (often placed here)
7. Application: HTTP, DNS, SMTP
- The TCP/IP model folds layers 5–7 into Application. A load balancer works at L4 (TCP) or L7 (HTTP paths, headers).
+ 2 | All seven layers in order | Physical, Application
+ 2 | Correct placement of HTTP, TCP, IP, Ethernet | Transport, Network
+ 1 | TCP/IP model mapping | TCP/IP
+ 1 | Practical example (L4 vs L7 load balancer) | L7

## Compare TCP and UDP.
@compare 6
| | TCP | UDP |
|---|---|---|
| Connection | connection-oriented: three-way handshake (SYN, SYN-ACK, ACK) | connectionless |
| Reliability | acknowledgements, retransmission, in-order delivery, no duplicates | best effort: packets may be lost, duplicated or reordered |
| Flow/congestion control | yes (sliding window, congestion window) | none |
| Unit | byte stream | datagrams (message boundaries kept) |
| Header | 20+ bytes | 8 bytes |
| Speed | slower, more overhead | faster, low latency |
| Uses | HTTP/1.1 and HTTP/2, HTTPS, database connections, SMTP, SSH | DNS queries, VoIP and video calls, live streaming, games, QUIC (HTTP/3) |

- Choose **TCP** when every byte must arrive (an API call, a loan transaction). Choose **UDP** when timeliness beats completeness, or the application adds its own reliability (QUIC).
+ 1.5 | Connection-oriented with handshake vs connectionless | handshake, connectionless
+ 2 | Reliability, ordering and flow/congestion control differences | reliab, order
+ 1 | Overhead and speed (header size) | header/overhead
+ 1.5 | Correct uses of each | DNS/stream, HTTP

## Explain HTTP: methods, status-code classes, statelessness, and what HTTP/2 improves over HTTP/1.1.
@concept 6
- **HTTP** is an application-layer request/response protocol: a request has a method, path, headers and optional body; a response has a status code, headers and body.
- **Methods:** GET (read; safe and idempotent), POST (create or action; not idempotent), PUT (replace; idempotent), PATCH (partial update), DELETE (idempotent), plus HEAD and OPTIONS (CORS preflight).
- **Status classes:** 1xx informational; 2xx success (200 OK, 201 Created, 204 No Content); 3xx redirection (301, 304 Not Modified); 4xx client error (400, 401, 403, 404, 409, 429); 5xx server error (500, 502, 503).
- **Stateless:** each request carries everything the server needs; state is kept with cookies and sessions or with tokens (JWT). This is what lets an API scale horizontally.
- **HTTP/2:** binary framing, **multiplexing** many requests over one TCP connection (no head-of-line blocking at the HTTP level), header compression (HPACK). **HTTP/3** runs over QUIC (UDP) to remove TCP head-of-line blocking too.
- **HTTPS** = HTTP over TLS (port 443).
+ 1.5 | Methods with safe/idempotent distinction | idempotent
+ 1.5 | Status classes with correct examples | 2xx/201, 4xx/404, 5xx/500
+ 1.5 | Statelessness and how state is carried (cookie, session, token) | stateless
+ 1.5 | HTTP/2 multiplexing/header compression (or HTTP/3 over QUIC) | multiplex

## For the network 192.168.10.0/26, give the subnet mask, the number of usable hosts, and the network, host range and broadcast address of each subnet.
@concept 5
- **/26** means 26 network bits, leaving 32 − 26 = **6 host bits**.
- **Mask:** 255.255.255.192 (the last octet is 11000000).
- **Addresses per subnet:** 2⁶ = 64; **usable hosts:** 64 − 2 = **62** (the network and broadcast addresses are reserved).
- Splitting a /24 into /26 gives 2² = **4 subnets**, in blocks of 64:

| Subnet | Network | Usable hosts | Broadcast |
|---|---|---|---|
| 1 | 192.168.10.0 | .1 – .62 | 192.168.10.63 |
| 2 | 192.168.10.64 | .65 – .126 | 192.168.10.127 |
| 3 | 192.168.10.128 | .129 – .190 | 192.168.10.191 |
| 4 | 192.168.10.192 | .193 – .254 | 192.168.10.255 |

- 192.168.0.0/16 is a **private** range (RFC 1918), reached from the internet through NAT.
+ 1 | Mask 255.255.255.192 | 255.255.255.192
+ 1.5 | 64 addresses, 62 usable, with the reason for minus 2 | 62
+ 1.5 | Network, host range and broadcast of the first subnet | .63
+ 1 | Four subnets with correct block boundaries (0, 64, 128, 192) | 64, 128, 192

## Explain DNS: how a name is resolved, and the common record types.
@concept 5
- **DNS** (Domain Name System) translates names such as {{pksf.org.bd}} into IP addresses. It is a distributed, hierarchical database, queried mostly over **UDP port 53** (TCP for large responses).
- **Resolution:** browser cache → OS cache and hosts file → the **recursive resolver** (ISP or 8.8.8.8). On a miss the resolver asks a **root** server (which points to the {{.bd}} TLD servers), then the **TLD** server (which points to the domain's authoritative servers), then the **authoritative** server, which returns the record. The answer is cached for its **TTL**.
- **Records:** **A** (name → IPv4), **AAAA** (IPv6), **CNAME** (alias to another name), **MX** (mail server), **NS** (authoritative name servers), **TXT** (SPF, domain verification), **PTR** (reverse lookup).
- In Kubernetes, a Service gets an internal DNS name ({{api.default.svc.cluster.local}}), which is how pods find each other.
+ 1.5 | Purpose: names to IP addresses, hierarchical and cached | IP
+ 2 | Resolution chain: resolver, root, TLD, authoritative; TTL caching | root, TLD, authoritative
+ 1.5 | At least four record types correctly described | A, CNAME, MX
