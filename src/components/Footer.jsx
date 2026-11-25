import Logo from './Logo.jsx';

const LINKS = [
  ['Products', '#products'],
  ['How it works', '#how-it-works'],
  ['Under the hood', '#under-the-hood'],
  ['Try wobbl', 'try/'],
  ['Waitlist', '#waitlist'],
  ['FAQ', '#faq'],
];

export default function Footer() {
  return (
    <footer className="border-t border-rule px-5 pb-10 pt-14 sm:px-8">
      <div className="mx-auto flex max-w-page flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div>
          <a href="#top" aria-label="wobbl, back to top">
            <Logo size={28} />
          </a>
          <p className="mt-3 text-[15px] text-muted">For athletes, by an athlete.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-[15px] sm:grid-cols-3">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="text-muted transition-colors hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-14 max-w-page text-[13px] text-muted">© 2026 wobbl</p>
    </footer>
  );
}
