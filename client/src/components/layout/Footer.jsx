import { Phone, MapPin } from 'lucide-react';
import { InstagramIcon } from '../ui/Icons';
import { useSite } from '../../context/AppContext';

export default function Footer() {
  const site = useSite();
  return (
    <footer className="bg-deep pb-24 pt-14 text-cream/80 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <a href="#top" className="inline-flex items-center gap-3">
            <img src="/logo.png" alt="" width="48" height="48" loading="lazy" className="size-12 rounded-full ring-2 ring-gold/60" />
            <span className="font-display text-2xl font-extrabold text-cream">CUP2EAT</span>
          </a>
          <p className="mt-4 font-hand text-2xl text-gold">Small Cup. Big Happiness.</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed">Edible, eco-friendly waffle cups for chai, coffee, shakes and ice cream. Eat your drink.</p>
          <p className="mt-4 text-xs text-cream/60">{site.fssaiNo ? `FSSAI Lic. No. ${site.fssaiNo}` : 'FSSAI registered'}</p>
        </div>

        <nav aria-label="Footer">
          <h3 className="font-display text-lg font-bold text-cream">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {[['#products', 'Products'], ['#calculator', 'Bulk order calculator'], ['#uses', 'Perfect for'], ['#reviews', 'Reviews'], ['#faq', 'FAQ'], ['#contact', 'Contact']].map(([href, label]) => (
              <li key={href}><a href={href} className="hover:text-gold">{label}</a></li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="font-display text-lg font-bold text-cream">Get in touch</h3>
          <ul className="mt-3 space-y-3 text-sm">
            <li><a href={`tel:+91${site.phone}`} className="inline-flex items-center gap-2 hover:text-gold"><Phone className="size-4" /> {site.phone}</a></li>
            <li><a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-gold"><InstagramIcon className="size-4" /> @{site.instagram}</a></li>
            <li className="inline-flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /> {site.address}</li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-5 pt-6 text-xs text-cream/50 sm:px-8">
        © {new Date().getFullYear()} CUP2EAT · Founder: {site.founder} · Eat Your Drink ❤️
      </p>
    </footer>
  );
}
