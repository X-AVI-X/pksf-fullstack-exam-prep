## Angular vs React?
- **Angular**: full framework (router, forms, HttpClient, DI, testing) in TypeScript, opinionated structure, RxJS, great for large enterprise teams wanting consistency.
- **React**: UI library; you choose router, state, data-fetching; JSX; huge ecosystem; flexible, lighter learning curve.
- Both are component-based and support SPAs; the ToR accepts either. Show you can work in both: components, state, forms, HTTP + interceptors, guards/protected routes, and testing.
+ 2 | Angular: full framework, TypeScript, DI, RxJS | framework, DI
+ 2 | React: library, JSX, choose your own ecosystem | library, JSX
+ 2 | Similarities and when to choose which | when/both

## How would you build a reusable component library following Material Design?
@descriptive 8
- Base it on Angular Material or MUI; define a **theme** (colour roles, typography scale, 8dp spacing, shape, elevation) once.
- Build composite components on top: {{DataTable}} (server-side pagination/sort/filter), {{FormField}} with validation messages, {{ConfirmDialog}}, {{FileUpload}} with progress, {{StatusChip}}.
- Props/inputs for content, events for actions; no business logic inside.
- Accessibility (labels, focus, keyboard, contrast), responsive behaviour, loading/empty/error states.
- Document in Storybook; unit-test; version the library.
+ 2 | Theme and design tokens on Angular Material/MUI | theme
+ 2 | Composite reusable components with inputs/outputs, no business logic | input/props
+ 2 | Accessibility and responsive behaviour | accessib
+ 2 | Documentation (Storybook), tests and versioning | Storybook

## How do Angular components communicate?
- Parent to child: {{@Input()}} (or signal inputs).
- Child to parent: {{@Output() saved = new EventEmitter<Po>()}}.
- Template reference / {{@ViewChild}} for direct access.
- Unrelated components: a shared {{@Injectable}} service holding a {{BehaviorSubject}} or signal.
- App-wide state: NgRx for complex flows.
+ 2 | @Input parent to child | @Input
+ 2 | @Output EventEmitter child to parent | @Output
+ 2 | Shared service with BehaviorSubject/signals for unrelated components | service
+ 2 | ViewChild and NgRx for app-wide state | ViewChild/NgRx

## Write an Angular service and component that lists Partner Organisations from a REST API.
~~~ts
@Injectable({ providedIn: 'root' })
export class PoService {
  private http = inject(HttpClient);
  list(): Observable<Po[]> { return this.http.get<Po[]>('/api/v1/pos'); }
  create(po: Po) { return this.http.post<Po>('/api/v1/pos', po); }
}

@Component({
  selector: 'app-po-list', standalone: true,
  imports: [AsyncPipe, MatTableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pos$ | async; as pos) {
      <table mat-table [dataSource]="pos">
        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let p">{{ p.name }}</td></ng-container>
        <tr mat-header-row *matHeaderRowDef="['name']"></tr>
        <tr mat-row *matRowDef="let r; columns: ['name']"></tr>
      </table>
    } @else { <mat-spinner /> }`
})
export class PoListComponent { pos$ = inject(PoService).list(); }
~~~
- An HTTP interceptor (provideHttpClient(withInterceptors([authInterceptor]))) adds the Bearer token, and a route guard protects the page.
+ 2.5 | Injectable service using HttpClient returning Observable | HttpClient, Observable
+ 2.5 | Component consumes with async pipe (no manual subscribe leak) | async
+ 2 | Material table/loading state | mat-table
+ 1 | Interceptor/guard for auth | interceptor

## What is an Angular service, and what does providedIn: 'root' do?
@short 2
A service is an {{@Injectable}} class holding reusable logic or state (HTTP calls, caching) that Angular injects with DI. {{providedIn: "root"}} registers one **singleton** for the whole app and makes it tree-shakable if unused.
+ 1 | Service = injectable reusable logic via DI | inject
+ 1 | root = app-wide singleton, tree-shakable | singleton


## Write a component specification for a reusable Material data table used across PKSF apps.
@descriptive 8
**Component:** {{<pksf-data-table>}} (Angular, on Angular Material {{mat-table}} + {{mat-paginator}} + {{mat-sort}})
- **Purpose:** list server-side data (POs, loans, reports) with consistent paging, sorting, filtering and states.
- **Inputs:** {{columns: ColumnDef[]}} (key, header, type: text/number/money/date/status, sortable), {{data: Page<T>}}, {{loading: boolean}}, {{error?: string}}, {{pageSizeOptions = [10, 25, 50]}}, {{selectable = false}}.
- **Outputs:** {{pageChange({page, size})}}, {{sortChange({active, direction})}}, {{rowClick(T)}}, {{selectionChange(T[])}}.
- **States:** loading skeleton, empty ("No records"), error with retry, data.
- **Behaviour:** no business logic and no HTTP inside: the parent fetches. Money is right-aligned and formatted in BDT; dates use the locale format.
- **Accessibility:** a real {{<table>}} with headers, sortable headers announce direction ({{aria-sort}}), keyboard row activation, 4.5:1 contrast.
- **Responsive:** below 600 px, rows collapse to cards ({{BreakpointObserver}}).
- **Theming:** uses Material design tokens only.
- **Quality:** documented in Storybook (every state), unit tests with component harnesses, semantic versioning with a changelog.
+ 2 | Clear inputs and outputs (API of the component) | input, output
+ 2 | States: loading, empty, error, data | empty, error
+ 2 | Accessibility and responsive behaviour | aria, responsive/Breakpoint
+ 1 | Separation: no business logic or HTTP inside | business logic
+ 1 | Documentation/testing/versioning (Storybook, harness) | Storybook
