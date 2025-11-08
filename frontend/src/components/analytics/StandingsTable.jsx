import React from 'react';
import ChartCard from '../ui/ChartCard';

const formatInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const badgePalette = [
  'bg-accent/15 text-accent',
  'bg-info/15 text-info',
  'bg-success/15 text-success',
  'bg-warning/15 text-warning'
];

export default function StandingsTable({ data = [], isLoading = false, isError = false }) {
  if (isLoading) {
    return (
      <ChartCard title="Standings" subtitle="League table">
        <div className="flex h-40 items-center justify-center text-sm text-text-muted">Loading standings…</div>
      </ChartCard>
    );
  }

  if (isError) {
    return (
      <ChartCard title="Standings" subtitle="League table">
        <div className="flex h-40 items-center justify-center text-sm text-red-500">Failed to load standings.</div>
      </ChartCard>
    );
  }

  if (!data || !data.length) {
    return (
      <ChartCard title="Standings" subtitle="League table">
        <div className="flex h-40 items-center justify-center text-sm text-text-muted">No standings available.</div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Standings" subtitle="League table">
      <div className="overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="border-b border-shell-border/80 text-xs uppercase tracking-[0.2em] text-text-muted">
              <th className="px-3 py-2 text-left">Pos</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-right">P</th>
              <th className="px-3 py-2 text-right">W</th>
              <th className="px-3 py-2 text-right">D</th>
              <th className="px-3 py-2 text-right">L</th>
              <th className="hidden px-3 py-2 text-right sm:table-cell">GD</th>
              <th className="px-3 py-2 text-right">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-shell-border/40">
            {data.map((row, idx) => {
              const goalDiff = Number(row.goalsFor ?? 0) - Number(row.goalsAgainst ?? 0);
              const badgeTone = badgePalette[idx % badgePalette.length];
              return (
                <tr
                  key={`standing-${row.teamId ?? idx}`}
                  className={`transition hover:bg-shell-base/40 ${idx % 2 === 0 ? 'bg-shell-base/20' : 'bg-transparent'}`}
                >
                  <td className="px-3 py-3 font-semibold text-text-muted">#{idx + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${badgeTone}`}>
                        {formatInitials(row.teamName) || '—'}
                      </span>
                      <div>
                        <p className={`font-semibold ${idx === 0 ? 'text-text-primary' : ''}`}>{row.teamName ?? 'Unknown club'}</p>
                        <p className="text-xs text-text-muted sm:hidden">GD {goalDiff}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-mono">{row.played}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-mono">{row.wins}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-mono">{row.draws}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-mono">{row.losses}</td>
                  <td className="hidden px-3 py-3 text-right tabular-nums font-mono sm:table-cell">{goalDiff}</td>
                  <td className={`px-3 py-3 text-right tabular-nums font-semibold ${idx === 0 ? 'text-accent' : ''}`}>{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
