// src/components/ui/FilterBar.jsx
import { useRef } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

export default function FilterBar({ filters = [], activeFilters = [], onClear }) {
  const firstFilterRef = useRef(null);

  const handleAdjustClick = () => {
    if (firstFilterRef.current) {
      firstFilterRef.current.focus();
      firstFilterRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  };

  const hasActive = Boolean(activeFilters.length);

  return (
    <section className="rounded-panel border border-shell-border bg-shell-surface/90 p-4 shadow-panel" role="region" aria-label="Dashboard filters">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">
          <SlidersHorizontal size={18} className="text-text-primary" aria-hidden="true" />
          <span>Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAdjustClick}
            className="inline-flex items-center gap-2 rounded-full border border-shell-border/70 bg-shell-raised px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-white"
            aria-label="Adjust dashboard filters"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Adjust filters
          </button>
          {hasActive ? (
            <button type="button" onClick={onClear} className="text-sm font-medium text-info underline-offset-4 hover:underline">
              Clear all
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="flex flex-1 flex-wrap gap-4">
          {filters.map((filter, index) => (
            <label
              key={filter.id}
              className="flex min-w-[180px] flex-col gap-2 text-[11px] font-medium uppercase tracking-wide text-text-muted"
            >
              {filter.label}
              <div className="flex items-center gap-2 rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/50">
                {filter.icon ? <filter.icon size={16} className="text-text-muted" aria-hidden="true" /> : null}
                <select
                  ref={index === 0 ? firstFilterRef : undefined}
                  value={filter.value ?? ''}
                  onChange={(event) => filter.onChange?.(event.target.value)}
                  aria-label={filter.label}
                  className="w-full bg-transparent text-sm text-text-primary focus-visible:outline-none"
                >
                  {filter.options?.map((option) => (
                    <option key={option.value ?? option} value={option.value ?? option}>
                      {option.label ?? option}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          {activeFilters.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => chip.onRemove?.(chip.id)}
              className="inline-flex items-center gap-2 rounded-full border border-shell-border/70 bg-shell-raised/80 px-3 py-1.5 text-xs text-text-muted transition hover:border-accent hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              aria-label={`Remove filter ${chip.label}`}
            >
              {chip.label}
              <X size={14} aria-hidden="true" />
            </button>
          ))}

          {!hasActive ? <p className="text-xs text-text-muted">No filters applied</p> : null}
        </div>
      </div>
    </section>
  );
}
