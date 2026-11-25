import { useState } from 'react';
import useWidth from '../hooks/useWidth.js';

// A worked example: four squats seen from the side, where the first two are
// too shallow. Scores and timing follow the engine's real rules: depth is
// worth 30 of the 85 points checked from the side, a cue needs the same fault
// in two of the last three reps, and praise needs two good reps in a row.
const REPS = [
  { start: 0.6, bottom: 108, score: 65, said: null, note: "Noted it. One shallow rep isn't a pattern yet." },
  { start: 3.4, bottom: 106, score: 65, said: 'Sit lower. Get your thighs down to parallel.', kind: 'cue' },
  { start: 6.2, bottom: 96, score: 100, said: null, note: "Nothing yet. One good rep isn't a fix." },
  { start: 9.0, bottom: 94, score: 100, said: "That's the depth. Keep it.", kind: 'praise' },
];
const REP_S = 2.2;
const TOTAL_S = 12;
const TARGET = 100;
const STANDING = 175;

function angleAt(t) {
  for (const r of REPS) {
    const p = (t - r.start) / REP_S;
    if (p >= 0 && p <= 1) return STANDING - (STANDING - r.bottom) * ((1 - Math.cos(2 * Math.PI * p)) / 2);
  }
  return STANDING;
}

const STEPS = [
  {
    title: 'It tracks on your device',
    body: "Google's MediaPipe pose model finds 33 points on your body up to 30 times a second, inside your browser. A smoothing filter takes out the jitter, so one shaky frame can't set anything off.",
  },
  {
    title: 'It checks each rep against a coach’s rules',
    body: "A rep counts once your knee angle drops below 140° and you stand back up. At the bottom it measures depth, how far your chest folds, your heels and your tempo, then scores the rep out of 100.",
  },
  {
    title: 'It waits for a pattern before it talks',
    body: "It speaks when the same mistake shows up in two of your last three reps, says one thing at a time, and won't repeat itself for 15 seconds. When you fix it, it tells you.",
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(null);

  return (
    <section id="how-it-works" className="border-t border-rule px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-page grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <h2 className="display text-section">Four squats, start to finish.</h2>
          <p className="mt-5 text-lead text-muted">
            Here is what wobbl does during a set where your first two reps are too shallow.
          </p>
          <div className="mt-10 space-y-8">
            {STEPS.map((s) => (
              <div key={s.title}>
                <h3 className="text-[17px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-body text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="panel">
            <div className="panel-bar flex-wrap justify-between gap-y-1 py-2 text-[14px]">
              <span className="font-medium">Knee angle during 4 squats</span>
              <span className="flex items-center gap-2 text-[13px] text-muted">
                <svg width="22" height="2" aria-hidden="true">
                  <line x1="0" x2="22" y1="1" y2="1" stroke="#2346F5" strokeWidth="2" strokeDasharray="5 4" />
                </svg>
                Target: under 100° at the bottom
              </span>
            </div>
            <div className="px-2 pb-2 pt-4 sm:px-4">
              <KneeChart active={active} onActive={setActive} />
            </div>
            <div className="overflow-x-auto border-t border-rule">
              <table className="w-full min-w-[560px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-rule text-[13px] text-muted">
                    <th className="px-5 py-2.5 font-medium">Rep</th>
                    <th className="px-3 py-2.5 font-medium">Lowest knee angle</th>
                    <th className="px-3 py-2.5 font-medium">Score</th>
                    <th className="px-5 py-2.5 font-medium">What wobbl did</th>
                  </tr>
                </thead>
                <tbody>
                  {REPS.map((r, i) => {
                    const ok = r.bottom <= TARGET;
                    return (
                      <tr
                        key={r.start}
                        onMouseEnter={() => setActive(i)}
                        onMouseLeave={() => setActive(null)}
                        className={`border-b border-rule last:border-b-0 ${active === i ? 'bg-mist' : ''}`}
                      >
                        <td className="px-5 py-3 tabular-nums">{i + 1}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-2 tabular-nums">
                            <span className={`h-2 w-2 ${ok ? 'bg-cobalt' : 'bg-signal'}`} aria-hidden="true" />
                            {r.bottom}°<span className="text-muted">{ok ? ' deep enough' : ' too shallow'}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 tabular-nums">{r.score}</td>
                        <td className="px-5 py-3">
                          {r.said ? (
                            <>
                              <span className="text-muted">{r.kind === 'cue' ? 'Said' : 'Praised'}: </span>“{r.said}”
                            </>
                          ) : (
                            <span className="text-muted">{r.note}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            From the side, depth is worth 30 of the 85 points it can check, which is why a shallow rep
            scores 65. Facing the camera adds knee tracking and weight shift.
          </p>
        </div>
      </div>
    </section>
  );
}

function KneeChart({ active, onActive }) {
  const [ref, width] = useWidth(720);
  const narrow = width < 520;
  const height = narrow ? 250 : 290;
  const pad = { l: 44, r: narrow ? 12 : 24, t: 40, b: 30 };
  const x = (s) => pad.l + (s / TOTAL_S) * (width - pad.l - pad.r);
  const y = (a) => pad.t + ((180 - a) / 100) * (height - pad.t - pad.b);

  const pts = [];
  for (let t = 0; t <= TOTAL_S + 1e-9; t += 0.05) pts.push(`${x(t).toFixed(1)},${y(angleAt(t)).toFixed(1)}`);

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Knee angle over 12 seconds. Reps 1 and 2 bottom out at 108 and 106 degrees, above the 100 degree target. Reps 3 and 4 reach 96 and 94."
        className="block"
      >
        {/* hover bands, one per rep */}
        {REPS.map((r, i) => (
          <rect
            key={`band-${r.start}`}
            x={x(r.start)}
            y={pad.t}
            width={x(r.start + REP_S) - x(r.start)}
            height={height - pad.t - pad.b}
            fill={active === i ? '#F4F4F1' : 'transparent'}
            onMouseEnter={() => onActive(i)}
            onMouseLeave={() => onActive(null)}
          />
        ))}

        {/* grid and axis */}
        {[180, 140].map((a) => (
          <g key={a}>
            <line x1={pad.l} x2={width - pad.r} y1={y(a)} y2={y(a)} stroke="#E5E5E1" />
            <text x={pad.l - 8} y={y(a) + 4} textAnchor="end" fontSize="12" fill="#5B5B58">
              {a}°
            </text>
          </g>
        ))}
        <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke="#C9C9C4" />
        {[0, 3, 6, 9, 12].map((s) => (
          <text key={s} x={x(s)} y={height - 8} textAnchor="middle" fontSize="12" fill="#5B5B58">
            {s} s
          </text>
        ))}

        {/* target */}
        <rect x={pad.l} y={y(TARGET)} width={width - pad.l - pad.r} height={height - pad.b - y(TARGET)} fill="#EEF1FE" opacity="0.7" />
        <line x1={pad.l} x2={width - pad.r} y1={y(TARGET)} y2={y(TARGET)} stroke="#2346F5" strokeDasharray="5 5" />
        <text x={pad.l - 8} y={y(TARGET) + 4} textAnchor="end" fontSize="12" fill="#141414" fontWeight="600">
          100°
        </text>

        {/* the signal */}
        <polyline points={pts.join(' ')} fill="none" stroke="#2346F5" strokeWidth="2" strokeLinejoin="round" />

        {/* bottoms */}
        {REPS.map((r) => {
          const cx = x(r.start + REP_S / 2);
          const ok = r.bottom <= TARGET;
          return (
            <g key={`b-${r.start}`}>
              <circle cx={cx} cy={y(r.bottom)} r="5" fill={ok ? '#2346F5' : '#D13A22'} stroke="#FFFFFF" strokeWidth="2" />
              <text
                x={cx}
                y={y(r.bottom) + 22}
                textAnchor="middle"
                fontSize="13"
                fontWeight="600"
                fill="#141414"
                stroke="#FFFFFF"
                strokeWidth="4"
                paintOrder="stroke"
              >
                {r.bottom}°
              </text>
            </g>
          );
        })}

        {/* rep labels and what was said, above the plot */}
        {REPS.map((r, i) => {
          const cx = x(r.start + REP_S / 2);
          const end = x(r.start + REP_S);
          return (
            <g key={`l-${r.start}`}>
              <text x={cx} y={pad.t - 22} textAnchor="middle" fontSize="12" fill="#5B5B58">
                Rep {i + 1}
              </text>
              {r.said && (
                <g>
                  <line x1={end} x2={end} y1={pad.t - 6} y2={height - pad.b} stroke="#141414" strokeWidth="1" />
                  <rect x={end - 4} y={pad.t - 12} width="8" height="8" fill={r.kind === 'cue' ? '#D13A22' : '#2346F5'} />
                  {!narrow && (
                    <text x={end + 8} y={pad.t - 4} fontSize="12" fill="#141414" fontWeight="600">
                      {r.kind === 'cue' ? 'Cue' : 'Praise'}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
