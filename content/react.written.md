## Explain the component lifecycle using hooks.
- **Mount**: function runs, JSX rendered, DOM committed, then {{useLayoutEffect}} and then {{useEffect}} callbacks run.
- **Update**: state/props/context change causes re-render; effects whose dependencies changed run their cleanup then the effect again.
- **Unmount**: cleanup functions run (clear timers, unsubscribe, abort fetches).
- Class equivalents: componentDidMount = effect with [], componentDidUpdate = effect with deps, componentWillUnmount = cleanup.
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
## How do you optimise a slow React app?
- Measure first with React DevTools Profiler and Lighthouse.
- Avoid unnecessary renders: split components, lift state only as high as needed, React.memo + useCallback/useMemo for expensive children.
- Virtualise long lists (react-window); paginate on the server.
- Code split routes with React.lazy/Suspense; tree-shake; compress images.
- Cache server state with TanStack Query; debounce search inputs.
- Avoid creating context values inline that change every render.
## How should a SPA store and send auth tokens securely?
- Prefer the Authorization Code + PKCE flow via Keycloak.
- Keep the access token in memory; avoid localStorage (readable by any XSS).
- Refresh token in an HttpOnly, Secure, SameSite cookie or use a backend-for-frontend (BFF) that holds tokens server-side.
- Attach tokens through an axios/fetch interceptor; on 401 refresh once, then redirect to login.
- Defend XSS: no dangerouslySetInnerHTML with user input, CSP header, dependency audits.


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
