import { Plus } from 'lucide-react';

const QUESTIONS = [
  {
    q: 'Does my video get uploaded?',
    a: "No. Tracking and coaching run in your browser, and nothing from your camera gets sent anywhere. The one exception is the AI coach for sports that don't have their own rules yet: it sends three small frames from each rep to Google's Gemini model to write the cue.",
  },
  {
    q: 'What do I need?',
    a: 'A laptop or phone with a camera, and Chrome. For full-body drills, stand about 2.5 to 3 m (8 to 10 ft) back so your feet are in frame.',
  },
  {
    q: 'How accurate is it?',
    a: "It's only as good as what the camera can see. Side-on, in good light, with your whole body in frame works best, and the camera check tells you when your setup is off. If a joint is hidden, it skips that check and shows \"not visible\" instead of guessing.",
  },
  {
    q: "My sport isn't listed. Can I still use it?",
    a: "Yes, with the AI coach, which works for any sport. It's slower and less exact than the drills that have their own rules.",
  },
  {
    q: 'Is wobbl for posture medical advice?',
    a: "No. It tracks a habit: how you sit. If something hurts, see a doctor or a physical therapist.",
  },
  {
    q: 'What does it cost?',
    a: "It's free while it's in beta. Everyone on the waitlist gets their first month of Pro free when it launches.",
  },
  {
    q: 'Why is it called wobbl?',
    a: "Because that's what it catches: the little wobble when your form starts to slip.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-page grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-12 lg:gap-10">
        <h2 className="display text-section lg:col-span-4">Questions, answered.</h2>

        <div className="border-t border-rule lg:col-span-7 lg:col-start-6">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group border-b border-rule">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <Plus
                  className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-xl pb-6 text-[16px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
