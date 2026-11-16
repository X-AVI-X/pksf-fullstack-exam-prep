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
