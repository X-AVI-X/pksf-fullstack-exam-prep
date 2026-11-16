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
