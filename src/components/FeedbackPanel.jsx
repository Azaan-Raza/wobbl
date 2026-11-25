import { AnimatePresence, motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

function emptyMessage(isCoaching, cameraReady) {
  if (isCoaching) return 'Watching your form. The first cue usually lands in a few seconds.';
  if (cameraReady) return 'Press start coaching when your whole body is in frame.';
  return 'Your cues will show up here, newest on top.';
}

export default function FeedbackPanel({ feedback, isCoaching, cameraReady }) {
  return (
    <div className="flex min-h-[220px] flex-col lg:min-h-[320px] border-t border-hairline lg:border-l lg:border-t-0">
      <div className="flex items-center gap-2 border-b border-hairline px-5 py-3">
        <span className={`h-2 w-2 rounded-full ${isCoaching ? 'bg-accent' : 'bg-hairline'}`} />
        <h3 className="text-[13px] font-medium">live feedback</h3>
      </div>

      <div
        className="feed-scroll max-h-[420px] flex-1 overflow-y-auto p-4"
        aria-label="Coaching cues"
        aria-live="polite"
        aria-relevant="additions"
      >
        {feedback.length === 0 ? (
          <div className="flex h-full min-h-[160px] items-center lg:min-h-[240px] justify-center px-6 text-center">
            <p className="max-w-[16rem] text-sm leading-relaxed text-muted">
              {emptyMessage(isCoaching, cameraReady)}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {feedback.map((item, i) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`rounded-xl border p-3.5 ${
                    i === 0 ? 'border-ink bg-white' : 'border-hairline bg-paper'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Volume2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${i === 0 ? 'text-ink' : 'text-muted'}`}
                      aria-hidden="true"
                    />
                    <p className="text-[15px] leading-snug">{item.text}</p>
                  </div>
                  <p className="mt-1.5 pl-[26px] font-mono text-[11px] text-muted">{item.time}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
