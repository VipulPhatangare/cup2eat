import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Btn, Field, inputCls } from '../ui';

export default function Login() {
  const { admin, loading, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex,nofollow';
    document.head.appendChild(m);
    document.title = 'Admin login · CUP2EAT';
    return () => m.remove();
  }, []);

  if (!loading && admin) return <Navigate to={loc.state?.from?.startsWith('/admin') ? loc.state.from : '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      nav(loc.state?.from?.startsWith('/admin') ? loc.state.from : '/admin', { replace: true });
    } catch (err) {
      setError(err.fields?.email || err.fields?.password || err.message);
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-svh place-items-center bg-deep px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <img src="/logo.png" alt="" width="64" height="64" className="mx-auto size-16 rounded-full ring-2 ring-gold/60" />
          <h1 className="mt-3 font-display text-3xl font-extrabold text-cream">CUP2EAT <span className="text-gold">Admin</span></h1>
        </div>
        <form onSubmit={submit} noValidate className="space-y-4 rounded-3xl bg-cream p-7 shadow-2xl">
          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus className={inputCls} />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={`${inputCls} pr-11`} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-choco/60 hover:bg-forest/10">
                {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </Field>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800">{error}</p>}
          <Btn type="submit" busy={busy} className="w-full">Log in</Btn>
          <p className="flex items-center justify-center gap-1.5 text-xs text-choco/55"><ShieldCheck className="size-4" /> Private area. Only for the CUP2EAT team.</p>
        </form>
      </div>
    </div>
  );
}
