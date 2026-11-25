import { sessionScore } from '../engine/history.js';

export default function SetupPanel({ drill, settings, onSettings, onStart, error, history }) {
  const scores = history.map(sessionScore).filter((s) => s != null).slice(-10);

  return (
    <div className="panel mx-auto max-w-3xl">
      <div className="p-6 sm:p-10">
        <p className="text-[14px] capitalize text-muted">{drill.product}</p>
        <h1 className="display mt-1 text-3xl tracking-[-0.02em] sm:text-4xl">{drill.name}</h1>
        <p className="mt-2 text-lg text-muted">{drill.blurb}</p>

        <h2 className="mt-9 text-[15px] font-semibold">Before you start</h2>
        <ol className="mt-3 space-y-3">
          {drill.setup.map((step, i) => (
            <li key={step} className="flex gap-3 text-[16px] leading-relaxed">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-line text-xs font-medium tabular-nums">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {drill.mode !== 'ai' && (
          <p className="mt-4 text-[14px] text-muted">
            Once the camera is on, a camera check confirms it can see you properly before coaching starts.
          </p>
        )}

        {drill.options?.map((opt) => (
          <div key={opt.id} className="mt-7">
            <label htmlFor={`opt-${opt.id}`} className="text-[15px] font-semibold">
              {opt.label}
            </label>
            <select
              id={`opt-${opt.id}`}
              value={settings[opt.id]}
              onChange={(e) => onSettings({ ...settings, [opt.id]: e.target.value })}
              className="field mt-2 block w-auto min-w-[12rem] cursor-pointer"
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
            <h2 className="mt-9 text-[15px] font-semibold">What wobbl checks</h2>
            <ul className="mt-3 divide-y divide-rule border-y border-rule text-[15px]">
              {drill.checks.map((c) => (
                <li key={c.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
                  <span>
                    {c.label}
                    {c.views && <span className="text-muted"> ({c.views.includes('front') ? 'facing the camera' : 'side-on'})</span>}
                  </span>
                  <span className="text-muted">{c.target}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <button type="button" onClick={onStart} className="btn-primary">
            Turn on camera and start
          </button>
          <p className="text-[13px] leading-snug text-muted sm:max-w-xs">
            {drill.mode === 'ai'
              ? 'Tracking runs on your device. After each rep, three small frames go to Google Gemini for the cue.'
              : 'Everything runs on your device. No video or images leave your computer.'}
          </p>
        </div>
        {error && (
          <p role="alert" className="mt-5 border border-signal bg-signal-wash px-4 py-3 text-[15px] text-ink">
            {error}
          </p>
        )}

        {scores.length > 1 && (
          <div className="mt-10 border-t border-rule pt-6">
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
    <div className="mt-3 flex h-24 items-end gap-1.5" role="img" aria-label={`Scores: ${scores.join(', ')}`}>
      {scores.map((s, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] tabular-nums text-muted">{s}</span>
          <div
            className={`w-full max-w-[28px] ${i === scores.length - 1 ? 'bg-cobalt' : 'bg-line'}`}
            style={{ height: `${Math.max(4, s * 0.6)}px` }}
            title={`Session ${i + 1}: ${s}`}
          />
        </div>
      ))}
    </div>
  );
}
