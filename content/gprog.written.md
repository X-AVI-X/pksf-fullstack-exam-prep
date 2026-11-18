## Write a Java program that checks whether a number is prime and prints all primes from 1 to 30. State the time complexity.
@code 10 verified
~~~java
public class Primes {
    static boolean isPrime(int n) {
        if (n < 2) return false;            // 0, 1 and negatives are not prime
        if (n % 2 == 0) return n == 2;      // 2 is the only even prime
        for (int i = 3; (long) i * i <= n; i += 2)   // odd divisors up to √n; long avoids overflow
            if (n % i == 0) return false;
        return true;
    }

    public static void main(String[] args) {
        for (int i = 1; i <= 30; i++)
            if (isPrime(i)) System.out.print(i + " ");
        // 2 3 5 7 11 13 17 19 23 29
    }
}
~~~
Run on Java 21. It prints {{2 3 5 7 11 13 17 19 23 29}} and also reports {{2147483647}} (the largest int) as prime.

**Why √n:** if n = a × b with a ≤ b, then a ≤ √n, so if there is no divisor up to √n there is none at all. **Time O(√n), space O(1).** To list all primes up to a large N, the Sieve of Eratosthenes is O(N log log N).
+ 4 | Correct isPrime logic | prime
+ 2 | Edge cases: n < 2, 2, even numbers | n < 2
+ 2 | Loops only to √n, without overflow | sqrt/√, i * i
+ 1 | main prints the primes 1..30 with correct output | 29
+ 1 | States O(√n) and justifies it | o(√n)/o(sqrt

## Write a Java program to find the GCD and LCM of two integers. Explain the Euclidean algorithm and how you avoid overflow.
@code 10 verified
~~~java
public class GcdLcm {
    static long gcd(long a, long b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b != 0) {            // gcd(a, b) = gcd(b, a mod b)
            long t = a % b;
            a = b;
            b = t;
        }
        return a;
    }

    static long lcm(long a, long b) {
        if (a == 0 || b == 0) return 0;
        return Math.abs(a / gcd(a, b) * b);   // divide first: smaller intermediate value
    }

    public static void main(String[] args) {
        System.out.println(gcd(12, 18) + " " + lcm(12, 18));   // 6 36
        System.out.println(lcm(-4, 6) + " " + lcm(0, 5));      // 12 0
    }
}
~~~
Run on Java 21: {{6 36}}, then {{12 0}}.

**Euclid:** a common divisor of a and b also divides {{a mod b}}, so {{gcd(a, b) = gcd(b, a mod b)}}. Repeat until the remainder is 0; the last non-zero value is the GCD. Trace: gcd(12, 18) → gcd(18, 12) → gcd(12, 6) → gcd(6, 0) = **6**. Time **O(log min(a, b))**.

**LCM = |a × b| / gcd.** Computing {{a / gcd * b}} keeps the intermediate value small, so it overflows later than {{a * b / gcd}}.
+ 3 | Correct iterative or recursive Euclid GCD | gcd, %
+ 3 | LCM via gcd | lcm
+ 2 | Overflow avoided (divide first) and edge cases (0, negatives) | overflow, 0
+ 2 | Explains Euclid with a trace and complexity | euclid, log

## Write a Java program that prints the first n Fibonacci numbers. Compare the iterative solution with a naive recursive one.
@code 10 verified
~~~java
import java.util.Arrays;

public class Fibonacci {
    static long[] fibonacci(int n) {
        long[] f = new long[Math.max(n, 0)];
        for (int i = 0; i < n; i++)
            f[i] = i < 2 ? i : f[i - 1] + f[i - 2];
        return f;
    }

    // naive recursion: each call makes two more
    static long fibRec(int n) { return n < 2 ? n : fibRec(n - 1) + fibRec(n - 2); }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(fibonacci(10)));
        // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
    }
}
~~~
Run on Java 21: {{[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]}}.

| | Iterative | Naive recursive | Recursive + memo |
|---|---|---|---|
| Time | O(n) | **O(2ⁿ)** (recomputes the same values) | O(n) |
| Space | O(n) array, or O(1) keeping two variables | O(n) call stack | O(n) |
| Risk | — | very slow by n ≈ 45; deep recursion | — |

{{long}} overflows after F(92). For larger n, use {{BigInteger}}.
+ 4 | Correct iterative Fibonacci that prints n terms | fibonacci
+ 2 | Handles n = 0 and 1 | n < 2
+ 3 | Complexity comparison: O(n) vs O(2^n), memoisation | o(n), 2^n/2ⁿ, memo
+ 1 | Mentions overflow and BigInteger | overflow/biginteger

## Write a binary search in Java that returns the index of a key in a sorted int array, or -1 if it is absent. What are its preconditions and complexity?
@code 10 verified
~~~java
public class Search {
    static int binarySearch(int[] a, int key) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;       // avoids (lo + hi) overflow
            if (a[mid] == key) return mid;
            if (a[mid] < key) lo = mid + 1;     // search the right half
            else hi = mid - 1;                  // search the left half
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {3, 8, 15, 23, 42, 57};
        System.out.println(binarySearch(a, 23) + " " + binarySearch(a, 3) + " " + binarySearch(a, 5)); // 3 0 -1
        System.out.println(binarySearch(new int[0], 1));                                              // -1
    }
}
~~~
Run on Java 21: {{3 0 -1}}, then {{-1}}.

- **Preconditions:** the array must be **sorted** and allow random access (an array, not a linked list).
- **Complexity:** each step halves the range, so **O(log n)** time and O(1) space. A million elements need at most 20 comparisons.
- **Common bugs:** {{lo < hi}} misses a one-element range; {{lo = mid}} can loop forever; {{(lo + hi) / 2}} overflows above about 2³⁰ elements.
+ 4 | Correct loop: lo <= hi, mid, halve the range | lo <= hi, mid
+ 2 | Returns -1 when absent, including for an empty array | -1
+ 1 | Overflow-safe midpoint | lo + (hi - lo)
+ 2 | States preconditions (sorted, random access) | sorted
+ 1 | O(log n) time, O(1) space | log n

## Write a recursive Java method that checks whether a string is a palindrome, ignoring case, spaces and punctuation, so that "A man, a plan, a canal: Panama" is a palindrome.
@code 10 verified
~~~java
public class Palindrome {
    static boolean isPalindrome(String s) {
        if (s == null) return false;
        String t = s.toLowerCase().replaceAll("[^a-z0-9]", "");   // keep letters and digits
        return check(t, 0, t.length() - 1);
    }

    private static boolean check(String t, int i, int j) {
        if (i >= j) return true;                                   // base case: 0 or 1 chars left
        return t.charAt(i) == t.charAt(j) && check(t, i + 1, j - 1);
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("Madam") + " "
            + isPalindrome("A man, a plan, a canal: Panama") + " "
            + isPalindrome("PKSF"));                               // true true false
    }
}
~~~
Run on Java 21: {{true true false}}.

- **Base case:** {{i >= j}} (empty or one character). **Recursive step:** the outer characters match and the inner substring is a palindrome.
- Passing indices instead of {{substring()}} avoids creating n new strings.
- **Time O(n). Space O(n)** for the call stack. The iterative two-pointer version uses O(1) space and is safer for very long strings.
+ 3 | Correct recursion with base case | base case, recurs
+ 2 | Normalises case and removes non-alphanumerics | tolowercase, replaceall
+ 2 | Uses indices (no repeated substring) and handles null/empty | index/indices
+ 2 | Demonstrates with the sample strings and correct results | panama
+ 1 | Complexity and the iterative alternative | o(n)

## Write a Java method that checks whether the brackets (), [] and {} in a string are balanced. Trace it on "{[()()]}" and "([)]".
@code 10 verified
~~~java
import java.util.ArrayDeque;
import java.util.Deque;

public class Brackets {
    static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '(', '[', '{' -> stack.push(c);
                case ')', ']', '}' -> {
                    if (stack.isEmpty()) return false;               // closer with no opener
                    char open = stack.pop();
                    if ((c == ')' && open != '(') || (c == ']' && open != '[') || (c == '}' && open != '{'))
                        return false;                                // wrong type
                }
                default -> { }                                       // ignore other characters
            }
        }
        return stack.isEmpty();                                      // leftover openers mean unbalanced
    }

    public static void main(String[] args) {
        System.out.println(isBalanced("{[()()]}") + " " + isBalanced("([)]") + " "
            + isBalanced("((") + " " + isBalanced(")("));            // true false false false
    }
}
~~~
Run on Java 21: {{true false false false}}.

**Trace "([)]":** push {{(}}, push {{[}}, then {{)}} pops {{[}}, which is the wrong type, so it returns **false**. For {{"{[()()]}"}}, every closer pops its matching opener and the stack ends empty, so it returns **true**.

A stack fits because the **last** bracket opened must be the **first** closed (LIFO). Use {{ArrayDeque}}, not the legacy synchronized {{Stack}} class. Time and space O(n).
+ 4 | Stack push on openers, pop and match on closers | push, pop
+ 2 | Handles a closer on an empty stack and leftover openers | isempty
+ 2 | Correct traces for both strings | ([)]
+ 1 | Explains why a stack (LIFO) | lifo
+ 1 | O(n) time and space; ArrayDeque | o(n), arraydeque

## Write a Java method that shifts every letter of a string one place forward in the alphabet, wrapping z to a and Z to A, and leaving other characters unchanged.
@code 10 verified
~~~java
public class Shift {
    static String shiftLetters(String s) {
        StringBuilder sb = new StringBuilder(s.length());
        for (char c : s.toCharArray()) {
            if (c >= 'a' && c <= 'z')      sb.append((char) ('a' + (c - 'a' + 1) % 26));
            else if (c >= 'A' && c <= 'Z') sb.append((char) ('A' + (c - 'A' + 1) % 26));
            else                           sb.append(c);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(shiftLetters("Hello, Zebra xyz!"));   // Ifmmp, Afcsb yza!
    }
}
~~~
Run on Java 21: {{Ifmmp, Afcsb yza!}}.

- **Wrap-around:** {{(c - 'a' + 1) % 26}} maps z (25) to 0, which is 'a'.
- **The cast:** {{'a' + int}} is an {{int}}, so it must be cast back to {{char}}. Without the cast, {{append}} adds the number.
- **Efficiency:** {{StringBuilder}} avoids creating a new {{String}} each time round the loop. Time O(n).
- **Generalising:** to shift by k (a Caesar cipher), use {{(c - 'a' + k) % 26}}. This is not encryption, only an encoding.
+ 4 | Correct shift for lowercase and uppercase | 'a', 'a'
+ 2 | Wrap-around with % 26 | % 26
+ 2 | Non-letters unchanged; char cast | cast/(char)
+ 1 | StringBuilder | stringbuilder
+ 1 | Sample output correct | ifmmp

## Write a Java method that finds the second-largest distinct value in an int array in one pass. Handle duplicates, negative numbers and arrays without a second distinct value.
@code 10 verified
~~~java
public class SecondLargest {
    static int secondLargest(int[] a) {
        if (a == null || a.length < 2) throw new IllegalArgumentException("need at least 2 elements");
        Integer first = null, second = null;
        for (int x : a) {
            if (first == null || x > first) { second = first; first = x; }
            else if (x != first && (second == null || x > second)) second = x;
        }
        if (second == null) throw new IllegalArgumentException("no second distinct value");
        return second;
    }

    public static void main(String[] args) {
        System.out.println(secondLargest(new int[]{10, 40, 40, 25, 7}));   // 25
        System.out.println(secondLargest(new int[]{-5, -1, -3}));          // -3
        System.out.println(secondLargest(new int[]{3, 9}));                // 3
    }
}
~~~
Run on Java 21: {{25}}, {{-3}}, {{3}}. {{\{4, 4\}}} throws "no second distinct value".

- **One pass, O(n) time, O(1) space.** Sorting first is O(n log n) and still needs the duplicates skipped.
- **Duplicates:** the second 40 is ignored because {{x != first}}.
- **Negatives:** using {{null}} as "not set yet", instead of initialising to 0, makes all-negative arrays work. ({{Integer.MIN_VALUE}} works too, but breaks if MIN_VALUE is a real element.)
+ 4 | Correct single-pass update of first and second | first, second
+ 2 | Skips duplicates of the maximum | duplicate/!=
+ 2 | Works for negatives; no 0 initialisation | negative
+ 1 | Defined behaviour when there is no second distinct value | throw/exception
+ 1 | O(n) vs sorting O(n log n) | o(n)
