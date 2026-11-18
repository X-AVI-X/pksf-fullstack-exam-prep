## Write a Java class BankAccount with private account number, holder name and balance; methods to deposit, withdraw (rejecting a withdrawal larger than the balance) and display the account. Explain how your class demonstrates encapsulation.
@code 10 verified
~~~java
import java.math.BigDecimal;
import java.util.Objects;

class InsufficientBalanceException extends Exception {
    public InsufficientBalanceException(String msg) { super(msg); }
}

public class BankAccount {
    private final String accountNo;
    private final String holder;
    private BigDecimal balance = BigDecimal.ZERO;

    public BankAccount(String accountNo, String holder) {
        this.accountNo = Objects.requireNonNull(accountNo);
        this.holder = Objects.requireNonNull(holder);
    }

    public void deposit(BigDecimal amount) {
        requirePositive(amount);
        balance = balance.add(amount);
    }

    public void withdraw(BigDecimal amount) throws InsufficientBalanceException {
        requirePositive(amount);
        if (amount.compareTo(balance) > 0)
            throw new InsufficientBalanceException("Balance " + balance + " is less than " + amount);
        balance = balance.subtract(amount);
    }

    public BigDecimal getBalance() { return balance; }   // read-only: no setBalance()

    public void display() { System.out.println(accountNo + " | " + holder + " | " + balance); }

    private static void requirePositive(BigDecimal a) {
        if (a == null || a.signum() <= 0) throw new IllegalArgumentException("Amount must be positive");
    }

    public static void main(String[] args) throws Exception {
        BankAccount acc = new BankAccount("1001", "Rahima");
        acc.deposit(new BigDecimal("5000"));
        acc.withdraw(new BigDecimal("1200.50"));
        acc.display();                                    // 1001 | Rahima | 3799.50
        try { acc.withdraw(new BigDecimal("10000")); }
        catch (InsufficientBalanceException e) { System.out.println("Rejected: " + e.getMessage()); }
    }
}
~~~
Compiled and run on Java 21. Output: {{1001 | Rahima | 3799.50}}, then {{Rejected: Balance 3799.50 is less than 10000}}.

**Encapsulation:** the fields are {{private}}, so no outside code can set {{balance}} directly. State changes only through {{deposit}} and {{withdraw}}, which enforce the rules (amount must be positive, no overdrawing). There is deliberately no {{setBalance}}. The account number and holder are {{final}}. {{BigDecimal}} avoids the rounding errors {{double}} makes with money.
+ 2 | Private fields; no public setter for balance | private
+ 2 | deposit validates a positive amount | deposit, positive
+ 3 | withdraw checks the balance and rejects with an exception | withdraw, exception
+ 1 | display method and a demo with output | display
+ 2 | Explains encapsulation (data hidden, changed only through rule-checking methods); BigDecimal for money | encapsulation, bigdecimal

## Design an account hierarchy in Java: a common Account, a SavingsAccount that keeps a minimum balance of 500 and earns 6% annual interest monthly, and a CurrentAccount that allows an overdraft up to a limit. Show how polymorphism lets one loop process both.
@code 10 verified
~~~java
import java.util.List;

abstract class Account {
    private final String id;
    protected double balance;          // use BigDecimal in production

    Account(String id, double opening) { this.id = id; this.balance = opening; }

    public void deposit(double amt) {
        if (amt <= 0) throw new IllegalArgumentException("amount");
        balance += amt;
    }
    // Template method: the rule flow is fixed, each subclass decides the limit.
    public final void withdraw(double amt) {
        if (amt <= 0) throw new IllegalArgumentException("amount");
        if (!canWithdraw(amt)) throw new IllegalStateException(type() + " " + id + ": cannot withdraw " + amt);
        balance -= amt;
    }
    protected abstract boolean canWithdraw(double amt);
    public abstract void monthEnd();
    public abstract String type();
    @Override public String toString() { return type() + " " + id + " balance=" + balance; }
}

class SavingsAccount extends Account {
    static final double MIN_BALANCE = 500, ANNUAL_RATE = 0.06;
    SavingsAccount(String id, double opening) { super(id, opening); }
    @Override protected boolean canWithdraw(double amt) { return balance - amt >= MIN_BALANCE; }
    @Override public void monthEnd() { balance += balance * ANNUAL_RATE / 12; }
    @Override public String type() { return "Savings"; }
}

class CurrentAccount extends Account {
    private final double overdraftLimit;
    CurrentAccount(String id, double opening, double overdraftLimit) {
        super(id, opening); this.overdraftLimit = overdraftLimit;
    }
    @Override protected boolean canWithdraw(double amt) { return balance - amt >= -overdraftLimit; }
    @Override public void monthEnd() { if (balance < 0) balance += balance * 0.01; } // 1% OD charge
    @Override public String type() { return "Current"; }
}

public class Bank {
    public static void main(String[] args) {
        List<Account> accounts = List.of(new SavingsAccount("S1", 10000), new CurrentAccount("C1", 2000, 5000));
        for (Account a : accounts) {           // one loop, behaviour chosen at run time
            a.withdraw(6000);
            a.monthEnd();
            System.out.println(a);
        }
    }
}
~~~
Run on Java 21. Output: {{Savings S1 balance=4020.0}} and {{Current C1 balance=-4040.0}}.

- **Inheritance:** shared state and the withdraw flow live once, in {{Account}}.
- **Abstraction:** {{Account}} is abstract, so you cannot open a "generic" account.
- **Polymorphism:** the loop calls {{withdraw}} and {{monthEnd}} through an {{Account}} reference, and the JVM runs the subclass's version (dynamic dispatch).
- **Open/closed:** adding a {{FixedDepositAccount}} needs a new class only; the loop stays the same.
+ 2 | Abstract base class with shared fields and methods | abstract
+ 2 | Savings: minimum-balance check and monthly interest | 500, interest
+ 2 | Current: overdraft limit check | overdraft
+ 2 | Polymorphic loop over List<Account> calling overridden methods | list<account>, polymorphism
+ 2 | Explains inheritance, abstraction and runtime dispatch; @Override used | override, dispatch

## Study the classes below. Identify the overloaded, overridden and hidden members, then give the output of main.
@output 10 verified
~~~java
class A {
    String name = "A-field";
    static String who() { return "A.who"; }
    String hello() { return "A.hello"; }
    void show(int x) { System.out.println("A.show(int)"); }
}
class B extends A {
    String name = "B-field";
    static String who() { return "B.who"; }
    @Override String hello() { return "B.hello"; }
    void show(String s) { System.out.println("B.show(String)"); }
}
public class Main {
    public static void main(String[] args) {
        A ab = new B();
        System.out.println(ab.name + " " + ab.hello() + " " + ab.who() + " " + ((B) ab).name);
        ab.show(5);
        B b = new B();
        b.show(5);
        b.show("x");
    }
}
~~~
Output (run on Java 21):
~~~
A-field B.hello A.who B-field
A.show(int)
A.show(int)
B.show(String)
~~~
| Member | Relationship | Why |
|---|---|---|
| {{hello()}} | **overridden** | same signature, instance method; chosen at run time by the object (B) |
| {{who()}} | **hidden** | static method; chosen at compile time by the reference type (A) |
| {{name}} | **hidden** (field hiding) | fields are never polymorphic; {{ab.name}} uses A's field |
| {{show(int)}} / {{show(String)}} | **overloaded** | same name, different parameter types. B gets both. |

{{ab.show("x")}} would not compile: the reference type A has no {{show(String)}}.
+ 3 | Exact four-line output | a-field b.hello a.who b-field
+ 2 | hello() identified as overridden (runtime dispatch on the object) | overrid
+ 2 | who() and name identified as hidden (static/field, resolved by reference type) | hid
+ 2 | show(int)/show(String) identified as overloading | overload
+ 1 | Notes overloads resolve at compile time against the reference type | compile time

## Predict the output of the following Java program and explain each line.
@output 10 verified
~~~java
class Util { static int count = 7; int size = 3; static String hi() { return "hi"; } }

public class Main {
    public static void main(String[] args) {
        Util u = null;
        System.out.println(u.count + " " + u.hi());
        try { System.out.println(u.size); }
        catch (NullPointerException e) { System.out.println("NPE"); }

        int[] z = new int[0];
        System.out.println(z.length);
        try { System.out.println(z[0]); }
        catch (ArrayIndexOutOfBoundsException e) { System.out.println("AIOOBE"); }

        String s1 = "PKSF", s2 = "PKSF", s3 = new String("PKSF");
        System.out.println((s1 == s2) + " " + (s1 == s3) + " " + s1.equals(s3));
        System.out.println(1 + 2 + "3" + 4 + 5);
    }
}
~~~
Output (run on Java 21):
~~~
7 hi
NPE
0
AIOOBE
true false true
3345
~~~
1. **{{u.count}}** and **{{u.hi()}}** are static, so they're resolved through the class and the null reference is never dereferenced. No exception.
2. **{{u.size}}** is an instance field, so the null reference is dereferenced and throws a {{NullPointerException}}.
3. **{{new int[0]}}** is a valid empty array; its length is 0.
4. **{{z[0]}}** asks for index 0 of an empty array and throws {{ArrayIndexOutOfBoundsException}}.
5. **String literals** are interned in the string pool, so {{s1 == s2}} is true. {{new String}} creates a separate object, so {{s1 == s3}} is false, but {{equals}} compares the content and is true.
6. **{{+}} evaluates left to right:** 1 + 2 = 3 (int addition), then "3" + "3" → "33", then "334", then "3345".
+ 4 | Exact output, all six lines | 7 hi, npe, 3345
+ 2 | Static member through a null reference works; instance member throws NPE | static
+ 2 | Empty array: length 0 and index 0 out of bounds | length
+ 2 | String pool vs new String; left-to-right + with strings | pool, equals

## What is the difference between an exception and an error in Java? Distinguish checked from unchecked exceptions, and write a withdraw method that uses a custom checked exception with try-catch-finally.
@descriptive 10
**Hierarchy:** {{Throwable}} → {{Error}} and {{Exception}}; {{Exception}} → {{RuntimeException}} and the checked exceptions.

| | Error | Checked exception | Unchecked exception |
|---|---|---|---|
| Meaning | serious JVM or system problem | recoverable, expected condition | programming bug |
| Examples | {{OutOfMemoryError}}, {{StackOverflowError}} | {{IOException}}, {{SQLException}}, {{InsufficientBalanceException}} | {{NullPointerException}}, {{IllegalArgumentException}}, {{ArithmeticException}} |
| Must handle? | no; don't catch | **yes**: catch it or declare it with {{throws}} (checked at compile time) | no |
| Recover? | usually not | yes (retry, tell the user) | fix the code |

~~~java
class InsufficientBalanceException extends Exception {        // checked
    InsufficientBalanceException(String msg) { super(msg); }
}

void withdraw(BigDecimal amount) throws InsufficientBalanceException {
    if (amount.compareTo(balance) > 0)
        throw new InsufficientBalanceException("Insufficient balance");
    balance = balance.subtract(amount);
}

// caller
try {
    account.withdraw(new BigDecimal("10000"));
} catch (InsufficientBalanceException e) {
    System.out.println("Rejected: " + e.getMessage());    // recover: inform the user
} finally {
    System.out.println("Audit log written");              // always runs, even after return
}
~~~
Good practice: catch the most specific exception first, never swallow exceptions silently, and use **try-with-resources** for anything that must be closed (connections, files). In Spring, a {{RuntimeException}} rolls back a {{@Transactional}} method by default; a checked exception does not unless you configure {{rollbackFor}}.
+ 2 | Error vs Exception: meaning and examples | error, exception
+ 3 | Checked vs unchecked with examples; compile-time enforcement | checked, unchecked
+ 3 | Custom exception class, throws clause, try-catch-finally code | throws, finally
+ 2 | Good practice: specific catch, try-with-resources, or Spring rollback note | try-with-resources/rollback

## What are inheritance and polymorphism? Explain compile-time and run-time polymorphism with Java examples, and say why polymorphism is useful in an enterprise application.
@descriptive 10
**Inheritance** lets a class reuse and extend another class's state and behaviour ({{class SavingsAccount extends Account}}). It models an **is-a** relationship. Java allows single inheritance of classes but multiple inheritance of interfaces.

**Polymorphism** means one interface with many forms: the same call behaves differently depending on the type.

**1. Compile-time (static) polymorphism: method overloading.** The compiler picks the method from the argument types.
~~~java
class ReportService {
    byte[] export(Report r)                 { return export(r, Format.PDF); }
    byte[] export(Report r, Format f)       { /* ... */ return new byte[0]; }
    byte[] export(List<Report> rs, Format f){ /* ... */ return new byte[0]; }
}
~~~

**2. Run-time (dynamic) polymorphism: method overriding.** The JVM picks the method from the object's real class (dynamic dispatch).
~~~java
interface Notifier { void send(String to, String msg); }
class SmsNotifier implements Notifier   { public void send(String to, String msg) { /* SMS gateway */ } }
class EmailNotifier implements Notifier { public void send(String to, String msg) { /* SMTP */ } }

Notifier n = member.prefersSms() ? new SmsNotifier() : new EmailNotifier();
n.send(member.contact(), "Your installment is due");   // which send() runs is decided at run time
~~~

**Why it matters in an enterprise app:**
- **Extensibility:** add a {{WhatsAppNotifier}} without touching callers (open/closed principle).
- **Dependency injection:** Spring injects any implementation of an interface, for example a different payment gateway per environment.
- **Testability:** pass a mock {{Notifier}} in unit tests.
- **Less branching:** no {{if (type == …)}} chains spread across the code.

Prefer composition over deep inheritance trees. Inherit only when the is-a relationship is real.
+ 2 | Defines inheritance (is-a, extends, reuse) | inheritance, extends
+ 3 | Compile-time polymorphism = overloading, with example | overload
+ 3 | Run-time polymorphism = overriding/dynamic dispatch, with example | overrid, dispatch
+ 2 | Why useful: extensibility, DI, testability; composition caveat | extensib/test/inject
