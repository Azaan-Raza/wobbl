import { DeskScene, PianoScene, StanceScene } from './figures.jsx';

const PRODUCTS = [
  {
    id: 'sport',
    name: 'sport',
    status: 'Beta',
    line: 'Lifting, basketball and martial arts.',
    Scene: StanceScene,
    drills: [
      ['Squat', 'Depth, chest angle, heels, knee tracking, weight shift and tempo, plus a warning when your reps slow down.'],
      ['Jump shot', 'Leg bend, elbow under the ball, arm extension and follow-through.'],
      ['Tae Kwon Do front stance', 'Front knee, back leg, stance length, posture and back heel.'],
      ['Any other sport', 'An AI coach looks at three frames from each rep along with your joint angles.'],
    ],
    link: ['try/#squat', 'Try squats'],
  },
  {
    id: 'music',
    name: 'music',
    status: 'Early access',
    line: 'Piano and guitar practice.',
    Scene: PianoScene,
    drills: [
      ['Piano', 'Wrist height against your knuckles and how curved your fingers are, from a camera beside the keys.'],
      ['Guitar', 'How far your fretting wrist bends, where your head is, and shoulder tension.'],
    ],
    link: ['try/#piano', 'Try piano'],
  },
  {
    id: 'posture',
    name: 'posture',
    status: 'Early access',
    line: 'Long stretches at a desk.',
    Scene: DeskScene,
    drills: [
      [
        'Sitting',
        'It saves how you sit when you sit well, then speaks up if you slouch, hunch, lean or creep toward the screen for more than 8 seconds.',
      ],
    ],
    link: ['try/#desk', 'Try it at your desk'],
  },
];

export default function Products() {
  return (
    <section id="products" className="border-t border-rule px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-page">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-12">
          <h2 className="display text-section lg:col-span-5">One engine, three products.</h2>
          <p className="max-w-xl text-lead text-muted lg:col-span-6 lg:col-start-7 lg:pt-2">
            All three run on the same tracking and coaching engine. Adding a skill means writing its
            rules: which joints to measure, the targets, and what to say when you miss them.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] border-l border-t border-rule md:grid-cols-3">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="flex flex-col border-b border-r border-rule">
              <div className="relative aspect-[640/420] border-b border-rule bg-mist">
                <svg viewBox={p.Scene.compactViewBox} className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <p.Scene compact />
                </svg>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="display text-2xl tracking-[-0.02em]">wobbl for {p.name}</h3>
                  <span className="shrink-0 text-[13px] text-muted">{p.status}</span>
                </div>
                <p className="mt-1 text-[15px] text-muted">{p.line}</p>
                <dl className="mt-6 flex-1 divide-y divide-rule border-t border-rule">
                  {p.drills.map(([name, text]) => (
                    <div key={name} className="py-3.5">
                      <dt className="text-[15px] font-medium">{name}</dt>
                      <dd className="mt-1 text-[15px] leading-relaxed text-muted">{text}</dd>
                    </div>
                  ))}
                </dl>
                <a href={p.link[0]} className="link mt-4 self-start text-[15px]">
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
