import Landscape from './Landscape.jsx';
import LiveDemo from './LiveDemo.jsx';

export default function Hero() {
  return (
    <section id="top" className="relative px-4 pt-32 sm:px-8 sm:pt-40">
      {/* the painted backdrop stops partway down the product window */}
      <div className="absolute inset-x-0 top-0 h-[calc(100%-7rem)] overflow-hidden sm:h-[calc(100%-12rem)]">
        <Landscape palette="dusk" seed={11} horizon={0.6} sun={[0.74, 0.56]} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1030]/45 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto max-w-page text-center">
        <a href="#how-it-works" className="glass eyebrow-pill text-white/90 transition-colors hover:bg-white/20">
          <span className="rounded-full bg-white px-2 py-0.5 text-[12px] font-medium text-ink">New</span>
          Rep replay and fatigue alerts
        </a>
        <h1 className="display mx-auto mt-6 max-w-4xl text-hero text-white [text-wrap:balance]">
          The form coach that watches every rep.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lead text-white/85 [text-wrap:pretty]">
          wobbl tracks your joints through your laptop camera and tells you out loud what to fix
          before your next rep. Lifting, basketball, Tae Kwon Do, piano, guitar, and sitting at a desk.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="try/" className="btn-accent h-12 px-6 text-base">
            Try it free in Chrome
          </a>
          <a href="#waitlist" className="btn-glass h-12 px-6 text-base">
            Join the waitlist
          </a>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl text-left sm:mt-20">
          <LiveDemo />
          <p className="mt-4 text-center text-[13px] text-muted">
            Not a video. This is the real wobbl engine coaching a simulated set of squats, live in your browser.
          </p>
        </div>
      </div>
    </section>
  );
}
