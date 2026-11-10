import { Check } from 'lucide-react';
import Reveal from '../ui/Reveal';
import SectionTitle from '../ui/SectionTitle';
import Button from '../ui/Button';
import { useOrder, useProducts, useSite } from '../../context/AppContext';
import { FLAVOUR_DOT, inr, inr2 } from '../../lib/format';

export default function Products() {
  const { products, loading, error, reload } = useProducts();
  const { setSelection } = useOrder();
  const site = useSite();

  return (
    <section id="products" className="bg-waffle/45 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle eyebrow="Our cups" title="Pick the size for your serve" subtitle="Wholesale packs with delivery included all over India. Retail packs are available too. Just call or message us." />

        {error && (
          <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center shadow">
            <p className="font-medium">{error.message}</p>
            <Button variant="forest" className="mt-4" onClick={reload}>Try again</Button>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {loading &&
            [0, 1].map((i) => <div key={i} className="skeleton h-[560px] rounded-3xl" aria-hidden="true" />)}

          {products.map((p, i) => (
            <Reveal key={p._id} delay={i * 0.1}>
              <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-forest/10">
                <div className="relative aspect-[16/10] overflow-hidden bg-forest">
                  {p.image && <img src={p.image} alt={`${p.name} with a drink`} loading="lazy" width="900" height="560" className="size-full object-cover transition duration-700 hover:scale-105" />}
                  <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-deep">Wholesale</span>
                  <span className="absolute right-4 top-4 rounded-full bg-deep/80 px-3 py-1 text-sm font-semibold text-cream backdrop-blur">{p.capacityMl} ml</span>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <h3 className="text-2xl font-bold text-forest">{p.name}</h3>
                  <p className="mt-1 text-choco/70">{p.tagline}</p>

                  <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-1">
                    <p className="font-display text-5xl font-extrabold text-forest">{inr(p.wholesale.price)}</p>
                    <p className="pb-1.5 text-sm font-medium text-choco/80">for {p.wholesale.cups} cups</p>
                  </div>
                  <p className="mt-1 text-sm font-semibold" style={{ color: '#9a6f1c' }}>
                    about {inr2(p.pricePerCup)} per cup · delivery included
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2" aria-label="Flavours">
                    {p.flavours.map((f) => (
                      <span key={f} className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-cream px-3 py-1 text-sm">
                        <span className="size-3 rounded-full ring-1 ring-black/10" style={{ background: FLAVOUR_DOT[f] || '#ccc' }} />
                        {f}
                      </span>
                    ))}
                  </div>

                  <ul className="mt-5 grid gap-2 text-sm text-choco/85">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2"><Check className="size-4 shrink-0 text-forest" /> {f}</li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-wrap gap-3 pt-7">
                    <Button href="#calculator" onClick={() => setSelection((s) => ({ ...s, productId: p._id }))}>Calculate my order</Button>
                    <Button href="#contact" variant="outline" onClick={() => setSelection((s) => ({ ...s, productId: p._id }))}>Get a quote</Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-choco/70">
          Looking for smaller retail packs or something special for your event?{' '}
          <a href={site.waLink('Hi CUP2EAT! I am looking for retail packs.')} target="_blank" rel="noreferrer" className="font-semibold text-forest underline underline-offset-2">Message us on WhatsApp</a>.
        </p>
      </div>
    </section>
  );
}
