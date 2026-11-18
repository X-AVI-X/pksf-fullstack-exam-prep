## The four ideas of object-oriented design
Object-oriented design rests on four ideas:
- **Encapsulation:** keep state private and expose behaviour through methods that protect the rules.
- **Abstraction:** show what an object does, and hide how.
- **Inheritance:** a subclass reuses and extends a superclass (an is-a relationship).
- **Polymorphism:** one call behaves differently depending on the object's actual class.

Most questions test one of these by name, so state which one you are using in your answer.

@check
Q: A method takes an Account reference, and calls withdraw() on a SavingsAccount or a CurrentAccount. Which principle is this?
- Encapsulation
- Inheritance only
* Polymorphism
- Abstraction of the database
E: One call on a supertype reference runs the subclass's own behaviour. That is polymorphism.

## Overloading and overriding
Overloading means one name with different parameter lists in the same class, decided at compile time. Overriding means a subclass gives its own version of an instance method with the same signature, decided at run time by the object's class. Add @Override so the compiler checks you really overrode the method.

@check
Q: Which pair is overriding rather than overloading?
- print(int) and print(String) in the same class
* An instance method toString() redefined in a subclass with the same signature
- Two constructors with different parameters
- Two static methods with different names
E: Overriding keeps the same signature in a subclass. Overloading changes the parameters in the same class.

## Constructors, this and super
A constructor sets up a new object and has the class name with no return type. Use this(...) to call another constructor of the same class, and super(...) to call the superclass constructor. The superclass constructor runs first, always.

Validate inputs in constructors so an object can never start in an invalid state.

@check
Q: In a subclass constructor, which statement must come first?
- The field assignments
* The call to super(...) or this(...), which runs first
- A print statement
- A return statement
E: Java requires the superclass part to be built first, so an explicit super or this call must be the first statement if it is written.

## Coupling and cohesion in class design
Good classes have high cohesion, meaning one clear responsibility, and low coupling, meaning they depend on abstractions rather than details. Program to an interface: a service that depends on a PaymentGateway interface can swap in a test double or a different provider without changes.

@check
Q: Which design change lowers coupling?
- Making a class depend directly on a concrete database class
* Having a class depend on an interface it can receive from outside
- Putting every method in one class
- Making all fields public
E: Depending on an interface allows the implementation to change without touching the dependent class. Dependence on a concrete class ties them together.
