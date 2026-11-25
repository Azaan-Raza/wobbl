import { useEffect, useState } from 'react';
import Wobbl from './Wobbl.jsx';

const LINKS = [
  { label: 'products', href: '#products' },
  { label: 'how it works', href: '#how-it-works' },
  { label: 'faq', href: '#faq' },
];

// Fixed top bar. Transparent over the hero, then a soft blurred paper
// background once the page scrolls.
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled ? 'border-b border-hairline bg-paper/85 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-page items-center justify-between px-5 py-3 sm:px-8">
        <a href="#top" className="flex items-center gap-1.5 text-[22px] font-bold tracking-[-0.05em]">
          <Wobbl size={28} head />
          wobbl
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>

        <a href="try/" className="pill-dark px-5 py-2 text-sm">
          try wobbl
        </a>
      </nav>
    </header>
  );
}
