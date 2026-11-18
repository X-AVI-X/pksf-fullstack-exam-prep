### How it is asked
"Write a program in any structured language" appears in nearly every paper. The tasks are classic and short. Answer in **Java**, which is the ToR language and gives you OOP credit too. Seen in papers:

- **ICB AMCL AP 2024:** check whether a number is prime; binary search that returns the index or −1.
- **Bangladesh Bank AP 2023:** LCM of two integers. **2016:** Fibonacci series.
- **Combined Bank SO-IT 2025:** sum of the even numbers from 1 to n. **SO-IT 2022:** recursive palindrome check.
- **6 Banks AP 2021:** balanced-parentheses check.
- **ICB AP 2026:** shift every letter forward by one (z → a, Z → A).

### The answer structure that earns full marks
1. **Method signature first**, with the input and return types: {{static int binarySearch(int[] a, int key)}}.
2. **Clean, compilable code.** Examiners do check braces and semicolons.
3. **Edge cases in the code:** n < 2, an empty array, negative numbers, a null string, overflow.
4. **A {{main}} with one or two sample calls and their output** written as comments.
5. **One line of complexity:** time and space, such as {{O(√n)}} or {{O(log n)}}.

### Know these by heart
| Task | Core idea | Complexity |
|---|---|---|
| Prime | try divisors 2..√n, skip evens | O(√n) |
| GCD / LCM | Euclid {{gcd(a,b) = gcd(b, a % b)}}; {{lcm = a / gcd * b}} | O(log min(a,b)) |
| Fibonacci | iterative, keeping the last two values | O(n), O(1) space |
| Binary search | {{mid = lo + (hi - lo) / 2}}; loop while {{lo <= hi}} | O(log n) |
| Palindrome | two indices moving inwards, or recursion on (i+1, j−1) | O(n) |
| Balanced brackets | push openers onto a {{Deque}}; pop and match on a closer | O(n) |
| Shift letters | {{'a' + (c - 'a' + 1) % 26}} | O(n) |
| Second largest | one pass tracking the first and second distinct values | O(n) |
| Sum of evens to n | loop, or the formula k(k+1) with k = n/2 | O(1) |

### Traps
- **{{(lo + hi) / 2}}** can overflow for very large arrays. Use {{lo + (hi - lo) / 2}}.
- **Testing primes up to n − 1** is correct but O(n). Say √n and justify: a factor above √n pairs with one below it.
- **Recursive Fibonacci without memoisation** is O(2ⁿ). Mention it if you write the recursive form.
- **LCM as {{a * b / gcd}}** can overflow. Divide first.
- **Second largest when every value is equal:** there is no second distinct value, so say what you return or throw.
