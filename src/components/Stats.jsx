const STATS = [
  ['33', 'points on your body', 'Shoulders, hips, knees, ankles, heels and toes, plus 21 per hand for music.'],
  ['30', 'frames a second', 'Measured as they happen, so a cue lands while the rep is still fresh.'],
  ['0', 'video uploads', 'Tracking and coaching run in your browser. Nothing from your camera leaves your laptop.'],
];

export default function Stats() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-page">
        <h2 className="display mx-auto max-w-3xl text-center text-section [text-wrap:balance]">
          Fast enough to coach you in the middle of a set.
        </h2>
        <div className="mt-16 grid grid-cols-[minmax(0,1fr)] divide-y divide-rule border-y border-rule md:grid-cols-3 md:divide-x md:divide-y-0">
          {STATS.map(([n, label, body]) => (
            <div key={label} className="px-2 py-10 md:px-10">
              <p className="display text-[5rem] leading-none tracking-[-0.03em] tabular-nums">{n}</p>
              <p className="mt-4 text-[17px] font-medium">{label}</p>
              <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
