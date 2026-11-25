const STEPS = [
  {
    title: 'point your camera',
    body: "Prop up a laptop or phone so your whole body is in frame. It tells you when you're at a good distance.",
  },
  {
    title: 'pick your sport',
    body: "Cues are tuned to what you're training, from a jump shot to a front stance to a deadlift.",
  },
  {
    title: 'hear the fix',
    body: 'Every few seconds you get one short spoken correction. Repeats are skipped, so it only talks when something changes.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-page">
        <h2 className="max-w-2xl text-section font-semibold">
          three steps, then you're training.
        </h2>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t border-ink pt-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-sm font-medium">
                {i + 1}
              </span>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-14 max-w-2xl text-[15px] leading-relaxed text-muted">
          Pose tracking runs on your device. Only a small still frame is sent for analysis, and
          Acuity Kinetic doesn't store your video.
        </p>
      </div>
    </section>
  );
}
