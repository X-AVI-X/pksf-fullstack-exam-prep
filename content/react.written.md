## Explain the component lifecycle using hooks.
- **Mount**: function runs, JSX rendered, DOM committed, then {{useLayoutEffect}} and then {{useEffect}} callbacks run.
- **Update**: state/props/context change causes re-render; effects whose dependencies changed run their cleanup then the effect again.
- **Unmount**: cleanup functions run (clear timers, unsubscribe, abort fetches).
- Class equivalents: componentDidMount = effect with [], componentDidUpdate = effect with deps, componentWillUnmount = cleanup.
+ 1.5 | Mount: render, commit, then effects | mount
+ 1.5 | Update: re-render, effects rerun on dependency change | depend
+ 1.5 | Unmount: cleanup functions | cleanup
+ 1.5 | Mapping to class lifecycle methods | componentDidMount

## Write a custom hook {{useFetch}}.
~~~jsx
import { useEffect, useState } from "react";

export function useFetch(url, token) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  useEffect(() => {
    const ctrl = new AbortController();
    setState(s => ({ ...s, loading: true }));
    fetch(url, { signal: ctrl.signal, headers: { Authorization: "Bearer " + token } })
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(data => setState({ data, error: null, loading: false }))
      .catch(err => { if (err.name !== "AbortError") setState({ data: null, error: err, loading: false }); });
    return () => ctrl.abort();
  }, [url, token]);

  return state;
}

// usage
function PoList() {
  const { data, error, loading } = useFetch("/api/v1/partner-orgs", token);
  if (loading) return <p>Loading...</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return <ul>{data.content.map(po => <li key={po.id}>{po.name}</li>)}</ul>;
}
~~~
+ 2.5 | State for data, loading and error | loading, error
+ 2.5 | useEffect fetch keyed on url | useEffect
+ 2 | Cancellation/cleanup with AbortController | AbortController
+ 1 | Returns a clean API and checks res.ok | res.ok/return

## How do you optimise a slow React app?
- Measure first with React DevTools Profiler and Lighthouse.
- Avoid unnecessary renders: split components, lift state only as high as needed, React.memo + useCallback/useMemo for expensive children.
- Virtualise long lists (react-window); paginate on the server.
- Code split routes with React.lazy/Suspense; tree-shake; compress images.
- Cache server state with TanStack Query; debounce search inputs.
- Avoid creating context values inline that change every render.
+ 2 | Measure first (Profiler, Lighthouse) | Profiler
+ 2 | Avoid unnecessary renders (memo, state placement) | memo
+ 1.5 | Virtualise long lists / paginate | virtual
+ 1.5 | Code splitting with lazy/Suspense | lazy
+ 1 | Server-state caching, debouncing | debounce/Query

## How should a SPA store and send auth tokens securely?
- Prefer the Authorization Code + PKCE flow via Keycloak.
- Keep the access token in memory; avoid localStorage (readable by any XSS).
- Refresh token in an HttpOnly, Secure, SameSite cookie or use a backend-for-frontend (BFF) that holds tokens server-side.
- Attach tokens through an axios/fetch interceptor; on 401 refresh once, then redirect to login.
- Defend XSS: no dangerouslySetInnerHTML with user input, CSP header, dependency audits.
+ 2 | Authorization Code + PKCE | PKCE
+ 2 | Access token in memory, not localStorage (XSS) | memory, localStorage
+ 2 | Refresh token in HttpOnly cookie or BFF | HttpOnly/BFF
+ 1 | Interceptor with refresh-once on 401 | interceptor
+ 1 | XSS defences (CSP) | CSP

## Write a React form that creates a Partner Organisation and shows validation errors.
~~~jsx
function PoForm({ onSaved }) {
  const [form, setForm] = useState({ code: '', name: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    const err = {};
    if (!form.code.trim()) err.code = 'Code is required';
    if (form.name.trim().length < 3) err.name = 'At least 3 characters';
    setErrors(err); if (Object.keys(err).length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/v1/pos', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      onSaved(await res.json());
    } catch (x) { setErrors({ form: x.message }); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} noValidate>
      <label>Code <input name="code" value={form.code} onChange={change} aria-invalid={!!errors.code} /></label>
      {errors.code && <p role="alert">{errors.code}</p>}
      <label>Name <input name="name" value={form.name} onChange={change} aria-invalid={!!errors.name} /></label>
      {errors.name && <p role="alert">{errors.name}</p>}
      {errors.form && <p role="alert">{errors.form}</p>}
      <button disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
    </form>
  );
}
~~~
- Always validate on the server as well (Bean Validation), because client checks are for UX only.
+ 2 | Controlled inputs with state | useState
+ 2 | Client validation with per-field errors | error
+ 2 | Async submit with loading state and error handling | async, busy/loading
+ 1 | Accessibility (labels, aria-invalid, role=alert) | aria
+ 1 | Notes server-side validation | server

## Predict the output (JavaScript event loop).
@output 3 verified
~~~js
console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
queueMicrotask(() => console.log(5));
console.log(4);
~~~
**Output:** {{1 4 3 5 2}} (one per line)
- Synchronous code runs first (1, 4). Then **all microtasks** (promise callbacks and queueMicrotask, in FIFO order: 3, 5) run before the next **macrotask** (the setTimeout: 2).
+ 2 | Exact order 1 4 3 5 2 | 1 4 3 5 2
+ 1 | Microtasks drain before macrotasks | microtask


## Predict the output (var vs let in a loop with setTimeout).
@output 3 verified
~~~js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));
for (let k = 0; k < 3; k++) setTimeout(() => console.log(k));
~~~
**Output:** {{3 3 3 0 1 2}}
- {{var}} is function-scoped: one {{i}} is shared, and it is 3 when the callbacks run. {{let}} creates a **new binding per iteration**, so each closure captures its own k.
+ 2 | Exact output 3 3 3 0 1 2 | 3 3 3
+ 1 | Function scope vs per-iteration block scope with closures | closure/scope


## Predict the output (JavaScript equality and coercion).
@output 3 verified
~~~js
console.log(0 == "0", 0 === "0", null == undefined, null === undefined,
            typeof null, NaN === NaN, [1, 2] + [3], "5" - 2, "5" + 2);
~~~
**Output:** {{true false true false object false 1,23 3 52}}
- {{==}} coerces types and {{===}} does not. null == undefined only with loose equality. {{typeof null}} is "object" (a historic bug). NaN is never equal to itself (use Number.isNaN). Arrays + become strings ("1,2" + "3"). {{-}} converts to number, but {{+}} with a string concatenates.
+ 2 | Exact output | object, 1,23, 52
+ 1 | Explains coercion: == vs ===, + vs - | coerc


## Find the error: the counter increases by 1, not 2.
@bug 5
~~~jsx
function Counter() {
  const [count, setCount] = useState(0);
  const addTwo = () => { setCount(count + 1); setCount(count + 1); };
  return <button onClick={addTwo}>{count}</button>;
}
~~~
**Bug:** both calls read the same **stale** {{count}} captured by this render's closure. React batches the updates, so both set 0 + 1.

**Fix:** use the functional updater, which receives the latest queued state:
~~~jsx
const addTwo = () => { setCount(c => c + 1); setCount(c => c + 1); };
~~~
+ 1.5 | Identifies stale closure value | stale/closure
+ 1.5 | Explains batching / state not updated until re-render | batch
+ 2 | Functional updater fix | c => c + 1/prev


## What is the virtual DOM?
@short 2
An in-memory tree of React elements. On a state change, React renders a new tree, **diffs** it against the previous one (reconciliation, using keys for lists) and applies only the minimal real DOM changes.
+ 1 | In-memory representation of the UI | in-memory/tree
+ 1 | Diffing/reconciliation then minimal DOM updates | diff/reconcil
