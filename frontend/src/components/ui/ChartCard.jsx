// src/components/ui/ChartCard.jsx
import { Download, MoreHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function ChartCard({ title, subtitle, meta, legend = [], onExport, children }) {
  const cardRef = useRef(null);
  
  // DEBUG: Log ChartCard rendering and dimensions
  if (import.meta.env.DEV) {
    console.log('DEBUG: ChartCard', {
      title,
      subtitle,
      meta,
      legendLength: legend.length,
      childrenType: typeof children,
      children: children?.type?.name || children?.type || 'Unknown'
    });
  }
  
  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      if (import.meta.env.DEV) {
        console.log('DEBUG: ChartCard Dimensions', {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          isVisible: rect.top < window.innerHeight && rect.bottom > 0
        });
      }
    }
  }, [children]);
  
  return (
    <section ref={cardRef} className="flex h-full flex-col rounded-panel border border-shell-border bg-shell-surface p-5 shadow-panel">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{subtitle}</p>
          <h3 className="font-display text-xl">{title}</h3>
          {meta ? <p className="text-sm text-text-muted">{meta}</p> : null}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onExport}
            disabled={!onExport}
            title="Download this data set"
            className="inline-flex items-center gap-1 rounded-full border border-shell-border px-3 py-1.5 text-xs text-text-muted transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60 disabled:cursor-not-allowed disabled:opacity-50"
            aria-disabled={!onExport}
          >
            <Download size={14} />
            Export
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-shell-border px-3 py-1.5 text-xs text-text-muted transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
            aria-haspopup="menu"
            title="More options"
          >
            <MoreHorizontal size={16} />
            More
          </button>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-text-muted">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className={`h-2 w-8 rounded-full`}
              style={{
                background: item.type === 'dashed' ? 'transparent' : item.color ?? 'var(--team-home)',
                borderWidth: item.type === 'dashed' ? '2px' : 0,
                borderColor: item.color ?? 'var(--team-home)',
                borderStyle: item.type === 'dashed' ? 'dashed' : 'solid'
              }}
            />
            {item.badge ? (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-shell-raised text-xs font-semibold uppercase text-text-primary">
                {item.badge}
              </span>
            ) : null}
            <span className="font-medium text-text-primary">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="min-h-[220px] flex-1">{children}</div>
    </section>
  );
}
