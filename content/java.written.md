## Explain the four pillars of OOP with Java examples.
- **Encapsulation**: hide state behind methods. Private fields + getters/validated setters, e.g. a {{LoanAccount}} whose {{balance}} only changes through {{disburse()}} and {{repay()}}.
- **Abstraction**: expose what, hide how. An interface {{PaymentGateway}} with {{pay()}}, implementations hide bank-specific details.
- **Inheritance**: reuse and specialise. {{class SavingsAccount extends Account}}.
- **Polymorphism**: one interface, many forms. Compile-time = method overloading; runtime = overriding, e.g. {{Account a = new SavingsAccount(); a.calculateInterest();}} calls the subclass method.

Tip for the exam: give one tiny code line per pillar; examiners reward concrete examples.
## Abstract class vs interface (Java 8+)?
- An abstract class can have state (instance fields), constructors and any access modifiers; a class can extend only one.
- An interface has no instance state; since Java 8 it can have {{default}} and {{static}} methods, since Java 9 {{private}} methods. A class can implement many.
- Use an abstract class for a shared base with common state/behaviour ("is-a" with code reuse). Use an interface for a capability/contract ("can-do"), e.g. {{Comparable}}, {{Serializable}}.
## How does HashMap work internally?
1. {{put(k,v)}} computes {{k.hashCode()}}, spreads it ({{h ^ (h >>> 16)}}) and finds the bucket index {{(n-1) & hash}}.
2. If the bucket is empty the node is stored; otherwise it walks the bin and uses {{equals()}} to replace an existing key or append a new node.
3. Since Java 8 a bin with 8+ nodes (and table size at least 64) becomes a red-black tree, so worst case is O(log n).
4. Default capacity 16, load factor 0.75: when size > capacity x 0.75 the table doubles and entries are redistributed (rehash).
5. Not thread-safe; use ConcurrentHashMap for concurrency.
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
## Explain the SOLID principles.
- **S**ingle responsibility: a class has one reason to change (separate {{ReportService}} from {{ReportPdfExporter}}).
- **O**pen/closed: open for extension, closed for modification (add a new {{PaymentGateway}} implementation instead of editing a switch).
- **L**iskov substitution: subtypes must be usable wherever the base type is expected without breaking behaviour.
- **I**nterface segregation: many small interfaces over one fat one.
- **D**ependency inversion: depend on abstractions; Spring's constructor injection of interfaces is the textbook example.
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
## Thread vs Runnable vs ExecutorService vs CompletableFuture?
- {{Thread}}: a raw OS-backed thread; creating many is expensive.
- {{Runnable}}/{{Callable}}: the task; Callable returns a value and can throw checked exceptions.
- {{ExecutorService}}: a managed thread pool that reuses threads and returns {{Future}}s.
- {{CompletableFuture}}: composable async pipelines ({{supplyAsync().thenApply().thenCombine().exceptionally()}}) without blocking on {{get()}}.
- Java 21 adds virtual threads for massive I/O concurrency, but the ToR targets Java 17 style code.
