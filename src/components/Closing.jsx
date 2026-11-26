import Landscape from './Landscape.jsx';

export default function Closing() {
  return (
    <section className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="relative overflow-hidden rounded-[28px] px-6 py-24 text-center sm:py-32">
        <Landscape palette="dawn" seed={27} horizon={0.58} sun={[0.5, 0.62]} />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="display text-section text-ink [text-wrap:balance]">Try it on your next set.</h2>
          <p className="mx-auto mt-5 max-w-md text-lead text-ink/70">
            Free while it's in beta. All you need is Chrome and a laptop camera.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="try/" className="btn-accent h-12 px-6 text-base">
              Try wobbl free
            </a>
            <a href="#waitlist" className="btn h-12 bg-white/70 px-6 text-base text-ink backdrop-blur hover:bg-white">
              Join the waitlist
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
