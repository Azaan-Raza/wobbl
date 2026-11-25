import ProductShot from './ProductShot.jsx';

export default function Hero() {
  return (
    <section id="top" className="px-5 pb-24 pt-28 sm:px-8 sm:pb-32 sm:pt-36">
      <div className="mx-auto max-w-page">
        <div className="max-w-3xl">
          <h1 className="display text-hero [text-wrap:balance]">Your form, measured on every rep.</h1>
          <p className="mt-6 max-w-2xl text-lead text-muted [text-wrap:pretty]">
            wobbl watches through your laptop camera, measures your joint angles 30 times a second,
            and tells you out loud what to fix before your next rep. It coaches lifting, basketball,
            Tae Kwon Do, piano, guitar and how you sit at a desk.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="try/" className="btn-primary">
              Try wobbl free
            </a>
            <a href="#waitlist" className="btn-secondary">
              Join the waitlist
            </a>
          </div>
          <p className="mt-4 text-[14px] text-muted">Free while it's in beta. Runs in Chrome, on your own device.</p>
        </div>

        <div className="mt-14 sm:mt-16">
          <ProductShot />
        </div>
      </div>
    </section>
  );
}
