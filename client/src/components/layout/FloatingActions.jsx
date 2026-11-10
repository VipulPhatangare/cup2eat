import { MessageCircle, Phone } from 'lucide-react';
import { useSite } from '../../context/AppContext';

// desktop: round WhatsApp button · phone: sticky Call + WhatsApp bar
export default function FloatingActions() {
  const site = useSite();
  return (
    <>
      <a
        href={site.waLink()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 hidden size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/30 transition hover:scale-110 md:grid"
      >
        <MessageCircle className="size-7" />
      </a>

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-px border-t border-black/10 bg-black/10 md:hidden">
        <a href={`tel:+91${site.phone}`} className="flex min-h-14 items-center justify-center gap-2 bg-forest text-sm font-semibold text-cream">
          <Phone className="size-5" /> Call us
        </a>
        <a href={site.waLink()} target="_blank" rel="noreferrer" className="flex min-h-14 items-center justify-center gap-2 bg-[#25D366] text-sm font-semibold text-white">
          <MessageCircle className="size-5" /> WhatsApp
        </a>
      </div>
    </>
  );
}
