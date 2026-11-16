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
+ 4 | Iterative three-pointer (prev, curr, next) reversal | prev, next
+ 1.5 | Handles empty and single-node lists | null
+ 1.5 | O(n) time, O(1) space | O(1)
+ 1 | Returns the new head | head

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
+ 4 | HashMap of value → index, check complement in one pass | HashMap, complement
+ 1.5 | Handles no solution / duplicates | duplicate/not found
+ 1.5 | O(n) time vs O(n²) brute force | O(n)
+ 1 | Clean code | return

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
+ 4 | Stack push on opener, pop and match on closer | stack/Deque
+ 2 | Returns false on mismatch or empty stack, checks empty at end | isEmpty
+ 1 | Ignores non-bracket characters | ignore
+ 1 | O(n) complexity | O(n)

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
+ 4 | Two pointers from both ends | two pointers/i < j
+ 2 | Skips non-alphanumerics and ignores case | isLetterOrDigit, toLowerCase
+ 1 | Handles empty string | empty
+ 1 | O(n) time, O(1) space | O(1)

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
+ 3 | FizzBuzz with the 15 case checked first | 15
+ 2.5 | Factorial (iterative, long/BigInteger overflow noted) | BigInteger/overflow
+ 2.5 | Prime check up to sqrt(n), handles n < 2 | sqrt

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
+ 4 | Correct lo/hi loop with mid and bounds update | mid
+ 1.5 | Overflow-safe mid | lo + (hi - lo)
+ 1.5 | O(log n) and requires sorted input | log n, sorted
+ 1 | Returns -1 when absent | -1

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
+ 3 | Anagram via 26-count array or sorting | count/sort
+ 1 | Length check early exit | length
+ 3 | Second largest in one pass with distinct handling | second
+ 1 | Complexities stated | O(n)
