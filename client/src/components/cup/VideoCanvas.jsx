import { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValueEvent } from 'framer-motion';

// desktop: the 16:9 video sits on the right and melts into the page on its left / top / bottom edges
const MASK_DESKTOP = 'linear-gradient(to right, transparent 0%, #000 14%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)';
// phone: the video is shown as a window over the top half of the screen; the bottom fades into the text area
const MASK_MOBILE = 'linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)';

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

// linear interpolation over keyframes: keys ascending (0..1), vals same length
function lerpKeys(t, keys, vals) {
  if (!Array.isArray(vals)) return vals;
  if (t <= keys[0]) return vals[0];
  for (let i = 1; i < keys.length; i += 1) {
    if (t <= keys[i]) {
      const k = (t - keys[i - 1]) / (keys[i] - keys[i - 1] || 1);
      return vals[i - 1] + (vals[i] - vals[i - 1]) * k;
    }
  }
  return vals[vals.length - 1];
}

/*
  Draws the video frame that matches the scroll position.
  `index` is a MotionValue holding a (fractional) frame number. We draw the frame below it
  and cross-blend the next one by the fraction, which keeps slow scrolling smooth even
  though the source is only 10-12 frames per second.

  mode "desktop": the whole 16:9 frame, right-aligned.
  mode "mobile":  a window cut out of the frame ("cover" fit) so the cup can be centred on a phone.
     view = { x, y, zoom, beats }
       x     horizontal centre of the window in the video, 0-1. A number, or an array (same length
             as `beats`) so the window can pan to follow the action.
       y     vertical centre of the window, 0-1
       zoom  1 = as much of the frame as fits the window, 1.2 = 20% closer
       beats frame fractions (0-1) that the x array belongs to
*/
export default function VideoCanvas({ frames, index, opacity, mode = 'desktop', view = {} }) {
  const canvasRef = useRef(null);
  const raf = useRef(0);
  const mobile = mode === 'mobile';

  const render = useCallback(() => {
    raf.current = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const { imgs, ok } = frames.store.current;
    const f = clamp(index.get(), 0, frames.count - 1);
    const a = Math.floor(f);
    let i = a;
    while (i > 0 && !ok[i]) i -= 1; // frames load in order: use the nearest one that is ready
    if (!ok[i]) return;
    const ctx = canvas.getContext('2d');

    // where the window sits for this moment of the clip
    const t = f / Math.max(1, frames.count - 1);
    const cx = lerpKeys(t, view.beats || [0, 1], view.x ?? 0.5);
    const cy = view.y ?? 0.5;
    const zoom = Math.max(1, view.zoom || 1);

    const paint = (img) => {
      if (!mobile) {
        ctx.drawImage(img, 0, 0, w, h);
        return;
      }
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const aspect = w / h;
      // largest source rectangle with the window's shape, then zoomed in
      let sw = aspect < iw / ih ? ih * aspect : iw;
      let sh = aspect < iw / ih ? ih : iw / aspect;
      sw /= zoom;
      sh /= zoom;
      const sx = clamp(cx * iw - sw / 2, 0, iw - sw);
      const sy = clamp(cy * ih - sh / 2, 0, ih - sh);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    };

    ctx.globalAlpha = 1;
    paint(imgs[i]);
    const frac = f - a;
    const b = Math.min(a + 1, frames.count - 1);
    if (i === a && b !== a && frac > 0.03 && ok[b]) {
      ctx.globalAlpha = frac;
      paint(imgs[b]);
      ctx.globalAlpha = 1;
    }
  }, [frames, index, mobile, view]);

  const schedule = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(render);
  }, [render]);

  useMotionValueEvent(index, 'change', schedule);

  useEffect(() => {
    const s = frames.store.current;
    s.onProgress = schedule; // redraw when more frames finish loading
    schedule();
    window.addEventListener('resize', schedule);
    return () => {
      s.onProgress = null;
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [frames, schedule]);

  const mask = mobile ? MASK_MOBILE : MASK_DESKTOP;
  return (
    <motion.div
      aria-hidden="true"
      className={mobile ? 'pointer-events-none absolute inset-x-0 top-0 h-[56%] [@media(max-height:700px)]:h-[42%]' : 'pointer-events-none absolute right-0 top-1/2 -translate-y-1/2'}
      style={{
        opacity,
        ...(mobile ? {} : { width: 'min(72vw, calc((100svh - 4rem) * 16 / 9))', aspectRatio: '16 / 9' }),
        WebkitMaskImage: mask,
        maskImage: mask,
        ...(mobile ? {} : { WebkitMaskComposite: 'source-in', maskComposite: 'intersect' }),
      }}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </motion.div>
  );
}
