import { useState } from 'react';
import { Check, X } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';
import MiniCup from '../cup/MiniCup';

// simple grey disposable plastic cup
function PlasticCup() {
  return (
    <svg viewBox="0 -30 320 450" className="h-full w-auto" aria-hidden="true">
      <ellipse cx="160" cy="390" rx="100" ry="8" fill="rgba(0,0,0,.25)" />
      <path d="M40 60 L82 366 Q84 380 98 380 L222 380 Q236 380 238 366 L280 60 Z" fill="#d7dde0" />
      <path d="M40 60 L82 366 Q84 380 98 380 L222 380 Q236 380 238 366 L280 60 Z" fill="rgba(255,255,255,.35)" />
      <path d="M44 100 L276 100 M52 170 L268 170 M60 240 L260 240 M68 310 L252 310" stroke="rgba(0,0,0,.1)" strokeWidth="3" />
      <rect x="30" y="48" width="260" height="16" rx="8" fill="#b9c2c6" />
      <path d="M62 60 L102 352 L218 352 L258 60 Z" fill="rgba(255,255,255,.4)" />
    </svg>
  );
}

export default function PlasticVsCup() {
  const [pos, setPos] = useState(50); // % of the width that shows the plastic side

  return (
    <section id="compare" className="bg-waffle/45 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionTitle eyebrow="Drag to compare" title="Plastic cup vs CUP2EAT" subtitle="After the last sip, one cup goes to the bin. The other one is eaten." />

        <div className="relative mx-auto h-[420px] select-none overflow-hidden rounded-[2rem] shadow-2xl sm:h-[460px]">
          {/* edible side (bottom layer): content lives in the right half */}
          <div className="absolute inset-0 bg-gradient-to-br from-forest to-deep text-cream">
            <div className="absolute inset-y-0 right-0 flex w-1/2 flex-col items-center justify-center gap-2 p-3 sm:gap-4 sm:p-6">
              <div className="h-28 sm:h-52"><MiniCup uid="pv" body="#a9693a" liquid="#b0723e" className="h-full w-auto" /></div>
              <h3 className="font-display text-xl font-bold text-gold sm:text-3xl">CUP2EAT</h3>
              <ul className="space-y-1 text-xs sm:space-y-1.5 sm:text-sm">
                {['100% edible waffle', 'Zero waste left behind', 'Tastes as good as it looks'].map((t) => (
                  <li key={t} className="flex items-start gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-gold sm:size-4" /> {t}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* plastic side (clipped from the right): content lives in the left half */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <div className="absolute inset-y-0 left-0 flex w-1/2 flex-col items-center justify-center gap-2 p-3 sm:gap-4 sm:p-6">
              <div className="h-28 sm:h-52"><PlasticCup /></div>
              <h3 className="font-display text-xl font-bold sm:text-3xl">Plastic cup</h3>
              <ul className="space-y-1 text-xs sm:space-y-1.5 sm:text-sm">
                {['Single-use, thrown away', 'Ends up in landfill', 'Nobody eats it'].map((t) => (
                  <li key={t} className="flex items-start gap-1.5"><X className="mt-0.5 size-3.5 shrink-0 text-red-700 sm:size-4" /> {t}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* divider + handle */}
          <div className="pointer-events-none absolute inset-y-0 w-1 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,.4)]" style={{ left: `${pos}%` }}>
            <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-sm font-bold text-deep shadow-lg">⇆</span>
          </div>

          {/* real range input on top: mouse, touch and keyboard all work */}
          <input
            type="range" min="5" max="95" value={pos} onChange={(e) => setPos(Number(e.target.value))}
            aria-label="Compare plastic cup and CUP2EAT cup"
            className="absolute inset-0 size-full cursor-ew-resize opacity-0"
          />
        </div>
      </div>
    </section>
  );
}
