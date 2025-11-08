// src/components/ui/MatchTimeline.jsx
import { useRef } from 'react';
import { Trophy, RefreshCw, Dot, Flag, ChevronLeft, ChevronRight } from 'lucide-react';

const badgeStyles = {
  goal: 'bg-success/20 text-success',
  card: 'bg-warning/20 text-warning',
  sub: 'bg-info/20 text-info',
  default: 'bg-shell-raised text-text-primary'
};

const iconMap = {
  goal: Trophy,
  card: Flag,
  sub: RefreshCw,
  default: Dot
};

export default function MatchTimeline({ events = [] }) {
  const trackRef = useRef(null);
  const hasEvents = Boolean(events.length);

  const scrollTrack = (direction) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: direction * 220, behavior: 'smooth' });
  };

  return (
    <section className="rounded-panel border border-shell-border bg-shell-surface/90 p-5 shadow-panel">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Match Timeline</p>
          <h3 className="font-display text-lg text-text-primary">Key events</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Drag or use arrows</span>
          <div className="hidden gap-1 sm:flex">
            <button
              type="button"
              className="rounded-full border border-shell-border p-1 text-text-muted transition hover:border-accent hover:text-white"
              onClick={() => scrollTrack(-1)}
              aria-label="Scroll timeline left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="rounded-full border border-shell-border p-1 text-text-muted transition hover:border-accent hover:text-white"
              onClick={() => scrollTrack(1)}
              aria-label="Scroll timeline right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="relative">
        <div className="absolute left-0 top-1/2 hidden h-px w-full -translate-y-1/2 bg-shell-border/60 lg:block" aria-hidden="true" />
        <ol
          ref={trackRef}
          className="relative flex snap-x snap-mandatory gap-6 overflow-x-auto border-t border-shell-border/80 py-6"
          role="list"
          aria-label="Match events timeline"
        >
          {hasEvents ? (
            events.map((event, index) => {
              const style = badgeStyles[event.type] ?? badgeStyles.default;
              const Icon = iconMap[event.type] ?? iconMap.default;
              return (
                <li
                  key={`${event.minute}-${event.description}-${index}`}
                  className="group flex min-w-[160px] snap-start flex-col items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-center transition hover:border-accent/30"
                >
                  <span className="text-xs font-semibold text-text-muted">{event.minute}&rsquo;</span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}
                    title={event.description}
                    aria-label={`${event.type} minute ${event.minute}`}
                  >
                    <Icon size={14} aria-hidden="true" />
                    {event.type}
                  </span>
                  <p className="max-w-[180px] text-sm text-text-primary">{event.description}</p>
                  <p
                    className="text-xs font-medium"
                    style={{ color: event.team === 'home' ? 'var(--team-home)' : 'var(--team-away)' }}
                  >
                    {event.player ?? event.team}
                  </p>
                </li>
              );
            })
          ) : (
            <li className="text-sm text-text-muted">No events yet. Follow the match to see updates.</li>
          )}
        </ol>
      </div>
    </section>
  );
}
