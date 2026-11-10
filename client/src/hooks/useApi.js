import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

// GET helper: { data, loading, error, reload }
export function useApi(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return undefined;
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(path, { signal: ctrl.signal })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ data: null, loading: false, error });
      });
    return () => ctrl.abort();
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

// live countdown to a date → { d, h, m, s, done }
export function useCountdown(endsAt) {
  const calc = () => Math.max(0, new Date(endsAt).getTime() - Date.now());
  const [ms, setMs] = useState(calc);

  useEffect(() => {
    if (!endsAt) return undefined;
    setMs(calc());
    const id = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: ms <= 0 };
}
