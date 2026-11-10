import { BadgeCheck, Droplets, Recycle, Sprout, Truck, Wheat } from 'lucide-react';
import Reveal from '../ui/Reveal';
import SectionTitle from '../ui/SectionTitle';

const ITEMS = [
  { icon: Wheat, title: '100% Edible', text: 'Crispy waffle cups you finish with your drink. Nothing left to throw away.' },
  { icon: Sprout, title: 'Pure Veg & Vegan', text: 'Made for everyone at the table, from chai lovers to dessert fans.' },
  { icon: Droplets, title: 'Leak-Proof', text: 'Built for hot chai, coffee, cold shakes and ice cream.' },
  { icon: Recycle, title: 'Zero Waste', text: 'Eco-friendly and sustainable. No plastic, no paper, no bin.' },
  { icon: BadgeCheck, title: 'FSSAI Registered', text: 'Food-safe and registered, so cafés and event hosts can order with confidence.' },
  { icon: Truck, title: 'Delivery Included', text: 'Free delivery on wholesale packs, all over India.' },
];

export default function WhyUs() {
  return (
    <section id="why" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle eyebrow="Why CUP2EAT" title="The cup is part of the treat" subtitle="One small change, and your chai, coffee or shake becomes the most talked-about serve in town." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08}>
              <article className="group h-full rounded-3xl border border-forest/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10">
                <div className="grid size-14 place-items-center rounded-2xl bg-forest text-gold transition group-hover:rotate-6">
                  <Icon className="size-7" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-forest">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-choco/75">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
