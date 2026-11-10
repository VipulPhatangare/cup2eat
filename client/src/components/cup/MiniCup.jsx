// Static version of the cup (used for the 3-flavour trio, the plastic-vs-edible
// comparison and the footer). `liquid` colours the drink, `scoop` adds ice cream.
const OUTER = 'M40 60 L82 366 Q84 380 98 380 L222 380 Q236 380 238 366 L280 60 Z';
const INNER = 'M62 60 L102 352 L218 352 L258 60 Z';

export default function MiniCup({ body = '#a9693a', liquid = '#b0723e', scoop = false, uid = 'm', className = '' }) {
  return (
    <svg viewBox="0 -30 320 450" className={className} aria-hidden="true">
      <defs>
        <pattern id={`${uid}-waffle`} width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <path d="M0 0H24M0 0V24" stroke="rgba(70,35,10,.32)" strokeWidth="2.6" fill="none" />
          <path d="M0 12H24M12 0V24" stroke="rgba(255,240,200,.16)" strokeWidth="1.2" fill="none" />
        </pattern>
        <linearGradient id={`${uid}-shade`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".34" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".14" />
          <stop offset="1" stopColor="#000" stopOpacity=".36" />
        </linearGradient>
        <clipPath id={`${uid}-outer`}><path d={OUTER} /></clipPath>
        <clipPath id={`${uid}-inner`}><path d={INNER} /></clipPath>
      </defs>
      <ellipse cx="160" cy="390" rx="100" ry="8" fill="rgba(0,0,0,.35)" />
      <path d={OUTER} fill={body} />
      <path d={OUTER} fill={`url(#${uid}-waffle)`} />
      <path d={OUTER} fill={`url(#${uid}-shade)`} />
      <g clipPath={`url(#${uid}-outer)`} fill="#3a2115">
        <path d="M30 56 H70 V82 Q62 102 54 84 Q47 76 40 96 L30 96 Z" />
        <path d="M290 56 H250 V82 Q258 102 266 84 Q273 76 280 96 L290 96 Z" />
      </g>
      <path d={INNER} fill={body} />
      <path d={INNER} fill="rgba(34,14,3,.58)" />
      <g clipPath={`url(#${uid}-inner)`}>
        <rect x="50" y="86" width="220" height="320" fill={liquid} />
        <rect x="50" y="86" width="220" height="9" fill="#fff" opacity=".35" />
      </g>
      <path d={INNER} fill="none" stroke="rgba(0,0,0,.28)" strokeWidth="3" />
      {scoop && (
        <g>
          <circle cx="160" cy="66" r="58" fill="#f6ebd0" />
          <path d="M104 74 Q160 100 216 74 Q216 96 160 108 Q104 96 104 74Z" fill="#e8d6ac" />
          <path d="M120 38 Q160 14 200 38" stroke="#5a3420" strokeWidth="9" strokeLinecap="round" fill="none" />
          <circle cx="132" cy="48" r="4" fill="#5a3420" /><circle cx="170" cy="30" r="4" fill="#5a3420" /><circle cx="192" cy="54" r="4" fill="#5a3420" />
        </g>
      )}
    </svg>
  );
}
