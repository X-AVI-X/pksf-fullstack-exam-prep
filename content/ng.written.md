## Angular vs React?
- **Angular**: full framework (router, forms, HttpClient, DI, testing) in TypeScript, opinionated structure, RxJS, great for large enterprise teams wanting consistency.
- **React**: UI library; you choose router, state, data-fetching; JSX; huge ecosystem; flexible, lighter learning curve.
- Both are component-based and support SPAs; the ToR accepts either. Show you can work in both: components, state, forms, HTTP + interceptors, guards/protected routes, and testing.
## How would you build a reusable component library following Material Design?
- Base it on Angular Material or MUI; define a **theme** (colour roles, typography scale, 8dp spacing, shape, elevation) once.
- Build composite components on top: {{DataTable}} (server-side pagination/sort/filter), {{FormField}} with validation messages, {{ConfirmDialog}}, {{FileUpload}} with progress, {{StatusChip}}.
- Props/inputs for content, events for actions; no business logic inside.
- Accessibility (labels, focus, keyboard, contrast), responsive behaviour, loading/empty/error states.
- Document in Storybook; unit-test; version the library.
## How do Angular components communicate?
- Parent to child: {{@Input()}} (or signal inputs).
- Child to parent: {{@Output() saved = new EventEmitter<Po>()}}.
- Template reference / {{@ViewChild}} for direct access.
- Unrelated components: a shared {{@Injectable}} service holding a {{BehaviorSubject}} or signal.
- App-wide state: NgRx for complex flows.


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
