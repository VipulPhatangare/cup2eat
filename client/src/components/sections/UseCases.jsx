import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Check, Coffee, Gift, GraduationCap, PartyPopper } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';
import Button from '../ui/Button';

const CASES = [
  {
    id: 'cafes', icon: Coffee, tab: 'Cafés & Businesses',
    title: 'Cafés, chai stalls & restaurants',
    image: '/uploads/site/cafe-cart.webp', alt: 'Cup Khaoge café cart at night serving CUP2EAT cups',
    text: 'Serve chai, coffee and ice cream in a cup your customers can eat, and give them something to post about. Our client café cart "Cup Khaoge?" in Ghaziabad launched with exactly this idea.',
    points: ['100 ml for chai, coffee & ice cream', '150 ml for cold coffee & shakes', 'Wholesale packs with free delivery'],
  },
  {
    id: 'events', icon: PartyPopper, tab: 'Events & Celebrations',
    title: 'Birthdays, weddings & festivals',
    image: '/uploads/site/event-birthday.webp', alt: 'Edible cups filled with desserts and birthday candles',
    text: 'Dessert cups, ice-cream scoops and sweet bites that guests can finish completely. Fun to serve, easy to clean up.',
    points: ['Desserts, ice cream & drinks', 'No plates or cups to collect afterwards', 'Pure veg and vegan friendly'],
  },
  {
    id: 'corporate', icon: Building2, tab: 'Corporate Orders',
    title: 'Corporate meetings & launches',
    image: '/uploads/site/cup-latte.webp', alt: 'Latte in a chocolate-rimmed edible cup',
    text: 'Impress clients and teams with a sustainable serve at meetings, launches and office cafeterias. Order in bulk and we deliver across India.',
    points: ['Bulk pricing for large orders', 'A talking point at every table', 'Eco-friendly and zero waste'],
  },
  {
    id: 'colleges', icon: GraduationCap, tab: 'Colleges & Schools',
    title: 'College fests & school events',
    image: '/uploads/site/cup-hand.webp', alt: 'A hand holding a coffee in a CUP2EAT edible cup',
    text: 'We have served students at Children\'s Academy, Ghaziabad and stood at Lady Shri Ram College. Seeing everyone enjoy the cups is why we do this.',
    points: ['Ideal for stalls, fests & annual days', 'Student-friendly pricing on bulk packs', 'Great for sustainability drives'],
  },
  {
    id: 'gifting', icon: Gift, tab: 'Gifting & Bulk',
    title: 'Gifting & festive orders',
    image: '/uploads/site/diwali.webp', alt: 'Diwali greeting with chai in an edible cup',
    text: 'Edible cups make a memorable festive treat, from Diwali celebrations to special occasions. Tell us what you have in mind and we will help you plan.',
    points: ['Festive and special-occasion orders', 'Chocolate, Vanilla & Elaichi flavours', 'Call or WhatsApp to plan your order'],
  },
];

export default function UseCases() {
  const [active, setActive] = useState(CASES[0].id);
  const c = CASES.find((x) => x.id === active);

  return (
    <section id="uses" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle eyebrow="Perfect for" title="One cup, every occasion" />

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <div role="tablist" aria-label="Use cases" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {CASES.map(({ id, icon: Icon, tab }) => (
              <button
                key={id} role="tab" id={`tab-${id}`} aria-selected={id === active} aria-controls="usecase-panel"
                onClick={() => setActive(id)}
                className={`flex min-h-12 shrink-0 items-center gap-3 rounded-2xl px-5 py-3 text-left text-sm font-semibold transition lg:text-base ${id === active ? 'bg-forest text-cream shadow-lg' : 'bg-white text-forest hover:bg-waffle/60'}`}
              >
                <Icon className="size-5 shrink-0" /> {tab}
              </button>
            ))}
          </div>

          <div id="usecase-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="overflow-hidden rounded-[2rem] bg-deep text-cream shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div key={c.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} className="grid md:grid-cols-2">
                <img src={c.image} alt={c.alt} loading="lazy" width="900" height="700" className="h-64 w-full object-cover md:h-full md:min-h-[420px]" />
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <h3 className="font-display text-3xl font-bold leading-tight">{c.title}</h3>
                  <p className="mt-4 leading-relaxed text-cream/80">{c.text}</p>
                  <ul className="mt-5 space-y-2.5">
                    {c.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-gold" /> {pt}</li>
                    ))}
                  </ul>
                  <Button href="#contact" className="mt-7 self-start">Plan my order</Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
