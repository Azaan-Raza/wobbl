import HeroScenes from './HeroScenes.jsx';
import Wobbl from './Wobbl.jsx';

export default function Hero() {
  return (
    <section id="top" className="px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-4xl text-center">
        <Wobbl size={120} wave className="mx-auto" title="wobbl, waving hello" />
        <h1 className="mt-5 text-hero font-semibold [text-wrap:balance]">
          wobbl catches the wobble in your form.
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lead text-muted [text-wrap:pretty]">
          Then it tells you what to fix, out loud, while you're still moving. It runs in your
          browser, measures your joints on every frame, and coaches lifting, basketball, Tae Kwon
          Do, piano, guitar and how you sit.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="try/" className="pill-dark w-full sm:w-auto">
            try wobbl
          </a>
          <a href="#waitlist" className="pill-outline w-full sm:w-auto">
            join the waitlist
          </a>
        </div>
        <p className="mt-4 text-[13px] text-muted">
          Free while it's in beta. Works best in Chrome on a laptop.
        </p>
      </div>

      <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
        <Note className="-left-[196px] top-[42%] -rotate-6" arrow="right">
          red ring = the joint to fix
        </Note>
        <Note className="-right-[188px] top-10 rotate-3" arrow="left">
          and it says this out loud
        </Note>
        <HeroScenes />
      </div>
    </section>
  );
}

// Handwritten note with a hand-drawn arrow, only on screens wide enough to
// fit it beside the window.
function Note({ children, className, arrow }) {
  const toRight = arrow === 'right';
  return (
    <div className={`pointer-events-none absolute hidden w-[170px] min-[1420px]:block ${className}`} aria-hidden="true">
      <p className={`font-hand text-[26px] font-bold leading-[1.05] text-ink ${toRight ? 'text-left' : 'text-right'}`}>
        {children}
      </p>
      <svg
        viewBox="0 0 120 60"
        className={`mt-1 h-[52px] w-[110px] ${toRight ? 'ml-10' : 'ml-auto mr-10 -scale-x-100'}`}
        fill="none"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M6 8 C 30 40, 70 52, 108 40" />
        <path d="M96 30 L108 40 L94 48" />
      </svg>
    </div>
  );
}
