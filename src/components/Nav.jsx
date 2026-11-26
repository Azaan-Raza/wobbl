import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';

const LINKS = [
  ['How it works', '#how-it-works'],
  ['Products', '#products'],
  ['FAQ', '#faq'],
];

// A floating pill. Over the hero it's glass on the painted sky; once you
// scroll it turns white.
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4">
      <nav
        className={`mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 rounded-full pl-4 pr-2 transition-all duration-300 sm:pl-5 ${
          scrolled ? 'bg-white/90 shadow-lift ring-1 ring-black/5 backdrop-blur-xl' : 'glass'
        }`}
      >
        <a href="#top" aria-label="wobbl, back to top">
          <Logo size={24} tone={scrolled ? 'ink' : 'white'} />
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className={`text-[14px] transition-colors ${scrolled ? 'text-muted hover:text-ink' : 'text-white/80 hover:text-white'}`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#waitlist"
            className={`hidden rounded-full px-3 py-2 text-[14px] transition-colors sm:inline ${
              scrolled ? 'text-muted hover:text-ink' : 'text-white/80 hover:text-white'
            }`}
          >
            Join the waitlist
          </a>
          <a href="try/" className={scrolled ? 'btn-primary btn-sm' : 'btn btn-sm bg-white text-ink hover:bg-white/90'}>
            Try wobbl
          </a>
        </div>
      </nav>
    </header>
  );
}
