import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { CheckCircle2, ImagePlus, Trash2, X } from 'lucide-react';
import Button from '../ui/Button';
import { StarInput } from '../ui/Stars';
import { api } from '../../api/client';
import { useProducts, useToast } from '../../context/AppContext';

const TYPES = [
  ['Cafe', 'Café / Restaurant'],
  ['Event', 'Event / Celebration'],
  ['Corporate', 'Corporate'],
  ['College', 'College / School'],
  ['Personal', 'Personal'],
];
const MAX_PHOTOS = 3;
const EMPTY = { name: '', city: '', customerType: 'Personal', product: '', flavour: '', rating: 0, text: '' };

export default function ReviewModal({ open, onClose }) {
  const { products } = useProducts();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState([]); // [{ file, url }]
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const firstField = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const flavours = products.find((p) => p._id === form.product)?.flavours || [];

  useEffect(() => {
    if (!open) return undefined;
    setDone(false);
    setErrors({});
    const t = setTimeout(() => firstField.current?.focus(), 80);
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // free the preview URLs only when the component goes away (not on every change,
  // or the thumbnails that are still on screen would break)
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const addPhotos = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const room = MAX_PHOTOS - photos.length;
    if (picked.length > room) toast(`You can add up to ${MAX_PHOTOS} photos.`, 'error');
    const ok = picked.slice(0, room).filter((f) => {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { toast(`"${f.name}" is not a JPG, PNG or WebP photo.`, 'error'); return false; }
      return true;
    });
    setPhotos((cur) => [...cur, ...ok.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };

  const removePhoto = (i) =>
    setPhotos((cur) => {
      URL.revokeObjectURL(cur[i].url);
      return cur.filter((_, idx) => idx !== i);
    });

  const submit = async (e) => {
    e.preventDefault();
    const local = {};
    if (form.name.trim().length < 2) local.name = 'Please enter your name';
    if (!form.rating) local.rating = 'Pick a star rating';
    if (form.text.trim().length < 10) local.text = 'Please write at least 10 characters';
    if (Object.keys(local).length) { setErrors(local); return; }

    setBusy(true);
    setErrors({});
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => v !== '' && v !== 0 && data.append(k, v));
      // shrink photos in the browser first (fast on mobile data, stays under the 2 MB limit)
      for (const [i, { file }] of photos.entries()) {
        const small = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1400, useWebWorker: true, fileType: 'image/webp' });
        data.append('photos', small, `photo-${i + 1}.webp`);
      }
      await api.postForm('/reviews', data);
      setDone(true);
      setForm(EMPTY);
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      setPhotos([]);
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const input = 'mt-1 w-full rounded-xl border border-forest/20 bg-white px-4 py-3 text-choco placeholder:text-choco/40 focus:border-forest focus:outline-none focus:ring-2 focus:ring-gold/50';
  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-sm text-red-700">{errors[k]}</p> : null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 sm:items-center sm:p-4"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="review-title"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            className="max-h-[94svh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-cream p-6 shadow-2xl sm:rounded-[2rem] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="review-title" className="font-display text-2xl font-bold text-forest sm:text-3xl">Share your experience</h3>
                <p className="mt-1 text-sm text-choco/70">Your review appears after our team approves it.</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-forest/10"><X className="size-6" /></button>
            </div>

            {done ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto size-16 text-forest" />
                <p className="mt-4 font-display text-2xl font-bold text-forest">Thank you!</p>
                <p className="mt-2 text-choco/75">Your review is with our team. It will show up here once approved.</p>
                <Button className="mt-6" onClick={onClose}>Close</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rv-name" className="text-sm font-medium">Your name *</label>
                    <input id="rv-name" ref={firstField} value={form.name} onChange={set('name')} autoComplete="name" maxLength={60} className={input} />
                    <Err k="name" />
                  </div>
                  <div>
                    <label htmlFor="rv-city" className="text-sm font-medium">City</label>
                    <input id="rv-city" value={form.city} onChange={set('city')} autoComplete="address-level2" maxLength={60} className={input} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rv-type" className="text-sm font-medium">I am a…</label>
                    <select id="rv-type" value={form.customerType} onChange={set('customerType')} className={input}>
                      {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rv-product" className="text-sm font-medium">Which cup?</label>
                    <select id="rv-product" value={form.product} onChange={(e) => setForm((f) => ({ ...f, product: e.target.value, flavour: '' }))} className={input}>
                      <option value="">Not sure / general</option>
                      {products.map((p) => <option key={p._id} value={p._id}>{p.capacityMl} ml</option>)}
                    </select>
                  </div>
                </div>

                {flavours.length > 0 && (
                  <div>
                    <label htmlFor="rv-flavour" className="text-sm font-medium">Flavour</label>
                    <select id="rv-flavour" value={form.flavour} onChange={set('flavour')} className={input}>
                      <option value="">Any</option>
                      {flavours.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium">Your rating *</span>
                  <StarInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
                  <Err k="rating" />
                </div>

                <div>
                  <label htmlFor="rv-text" className="text-sm font-medium">Your review *</label>
                  <textarea id="rv-text" rows={4} maxLength={600} value={form.text} onChange={set('text')} placeholder="How were the cups? How did your customers or guests react?" className={input} />
                  <div className="flex justify-between">
                    <Err k="text" />
                    <span className="ml-auto text-xs text-choco/50">{form.text.length}/600</span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium">Photos (optional, up to {MAX_PHOTOS})</span>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {photos.map((p, i) => (
                      <div key={p.url} className="relative size-20 overflow-hidden rounded-xl ring-1 ring-forest/20">
                        <img src={p.url} alt={`Selected photo ${i + 1}`} className="size-full object-cover" />
                        <button type="button" onClick={() => removePhoto(i)} aria-label={`Remove photo ${i + 1}`} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-white"><Trash2 className="size-3.5" /></button>
                      </div>
                    ))}
                    {photos.length < MAX_PHOTOS && (
                      <label className="grid size-20 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-forest/30 text-forest transition hover:bg-forest/5 focus-within:outline-2 focus-within:outline-gold">
                        <ImagePlus className="size-7" />
                        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} className="sr-only" aria-label="Add photos" />
                      </label>
                    )}
                  </div>
                </div>

                <Button type="submit" variant="forest" disabled={busy} className="w-full">{busy ? 'Submitting…' : 'Submit review'}</Button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
