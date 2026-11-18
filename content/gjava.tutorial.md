### How it is asked
Bank and finance papers love one class-design question, nearly always about a bank account:

- **Combined Bank SO-IT 2025:** write a {{BankAccount}} class with private data, deposit, withdraw that checks the balance, and display, and show encapsulation.
- **6 Banks AP 2021:** a C++ account hierarchy with savings and current accounts. Write it in Java for PKSF.
- **Bangladesh Bank sample:** an "Overdraft Account (OD)" class.
- **Bangladesh Bank AP 2023:** given classes A and B, identify which methods are **overloaded, overridden and hidden**.
- **Combined Bank AP 2024 MCQs:** the output of Java code that reads a field through a null reference, and what interfaces are for.
- **SPCBL 2022:** the difference between exception and error, and exception handling with an example.

### The answer structure for "write a class"
1. **Fields private** (and {{final}} where they never change). That is the encapsulation mark.
2. **A constructor that validates**, rejecting a null holder or a negative opening balance.
3. **Behaviour methods, not setters:** {{deposit}} and {{withdraw}}, never {{setBalance}}. Mention this choice in one sentence.
4. **Rules inside the methods:** amount > 0, and withdraw checks the balance (or the overdraft limit). Throw an exception; don't print and carry on.
5. **Money as {{BigDecimal}}**, with one line on why {{double}} is wrong for money (0.1 + 0.2 ≠ 0.3).
6. **A short {{main}}** that shows a deposit, a withdrawal and a rejected withdrawal, with the output.

### Hierarchy questions: the shape examiners expect
~~~java
abstract class Account {                    // common state and the template
    public final void withdraw(double amt) {   // same rule flow for all
        if (!canWithdraw(amt)) throw new IllegalStateException("...");
        balance -= amt;
    }
    protected abstract boolean canWithdraw(double amt);  // each subclass decides
}
class SavingsAccount extends Account { /* minimum balance, interest */ }
class CurrentAccount extends Account { /* overdraft limit */ }
~~~
Then {{List<Account>}} plus a loop calling {{a.withdraw(...)}} is your **runtime polymorphism** example. Say that out loud in the answer.

### Overloading, overriding, hiding: the rule table
| | Overloading | Overriding | Hiding |
|---|---|---|---|
| Methods | same name, **different parameters** | same signature, **instance** method in a subclass | same signature, **static** method (or any field) in a subclass |
| Chosen | at compile time | at run time, by the **object's** class | at compile time, by the **reference's** type |
| {{A ref = new B();}} | — | {{ref.hello()}} → B's version | {{ref.who()}} and {{ref.name}} → A's version |

### Traps
- **{{Util u = null; u.count}}** (a static field) prints the value; there is no NullPointerException, because static members belong to the class. {{u.size}} (an instance field) throws a NullPointerException.
- **{{new int[0]}}** is legal: length 0, and {{a[0]}} throws {{ArrayIndexOutOfBoundsException}}.
- **A subclass method with a different parameter type** overloads; it doesn't override. Add {{@Override}} and the compiler catches the mistake.
- **{{finally}}** runs even after {{return}}.
