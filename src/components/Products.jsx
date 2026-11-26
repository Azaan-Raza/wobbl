import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Landscape from './Landscape.jsx';
import { Mark } from './Logo.jsx';
import { DeskSkeleton, HandSkeleton, StanceSkeleton } from './Skeletons.jsx';

// One stage, three products. The tabs switch the painted backdrop, the
// camera view, the spoken cue and the measurements. It moves on by itself
// every few seconds until you pick one.
const PRODUCTS = [
  {
    id: 'sport',
    name: 'Sport',
    status: 'Beta',
    title: 'Lifting, basketball and martial arts.',
    body: 'It checks the angles a coach would look at: depth and chest on a squat, the elbow on a jump shot, the front knee in a Tae Kwon Do stance.',
    palette: 'ember',
    seed: 9,
    Skeleton: StanceSkeleton,
    view: 'Front stance, side view',
    cue: 'Bend your front knee more. Knee over your toes.',
    rows: [
      ['Front knee bend', '142°', '135° or less', false],
      ['Back leg straight', '177°', 'over 160°', true],
      ['Stance length', '1.8× torso', '1.0× or longer', true],
    ],
    drills: [
      ['Squat', 'Depth, chest, heels, knees, balance and tempo, plus a rest note when you slow down.'],
      ['Jump shot', 'Leg bend, elbow under the ball, extension and follow-through.'],
      ['Tae Kwon Do front stance', 'Front knee, back leg, stance length, posture and back heel.'],
      ['Any other sport', 'The AI coach looks at three frames from each rep along with your joint angles.'],
    ],
    href: 'try/#squat',
  },
  {
    id: 'music',
    name: 'Music',
    status: 'Early access',
    title: 'Hand position for piano and guitar.',
    body: 'Set the camera beside the keys or across from the neck. It watches your wrist and fingers while you play and speaks up when your hand starts to collapse.',
    palette: 'night',
    seed: 4,
    Skeleton: HandSkeleton,
    view: 'Piano, right hand',
    cue: 'Lift your wrist so it lines up with your knuckles.',
    rows: [
      ['Wrist height', 'below knuckles', 'level with knuckles', false],
      ['Curved fingers', '151°', 'under 165°', true],
      ['Wrist not too high', 'level', 'level with knuckles', true],
    ],
    drills: [
      ['Piano hand position', 'Wrist height against your knuckles and how curved your fingers are.'],
      ['Guitar fretting hand', 'How far your wrist bends, where your head is, and shoulder tension.'],
    ],
    href: 'try/#piano',
  },
  {
    id: 'posture',
    name: 'Posture',
    status: 'Early access',
    title: 'Long stretches at a desk.',
    body: "It saves how you sit when you're sitting well, then tells you when you've slouched, hunched, leaned or crept toward the screen for more than 8 seconds.",
    palette: 'sage',
    seed: 15,
    light: true,
    Skeleton: DeskSkeleton,
    view: 'Sitting, front view',
    cue: 'Sit back up. Your head is sliding forward.',
    rows: [
      ['Head over shoulders', '74% of baseline', 'over 82%', false],
      ['Shoulders down', '93% of baseline', 'over 80%', true],
      ['Sitting level', '3°', 'under 7°', true],
    ],
    drills: [['Sitting at a desk', 'Head height, shoulders, tilt and distance from the screen, against your own baseline.']],
    href: 'try/#desk',
  },
];

const ROTATE_MS = 7000;

export default function Products() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const tabs = useRef([]);

  useEffect(() => {
    if (reduce || !auto || paused) return undefined;
    const id = setTimeout(() => setIndex((i) => (i + 1) % PRODUCTS.length), ROTATE_MS);
    return () => clearTimeout(id);
  }, [reduce, auto, paused, index]);

  const pick = (i) => {
    setIndex(i);
    setAuto(false);
  };
  const onKey = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (index + step + PRODUCTS.length) % PRODUCTS.length;
    pick(next);
    tabs.current[next]?.focus();
  };

  const p = PRODUCTS[index];
  const fade = reduce
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.45, ease: 'easeOut' } };
  const rise = reduce
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.35, ease: 'easeOut' } };

  return (
    <section
      id="products"
      className="px-5 py-24 sm:px-8 sm:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-page">
        <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-6 lg:grid-cols-2">
          <h2 className="display text-section [text-wrap:balance]">One engine. Three ways to train.</h2>
          <p className="max-w-lg text-lead text-muted lg:justify-self-end">
            Every product runs on the same tracking and coaching. Each skill is its own set of rules: which
            joints to measure, the targets, and what to say when you miss them.
          </p>
        </div>

        {/* the product switcher */}
        <div role="tablist" aria-label="wobbl products" className="mt-14 grid grid-cols-3 border-b border-rule" onKeyDown={onKey}>
          {PRODUCTS.map((item, i) => {
            const on = i === index;
            return (
              <button
                key={item.id}
                ref={(el) => (tabs.current[i] = el)}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={on}
                aria-controls="product-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => pick(i)}
                className="group relative pb-5 pr-3 text-left"
              >
                <span className={`block text-[12px] transition-colors sm:text-[13px] ${on ? 'text-muted' : 'text-muted/70'}`}>{item.status}</span>
                <span
                  className={`display mt-1 block text-[19px] leading-tight transition-colors sm:text-[34px] lg:text-[42px] ${
                    on ? 'text-ink' : 'text-ink/30 group-hover:text-ink/60'
                  }`}
                >
                  wobbl {item.name}
                </span>
                <span className="absolute inset-x-0 -bottom-px h-[2px] overflow-hidden rounded-full" aria-hidden="true">
                  {on && (
                    <span
                      key={`${index}-${auto}`}
                      className="block h-full bg-ink"
                      style={
                        auto && !reduce
                          ? { animation: `wobbl-progress ${ROTATE_MS}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }
                          : { width: '100%' }
                      }
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div
          id="product-panel"
          role="tabpanel"
          aria-labelledby={`tab-${p.id}`}
          className="mt-10 grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14"
        >
          {/* words */}
          <div className="order-2 lg:order-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={p.id} {...rise}>
                <h3 className="display text-title">{p.title}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-muted">{p.body}</p>
                <dl className="mt-7 space-y-4">
                  {p.drills.map(([name, text]) => (
                    <div key={name} className="flex gap-3">
                      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" aria-hidden="true" />
                      <div>
                        <dt className="text-[15px] font-medium">{name}</dt>
                        <dd className="text-[15px] leading-relaxed text-muted">{text}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
                <a href={p.href} className="btn-accent mt-8">
                  Try wobbl {p.name}
                </a>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* the stage */}
          <div className="relative order-1 overflow-hidden rounded-card sm:aspect-[5/4] lg:order-2">
            <AnimatePresence initial={false}>
              <motion.div key={p.id} className="absolute inset-0" {...fade}>
                <Landscape palette={p.palette} seed={p.seed} horizon={0.5} sun={[0.68, 0.46]} />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={p.id} className="relative flex flex-col gap-3 p-4 sm:absolute sm:inset-0 sm:block sm:p-0" {...rise}>
                {/* camera view */}
                <div className="relative overflow-hidden rounded-2xl bg-night shadow-window ring-1 ring-white/10 sm:absolute sm:left-[5%] sm:top-[5%] sm:w-[58%]">
                  <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-signal-bright" aria-hidden="true" />
                    Live
                    <span className="text-white/40">{p.view}</span>
                  </div>
                  <div className="aspect-[4/3] bg-[radial-gradient(120%_90%_at_50%_0%,#1E2554_0%,#0C0D12_60%)] px-2 pb-2">
                    <p.Skeleton />
                  </div>
                </div>

                {/* what it says */}
                <div
                  className={`relative rounded-2xl px-4 py-3.5 sm:absolute sm:right-[5%] sm:top-[18%] sm:w-[40%] ${
                    p.light ? 'bg-white/85 text-ink shadow-lift backdrop-blur' : 'glass text-white shadow-lift'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mark size={18} />
                    <span className={`text-[12px] ${p.light ? 'text-muted' : 'text-white/60'}`}>wobbl says</span>
                  </div>
                  <p className="mt-2 text-[15px] leading-snug sm:text-[16px]">{p.cue}</p>
                </div>

                {/* what it measured */}
                <div className="relative rounded-2xl bg-white/95 px-4 py-1 shadow-lift backdrop-blur sm:absolute sm:bottom-[5%] sm:right-[5%] sm:w-[56%]">
                  <ul className="divide-y divide-rule">
                    {p.rows.map(([label, value, target, ok]) => (
                      <li key={label} className="flex items-center gap-2.5 py-2.5 text-[13px]">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${ok ? 'bg-cobalt' : 'bg-signal'}`} aria-label={ok ? 'in range' : 'off'} />
                        <span className="min-w-0 flex-1 truncate">{label}</span>
                        <span className="text-right">
                          <span className={`tabular-nums ${ok ? '' : 'font-medium text-signal'}`}>{value}</span>
                          <span className="hidden text-muted sm:inline"> / {target}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
