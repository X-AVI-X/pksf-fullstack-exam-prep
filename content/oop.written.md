## Explain the four pillars of OOP with a banking example.
@concept 8
- **Encapsulation:** a {{Loan}} keeps {{balance}} private; it changes only through {{disburse()}} and {{repay(amount)}}, which validate input.
- **Abstraction:** callers use an {{InterestCalculator}} interface without knowing the formula.
- **Inheritance:** {{SavingsAccount extends Account}} reuses common fields and behaviour.
- **Polymorphism:** {{Account a = new SavingsAccount(); a.monthlyCharge();}} runs the subclass override at runtime; overloading gives compile-time polymorphism.
~~~java
public abstract class Account {
  private BigDecimal balance = BigDecimal.ZERO;          // encapsulation
  public void deposit(BigDecimal amt) {
    if (amt.signum() <= 0) throw new IllegalArgumentException("amount must be positive");
    balance = balance.add(amt);
  }
  public BigDecimal getBalance() { return balance; }
  public abstract BigDecimal monthlyCharge();            // abstraction
}
class SavingsAccount extends Account {                   // inheritance
  @Override public BigDecimal monthlyCharge() { return BigDecimal.ZERO; }   // polymorphism
}
~~~
+ 2 | Encapsulation defined, with private state guarded by methods | private, encapsulation
+ 2 | Abstraction via an interface or abstract class | abstract/interface
+ 2 | Inheritance with an is-a example | extends
+ 2 | Polymorphism: overriding/dynamic dispatch, and mentions overloading | override, overload/runtime


## Compare abstract class and interface, and say when to use each.
@compare 6
| | Abstract class | Interface |
|---|---|---|
| State | instance fields, constructors | only constants |
| Methods | abstract and concrete | abstract, default, static, private |
| Inheritance | single ({{extends}}) | multiple ({{implements}}) |
| Purpose | shared base implementation, "is-a" | capability or contract, "can-do" |

- Use an **abstract class** when related classes share code and state (for example {{AbstractReportGenerator}} with a template method).
- Use an **interface** for a contract that unrelated classes can implement ({{Comparable}}, {{PaymentGateway}}), and for Spring beans you want to mock.
+ 1.5 | State and constructors: abstract class yes, interface no | field/state, constructor
+ 1.5 | Single vs multiple inheritance | multiple
+ 1 | Java 8+ default and static methods in interfaces | default
+ 2 | When to use each, with an example | when

## Predict the output (constructor chaining and an overridden method called from the constructor).
@output 3 verified
~~~java
class A {
  A() { System.out.print("A "); show(); }
  void show() { System.out.print("A.show "); }
}
class B extends A {
  int x = 5;
  B() { System.out.print("B "); }
  @Override void show() { System.out.print("B.show " + x + " "); }
}
public class Main { public static void main(String[] args) { new B(); } }
~~~
**Output:** {{A B.show 0 B}}
- {{new B()}} first runs the superclass constructor (implicit {{super()}}), printing "A".
- {{show()}} is dispatched **dynamically** to B's override even inside A's constructor, but B's field initialiser ({{x = 5}}) has not run yet, so x still has its default value **0**.
- Then B's initialisers and constructor body run, printing "B". Lesson: never call overridable methods from a constructor.
+ 2 | Exact output A B.show 0 B | B.show 0
+ 1 | Superclass constructor first; dynamic dispatch sees the default field value | super/default

## Compare inheritance and composition. Why "favour composition over inheritance"?
@compare 6
| | Inheritance | Composition |
|---|---|---|
| Relationship | "is-a" ({{SavingsAccount extends Account}}) | "has-a" ({{Loan}} has an {{InterestPolicy}}) |
| Coupling | tight: the subclass depends on the parent's internals | loose: depends only on an interface |
| Flexibility | fixed at compile time; one parent class in Java | swap the part at runtime; combine many parts |
| Reuse | inherits everything, wanted or not | reuses only what it delegates to |
| Testing | harder: needs the parent's behaviour | easy: inject a mock of the part |

- Inheritance breaks encapsulation (the **fragile base class** problem): a change in the parent can silently break subclasses.
- Use inheritance only for a true is-a relationship that satisfies Liskov substitution; otherwise hold the collaborator in a field and delegate. Spring's dependency injection and the Strategy pattern are composition.
~~~java
class Loan {
  private final InterestPolicy policy;                 // composition
  Loan(InterestPolicy policy) { this.policy = policy; }
  BigDecimal interest() { return policy.calculate(this); }
}
~~~
+ 1.5 | is-a vs has-a, with an example of each | is-a, has-a
+ 1.5 | Coupling and flexibility differences | coupling
+ 1.5 | Why composition is preferred: fragile base class, runtime swapping, testing | fragile/mock/runtime
+ 1.5 | When inheritance is still right, or a delegation code example | Liskov/delegat

## Compare method overloading and method overriding.
@compare 6
| | Overloading | Overriding |
|---|---|---|
| Where | same class (or subclass), same name | subclass redefines an inherited method |
| Parameters | must differ (number, type or order) | must be the same |
| Return type | may differ, but cannot be the only difference | same or covariant (a subtype) |
| Binding | compile time (static polymorphism) | runtime (dynamic dispatch) |
| Access/exceptions | no restriction | cannot reduce visibility or add broader checked exceptions |
| static/final/private methods | can be overloaded | cannot be overridden (static methods are hidden) |

~~~java
class Printer { void print(int x) {} void print(String s) {} }              // overloading
class Account { BigDecimal charge() { return BigDecimal.TEN; } }
class Savings extends Account { @Override BigDecimal charge() { return BigDecimal.ZERO; } }   // overriding
~~~
- Use {{@Override}} so the compiler catches a signature mistake that would silently create an overload.
+ 2 | Parameter rule: must differ vs must match | parameter
+ 2 | Compile-time vs runtime binding | compile, runtime
+ 1 | Rules on return type, visibility or static methods | covariant/static/visibility
+ 1 | Code example of each or the @Override note | @Override

## Write a thread-safe Singleton in Java and state its drawbacks.
@code 6 verified
~~~java
// 1. Enum: simplest; safe against reflection and serialisation
public enum Config { INSTANCE; }

// 2. Initialisation-on-demand holder: lazy and thread-safe without locks
public class Registry {
  private Registry() {}                                  // no outside instantiation
  private static class Holder { static final Registry I = new Registry(); }
  public static Registry get() { return Holder.I; }      // class loading guarantees one instance
}

// 3. Double-checked locking: the field MUST be volatile
public class Cache {
  private static volatile Cache instance;
  private Cache() {}
  public static Cache get() {
    if (instance == null) {
      synchronized (Cache.class) {
        if (instance == null) instance = new Cache();
      }
    }
    return instance;
  }
}
~~~
- **Drawbacks:** global state hides dependencies and makes unit tests hard to isolate; it is one instance per class loader, not per cluster. In Spring, prefer a singleton-scoped **bean** that is injected.
+ 2 | Private constructor and a single static access point | private
+ 2.5 | Thread safety done correctly (enum, holder, or volatile + double check) | volatile/enum/Holder
+ 1.5 | Drawbacks: global state, testing; or the Spring bean alternative | test/global/bean
