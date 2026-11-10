import { motion, useTransform } from 'framer-motion';

// Cut-away waffle cup drawn in SVG. Everything that changes while you scroll
// is a MotionValue passed in by the parent (no re-renders, so it stays at 60fps):
//   fill    0..1  how full the cup is with chai
//   bite    0..1  size of the bite taken out of the rim
//   flavour 0..2  0 = Chocolate, 1 = Vanilla, 2 = Elaichi (colours blend between)
//   steam   0..1  opacity of the rising steam
const OUTER = 'M40 60 L82 366 Q84 380 98 380 L222 380 Q236 380 238 366 L280 60 Z';
const INNER = 'M62 60 L102 352 L218 352 L258 60 Z';

const FLAVOUR_COLORS = ['#a9693a', '#ebcb8b', '#b9c57a'];

export default function AnimatedCup({ fill, bite, flavour, steam, className = '' }) {
  const body = useTransform(flavour, [0, 1, 2], FLAVOUR_COLORS);

  // liquid is a tall rect slid up from below the cavity (y = 300 → empty, 26 → full)
  const liquidY = useTransform(fill, [0, 1], [300, 26]);
  // the pouring stream stretches from above the rim down to the liquid surface
  const streamScale = useTransform(liquidY, (v) => (90 + v) / 380);
  const streamOpacity = useTransform(fill, [0, 0.02, 0.96, 1], [0, 1, 1, 0]);

  // three overlapping circles are cut out of the right wall → scalloped bite
  const r1 = useTransform(bite, [0, 1], [0, 38]);
  const r2 = useTransform(bite, [0, 1], [0, 30]);
  const r3 = useTransform(bite, [0, 1], [0, 24]);
  const crumbY = useTransform(bite, [0, 1], [0, 190]);
  const crumbOpacity = useTransform(bite, [0, 0.08, 0.8, 1], [0, 1, 1, 0]);

  return (
    <svg viewBox="0 -30 320 450" className={className} role="img" aria-label="CUP2EAT edible waffle cup">
      <defs>
        <pattern id="c2e-waffle" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <path d="M0 0H24M0 0V24" stroke="rgba(70,35,10,.32)" strokeWidth="2.6" fill="none" />
          <path d="M0 12H24M12 0V24" stroke="rgba(255,240,200,.16)" strokeWidth="1.2" fill="none" />
        </pattern>
        <linearGradient id="c2e-shade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".34" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".14" />
          <stop offset=".62" stopColor="#000" stopOpacity=".04" />
          <stop offset="1" stopColor="#000" stopOpacity=".36" />
        </linearGradient>
        <linearGradient id="c2e-stream" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c98a4b" stopOpacity="0" />
          <stop offset=".22" stopColor="#c98a4b" stopOpacity="1" />
          <stop offset="1" stopColor="#b87a42" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="c2e-chai" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#d49a60" />
          <stop offset="1" stopColor="#8a4d26" />
        </linearGradient>
        <clipPath id="c2e-outer"><path d={OUTER} /></clipPath>
        <clipPath id="c2e-inner"><path d={INNER} /></clipPath>
        {/* the stream may be seen above the rim and inside the cavity only */}
        <clipPath id="c2e-pour">
          <rect x="0" y="-30" width="320" height="90" />
          <path d={INNER} />
        </clipPath>
        <mask id="c2e-bite" maskUnits="userSpaceOnUse" x="-20" y="-60" width="360" height="500">
          <rect x="-20" y="-60" width="360" height="500" fill="#fff" />
          <motion.circle cx="268" cy="66" r={r1} fill="#000" />
          <motion.circle cx="244" cy="54" r={r2} fill="#000" />
          <motion.circle cx="278" cy="96" r={r3} fill="#000" />
        </mask>
        <filter id="c2e-blur" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="160" cy="390" rx="104" ry="9" fill="rgba(0,0,0,.45)" filter="url(#c2e-blur)" />

      <g mask="url(#c2e-bite)">
        {/* outer waffle wall */}
        <motion.path d={OUTER} style={{ fill: body }} />
        <path d={OUTER} fill="url(#c2e-waffle)" />
        <path d={OUTER} fill="url(#c2e-shade)" />

        {/* chocolate rim with drips (left + right wall caps) */}
        <g clipPath="url(#c2e-outer)" fill="#3a2115">
          <path d="M30 56 H70 V82 Q62 102 54 84 Q47 76 40 96 L30 96 Z" />
          <path d="M290 56 H250 V82 Q258 102 266 84 Q273 76 280 96 L290 96 Z" />
          <path d="M42 62 H64" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeLinecap="round" />
          <path d="M256 62 H278" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* cavity (inside of the cup) */}
        <motion.path d={INNER} style={{ fill: body }} />
        <path d={INNER} fill="rgba(34,14,3,.58)" />

        {/* chai */}
        <g clipPath="url(#c2e-inner)">
          <motion.g style={{ y: liquidY }}>
            <rect x="50" y="60" width="220" height="340" fill="url(#c2e-chai)" />
            <rect x="50" y="60" width="220" height="10" fill="#f3e0bd" opacity=".92" />
          </motion.g>
        </g>
        <g clipPath="url(#c2e-pour)">
          <motion.rect
            x="154" y="-30" width="12" height="380" rx="6" fill="url(#c2e-stream)"
            style={{ scaleY: streamScale, opacity: streamOpacity, originY: 0 }}
          />
        </g>

        <path d={INNER} fill="none" stroke="rgba(0,0,0,.28)" strokeWidth="3" />
      </g>

      {/* crumbs falling from the bite */}
      <motion.g style={{ y: crumbY, opacity: crumbOpacity }} fill="#c98a4b">
        <circle cx="258" cy="96" r="4" />
        <circle cx="272" cy="110" r="3" />
        <circle cx="246" cy="118" r="2.6" />
        <circle cx="284" cy="130" r="3.4" />
        <circle cx="264" cy="140" r="2.2" />
      </motion.g>

      {/* steam */}
      <motion.g style={{ opacity: steam }} fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="5">
        <path className="steam" d="M120 40 q-12 -14 0 -28 t0 -28" />
        <path className="steam s2" d="M160 36 q-12 -14 0 -28 t0 -28" />
        <path className="steam s3" d="M200 40 q-12 -14 0 -28 t0 -28" />
      </motion.g>
    </svg>
  );
}
