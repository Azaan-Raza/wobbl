import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Coach } from '../engine/coach.js';
import { P } from '../engine/landmarks.js';
import { squat } from '../drills/sport.js';
import { DEMO_MS, demoPose, repStart } from '../demo/motion.js';
import { Mark } from './Logo.jsx';

// The hero's product window. The skeleton is generated motion, but the
// coaching is the real engine: frames go into the same Coach the app uses,
// and the cue, the praise, the scores and the angle all come out of it.
const STEP = 33;
const IDLE = { id: 'idle', kind: 'idle', text: "Watching your squat. I'll speak up if something keeps going wrong." };

function freshState() {
  return { t: 0, pose: demoPose(0), focus: null, faults: [], reps: 0, lastScore: null, results: [], message: IDLE, feed: [] };
}

export default function LiveDemo() {
  const reduce = useReducedMotion();
  const [s, setS] = useState(freshState);
  const box = useRef(null);

  useEffect(() => {
    let coach = new Coach(squat, { smooth: false });
    let state = freshState();
    let sim = 0;

    const advance = (to) => {
      while (sim < to) {
        sim += STEP;
        const events = coach.push({ t: sim, pose: demoPose(sim), world: null, hands: [] });
        for (const e of events) {
          if (e.type === 'rep') state = { ...state, reps: e.index, lastScore: e.score, results: e.results };
          if (e.type === 'cue' || e.type === 'praise' || e.type === 'fatigue') {
            const item = { id: `${e.type}-${sim}`, kind: e.type, text: e.text, at: sim };
            state = { ...state, message: item, feed: [item, ...state.feed].slice(0, 3) };
          }
        }
      }
      const latest = coach.latest;
      state = { ...state, t: sim, pose: demoPose(sim), focus: latest.focus, faults: latest.faultJoints };
    };

    if (reduce) {
      // A still frame just after the cue: rep 3 starting, cue on screen.
      advance(repStart(2) + 300);
      setS(state);
      return undefined;
    }

    let raf = 0;
    let visible = true;
    let last = performance.now();
    let clock = 0;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = performance.now();
    });
    if (box.current) io.observe(box.current);

    const tick = (now) => {
      if (visible) {
        clock += Math.min(100, now - last);
        if (clock >= DEMO_MS) {
          clock = 0;
          sim = 0;
          coach = new Coach(squat, { smooth: false });
          state = freshState();
        }
        advance(clock);
        setS(state);
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduce]);

  const clock = `0:${String(Math.floor(s.t / 1000)).padStart(2, '0')}`;
  const shown = s.results.filter((r) => !r.skipped);

  return (
    <div ref={box} className="overflow-hidden rounded-[18px] bg-white shadow-window ring-1 ring-black/5">
      {/* window chrome */}
      <div className="flex h-11 items-center gap-3 border-b border-rule bg-[#F7F7F9] px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-2 text-[13px] text-muted">
          <Mark size={16} />
          <span className="font-medium text-ink">wobbl</span>
          <span className="hidden sm:inline">Squat</span>
        </div>
        <span className="flex items-center gap-1.5 text-[12px] text-muted">
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Voice on</span>
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        {/* camera stage */}
        <div className="relative aspect-[16/11] overflow-hidden bg-night sm:aspect-[16/10]">
          <Stage pose={s.pose} focus={s.focus} faults={s.faults} />

          <div className="absolute left-3 top-3 flex gap-1.5 text-[12px] font-medium text-white">
            <span className="glass flex items-center gap-1.5 rounded-full px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-bright" aria-hidden="true" />
              Live <span className="tabular-nums text-white/60">{clock}</span>
            </span>
            <span className="glass hidden rounded-full px-2.5 py-1 sm:inline">Side view</span>
          </div>

          <div className="absolute right-3 top-14 hidden w-[min(300px,46%)] sm:block">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={s.message.id}
                initial={reduce ? false : { opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? {} : { opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="glass flex items-start gap-3 rounded-2xl px-4 py-3 text-white"
                aria-live="polite"
              >
                <span className="mt-0.5 shrink-0">
                  <Mark size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] text-white/55">
                    {s.message.kind === 'cue' ? 'Fix' : s.message.kind === 'praise' ? 'Fixed' : 'wobbl'}
                  </span>
                  <span className={`block leading-snug ${s.message.kind === 'idle' ? 'text-[14px] text-white/75' : 'text-[16px] sm:text-[17px]'}`}>
                    {s.message.text}
                  </span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-3 left-3 flex gap-1.5 text-[12px] text-white">
            <span className="glass rounded-full px-2.5 py-1">
              Rep <span className="font-semibold tabular-nums">{s.reps}</span>
            </span>
            {s.lastScore != null && (
              <span className="glass rounded-full px-2.5 py-1">
                Last rep <span className="font-semibold tabular-nums">{s.lastScore}</span>
              </span>
            )}
          </div>
        </div>

        {/* phones: the spoken line sits under the stage */}
        <div className="flex items-start gap-3 bg-night px-4 pb-4 text-white sm:hidden">
          <Mark size={18} />
          <p className={`text-[14px] leading-snug ${s.message.kind === 'idle' ? 'text-white/70' : ''}`}>{s.message.text}</p>
        </div>

        {/* side panel, like the app's */}
        <div className="hidden flex-col border-l border-rule bg-white md:flex">
          <div className="border-b border-rule px-5 py-4">
            <p className="text-[12px] text-muted">Last rep</p>
            <p className="display mt-0.5 text-[34px] leading-none tabular-nums">
              {s.lastScore ?? '–'}
              <span className="font-sans text-[14px] text-muted">{s.lastScore != null ? ' / 100' : ''}</span>
            </p>
          </div>
          <ul className="divide-y divide-rule px-5 text-[13px]">
            {(shown.length ? shown : PLACEHOLDER).map((r) => (
              <li key={r.id} className="flex items-center gap-2.5 py-2.5">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${r.placeholder ? 'bg-rule' : r.fault ? 'bg-signal' : 'bg-cobalt'}`}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">{r.label}</span>
                <span className={`tabular-nums ${r.fault ? 'font-medium text-signal' : 'text-muted'}`}>{r.display ?? ''}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto border-t border-rule px-5 py-4">
            <p className="text-[12px] text-muted">What wobbl said</p>
            <ul className="mt-2 space-y-2">
              {s.feed.length === 0 && <li className="text-[13px] text-muted">Nothing yet.</li>}
              {s.feed.map((f) => (
                <li key={f.id} className="flex gap-2 text-[13px] leading-snug">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${f.kind === 'cue' ? 'bg-signal' : 'bg-cobalt'}`} />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER = [
  { id: 'depth', label: 'Depth', placeholder: true },
  { id: 'chest', label: 'Chest up', placeholder: true },
  { id: 'heels', label: 'Heels down', placeholder: true },
  { id: 'tempo', label: 'Lowering speed', placeholder: true },
];

// Side-view bones, drawn on one side (the two sides overlap from the side).
const BONES = [
  [P.leftShoulder, P.leftElbow],
  [P.leftElbow, P.leftWrist],
  [P.leftShoulder, P.leftHip],
  [P.leftHip, P.leftKnee],
  [P.leftKnee, P.leftAnkle],
  [P.leftAnkle, P.leftHeel],
  [P.leftHeel, P.leftFoot],
  [P.leftAnkle, P.leftFoot],
  [P.leftShoulder, P.leftEar],
];
const JOINTS = [P.leftShoulder, P.leftElbow, P.leftWrist, P.leftHip, P.leftKnee, P.leftAnkle, P.leftHeel, P.leftFoot];
const VW = 800;
const VH = 500;

function Stage({ pose, focus, faults }) {
  // Square scaling so the figure isn't stretched; centred on the stage.
  const S = VH * 0.9;
  const at = (p) => [VW * 0.36 + (p.x - 0.52) * S, (p.y - 0.88) * S + VH * 0.86];
  const bad = new Set(faults);
  const ear = at(pose[P.leftEar]);
  const nose = at(pose[P.nose]);
  const head = [(ear[0] + nose[0]) / 2 - 2, ear[1] - 6];
  const floorY = at(pose[P.leftHeel])[1] + 2;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 h-full w-full" aria-label="A skeleton doing squats, tracked by wobbl" role="img">
      <defs>
        <radialGradient id="stage-glow" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#1E2554" />
          <stop offset="60%" stopColor="#0C0D12" />
        </radialGradient>
        <radialGradient id="stage-spot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8EA2FF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#8EA2FF" stopOpacity="0" />
        </radialGradient>
        <filter id="bone-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <clipPath id="floor-clip">
          <rect x="0" y={floorY} width={VW} height={VH - floorY} />
        </clipPath>
        <linearGradient id="floor-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <rect width={VW} height={VH} fill="url(#stage-glow)" />
      {/* floor grid in perspective */}
      <g stroke="url(#floor-fade)" clipPath="url(#floor-clip)">
        {Array.from({ length: 17 }, (_, i) => {
          const x = -800 + i * 150;
          return <line key={`v${i}`} x1={x} y1={VH + 200} x2={VW * 0.4} y2={floorY - 120} />;
        })}
      </g>
      <g stroke="#FFFFFF" strokeOpacity="0.08">
        {[0, 0.12, 0.3, 0.55, 0.9].map((k) => (
          <line key={k} x1="0" x2={VW} y1={floorY + k * (VH - floorY)} y2={floorY + k * (VH - floorY)} />
        ))}
      </g>
      <ellipse cx={at(pose[P.leftAnkle])[0] + 10} cy={floorY} rx="150" ry="22" fill="url(#stage-spot)" />

      {/* glow layer */}
      <g filter="url(#bone-glow)" opacity="0.55">
        {BONES.map(([a, b]) => {
          const [x1, y1] = at(pose[a]);
          const [x2, y2] = at(pose[b]);
          return (
            <line
              key={`g${a}-${b}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={bad.has(a) && bad.has(b) ? '#FF5A3D' : '#6F86FF'}
              strokeWidth="8"
              strokeLinecap="round"
            />
          );
        })}
      </g>
      {BONES.map(([a, b]) => {
        const [x1, y1] = at(pose[a]);
        const [x2, y2] = at(pose[b]);
        return (
          <line
            key={`${a}-${b}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={bad.has(a) && bad.has(b) ? '#FF5A3D' : '#A9B8FF'}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={head[0]} cy={head[1]} r="24" fill="none" stroke="#A9B8FF" strokeWidth="2.5" />

      {focus && <Arc pose={pose} focus={focus} at={at} />}

      {JOINTS.map((i) => {
        const [x, y] = at(pose[i]);
        const hit = bad.has(i);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={hit ? 6 : 5} fill="#FFFFFF" stroke={hit ? '#FF5A3D' : '#A9B8FF'} strokeWidth="2.5" />
            {hit && <circle cx={x} cy={y} r="16" fill="none" stroke="#FF5A3D" strokeWidth="2" />}
          </g>
        );
      })}
    </svg>
  );
}

function Arc({ pose, focus, at }) {
  const [ia, ib, ic] = focus.points;
  const a = at(pose[ia]);
  const b = at(pose[ib]);
  const c = at(pose[ic]);
  const ua = Math.atan2(a[1] - b[1], a[0] - b[0]);
  const uc = Math.atan2(c[1] - b[1], c[0] - b[0]);
  let d = uc - ua;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const r = 34;
  const p1 = [b[0] + r * Math.cos(ua), b[1] + r * Math.sin(ua)];
  const p2 = [b[0] + r * Math.cos(ua + d), b[1] + r * Math.sin(ua + d)];
  const sweep = d > 0 ? 1 : 0;
  const color = focus.fault ? '#FF5A3D' : '#A9B8FF';
  const mid = ua + d / 2 + Math.PI;
  const lx = b[0] + Math.cos(mid) * (r + 30);
  const ly = b[1] + Math.sin(mid) * (r + 30);
  const text = `${Math.round(focus.value)}°`;
  return (
    <g>
      <path d={`M${b[0]},${b[1]} L${p1[0]},${p1[1]} A${r},${r} 0 0 ${sweep} ${p2[0]},${p2[1]} Z`} fill={color} fillOpacity="0.18" />
      <path d={`M${p1[0]},${p1[1]} A${r},${r} 0 0 ${sweep} ${p2[0]},${p2[1]}`} fill="none" stroke={color} strokeWidth="2.5" />
      <rect x={lx - 26} y={ly - 15} width="52" height="30" rx="15" fill={color} />
      <text x={lx} y={ly + 6} textAnchor="middle" fontSize="16" fontWeight="600" fill={focus.fault ? '#FFFFFF' : '#0C0D12'} fontFamily="'Instrument Sans Variable', system-ui, sans-serif">
        {text}
      </text>
    </g>
  );
}
