import { AnimatePresence, motion } from 'framer-motion';
import { Square } from 'lucide-react';
import WindowBar from '../components/WindowBar.jsx';
import Wobbl from '../components/Wobbl.jsx';

const clock = (ms) => {
  const s = Math.floor((ms ?? 0) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const FEED_STYLE = {
  cue: 'border-ink bg-white',
  praise: 'border-[#0B7A3E]/40 bg-[#F1FAF4]',
  hint: 'border-hairline bg-paper',
  note: 'border-hairline bg-paper',
  error: 'border-[#B3261E]/30 bg-[#FFF4F3]',
};

const FEED_LABEL = {
  cue: 'Fix',
  praise: 'Fixed',
  hint: 'Setup',
  note: 'Note',
  error: 'Problem',
};

export default function LivePanel({
  drill,
  videoRef,
  canvasRef,
  status,
  snap,
  lastRep,
  feed,
  calibration,
  onStop,
}) {
  const hold = drill.mode === 'hold';
  const ai = drill.mode === 'ai';
  const results = hold ? snap?.results || [] : lastRep?.results || [];
  const lost = snap && !snap.tracking;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
      <div className="window min-w-0 self-start">
        <WindowBar title={`live: ${drill.name}`}>
          <span className="font-mono text-xs text-muted">{clock(snap?.elapsedMs)}</span>
        </WindowBar>
        <div className="relative aspect-video bg-stage">
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

          {status && (
            <div className="absolute inset-0 flex items-center justify-center bg-stage/90 p-6 text-center">
              <p className="max-w-xs text-sm text-white/80">{status}</p>
            </div>
          )}

          {calibration != null && (
            <div className="absolute inset-x-0 bottom-0 bg-black/70 px-5 py-4 text-white">
              <p className="text-sm font-medium">Hold your best posture. Measuring your baseline…</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(calibration * 100)}%` }} />
              </div>
            </div>
          )}

          {lost && !status && (
            <p className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
              Can't see you right now
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-[13px] text-muted">
            {ai ? 'Pause for a second between reps so it can tell them apart.' : 'Red joints are what the last cue was about.'}
          </p>
          <button type="button" onClick={onStop} className="pill-dark py-2 text-sm">
            <Square className="h-3.5 w-3.5" fill="currentColor" /> stop and see report
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <section className="window p-5">
          <div className="grid grid-cols-2 gap-4">
            <Stat
              label={hold ? 'In good form' : 'Reps'}
              value={hold ? (snap?.goodShare != null ? `${Math.round(snap.goodShare * 100)}%` : '–') : snap?.reps ?? 0}
            />
            <Stat
              label={hold ? 'Right now' : 'Last rep score'}
              value={
                ai
                  ? '–'
                  : hold
                    ? snap?.score != null ? `${snap.score}` : '–'
                    : lastRep?.score != null ? `${lastRep.score}` : '–'
              }
              suffix={!ai && (hold ? snap?.score != null : lastRep?.score != null) ? '/100' : ''}
            />
          </div>

          {results.length > 0 && (
            <ul className="mt-5 divide-y divide-hairline border-t border-hairline">
              {results.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5 text-[14px]">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      r.skipped ? 'bg-hairline' : r.fault ? 'bg-[#FF453A]' : 'bg-[#16A34A]'
                    }`}
                    aria-label={r.skipped ? 'not checked' : r.fault ? 'needs work' : 'good'}
                  />
                  <span className="min-w-0 flex-1">{r.label}</span>
                  <span className="text-right tabular-nums">
                    {r.skipped ? <span className="text-muted">{skipReason(r)}</span> : r.display}
                    {!r.skipped && <span className="block text-[11px] text-muted">{r.target}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {!ai && results.length === 0 && (
            <p className="mt-5 border-t border-hairline pt-4 text-[14px] text-muted">
              {hold ? 'Measurements show up once you are in position.' : 'Do a rep. Each one gets checked and scored.'}
            </p>
          )}
        </section>

        <section className="window flex min-h-[240px] flex-1 flex-col">
          <div className="border-b border-hairline px-5 py-3">
            <h2 className="text-[13px] font-medium">what wobbl said</h2>
          </div>
          <ul className="feed-scroll max-h-[360px] flex-1 space-y-2.5 overflow-y-auto p-4" aria-live="polite">
            {feed.length === 0 && (
              <li className="flex flex-col items-center px-2 py-6 text-center text-[14px] text-muted">
                <Wobbl size={44} />
                <span className="mt-3 max-w-[16rem]">
                  Quiet means nothing needs fixing yet. wobbl only speaks up when a mistake keeps
                  showing up.
                </span>
              </li>
            )}
            <AnimatePresence initial={false}>
              {feed.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-xl border p-3 ${FEED_STYLE[item.kind]}`}
                >
                  <p className="text-[15px] leading-snug">{item.text}</p>
                  <p className="mt-1 flex justify-between text-[11px] text-muted">
                    <span>
                      {FEED_LABEL[item.kind]}
                      {item.source === 'ai' ? ' (AI)' : ''}
                    </span>
                    <span className="font-mono">{item.time}</span>
                  </p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      </div>
    </div>
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
      <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">
        {value}
        {suffix && <span className="text-base font-normal text-muted">{suffix}</span>}
      </p>
    </div>
  );
}
