import WindowBar from '../components/WindowBar.jsx';
import { sessionScore } from '../engine/history.js';

export default function SetupPanel({ drill, settings, onSettings, onStart, error, history }) {
  const scores = history.map(sessionScore).filter((s) => s != null).slice(-10);

  return (
    <div className="window mx-auto max-w-3xl">
      <WindowBar title={drill.name} />
      <div className="p-6 sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{drill.name}</h1>
        <p className="mt-2 text-lg text-muted">{drill.blurb}</p>

        <h2 className="mt-8 text-[15px] font-semibold">Before you start</h2>
        <ol className="mt-3 space-y-3">
          {drill.setup.map((step, i) => (
            <li key={step} className="flex gap-3 text-[16px] leading-relaxed">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-xs font-medium">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {drill.options?.map((opt) => (
          <div key={opt.id} className="mt-6">
            <label htmlFor={`opt-${opt.id}`} className="text-[15px] font-semibold">
              {opt.label}
            </label>
            <select
              id={`opt-${opt.id}`}
              value={settings[opt.id]}
              onChange={(e) => onSettings({ ...settings, [opt.id]: e.target.value })}
              className="field mt-2 block w-auto min-w-[12rem] cursor-pointer py-2.5"
            >
              {opt.choices.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {drill.checks.length > 0 && (
          <>
            <h2 className="mt-8 text-[15px] font-semibold">What it checks</h2>
            <ul className="mt-3 divide-y divide-hairline border-y border-hairline text-[15px]">
              {drill.checks.map((c) => (
                <li key={c.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
                  <span>{c.label}</span>
                  <span className="text-muted">{c.target}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={onStart} className="pill-dark">
            Turn on camera and start
          </button>
          <p className="text-[13px] leading-snug text-muted sm:max-w-xs">
            {drill.mode === 'ai'
              ? 'Tracking runs on your device. After each rep, three small frames go to Google Gemini for the cue.'
              : 'Everything runs on your device. No video or images leave your computer.'}
          </p>
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-[#B3261E]/30 bg-[#FFF4F3] px-4 py-3 text-[15px] text-[#8C1D18]">
            {error}
          </p>
        )}

        {scores.length > 1 && (
          <div className="mt-10 border-t border-hairline pt-6">
            <h2 className="text-[15px] font-semibold">Your last {scores.length} sessions</h2>
            <Trend scores={scores} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Trend({ scores }) {
  return (
    <div className="mt-3 flex h-20 items-end gap-1.5" role="img" aria-label={`Scores: ${scores.join(', ')}`}>
      {scores.map((s, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] text-muted">{s}</span>
          <div
            className={`w-full max-w-[28px] rounded-t ${i === scores.length - 1 ? 'bg-ink' : 'bg-hairline'}`}
            style={{ height: `${Math.max(6, s * 0.56)}px` }}
          />
        </div>
      ))}
    </div>
  );
}
