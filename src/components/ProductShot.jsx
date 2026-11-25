import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Mark } from './Logo.jsx';
import { DeskScene, PianoScene, StanceScene } from './figures.jsx';

// The hero's product view. Drawn, not live, but laid out like the app and
// with numbers measured from the drawings.
const SCENES = [
  {
    id: 'sport',
    product: 'Sport',
    drill: 'Front stance',
    Scene: StanceScene,
    chips: ['Side view', 'Tracking good'],
    clock: '0:42',
    cue: 'Bend your front knee more. Knee over your toes.',
    rows: [
      ['Front knee bend', '142°', '135° or less', false],
      ['Back leg straight', '177°', 'over 160°', true],
      ['Stance length', '1.8× torso', '1.0× or longer', true],
      ['Upright torso', '4°', 'under 15°', true],
      ['Back heel down', 'flat', 'flat', true],
    ],
  },
  {
    id: 'music',
    product: 'Music',
    drill: 'Piano hand position',
    Scene: PianoScene,
    chips: ['Right hand', 'Tracking good'],
    clock: '3:15',
    cue: 'Lift your wrist so it lines up with your knuckles.',
    rows: [
      ['Wrist not sagging', 'below knuckles', 'level with knuckles', false],
      ['Wrist not too high', 'level', 'level with knuckles', true],
      ['Curved fingers', '151°', 'under 165°', true],
    ],
  },
  {
    id: 'posture',
    product: 'Posture',
    drill: 'Sitting at a desk',
    Scene: DeskScene,
    chips: ['Front view', 'Baseline saved'],
    clock: '24:08',
    cue: 'Sit back up. Your head is sliding forward.',
    rows: [
      ['Head over shoulders', '74% of baseline', 'over 82%', false],
      ['Shoulders down', '93% of baseline', 'over 80%', true],
      ['Sitting level', '3°', 'under 7°', true],
      ['Distance from screen', 'fine', 'within 20%', true],
    ],
  },
];

const STEP_MS = 6000;

export default function ProductShot() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (reduce || !auto) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % SCENES.length), STEP_MS);
    return () => clearInterval(id);
  }, [reduce, auto]);

  const scene = SCENES[index];
  const fade = reduce
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } };

  return (
    <div className="panel text-left">
      <div className="panel-bar justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5 text-[14px]">
          <Mark size={20} />
          <span className="hidden text-muted sm:inline">{scene.product}</span>
          <span className="hidden text-line sm:inline" aria-hidden="true">/</span>
          <span className="hidden truncate font-medium sm:inline">{scene.drill}</span>
        </div>
        <div role="tablist" aria-label="Products" className="segmented">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => {
                setIndex(i);
                setAuto(false);
              }}
            >
              {s.product}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="relative aspect-[640/420] bg-mist">
          <AnimatePresence mode="wait" initial={false}>
            <motion.svg
              key={scene.id}
              viewBox={scene.Scene.viewBox}
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label={`Tracking view: ${scene.drill}, with the joint to fix marked in red`}
              {...fade}
            >
              <scene.Scene />
            </motion.svg>
          </AnimatePresence>
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 text-[12px] font-medium">
            <span className="flex items-center gap-1.5 bg-ink px-2 py-1 text-white">
              <span className="h-1.5 w-1.5 bg-signal" aria-hidden="true" />
              Live <span className="tabular-nums text-white/70">{scene.clock}</span>
            </span>
            {scene.chips.map((c) => (
              <span key={c} className="hidden border border-rule bg-white px-2 py-1 text-ink sm:inline">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col border-t border-rule md:border-l md:border-t-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={scene.id} {...fade} className="flex flex-1 flex-col">
              <div className="border-b border-rule p-5">
                <p className="flex items-center gap-2 text-[13px] text-muted">
                  <Volume2 className="h-4 w-4 text-cobalt" aria-hidden="true" />
                  wobbl says
                </p>
                <p className="display mt-2 text-[1.3rem] leading-snug tracking-[-0.01em]">{scene.cue}</p>
              </div>
              <ul className="divide-y divide-rule px-5">
                {scene.rows.map(([label, value, target, ok]) => (
                  <li key={label} className="flex items-start gap-3 py-3 text-[14px]">
                    <span
                      className={`mt-[7px] h-2 w-2 shrink-0 ${ok ? 'bg-cobalt' : 'bg-signal'}`}
                      aria-label={ok ? 'in range' : 'off'}
                    />
                    <span className="min-w-0 flex-1">{label}</span>
                    <span className="text-right">
                      <span className={`tabular-nums ${ok ? '' : 'font-medium text-signal'}`}>{value}</span>
                      <span className="block text-[12px] text-muted">target {target}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
