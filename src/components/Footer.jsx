import Wobbl from './Wobbl.jsx';

const LINKS = [
  { label: 'products', href: '#products' },
  { label: 'how it works', href: '#how-it-works' },
  { label: 'try wobbl', href: 'try/' },
  { label: 'waitlist', href: '#waitlist' },
  { label: 'faq', href: '#faq' },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline px-5 pb-12 pt-16 sm:px-8">
      <div className="mx-auto flex max-w-page flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <a href="#top" className="flex items-end gap-3">
          <Wobbl size={64} />
          <span>
            <span className="block text-6xl font-bold leading-none tracking-[-0.06em]">wobbl</span>
            <span className="mt-2 block text-[15px] text-muted">for athletes, by an athlete.</span>
          </span>
        </a>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-12 max-w-page text-[13px] text-muted">© 2026 wobbl</p>
    </footer>
  );
}
