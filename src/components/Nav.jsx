import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';

const LINKS = [
  ['Products', '#products'],
  ['How it works', '#how-it-works'],
  ['Under the hood', '#under-the-hood'],
  ['FAQ', '#faq'],
];

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
      className={`fixed inset-x-0 top-0 z-50 border-b bg-white transition-colors duration-200 ${
        scrolled ? 'border-rule' : 'border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[calc(75rem+4rem)] items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" aria-label="wobbl, back to top">
          <Logo size={24} />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="text-[15px] text-muted transition-colors hover:text-ink">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <a href="#waitlist" className="hidden text-[15px] text-muted transition-colors hover:text-ink sm:inline">
            Join the waitlist
          </a>
          <a href="try/" className="btn-primary btn-sm">
            Try wobbl
          </a>
        </div>
      </nav>
    </header>
  );
}
