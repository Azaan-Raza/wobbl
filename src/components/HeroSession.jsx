import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import WindowBar from './WindowBar.jsx';

// A scripted preview of a live session: the pose overlay the real demo draws,
// a ring on the joint being corrected, and the cue the athlete hears. It is an
// illustration, not live data, so the cues are written to match the pose.

// Side view of a front stance with a middle punch, in a 400 x 300 frame.
const J = {
  shoulderL: [200, 98],
  shoulderR: [214, 100],
  elbowR: [256, 102],
  wristR: [300, 104],
  elbowL: [176, 128],
  wristL: [196, 150],
  hipL: [190, 172],
  hipR: [202, 174],
  kneeR: [250, 204],
  ankleR: [256, 252],
  heelR: [246, 258],
  toeR: [280, 258],
  kneeL: [150, 212],
  ankleL: [112, 250],
  heelL: [104, 257],
  toeL: [128, 258],
};

const BONES = [
  ['shoulderL', 'shoulderR'],
  ['shoulderL', 'hipL'],
  ['shoulderR', 'hipR'],
  ['hipL', 'hipR'],
  ['shoulderR', 'elbowR'],
  ['elbowR', 'wristR'],
  ['shoulderL', 'elbowL'],
  ['elbowL', 'wristL'],
  ['hipR', 'kneeR'],
  ['kneeR', 'ankleR'],
  ['ankleR', 'heelR'],
  ['ankleR', 'toeR'],
  ['heelR', 'toeR'],
  ['hipL', 'kneeL'],
  ['kneeL', 'ankleL'],
  ['ankleL', 'heelL'],
  ['ankleL', 'toeL'],
  ['heelL', 'toeL'],
];

// Extra dots along every bone, the same way the live overlay densifies the net.
const DENSE = BONES.flatMap(([a, b]) =>
  [0.25, 0.5, 0.75].map((f) => [
    J[a][0] + (J[b][0] - J[a][0]) * f,
    J[a][1] + (J[b][1] - J[a][1]) * f,
  ])
);

const CUES = [
  { text: 'Sink lower. Bend your front knee over your toes.', joint: 'kneeR' },
  { text: 'Pull your back fist tight to your hip.', joint: 'wristL' },
  { text: 'Keep your back heel on the floor.', joint: 'heelL' },
  { text: 'Punch at shoulder height, not higher.', joint: 'wristR' },
];

const STEP_MS = 3200;

function clock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function HeroSession() {
  const reduce = useReducedMotion();
  // Start on the third cue so the feed is already full when the page loads.
  const [step, setStep] = useState(2);

  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => setStep((s) => s + 1), STEP_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const current = CUES[step % CUES.length];
  const [rx, ry] = J[current.joint];

  // Newest first, at most three on screen.
  const feed = (reduce ? [0, 1, 2] : [step, step - 1, step - 2])
    .filter((n) => n >= 0)
    .map((n) => ({ n, ...CUES[n % CUES.length], at: clock(4 + n * 3) }));

  return (
    <div className="window mx-auto max-w-5xl text-left">
      <WindowBar title="live session">
        <span className="hidden rounded-full border border-hairline bg-white px-2.5 py-0.5 text-xs text-muted sm:inline">
          martial arts
        </span>
      </WindowBar>

      <div className="grid md:grid-cols-[1.4fr_1fr]">
        {/* Camera stage */}
        <div className="relative aspect-[4/3] bg-stage">
          <svg
            viewBox="0 0 400 300"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Pose overlay of an athlete in a front stance throwing a punch"
          >
            <line
              x1="40"
              x2="360"
              y1="262"
              y2="262"
              stroke="#2E2E2E"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            {/* Head */}
            <circle cx="224" cy="66" r="15" fill="none" stroke="#00E07A" strokeOpacity="0.55" strokeWidth="2" />
            <line x1="207" y1="99" x2="220" y2="81" stroke="#00E07A" strokeOpacity="0.7" strokeWidth="2.5" />
            {BONES.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={J[a][0]}
                y1={J[a][1]}
                x2={J[b][0]}
                y2={J[b][1]}
                stroke="#00E07A"
                strokeOpacity="0.7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
            {DENSE.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.4" fill="#00E07A" fillOpacity="0.85" />
            ))}
            {Object.entries(J).map(([k, [x, y]]) => (
              <circle key={k} cx={x} cy={y} r="3.6" fill="#151515" stroke="#00E07A" strokeWidth="1.2" />
            ))}
            {/* The joint the current cue is about */}
            <motion.circle
              r="13"
              fill="#FFFFFF"
              fillOpacity="0.08"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              initial={false}
              animate={{ cx: rx, cy: ry }}
              transition={{ duration: reduce ? 0 : 0.5, ease: 'easeInOut' }}
            />
          </svg>

          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-[#FF453A]" />
            <span className="text-[11px] font-semibold tracking-wide text-white">REC</span>
          </div>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-[11px] font-semibold tracking-wide text-accent">Good distance</span>
          </div>
        </div>

        {/* What the athlete hears */}
        <div className="flex flex-col border-t border-hairline md:border-l md:border-t-0">
          <div className="flex items-center gap-2 border-b border-hairline px-5 py-3">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <p className="text-[13px] font-medium">live feedback</p>
          </div>
          <ul className="flex-1 space-y-3 p-4" aria-live="off">
            <AnimatePresence initial={false}>
              {feed.map((cue, i) => (
                <motion.li
                  key={cue.n}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: -12 }}
                  animate={{ opacity: i === 0 ? 1 : 0.55, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={`rounded-xl border p-3.5 ${
                    i === 0 ? 'border-ink bg-white' : 'border-hairline bg-paper'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Volume2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${i === 0 ? 'text-ink' : 'text-muted'}`}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <p className="text-[15px] leading-snug">{cue.text}</p>
                  </div>
                  <p className="mt-1.5 pl-[26px] font-mono text-[11px] text-muted">{cue.at}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </div>
  );
}
