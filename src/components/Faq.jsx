import { Plus } from 'lucide-react';
import { SPORTS } from '../utils/sports.js';

const sportList = `${SPORTS.slice(0, -1).join(', ').toLowerCase()} and ${SPORTS.at(-1).toLowerCase()}`;

const QUESTIONS = [
  {
    q: 'what is acuity kinetic?',
    a: 'A coach that watches you through your camera and tells you, out loud, the one thing to fix in your form while you train.',
  },
  {
    q: 'is my video stored?',
    a: "No. Pose tracking runs in your browser. Every few seconds one small still frame is sent to a vision model to write the cue, and Acuity Kinetic doesn't save it.",
  },
  {
    q: 'which sports does it work for?',
    a: `Right now: ${sportList}. It works best for movements you can do in front of a camera, like shooting form, stances and lifts.`,
  },
  {
    q: 'do I need to download anything?',
    a: 'No. It runs in your browser on a laptop or phone. Chrome works best.',
  },
  {
    q: 'how much does it cost?',
    a: 'The demo is free. Pro pricing comes at launch, and everyone on the waitlist gets their first month free.',
  },
];

export default function Faq() {
  return (
    <section id="faq" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-page gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <h2 className="text-section font-semibold">questions.</h2>

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
