import { useEffect, useState } from 'react';

export default function DrillPicker({ products, current, onPick, locked }) {
  // Phones get product tabs and drill chips; wider screens get the full list.
  const [open, setOpen] = useState(current.product);
  useEffect(() => setOpen(current.product), [current.product]);
  const openProduct = products.find((p) => p.id === open) || products[0];

  return (
    <nav aria-label="Drills" className="border-b border-rule bg-white lg:min-h-[calc(100vh-3.5rem)] lg:border-b-0 lg:border-r">
      <div className="px-4 py-4 lg:hidden">
        <div className="segmented" role="tablist" aria-label="Products">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={p.id === open}
              disabled={locked}
              onClick={() => setOpen(p.id)}
              className="flex-1 capitalize disabled:opacity-40"
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {openProduct.drills.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={locked && d.id !== current.id}
              onClick={() => onPick(d)}
              aria-current={d.id === current.id ? 'page' : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:opacity-40 ${
                d.id === current.id ? 'border-ink bg-ink text-white' : 'border-rule bg-white hover:border-ink/40'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden space-y-8 py-6 lg:block">
        {products.map((p) => (
          <section key={p.id}>
            <div className="flex items-baseline justify-between gap-2 px-5">
              <h2 className="display text-[19px] capitalize">{p.name}</h2>
              <span className="text-xs text-muted">{p.status}</span>
            </div>
            <ul className="mt-2 space-y-0.5 px-2">
              {p.drills.map((d) => {
                const active = d.id === current.id;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      disabled={locked && !active}
                      onClick={() => onPick(d)}
                      aria-current={active ? 'page' : undefined}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        active ? 'bg-cobalt-wash' : 'hover:bg-mist'
                      }`}
                    >
                      <span className="block text-[15px] font-medium">{d.name}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-muted">{d.blurb}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
