// Title bar for the Mac-style windows that frame every product surface.
export default function WindowBar({ title, children }) {
  return (
    <div className="window-bar">
      <div className="flex shrink-0 items-center gap-2" aria-hidden="true">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" />
      </div>
      {title && <p className="truncate text-[13px] font-medium text-muted">{title}</p>}
      {children && <div className="ml-auto flex items-center gap-2">{children}</div>}
    </div>
  );
}
