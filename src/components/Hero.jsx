import HeroSession from './HeroSession.jsx';

export default function Hero() {
  return (
    <section id="top" className="px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-[13px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-ink" />
          now in private beta
        </p>

        <h1 className="mt-7 text-hero font-semibold">a coach that watches you train.</h1>

        <p className="mx-auto mt-6 max-w-xl text-lead text-muted">
          Point your camera at yourself, pick your sport, and hear one short correction at a time,
          while you're still moving.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#demo" className="pill-dark w-full sm:w-auto">
            try it in your browser
          </a>
          <a href="#waitlist" className="pill-outline w-full sm:w-auto">
            join the waitlist
          </a>
        </div>
        <p className="mt-4 text-[13px] text-muted">Free. No download. Works best in Chrome.</p>
      </div>

      <div className="mt-16 sm:mt-20">
        <HeroSession />
      </div>
    </section>
  );
}
