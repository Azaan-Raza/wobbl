import { Check } from 'lucide-react';
import useWidth from '../hooks/useWidth.js';

export default function UnderTheHood() {
  return (
    <section id="under-the-hood" className="border-t border-rule bg-mist px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-page">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-12">
          <h2 className="display text-section lg:col-span-6">What it measures between the cues.</h2>
          <p className="max-w-xl text-lead text-muted lg:col-span-5 lg:col-start-8 lg:pt-2">
            The cue is the part you hear. Underneath, every rep is timed, compared with the rest of
            your set and kept for the report.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2">
          <Feature
            title="Checks your camera first"
            body="Before it coaches, it makes sure it can see what the drill needs: your whole body, at a usable distance, from the right angle, with confident tracking. If something is off, it tells you how to fix it."
          >
            <CameraCheck />
          </Feature>
          <Feature
            title="Times every rep and notices when you slow down"
            body="Each rep is split into the way down, the pause and the way up. When your last two reps come up a quarter slower than your best in the set, it tells you to rest. It's the idea behind velocity-based training, measured at your knee instead of on a bar."
          >
            <Fatigue />
          </Feature>
          <Feature
            title="Replays your best and worst rep"
            body="The session report plays them side by side, with the joints that were off in red, so you can see the difference instead of reading about it."
          >
            <Replay />
          </Feature>
          <Feature
            title="Exports every rep"
            body="Download a session as CSV or JSON: one row per rep with its score, timing, speed and every measurement. Send it to a coach or keep your own log."
          >
            <ExportPreview />
          </Feature>
        </div>
      </div>
    </section>
  );
}

function Feature({ title, body, children }) {
  return (
    <article className="panel flex flex-col">
      <div className="flex min-h-[220px] items-center border-b border-rule p-5 sm:p-6">{children}</div>
      <div className="p-6">
        <h3 className="text-[19px] font-semibold tracking-[-0.01em]">{title}</h3>
        <p className="mt-2 text-body text-muted">{body}</p>
      </div>
    </article>
  );
}

function CameraCheck() {
  const items = [
    ['Whole body in frame', 'yes'],
    ['Distance', 'good'],
    ['Camera angle', 'side view'],
    ['Tracking', 'good'],
  ];
  return (
    <div className="w-full">
      <p className="text-[13px] text-muted">Camera check, squat</p>
      <ul className="mt-2 divide-y divide-rule border-y border-rule">
        {items.map(([label, value]) => (
          <li key={label} className="flex items-center gap-3 py-2.5 text-[14px]">
            <span className="flex h-5 w-5 items-center justify-center bg-cobalt text-white" aria-hidden="true">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="flex-1">{label}</span>
            <span className="text-muted">{value}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] text-muted">Ready. Start your first rep.</p>
    </div>
  );
}

// Upward knee speed for six reps in one set. Reps 5 and 6 fall more than 25%
// below the best (rep 2), which is when the rest note fires.
const SPEEDS = [148, 152, 145, 139, 108, 102];

function Fatigue() {
  const [ref, width] = useWidth(420);
  const height = 150;
  const pad = { l: 4, r: 4, t: 14, b: 22 };
  const best = Math.max(...SPEEDS);
  const limit = best * 0.75;
  const max = 170;
  const slot = (width - pad.l - pad.r) / SPEEDS.length;
  const barW = Math.min(44, slot - 10);
  const y = (v) => pad.t + (1 - v / max) * (height - pad.t - pad.b);
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between text-[13px] text-muted">
        <span>Speed on the way up, set 1</span>
        <span>degrees per second</span>
      </div>
      <div ref={ref} className="mt-2">
        <svg width={width} height={height} role="img" aria-label="Six reps. Reps 5 and 6 are 29% and 33% slower than the best rep.">
          <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke="#C9C9C4" />
          {SPEEDS.map((v, i) => {
            const slow = v < limit;
            const cx = pad.l + slot * i + slot / 2;
            return (
              <g key={i}>
                <rect x={cx - barW / 2} y={y(v)} width={barW} height={height - pad.b - y(v)} fill={slow ? '#D13A22' : '#2346F5'}>
                  <title>{`Rep ${i + 1}: ${v}°/s${slow ? `, ${Math.round((1 - v / best) * 100)}% slower than your best` : ''}`}</title>
                </rect>
                <text x={cx} y={height - 6} textAnchor="middle" fontSize="12" fill="#5B5B58">
                  {i + 1}
                </text>
              </g>
            );
          })}
          <line x1={pad.l} x2={width - pad.r} y1={y(limit)} y2={y(limit)} stroke="#141414" strokeDasharray="4 4" />
          <text x={width - pad.r} y={y(limit) - 6} textAnchor="end" fontSize="12" fill="#141414">
            25% below your best
          </text>
        </svg>
      </div>
      <p className="mt-2 text-[14px]">
        <span className="text-muted">After rep 6: </span>“Your reps are slowing down. Do one or two more, then rest.”
      </p>
    </div>
  );
}

// A side-on squat skeleton at the bottom of a rep.
function squatJoints(knee, lean, ox = 60) {
  const r = Math.PI / 180;
  const a = ((180 - knee) / 2) * r;
  const ankle = [ox, 158];
  const kneeP = [ankle[0] + 44 * Math.sin(a), ankle[1] - 44 * Math.cos(a)];
  const hip = [kneeP[0] - 44 * Math.sin(a), kneeP[1] - 44 * Math.cos(a)];
  const sh = [hip[0] + 52 * Math.sin(lean * r), hip[1] - 52 * Math.cos(lean * r)];
  return {
    ankle,
    knee: kneeP,
    hip,
    sh,
    elbow: [sh[0] + 26, sh[1] + 10],
    wrist: [sh[0] + 50, sh[1] + 8],
    head: [sh[0] + 5, sh[1] - 18],
    toe: [ankle[0] + 20, 166],
    heel: [ankle[0] - 6, 166],
  };
}

function MiniSkeleton({ knee, lean, bad }) {
  const j = squatJoints(knee, lean);
  const bone = (a, b, faulty) => (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={faulty ? '#D13A22' : '#2346F5'} strokeWidth="3" strokeLinecap="round" />
  );
  return (
    <svg viewBox="0 10 150 165" className="h-full w-full" aria-hidden="true">
      <line x1="0" x2="150" y1="168" y2="168" stroke="#D9D9D3" />
      <circle cx={j.head[0]} cy={j.head[1]} r="9" fill="none" stroke="#2346F5" strokeWidth="2.5" />
      {bone(j.sh, j.elbow)}
      {bone(j.elbow, j.wrist)}
      {bone(j.sh, j.hip)}
      {bone(j.hip, j.knee, bad)}
      {bone(j.knee, j.ankle, bad)}
      {bone(j.heel, j.toe)}
      {bone(j.ankle, j.heel)}
      {Object.entries(j)
        .filter(([k]) => k !== 'head')
        .map(([k, [x, y]]) => (
          <circle key={k} cx={x} cy={y} r="3.6" fill="#FFFFFF" stroke={bad && k === 'knee' ? '#D13A22' : '#2346F5'} strokeWidth="2" />
        ))}
      {bad && <circle cx={j.knee[0]} cy={j.knee[1]} r="11" fill="none" stroke="#D13A22" strokeWidth="2" />}
    </svg>
  );
}

function Replay() {
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      {[
        { label: 'Best rep', rep: 'Rep 4', score: 100, knee: 94, lean: 34 },
        { label: 'Worst rep', rep: 'Rep 1', score: 65, knee: 108, lean: 30, bad: true },
      ].map((r) => (
        <div key={r.label} className="border border-rule bg-white">
          <div className="flex items-baseline justify-between border-b border-rule px-3 py-2 text-[13px]">
            <span className="font-medium">{r.label}</span>
            <span className="text-muted">
              {r.rep}, <span className="tabular-nums text-ink">{r.score}</span>
            </span>
          </div>
          <div className="h-[130px] bg-mist p-2">
            <MiniSkeleton knee={r.knee} lean={r.lean} bad={r.bad} />
          </div>
          <p className="px-3 py-2 text-[13px] text-muted">
            Knee at the bottom: <span className={r.bad ? 'font-medium text-signal' : 'text-ink'}>{r.knee}°</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function ExportPreview() {
  const rows = [
    ['1', '1', '65', '1.1', '0.9', '108'],
    ['2', '1', '65', '1.0', '0.9', '106'],
    ['3', '1', '100', '1.2', '1.0', '96'],
    ['4', '1', '100', '1.2', '1.1', '94'],
  ];
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between text-[13px] text-muted">
        <span>squat-2026-11-25.csv</span>
        <span>4 reps</span>
      </div>
      <div className="mt-2 overflow-x-auto border border-rule bg-white">
        <table className="w-full min-w-[340px] text-left text-[13px] tabular-nums">
          <thead>
            <tr className="border-b border-rule text-muted">
              {['rep', 'set', 'score', 'down_s', 'up_s', 'depth'].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-b border-rule last:border-b-0">
                {r.map((c, i) => (
                  <td key={i} className="px-3 py-1.5">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
