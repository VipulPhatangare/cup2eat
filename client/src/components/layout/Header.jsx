import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Phone, X } from 'lucide-react';
import Button from '../ui/Button';
import { useSite } from '../../context/AppContext';

const LINKS = [
  { href: '#products', label: 'Products' },
  { href: '#calculator', label: 'Bulk order' },
  { href: '#uses', label: 'Perfect for' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#contact', label: 'Contact' },
];

export default function Header() {
  const site = useSite();
  const [open, setOpen] = useState(false);

  // close the mobile menu on Escape and lock page scroll while it is open
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-forest/95 text-cream backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5" aria-label="CUP2EAT home">
          <img src="/logo.png" alt="" width="40" height="40" className="size-10 rounded-full ring-2 ring-gold/60" />
          <span className="font-display text-xl font-extrabold tracking-wide max-[400px]:text-lg">CUP2EAT</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-cream/80 transition hover:text-gold">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={`tel:+91${site.phone}`} className="hidden items-center gap-2 text-sm font-semibold text-cream/90 hover:text-gold xl:flex">
            <Phone className="size-4" /> {site.phone}
          </a>
          <Button href="#contact" className="hidden !min-h-10 !px-5 max-[400px]:!px-4 sm:inline-flex">Order now</Button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid size-11 place-items-center rounded-full hover:bg-white/10 lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-16 h-[calc(100svh-4rem)] bg-forest px-5 pb-10 pt-4 lg:hidden"
            aria-label="Mobile"
          >
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex min-h-14 items-center border-b border-white/10 font-display text-2xl font-bold">
                {l.label}
              </a>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              <Button href="#contact" onClick={() => setOpen(false)}>Order now</Button>
              <Button href={`tel:+91${site.phone}`} variant="ghost"><Phone className="size-4" /> {site.phone}</Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
