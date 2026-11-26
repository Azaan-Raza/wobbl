import { useEffect, useMemo, useState } from 'react';
import { Download, Pause, Play } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { sessionScore } from '../engine/history.js';
import { POSE_BONES } from '../engine/landmarks.js';
import { downloadText, toCsv, toJson } from '../utils/exportSession.js';
import useWidth from '../hooks/useWidth.js';
import { Trend } from './SetupPanel.jsx';

const minutes = (ms) => {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`;
};
const secs = (ms) => (ms == null ? '–' : (ms / 1000).toFixed(1));

export default function Report({ drill, summary, history, onAgain, onBack }) {
  const hold = summary.mode === 'hold';
  const ai = summary.mode === 'ai';
  const scores = history.map(sessionScore).filter((s) => s != null).slice(-10);
  const worst = summary.checks.find((c) => c.faultRate > 0.2);
  const log = summary.repLog || [];
  const phases = drill.rep?.phases || ['down', 'bottom', 'up'];
  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="panel p-6 sm:p-10">
        <p className="text-[14px] text-muted">Session report, {drill.name}</p>
        <h1 className="display mt-1 text-4xl tracking-[-0.02em] sm:text-5xl">{headline(summary)}</h1>

        <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-rule py-6 sm:grid-cols-4">
          <Fact label="Time" value={minutes(summary.durationMs)} />
          {!hold && <Fact label="Reps" value={summary.reps} />}
          {!hold && !ai && summary.sets?.length > 0 && <Fact label="Sets" value={summary.sets.length} />}
          {!hold && !ai && <Fact label="Average score" value={summary.avgScore ?? '–'} />}
          {hold && (
            <Fact
              label="In good form"
              value={summary.goodTimeShare != null ? `${Math.round(summary.goodTimeShare * 100)}%` : '–'}
            />
          )}
          {ai && <Fact label="AI cues" value={summary.aiCues ?? 0} />}
        </dl>

        {worst && (
          <p className="mt-6 text-lg leading-relaxed">
            Work on <strong className="font-semibold">{worst.label.toLowerCase()}</strong> next time. It was off{' '}
            {hold ? 'for' : 'in'} {Math.round(worst.faultRate * 100)}% of {hold ? 'the session' : 'your reps'}.
          </p>
        )}
        {summary.sets?.some((s) => s.loss != null && s.loss >= 0.25) && (
          <p className="mt-3 text-[16px] leading-relaxed text-muted">
            You slowed down by more than a quarter in{' '}
            {summary.sets.filter((s) => s.loss >= 0.25).map((s) => `set ${s.index}`).join(' and ')}. Rest longer
            between sets, or stop a rep or two earlier.
          </p>
        )}
      </div>

      {!ai && !hold && log.length > 0 && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2">
          <ChartPanel title="Score per rep" note="out of 100">
            <Bars values={log.map((r) => r.score)} max={100} bad={(v) => v < 100} unit="" label={(i) => `Rep ${i + 1}`} />
          </ChartPanel>
          {log.some((r) => r.speed) && (
            <ChartPanel
              title={drill.rep?.power === 'toward' ? 'Speed into the release' : 'Speed on the way up'}
              note={drill.rep?.speedUnit}
            >
              <Bars
                values={log.map((r) => r.speed)}
                bad={(v, i) => (log[i].loss ?? 0) >= 0.25}
                unit={drill.rep?.power === 'toward' ? '/s' : '°/s'}
                label={(i) => `Rep ${i + 1}, set ${log[i].set}`}
              />
            </ChartPanel>
          )}
        </div>
      )}

      {hold && summary.timeline?.length > 2 && (
        <ChartPanel title="Form score over the session" note="out of 100, once a second">
          <Timeline points={summary.timeline} />
        </ChartPanel>
      )}

      {summary.replay && <ReplayPanel replay={summary.replay} />}

      {summary.checks.length > 0 && (
        <div className="panel">
          <div className="panel-bar">
            <h2 className="text-[14px] font-medium">Every check</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-rule text-[13px] text-muted">
                  <th className="px-5 py-2.5 font-medium">Check</th>
                  <th className="px-3 py-2.5 font-medium">Typical</th>
                  {!hold && <th className="px-3 py-2.5 font-medium">Rep to rep</th>}
                  <th className="px-3 py-2.5 font-medium">Target</th>
                  <th className="px-5 py-2.5 text-right font-medium">{hold ? 'Time off' : 'Reps off'}</th>
                </tr>
              </thead>
              <tbody>
                {summary.checks.map((c) => (
                  <tr key={c.id} className="border-b border-rule last:border-b-0">
                    <td className="px-5 py-2.5">{c.label}</td>
                    <td className="px-3 py-2.5 tabular-nums">{c.typical ?? '–'}</td>
                    {!hold && <td className="px-3 py-2.5 tabular-nums text-muted">{c.spread ?? '–'}</td>}
                    <td className="px-3 py-2.5 text-muted">{c.target}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{Math.round(c.faultRate * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!hold && !ai && log.length > 0 && (
        <div className="panel">
          <div className="panel-bar justify-between">
            <h2 className="text-[14px] font-medium">Rep by rep</h2>
            <span className="text-[13px] text-muted">seconds</span>
          </div>
          <div className="max-h-[320px] overflow-auto">
            <table className="w-full min-w-[520px] text-left text-[14px] tabular-nums">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-rule text-[13px] capitalize text-muted">
                  <th className="px-5 py-2.5 font-medium">Rep</th>
                  <th className="px-3 py-2.5 font-medium">Set</th>
                  <th className="px-3 py-2.5 font-medium">Score</th>
                  <th className="px-3 py-2.5 font-medium">{phases[0]}</th>
                  <th className="px-3 py-2.5 font-medium">{phases[1]}</th>
                  <th className="px-5 py-2.5 font-medium">{phases[2]}</th>
                </tr>
              </thead>
              <tbody>
                {log.map((r) => (
                  <tr key={r.index} className="border-b border-rule last:border-b-0">
                    <td className="px-5 py-2">{r.index}</td>
                    <td className="px-3 py-2">{r.set}</td>
                    <td className={`px-3 py-2 ${r.score < 100 ? 'text-signal' : ''}`}>{r.score}</td>
                    <td className="px-3 py-2">{secs(r.downMs)}</td>
                    <td className="px-3 py-2">{secs(r.pauseMs)}</td>
                    <td className="px-5 py-2">{secs(r.upMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="panel p-6 sm:p-8">
        {scores.length > 1 && (
          <div className="mb-8">
            <h2 className="text-[15px] font-semibold">Your last {scores.length} sessions</h2>
            <Trend scores={scores} />
          </div>
        )}
        <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
          <button type="button" onClick={onAgain} className="btn-primary">
            Go again
          </button>
          <button type="button" onClick={onBack} className="btn-secondary">
            Change settings
          </button>
          {!ai && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => downloadText(`${drill.id}-${stamp}.csv`, toCsv(summary, drill), 'text/csv')}
              >
                <Download className="h-4 w-4" /> Download CSV
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => downloadText(`${drill.id}-${stamp}.json`, toJson(summary, drill), 'application/json')}
              >
                <Download className="h-4 w-4" /> JSON
              </button>
            </>
          )}
        </div>
        <p className="mt-5 text-[13px] text-muted">Sessions are saved in this browser only. Replays are not saved.</p>
      </div>
    </div>
  );
}

function headline(s) {
  if (s.mode === 'hold') {
    if (s.goodTimeShare == null) return 'Not enough time in position to score.';
    return `Good form ${Math.round(s.goodTimeShare * 100)}% of the time.`;
  }
  if (s.mode === 'ai') return s.reps ? `${s.reps} reps watched.` : 'No reps picked up.';
  if (!s.reps) return 'No full reps picked up.';
  return `${s.reps} reps, averaging ${s.avgScore}.`;
}

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="display mt-1 text-[2rem] leading-none tabular-nums">{value}</dd>
    </div>
  );
}

function ChartPanel({ title, note, children }) {
  return (
    <div className="panel">
      <div className="panel-bar justify-between">
        <h2 className="text-[14px] font-medium">{title}</h2>
        <span className="text-[13px] text-muted">{note}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// One bar per rep. Red bars are the reps that failed (score under 100, or a
// set's speed dropping by a quarter). Hover a bar for its value.
function Bars({ values, max, bad, unit, label }) {
  const [ref, width] = useWidth(400);
  const [hover, setHover] = useState(null);
  const height = 170;
  const pad = { l: 34, r: 6, t: 14, b: 22 };
  const top = max ?? niceMax(Math.max(1, ...values.filter((v) => v != null)) * 1.1);
  const slot = (width - pad.l - pad.r) / Math.max(values.length, 1);
  const barW = Math.max(3, Math.min(36, slot - 2));
  const y = (v) => pad.t + (1 - v / top) * (height - pad.t - pad.b);
  const ticks = max ? [0, 50, 100] : [0, Math.round(top / 2), Math.round(top)];
  const step = Math.ceil(values.length / 12);

  return (
    <div ref={ref} className="relative">
      <svg width={width} height={height} className="block" role="img" aria-label={values.map((v, i) => `${label(i)}: ${v ?? 'none'}`).join('. ')}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? '#C9C9C4' : '#E5E5E1'} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5B5B58">
              {t}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          if (v == null) return null;
          const x = pad.l + slot * i + (slot - barW) / 2;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad.l + slot * i} y={pad.t} width={slot} height={height - pad.t - pad.b} fill="transparent" />
              <rect x={x} y={y(v)} width={barW} height={Math.max(1, y(0) - y(v))} rx={Math.min(4, barW / 2)} fill={bad(v, i) ? '#D13A22' : '#2346F5'} opacity={hover == null || hover === i ? 1 : 0.45} />
              {i % step === 0 && (
                <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="#5B5B58">
                  {i + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover != null && values[hover] != null && (
        <div
          className="pointer-events-none absolute rounded-lg border border-rule bg-white px-2 py-1 text-[12px] shadow-soft"
          style={{ left: Math.min(width - 120, pad.l + slot * hover), top: 0 }}
        >
          {label(hover)}: <span className="font-medium tabular-nums">{values[hover]}{unit}</span>
        </div>
      )}
    </div>
  );
}

function niceMax(v) {
  const step = 10 ** Math.floor(Math.log10(v / 2));
  return Math.ceil(v / (step * 2)) * step * 2;
}

function Timeline({ points }) {
  const [ref, width] = useWidth(600);
  const [hover, setHover] = useState(null);
  const height = 170;
  const pad = { l: 34, r: 8, t: 12, b: 22 };
  const end = points[points.length - 1].s || 1;
  const x = (s) => pad.l + (s / end) * (width - pad.l - pad.r);
  const y = (v) => pad.t + (1 - v / 100) * (height - pad.t - pad.b);
  const path = points.map((p) => `${x(p.s).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');
  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const s = ((e.clientX - box.left - pad.l) / (width - pad.l - pad.r)) * end;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(p.s - s) < Math.abs(points[best].s - s)) best = i;
    });
    setHover(best);
  };
  return (
    <div ref={ref} className="relative">
      <svg width={width} height={height} className="block" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="Form score over time">
        {[0, 50, 100].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? '#C9C9C4' : '#E5E5E1'} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5B5B58">
              {t}
            </text>
          </g>
        ))}
        <text x={width - pad.r} y={height - 6} textAnchor="end" fontSize="11" fill="#5B5B58">
          {minutes(end * 1000)}
        </text>
        <polyline points={path} fill="none" stroke="#2346F5" strokeWidth="2" strokeLinejoin="round" />
        {hover != null && (
          <>
            <line x1={x(points[hover].s)} x2={x(points[hover].s)} y1={pad.t} y2={height - pad.b} stroke="#141414" strokeWidth="1" />
            <circle cx={x(points[hover].s)} cy={y(points[hover].score)} r="4" fill="#2346F5" stroke="#fff" strokeWidth="2" />
          </>
        )}
      </svg>
      {hover != null && (
        <div className="pointer-events-none absolute rounded-lg border border-rule bg-white px-2 py-1 text-[12px] shadow-soft" style={{ left: Math.min(width - 110, x(points[hover].s) + 8), top: 0 }}>
          {minutes(points[hover].s * 1000)}: <span className="font-medium tabular-nums">{points[hover].score}</span>
        </div>
      )}
    </div>
  );
}

function ReplayPanel({ replay }) {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(!reduce);
  const reps = [
    ['Best rep', replay.best],
    ['Worst rep', replay.worst],
  ].filter(([, r]) => r);

  return (
    <div className="panel">
      <div className="panel-bar justify-between">
        <h2 className="text-[14px] font-medium">Replay</h2>
        <button type="button" onClick={() => setPlaying((p) => !p)} className="btn-secondary btn-sm h-8 px-3">
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
      <div className={`grid grid-cols-[minmax(0,1fr)] ${reps.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {reps.map(([label, rep]) => (
          <div key={label} className="border-rule [&:not(:first-child)]:border-t sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-t-0">
            <div className="flex items-baseline justify-between px-5 py-2.5 text-[14px]">
              <span className="font-medium">{label}</span>
              <span className="text-muted">
                Rep {rep.index}, <span className="tabular-nums text-ink">{rep.score}</span>
              </span>
            </div>
            <SkeletonReplay rep={rep} playing={playing} />
          </div>
        ))}
      </div>
      <p className="border-t border-rule px-5 py-3 text-[13px] text-muted">
        Mirrored, the way you saw yourself. Red joints are the checks that rep failed.
      </p>
    </div>
  );
}

function SkeletonReplay({ rep, playing }) {
  // Paused, it rests on the bottom of the rep, the moment that was scored.
  const [i, setI] = useState(rep.bottom ?? 0);
  const frames = rep.frames;

  useEffect(() => {
    if (!playing || frames.length < 2) return undefined;
    const dt = Math.max(30, (frames[frames.length - 1].t - frames[0].t) / (frames.length - 1));
    const id = setInterval(() => setI((n) => (n + 1) % (frames.length + 12)), dt); // short hold at the end
    return () => clearInterval(id);
  }, [playing, frames]);

  // Fit every frame of the rep into the box, mirrored.
  const box = useMemo(() => {
    let x0 = 1;
    let x1 = 0;
    let y0 = 1;
    let y1 = 0;
    for (const f of frames) {
      for (const [x, y, v] of f.p) {
        if (!v) continue;
        x0 = Math.min(x0, 1 - x);
        x1 = Math.max(x1, 1 - x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    }
    const size = Math.max(x1 - x0, y1 - y0, 0.05) * 1.15;
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, size };
  }, [frames]);

  const W = 300;
  const frame = frames[Math.min(i, frames.length - 1)];
  const at = ([x, y]) => [((1 - x - box.cx) / box.size + 0.5) * W, ((y - box.cy) / box.size + 0.5) * W];
  const bad = new Set(rep.faults);
  const pts = frame.p;

  return (
    <div className="bg-mist">
      <svg viewBox={`0 0 ${W} ${W}`} className="mx-auto block aspect-square w-full max-w-[320px]" role="img" aria-label={`Replay of rep ${rep.index}`}>
        {POSE_BONES.map(([a, b]) => {
          if (!pts[a][2] || !pts[b][2]) return null;
          const [x1, y1] = at(pts[a]);
          const [x2, y2] = at(pts[b]);
          return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={bad.has(a) && bad.has(b) ? '#D13A22' : '#2346F5'} strokeWidth="3" strokeLinecap="round" />;
        })}
        {pts.map((p, k) => {
          if (!p[2] || (k < 11 && k !== 0)) return null;
          const [x, y] = at(p);
          return <circle key={k} cx={x} cy={y} r={bad.has(k) ? 5 : 4} fill="#FFFFFF" stroke={bad.has(k) ? '#D13A22' : '#2346F5'} strokeWidth="2" />;
        })}
      </svg>
    </div>
  );
}
