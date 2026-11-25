import HeroScenes from './HeroScenes.jsx';

export default function Hero() {
  return (
    <section id="top" className="px-5 pb-20 pt-32 sm:px-8 sm:pt-40">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-hero font-semibold [text-wrap:balance]">
          Your camera watches how you move and tells you what to fix.
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lead text-muted [text-wrap:pretty]">
          It runs in your browser, measures your joints on every frame, and speaks up when the
          same mistake keeps showing up. Right now it coaches lifting, basketball, Tae Kwon Do,
          piano, guitar and sitting posture.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="try/" className="pill-dark w-full sm:w-auto">
            Open the app
          </a>
          <a href="#waitlist" className="pill-outline w-full sm:w-auto">
            Join the waitlist
          </a>
        </div>
        <p className="mt-4 text-[13px] text-muted">
          Free while it's in beta. Works best in Chrome on a laptop.
        </p>
      </div>

      <div className="mt-16 sm:mt-20">
        <HeroScenes />
      </div>
    </section>
  );
}
