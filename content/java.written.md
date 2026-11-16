## Explain the four pillars of OOP with Java examples.
- **Encapsulation**: hide state behind methods. Private fields + getters/validated setters, e.g. a {{LoanAccount}} whose {{balance}} only changes through {{disburse()}} and {{repay()}}.
- **Abstraction**: expose what, hide how. An interface {{PaymentGateway}} with {{pay()}}, implementations hide bank-specific details.
- **Inheritance**: reuse and specialise. {{class SavingsAccount extends Account}}.
- **Polymorphism**: one interface, many forms. Compile-time = method overloading; runtime = overriding, e.g. {{Account a = new SavingsAccount(); a.calculateInterest();}} calls the subclass method.

Tip for the exam: give one tiny code line per pillar; examiners reward concrete examples.
+ 1.5 | Encapsulation: private state behind validated methods | private
+ 1.5 | Abstraction: interface hides the how | interface
+ 1.5 | Inheritance: extends with is-a reuse | extends
+ 1.5 | Polymorphism: overloading (compile time) vs overriding (runtime) | overrid, overload

## Abstract class vs interface (Java 8+)?
- An abstract class can have state (instance fields), constructors and any access modifiers; a class can extend only one.
- An interface has no instance state; since Java 8 it can have {{default}} and {{static}} methods, since Java 9 {{private}} methods. A class can implement many.
- Use an abstract class for a shared base with common state/behaviour ("is-a" with code reuse). Use an interface for a capability/contract ("can-do"), e.g. {{Comparable}}, {{Serializable}}.
+ 2 | Abstract class: state, constructors, any access modifiers | constructor, field/state
+ 2 | Interface: no instance state; default/static methods; multiple implementation | default, multiple
+ 2 | When to use each, with an example | is-a/contract

## How does HashMap work internally?
1. {{put(k,v)}} computes {{k.hashCode()}}, spreads it ({{h ^ (h >>> 16)}}) and finds the bucket index {{(n-1) & hash}}.
2. If the bucket is empty the node is stored; otherwise it walks the bin and uses {{equals()}} to replace an existing key or append a new node.
3. Since Java 8 a bin with 8+ nodes (and table size at least 64) becomes a red-black tree, so worst case is O(log n).
4. Default capacity 16, load factor 0.75: when size > capacity x 0.75 the table doubles and entries are redistributed (rehash).
5. Not thread-safe; use ConcurrentHashMap for concurrency.
+ 1.5 | hashCode, spreading and bucket index | hashCode, bucket
+ 1.5 | Collision handling: walks bin, equals() to match keys | equals, collision
+ 1 | Java 8 treeification of long bins (red-black tree) | tree
+ 1 | Capacity 16, load factor 0.75, resize/rehash | 0.75, resize
+ 1 | Not thread-safe → ConcurrentHashMap | ConcurrentHashMap

## Write a Java method that returns the first non-repeating character in a string.
~~~java
public static Character firstUnique(String s) {
    Map<Character, Integer> count = new LinkedHashMap<>();
    for (char c : s.toCharArray()) count.merge(c, 1, Integer::sum);
    for (Map.Entry<Character, Integer> e : count.entrySet())
        if (e.getValue() == 1) return e.getKey();
    return null; // none
}
// firstUnique("swiss") -> 'w'
~~~
LinkedHashMap keeps insertion order, so the first entry with count 1 is the answer. O(n) time, O(k) space.
+ 3 | Counts every character (LinkedHashMap/array/frequency map) | count/map
+ 2 | Second pass in original order returns the first with count 1 | order
+ 1.5 | Handles no-answer and empty/null input | null/empty
+ 1.5 | States O(n) time, O(k) space | O(n)

## Explain the SOLID principles.
- **S**ingle responsibility: a class has one reason to change (separate {{ReportService}} from {{ReportPdfExporter}}).
- **O**pen/closed: open for extension, closed for modification (add a new {{PaymentGateway}} implementation instead of editing a switch).
- **L**iskov substitution: subtypes must be usable wherever the base type is expected without breaking behaviour.
- **I**nterface segregation: many small interfaces over one fat one.
- **D**ependency inversion: depend on abstractions; Spring's constructor injection of interfaces is the textbook example.
+ 1 | Single responsibility | single
+ 1 | Open/closed | open
+ 1 | Liskov substitution | liskov
+ 1 | Interface segregation | segregation
+ 1 | Dependency inversion with an injection example | inversion

## Write Java code using streams: group employees by department and get the average salary of each.
~~~java
Map<String, Double> avg = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDept,
             Collectors.averagingDouble(Employee::getSalary)));

// Highest-paid employee per department:
Map<String, Optional<Employee>> top = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDept,
             Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary))));
~~~
+ 3 | Uses stream().collect(groupingBy(dept, ...)) | groupingBy
+ 2.5 | Downstream averagingDouble/averagingInt for salary | averaging
+ 1.5 | Correct types (Map<String, Double>) and compiles | Map
+ 1 | Readable; mentions BigDecimal for money or sorting the output | BigDecimal/sort

## Thread vs Runnable vs ExecutorService vs CompletableFuture?
- {{Thread}}: a raw OS-backed thread; creating many is expensive.
- {{Runnable}}/{{Callable}}: the task; Callable returns a value and can throw checked exceptions.
- {{ExecutorService}}: a managed thread pool that reuses threads and returns {{Future}}s.
- {{CompletableFuture}}: composable async pipelines ({{supplyAsync().thenApply().thenCombine().exceptionally()}}) without blocking on {{get()}}.
- Java 21 adds virtual threads for massive I/O concurrency, but the ToR targets Java 17 style code.
+ 1.5 | Thread is a raw thread, expensive to create | Thread
+ 1.5 | Runnable/Callable are tasks; Callable returns a value | Callable
+ 1.5 | ExecutorService pools and reuses threads, returns Future | pool, Future
+ 1.5 | CompletableFuture composes async pipelines; virtual threads note | thenApply/compos

## Predict the output (Integer caching).
@output 3 verified
~~~java
Integer a = 127, b = 127, c = 128, d = 128;
System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));
~~~
**Output:**
~~~
true false true
~~~
- Autoboxing uses {{Integer.valueOf}}, which caches -128..127, so a and b are the **same object**. 128 creates new objects, so {{==}} compares references and gives false. {{equals}} compares values. Always compare wrapper objects with equals.
+ 2 | Exact output | true false true
+ 1 | Names the Integer cache (-128..127) and reference vs value comparison


## Predict the output (try/finally and return).
@output 3 verified
~~~java
static int f() { try { return 1; } finally { System.out.print("finally "); } }
static int g() { try { return 1; } finally { return 2; } }
// main:
System.out.println(f());
System.out.println(g());
~~~
**Output:**
~~~
finally 1
2
~~~
- finally runs **after** the return value is computed but before the method returns, so "finally " prints before 1. A {{return}} inside finally **overrides** the try return (and would swallow exceptions), so never return from finally.
+ 2 | Exact output | finally 1, 2
+ 1 | Explains finally timing and that return in finally overrides


## Predict the output (initialisation order).
@output 3 verified
~~~java
class P { static { System.out.print("P-static "); } { System.out.print("P-init "); } P() { System.out.print("P-ctor "); } }
class C extends P { static { System.out.print("C-static "); } { System.out.print("C-init "); } C() { System.out.print("C-ctor "); } }
// main:
new C(); System.out.println();
new C();
~~~
**Output:**
~~~
P-static C-static P-init P-ctor C-init C-ctor
P-init P-ctor C-init C-ctor
~~~
- Static blocks run **once**, when the class is loaded, parent first. For each object, the parent is fully built (instance initialisers, then constructor) before the child's instance initialisers and constructor. The second {{new C()}} skips the static blocks.
+ 2 | Exact output | P-static C-static P-init P-ctor C-init C-ctor / P-init P-ctor C-init C-ctor
+ 1 | Static once and parent-first; instance init before constructor


## Predict the output (String immutability).
@output 3 verified
~~~java
String s = "PKSF";
s.concat("-BD");
s.toLowerCase();
System.out.println(s);
~~~
**Output:**
~~~
PKSF
~~~
- Strings are **immutable**. concat and toLowerCase return **new** strings that are discarded here. It should be {{s = s.concat("-BD")}}. In loops, use StringBuilder.
+ 2 | Exact output | PKSF
+ 1 | Names immutability and that the returned value is ignored


## Predict the output (char and String concatenation).
@output 3 verified
~~~java
System.out.println('a' + 'b' + "c");
System.out.println("c" + 'a' + 'b');
System.out.println(1 + 2 + "3" + 4 + 5);
~~~
**Output:**
~~~
195c
cab
3345
~~~
- {{+}} is evaluated left to right. char + char is **numeric** addition (97 + 98 = 195). Once a String appears, everything after it is concatenation, so 1 + 2 = 3, then "3", "3", "4", "5" gives "3345".
+ 2 | Exact output | 195c / cab / 3345
+ 1 | Left-to-right evaluation; char arithmetic before a String


## Predict the output (post- and pre-increment).
@output 3 verified
~~~java
int i = 5;
int j = i++ + ++i;
System.out.println(i + " " + j);
~~~
**Output:**
~~~
7 12
~~~
- {{i++}} yields 5 and then i becomes 6. {{++i}} makes i 7 and yields 7. j = 5 + 7 = 12 and i = 7.
+ 2 | Exact output | 7 12
+ 1 | Traces the value yielded by each operator


## Predict the output (overload resolution with null).
@output 3 verified
~~~java
static void m(Object o) { System.out.println("Object"); }
static void m(String s) { System.out.println("String"); }
// main:
m(null);
~~~
**Output:**
~~~
String
~~~
- The compiler picks the **most specific** applicable overload; String is more specific than Object. Adding {{m(Integer i)}} would make the call **ambiguous**, which is a compile error.
+ 2 | Exact output | String
+ 1 | Most-specific overload rule, chosen at compile time


## Predict the output (pass-by-value).
@output 3 verified
~~~java
static void change(int[] a, int x, StringBuilder sb, String s) {
  a[0] = 99; x = 99; sb.append("!"); s = s + "!"; a = new int[]{-1};
}
// main:
int[] arr = {1}; int x = 1; StringBuilder sb = new StringBuilder("hi"); String str = "hi";
change(arr, x, sb, str);
System.out.println(arr[0] + " " + x + " " + sb + " " + str);
~~~
**Output:**
~~~
99 1 hi! hi
~~~
- Java is **always pass-by-value**; for objects, the value passed is the reference. Mutating the object through the copy (a[0], sb.append) is visible to the caller. Reassigning the parameter (x, s, a = new …) is not.
+ 2 | Exact output | 99 1 hi! hi
+ 1 | Pass-by-value of references: mutate vs reassign


## Predict the output (static method hiding vs overriding).
@output 3 verified
~~~java
class Parent { static String who() { return "Parent.static"; } String me() { return "Parent.inst"; } }
class Child extends Parent { static String who() { return "Child.static"; } @Override String me() { return "Child.inst"; } }
// main:
Parent p = new Child();
System.out.println(p.who() + " " + p.me());
~~~
**Output:**
~~~
Parent.static Child.inst
~~~
- Static methods are **hidden**, not overridden: the call is bound at compile time to the **declared** type (Parent). Instance methods use dynamic dispatch on the **runtime** type (Child).
+ 2 | Exact output | Parent.static Child.inst
+ 1 | Static binding by declared type vs dynamic dispatch


## Predict the output (integer division and remainder).
@output 3 verified
~~~java
System.out.println(5 / 2 + " " + 5 / 2.0 + " " + 5 % -3 + " " + -5 % 3);
~~~
**Output:**
~~~
2 2.5 2 -2
~~~
- int / int truncates toward zero. One double operand makes it floating point. In Java, {{%}} takes the **sign of the dividend** (left operand).
+ 2 | Exact output | 2 2.5 2 -2
+ 1 | Integer truncation; remainder sign follows the dividend


## Predict the output (List.remove overloads).
@output 3 verified
~~~java
List<Integer> l = new ArrayList<>(List.of(1, 2, 3));
l.remove(1);
System.out.println(l);
l.remove(Integer.valueOf(1));
System.out.println(l);
~~~
**Output:**
~~~
[1, 3]
[3]
~~~
- {{remove(int index)}} is chosen for an int literal, which removes the element at index 1 (the value 2). {{remove(Object)}} removes by value, so you must box explicitly.
+ 2 | Exact output | [1, 3] / [3]
+ 1 | remove(int index) vs remove(Object)


## Predict the output (money arithmetic).
@output 3 verified
~~~java
System.out.println(0.1 + 0.2);
System.out.println(new BigDecimal("0.1").add(new BigDecimal("0.2")));
System.out.println(new BigDecimal("1.0").equals(new BigDecimal("1.00")) + " "
    + (new BigDecimal("1.0").compareTo(new BigDecimal("1.00")) == 0));
~~~
**Output:**
~~~
0.30000000000000004
0.3
false true
~~~
- double is binary floating point and cannot represent 0.1 exactly, so **never use double for money**. Use BigDecimal built from **String** (not {{new BigDecimal(0.1)}}). BigDecimal.equals also compares **scale** (1.0 vs 1.00), so compare amounts with {{compareTo}}. In the DB, use NUMERIC(p,s).
+ 2 | Exact output | 0.30000000000000004 / 0.3 / false true
+ 1 | Floating-point representation; equals vs compareTo (scale)


## Predict the output (String pool and ==).
@output 3 verified
~~~java
String s1 = "PKSF", s2 = "PK" + "SF", s3 = new String("PKSF");
String part = "PK", s4 = part + "SF";
System.out.println((s1 == s2) + " " + (s1 == s3) + " " + (s1 == s4) + " " + (s1 == s4.intern()));
~~~
**Output:**
~~~
true false false true
~~~
- "PK" + "SF" is a **compile-time constant**, folded and interned, so it is the same object as s1. {{new String}} always creates a new object. part + "SF" is computed at **runtime** (part is not final), producing a new object. {{intern()}} returns the pooled instance. Compare strings with equals.
+ 2 | Exact output | true false false true
+ 1 | Compile-time constant folding vs runtime concatenation; intern


## Predict the output (HashMap operations).
@output 3 verified
~~~java
Map<String, Integer> mp = new HashMap<>();
mp.put("a", 1); mp.put("a", 2);
mp.merge("a", 10, Integer::sum);
mp.putIfAbsent("a", 0);
System.out.println(mp + " " + mp.getOrDefault("b", -1));
~~~
**Output:**
~~~
{a=12} -1
~~~
- put replaces the value for an existing key (2). merge combines old and new (2 + 10 = 12). putIfAbsent does nothing because the key exists. getOrDefault returns the default for a missing key.
+ 2 | Exact output | {a=12} -1
+ 1 | put replaces, merge combines, putIfAbsent skips


## Find the error: remove blank names from a list.
@bug 5 verified
~~~java
List<String> names = new ArrayList<>(List.of("Rina", "", "Mita", ""));
for (String n : names) {
  if (n.isEmpty()) names.remove(n);
}
~~~
**Bug:** modifying the list inside an enhanced for loop. The hidden Iterator's {{modCount}} check fails, and this input throws **ConcurrentModificationException**. With some inputs (removing the second-to-last element) it silently skips an element instead, which is even worse.

**Fix:**
~~~java
names.removeIf(String::isEmpty);                // Java 8+
// or: Iterator<String> it = names.iterator(); while (it.hasNext()) if (it.next().isEmpty()) it.remove();
// or: names = names.stream().filter(s -> !s.isEmpty()).toList();
~~~
+ 1.5 | Identifies modification during iteration | remove
+ 1.5 | Names ConcurrentModificationException / fail-fast iterator | ConcurrentModificationException
+ 2 | Correct fix: removeIf, Iterator.remove, or stream filter | removeIf/iterator


## Find the error: interest is calculated with double.
@bug 5 verified
~~~java
double balance = 0.1 + 0.2;
if (balance == 0.3) approve();     // never approves
double interest = principal * 0.075;
~~~
**Bug:** binary floating point cannot represent most decimal fractions exactly ({{0.1 + 0.2 = 0.30000000000000004}}), so {{==}} fails and rounding errors accumulate across thousands of loans.

**Fix:** use BigDecimal built from Strings, with explicit rounding, and compare with compareTo:
~~~java
BigDecimal balance = new BigDecimal("0.1").add(new BigDecimal("0.2"));
if (balance.compareTo(new BigDecimal("0.3")) == 0) approve();
BigDecimal interest = principal.multiply(new BigDecimal("0.075")).setScale(2, RoundingMode.HALF_EVEN);
~~~
Store amounts as {{NUMERIC(14,2)}} in the DB, never FLOAT.
+ 1.5 | Identifies floating-point imprecision for money | floating/precision
+ 1 | Explains why == fails | 0.30000000000000004/exact
+ 2 | BigDecimal from String with RoundingMode and compareTo | BigDecimal, RoundingMode/compareTo
+ 0.5 | NUMERIC in the DB | numeric
