import WindowBar from '../components/WindowBar.jsx';
import { sessionScore } from '../engine/history.js';
import { Trend } from './SetupPanel.jsx';

const minutes = (ms) => {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`;
};

export default function Report({ drill, summary, history, onAgain, onBack }) {
  const hold = summary.mode === 'hold';
  const ai = summary.mode === 'ai';
  const scores = history.map(sessionScore).filter((s) => s != null).slice(-10);
  const worst = summary.checks.find((c) => c.faultRate > 0.2);

  return (
    <div className="window mx-auto max-w-3xl">
      <WindowBar title="session report" />
      <div className="p-6 sm:p-10">
        <p className="text-[15px] text-muted">{drill.name}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          {headline(summary)}
        </h1>

        <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-hairline py-6 sm:grid-cols-3">
          <Fact label="Time" value={minutes(summary.durationMs)} />
          {!hold && <Fact label="Reps" value={summary.reps} />}
          {!hold && !ai && <Fact label="Average score" value={summary.avgScore ?? '–'} />}
          {!hold && !ai && <Fact label="Best rep" value={summary.bestScore ?? '–'} />}
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

        {summary.checks.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-[15px]">
              <thead>
                <tr className="border-b border-ink text-[13px] text-muted">
                  <th className="py-2 pr-4 font-medium">Check</th>
                  <th className="py-2 pr-4 font-medium">Typical</th>
                  <th className="py-2 pr-4 font-medium">Target</th>
                  <th className="py-2 text-right font-medium">{hold ? 'Time off' : 'Reps off'}</th>
                </tr>
              </thead>
              <tbody>
                {summary.checks.map((c) => (
                  <tr key={c.id} className="border-b border-hairline">
                    <td className="py-2.5 pr-4">{c.label}</td>
                    <td className="py-2.5 pr-4 tabular-nums">{c.typical ?? '–'}</td>
                    <td className="py-2.5 pr-4 text-muted">{c.target}</td>
                    <td className="py-2.5 text-right tabular-nums">{Math.round(c.faultRate * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {scores.length > 1 && (
          <div className="mt-10">
            <h2 className="text-[15px] font-semibold">your last {scores.length} sessions</h2>
            <Trend scores={scores} />
          </div>
        )}

        <p className="mt-8 text-[13px] text-muted">Sessions are saved in this browser only.</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onAgain} className="pill-dark">
            go again
          </button>
          <button type="button" onClick={onBack} className="pill-outline">
            change settings
          </button>
        </div>
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
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
