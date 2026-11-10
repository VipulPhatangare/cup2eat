import { useCallback, useState } from 'react';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import Lightbox from '../ui/Lightbox';
import Button from '../ui/Button';
import { useApi } from '../../hooks/useApi';

const FILTERS = [['All', 'All'], ['Cafe', 'Cafés'], ['Event', 'Events'], ['College', 'Colleges'], ['Product', 'Our cups']];

export default function Gallery() {
  const { data, loading, error, reload } = useApi('/gallery');
  const [filter, setFilter] = useState('All');
  const [photo, setPhoto] = useState(null);
  const close = useCallback(() => setPhoto(null), []);

  const items = (data || []).filter((g) => filter === 'All' || g.category === filter);

  return (
    <section id="gallery" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle eyebrow="On the ground" title="CUP2EAT in the real world" subtitle="Café carts, school events, college stalls and celebrations. This is where our cups live." />

        <div className="no-scrollbar mb-8 flex justify-start gap-2 overflow-x-auto pb-1 sm:justify-center" role="group" aria-label="Filter photos">
          {FILTERS.map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} aria-pressed={filter === v}
              className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition ${filter === v ? 'bg-forest text-cream' : 'bg-waffle/60 text-forest hover:bg-waffle'}`}>
              {l}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-center text-sm">Photos could not be loaded. <button className="font-semibold text-forest underline" onClick={reload}>Try again</button></p>
        )}
        {loading && <div className="columns-2 gap-4 md:columns-3" aria-hidden="true">{[260, 340, 300, 380, 280, 320].map((h, i) => <div key={i} className="skeleton mb-4 rounded-2xl" style={{ height: h }} />)}</div>}

        <div className="columns-2 gap-4 md:columns-3">
          {items.map((g, i) => (
            <Reveal key={g._id} delay={(i % 3) * 0.06} className="mb-4 break-inside-avoid">
              <button onClick={() => setPhoto({ src: g.image, alt: g.title, caption: `${g.title} · ${g.place}` })} className="group relative block w-full overflow-hidden rounded-2xl text-left">
                <img src={g.image} alt={g.title} loading="lazy" className="w-full transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep/90 to-transparent p-4 pt-12 text-cream">
                  <span className="block text-sm font-semibold leading-tight">{g.title}</span>
                  <span className="block text-xs text-cream/75">{g.place}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button href="https://instagram.com/cup2eat" target="_blank" rel="noreferrer" variant="outline">See more on Instagram</Button>
        </div>
      </div>
      <Lightbox item={photo} onClose={close} />
    </section>
  );
}
