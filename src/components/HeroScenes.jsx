import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import WindowBar from './WindowBar.jsx';
import { DeskFigure, PianoFigure, StanceFigure } from './figures.jsx';

// Illustrations, not live data. The numbers match what's drawn.
const SCENES = [
  {
    id: 'sport',
    tab: 'Sport',
    title: 'Front stance',
    Figure: StanceFigure,
    ring: 'kneeR',
    cue: 'Bend your front knee more. Knee over your toes.',
    rows: [
      ['Front knee bend', '142°', '135° or less', false],
      ['Back leg straight', '180°', 'over 160°', true],
      ['Stance length', '1.9× torso', '1.0× or longer', true],
      ['Upright torso', '8°', 'under 15°', true],
    ],
  },
  {
    id: 'music',
    tab: 'Music',
    title: 'Piano hand position',
    Figure: PianoFigure,
    ring: 'wrist',
    cue: 'Lift your wrist so it lines up with your knuckles.',
    rows: [
      ['Wrist height', 'below knuckles', 'level', false],
      ['Curved fingers', '151°', 'under 165°', true],
    ],
  },
  {
    id: 'posture',
    tab: 'Posture',
    title: 'Sitting at a desk',
    Figure: DeskFigure,
    ring: 'nose',
    cue: 'Sit back up. Your head is sliding forward.',
    rows: [
      ['Head over shoulders', '74% of baseline', 'over 82%', false],
      ['Shoulders down', '93% of baseline', 'over 80%', true],
      ['Sitting level', '3°', 'under 7°', true],
    ],
  },
];

const STEP_MS = 5500;

export default function HeroScenes() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (reduce || !auto) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % SCENES.length), STEP_MS);
    return () => clearInterval(id);
  }, [reduce, auto]);

  const scene = SCENES[index];
  const fade = reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  return (
    <div className="window mx-auto max-w-5xl text-left">
      <WindowBar title={scene.title}>
        <div role="tablist" aria-label="Products" className="flex rounded-full border border-hairline bg-white p-0.5">
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
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                i === index ? 'bg-ink text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {s.tab}
            </button>
          ))}
        </div>
      </WindowBar>

      <div className="grid md:grid-cols-[1.35fr_1fr]">
        <div className="relative aspect-[4/3] bg-stage">
          <AnimatePresence mode="wait" initial={false}>
            <motion.svg
              key={scene.id}
              viewBox="0 0 400 300"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label={`Tracking overlay: ${scene.title.toLowerCase()}`}
              transition={{ duration: 0.3 }}
              {...fade}
            >
              <scene.Figure ring={scene.ring} />
            </motion.svg>
          </AnimatePresence>
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-[#FF453A]" />
            <span className="text-[11px] font-semibold tracking-wide text-white">LIVE</span>
          </div>
        </div>

        <div className="flex flex-col border-t border-hairline md:border-l md:border-t-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={scene.id} transition={{ duration: 0.3 }} {...fade} className="flex flex-1 flex-col">
              <div className="border-b border-hairline p-5">
                <p className="text-[13px] text-muted">You hear</p>
                <p className="mt-2 flex gap-2.5 text-lg font-medium leading-snug">
                  <Volume2 className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                  {scene.cue}
                </p>
              </div>
              <div className="p-5">
                <p className="text-[13px] text-muted">Measured</p>
                <ul className="mt-2 divide-y divide-hairline">
                  {scene.rows.map(([label, value, target, ok]) => (
                    <li key={label} className="flex items-start gap-3 py-2.5 text-[14px]">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ok ? 'bg-[#16A34A]' : 'bg-[#FF453A]'}`}
                        aria-label={ok ? 'good' : 'needs work'}
                      />
                      <span className="min-w-0 flex-1">{label}</span>
                      <span className="text-right">
                        {value}
                        <span className="block text-[11px] text-muted">target {target}</span>
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
  );
}
