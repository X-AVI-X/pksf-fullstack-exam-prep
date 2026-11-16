- OSI: Physical, Data link, Network, Transport, Session, Presentation, Application.
- Ports: 20/21 FTP, 22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS.

- TCP: connection-oriented, reliable, ordered, 3-way handshake. UDP: connectionless, fast (DNS, streaming).
- HTTP methods: GET, POST, PUT, PATCH, DELETE. Idempotent: GET, PUT, DELETE. Status classes: 2xx ok, 3xx redirect, 4xx client error, 5xx server error.
- 401 unauthenticated vs 403 forbidden; 404; 409 conflict; 500; 502/503/504 at the gateway.
- Devices: hub L1, switch L2 (MAC), router L3 (IP). ARP, DHCP, NAT, DNS.
- Subnet: /24 → 254 hosts, /26 → 62; private ranges 10/8, 172.16/12, 192.168/16.
