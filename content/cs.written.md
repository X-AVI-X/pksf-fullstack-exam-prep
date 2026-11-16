## Reverse a singly linked list (Java).
~~~java
ListNode reverse(ListNode head) {
  ListNode prev = null, cur = head;
  while (cur != null) {
    ListNode next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}
~~~
O(n) time, O(1) space.
## Two Sum: return indices of two numbers adding to target.
~~~java
int[] twoSum(int[] nums, int target) {
  Map<Integer, Integer> seen = new HashMap<>();
  for (int i = 0; i < nums.length; i++) {
    Integer j = seen.get(target - nums[i]);
    if (j != null) return new int[]{j, i};
    seen.put(nums[i], i);
  }
  return new int[0];
}
~~~
O(n) time with a hash map instead of O(n²) nested loops.
## Check whether brackets in a string are balanced.
~~~java
boolean balanced(String s) {
  Deque<Character> st = new ArrayDeque<>();
  for (char c : s.toCharArray()) {
    if (c == '(' || c == '[' || c == '{') st.push(c);
    else if (c == ')' || c == ']' || c == '}') {
      if (st.isEmpty()) return false;
      char o = st.pop();
      if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
    }
  }
  return st.isEmpty();
}
~~~
## Check if a string is a palindrome (ignore case and non-alphanumerics).
~~~java
boolean isPalindrome(String s) {
  int i = 0, j = s.length() - 1;
  while (i < j) {
    while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
    while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
    if (Character.toLowerCase(s.charAt(i++)) != Character.toLowerCase(s.charAt(j--))) return false;
  }
  return true;
}
~~~
## FizzBuzz, factorial and prime check (quick warm-ups often asked).
~~~java
for (int i = 1; i <= 100; i++)
  System.out.println(i % 15 == 0 ? "FizzBuzz" : i % 3 == 0 ? "Fizz" : i % 5 == 0 ? "Buzz" : String.valueOf(i));

long factorial(int n) { return n <= 1 ? 1 : n * factorial(n - 1); }

boolean isPrime(int n) {
  if (n < 2) return false;
  for (int i = 2; (long) i * i <= n; i++) if (n % i == 0) return false;
  return true;
}
~~~
## What happens when you type a URL into the browser and press Enter?
1. Browser parses the URL; checks HSTS and caches.
2. **DNS** resolution (browser, OS, resolver, root, TLD, authoritative) gives an IP.
3. **TCP** handshake (SYN, SYN-ACK, ACK) to port 443, then **TLS** handshake (certificate verification, key exchange).
4. HTTP request sent; it may pass a CDN, load balancer, API gateway/NGINX to the app server.
5. Server runs the app (Spring Boot: filters, security, controller, service, DB) and returns a response.
6. Browser parses HTML, fetches CSS/JS, builds DOM and CSSOM, lays out and paints; JS (React) hydrates/renders.


## Binary search (iterative) and its complexity.
~~~java
int binarySearch(int[] a, int key) {
  int lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;      // avoids int overflow
    if (a[mid] == key) return mid;
    if (a[mid] < key) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}
~~~
- O(log n) time, O(1) space. The array must be sorted.

## Check whether two strings are anagrams; find the second-largest number in an array.
~~~java
boolean anagram(String a, String b) {
  if (a.length() != b.length()) return false;
  int[] c = new int[26];
  for (int i = 0; i < a.length(); i++) { c[a.charAt(i) - 'a']++; c[b.charAt(i) - 'a']--; }
  for (int x : c) if (x != 0) return false;
  return true;                          // O(n), lowercase a-z assumed
}
int secondLargest(int[] a) {
  int first = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
  for (int x : a) {
    if (x > first) { second = first; first = x; }
    else if (x > second && x != first) second = x;
  }
  return second;                        // one pass, O(n)
}
~~~

## Explain deadlock and how to prevent it in a Java/DB application.
- **Deadlock:** two or more threads or transactions each hold a resource the other needs, so none can proceed.
- **Four conditions** (all must hold): mutual exclusion, hold and wait, no preemption, circular wait.
- **Prevention in Java:** acquire locks in a global fixed order, use {{tryLock(timeout)}}, keep critical sections small, prefer java.util.concurrent structures.
- **In the DB:** update rows in a consistent order (for example by id), keep transactions short, use appropriate isolation, and retry on deadlock errors (PostgreSQL 40P01).

## Explain the OSI model and where HTTP, TCP, IP and Ethernet sit.
1. Physical: cables and signals
2. Data Link: Ethernet, MAC addresses, switches
3. Network: IP, routing, routers
4. Transport: TCP/UDP, ports
5. Session
6. Presentation: encoding, TLS (often placed here)
7. Application: HTTP, DNS, SMTP
- The TCP/IP model folds layers 5–7 into Application. A load balancer works at L4 (TCP) or L7 (HTTP paths, headers).
