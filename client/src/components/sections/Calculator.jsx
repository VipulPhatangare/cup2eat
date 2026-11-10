import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Minus, Plus, Send } from 'lucide-react';
import Button from '../ui/Button';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import { api } from '../../api/client';
import { useOrder, useProducts, useToast } from '../../context/AppContext';
import { inr, inr2 } from '../../lib/format';

const QUICK = [200, 500, 1000, 2000, 5000];

export default function Calculator() {
  const { products } = useProducts();
  const { selection, setSelection } = useOrder();
  const toast = useToast();

  const [cups, setCups] = useState(500);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null); // { whatsappUrl }

  // product chosen here or in the Products section
  const product = products.find((p) => p._id === selection.productId) || products[0];

  useEffect(() => { setSent(null); }, [cups, selection.productId]);
  if (!product) return <section id="calculator" className="bg-forest py-20" aria-hidden="true" />;

  const pack = product.wholesale.cups;
  const safeCups = Math.max(1, Number(cups) || 1);
  const packs = Math.ceil(safeCups / pack);
  const totalCups = packs * pack;
  const total = packs * product.wholesale.price;
  const perCup = total / totalCups;
  const spare = totalCups - safeCups;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const res = await api.post('/enquiries', {
        name,
        phone,
        product: product._id,
        quantity: safeCups,
        source: 'calculator',
        message: `Calculator: ${packs} pack(s) of ${pack} x ${product.capacityMl}ml = ${totalCups} cups, ${inr(total)}.`,
      });
      setSent(res);
      toast('Enquiry sent! We will call you shortly.');
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const field = 'mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none';

  return (
    <section id="calculator" className="bg-forest py-20 text-cream md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionTitle dark eyebrow="Bulk order calculator" title="How many cups do you need?" subtitle="Tell us your quantity. We work out the packs, the price and the cost per cup." />

        <Reveal>
          <div className="grid gap-8 rounded-[2rem] bg-deep p-6 shadow-2xl sm:p-10 lg:grid-cols-[1.1fr_1fr]">
            {/* inputs */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gold">1 · Choose a size</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Cup size">
                {products.map((p) => (
                  <button
                    key={p._id}
                    role="radio"
                    aria-checked={p._id === product._id}
                    onClick={() => setSelection((s) => ({ ...s, productId: p._id }))}
                    className={`rounded-2xl border p-4 text-left transition ${p._id === product._id ? 'border-gold bg-gold/15' : 'border-white/15 hover:border-white/40'}`}
                  >
                    <span className="block font-display text-2xl font-bold">{p.capacityMl} ml</span>
                    <span className="text-sm text-cream/70">{p.usage.join(', ')}</span>
                    <span className="mt-2 block text-sm font-semibold text-gold">{inr(p.wholesale.price)} / {p.wholesale.cups} cups</span>
                  </button>
                ))}
              </div>

              <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-gold">2 · How many cups?</p>
              <div className="mt-3 flex items-center gap-3">
                <button aria-label="Fewer cups" onClick={() => setCups(Math.max(50, safeCups - 50))} className="grid size-12 place-items-center rounded-full border border-white/25 hover:bg-white/10"><Minus className="size-5" /></button>
                <input
                  type="number" inputMode="numeric" min="1" max="100000" value={cups}
                  onChange={(e) => setCups(e.target.value === '' ? '' : Math.min(100000, Number(e.target.value)))}
                  aria-label="Number of cups"
                  className="h-12 w-full min-w-0 rounded-xl border border-white/20 bg-white/10 text-center font-display text-3xl font-bold tabular-nums focus:border-gold focus:outline-none"
                />
                <button aria-label="More cups" onClick={() => setCups(Math.min(100000, safeCups + 50))} className="grid size-12 place-items-center rounded-full border border-white/25 hover:bg-white/10"><Plus className="size-5" /></button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button key={q} onClick={() => setCups(q)} className={`rounded-full border px-4 py-1.5 text-sm transition ${safeCups === q ? 'border-gold bg-gold text-deep' : 'border-white/20 hover:border-gold'}`}>{q.toLocaleString('en-IN')}</button>
                ))}
              </div>
              <p className="mt-4 text-xs text-cream/60">Tip: 1 cup per guest for events, 2 for parties with desserts and drinks.</p>
            </div>

            {/* result */}
            <div className="flex flex-col rounded-3xl bg-cream p-6 text-choco sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-forest">Your order</p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-choco/60">Packs</p>
                  <motion.p key={packs} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-4xl font-extrabold text-forest">{packs}</motion.p>
                </div>
                <div>
                  <p className="text-xs text-choco/60">Cups you get</p>
                  <motion.p key={totalCups} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-4xl font-extrabold text-forest">{totalCups.toLocaleString('en-IN')}</motion.p>
                </div>
              </div>
              <div className="mt-4 border-t border-forest/15 pt-4">
                <p className="text-xs text-choco/60">Total (delivery included)</p>
                <motion.p key={total} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl font-extrabold text-forest">{inr(total)}</motion.p>
                <p className="mt-1 text-sm font-medium" style={{ color: '#9a6f1c' }}>{inr2(perCup)} per cup{spare > 0 ? ` · ${spare} spare cups included` : ''}</p>
              </div>

              {sent ? (
                <div className="mt-6 rounded-2xl bg-forest/10 p-4 text-center">
                  <p className="font-semibold text-forest">Thank you! We will call you shortly.</p>
                  {sent.whatsappUrl && (
                    <Button href={sent.whatsappUrl} target="_blank" rel="noreferrer" className="mt-3 !bg-[#25D366] !text-white" >
                      <MessageCircle className="size-4" /> Continue on WhatsApp
                    </Button>
                  )}
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-3" noValidate>
                  <div>
                    <label className="text-sm font-medium" htmlFor="calc-name">Your name</label>
                    <input id="calc-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${field} !border-forest/20 !bg-white !text-choco placeholder:!text-choco/40`} placeholder="Rahul Sharma" />
                    {errors.name && <p className="mt-1 text-sm text-red-700">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="calc-phone">Mobile number</label>
                    <input id="calc-phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="tel" autoComplete="tel" className={`${field} !border-forest/20 !bg-white !text-choco placeholder:!text-choco/40`} placeholder="98xxxxxxxx" />
                    {errors.phone && <p className="mt-1 text-sm text-red-700">{errors.phone}</p>}
                  </div>
                  <Button type="submit" variant="forest" disabled={busy} className="w-full">
                    <Send className="size-4" /> {busy ? 'Sending…' : 'Send my enquiry'}
                  </Button>
                  <p className="text-center text-xs text-choco/60">Prices follow the current wholesale offer. We confirm the final quote on call.</p>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
