import { AnimatePresence, motion } from 'framer-motion';
import { Check, Square, X } from 'lucide-react';
import { Mark } from '../components/Logo.jsx';

const clock = (ms) => {
  const s = Math.floor((ms ?? 0) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const secs = (ms) => (ms == null ? '–' : `${(ms / 1000).toFixed(1)} s`);

const FEED = {
  cue: { label: 'Fix', mark: 'bg-signal' },
  praise: { label: 'Fixed', mark: 'bg-cobalt' },
  rest: { label: 'Rest', mark: 'bg-ink' },
  hint: { label: 'Setup', mark: 'bg-line' },
  note: { label: 'Note', mark: 'bg-line' },
  error: { label: 'Problem', mark: 'bg-signal' },
};

export default function LivePanel({ drill, videoRef, canvasRef, status, snap, lastRep, feed, calibration, onStop }) {
  const hold = drill.mode === 'hold';
  const ai = drill.mode === 'ai';
  const results = hold ? snap?.results || [] : lastRep?.results || [];
  const lost = snap && !snap.tracking;
  const setup = snap?.setup;
  const view = setup?.items.find((i) => i.id === 'angle')?.value;
  const tracking = setup?.items.find((i) => i.id === 'tracking')?.value;
  const phases = drill.rep?.phases || ['down', 'bottom', 'up'];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
      <div className="panel min-w-0 self-start">
        <div className="panel-bar justify-between">
          <div className="flex min-w-0 items-center gap-2.5 text-[14px]">
            <Mark size={18} />
            <span className="truncate font-medium">{drill.name}</span>
          </div>
          <span className="text-[13px] tabular-nums text-muted">
            {!hold && !ai && snap?.set > 1 ? `Set ${snap.set}  ` : ''}
            {clock(snap?.elapsedMs)}
          </span>
        </div>
        <div className="relative aspect-video bg-screen">
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
            aria-label="Your camera"
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />

          {!status && snap && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 text-[12px] font-medium">
              <span className="glass flex items-center gap-1.5 rounded-full px-2.5 py-1 text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-bright" aria-hidden="true" />
                Live
              </span>
              {view && view !== 'unknown' && (
                <span className="glass rounded-full px-2.5 py-1 text-white">{view[0].toUpperCase() + view.slice(1)}</span>
              )}
              {tracking && <span className="glass rounded-full px-2.5 py-1 text-white">Tracking {tracking}</span>}
            </div>
          )}

          {status && (
            <div className="absolute inset-0 flex items-center justify-center bg-screen/90 p-6 text-center">
              <p className="max-w-xs text-sm text-white/85">{status}</p>
            </div>
          )}

          {calibration != null && (
            <div className="glass absolute inset-x-3 bottom-3 rounded-2xl px-5 py-4 text-white">
              <p className="text-sm font-medium">Hold your best posture. Saving your baseline…</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full bg-cobalt" style={{ width: `${Math.round(calibration * 100)}%` }} />
              </div>
            </div>
          )}

          {lost && !status && (
            <p className="glass absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium text-white">
              Can't see you right now
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-[13px] text-muted">
            {ai
              ? 'Pause for a second between reps so it can tell them apart.'
              : drill.live
                ? 'The angle on your joint is live. Red means the last check on it failed.'
                : 'Red joints are what the last cue was about.'}
          </p>
          <button type="button" onClick={onStop} className="btn-primary btn-sm">
            <Square className="h-3.5 w-3.5" fill="currentColor" /> Stop and see report
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        {setup && !ai && <CameraCheck setup={setup} />}

        <section className="panel p-5">
          <div className="grid grid-cols-2 gap-4">
            <Stat
              label={hold ? 'In good form' : 'Reps'}
              value={hold ? (snap?.goodShare != null ? `${Math.round(snap.goodShare * 100)}%` : '–') : snap?.reps ?? 0}
            />
            <Stat
              label={hold ? 'Right now' : 'Last rep score'}
              value={
                ai ? '–' : hold ? (snap?.score != null ? `${snap.score}` : '–') : lastRep?.score != null ? `${lastRep.score}` : '–'
              }
              suffix={!ai && (hold ? snap?.score != null : lastRep?.score != null) ? '/100' : ''}
            />
          </div>

          {!hold && !ai && lastRep?.kin && (
            <div className="mt-4 grid grid-cols-3 rounded-xl bg-mist px-3 text-[13px]">
              {[
                [phases[0], lastRep.kin.towardMs],
                [phases[1], lastRep.kin.holdMs],
                [phases[2], lastRep.kin.backMs],
              ].map(([label, ms]) => (
                <div key={label} className="py-2.5 pr-2 [&:not(:first-child)]:pl-3">
                  <p className="capitalize text-muted">{label}</p>
                  <p className="mt-0.5 text-[15px] tabular-nums">{secs(ms)}</p>
                </div>
              ))}
            </div>
          )}
          {!hold && !ai && lastRep?.loss != null && drill.rep?.fatigue && (
            <p className="mt-3 text-[13px] text-muted">
              Speed vs your best rep this set:{' '}
              <span className={`tabular-nums ${lastRep.loss >= 0.25 ? 'font-medium text-signal' : 'text-ink'}`}>
                {Math.round((1 - lastRep.loss) * 100)}%
              </span>
            </p>
          )}

          {results.length > 0 && (
            <ul className="mt-4 divide-y divide-rule border-t border-rule">
              {results.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5 text-[14px]">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${r.skipped ? 'bg-rule' : r.fault ? 'bg-signal' : 'bg-cobalt'}`}
                    aria-label={r.skipped ? 'not checked' : r.fault ? 'off' : 'in range'}
                  />
                  <span className="min-w-0 flex-1">{r.label}</span>
                  <span className="text-right tabular-nums">
                    {r.skipped ? (
                      <span className="text-muted">{skipReason(r)}</span>
                    ) : (
                      <span className={r.fault ? 'font-medium text-signal' : ''}>{r.display}</span>
                    )}
                    {!r.skipped && <span className="block text-[11px] text-muted">{r.target}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {!ai && results.length === 0 && (
            <p className="mt-4 border-t border-rule pt-4 text-[14px] text-muted">
              {hold ? 'Measurements show up once you are in position.' : 'Do a rep. Each one gets timed, checked and scored.'}
            </p>
          )}
        </section>

        <section className="panel flex min-h-[220px] flex-1 flex-col">
          <div className="panel-bar">
            <h2 className="text-[14px] font-medium">What wobbl said</h2>
          </div>
          <ul className="feed-scroll max-h-[340px] flex-1 space-y-2 overflow-y-auto p-4" aria-live="polite">
            {feed.length === 0 && (
              <li className="px-1 py-4 text-[14px] text-muted">
                Quiet means nothing needs fixing yet. wobbl only speaks up when a mistake keeps showing up.
              </li>
            )}
            <AnimatePresence initial={false}>
              {feed.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3 rounded-xl border border-rule bg-white p-3"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${FEED[item.kind].mark}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-snug">{item.text}</p>
                    <p className="mt-1 flex justify-between text-[11px] text-muted">
                      <span>
                        {FEED[item.kind].label}
                        {item.source === 'ai' ? ' (AI)' : ''}
                      </span>
                      <span className="tabular-nums">{item.time}</span>
                    </p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      </div>
    </div>
  );
}

function CameraCheck({ setup }) {
  const failing = setup.items.filter((i) => !i.ok);
  if (setup.ready) {
    return (
      <section className="panel flex items-center gap-3 px-5 py-3 text-[14px]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cobalt text-white" aria-hidden="true">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <span className="font-medium">Camera check passed</span>
        <span className="ml-auto text-right text-muted">
          {[setup.items.find((i) => i.id === 'angle')?.value, setup.items.find((i) => i.id === 'tracking')?.value && `tracking ${setup.items.find((i) => i.id === 'tracking').value}`]
            .filter(Boolean)
            .join(', ')}
        </span>
      </section>
    );
  }
  return (
    <section className="panel" aria-live="polite">
      <div className="panel-bar justify-between">
        <h2 className="text-[14px] font-medium">Camera check</h2>
        <span className="text-[13px] text-muted">
          {setup.items.length - failing.length} of {setup.items.length} ok
        </span>
      </div>
      <ul className="divide-y divide-rule px-5">
        {setup.items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 py-2.5 text-[14px]">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${i.ok ? 'bg-cobalt' : 'bg-signal'}`}
              aria-label={i.ok ? 'ok' : 'needs fixing'}
            >
              {i.ok ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <span className="flex-1">{i.label}</span>
            <span className={i.ok ? 'text-muted' : 'text-signal'}>{i.value}</span>
          </li>
        ))}
      </ul>
      {failing[0]?.tip && <p className="border-t border-rule px-5 py-3 text-[14px]">{failing[0].tip}</p>}
    </section>
  );
}

function skipReason(r) {
  if (r.skipped !== 'view') return 'not visible';
  if (r.views?.includes('front')) return 'face the camera to check';
  return 'turn side-on to check';
}

function Stat({ label, value, suffix }) {
  return (
    <div>
      <p className="text-[13px] text-muted">{label}</p>
      <p className="display mt-1 text-[2.75rem] leading-none tabular-nums tracking-[-0.02em]">
        {value}
        {suffix && <span className="text-base font-normal text-muted">{suffix}</span>}
      </p>
    </div>
  );
}
