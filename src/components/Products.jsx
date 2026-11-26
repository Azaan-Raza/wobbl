import Landscape from './Landscape.jsx';
import { Mark } from './Logo.jsx';

const PRODUCTS = [
  {
    id: 'sport',
    name: 'wobbl for sport',
    status: 'Beta',
    line: 'Lifting, basketball and martial arts.',
    palette: 'ember',
    seed: 9,
    cue: 'Bend your front knee more. Knee over your toes.',
    chip: 'Front knee 142°, target 135°',
    drills: ['Squat', 'Jump shot', 'Tae Kwon Do front stance', 'Any other sport, with the AI coach'],
    link: ['try/#squat', 'Try squats'],
  },
  {
    id: 'music',
    name: 'wobbl for music',
    status: 'Early access',
    line: 'Hand position for piano and guitar.',
    palette: 'night',
    seed: 4,
    cue: 'Lift your wrist so it lines up with your knuckles.',
    chip: 'Wrist below the knuckle line',
    drills: ['Piano hand position', 'Guitar fretting hand'],
    link: ['try/#piano', 'Try piano'],
  },
  {
    id: 'posture',
    name: 'wobbl for posture',
    status: 'Early access',
    line: 'Long stretches at a desk.',
    palette: 'sage',
    seed: 15,
    light: true,
    cue: 'Sit back up. Your head is sliding forward.',
    chip: 'Head height 74% of your baseline',
    drills: ['Sitting at a desk, against your own baseline'],
    link: ['try/#desk', 'Try it at your desk'],
  },
];

export default function Products() {
  return (
    <section id="products" className="bg-mist px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-page">
        <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-6 lg:grid-cols-2">
          <h2 className="display text-section [text-wrap:balance]">One coach for the whole body.</h2>
          <p className="max-w-lg text-lead text-muted lg:justify-self-end">
            Three products on one engine. Each skill is a set of rules: which joints to measure, the
            targets, and what to say when you miss them.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-3">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="flex flex-col overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-black/5">
              <div className="relative flex aspect-[4/3] flex-col justify-end gap-2 overflow-hidden p-4">
                <Landscape palette={p.palette} seed={p.seed} horizon={0.46} sun={[0.3, 0.42]} />
                <div
                  className={`relative flex items-start gap-2.5 rounded-2xl px-3.5 py-3 ${
                    p.light ? 'bg-white/85 text-ink shadow-soft backdrop-blur' : 'glass text-white'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    <Mark size={18} />
                  </span>
                  <p className="text-[14px] leading-snug">{p.cue}</p>
                </div>
                <span
                  className={`relative self-start rounded-full px-3 py-1 text-[12px] font-medium tabular-nums ${
                    p.light ? 'bg-white/85 text-signal backdrop-blur' : 'bg-white text-signal'
                  }`}
                >
                  {p.chip}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="display text-[26px] leading-tight">{p.name}</h3>
                  <span className="shrink-0 rounded-full bg-mist px-2.5 py-1 text-[12px] text-muted">{p.status}</span>
                </div>
                <p className="mt-1 text-[15px] text-muted">{p.line}</p>
                <ul className="mt-5 flex-1 space-y-2 text-[15px]">
                  {p.drills.map((d) => (
                    <li key={d} className="flex gap-2.5">
                      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>
                <a href={p.link[0]} className="btn-secondary mt-6 self-start">
                  {p.link[1]}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
