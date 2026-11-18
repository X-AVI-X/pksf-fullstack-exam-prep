## How "write a program" questions are asked
"Write a program in any structured language" appears in nearly every paper. The tasks are classic and short. Answer in Java, which is the ToR language and gives you OOP credit too. Seen in papers:
- **ICB AMCL AP 2024:** check whether a number is prime; binary search that returns the index or −1.
- **Bangladesh Bank AP 2023:** LCM of two integers. **2016:** Fibonacci series.
- **Combined Bank SO-IT 2025:** sum of the even numbers from 1 to n. **SO-IT 2022:** recursive palindrome check.
- **6 Banks AP 2021:** balanced-parentheses check.
- **ICB AP 2026:** shift every letter forward by one (z becomes a).

The answer structure that earns full marks:
1. The method signature first, with input and return types.
2. Clean, compilable code. Examiners do check braces and semicolons.
3. Edge cases in the code: n < 2, an empty array, negative numbers, overflow.
4. A main with one or two sample calls and their output as comments.
5. One line of complexity.

@check
Q: Which method signature is the strongest start for a binary search in Java?
- void search()
* static int binarySearch(int[] a, int key)
- int binarySearch(String s)
- boolean key(int[] a)
E: The signature states the inputs, the sorted array and the key, and the return type, an index, with -1 for not found. Examiners expect this before any code.

## The classic programs, and the idea behind each
| Task | Core idea | Complexity |
|---|---|---|
| Prime | try divisors 2 to √n, skip evens | O(√n) |
| GCD / LCM | Euclid: gcd(a,b) = gcd(b, a % b); lcm = a / gcd * b | O(log min(a,b)) |
| Fibonacci | iterative, keeping the last two values | O(n) time, O(1) space |
| Binary search | mid = lo + (hi − lo) / 2; loop while lo ≤ hi | O(log n) |
| Palindrome | two indices moving inwards | O(n) |
| Balanced brackets | push openers onto a stack; pop and match on a closer | O(n) |
| Shift letters | 'a' + (c − 'a' + 1) % 26 | O(n) |

Why √n for primes: a factor above √n pairs with one below it, so divisors up to √n are enough.

@check
Q: To test whether n is prime, why is it enough to check divisors only up to √n?
- Because even numbers are the only ones that have divisors
* Because any factor above √n pairs with a factor below √n, so one of each pair is found by then
- Because the loop must stop at 100
- Because n is always odd
E: Factors come in pairs whose product is n. If a pair has one factor above √n, the other is below √n, so checking up to √n finds every factor pair.

## Traps
- **(lo + hi) / 2** can overflow for very large arrays. Use lo + (hi − lo) / 2.
- **Testing primes up to n − 1** is correct but O(n). Say √n and justify it.
- **Recursive Fibonacci without memoisation** is exponential. Mention it if you write the recursive form.
- **LCM as a * b / gcd** can overflow. Divide first: a / gcd * b.
- **Second largest when every value is equal:** there is no second distinct value, so say what you return or throw.

@check
Q: Why is lo + (hi - lo) / 2 preferred to (lo + hi) / 2 for the midpoint in binary search?
- It is faster on every CPU
* It avoids integer overflow when lo + hi is larger than the int range
- It returns a different midpoint
- It is required by Java syntax
E: For very large indices, lo + hi can exceed the largest int value and overflow. Writing lo + (hi − lo) / 2 gives the same midpoint without the risk.

## Writing the answer in full
Take the balanced-parentheses task as a model. Declare the signature, use a stack (Deque in Java), push each opener, and on each closer check that the stack is non-empty and the top matches. At the end the stack must be empty. Write one test with a balanced and one with an unbalanced string, and say the complexity is O(n).

@check
Q: For balanced parentheses such as "([)]", what does the algorithm need to detect the error?
- Only a count of each bracket type
* A stack, so the most recent opener must match the next closer
- Sorting the characters first
- Recursion without a base case
E: "([)]" has equal counts of each bracket, so counting fails. The stack shows that ')' does not match the most recent opener '[', so the string is unbalanced.
