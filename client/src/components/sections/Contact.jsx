import { useEffect, useState } from 'react';
import { CheckCircle2, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import Button from '../ui/Button';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import { InstagramIcon } from '../ui/Icons';
import { api } from '../../api/client';
import { useOrder, useProducts, useSite, useToast } from '../../context/AppContext';

const TYPES = [['Cafe', 'Café'], ['Restaurant', 'Restaurant'], ['Event', 'Event / Celebration'], ['Corporate', 'Corporate'], ['College', 'College / School'], ['Other', 'Other']];
const EMPTY = { name: '', phone: '', email: '', city: '', businessType: 'Cafe', product: '', quantity: '', message: '' };

export default function Contact() {
  const site = useSite();
  const toast = useToast();
  const { products } = useProducts();
  const { selection } = useOrder();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);

  // pre-fill the product the visitor picked earlier
  useEffect(() => {
    if (selection.productId) setForm((f) => ({ ...f, product: selection.productId }));
  }, [selection.productId]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const body = { ...form, source: 'form' };
      if (!body.quantity) delete body.quantity;
      const res = await api.post('/enquiries', body);
      setSent(res);
      setForm(EMPTY);
      toast('Enquiry received! We will call you shortly.');
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const input = 'mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40';
  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-sm text-red-300">{errors[k]}</p> : null);

  return (
    <section id="contact" className="bg-forest py-20 text-cream md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionTitle dark eyebrow="Let's talk" title="Bulk orders & enquiries" subtitle="Tell us what you need. We usually reply the same day." />

        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <Reveal className="space-y-4">
            {[
              { icon: Phone, label: 'Call us', value: site.phone, href: `tel:+91${site.phone}` },
              { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: site.waLink() },
              { icon: InstagramIcon, label: 'Instagram', value: `@${site.instagram}`, href: `https://instagram.com/${site.instagram}` },
            ].map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-2xl bg-deep p-5 transition hover:bg-deep/70">
                <span className="grid size-12 place-items-center rounded-full bg-gold text-deep"><Icon className="size-6" /></span>
                <span><span className="block text-sm text-cream/60">{label}</span><span className="text-lg font-semibold">{value}</span></span>
              </a>
            ))}
            <div className="flex items-center gap-4 rounded-2xl bg-deep p-5">
              <span className="grid size-12 place-items-center rounded-full bg-gold text-deep"><MapPin className="size-6" /></span>
              <span><span className="block text-sm text-cream/60">Based in</span><span className="text-lg font-semibold">{site.address}</span></span>
            </div>
            <p className="px-1 font-hand text-2xl text-gold">Eat Your Drink. Sip it. Crunch it. Love it.</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[2rem] bg-deep p-6 sm:p-8">
              {sent ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto size-16 text-gold" />
                  <h3 className="mt-4 font-display text-3xl font-bold">Thank you!</h3>
                  <p className="mt-2 text-cream/75">We have your enquiry and will call you shortly.</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {sent.whatsappUrl && <Button href={sent.whatsappUrl} target="_blank" rel="noreferrer" className="!bg-[#25D366] !text-white"><MessageCircle className="size-4" /> Continue on WhatsApp</Button>}
                    <Button variant="ghost" onClick={() => setSent(null)}>Send another enquiry</Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="text-sm font-medium">Name *</label>
                    <input id="c-name" value={form.name} onChange={set('name')} autoComplete="name" className={input} />
                    <Err k="name" />
                  </div>
                  <div>
                    <label htmlFor="c-phone" className="text-sm font-medium">Mobile number *</label>
                    <input id="c-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} inputMode="tel" autoComplete="tel" placeholder="10-digit number" className={input} />
                    <Err k="phone" />
                  </div>
                  <div>
                    <label htmlFor="c-email" className="text-sm font-medium">Email (optional)</label>
                    <input id="c-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" className={input} />
                    <Err k="email" />
                  </div>
                  <div>
                    <label htmlFor="c-city" className="text-sm font-medium">City</label>
                    <input id="c-city" value={form.city} onChange={set('city')} autoComplete="address-level2" className={input} />
                  </div>
                  <div>
                    <label htmlFor="c-type" className="text-sm font-medium">I am a</label>
                    <select id="c-type" value={form.businessType} onChange={set('businessType')} className={`${input} [&>option]:text-choco`}>
                      {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="c-product" className="text-sm font-medium">Cup size</label>
                    <select id="c-product" value={form.product} onChange={set('product')} className={`${input} [&>option]:text-choco`}>
                      <option value="">Not sure yet</option>
                      {products.map((p) => <option key={p._id} value={p._id}>{p.capacityMl} ml ({p.usage.join(', ')})</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="c-qty" className="text-sm font-medium">Approx. quantity of cups</label>
                    <input id="c-qty" type="number" inputMode="numeric" min="1" value={form.quantity} onChange={set('quantity')} placeholder="e.g. 500" className={input} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="c-msg" className="text-sm font-medium">Message</label>
                    <textarea id="c-msg" rows={3} maxLength={800} value={form.message} onChange={set('message')} placeholder="Tell us about your café, event date or any question." className={input} />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={busy} className="w-full"><Send className="size-4" /> {busy ? 'Sending…' : 'Send enquiry'}</Button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
