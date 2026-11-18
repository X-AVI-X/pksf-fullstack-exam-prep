## Components, templates and data binding
An Angular component is a class with a decorator and a template. Interpolation {{ value }} shows data, property binding [prop]="value" sets a property, event binding (click)="save()" reacts to events, and two-way binding [(ngModel)] keeps a form field and a property in sync.

Modern Angular uses standalone components and signals for state. A signal holds a value and notifies readers when it changes.

@check
Q: Which binding sends a button click to a method in the component class?
- {{ save() }}
- [click]="save()"
* (click)="save()"
- [(click)]="save()"
E: Parentheses on the event name make it event binding. Interpolation displays values, and square brackets set properties.

## Dependency injection and services
Angular injects services into components through their constructors or the inject() function. A service decorated with @Injectable({ providedIn: 'root' }) is a single shared instance for the app. Put data access and business logic in services, and keep components thin.

@check
Q: Where should an HTTP call to load a loan list live, in a good Angular design?
- Directly in the template
* In a service that the component injects
- In a global variable in index.html
- Copied into every component
E: A service centralises data access, can be tested alone and is shared where needed. Components stay focused on the view.

## RxJS: observables and operators
An Observable emits a stream of values over time. HttpClient returns observables, and you subscribe or use the async pipe in templates. Operators such as map, filter, debounceTime and switchMap transform the stream. switchMap cancels the previous inner request when a new value arrives, which suits search boxes.

@check
Q: A search box sends a request on each keystroke. Which operator cancels the earlier request when a new one starts?
- map
- filter
* switchMap
- merge
E: switchMap unsubscribes from the previous inner observable when a new value arrives, so only the latest search result is used. debounceTime also helps by waiting for typing to pause.

## Forms and accessibility in Material UI
Reactive forms define the form model in code, and validators check the values. Show validation messages next to the field and connect them with labels, so screen readers announce them. Angular Material components follow the Material Design guidelines and include keyboard support, but you still need labels, focus order and sufficient colour contrast.

@check
Q: What makes a form field accessible to a screen reader?
- Placeholder text only, with no label
* A visible label linked to the input, with error text announced
- A red border with no text
- A tooltip on hover only
E: Placeholders disappear when the user types and are not reliably read. A linked label and announced error text give the field a name and a problem description.
