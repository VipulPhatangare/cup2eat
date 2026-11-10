import { Quote } from 'lucide-react';
import Reveal from '../ui/Reveal';
import SectionTitle from '../ui/SectionTitle';
import Button from '../ui/Button';
import { InstagramIcon } from '../ui/Icons';
import { useSite } from '../../context/AppContext';

const STEPS = [
  { title: 'A solo stall at Lady Shri Ram College', text: 'One founder, one idea and one table, representing CUP2EAT because every big brand starts somewhere.' },
  { title: "Smiles at Children's Academy, Ghaziabad", text: 'A full day of excitement where students and teachers enjoyed drinks in cups they could eat.' },
  { title: 'Our first client café cart: Cup Khaoge?', text: 'A grand opening in Ghaziabad where a café serves chai in CUP2EAT cups. "Chai bhi. Cup bhi."' },
];

export default function Founder() {
  const site = useSite();
  const stats = [
    [site.followers?.toLocaleString('en-IN') + '+', 'Instagram followers'],
    ['3', 'Flavours'],
    ['2', 'Sizes: 100 & 150 ml'],
    ['India', 'Wide delivery'],
  ];

  return (
    <section id="story" className="bg-deep py-20 text-cream md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle dark eyebrow="Our story" title="Built with passion, driven by purpose" />

        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <figure className="relative rounded-[2rem] bg-forest p-8 sm:p-10">
              <Quote className="size-10 text-gold" />
              <blockquote className="mt-4 font-display text-2xl font-semibold leading-snug sm:text-3xl">
                Just me, my brand, and a dream I refuse to give up on. One day, this journey will be a story worth telling.
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img src="/logo.png" alt="" loading="lazy" width="48" height="48" className="size-12 rounded-full ring-2 ring-gold/60" />
                <span>
                  <span className="block font-semibold">{site.founder}</span>
                  <span className="text-sm text-cream/70">Founder, CUP2EAT</span>
                </span>
              </figcaption>
              <Button href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noreferrer" variant="ghost" className="mt-6">
                <InstagramIcon className="size-4" /> Follow @{site.instagram}
              </Button>
            </figure>
          </Reveal>

          <div>
            <ol className="relative space-y-7 border-l-2 border-gold/40 pl-7">
              {STEPS.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 0.1} className="relative">
                  <span className="absolute -left-[2.45rem] top-1 grid size-8 place-items-center rounded-full bg-gold font-bold text-deep">{i + 1}</span>
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="mt-1 text-cream/75">{s.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(([n, l]) => (
            <Reveal key={l} className="rounded-3xl bg-forest/70 p-6 text-center">
              <dt className="sr-only">{l}</dt>
              <dd className="font-display text-4xl font-extrabold text-gold">{n}</dd>
              <dd className="mt-1 text-sm text-cream/75">{l}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
