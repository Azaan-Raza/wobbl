import { Plus } from 'lucide-react';

const QUESTIONS = [
  {
    q: 'does my video get uploaded?',
    a: "No. Tracking and coaching run in your browser, and nothing from your camera gets sent anywhere. The one exception is the AI coach for sports that don't have their own rules yet: it sends three small frames from each rep to Google's Gemini model to write the cue.",
  },
  {
    q: 'what do I need?',
    a: 'A laptop or phone with a camera, and Chrome. For full-body drills, stand about 2.5 to 3 m (8 to 10 ft) back so your feet are in frame.',
  },
  {
    q: 'how accurate is it?',
    a: "It's only as good as what the camera can see. Side-on, in good light, with your whole body in frame works best. If a joint is hidden, it skips that check and shows \"not visible\" instead of guessing.",
  },
  {
    q: "my sport isn't listed. can I still use it?",
    a: "Yes, with the AI coach, which works for any sport. It's slower and less exact than the drills that have their own rules.",
  },
  {
    q: 'is wobbl for posture medical advice?',
    a: "No. It tracks a habit: how you sit. If something hurts, see a doctor or a physical therapist.",
  },
  {
    q: 'what does it cost?',
    a: "It's free while it's in beta. Everyone on the waitlist gets their first month of Pro free when it launches.",
  },
  {
    q: 'why is it called wobbl?',
    a: "Because that's what it catches: the little wobble when your form starts to slip.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-page grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <h2 className="text-section font-semibold">questions</h2>

        <div className="border-t border-ink">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group border-b border-hairline">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <Plus
                  className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-xl pb-6 text-[17px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
