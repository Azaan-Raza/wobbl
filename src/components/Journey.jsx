import { useEffect, useRef, useState } from 'react';
import { Check, Download } from 'lucide-react';
import Landscape from './Landscape.jsx';
import { Mark } from './Logo.jsx';
import useWidth from '../hooks/useWidth.js';
import { P } from '../engine/landmarks.js';
import { poseFor } from '../demo/motion.js';

// Before, during and after a set, each with a product card on a painted
// backdrop. The numbers match what the engine does with the homepage demo:
// four squats, the first two shallow (65 each), the last two deep (100 each).
const STEPS = [
  {
    id: 'before',
    nav: 'Before your set',
    palette: 'dawn',
    seed: 3,
    title: 'It checks the camera before it coaches.',
    body: "wobbl makes sure it can see your whole body, at a usable distance and the right angle, and that the tracking is confident. If something's off, it tells you how to fix it instead of guessing.",
    Visual: CameraCheck,
  },
  {
    id: 'during',
    nav: 'During your set',
    palette: 'day',
    seed: 21,
    title: 'It only talks when a mistake keeps happening.',
    body: "Every rep is timed, measured and scored against a coach's rules. One shallow squat gets noted. Two in your last three gets a cue, out loud. Fix it and it tells you. It never says more than one thing at a time, and never repeats itself within 15 seconds.",
    Visual: DuringSet,
  },
  {
    id: 'after',
    nav: 'After your set',
    palette: 'ember',
    seed: 5,
    title: "A report you'll actually read.",
    body: 'Score and speed for every rep, how consistent you were, a note if your reps slowed down by a quarter, and your best and worst rep replayed side by side. Download it as CSV for your coach.',
    Visual: Report,
  },
];

export default function Journey() {
  const [active, setActive] = useState('before');
  const refs = useRef({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.dataset.step);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.25, 0.5] }
    );
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="px-5 pb-24 pt-8 sm:px-8 sm:pb-32 sm:pt-12">
      <div className="mx-auto max-w-page">
        <h2 className="display max-w-3xl text-section [text-wrap:balance]">
          wobbl helps before, during and after every set.
        </h2>

        <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="Steps" className="hidden lg:block">
            <ul className="sticky top-28 space-y-1">
              {STEPS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#step-${s.id}`}
                    className={`block border-b py-3 text-[15px] transition-colors ${
                      active === s.id ? 'border-ink text-ink' : 'border-rule text-muted hover:text-ink'
                    }`}
                  >
                    {s.nav}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-24 sm:space-y-32">
            {STEPS.map((s) => (
              <article
                key={s.id}
                id={`step-${s.id}`}
                data-step={s.id}
                ref={(el) => (refs.current[s.id] = el)}
                className="scroll-mt-28"
              >
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-card p-5 sm:aspect-[16/11] sm:p-10">
                  <Landscape palette={s.palette} seed={s.seed} horizon={0.5} />
                  <div className="relative w-full">
                    <s.Visual />
                  </div>
                </div>
                <p className="mt-8 text-[14px] text-muted lg:hidden">{s.nav}</p>
                <h3 className="display mt-2 max-w-2xl text-title lg:mt-8">{s.title}</h3>
                <p className="mt-3 max-w-2xl text-lead text-muted">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ className = '', children }) {
  return <div className={`rounded-2xl bg-white/95 shadow-lift ring-1 ring-black/5 backdrop-blur ${className}`}>{children}</div>;
}

function CameraCheck() {
  const items = [
    ['Whole body in frame', 'Yes'],
    ['Distance', 'Good'],
    ['Camera angle', 'Side view'],
    ['Tracking', 'Good'],
  ];
  return (
    <Card className="mx-auto max-w-sm p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">Camera check</p>
        <span className="rounded-full bg-cobalt-wash px-2.5 py-1 text-[12px] font-medium text-cobalt">4 of 4 ok</span>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <li key={label} className="flex items-center gap-3 text-[14px]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cobalt text-white" aria-hidden="true">
              <Check className="h-3 w-3" strokeWidth={3.5} />
            </span>
            <span className="flex-1">{label}</span>
            <span className="text-muted">{value}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 rounded-xl bg-mist px-3.5 py-2.5 text-[13px] text-muted">Ready. Start your first rep.</p>
    </Card>
  );
}

// Knee angle over the four demo reps.
const REPS = [
  { start: 0.6, bottom: 108 },
  { start: 3.4, bottom: 106, said: 'cue' },
  { start: 6.2, bottom: 96 },
  { start: 9.0, bottom: 94, said: 'praise' },
];
const REP_S = 2.2;

function kneeAt(t) {
  for (const r of REPS) {
    const p = (t - r.start) / REP_S;
    if (p >= 0 && p <= 1) return 174 - (174 - r.bottom) * ((1 - Math.cos(2 * Math.PI * p)) / 2);
  }
  return 174;
}

function DuringSet() {
  return (
    <div className="relative mx-auto max-w-2xl">
      <Card className="p-4 pt-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3 px-1">
          <p className="text-[15px] font-semibold">Knee angle, 4 squats</p>
          <p className="text-[12px] text-muted">target under 100° at the bottom</p>
        </div>
        <KneeChart />
      </Card>
      <div className="absolute -top-6 left-4 right-4 sm:-top-8 sm:left-auto sm:right-[-12px] sm:max-w-xs">
        <Card className="flex items-start gap-3 p-3.5">
          <Mark size={22} />
          <div>
            <p className="text-[12px] text-muted">After rep 2</p>
            <p className="text-[14px] leading-snug">Sit lower. Get your thighs down to parallel.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KneeChart() {
  const [ref, width] = useWidth(560);
  const height = width < 420 ? 190 : 230;
  const pad = { l: 36, r: 8, t: 26, b: 24 };
  const x = (s) => pad.l + (s / 12) * (width - pad.l - pad.r);
  const y = (a) => pad.t + ((180 - a) / 100) * (height - pad.t - pad.b);
  const pts = [];
  for (let t = 0; t <= 12.0001; t += 0.05) pts.push(`${x(t).toFixed(1)},${y(kneeAt(t)).toFixed(1)}`);

  return (
    <div ref={ref} className="mt-2">
      <svg width={width} height={height} className="block" role="img" aria-label="Knee angle over four squats. The first two bottom out at 108 and 106 degrees, above the 100 degree target. The last two reach 96 and 94.">
        <rect x={pad.l} y={y(100)} width={width - pad.l - pad.r} height={height - pad.b - y(100)} rx="6" fill="#EEF1FE" />
        {[180, 140].map((a) => (
          <g key={a}>
            <line x1={pad.l} x2={width - pad.r} y1={y(a)} y2={y(a)} stroke="#EBEBEF" />
            <text x={pad.l - 8} y={y(a) + 4} textAnchor="end" fontSize="11" fill="#62626B">
              {a}°
            </text>
          </g>
        ))}
        <line x1={pad.l} x2={width - pad.r} y1={y(100)} y2={y(100)} stroke="#2346F5" strokeDasharray="4 4" />
        <text x={pad.l - 8} y={y(100) + 4} textAnchor="end" fontSize="11" fill="#16161B" fontWeight="600">
          100°
        </text>
        <polyline points={pts.join(' ')} fill="none" stroke="#2346F5" strokeWidth="2.25" strokeLinejoin="round" />
        {REPS.map((r, i) => {
          const cx = x(r.start + REP_S / 2);
          const ok = r.bottom <= 100;
          return (
            <g key={r.start}>
              <text x={cx} y={pad.t - 10} textAnchor="middle" fontSize="11" fill="#62626B">
                Rep {i + 1}
              </text>
              <circle cx={cx} cy={y(r.bottom)} r="5" fill={ok ? '#2346F5' : '#D13A22'} stroke="#fff" strokeWidth="2" />
              <text x={cx} y={y(r.bottom) + 20} textAnchor="middle" fontSize="12" fontWeight="600" fill="#16161B" stroke="#fff" strokeWidth="4" paintOrder="stroke">
                {r.bottom}°
              </text>
              {r.said && (
                <circle cx={x(r.start + REP_S)} cy={pad.t - 14} r="4" fill={r.said === 'cue' ? '#D13A22' : '#2346F5'}>
                  <title>{r.said === 'cue' ? 'Cue spoken' : 'Praise spoken'}</title>
                </circle>
              )}
            </g>
          );
        })}
        <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke="#D6D6DC" />
        {[0, 4, 8, 12].map((s) => (
          <text key={s} x={x(s)} y={height - 6} textAnchor="middle" fontSize="11" fill="#62626B">
            {s} s
          </text>
        ))}
      </svg>
    </div>
  );
}

// The demo's own skeleton at the bottom of a rep, for the replay card.
const MINI_BONES = [
  [P.leftShoulder, P.leftElbow], [P.leftElbow, P.leftWrist], [P.leftShoulder, P.leftHip],
  [P.leftHip, P.leftKnee], [P.leftKnee, P.leftAnkle], [P.leftAnkle, P.leftHeel], [P.leftHeel, P.leftFoot], [P.leftAnkle, P.leftFoot],
];
function MiniRep({ knee, bad }) {
  const pose = poseFor(knee);
  const at = (p) => [60 + (p.x - 0.5) * 150, 116 + (p.y - 0.89) * 150];
  const faulty = new Set(bad ? [P.leftHip, P.leftKnee, P.leftAnkle] : []);
  const ear = at(pose[P.leftEar]);
  return (
    <svg viewBox="0 0 120 124" className="h-full w-full" aria-hidden="true">
      <line x1="8" x2="112" y1="119" y2="119" stroke="#D6D6DC" />
      {MINI_BONES.map(([a, b]) => {
        const [x1, y1] = at(pose[a]);
        const [x2, y2] = at(pose[b]);
        return (
          <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={faulty.has(a) && faulty.has(b) ? '#D13A22' : '#2346F5'} strokeWidth="2.5" strokeLinecap="round" />
        );
      })}
      <circle cx={ear[0] + 2} cy={ear[1] - 1} r="7" fill="none" stroke="#2346F5" strokeWidth="2" />
      {[P.leftShoulder, P.leftWrist, P.leftHip, P.leftKnee, P.leftAnkle].map((i) => {
        const [x, y] = at(pose[i]);
        return <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={bad && i === P.leftKnee ? '#D13A22' : '#2346F5'} strokeWidth="2" />;
      })}
    </svg>
  );
}

function Report() {
  const scores = [65, 65, 100, 100];
  return (
    <div className="relative mx-auto max-w-2xl">
      <Card className="p-5 sm:p-7">
        <p className="text-[13px] text-muted">Session report, squat</p>
        <p className="display mt-1 text-[30px] leading-tight sm:text-[36px]">4 reps, averaging 83.</p>
        <p className="mt-2 text-[14px] text-muted">Work on depth next time. It was off in 50% of your reps.</p>
        <div className="mt-6 flex h-28 items-end gap-3 sm:w-1/2" role="img" aria-label="Scores per rep: 65, 65, 100, 100">
          {scores.map((s, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[11px] tabular-nums text-muted">{s}</span>
              <div className={`w-full max-w-[36px] rounded-md ${s < 100 ? 'bg-signal' : 'bg-cobalt'}`} style={{ height: `${s * 0.8}px` }} />
              <span className="text-[11px] text-muted">{i + 1}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="absolute -bottom-8 right-3 w-[62%] max-w-[300px] sm:-bottom-10 sm:right-[-16px]">
        <Card className="p-3">
          <p className="px-1 text-[12px] font-medium">Replay</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              ['Best, rep 4', 94, false],
              ['Worst, rep 1', 108, true],
            ].map(([label, knee, bad]) => (
              <div key={label} className="rounded-xl bg-mist p-1.5">
                <div className="h-20">
                  <MiniRep knee={knee} bad={bad} />
                </div>
                <p className="px-1 pb-0.5 text-[11px] text-muted">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <span className="absolute -top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium shadow-lift ring-1 ring-black/5">
        <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download CSV
      </span>
    </div>
  );
}
