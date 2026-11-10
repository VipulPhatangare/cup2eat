import Reveal from './Reveal';

export default function SectionTitle({ eyebrow, title, subtitle, dark = false, center = true }) {
  return (
    <Reveal className={`mb-12 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className={`font-hand text-2xl ${dark ? 'text-gold' : 'text-forest'}`}>{eyebrow}</p>}
      <h2 className={`mt-1 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl ${dark ? 'text-cream' : 'text-forest'}`}>{title}</h2>
      {subtitle && <p className={`mt-4 text-base leading-relaxed ${dark ? 'text-cream/75' : 'text-choco/75'}`}>{subtitle}</p>}
    </Reveal>
  );
}
