import { useEffect, useState } from 'react';
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
      showToast("You're on the list.");
    } catch {
      showToast("Couldn't add you to the waitlist. Check your connection and try again.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="border-t border-rule px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-page grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p className="text-[15px] text-muted">A note from the founder</p>
          <h2 className="display mt-3 text-section">Hey, I'm Azaan.</h2>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <div className="space-y-5 text-[1.1875rem] leading-relaxed">
            <p>
              I'm a sophomore in high school and I've played sports my whole life: basketball, Tae
              Kwon Do, soccer, tennis, swimming, you name it. So many times I'd walk off the court or
              out of the gym and think "why am I not getting better?" and have no real answer.
            </p>
            <p>
              That's why I built wobbl. I wanted something that actually watches you and
              tells you what's wrong, right when it matters.
            </p>
            <p>
              It's just me building this right now and it's still early. I'd love for you to be part
              of it from the start.
            </p>
          </div>

          <p className="mt-8 font-semibold">Azaan</p>
          <p className="text-[15px] text-muted">Founder, wobbl</p>

          <div className="mt-12 border border-rule p-6 sm:p-8">
            {joined ? (
              <p className="text-lg">
                You're on the list. I'll email you when your spot opens, and your first month of Pro is on
                me.
              </p>
            ) : (
              <>
                <p className="text-lg font-medium">
                  Sign up for the waitlist and I'll give you a month of Pro free when we launch.
                </p>
                <p className="mt-1 text-[15px] text-muted">No credit card needed. You'll get one email when your spot opens.</p>

                <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-0">
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
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Adding you…' : 'Join the waitlist'}
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
