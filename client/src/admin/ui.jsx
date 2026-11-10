import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';

// ---------- buttons ----------
const BTN = {
  primary: 'bg-forest text-cream hover:bg-deep',
  gold: 'bg-gold text-deep hover:bg-gold-soft',
  soft: 'bg-forest/10 text-forest hover:bg-forest/20',
  outline: 'border border-forest/25 text-forest hover:bg-forest/5',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  dangerSoft: 'bg-red-50 text-red-700 hover:bg-red-100',
};
export function Btn({ variant = 'primary', size = 'md', busy = false, className = '', children, ...p }) {
  const Comp = p.href ? 'a' : 'button';
  const pad = size === 'sm' ? 'min-h-9 px-3 text-[13px]' : 'min-h-11 px-5 text-sm';
  return (
    <Comp
      {...(Comp === 'button' && !p.type ? { type: 'button' } : {})}
      {...p}
      disabled={p.disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60 ${pad} ${BTN[variant]} ${className}`}
    >
      {busy && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Comp>
  );
}

// ---------- cards / badges ----------
export const Card = ({ className = '', children, ...p }) => (
  <div {...p} className={`rounded-2xl border border-forest/10 bg-white p-5 shadow-sm ${className}`}>{children}</div>
);

const TONES = {
  green: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-sky-100 text-sky-800',
  grey: 'bg-stone-200 text-stone-700',
  gold: 'bg-gold/25 text-choco',
};
export const Badge = ({ tone = 'grey', children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>{children}</span>
);

export function PageTitle({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold text-forest">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-choco/70">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-choco/60" role="status">
    <Loader2 className="size-5 animate-spin" /> {label}
  </div>
);

export const Empty = ({ title, text, children }) => (
  <div className="rounded-2xl border-2 border-dashed border-forest/20 bg-white/60 px-6 py-14 text-center">
    <p className="font-display text-xl font-bold text-forest">{title}</p>
    {text && <p className="mx-auto mt-1 max-w-sm text-sm text-choco/65">{text}</p>}
    {children && <div className="mt-4">{children}</div>}
  </div>
);

export const ErrorBox = ({ error, onRetry }) => (
  <div className="rounded-2xl bg-red-50 p-5 text-center text-sm text-red-800">
    {error?.message || 'Something went wrong.'}
    {onRetry && <button onClick={onRetry} className="ml-2 font-semibold underline">Try again</button>}
  </div>
);

// ---------- form fields ----------
export const inputCls = 'w-full rounded-xl border border-forest/20 bg-white px-3.5 py-2.5 text-sm text-choco placeholder:text-choco/40 focus:border-forest focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:bg-stone-100';

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-forest">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && !error && <span className="mt-1 block text-xs text-choco/55">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-700">{error}</span>}
    </label>
  );
}

export const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
    className="inline-flex items-center gap-2 text-sm font-medium text-forest"
  >
    <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-forest' : 'bg-stone-300'}`}>
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </span>
    {label}
  </button>
);

// ---------- pagination ----------
export function Pager({ page, pages, onPage }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-3 text-sm">
      <Btn variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="size-4" /></Btn>
      <span className="text-choco/70">Page {page} of {pages}</span>
      <Btn variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="size-4" /></Btn>
    </div>
  );
}

// ---------- modal + confirm ----------
export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-forest">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-forest/10"><X className="size-5" /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// const ok = await confirm({ title, text, action: 'Delete', danger: true })
const ConfirmCtx = createContext(() => Promise.resolve(false));
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);
  const confirm = useCallback((opts) => new Promise((resolve) => { resolver.current = resolve; setState(opts); }), []);
  const close = (v) => { resolver.current?.(v); resolver.current = null; setState(null); };
  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Modal open={!!state} onClose={() => close(false)} title={state?.title || 'Are you sure?'}>
        <p className="text-sm text-choco/80">{state?.text}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Btn variant="outline" onClick={() => close(false)}>Cancel</Btn>
          <Btn variant={state?.danger ? 'danger' : 'primary'} onClick={() => close(true)}>{state?.action || 'Yes'}</Btn>
        </div>
      </Modal>
    </ConfirmCtx.Provider>
  );
}
export const useConfirm = () => useContext(ConfirmCtx);

// ---------- helpers ----------
export const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '');
const fmtDay = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '');
export function ago(d) {
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return fmtDay(d);
}
// <input type="datetime-local"> wants local time without a zone
export const toLocalInput = (d) => {
  if (!d) return '';
  const x = new Date(d);
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// a tiny useEffect-based loader for admin lists: { data, loading, error, reload }
export function useLoad(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    loader().then((data) => live && setState({ data, loading: false, error: null })).catch((error) => live && setState({ data: null, loading: false, error }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: useCallback(() => setTick((t) => t + 1), []), setData: (data) => setState((s) => ({ ...s, data })) };
}
