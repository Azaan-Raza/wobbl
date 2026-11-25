import { useEffect, useState } from 'react';
import WindowBar from './WindowBar.jsx';
import { hasJoinedWaitlist, joinWaitlist, markWaitlistJoined } from '../utils/waitlist.js';

// The founder's letter and the waitlist live together: the note is the reason
// to sign up, and the form sits right under the signature.
export default function FounderNote({ showToast }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    setJoined(hasJoinedWaitlist());
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showToast('Enter a valid email address, like you@example.com.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await joinWaitlist(trimmed);
      markWaitlistJoined();
      setJoined(true);
      setEmail('');
      showToast("You're on the waitlist.");
    } catch {
      showToast("Couldn't add you to the waitlist. Check your connection and try again.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="window mx-auto max-w-2xl">
        <WindowBar title="a note from the founder" />

        <div className="px-6 py-10 sm:px-12 sm:py-14">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">hey, I'm Azaan.</h2>

          <div className="mt-7 space-y-5 text-lg leading-relaxed text-[#2B2B2B]">
            <p>
              I'm a high school sophomore and I've played sports my whole life: basketball, Tae Kwon
              Do, soccer, tennis, swimming. So many times I walked off the court or out of the gym
              thinking "why am I not getting better?" and had no real answer.
            </p>
            <p>
              So I built Acuity Kinetic: something that actually watches you and tells you what to
              fix, right when it matters.
            </p>
            <p>
              It's just me building this right now, and it's early. I'd love for you to be part of
              it from the start.
            </p>
          </div>

          <p className="mt-8 font-semibold">Azaan</p>
          <p className="text-[15px] text-muted">founder, Acuity Kinetic</p>

          <div className="mt-10 border-t border-hairline pt-8">
            {joined ? (
              <p className="text-lg">
                You're on the waitlist. I'll email you when your spot opens, and your first month of
                Pro is on me.
              </p>
            ) : (
              <>
                <p className="text-lg font-medium">
                  Join the waitlist and your first month of Pro is free when we launch.
                </p>
                <p className="mt-1 text-[15px] text-muted">No credit card. One email when your spot opens.</p>

                <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <label htmlFor="waitlist-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={submitting}
                    className="field flex-1"
                  />
                  <button type="submit" disabled={submitting} className="pill-dark">
                    {submitting ? 'joining…' : 'join the waitlist'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
