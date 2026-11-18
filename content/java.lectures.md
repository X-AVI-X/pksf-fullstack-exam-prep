## Java as a language: the basics you must not guess
Java is compiled to bytecode and run by the JVM, so the same class file runs on any platform with a JVM. Every value is either a primitive (int, long, double, boolean, char) or a reference to an object. Strings are immutable objects. Arrays have a fixed length and are objects too.

Two habits prevent most errors: always check for null before calling a method on a reference, and remember that == compares references for objects but values for primitives. Use .equals() to compare the content of two strings.

@check
Q: Which line prints true when comparing the contents of two String objects a and b?
- System.out.println(a == b);
* System.out.println(a.equals(b));
- System.out.println(a.length == b.length);
- System.out.println(a.compareTo == b);
E: == compares references, so two equal strings built separately can give false. equals compares the content.

## Classes, interfaces and abstract classes
A class groups state (fields) and behaviour (methods). An interface declares a contract: what a type can do, with no state. Since Java 8 an interface can have default and static methods. An abstract class can hold state and partial implementation, and a class can extend only one abstract class but implement many interfaces.

Use an interface when unrelated classes must share a capability, such as Payable. Use an abstract class when related classes share state and a common flow.

@check
Q: Which is the best reason to choose an interface over an abstract class?
- To store shared instance state
* Unrelated classes need to share a capability, and a class can implement many interfaces
- To prevent the class from having methods
- To make the class static
E: An interface defines a capability without state, and a class can implement several. An abstract class suits a shared base with state and a common flow.

## Collections and generics
The Collections framework gives you List (ordered, allows duplicates, such as ArrayList), Set (no duplicates, such as HashSet), and Map (key to value, such as HashMap). Generics make them type-safe: List<String> refuses an Integer at compile time instead of failing at run time.

Choose by need: ArrayList for indexed access, HashSet for fast membership checks, HashMap for lookups by key, TreeMap when keys must stay sorted. HashMap allows one null key and does not guarantee order.

@check
Q: You need fast checks of whether a value is already present and no duplicates. Which collection fits?
- ArrayList
* HashSet
- LinkedList with a loop
- Array of Strings
E: A HashSet stores unique values and checks membership in roughly constant time. A list needs a linear scan to check membership.

## Streams and lambdas
A lambda is a short anonymous function: (a, b) -> a + b. A stream is a pipeline over a collection: filter, map, then collect or reduce. Streams do not change the source; they produce a new result.

For example, the list of names of customers with balance above 1000 is customers.stream().filter(c -> c.getBalance() > 1000).map(Customer::getName).toList().

@check
Q: Which stream operation changes each element into another value?
- filter
* map
- sorted
- forEach
E: map transforms each element. filter keeps the matching elements, and sorted reorders them. forEach runs an action with no result.

## Exceptions, and the try-with-resources rule
Checked exceptions (such as IOException) must be caught or declared. Unchecked exceptions (RuntimeException subclasses) do not have to be declared. Errors (such as OutOfMemoryError) signal serious JVM problems and should not normally be caught.

Resources such as files and connections should be closed with try-with-resources, which closes them automatically even when an exception occurs.

@check
Q: Which statement about try-with-resources is correct?
- It catches every error automatically
* It closes each declared resource automatically, even when an exception is thrown
- It works only with arrays
- It makes the code run in parallel
E: The resource is closed when the block ends, whether it finished normally or threw an exception.
