import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';
import { useSite } from '../../context/AppContext';

export default function FAQ() {
  const site = useSite();
  const [open, setOpen] = useState(0);

  const faqs = [
    ['What are CUP2EAT cups made of?', 'Crispy waffle-style edible cups with a chocolate coating. They are 100% edible, pure veg and vegan.'],
    ['Which sizes and flavours do you have?', 'The 100 ml cup is made for hot beverages like chai and coffee, and for ice cream. It comes in Chocolate, Vanilla and Elaichi. The 150 ml cup is made for cold coffee and shake glasses.'],
    ['Are the cups leak-proof?', 'Yes. CUP2EAT cups are leak-proof and designed for hot and cold drinks.'],
    ['What is the wholesale price?', '100 ml: ₹3,999 for 396 cups (about ₹10 per cup). 150 ml: ₹6,500 for 432 cups (about ₹15 per cup). Delivery is included on both. Use the calculator above to work out your order.'],
    ['Do you deliver all over India?', 'Yes. Delivery is included on wholesale packs, anywhere in India.'],
    ['Can I order for an event, college fest or corporate gifting?', 'Absolutely. We supply cafés, restaurants, chai stalls, events, corporate orders, college and school events, and gifting or bulk orders. Send us an enquiry and we will help you plan.'],
    ['How long do the cups stay crisp, and how should I store them?', `We share storage and serving tips with every order. Call or WhatsApp us on ${site.phone} and we will advise based on your drink and event.`],
    ['Are you FSSAI registered?', 'Yes, CUP2EAT is FSSAI registered.'],
  ];

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionTitle eyebrow="Good to know" title="Frequently asked questions" />
        <div className="space-y-3">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <h3>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`} id={`faq-btn-${i}`}
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left font-body text-base font-semibold text-forest"
                  >
                    {q}
                    <ChevronDown className={`size-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`faq-${i}`} role="region" aria-labelledby={`faq-btn-${i}`}
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="px-5 pb-5 leading-relaxed text-choco/80">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
