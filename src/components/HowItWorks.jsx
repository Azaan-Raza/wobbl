import WindowBar from './WindowBar.jsx';

const STEPS = [
  {
    title: 'Track',
    body: "MediaPipe's pose model finds 33 points on your body, plus 21 on each hand for music, up to 30 times a second. It runs on your device.",
  },
  {
    title: 'Measure',
    body: "Those points become 3D joint angles, stance length, wrist height and so on. A smoothing filter takes out the jitter so one shaky frame doesn't set anything off.",
  },
  {
    title: 'Check',
    body: 'Each drill has rules with targets. A squat needs your knee under 100° at the bottom, for example. Every rep gets a score out of 100.',
  },
  {
    title: 'Speak',
    body: "It says one thing at a time, and only after the same mistake shows up in two of your last three reps. It won't repeat a cue for at least 15 seconds, and it tells you when you've fixed it.",
  },
];

// Example numbers for the sample report, labelled as an example on the page.
const ROWS = [
  ['Depth', '108°', 'under 100°', '5 of 8'],
  ['Chest up', '41°', 'under 50°', '1 of 8'],
  ['Heels down', 'flat', 'flat', '0 of 8'],
  ['Lowering speed', '0.9 s', '0.6 s or slower', '0 of 8'],
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-page grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-section font-semibold">What happens on every frame</h2>
          <ol className="mt-10 space-y-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[2.25rem_1fr] gap-x-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-sm font-medium">
                  {i + 1}
                </span>
                <div>
                  <h3 className="pt-1 text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 max-w-md text-[17px] leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:pt-24">
          <div className="window">
            <WindowBar title="Session report (example)" />
            <div className="p-6">
              <p className="text-[14px] text-muted">Squat</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">8 reps, averaging 74.</p>
              <p className="mt-4 text-[16px] leading-relaxed">
                Work on <strong className="font-semibold">depth</strong> next time. It was off in 63%
                of your reps.
              </p>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-ink text-[12px] text-muted">
                      <th className="py-2 pr-3 font-medium">Check</th>
                      <th className="py-2 pr-3 font-medium">Typical</th>
                      <th className="py-2 pr-3 font-medium">Target</th>
                      <th className="py-2 text-right font-medium">Reps off</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map(([check, typical, target, off]) => (
                      <tr key={check} className="border-b border-hairline">
                        <td className="py-2.5 pr-3">{check}</td>
                        <td className="py-2.5 pr-3 tabular-nums">{typical}</td>
                        <td className="py-2.5 pr-3 text-muted">{target}</td>
                        <td className="py-2.5 text-right tabular-nums">{off}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted">
            Your video stays on your device. The one exception is the AI coach for other sports,
            which sends three small frames from each rep to Google's Gemini model. Sessions are
            saved in your browser, so you can see whether your scores go up from week to week.
          </p>
        </div>
      </div>
    </section>
  );
}
