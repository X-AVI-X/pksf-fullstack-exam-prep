## How class-design questions are asked
Bank and finance papers love one class-design question, nearly always about a bank account:
- **Combined Bank SO-IT 2025:** write a BankAccount class with private data, deposit, withdraw that checks the balance, and display. Show encapsulation.
- **Bangladesh Bank AP 2023:** given classes A and B, identify which methods are overloaded, overridden and hidden.
- **SPCBL 2022:** the difference between exception and error, with an example of handling.

The answer structure for "write a class":
1. Fields private, and final where they never change. That is the encapsulation mark.
2. A constructor that validates, rejecting a null holder or a negative opening balance.
3. Behaviour methods, not setters: deposit and withdraw, never setBalance.
4. Rules inside the methods: amount > 0, and withdraw checks the balance. Throw an exception; don't print and carry on.
5. Money as BigDecimal. Double is wrong for money, because 0.1 + 0.2 is not 0.3.
6. A short main that shows a deposit, a withdrawal and a rejected withdrawal, with the output.

@check
Q: In a BankAccount class, which design best shows encapsulation?
- A public double balance field that callers update directly
* Private balance, with deposit() and withdraw() methods that enforce the rules
- A public setBalance(double) setter that accepts any value
- A static balance shared by all accounts
E: Encapsulation hides the state and exposes controlled behaviour. The methods can enforce the rules; a public field or a plain setter cannot.

## Hierarchies: abstract classes and polymorphism
Hierarchy questions expect a shape like this:

~~~java
abstract class Account {                         // common state and the rule flow
    protected double balance;
    public final void withdraw(double amt) {     // same flow for every account
        if (!canWithdraw(amt)) throw new IllegalStateException("insufficient funds");
        balance -= amt;
    }
    protected abstract boolean canWithdraw(double amt);  // each subclass decides
}
class SavingsAccount extends Account { /* minimum balance, interest */ }
class CurrentAccount extends Account { /* overdraft limit */ }
~~~

A List<Account> with a loop that calls a.withdraw(...) is your runtime polymorphism example. Say that out loud in the answer.

@check
Q: A List<Account> holds SavingsAccount and CurrentAccount objects, and the loop calls a.withdraw(500). Which mechanism decides which canWithdraw rule runs?
- Overloading, chosen at compile time
- Hiding, chosen by the reference type
* Overriding, chosen at run time by the object's actual class
- Encapsulation, which hides the rule
E: Overriding is resolved at run time by the object's class, so each subclass's canWithdraw is used even though the call site only knows the type Account.

## Overloading, overriding and hiding
| | Overloading | Overriding | Hiding |
|---|---|---|---|
| Methods | same name, different parameters | same signature, instance method in a subclass | same signature, static method (or any field) in a subclass |
| Chosen | at compile time | at run time, by the object's class | at compile time, by the reference's type |
| A ref = new B(); | not applicable | ref.hello() runs B's version | ref.who() and ref.name run A's version |

@check
Q: class A { static String who() {return "A";} } and class B extends A { static String who() {return "B";} }. What does A ref = new B(); ref.who() print?
- B, because the object is a B
- An error, because static methods can't be redefined
* A, because static methods are hidden and chosen by the reference type
- A compile error about overloading
E: Static methods are hidden, not overridden. The method is chosen by the declared type of the reference, A, so the output is A.

## Traps
- **Util u = null; u.count** with a static field prints the value, because static members belong to the class. u.size, an instance field, throws NullPointerException.
- **new int[0]** is legal, with length 0. Reading a[0] throws ArrayIndexOutOfBoundsException.
- **A subclass method with a different parameter type** overloads rather than overrides. Add @Override and the compiler catches the mistake.
- **finally** runs even after return.

@check
Q: Which statement about exceptions is correct?
- An Error such as OutOfMemoryError is normally caught and handled in application code
* An Exception is recoverable and may be caught; an Error signals a serious problem that code usually should not catch
- finally runs only when no exception occurs
- Checked exceptions are never declared in method signatures
E: Exceptions are conditions an application can reasonably handle. Errors are serious JVM-level problems. finally runs whether or not an exception occurs, even after return.
