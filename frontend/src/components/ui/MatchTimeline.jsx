// src/components/ui/MatchTimeline.jsx
import { useRef, useState } from 'react';
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
  const dragState = useRef({ isDragging: false, startX: 0, scrollStart: 0 });
  const [activeEvent, setActiveEvent] = useState(null);
  const hasEvents = Boolean(events.length);

  const scrollTrack = (direction) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: direction * 220, behavior: 'smooth' });
  };

  const beginDrag = (clientX) => {
    if (!trackRef.current) return;
    dragState.current = { isDragging: true, startX: clientX, scrollStart: trackRef.current.scrollLeft };
    trackRef.current.classList.add('cursor-grabbing');
  };

  const endDrag = () => {
    if (!trackRef.current) return;
    dragState.current.isDragging = false;
    trackRef.current.classList.remove('cursor-grabbing');
  };

  const onPointerDown = (event) => {
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    beginDrag(clientX);
  };

  const onPointerMove = (event) => {
    if (!dragState.current.isDragging || !trackRef.current) return;
    if (event.cancelable) event.preventDefault();
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const delta = clientX - dragState.current.startX;
    trackRef.current.scrollLeft = dragState.current.scrollStart - delta;
  };

  const eventIcons = {
    goal: '⚽️',
    card: '🟨',
    sub: '🔁',
    default: '•'
  };

  return (
    <section className="rounded-panel border border-shell-border bg-shell-surface/90 p-5 shadow-panel">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Match Timeline</p>
          <h3 className="font-display text-lg text-text-primary">Key events</h3>
          <p className="text-xs text-text-muted">Drag the bar or step through with arrows.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-shell-border p-1.5 text-text-muted transition hover:border-accent hover:text-white"
            onClick={() => scrollTrack(-1)}
            aria-label="Scroll timeline left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-shell-border p-1.5 text-text-muted transition hover:border-accent hover:text-white"
            onClick={() => scrollTrack(1)}
            aria-label="Scroll timeline right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-shell-surface via-shell-surface/40 to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-shell-surface via-shell-surface/40 to-transparent" aria-hidden="true" />
        <div className="absolute left-0 top-1/2 hidden h-px w-full -translate-y-1/2 bg-shell-border/60 lg:block" aria-hidden="true" />
        <ol
          ref={trackRef}
          className="relative flex snap-x snap-mandatory gap-6 overflow-x-auto border-t border-shell-border/80 py-6 cursor-grab"
          role="list"
          aria-label="Match events timeline"
          onMouseDown={onPointerDown}
          onMouseLeave={endDrag}
          onMouseUp={endDrag}
          onMouseMove={onPointerMove}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={endDrag}
        >
          {hasEvents ? (
            events.map((event, index) => {
              const style = badgeStyles[event.type] ?? badgeStyles.default;
              const Icon = iconMap[event.type] ?? iconMap.default;
              const symbol = eventIcons[event.type] ?? eventIcons.default;
              const teamColor = event.team === 'home' ? 'var(--team-home)' : 'var(--team-away)';
              const detail = event.detail ?? (event.player ? `${event.player} involved in the play.` : 'Awaiting lineup confirmation.');
              return (
                <li
                  key={`${event.minute}-${event.description}-${index}`}
                  className="group flex min-w-[180px] snap-start flex-col items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-center transition hover:border-accent/30"
                >
                  <button
                    type="button"
                    className="flex w-full flex-col items-center gap-2 rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    onClick={() => setActiveEvent((prev) => (prev === index ? null : index))}
                    aria-expanded={activeEvent === index}
                  >
                    <span className="text-sm font-black uppercase tracking-wide" style={{ color: teamColor }}>
                      {event.minute}&rsquo;
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}
                      title={event.description}
                      aria-label={`${event.type} at minute ${event.minute}`}
                    >
                      <Icon size={14} aria-hidden="true" />
                      {event.type}
                      <span aria-hidden="true" className="text-lg leading-none">
                        {symbol}
                      </span>
                    </span>
                    <p className="max-w-[200px] text-sm text-text-primary">{event.description}</p>
                    <p className="text-xs font-medium" style={{ color: teamColor }}>
                      {event.player ?? event.team}
                    </p>
                  </button>
                  <div
                    className={`w-full overflow-hidden text-left text-xs text-text-muted transition-all duration-300 ${
                      activeEvent === index ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="font-semibold text-text-primary">Detail</p>
                    <p>{detail}</p>
                  </div>
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
