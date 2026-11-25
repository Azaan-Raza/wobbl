const LINKS = [
  { label: 'Products', href: '#products' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Open the app', href: '/try/' },
  { label: 'Waitlist', href: '#waitlist' },
  { label: 'FAQ', href: '#faq' },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline px-5 pb-12 pt-16 sm:px-8">
      <div className="mx-auto flex max-w-page flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <a href="#top" className="text-3xl font-semibold tracking-tight">
            acuity kinetic
          </a>
          <p className="mt-2 text-[15px] text-muted">For athletes, by an athlete.</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-12 max-w-page text-[13px] text-muted">© 2026 Acuity Kinetic</p>
    </footer>
  );
}
