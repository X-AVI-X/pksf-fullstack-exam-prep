## The SDLC and its models
The software development life cycle is the sequence of activities from requirements to maintenance: requirements, design, implementation, testing, deployment and maintenance. The waterfall model runs these phases in order. Agile iterates in short cycles, delivering working software each sprint and adapting to change.

@check
Q: Which model suits a project whose requirements are expected to change often during delivery?
- Waterfall, because phases are fixed in order
* Agile, because short iterations take in change and deliver working software often
- Big bang, with no testing
- Sequential with no feedback
E: Agile's short iterations and feedback loops handle changing requirements. Waterfall assumes the requirements are stable before design starts.

## SOLID principles
SOLID is five principles for maintainable object-oriented design. Single responsibility: a class has one reason to change. Open/closed: open for extension, closed for modification. Liskov substitution: a subtype can replace its base type without breaking behaviour. Interface segregation: many small interfaces beat one large one. Dependency inversion: depend on abstractions, not concrete classes.

@check
Q: A new discount type is added by editing an existing pricing class's if-chain. Which principle is broken?
- Single responsibility only
* Open/closed, because the class is modified rather than extended
- Liskov substitution
- Interface segregation
E: Open/closed says new behaviour should be added by extension, such as a new strategy class, without changing tested code.

## Design patterns in brief
Creational patterns create objects: Singleton, Factory, Builder. Structural patterns compose objects: Adapter, Decorator, Facade. Behavioural patterns coordinate behaviour: Strategy, Observer, Template Method. Name the pattern only when it solves the problem in the question, and say what problem it solves.

@check
Q: Which pattern lets you choose an algorithm at run time behind a common interface?
- Singleton
- Adapter
* Strategy
- Builder
E: Strategy encapsulates interchangeable algorithms behind one interface and selects one at run time.

## Testing theory: black-box and white-box
Black-box testing checks behaviour against the specification without looking at the code. White-box testing uses the code's structure, such as covering branches. Boundary value analysis and equivalence partitioning are black-box techniques. Cyclomatic complexity tells you how many independent paths need tests, which is a white-box measure.

@check
Q: Which technique is black-box rather than white-box?
- Statement coverage
- Branch coverage
- Cyclomatic complexity
* Boundary value analysis
E: Boundary value analysis is derived from the input specification. Coverage and complexity measures depend on the code's structure.
