// src/components/ui/StatTile.jsx
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

const Sparkline = ({ data = [] }) => {
  if (!data?.length) return <div className="h-10 w-full rounded-full bg-shell-raised/60" />;

  const numericSeries = data
    .map((value) => {
      const number = Number(value);
      return Number.isFinite(number) ? number : null;
    })
    .filter((value) => value !== null);

  if (!numericSeries.length) {
    return <div className="h-10 w-full rounded-full bg-shell-raised/60" />;
  }

  const series = numericSeries.length > 1 ? numericSeries : [numericSeries[0], numericSeries[0]];

  const width = 120;
  const height = 40;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const points = series
    .map((value, index) => {
      const x = (index / Math.max(series.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="text-accent">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {series.map((value, index) => {
        const x = (index / Math.max(series.length - 1, 1)) * width;
        const y = height - ((value - min) / range) * height;
        return <circle key={index} cx={x} cy={y} r="2" fill="currentColor" opacity={index === series.length - 1 ? 1 : 0} />;
      })}
    </svg>
  );
};

export default function StatTile({ title, value, subtitle, delta, deltaDirection = 'up', definition, sparkline, timestamp }) {
  const DeltaIcon = deltaDirection === 'down' ? ArrowDownRight : ArrowUpRight;
  const deltaColor = deltaDirection === 'down' ? 'text-danger' : 'text-success';

  return (
    <article className="group flex flex-col gap-4 rounded-panel border border-shell-border bg-shell-surface/90 p-5 transition hover:border-accent/60 hover:bg-shell-surface">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{title}</p>
          <p className="font-display text-3xl leading-tight">{value}</p>
        </div>
        {definition ? (
          <span
            className="text-text-muted transition group-hover:text-text-primary"
            aria-label={`About ${title}`}
            data-tooltip={definition}
          >
            <Info size={18} />
          </span>
        ) : null}
      </header>

      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>{subtitle}</span>
        {timestamp ? <span className="text-xs">Updated {timestamp}</span> : null}
      </div>

      <div className="flex items-end justify-between gap-3">
        {delta ? (
          <div className={`${deltaColor} flex items-center gap-1 text-sm font-semibold`}>
            <DeltaIcon size={16} />
            {delta}
          </div>
        ) : (
          <div className="text-sm text-text-muted">—</div>
        )}
        <Sparkline data={sparkline} />
      </div>
    </article>
  );
}
