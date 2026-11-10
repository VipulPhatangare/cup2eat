import { useEffect, useMemo, useRef, useState } from 'react';

const name = (i) => `f_${String(i + 1).padStart(4, '0')}.webp`;

/*
  Loads the WebP frame sequence for the scroll video.
  - frame 1 loads first: if it fails (folder missing) status becomes "failed" and the
    page falls back to the SVG cup
  - the rest load 8 at a time; the canvas always draws the nearest frame that is ready,
    so the animation works while the download is still finishing
  The decoded images live in a ref (not state) so loading never re-renders the page.
*/
export function useFrames(cfg, enabled) {
  const store = useRef({ imgs: [], ok: [], onProgress: null });
  const [status, setStatus] = useState(enabled && cfg?.count ? 'loading' : 'idle'); // idle | loading | failed

  useEffect(() => {
    if (!enabled || !cfg?.count) {
      setStatus('idle');
      return undefined;
    }
    let cancelled = false;
    const s = store.current;
    s.imgs = Array.from({ length: cfg.count });
    s.ok = Array.from({ length: cfg.count }, () => false);
    setStatus('loading');

    const load = (i) =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => { s.ok[i] = true; resolve(true); };
        img.onerror = () => resolve(false);
        img.src = cfg.dir + name(i);
        s.imgs[i] = img;
      });

    (async () => {
      if (!(await load(0))) {
        if (!cancelled) setStatus('failed');
        return;
      }
      s.onProgress?.();
      for (let i = 1; i < cfg.count && !cancelled; i += 8) {
        await Promise.all(Array.from({ length: Math.min(8, cfg.count - i) }, (_, k) => load(i + k)));
        s.onProgress?.();
      }
    })();

    return () => { cancelled = true; };
  }, [enabled, cfg?.dir, cfg?.count]);

  return useMemo(() => ({ store, status, count: cfg?.count || 0 }), [status, cfg?.count]);
}
