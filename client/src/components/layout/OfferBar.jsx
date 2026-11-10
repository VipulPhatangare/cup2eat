import { useState } from 'react';
import { Flame, X } from 'lucide-react';
import { useApi, useCountdown } from '../../hooks/useApi';
import { pad } from '../../lib/format';

function readDismissed() {
  try { return sessionStorage.getItem('c2e-offer-closed') === '1'; } catch { return false; }
}

export default function OfferBar() {
  const { data: offer } = useApi('/offers/active');
  const [closed, setClosed] = useState(readDismissed);
  const { d, h, m, s, done } = useCountdown(offer?.endsAt);

  if (!offer || closed || done) return null;

  const close = () => {
    setClosed(true);
    try { sessionStorage.setItem('c2e-offer-closed', '1'); } catch { /* private mode: ignore */ }
  };

  return (
    <div className="relative bg-gold text-deep">
      <div className="mx-auto flex min-h-10 max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-10 py-1.5 text-center text-xs font-semibold sm:text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Flame className="size-4 shrink-0" />
          {offer.text}
        </span>
        <span className="rounded-full bg-deep px-2.5 py-0.5 font-mono text-xs tabular-nums text-gold">
          Ends in {d}d {pad(h)}h {pad(m)}m {pad(s)}s
        </span>
        <a href="#calculator" className="underline underline-offset-2 hover:no-underline">Order now</a>
      </div>
      <button onClick={close} aria-label="Dismiss offer" className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full hover:bg-deep/10">
        <X className="size-4" />
      </button>
    </div>
  );
}
