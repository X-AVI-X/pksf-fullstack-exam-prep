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

## Explain Big-O notation with an example of O(1), O(log n), O(n), O(n log n) and O(n²).
@concept 5
**Big-O** describes how running time (or memory) grows with input size n, keeping only the dominant term and dropping constants. It usually states the **worst case**.

| Complexity | Example |
|---|---|
| O(1) | array access by index; HashMap get (average) |
| O(log n) | binary search; lookup in a balanced tree or B-tree index |
| O(n) | linear search; one pass to find the maximum |
| O(n log n) | merge sort; {{Collections.sort}} (TimSort) |
| O(n²) | bubble sort; comparing every pair with nested loops |

- For n = 1,000,000: log n ≈ 20 steps, n log n ≈ 20 million, n² = 10¹² (too slow).
- Space complexity uses the same notation: merge sort needs O(n) extra space, an in-place sort O(1).
+ 1.5 | Defines Big-O as growth rate with input size, dominant term, worst case | growth, worst
+ 2.5 | Correct example for each of the five classes | binary search, merge sort/nested
+ 1 | Mentions space complexity or compares sizes for a large n | space

## Compare bubble sort, merge sort and quicksort.
@compare 6
| | Bubble sort | Merge sort | Quicksort |
|---|---|---|---|
| Idea | swap adjacent out-of-order pairs repeatedly | split in half, sort each half, merge | pick a pivot, partition smaller/larger, recurse |
| Best | O(n) with an early-exit flag | O(n log n) | O(n log n) |
| Average | O(n²) | O(n log n) | O(n log n) |
| Worst | O(n²) | O(n log n) | O(n²) with bad pivots (already sorted input, first-element pivot) |
| Extra space | O(1) | O(n) | O(log n) recursion stack |
| Stable | yes | yes | no |

- Use **merge sort** when stability or a guaranteed O(n log n) matters, and for linked lists and external sorting. **Quicksort** is usually fastest in memory (good cache behaviour); a random or median-of-three pivot avoids the worst case. Bubble sort is for teaching only.
- In Java, {{Arrays.sort}} uses dual-pivot quicksort for primitives and TimSort (a stable merge sort variant) for objects.
+ 1.5 | Correct idea of each algorithm | pivot, merge
+ 2 | Correct average and worst-case time for all three | n log n, n²
+ 1 | Space: O(1), O(n), O(log n) | space
+ 1 | Stability of each | stable
+ 0.5 | When to use which, or what Java uses | TimSort/when

## Write merge sort in Java and state its complexity.
@code 8 verified
~~~java
static void mergeSort(int[] a) {
  if (a == null || a.length < 2) return;
  mergeSort(a, new int[a.length], 0, a.length - 1);
}
static void mergeSort(int[] a, int[] tmp, int lo, int hi) {
  if (lo >= hi) return;                       // 0 or 1 element: already sorted
  int mid = lo + (hi - lo) / 2;
  mergeSort(a, tmp, lo, mid);
  mergeSort(a, tmp, mid + 1, hi);
  int i = lo, j = mid + 1, k = lo;            // merge the two sorted halves
  while (i <= mid && j <= hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];   // <= keeps it stable
  while (i <= mid) tmp[k++] = a[i++];
  while (j <= hi) tmp[k++] = a[j++];
  for (k = lo; k <= hi; k++) a[k] = tmp[k];
}
// {5, 2, 9, 1, 5, 6, -3} -> [-3, 1, 2, 5, 5, 6, 9]
~~~
- **Time:** O(n log n) in every case: log n levels of splitting, O(n) merging per level. **Space:** O(n) for the temporary array. **Stable.**
+ 2 | Recursive split with a correct base case | mid
+ 3 | Correct merge of two sorted halves, including leftovers | merge
+ 1 | Copies back / uses a temporary array correctly | tmp/temp
+ 1.5 | States O(n log n) time and O(n) space | n log n
+ 0.5 | Notes stability or the overflow-safe midpoint | stable/overflow

## Write Java code for inorder traversal of a binary search tree and for level-order (BFS) traversal.
@code 8 verified
~~~java
class Node { int val; Node left, right; Node(int v) { val = v; } }

static void inorder(Node n, List<Integer> out) {       // left, node, right
  if (n == null) return;
  inorder(n.left, out);
  out.add(n.val);
  inorder(n.right, out);
}

static List<List<Integer>> levelOrder(Node root) {     // BFS with a queue
  List<List<Integer>> res = new ArrayList<>();
  if (root == null) return res;
  Queue<Node> q = new ArrayDeque<>();
  q.add(root);
  while (!q.isEmpty()) {
    List<Integer> level = new ArrayList<>();
    for (int n = q.size(); n > 0; n--) {               // nodes of the current level
      Node cur = q.poll();
      level.add(cur.val);
      if (cur.left != null) q.add(cur.left);
      if (cur.right != null) q.add(cur.right);
    }
    res.add(level);
  }
  return res;
}
// Tree 8 -> (3 -> 1, 6), (10 -> right 14): inorder [1, 3, 6, 8, 10, 14]; levels [[8], [3, 10], [1, 6, 14]]
~~~
- Inorder traversal of a **BST** visits keys in **sorted order**. Both traversals are O(n) time; inorder uses O(h) stack (h = height), BFS uses O(w) queue (w = widest level).
+ 2.5 | Inorder: left, node, right with a null base case | inorder, null
+ 3 | BFS with a queue, enqueueing children | queue
+ 1 | Handles an empty tree | null/empty
+ 1 | Notes inorder of a BST is sorted | sorted
+ 0.5 | Complexity O(n) | O(n)

## Compare stack and queue, with operations, implementations and one real use each.
@compare 6
| | Stack | Queue |
|---|---|---|
| Order | LIFO: last in, first out | FIFO: first in, first out |
| Operations | push, pop, peek (all O(1)) | enqueue (offer), dequeue (poll), peek (all O(1)) |
| Java | {{Deque<T> s = new ArrayDeque<>()}} with push/pop (the old {{Stack}} class is synchronized and legacy) | {{Queue<T> q = new ArrayDeque<>()}} or {{LinkedList}}; {{BlockingQueue}} between threads |
| Uses | method call stack, undo, bracket matching, DFS | task and message queues (RabbitMQ), printer spooling, BFS |

- Variants: a **deque** allows both ends; a **priority queue** (binary heap) removes the smallest or largest first in O(log n).
+ 2 | LIFO vs FIFO | LIFO, FIFO
+ 1.5 | Operations of each and O(1) cost | push, pop/poll
+ 1.5 | A real use for each | undo/call stack/DFS, BFS/message
+ 1 | Java implementation or the deque/priority-queue variant | ArrayDeque/priority
