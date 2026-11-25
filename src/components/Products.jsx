import WindowBar from './WindowBar.jsx';
import { DeskFigure, PianoFigure, StanceFigure } from './figures.jsx';

const PRODUCTS = [
  {
    id: 'sport',
    name: 'Sport',
    status: 'Beta',
    line: 'For lifting, basketball and martial arts.',
    Figure: StanceFigure,
    drills: [
      ['Squat', 'Depth, chest angle, heels, knee tracking and how fast you lower.'],
      ['Jump shot', 'Leg bend, elbow under the ball, arm extension and follow-through.'],
      ['Tae Kwon Do front stance', 'Front knee, back leg, stance length, posture and back heel.'],
      ['Any other sport', 'An AI coach looks at three frames from each rep, plus your joint angles.'],
    ],
    link: ['/try/#squat', 'Try squats'],
  },
  {
    id: 'music',
    name: 'Music',
    status: 'Early access',
    line: 'For practicing piano and guitar.',
    Figure: PianoFigure,
    drills: [
      ['Piano', 'Wrist height and how curved your fingers are, from a camera beside the keys.'],
      ['Guitar', 'How far your fretting wrist bends, where your head is, and shoulder tension.'],
    ],
    link: ['/try/#piano', 'Try piano'],
  },
  {
    id: 'posture',
    name: 'Posture',
    status: 'Early access',
    line: 'For long stretches at a desk.',
    Figure: DeskFigure,
    drills: [
      [
        'Sitting',
        'It learns how you sit when you sit well, then speaks up if you slouch, hunch, lean or creep toward the screen for more than 8 seconds.',
      ],
    ],
    link: ['/try/#desk', 'Try it at your desk'],
  },
];

export default function Products() {
  return (
    <section id="products" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-page">
        <div className="max-w-2xl">
          <h2 className="text-section font-semibold">What it coaches</h2>
          <p className="mt-5 text-lead text-muted">
            All three use the same tracking engine. Adding a new skill means writing its rules.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="window flex flex-col">
              <WindowBar title={p.name}>
                <span className="rounded-full border border-hairline bg-white px-2.5 py-0.5 text-xs text-muted">
                  {p.status}
                </span>
              </WindowBar>
              <div className="relative aspect-[4/3] bg-stage">
                <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <p.Figure />
                </svg>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-1 text-[15px] text-muted">{p.line}</p>
                <dl className="mt-5 flex-1 space-y-4">
                  {p.drills.map(([name, text]) => (
                    <div key={name}>
                      <dt className="text-[15px] font-medium">{name}</dt>
                      <dd className="mt-0.5 text-[15px] leading-relaxed text-muted">{text}</dd>
                    </div>
                  ))}
                </dl>
                <a href={p.link[0]} className="pill-outline mt-6 self-start py-2.5 text-sm">
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
