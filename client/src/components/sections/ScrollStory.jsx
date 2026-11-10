import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import AnimatedCup from '../cup/AnimatedCup';
import VideoCanvas from '../cup/VideoCanvas';
import Button from '../ui/Button';
import { useSite } from '../../context/AppContext';
import { useFrames } from '../../hooks/useFrames';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import FRAMES from '../../config/frames.json';

/*
  ONE continuous animation driven by scroll.  The section is very tall (520-620vh)
  and a viewport-sized stage is "sticky" inside it, so while you scroll the cup stays
  on screen and `p` (0 → 1) tells us how far through the story we are:

    0.00-0.18  Hero          "Eat Your Drink."
    0.18-0.38  Pour          cup fills with chai, steam rises
    0.38-0.56  Crunch        a bite is taken, crumbs fall
    0.56-0.78  Flavours      cup colour morphs Chocolate → Vanilla → Elaichi
    0.78-1.00  Pack          the three flavours + "396 cups · ₹3,999" counter

  Two renderers share the same text panels and timeline:
    - a real video, played as a WebP frame sequence on a <canvas> (made by `npm run frames`):
      desktop (>= 768px) uses client/public/frames/desktop (16:9), phones use .../mobile (9:16,
      shown as a window over the top half). Covers Hero → Pour → Crunch.
    - fallback: the cup drawn in SVG (AnimatedCup), used when the frames are missing.
*/

// opacity / slide for a text panel that is visible between a and b
function usePanel(p, a, b, { first = false, last = false, f = 0.035 } = {}) {
  const opacity = useTransform(p, [a, a + f, b - f, b], [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(p, [a, a + f, b - f, b], [first ? 0 : 36, 0, 0, last ? 0 : -36]);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? 'auto' : 'none'));
  return { opacity, y, pointerEvents };
}

function Eyebrow({ children }) {
  return <p className="font-hand text-2xl text-gold md:text-3xl">{children}</p>;
}

// The Step 4 photo (client/public/images/flavours-trio.webp, 3:2). Its dark green background is almost the page colour; the soft
// edge fade hides any small difference. The names sit under the cups: the cups are at 20%, 50% and 80% of the width, and the
// middle cup is in front of the other two, so its name is a little lower.
const TRIO_FADE = (() => {
  const mask = 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent), linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent)';
  return { WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: 'source-in', maskComposite: 'intersect' };
})();
const TRIO_LABELS = [
  { name: 'Chocolate', left: '20%', top: '78%' },
  { name: 'Vanilla', left: '50%', top: '84%' },
  { name: 'Elaichi', left: '80%', top: '78%' },
];

// Phones reuse the desktop frames, cropped around the cup (x / y / zoom in frames.json),
// unless frames.json gives the phone its own folder (`dir`, made with `npm run frames -- video 8.1 mobile`).
const MOBILE_CFG = FRAMES.mobile?.dir ? FRAMES.mobile : { ...FRAMES.desktop, ...FRAMES.mobile };

const h = 'font-display font-extrabold leading-[1.02] text-cream';
const sub = 'mt-3 max-w-md text-[15px] leading-relaxed text-cream/80 md:mt-5 md:text-lg';

export default function ScrollStory() {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery('(min-width: 768px)');
  const cfg = desktop ? FRAMES.desktop : MOBILE_CFG;
  const frames = useFrames(cfg, !reduce);
  if (reduce) return <StaticStory />;
  const useVideo = Boolean(cfg?.count) && frames.status !== 'failed' && frames.count > 0;
  // key: switching renderer (e.g. window resized across 768px) remounts with fresh timelines
  return <AnimatedStory key={`${useVideo ? 'video' : 'svg'}-${desktop ? 'd' : 'm'}`} frames={useVideo ? frames : null} cfg={cfg} desktop={desktop} />;
}

function AnimatedStory({ frames, cfg, desktop }) {
  const video = Boolean(frames);
  const site = useSite();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // a little spring makes the cup feel physical instead of glued to the scrollbar
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.35 });

  // ----- cup state -----
  const fill = useTransform(p, [0.18, 0.36], [0, 1]);
  const bite = useTransform(p, [0.38, 0.54], [0, 1]);
  const flavour = useTransform(p, [0.58, 0.64, 0.68, 0.74, 0.78], [0, 0, 1, 1, 2]);
  const steam = useTransform(p, [0.3, 0.36, 0.74, 0.8], [0, 1, 1, 0]);

  // ----- cup movement -----
  const rotate = useTransform(p, [0, 0.18, 0.38, 0.56, 0.78], [-10, 2, -5, 4, 0]);
  const scale = useTransform(p, [0, 0.08, 0.76, 0.84], [0.82, 1, 1, 0.7]);
  const cupOpacity = useTransform(p, [0.76, 0.84], [1, 0]);

  // background glow follows the flavour colour
  const glow = useTransform(
    flavour,
    [0, 1, 2],
    ['rgba(212,166,74,0.32)', 'rgba(246,231,184,0.26)', 'rgba(168,184,111,0.32)']
  );
  const background = useTransform(glow, (c) => `radial-gradient(60% 55% at 70% 50%, ${c}, transparent 70%), #082a1f`);

  // ----- text panels -----
  const s1 = usePanel(p, 0, 0.18, { first: true });
  const s2 = usePanel(p, 0.18, 0.38);
  const s3 = usePanel(p, 0.38, 0.56);
  const s4 = usePanel(p, 0.56, 0.78);
  const s5 = usePanel(p, 0.78, 1, { last: true });

  // flavour words crossfade inside panel 4
  const wChoc = useTransform(p, [0.6, 0.64], [1, 0]);
  const wVan = useTransform(p, [0.64, 0.67, 0.72, 0.75], [0, 1, 1, 0]);
  const wEla = useTransform(p, [0.72, 0.75], [0, 1]);

  // pack panel: counting number + trio of cups
  const count = useTransform(p, [0.8, 0.93], [0, 396]);
  const countText = useTransform(count, (v) => Math.round(v));
  // with the video the cups arrive right after the video fades out; with the SVG cup they wait for the morph
  const at = video ? 0.6 : 0.8;
  const trioOpacity = useTransform(p, [at, at + 0.06], [0, 1]);
  const trioY = useTransform(p, [at, at + 0.12], [70, 0]);
  // the page behind the photo is #0d1a11 with the video, and the greener #082a1f without it
  const lift = video ? { r: 0.027, g: 0.035, b: 0.04 } : { r: 0.012, g: 0.1, b: 0.095 };

  // ----- video frames -----
  // piecewise map: scroll beats → frame numbers (beats are fractions of the clip in frames.json)
  const last = Math.max(1, (frames?.count || 1) - 1);
  const [b0, b1, b2, b3] = (cfg?.beats || [0, 0.42, 0.79, 1]).map((b) => b * last);
  const frameIndex = useTransform(p, [0, 0.18, 0.38, 0.56], [b0, b1, b2, b3]);
  const videoOpacity = useTransform(p, [0.56, 0.62], [1, 0]);

  const hint = useTransform(p, [0, 0.04], [1, 0]);
  const bar = useTransform(p, [0, 1], [0, 1]);

  return (
    <section ref={ref} id="top" aria-label="CUP2EAT story" className="relative h-[520vh] md:h-[620vh]">
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
        {video ? (
          // same near-black green as the video's own background so the edges blend
          <div className="absolute inset-0 bg-[#0d1a11] [background-image:radial-gradient(60%_55%_at_70%_50%,rgba(212,166,74,0.10),transparent_70%)]" />
        ) : (
          <motion.div className="absolute inset-0" style={{ background }} />
        )}

        {video && (
          <>
            <VideoCanvas frames={frames} index={frameIndex} opacity={videoOpacity} mode={desktop ? 'desktop' : 'mobile'} view={cfg} />
            {/* desktop only: keeps the headline readable where the video's left edge fades in */}
            {desktop && <div className="pointer-events-none absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-[#0d1a11] via-[#0d1a11]/75 to-transparent" />}
          </>
        )}

        <div className="relative mx-auto h-full max-w-7xl px-5 sm:px-8">
          {/* ---------------- cup ---------------- */}
          {/* on a phone the visual sits at the top and the text starts right under it (bottom-aligned here) */}
          <div className="absolute inset-x-0 top-0 h-[56%] [@media(max-height:700px)]:h-[42%] md:inset-y-0 md:left-1/2 md:right-0 md:h-auto">
            <div className={`flex h-full justify-center ${video ? 'items-end md:items-center' : 'items-center'}`}>
              {!video && (
                <motion.div className="h-full max-h-[620px] py-2 md:h-[82%]" style={{ rotate, scale, opacity: cupOpacity }}>
                  <div className="float h-full">
                    <AnimatedCup fill={fill} bite={bite} flavour={flavour} steam={steam} className="h-full w-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]" />
                  </div>
                </motion.div>
              )}

              {/* the three flavours (appear at the end): one photo, with the names under the cups */}
              <motion.div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[7rem] [@media(max-height:700px)]:pb-8 md:items-center md:pb-0" style={{ opacity: trioOpacity }}>
                {/* phone: the photo's empty dark top/bottom margins are cropped away (the cups + names are the middle
                    800 of its 1024 px) and it is shown 14% wider than the screen, so the cups are bigger and the gap to
                    the text disappears. desktop: the whole 3:2 photo, as before. */}
                <motion.div style={{ y: trioY }} className="trio-crop relative aspect-[1536/800] w-[114%] max-w-none overflow-hidden md:aspect-[3/2] md:w-full md:max-w-[44rem] md:overflow-visible">
                  {/* lifts the photo's near-black (about rgb 6,17,7) to the page green (about 13,26,17) so no box shows */}
                  <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
                    <filter id="trio-lift" colorInterpolationFilters="sRGB">
                      <feComponentTransfer>
                        <feFuncR type="linear" slope="0.97" intercept={lift.r} />
                        <feFuncG type="linear" slope="0.97" intercept={lift.g} />
                        <feFuncB type="linear" slope="0.97" intercept={lift.b} />
                      </feComponentTransfer>
                    </filter>
                  </svg>
                  <div className="absolute inset-x-0 top-[-23%] aspect-[3/2] md:inset-0 md:top-0 md:aspect-auto">
                  <img
                    src="/images/flavours-trio.webp"
                    width="1536"
                    height="1024"
                    alt="Three CUP2EAT waffle cups filled with Chocolate, Vanilla and Elaichi ice cream"
                    decoding="async"
                    draggable="false"
                    style={{ ...TRIO_FADE, filter: 'url(#trio-lift)' }}
                    className="h-full w-full select-none object-contain"
                  />
                  {TRIO_LABELS.map((l) => (
                    <span
                      key={l.name}
                      style={{ left: l.left, top: l.top }}
                      className="absolute -translate-x-1/2 font-hand text-xl text-cream/90 md:text-2xl"
                    >
                      {l.name}
                    </span>
                  ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* ---------------- text ---------------- */}
          <div className="absolute inset-x-5 bottom-14 top-[56%] [@media(max-height:700px)]:top-[42%] sm:inset-x-8 md:inset-y-0 md:left-8 md:right-1/2">
            <Panel style={s1}>
              <Eyebrow>Small Cup. Big Happiness.</Eyebrow>
              <h1 className={`${h} mt-1 text-[clamp(2.6rem,9vw,5.6rem)]`}>
                Eat Your <span className="text-gold">Drink.</span>
              </h1>
              <p className={sub}>
                India&apos;s edible waffle cups for chai, coffee, shakes &amp; ice cream. Finish your drink, then eat the cup. Zero waste.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 md:mt-8">
                <Button href="#calculator" className="max-[400px]:!px-4">Get bulk price</Button>
                <Button href={site.waLink()} target="_blank" rel="noreferrer" variant="ghost" className="max-[400px]:!px-4">
                  <MessageCircle className="size-4" /> WhatsApp us
                </Button>
              </div>
            </Panel>

            <Panel style={s2}>
              <Eyebrow>Step 1 · Pour</Eyebrow>
              <h2 className={`${h} text-[clamp(2.2rem,7vw,4.2rem)]`}>Hot chai. <br className="hidden md:block" />Zero leaks.</h2>
              <p className={sub}>A leak-proof 100 ml cup made for chai, coffee and ice cream. The same cup holds your cold coffee and shake in 150 ml.</p>
            </Panel>

            <Panel style={s3}>
              <Eyebrow>Step 2 · Crunch</Eyebrow>
              <h2 className={`${h} text-[clamp(2.2rem,7vw,4.2rem)]`}>Sip it. <br className="hidden md:block" />Crunch it. Love it.</h2>
              <p className={sub}>Crispy waffle, rich chocolate rim. When the last sip is gone, take a bite. Pure veg, vegan and 100% edible.</p>
            </Panel>

            <Panel style={s4} className="-mt-[7rem] [@media(max-height:700px)]:-mt-8 md:mt-0">
              <Eyebrow>Step 3 · Choose</Eyebrow>
              <h2 className={`${h} text-[clamp(2.2rem,7vw,4.2rem)]`}>Three flavours.</h2>
              <div className="mt-2 grid text-[clamp(2.4rem,8vw,4.6rem)] font-display font-extrabold leading-none">
                <motion.span style={{ opacity: wChoc, gridArea: '1/1' }} className="text-[#d28b55]">Chocolate</motion.span>
                <motion.span style={{ opacity: wVan, gridArea: '1/1' }} className="text-vanilla">Vanilla</motion.span>
                <motion.span style={{ opacity: wEla, gridArea: '1/1' }} className="text-elaichi">Elaichi</motion.span>
              </div>
              <p className={sub}>From chai stalls to ice-cream parlours, there is a CUP2EAT for every serve.</p>
              <Chips items={['100% edible', 'Vegan', 'Leak-proof']} />
            </Panel>

            <Panel style={s5} className="-mt-[7rem] [@media(max-height:700px)]:-mt-8 md:mt-0">
              <Eyebrow>Step 4 · Order</Eyebrow>
              <h2 className={`${h} text-[clamp(2.2rem,7vw,4.2rem)]`}>
                <motion.span className="tabular-nums text-gold">{countText}</motion.span> cups. ₹3,999.
              </h2>
              <p className={sub}>Wholesale pack of 100 ml cups: about ₹10 a cup, with delivery included all over India.</p>
              <div className="mt-5 flex flex-wrap gap-3 md:mt-8">
                <Button href="#calculator">Calculate my order</Button>
                <Button href="#products" variant="ghost">See all sizes</Button>
              </div>
              <Chips items={['Free delivery', 'FSSAI registered']} />
            </Panel>
          </div>
        </div>

        {/* scroll hint + progress */}
        <motion.div style={{ opacity: hint }} className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center text-xs font-medium uppercase tracking-[0.2em] text-cream/60">
          Scroll
          <ChevronDown className="mt-1 size-5 animate-bounce" />
        </motion.div>
        <motion.div style={{ scaleX: bar }} className="absolute inset-x-0 bottom-0 h-1 origin-left bg-gold" />
      </div>
    </section>
  );
}

// A row of short facts under the text on the two photo steps. Phones only (the desktop layout has no
// empty space to fill) and only when the screen is tall enough, so it never runs under the bottom bar.
function Chips({ items }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2 md:hidden [@media(max-height:700px)]:hidden">
      {items.map((t) => (
        <li key={t} className="rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-[13px] font-medium text-gold-soft">
          {t}
        </li>
      ))}
    </ul>
  );
}

function Panel({ style, children, className = '' }) {
  return (
    <div className={`absolute inset-0 flex items-start pt-2 md:items-center md:pt-0 ${className}`}>
      <motion.div style={style} className="w-full">
        {children}
      </motion.div>
    </div>
  );
}

// Visitors who ask their device for reduced motion get the same message, no scroll-jacking
function StaticStory() {
  const site = useSite();
  const fill = useMotionValue(1);
  const bite = useMotionValue(0.7);
  const flavour = useMotionValue(0);
  const steam = useMotionValue(1);
  return (
    <section id="top" className="bg-deep px-5 py-16 sm:px-8 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
        <div>
          <Eyebrow>Small Cup. Big Happiness.</Eyebrow>
          <h1 className={`${h} text-[clamp(2.6rem,9vw,5.6rem)]`}>
            Eat Your <span className="text-gold">Drink.</span>
          </h1>
          <p className={sub}>
            India&apos;s edible waffle cups for chai, coffee, shakes &amp; ice cream. Available in Chocolate, Vanilla and Elaichi. 396 cups for ₹3,999 with delivery included.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="#calculator">Get bulk price</Button>
            <Button href={site.waLink()} target="_blank" rel="noreferrer" variant="ghost">
              <MessageCircle className="size-4" /> WhatsApp us
            </Button>
          </div>
        </div>
        <div className="mx-auto h-[360px] md:h-[520px]">
          <AnimatedCup fill={fill} bite={bite} flavour={flavour} steam={steam} className="h-full w-auto" />
        </div>
      </div>
    </section>
  );
}
