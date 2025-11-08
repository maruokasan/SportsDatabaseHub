import React from 'react';
import { HeartPulse, Smile } from 'lucide-react';
import ChartCard from '../ui/ChartCard';

const severityScale = (count) => {
  if (count >= 6) return { label: 'High risk', className: 'bg-danger/15 text-danger border border-danger/40' };
  if (count >= 3) return { label: 'Monitor', className: 'bg-warning/15 text-warning border border-warning/40' };
  return { label: 'Stable', className: 'bg-success/15 text-success border border-success/40' };
};

const injurySeverityStyles = {
  high: 'bg-danger/15 text-danger',
  medium: 'bg-warning/20 text-warning',
  low: 'bg-success/20 text-success'
};

export default function InjuryBurdenList({ data = [], isLoading = false, isError = false }) {
  if (isLoading) {
    return (
      <ChartCard title="Injury Burden" subtitle="Active injuries by team">
        <div className="flex h-40 items-center justify-center text-sm text-text-muted">Loading injury burden…</div>
      </ChartCard>
    );
  }

  if (isError) {
    return (
      <ChartCard title="Injury Burden" subtitle="Active injuries by team">
        <div className="flex h-40 items-center justify-center text-sm text-red-500">Failed to load injury burden.</div>
      </ChartCard>
    );
  }

  if (!data || !data.length) {
    return (
      <ChartCard title="Injury Burden" subtitle="Active injuries by team">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-shell-base/40 px-4 py-8 text-center text-sm text-text-muted">
          <Smile size={36} className="text-success" aria-hidden="true" />
          <div>
            <p className="font-semibold text-text-primary">Great news! All players are fit.</p>
            <p>We&apos;ll surface rehab updates here when clubs report them.</p>
          </div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Injury Burden" subtitle="Active injuries by team">
      <div className="space-y-3">
        {data.map((row) => {
          const count = Number(row.activeInjuries ?? row.active_injuries ?? 0);
          const severity = severityScale(count);
          const injuries = Array.isArray(row.injuries) ? row.injuries : [];
          return (
            <article
              key={`injury-${row.teamId ?? row.teamName}`}
              className="rounded-2xl border border-shell-border/70 bg-shell-base/40 p-4 transition hover:border-accent/40"
            >
              <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Team</p>
                  <h4 className="text-lg font-semibold text-text-primary">{row.teamName ?? 'Unknown'}</h4>
                  <p className="text-sm text-text-muted">{count} active injuries</p>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${severity.className}`}>
                  <HeartPulse size={16} aria-hidden="true" />
                  {severity.label}
                </span>
              </header>
              {injuries.length ? (
                <ul className="space-y-2 text-sm">
                  {injuries.slice(0, 3).map((injury, injuryIndex) => (
                    <li
                      key={`${row.teamId ?? row.teamName}-${injury.playerId ?? injury.playerName ?? injuryIndex}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-shell-border/60 bg-shell-surface px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-text-primary">{injury.playerName ?? 'Player TBD'}</p>
                        <p className="text-xs text-text-muted">
                          {injury.type ?? 'Undisclosed'} · Return {injury.expectedReturn ?? 'TBD'}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${
                          injurySeverityStyles[injury.severity] ?? injurySeverityStyles.medium
                        }`}
                      >
                        {(injury.severity ?? 'med').toUpperCase()}
                      </span>
                    </li>
                  ))}
                  {injuries.length > 3 ? (
                    <li className="text-xs text-text-muted">
                      +{injuries.length - 3} additional rehab update{injuries.length - 3 > 1 ? 's' : ''}
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">Player-level details sync as soon as clubs publish medical reports.</p>
              )}
            </article>
          );
        })}
      </div>
    </ChartCard>
  );
}
