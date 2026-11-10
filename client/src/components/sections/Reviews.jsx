import { Suspense, lazy, useCallback, useState } from 'react';
import { PenLine } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import Lightbox from '../ui/Lightbox';
import { Stars } from '../ui/Stars';
// loaded on demand: pulls in the image-compression library only when someone writes a review
const ReviewModal = lazy(() => import('./ReviewModal'));
import MiniCup from '../cup/MiniCup';
import { useApi } from '../../hooks/useApi';

const TYPE_LABEL = { Cafe: 'Café', Event: 'Event', Corporate: 'Corporate', College: 'College / School', Personal: 'Customer' };

function ReviewCard({ r, onPhoto }) {
  return (
    <article className="flex h-full w-[300px] shrink-0 flex-col rounded-3xl bg-white p-6 shadow-md shadow-forest/10 sm:w-[360px]">
      <Stars value={r.rating} />
      <p className="mt-3 flex-1 whitespace-pre-line text-[15px] leading-relaxed text-choco/90">{r.text}</p>
      {r.reply && (
        <div className="mt-4 rounded-2xl bg-forest/5 p-3.5 text-sm leading-relaxed text-choco/90">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest">CUP2EAT replied</p>
          <p className="mt-0.5">{r.reply}</p>
        </div>
      )}
      {r.photos?.length > 0 && (
        <div className="mt-4 flex gap-2">
          {r.photos.map((src, i) => (
            <button key={src} onClick={() => onPhoto({ src, alt: `Photo ${i + 1} from ${r.name}`, caption: `${r.name}${r.city ? `, ${r.city}` : ''}` })} className="size-16 overflow-hidden rounded-xl ring-1 ring-forest/15" aria-label={`Open photo ${i + 1} from ${r.name}`}>
              <img src={src} alt="" loading="lazy" className="size-full object-cover transition hover:scale-110" />
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 border-t border-forest/10 pt-4">
        <p className="font-semibold text-forest">{r.name}{r.city ? <span className="font-normal text-choco/60">, {r.city}</span> : null}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-forest">{TYPE_LABEL[r.customerType] || 'Customer'}</span>
          {r.product && <span className="rounded-full bg-gold/25 px-2.5 py-0.5 text-choco">{r.product.capacityMl} ml{r.flavour ? ` · ${r.flavour}` : ''}</span>}
        </div>
      </div>
    </article>
  );
}

export default function Reviews() {
  const stats = useApi('/reviews/stats');
  const list = useApi('/reviews?limit=12');
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false); // mount the modal chunk the first time it is needed
  const [photo, setPhoto] = useState(null);
  const closeModal = useCallback(() => setOpen(false), []);
  const closePhoto = useCallback(() => setPhoto(null), []);

  const s = stats.data;
  const items = list.data?.items || [];
  const failed = stats.error || list.error;

  return (
    <section id="reviews" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle eyebrow="Loved by cafés, hosts & students" title="What our customers say" />

        {failed && (
          <p className="mx-auto mb-8 max-w-md rounded-2xl bg-white p-4 text-center text-sm shadow">Reviews could not be loaded right now. <button className="font-semibold text-forest underline" onClick={() => { stats.reload(); list.reload(); }}>Try again</button></p>
        )}

        {s && s.total > 0 && (
          <Reveal className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-6 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:gap-10 sm:p-8">
            <div className="text-center">
              <p className="font-display text-6xl font-extrabold text-forest">{s.average.toFixed(1)}</p>
              <Stars value={s.average} size={20} />
              <p className="mt-1 text-sm text-choco/70">{s.total} review{s.total === 1 ? '' : 's'}</p>
            </div>
            <div className="w-full flex-1 space-y-1.5" aria-label="Rating breakdown">
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="flex items-center gap-3 text-sm">
                  <span className="w-3 text-right font-medium">{n}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-forest/10">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${(s.breakdown[n] / s.total) * 100}%` }} />
                  </div>
                  <span className="w-6 text-choco/60">{s.breakdown[n]}</span>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {list.loading && (
          <div className="flex gap-5 overflow-hidden" aria-hidden="true">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton h-64 w-[300px] shrink-0 rounded-3xl sm:w-[360px]" />)}
          </div>
        )}

        {!list.loading && items.length === 0 && !failed && (
          <Reveal className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border-2 border-dashed border-forest/25 bg-white/60 p-10 text-center">
            <div className="h-28"><MiniCup uid="rv" body="#ebcb8b" liquid="#c9a068" className="h-full w-auto" /></div>
            <h3 className="mt-4 font-display text-2xl font-bold text-forest">Be the first to review CUP2EAT</h3>
            <p className="mt-2 text-choco/70">Tried our cups at a café, event or college fest? Tell others what you thought, and add a photo.</p>
          </Reveal>
        )}

        {/* 4+ reviews scroll as a marquee, fewer show as a simple row */}
        {items.length >= 4 ? (
          <div className="marquee relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]" aria-label="Customer reviews">
            <div className="marquee-track">
              {[...items, ...items].map((r, i) => (
                <div key={`${r._id}-${i}`} className="pr-5" aria-hidden={i >= items.length}><ReviewCard r={r} onPhoto={setPhoto} /></div>
              ))}
            </div>
          </div>
        ) : (
          items.length > 0 && (
            <div className="flex flex-wrap justify-center gap-5">
              {items.map((r) => <ReviewCard key={r._id} r={r} onPhoto={setPhoto} />)}
            </div>
          )
        )}

        <div className="mt-10 text-center">
          <Button onClick={() => { setOpened(true); setOpen(true); }}><PenLine className="size-4" /> Write a review</Button>
        </div>
      </div>

      {opened && (
        <Suspense fallback={null}>
          <ReviewModal open={open} onClose={closeModal} />
        </Suspense>
      )}
      <Lightbox item={photo} onClose={closePhoto} />
    </section>
  );
}
